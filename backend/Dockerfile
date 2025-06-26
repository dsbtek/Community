# Use slim-buster for better compatibility
FROM python:3.9-slim-buster

WORKDIR /app

# Python settings
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PIP_NO_CACHE_DIR 1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libmariadb-dev \
    libmariadb-dev-compat \
    netcat \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Entrypoint setup
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Runtime configuration
EXPOSE 8000
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["gunicorn", "community.wsgi:application", "--bind", "0.0.0.0:8000"]