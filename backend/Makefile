.PHONY: dev install lint test format migrate

dev:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

install:
	pip install -r requirements.txt

lint:
	ruff check app/
	mypy app/

format:
	ruff format app/

test:
	pytest tests/ -v --asyncio-mode=auto

migrate:
	prisma db push

generate:
	prisma generate
