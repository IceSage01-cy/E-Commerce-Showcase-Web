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

# Optional one-off seeding: set RUN_SEEDERS=true on Render, deploy, watch the
# logs to confirm it ran, then set it back to false (or remove it) so it
# doesn't reseed on every future deploy.
if [ "$RUN_SEEDERS" = "true" ]; then
  echo "RUN_SEEDERS=true — running database seeders..."
  php artisan db:seed --force
fi

PORT="${PORT:-8080}"
exec php artisan serve --host 0.0.0.0 --port "$PORT"