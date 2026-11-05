#!/bin/bash
set -euo pipefail
exec > >(tee -a /var/log/abhay-bootstrap.log) 2>&1

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl docker.io docker-compose-v2 nginx certbot python3-certbot-nginx git openssl
systemctl enable --now docker nginx

APP_DIR=/opt/abhay
git clone --depth 1 https://github.com/pratikrath126/Abhay-Indian-Deepfake-Detection.git "$APP_DIR"
cd "$APP_DIR"
umask 077
printf 'ML_API_KEY=%s\n' "$(openssl rand -hex 32)" > .env
chmod 600 .env

docker compose -f deploy/aws/compose.yaml up -d --build

cat > /usr/local/sbin/abhay-configure-endpoint <<'SCRIPT'
#!/bin/bash
set -euo pipefail
TOKEN="$(curl -fsS -X PUT -H 'X-aws-ec2-metadata-token-ttl-seconds: 21600' http://169.254.169.254/latest/api/token)"
PUBLIC_IP="$(curl -fsS -H "X-aws-ec2-metadata-token: ${TOKEN}" http://169.254.169.254/latest/meta-data/public-ipv4)"
API_DOMAIN="${PUBLIC_IP}.nip.io"
STATE_FILE=/var/lib/abhay/public-ip
mkdir -p /var/lib/abhay
if [[ -f "$STATE_FILE" ]] && [[ "$(cat "$STATE_FILE")" == "$PUBLIC_IP" ]] && [[ -f "/etc/letsencrypt/live/${API_DOMAIN}/fullchain.pem" ]]; then
  exit 0
fi

cat > /etc/nginx/sites-available/abhay-ml <<NGINX
server {
    listen 80;
    server_name ${API_DOMAIN};
    client_max_body_size 21m;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
NGINX
rm -f /etc/nginx/sites-enabled/default
ln -sfn /etc/nginx/sites-available/abhay-ml /etc/nginx/sites-enabled/abhay-ml
nginx -t
systemctl reload nginx
if [[ ! -f "/etc/letsencrypt/live/${API_DOMAIN}/fullchain.pem" ]]; then
  certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email --redirect -d "$API_DOMAIN"
fi
printf '%s\n' "$PUBLIC_IP" > "$STATE_FILE"
printf 'https://%s\n' "$API_DOMAIN" > /opt/abhay/DEPLOYED_URL.txt
SCRIPT
chmod 0755 /usr/local/sbin/abhay-configure-endpoint

cat > /etc/systemd/system/abhay-endpoint.service <<'UNIT'
[Unit]
Description=Configure Abhay ML HTTPS endpoint for current EC2 public IP
After=network-online.target nginx.service
Wants=network-online.target
[Service]
Type=oneshot
ExecStart=/usr/local/sbin/abhay-configure-endpoint
UNIT
cat > /etc/systemd/system/abhay-endpoint.timer <<'UNIT'
[Unit]
Description=Check Abhay ML endpoint IP and TLS certificate
[Timer]
OnBootSec=30s
OnUnitActiveSec=2min
[Install]
WantedBy=timers.target
UNIT
systemctl daemon-reload
systemctl enable --now abhay-endpoint.timer
systemctl start abhay-endpoint.service || true
printf 'Bootstrap complete. Check /opt/abhay/DEPLOYED_URL.txt and /opt/abhay/.env\n' >> /var/log/abhay-bootstrap.log
