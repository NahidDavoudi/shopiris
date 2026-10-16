FROM composer:2 AS vendor
WORKDIR /api
COPY api/composer.json api/composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --prefer-dist --optimize-autoloader

FROM php:8.3-apache
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev libjpeg-dev libwebp-dev libfreetype6-dev libzip-dev libicu-dev \
    && docker-php-ext-configure gd --with-jpeg --with-webp --with-freetype \
    && docker-php-ext-install -j"$(nproc)" gd pdo_mysql mysqli zip intl opcache bcmath \
    && a2enmod rewrite headers remoteip \
    && rm -rf /var/lib/apt/lists/*

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/custom.ini "$PHP_INI_DIR/conf.d/zz-custom.ini"
COPY docker/remoteip.conf /etc/apache2/conf-available/remoteip.conf
COPY docker/apache-tune.conf /etc/apache2/conf-available/apache-tune.conf
RUN a2enconf remoteip apache-tune

# iris index.phpライブ in api/ ریشه است (پوشه public وجود ندارد) → داکرroot را /var/www/html نگه می‌داریم
RUN sed -ri "s/AllowOverride None/AllowOverride All/g" /etc/apache2/apache2.conf

# API (api/index.php) و فایل‌های استاتیک-frontend (index.html, login.html, admin.html, assets/) را در داکرroot کپی می‌کنیم
COPY api/ /var/www/html/
COPY --from=vendor /api/vendor/ /var/www/html/vendor/
COPY assets/ /var/www/html/assets/
COPY index.html login.html admin.html /var/www/html/

RUN mkdir -p /var/www/html/uploads /var/www/html/storage/cache /var/www/html/storage/logs \
    && chown -R www-data:www-data /var/www/html

EXPOSE 80
