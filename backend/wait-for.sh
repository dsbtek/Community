#!/bin/sh
# wait-for.sh: wait until a host:port is available

set -e

host="$1"
port="$2"
shift 2

until nc -z "$host" "$port"; do
  >&2 echo "Waiting for $host:$port..."
  sleep 2
done

>&2 echo "$host:$port is available. Starting..."
exec "$@"
