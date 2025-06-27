# #!/bin/bash
# set -e

# # Wait for MySQL using Python (no mysqladmin needed)
# echo "Waiting for MySQL..."
# while ! python -c "
# import socket
# import time
# import os
# from django.db import connections
# from django.db.utils import OperationalError

# db_host = os.getenv('DB_HOST', 'db')
# max_retries = 30
# retry_delay = 2

# for _ in range(max_retries):
#     try:
#         conn = connections['default']
#         conn.ensure_connection()
#         if conn.is_usable():
#             exit(0)
#     except OperationalError:
#         time.sleep(retry_delay)
# exit(1)
# "; do
#     sleep 2
# done

# python manage.py migrate
# python manage.py collectstatic --noinput

# exec "$@"
#!/bin/bash
set -e

# Wait for MySQL to be ready
echo "Waiting for database..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 2
done

# Apply database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

exec "$@"