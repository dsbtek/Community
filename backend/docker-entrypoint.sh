#!/bin/bash
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
while ! mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" --silent; do
    sleep 2
done

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

exec "$@"