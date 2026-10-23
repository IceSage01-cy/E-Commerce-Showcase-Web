#!/bin/sh
set -e

# APP_KEY must be set as an environment variable on the host (Render), because the image has no .env file.
if [ -z "$APP_KEY" ]; then
  echo "ERROR: APP_KEY is not set. Generate one locally with 'php artisan key:generate --show' and set it as an env var on the host." >&2
  exit 1
fi

# Rebuild the caches from the environment this container actually runs with.
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

php artisan migrate --force

# Optional seeding: set RUN_SEEDERS=true to load the demo catalogue on a fresh database.
# The seeders are idempotent and never overwrite admin edits, but turn the flag off once the catalogue is loaded.
if [ "$RUN_SEEDERS" = "true" ]; then
  echo "RUN_SEEDERS=true, running database seeders..."
  php artisan db:seed --force
fi

PORT="${PORT:-8080}"
# php's built-in server handles requests in parallel only when given several workers.
export PHP_CLI_SERVER_WORKERS="${PHP_CLI_SERVER_WORKERS:-4}"
exec php artisan serve --host 0.0.0.0 --port "$PORT"
