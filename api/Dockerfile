FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ libgomp1 && \
    rm -rf /var/lib/apt/lists/*
ENV PYTHONUNBUFFERED=1 PORT=5000

WORKDIR /app
COPY api/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY api/ .

EXPOSE 5000

CMD ["sh","-c","gunicorn -w 1 --threads 4 -k gthread -b 0.0.0.0:${PORT} index:app"]