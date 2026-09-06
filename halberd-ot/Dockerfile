# HALBERD: Happened-Before Analytics & Logic Baseline for Edge Response & Defense
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080 5020

ENV PYTHONUNBUFFERED=1

CMD ["python", "-m", "seal.cli", "start", "--host", "0.0.0.0", "--port", "8080"]

