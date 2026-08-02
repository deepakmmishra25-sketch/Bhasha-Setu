#!/usr/bin/env bash
# BhashaSetu AI — Local Development Setup

set -euo pipefail

echo "🚀 Setting up BhashaSetu AI..."

# ─── Backend ──────────────────────────────────────────────────────────
echo "📦 Installing backend dependencies..."
cd backend
cp -n .env.example .env || true
pip install -r requirements.txt
cd ..

# ─── Frontend ─────────────────────────────────────────────────────────
echo "📦 Installing frontend dependencies..."
cd frontend
cp -n .env.local.example .env.local || true
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit backend/.env with your credentials"
echo "  2. Edit frontend/.env.local with your API URL"
echo "  3. Run: docker-compose -f docker/docker-compose.yml up -d postgres redis"
echo "  4. Run backend: cd backend && make dev"
echo "  5. Run frontend: cd frontend && npm run dev"
