#!/bin/sh
set -e

# APP_KEY must be set as an environment variable on Render (there's no
# .env file in this container, so `artisan key:generate` can't run here).
if [ -z "$APP_KEY" ]; then
  echo "ERROR: APP_KEY is not set. Generate one locally with 'php artisan key:generate --show' and set it as an env var on Render." >&2
  exit 1
fi

php artisan config:clear
php artisan migrate --force

# Optional seeding: set RUN_SEEDERS=true on Render to load the demo catalog.
# The seeders are idempotent (they only insert rows that are missing and never
# overwrite admin edits), so leaving this on is safe — but you can still turn
# it off once the catalog is loaded to skip the extra work on every boot.
if [ "$RUN_SEEDERS" = "true" ]; then
  echo "RUN_SEEDERS=true — running database seeders..."
  php artisan db:seed --force
fi

PORT="${PORT:-8080}"
exec php artisan serve --host 0.0.0.0 --port "$PORT"