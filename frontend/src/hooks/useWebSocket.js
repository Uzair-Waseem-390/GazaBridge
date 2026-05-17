// frontend/src/hooks/useWebSocket.js
import { useEffect, useRef, useCallback } from 'react';

// In development Vite proxies /ws/* → ws://localhost:8000 (see vite.config.js).
// In production, set VITE_WS_URL to the real WebSocket server, e.g. ws://api.example.com
// If VITE_WS_URL is not set we derive it from the current page origin so it always
// works behind a reverse proxy in production too.
function getWsBase() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
}

/**
 * useWebSocket — connects to a Django Channels WebSocket with JWT auth.
 *
 * The backend (ws_auth.py) reads the token from the query string:
 *   ws://localhost:8000/ws/chat/<id>/?token=<JWT>
 *
 * @param {string}  path     - WebSocket path, e.g. "/ws/chat/5/"
 * @param {object}  options
 *   enabled    {boolean}  - whether to open the connection
 *   onMessage  {Function} - called with parsed JSON data on every message
 *   onOpen     {Function} - called when connection opens
 *   onClose    {Function} - called when connection closes
 *   onError    {Function} - called on error
 */
export function useWebSocket(path, options = {}) {
  const { enabled = true, onMessage, onOpen, onClose, onError } = options;

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY_MS = 2000;

  // Keep callbacks in refs so the connect closure always uses fresh versions
  const onMessageRef = useRef(onMessage);
  const onOpenRef    = useRef(onOpen);
  const onCloseRef   = useRef(onClose);
  const onErrorRef   = useRef(onError);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const connect = useCallback(() => {
    if (!enabled || !path) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('[WS] No access token found, skipping WebSocket connection.');
      return;
    }

    // Build full URL with JWT token in query string (ws_auth.py expects ?token=)
    const url = `${getWsBase()}${path}?token=${token}`;

    console.log('[WS] Connecting to', url);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected:', path);
      reconnectAttemptsRef.current = 0;
      onOpenRef.current?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    ws.onerror = (event) => {
      console.error('[WS] Error:', event);
      onErrorRef.current?.(event);
    };

    ws.onclose = (event) => {
      console.log('[WS] Disconnected:', event.code, event.reason);
      onCloseRef.current?.(event);

      // Attempt reconnect on abnormal close (not manual)
      if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1;
        console.log(`[WS] Reconnecting in ${RECONNECT_DELAY_MS}ms (attempt ${reconnectAttemptsRef.current})`);
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };
  }, [enabled, path]);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional unmount
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
    };
  }, [connect]);

  /**
   * sendMessage — send a JSON object over the WebSocket.
   * Queues a retry once if the socket isn't OPEN yet.
   */
  const sendMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WS] Socket not open, message dropped:', data);
    }
  }, []);

  return { sendMessage, wsRef };
}
