#!/bin/bash
# Run this script ONCE on the server to bootstrap SSL certificates.
# After this, certbot auto-renews every 12 hours via the certbot container.
#
# Usage:
#   chmod +x nginx/init-letsencrypt.sh
#   ./nginx/init-letsencrypt.sh

set -e

DOMAIN="bankes.iom-itb.id"
EMAIL="admin@iom-itb.id"   # Change to your real email
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"
DATA_PATH="./nginx/certbot"
RSA_KEY_SIZE=4096
STAGING=0  # Set to 1 to test against staging CA (avoids rate limits)

if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
  read -rp "Certificate already exists for $DOMAIN. Replace it? (y/N) " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 0
fi

# Download recommended TLS parameters from certbot
echo "==> Downloading recommended TLS parameters..."
mkdir -p "$DATA_PATH/conf"
if [ ! -e "$DATA_PATH/conf/options-ssl-nginx.conf" ]; then
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
    -o "$DATA_PATH/conf/options-ssl-nginx.conf"
fi
if [ ! -e "$DATA_PATH/conf/ssl-dhparams.pem" ]; then
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
    -o "$DATA_PATH/conf/ssl-dhparams.pem"
fi

# Create a temporary self-signed cert so nginx can start (it requires cert files to exist)
echo "==> Creating temporary self-signed certificate..."
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm --entrypoint "
  openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem
    -out    /etc/letsencrypt/live/$DOMAIN/fullchain.pem
    -subj '/CN=localhost'" certbot

# Start nginx with the dummy cert
echo "==> Starting nginx..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up --force-recreate -d nginx

# Remove the dummy cert
echo "==> Removing temporary certificate..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm --entrypoint "
  rm -rf /etc/letsencrypt/live/$DOMAIN
         /etc/letsencrypt/archive/$DOMAIN
         /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

# Build certbot flags
CERTBOT_FLAGS="--webroot -w /var/www/certbot -d $DOMAIN --rsa-key-size $RSA_KEY_SIZE --agree-tos --force-renewal"
[ "$STAGING" = "1" ] && CERTBOT_FLAGS="$CERTBOT_FLAGS --staging"
[ -n "$EMAIL" ] && CERTBOT_FLAGS="$CERTBOT_FLAGS --email $EMAIL" || CERTBOT_FLAGS="$CERTBOT_FLAGS --register-unsafely-without-email"

# Obtain the real certificate
echo "==> Requesting Let's Encrypt certificate for $DOMAIN..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm --entrypoint "certbot certonly $CERTBOT_FLAGS" certbot

# Reload nginx with the real cert
echo "==> Reloading nginx..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec nginx nginx -s reload

echo ""
echo "Done! SSL certificate for $DOMAIN is now active."
echo "Certbot will auto-renew the certificate every 12 hours."
