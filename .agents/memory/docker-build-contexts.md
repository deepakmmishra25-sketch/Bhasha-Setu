---
name: Docker build contexts
description: Repository-specific Docker build context expectations for the backend and frontend images.
---

Build the backend image with `backend` as the Docker build context and the frontend image with `frontend` as the Docker build context. Their Dockerfiles copy files relative to those service roots.

**Why:** Building from the repository root caused misleading missing-file failures (`requirements.txt`, `package-lock.json`) even though both service Dockerfiles were valid.

**How to apply:** When auditing or changing container packaging, use `docker build -f backend/Dockerfile backend` and `docker build -f frontend/Dockerfile frontend`.