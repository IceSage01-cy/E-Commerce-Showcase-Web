#!/bin/sh
set -e
cd /var/www/html

# Environment variables only exist at runtime, so do the caching here
php artisan package:discover --ansi
php artisan config:cache
php artisan view:cache

# Set RUN_MIGRATIONS=true in Render to create/update tables on deploy
if [ "$RUN_MIGRATIONS" = "true" ]; then
  php artisan migrate --force
fi

# Caches were written as root; let Apache's user own them
chown -R www-data:www-data storage bootstrap/cache

exec apache2-foreground
