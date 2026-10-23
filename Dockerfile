# --- Stage 1: build the Vite/React frontend assets ---
FROM node:20-alpine AS assets

WORKDIR /app

COPY package.json package-lock.json ./
# npm ci installs exactly what's in package-lock.json.
RUN npm ci

COPY . .
RUN npm run build


# --- Stage 2: PHP app with Composer dependencies ---
FROM php:8.2-cli-bookworm AS app

RUN apt-get update && apt-get install -y \
        git \
        unzip \
        libzip-dev \
        libpq-dev \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip gd \
    && rm -rf /var/lib/apt/lists/* \
    && { \
        echo 'opcache.enable=1'; \
        echo 'opcache.validate_timestamps=0'; \
        echo 'opcache.memory_consumption=128'; \
    } > /usr/local/etc/php/conf.d/opcache-production.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .
# Bring in the frontend build output produced in the assets stage.
COPY --from=assets /app/public/build ./public/build

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-progress

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    PHP_CLI_SERVER_WORKERS=4

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD php -r "exit(@file_get_contents('http://127.0.0.1:' . (getenv('PORT') ?: '8080') . '/up') === false ? 1 : 0);"

# Don't run the app as root. storage and bootstrap/cache are already owned by www-data above.
USER www-data

ENTRYPOINT ["docker-entrypoint.sh"]
