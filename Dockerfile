# ---------- 1) Build the React / Vite assets ----------
FROM node:22-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY vite.config.js ./
COPY resources ./resources
COPY public ./public
RUN npm run build


# ---------- 2) Install PHP dependencies ----------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --optimize --no-dev --no-scripts


# ---------- 3) Final image: Apache + PHP ----------
FROM php:8.3-apache

# PHP extensions: PostgreSQL (Supabase), bcmath, opcache
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo_pgsql pgsql bcmath opcache \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

# Apache serves Laravel's public/ folder and listens on Render's $PORT
ENV PORT=10000 \
    APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's/Listen 80/Listen ${PORT}/' /etc/apache2/ports.conf \
    && sed -ri -e 's/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/' /etc/apache2/sites-available/000-default.conf \
    && printf 'ServerName localhost\n<Directory ${APACHE_DOCUMENT_ROOT}>\n    AllowOverride All\n    Require all granted\n</Directory>\n' > /etc/apache2/conf-available/laravel.conf \
    && a2enconf laravel

WORKDIR /var/www/html

# App code + vendor from stage 2, built assets from stage 1
COPY --from=vendor /app ./
COPY --from=assets /app/public/build ./public/build

# Writable folders for Laravel
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Start script, written right here so there is no separate file to forget to commit.
# (Environment variables only exist at runtime, so caching happens when the container starts.)
# Set RUN_MIGRATIONS=true in Render to create/update tables on deploy.
RUN printf '%s\n' \
    '#!/bin/sh' \
    'set -e' \
    'cd /var/www/html' \
    'php artisan package:discover --ansi' \
    'php artisan config:cache' \
    'php artisan view:cache' \
    'if [ "$RUN_MIGRATIONS" = "true" ]; then php artisan migrate --force; fi' \
    'chown -R www-data:www-data storage bootstrap/cache' \
    'exec apache2-foreground' \
    > /usr/local/bin/start.sh \
    && chmod +x /usr/local/bin/start.sh

EXPOSE 10000
CMD ["/usr/local/bin/start.sh"]