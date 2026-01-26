#!/bin/bash
# Deploy script for Piekarnia Rzepka system
# Uruchom na serwerze Hetzner jako root

set -e

DOMAIN="system.piekarniarzepka.pl"
APP_DIR="/var/www/$DOMAIN"

echo "=== Instalacja nginx i certbot ==="
apt update
apt install -y nginx certbot python3-certbot-nginx

echo "=== Tworzenie katalogu aplikacji ==="
mkdir -p $APP_DIR

echo "=== Kopiowanie plików (uruchom z lokalnej maszyny) ==="
echo "Na lokalnej maszynie uruchom:"
echo "  scp -r dist/* root@TWOJ_IP:$APP_DIR/"
echo ""

echo "=== Konfiguracja nginx ==="
# Tymczasowa konfiguracja bez SSL (dla certbot)
cat > /etc/nginx/sites-available/$DOMAIN << 'NGINX'
server {
    listen 80;
    server_name system.piekarniarzepka.pl;
    root /var/www/system.piekarniarzepka.pl;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "=== Generowanie certyfikatu SSL ==="
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@piekarniarzepka.pl

echo "=== Finalizacja konfiguracji nginx ==="
# Certbot automatycznie doda SSL, ale dodajemy optymalizacje
cat > /etc/nginx/sites-available/$DOMAIN << 'NGINX'
server {
    listen 80;
    server_name system.piekarniarzepka.pl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name system.piekarniarzepka.pl;

    ssl_certificate /etc/letsencrypt/live/system.piekarniarzepka.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/system.piekarniarzepka.pl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    root /var/www/system.piekarniarzepka.pl;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
NGINX

nginx -t && systemctl reload nginx

echo "=== GOTOWE ==="
echo "Aplikacja dostępna pod: https://$DOMAIN"
