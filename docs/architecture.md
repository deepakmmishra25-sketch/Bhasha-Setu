# BhashaSetu AI — Architecture

## Overview

BhashaSetu AI is a multilingual AI platform for rural entrepreneurs, farmers, MSMEs, students, women entrepreneurs, and small businesses in India.

## Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 15, React 19, TypeScript    |
| Styling     | TailwindCSS, shadcn/ui              |
| State       | Zustand, TanStack Query             |
| Backend     | FastAPI (Python 3.11)               |
| ORM         | Prisma (prisma-client-py)           |
| Database    | PostgreSQL 16                       |
| Cache       | Redis 7                             |
| Task Queue  | Celery                              |
| AI          | Google Gemini 2.0 Flash             |
| Auth        | JWT + Refresh Tokens                |
| Deployment  | Railway (backend), Vercel (frontend)|

## Services

```
┌─────────────────────────────────────────────────────┐
│                   User Browser                        │
└───────────────────┬─────────────────────────────────┘
                    │ HTTPS
┌───────────────────▼─────────────────────────────────┐
│           Next.js 15 Frontend (Vercel)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ TanStack │ │ Zustand  │ │  shadcn/ui Components │ │
│  │  Query   │ │  Store   │ │                       │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
└───────────────────┬─────────────────────────────────┘
                    │ REST API / WebSocket
┌───────────────────▼─────────────────────────────────┐
│           FastAPI Backend (Railway)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │  Auth    │ │  AI Chat │ │  Schemes / Lessons    │ │
│  │  JWT     │ │  Gemini  │ │  OCR / Translation    │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
│  ┌──────────┐ ┌──────────┐                          │
│  │ Prisma   │ │  Redis   │                          │
│  │  ORM     │ │  Cache   │                          │
│  └──────────┘ └──────────┘                          │
└──────┬────────────────────────────────────────────┬─┘
       │                                            │
┌──────▼──────┐                         ┌───────────▼──┐
│ PostgreSQL  │                         │    Redis     │
│    (DB)     │                         │   (Cache)    │
└─────────────┘                         └──────────────┘
```

## Languages Supported

Hindi, English, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Punjabi, Bengali, Urdu, Odia, Assamese
