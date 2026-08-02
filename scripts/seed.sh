#!/usr/bin/env bash
# BhashaSetu AI — Database Seed Script (added in Milestone 5)

set -euo pipefail

echo "🌱 Seeding database..."
cd backend
python -m app.scripts.seed
echo "✅ Database seeded."
