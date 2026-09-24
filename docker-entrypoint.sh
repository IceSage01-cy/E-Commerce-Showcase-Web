#!/bin/sh
set -e

# Generate an APP_KEY only if one isn't already set via env vars.
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force
fi

php artisan config:clear
php artisan migrate --force

PORT="${PORT:-8080}"
exec php artisan serve --host 0.0.0.0 --port "$PORT"
