# GazaBridge — Backend

A humanitarian Django REST Framework API that connects Palestinian individuals with global volunteers offering mentorship, courses, live sessions, and curated resources.

- **Developer:** Uzair Waseem
- **Repository:** [github.com/Uzair-Waseem-390/GazaBridge](https://github.com/Uzair-Waseem-390/GazaBridge)
- **Framework:** Django + Django REST Framework
- **Auth:** JWT (SimpleJWT) with Redis-based token blacklisting
- **Database:** PostgreSQL via Supabase
- **Cache / Broker:** Redis (3 logical partitions)
- **Background Tasks:** Celery

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Structure](#2-project-structure)
3. [Clone the Repository](#3-clone-the-repository)
4. [Create & Activate a Virtual Environment](#4-create--activate-a-virtual-environment)
5. [Install Dependencies](#5-install-dependencies)
6. [Configure Environment Variables](#6-configure-environment-variables)
7. [Redis Setup](#7-redis-setup)
8. [Database Setup (Supabase)](#8-database-setup-supabase)
9. [Run Migrations](#9-run-migrations)
10. [Run the Development Server](#10-run-the-development-server)
11. [Run the Celery Worker](#11-run-the-celery-worker)
12. [API Schema](#12-api-schema)
13. [Environment Variables Reference](#13-environment-variables-reference)
14. [Redis Partition Reference](#14-redis-partition-reference)
15. [Rate Limiting](#15-rate-limiting)

---

## 1. Prerequisites

Make sure the following are installed on your machine before continuing.

| Tool | Minimum Version | Notes |
|---|---|---|
| Python | 3.11+ | [python.org](https://www.python.org/downloads/) |
| pip | latest | Comes with Python |
| Redis | 6.x+ | See [Section 7](#7-redis-setup) |
| Git | any | [git-scm.com](https://git-scm.com/) |

> **Windows users:** Redis does not have an official native Windows build. Use [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) and run Redis inside WSL, or use [Docker Desktop](https://www.docker.com/products/docker-desktop/) with a Redis container and you can download it from this repo link:

```bash
https://github.com/redis-windows/redis-windows/releases
```

Then for further instructions ask any llm to help to setup. After this you can continue the setup by following the next steps from the below instructions.

---

## 2. Project Structure

```
GazaBridge/
└── backend/
    ├── manage.py
    ├── requirements.txt
    ├── .env                  ← you create this (see Section 6)
    ├── backend/
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py
    │   └── middleware.py
    ├── users/
    ├── auth_app/
    ├── forget_password/
    ├── posts/
    ├── courses/
    ├── live_sections/
    ├── resources/
    └── admin_app/
```

---

## 3. Clone the Repository

```bash
git clone https://github.com/Uzair-Waseem-390/GazaBridge.git
cd GazaBridge/backend
```

---

## 4. Create & Activate a Virtual Environment

**Linux / macOS**

```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows (Command Prompt)**

```cmd
python -m venv venv
venv\Scripts\activate
```

**Windows (PowerShell)**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

You should see `(venv)` prepended to your terminal prompt.

---

## 5. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 6. Configure Environment Variables

The project reads all secrets and configuration from a `.env` file. This file is **not committed to the repository** — you must create it manually.

Inside the `backend/` directory (the same folder as `manage.py`), create a file named `.env`:

```bash
# Linux / macOS
touch .env

# Windows
type nul > .env
```

Then open it and fill in every value. See the full reference in [Section 13](#13-environment-variables-reference).

### Minimal `.env` for local development

```dotenv
# ── Django core ────────────────────────────────────────────────────────────
SECRET_KEY=your-very-long-random-secret-key-here
DEBUG=True

# ── Database (Supabase PostgreSQL) ─────────────────────────────────────────
ENGINE=django.db.backends.postgresql
NAME=postgres
USER=postgres.your-supabase-project-ref
PASSWORD=your-supabase-db-password
HOST=aws-1-ap-northeast-1.pooler.supabase.com
PORT=6543

# ── Email (Gmail SMTP) ─────────────────────────────────────────────────────
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password

# ── URLs ───────────────────────────────────────────────────────────────────
BACKEND_BASE_URL=http://localhost:8000
FRONTEND_BASE_URL=http://localhost:5173

# ── Google OAuth2 ──────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

> **Generating a SECRET_KEY:**
> ```bash
> python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
> ```

> **Gmail App Password:** If you have 2FA enabled on Gmail (required for App Passwords), go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) and generate a 16-character app password. Use that as `EMAIL_HOST_PASSWORD`, not your regular Gmail password.

> **Google OAuth2:** Create credentials at [console.cloud.google.com](https://console.cloud.google.com/) → APIs & Services → Credentials. Add `http://localhost:5173/auth/google/callback` to **Authorized redirect URIs**.

---

## 7. Redis Setup

Redis is used for three independent purposes in this project, each on a separate logical database partition. **All three must be available before starting the server or the Celery worker.**

### Linux

```bash
# Install
sudo apt update && sudo apt install redis-server -y

# Start
sudo systemctl start redis

# Enable on boot (optional)
sudo systemctl enable redis

# Verify Redis is running
redis-cli ping
# Expected output: PONG
```

### macOS (Homebrew)

```bash
# Install
brew install redis

# Start
brew services start redis

# Verify
redis-cli ping
# Expected output: PONG
```

### Windows (WSL 2)

Run the Linux commands above inside your WSL terminal. The Redis server started in WSL is accessible from Windows at `localhost:6379`.

### Windows (native)

if you've downloaded the redis for windows by my given link to run redis open folder where you installed redis and in that folder open terminal and run following commands:

```bash
redis-server
```
to verify that redis is running open another terminal and run following commands:

```bash
redis-cli ping
# Expected output: PONG
```


### Docker (any OS)

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
redis-cli ping
# Expected output: PONG
```

> The project connects to Redis at `localhost:6379` by default. No additional configuration is needed for local development — the three logical partitions (DB 0, 1, 2) are selected by the application automatically.

---

## 8. Database Setup (Supabase)

This project uses **Supabase** as its PostgreSQL database provider via the connection pooler.

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Navigate to **Project Settings → Database → Connection Pooling**.
3. Copy the **Host**, **Port** (6543 for pooler), **User**, and **Password**.
4. Fill in the corresponding values in your `.env` file:

```dotenv
ENGINE=django.db.backends.postgresql
NAME=postgres
USER=postgres.your-project-ref     # e.g. postgres.wqzsrxpzabfkxpyorako
PASSWORD=your-database-password
HOST=aws-1-ap-northeast-1.pooler.supabase.com
PORT=6543
```

> The port `6543` is the Supabase **connection pooler** (PgBouncer). Use `5432` only if you want a direct (non-pooled) connection.

---

## 9. Run Migrations

With the virtual environment active, Redis running, and `.env` configured:

```bash
python manage.py migrate
```

To create a superuser for the Django admin:

```bash
python manage.py createsuperuser
```

---

## 10. Run the Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

Django admin panel: `http://localhost:8000/admin/`

---

## 11. Run the Celery Worker

Celery handles background tasks such as sending verification emails and password reset emails. It must be running alongside the Django server.

Open a **second terminal**, activate the virtual environment, navigate to `backend/`, then run:

```bash
celery -A backend worker -l info
```

> **Important:** Celery uses Redis DB 0 (`redis://localhost:6379/0`) as both its message broker and result backend. Redis must be running before starting the worker.

> **Windows note:** The `solo` pool is configured in settings (`CELERY_WORKER_POOL = "solo"`), which is required for Windows compatibility. No extra flags are needed.

To verify the worker is ready you should see a line like:

```
[tasks]
  . users.tasks.send_verification_email
  . forget_password.tasks.send_reset_email
  ...

[yyyy-mm-dd hh:mm:ss] INFO/MainProcess] celery@hostname ready.
```

---

## 12. API Schema

The project uses `drf-spectacular` to auto-generate an OpenAPI 3.0 schema.

| URL | Description |
|---|---|
| `/api/docs/` | Read API Documentation |

---

## 13. Environment Variables Reference

All variables are loaded from `backend/.env` via `python-dotenv`.

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Django secret key — must be long, random, and kept private |
| `DEBUG` | ✅ | Set `True` for development, `False` for production |
| `ENGINE` | ✅ | Database backend — use `django.db.backends.postgresql` |
| `NAME` | ✅ | Database name — `postgres` for Supabase |
| `USER` | ✅ | Supabase database user (e.g. `postgres.projectref`) |
| `PASSWORD` | ✅ | Supabase database password |
| `HOST` | ✅ | Supabase pooler host |
| `PORT` | ✅ | Supabase pooler port — `6543` |
| `EMAIL_HOST_USER` | ✅ | Gmail address used to send emails |
| `EMAIL_HOST_PASSWORD` | ✅ | Gmail App Password (16-char, not your regular password) |
| `BACKEND_BASE_URL` | ✅ | Base URL of this Django server — used in email links |
| `FRONTEND_BASE_URL` | ✅ | Base URL of the React frontend — used in email links |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth2 client secret |
| `GOOGLE_REDIRECT_URI` | ✅ | Must match the redirect URI registered in Google Cloud Console |

---

## 14. Redis Partition Reference

All three partitions run on the same Redis instance (`localhost:6379`). They are isolated by logical database index.

| DB | Purpose | Used by |
|---|---|---|
| `0` | Celery broker & result backend | Celery worker, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND` |
| `1` | Django cache (paginated API responses) | `CACHES["default"]`, offer/course list views |
| `2` | Rate limiting (sliding window counters) | `GlobalRateLimitMiddleware`, `RATE_LIMIT_REDIS` |

> These partitions are completely isolated — flushing DB 2 (rate limits) will not affect cached responses in DB 1 or pending Celery tasks in DB 0.

---

## 15. Rate Limiting

A custom `GlobalRateLimitMiddleware` is applied to every request using a Redis-backed sliding window algorithm.

| Client type | Limit | Window |
|---|---|---|
| Authenticated user (by user ID) | 100 requests | 60 seconds |
| Anonymous visitor (by IP address) | 20 requests | 60 seconds |

Exceeding the limit returns `HTTP 429 Too Many Requests`.

The middleware reads the real client IP from `X-Forwarded-For` only when the request originates from a trusted proxy IP listed in `RATE_LIMIT_TRUSTED_PROXIES`. Direct requests always use `REMOTE_ADDR` to prevent IP spoofing.

---

## Quick Start Checklist

```
[ ] Python 3.11+ installed
[ ] Repository cloned
[ ] Virtual environment created and activated
[ ] pip install -r requirements.txt
[ ] backend/.env file created and fully filled in
[ ] Redis running (redis-cli ping returns PONG)
[ ] python manage.py migrate
[ ] python manage.py runserver         (terminal 1)
[ ] celery -A backend worker -l info   (terminal 2)
[ ] Visit http://localhost:8000/api/schema/ to confirm the API is live
```