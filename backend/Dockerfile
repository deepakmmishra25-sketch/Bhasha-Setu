# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — dependency install (cached layer)
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS deps

WORKDIR /app

# System deps required by psycopg2-binary / Pillow / pytesseract
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    tesseract-ocr \
    tesseract-ocr-hin \
    tesseract-ocr-tam \
    tesseract-ocr-tel \
    tesseract-ocr-kan \
    tesseract-ocr-mal \
    tesseract-ocr-guj \
    tesseract-ocr-mar \
    tesseract-ocr-ben \
    tesseract-ocr-pan \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — production image
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS production

WORKDIR /app

# Copy only the installed packages from the deps stage
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
# Tesseract binary + data
COPY --from=deps /usr/bin/tesseract /usr/bin/tesseract
COPY --from=deps /usr/share/tesseract-ocr /usr/share/tesseract-ocr
# System libs needed at runtime
COPY --from=deps /usr/lib/x86_64-linux-gnu/libpq.so* /usr/lib/x86_64-linux-gnu/

COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Non-root user for security
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/healthz')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
