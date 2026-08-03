# BhashaSetu AI — Production Audit (Milestone 20)

_Last updated: 2026-08-03_

## Security Checklist

| Area | Item | Status |
|------|------|--------|
| **Headers** | X-Content-Type-Options: nosniff | ✅ |
| **Headers** | X-Frame-Options: DENY | ✅ |
| **Headers** | X-XSS-Protection: 1; mode=block | ✅ |
| **Headers** | Referrer-Policy: strict-origin-when-cross-origin | ✅ |
| **Headers** | Permissions-Policy (camera off, mic self) | ✅ |
| **Headers** | HSTS (production only) | ✅ |
| **Headers** | Server token removed | ✅ |
| **Auth** | JWT HS256 with secret from env | ✅ |
| **Auth** | Access token 30-min expiry | ✅ |
| **Auth** | Refresh token 7-day expiry | ✅ |
| **Auth** | Password hashing via bcrypt | ✅ |
| **Auth** | 401 on invalid/expired tokens | ✅ |
| **Auth** | Admin role guard on admin/analytics routes | ✅ |
| **CORS** | Explicit origin list (dev) + regex (Replit) | ✅ |
| **Rate limits** | Nginx: auth 10/min, API 60/min | ✅ |
| **Input** | Pydantic v2 validation on all request bodies | ✅ |
| **Input** | File size limit 10 MB on OCR uploads | ✅ |
| **Input** | Allowed MIME types enforced on OCR | ✅ |
| **DB** | Parameterised queries (SQLAlchemy ORM) | ✅ |
| **DB** | Async connection pooling (pool_size=10, max_overflow=20) | ✅ |
| **DB** | pool_pre_ping for stale-connection recovery | ✅ |
| **Compression** | GZip on responses ≥ 1 KB | ✅ |
| **Logging** | Structured loguru logs; no sensitive data logged | ✅ |
| **Secrets** | All secrets via env vars, never hardcoded | ✅ |
| **Docker** | Non-root appuser in container | ✅ |
| **Docker** | Multi-stage build (no dev tools in production image) | ✅ |
| **TLS** | Nginx terminates TLS; HTTP → HTTPS redirect | ✅ |

## Known TODOs (post-MVP)

| Item | Priority | Notes |
|------|----------|-------|
| Razorpay payment signature verification | High | Replace demo order with real Razorpay SDK |
| JWT token blacklisting (logout) | Medium | Add Redis-based blocklist on logout |
| Google Cloud TTS/STT credentials | Medium | Requires GOOGLE_CLOUD_CREDENTIALS env var |
| Email verification on register | Medium | Add SMTP + verification token flow |
| Content Security Policy header | Medium | Needs frontend script-src audit first |
| GEMINI_API_KEY secret | High | Required for AI features (chat, translate, OCR, scheme AI) |
| Rate limiting in FastAPI (slowapi) | Low | Nginx rate limits cover this at the edge |
| Automated security scanning (Snyk/Bandit) | Low | Add to CI pipeline |

## Performance Baseline

| Endpoint | Latency (no Gemini) | Cache TTL |
|----------|---------------------|-----------|
| `GET /api/healthz` | < 50ms | None |
| `GET /api/v1/schemes` | < 100ms | 10 min (Redis) |
| `GET /api/v1/lessons` | < 100ms | Per-user (no global cache) |
| `GET /api/v1/lessons/categories` | < 50ms | 1 hour (Redis) |
| `GET /api/v1/dashboard/summary` | < 150ms | None (user-specific) |
| `POST /api/v1/chat/send` (Gemini) | 1–5 s | N/A |
| `POST /api/v1/translate` (Gemini) | 0.5–2 s | N/A |
| `POST /api/v1/ocr/extract` (Gemini) | 1–3 s | N/A |

## Infrastructure Requirements (Production)

- **PostgreSQL 16** — min 1 GB RAM, 10 GB storage
- **Redis 7** — min 256 MB RAM (cache + session store)
- **App server** — 2 vCPU, 1 GB RAM per backend replica (2 recommended)
- **Frontend** — Next.js standalone, 512 MB RAM
- **Nginx** — reverse proxy + TLS termination
- **Certbot** — Let's Encrypt TLS certificate renewal
