# --- Stage 1: build the Vite/React frontend assets ---
FROM node:20-alpine AS assets

WORKDIR /app

COPY package.json package-lock.json ./
# npm ci installs exactly what's in package-lock.json — avoids the
# peer-dependency resolution issues you hit with `npm install`.
RUN npm ci

COPY . .
RUN npm run build


# --- Stage 2: PHP app with Composer dependencies ---
FROM php:8.2-cli-bookworm AS app

RUN apt-get update && apt-get install -y \
        git \
        unzip \
        libzip-dev \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip gd \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .
# Bring in the frontend build output produced in the assets stage.
COPY --from=assets /app/public/build ./public/build

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["docker-entrypoint.sh"]
