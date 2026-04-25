import time
import logging

from django.conf import settings
from django.http import JsonResponse

logger = logging.getLogger(__name__)


class RateLimitExceeded(Exception):
    """Raised internally when a client has exceeded their rate limit."""
    pass


class SlidingWindowCounter:
    """
    Sliding Window Counter algorithm using Redis directly (not Django cache).

    How it works:
    - Divides time into two fixed buckets: current window and previous window.
    - Estimates the true request count using a weighted interpolation:
        estimated = prev_bucket * (1 - elapsed_ratio) + curr_bucket
    - This smooths out the hard resets of a pure Fixed Window, closely
      approximating a true sliding window at a fraction of the memory cost.

    Memory: O(1) per client — only 2 keys per identity at any time.
    """

    def __init__(self, redis_client, limit: int, window: int):
        """
        Args:
            redis_client: A raw redis.Redis instance pointing to DB 2.
            limit:        Maximum requests allowed in the sliding window.
            window:       Window size in seconds.
        """
        self.redis = redis_client
        self.limit = limit
        self.window = window

    def _bucket_keys(self, key: str) -> tuple[str, str]:
        """Return (current_bucket_key, previous_bucket_key) for the given key."""
        now = int(time.time())
        current_slot = now // self.window
        return (
            f"{key}:{current_slot}",
            f"{key}:{current_slot - 1}",
        )

    def is_allowed(self, key: str) -> tuple[bool, int]:
        """
        Atomically check and increment the counter for the given key.

        Returns:
            (allowed: bool, current_count: int)
        """
        now = time.time()
        current_slot = int(now) // self.window
        elapsed_in_window = now - (current_slot * self.window)
        prev_weight = 1.0 - (elapsed_in_window / self.window)

        curr_key = f"{key}:{current_slot}"
        prev_key = f"{key}:{current_slot - 1}"

        pipe = self.redis.pipeline()
        try:
            # Increment current bucket atomically, then fetch previous bucket.
            pipe.incr(curr_key)
            pipe.expire(curr_key, self.window * 2)  # TTL covers two windows
            pipe.get(prev_key)
            results = pipe.execute()
        except Exception:
            logger.exception("Redis pipeline failed during rate limit check for key=%s", key)
            # Fail open: do not block the request if Redis is unavailable.
            return True, 0

        curr_count = results[0]
        prev_count = int(results[2]) if results[2] else 0

        estimated = (prev_count * prev_weight) + curr_count
        allowed = estimated <= self.limit
        return allowed, int(estimated)


def _get_redis_client():
    """
    Lazily create a Redis client pointed at the rate-limiting DB.
    Import is deferred so Django's app registry is not touched at module load.
    """
    import redis

    cfg = settings.RATE_LIMIT_REDIS
    return redis.Redis(
        host=cfg["HOST"],
        port=cfg["PORT"],
        db=cfg["DB"],
        socket_connect_timeout=cfg.get("SOCKET_CONNECT_TIMEOUT", 1),
        socket_timeout=cfg.get("SOCKET_TIMEOUT", 1),
        decode_responses=True,
    )


def _get_client_ip(request) -> str:
    """
    Resolve the real client IP, respecting X-Forwarded-For when trusted.

    X-Forwarded-For can be spoofed by clients, so we only trust it when
    the direct connection comes from a known trusted proxy defined in
    settings.RATE_LIMIT_TRUSTED_PROXIES.
    """
    trusted_proxies = getattr(settings, "RATE_LIMIT_TRUSTED_PROXIES", set())
    remote_addr = request.META.get("REMOTE_ADDR", "unknown")

    if remote_addr in trusted_proxies:
        xff = request.META.get("HTTP_X_FORWARDED_FOR", "")
        if xff:
            # Leftmost IP is the originating client.
            return xff.split(",")[0].strip()

    return remote_addr


def _build_rate_limit_key(request) -> str:
    """
    Build a namespaced Redis key scoped to the client's identity.

    Authenticated requests are keyed by user ID (stable, hard to spoof).
    Anonymous requests are keyed by IP address.
    """
    if hasattr(request, "user") and request.user.is_authenticated:
        return f"rl:user:{request.user.id}"

    ip = _get_client_ip(request)
    return f"rl:ip:{ip}"


class GlobalRateLimitMiddleware:
    """
    Global rate limiting middleware using a Sliding Window Counter.

    Configuration (in settings.py):
    ─────────────────────────────
    RATE_LIMIT = {
        "AUTHENTICATED": {"LIMIT": 100, "WINDOW": 60},
        "ANONYMOUS":     {"LIMIT": 20,  "WINDOW": 60},
    }

    RATE_LIMIT_REDIS = {
        "HOST": "localhost",
        "PORT": 6379,
        "DB": 2,
    }

    RATE_LIMIT_TRUSTED_PROXIES = {"127.0.0.1"}  # optional
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self._redis_client = None  # Lazily initialised on first request

    @property
    def redis_client(self):
        if self._redis_client is None:
            self._redis_client = _get_redis_client()
        return self._redis_client

    def _get_counter(self, request) -> SlidingWindowCounter:
        """Return a SlidingWindowCounter configured for this request's user type."""
        cfg = settings.RATE_LIMIT
        if hasattr(request, "user") and request.user.is_authenticated:
            tier = cfg["AUTHENTICATED"]
        else:
            tier = cfg["ANONYMOUS"]
        return SlidingWindowCounter(self.redis_client, tier["LIMIT"], tier["WINDOW"])

    def __call__(self, request):
        try:
            counter = self._get_counter(request)
            key = _build_rate_limit_key(request)
            allowed, _ = counter.is_allowed(key)

            if not allowed:
                return JsonResponse({"detail": "Too many requests."}, status=429)

        except Exception:
            # Never let rate limiting crash the application.
            logger.exception("Unexpected error in GlobalRateLimitMiddleware")

        return self.get_response(request)