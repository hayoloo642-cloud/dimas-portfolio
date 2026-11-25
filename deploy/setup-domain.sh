#!/usr/bin/env bash
# ============================================================
# Sambungkan domain whoisdimasparama.id ke portofolio lewat
# Cloudflare Tunnel (named tunnel) di laptop ini.
#
# Jalankan SEKALI setelah domain terdaftar & nameserver-nya
# sudah dipindah ke Cloudflare.
#
#   sudo bash deploy/setup-domain.sh
# ============================================================
set -euo pipefail

DOMAIN="whoisdimasparama.id"
TUNNEL="dimas-portfolio"
ORIGIN="http://127.0.0.1:80"

say() { printf "\n\033[1m== %s\033[0m\n" "$*"; }
die() { printf "\n\033[31m%s\033[0m\n" "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Jalankan dengan sudo: sudo bash deploy/setup-domain.sh"

say "1/6 Cek domain & nameserver"
NS_JSON="$(dig +short NS "$DOMAIN" @1.1.1.1 || true)"
if [ -z "$NS_JSON" ]; then
  die "Domain $DOMAIN belum punya NS. Daftarkan domain dulu dan pindahkan nameserver ke Cloudflare."
fi
printf '%s\n' "$NS_JSON"
if ! printf '%s' "$NS_JSON" | grep -qi "ns.cloudflare.com"; then
  die "Nameserver $DOMAIN belum menunjuk ke Cloudflare. Selesaikan dulu di registrar/Cloudflare."
fi

say "2/6 Login Cloudflare (browser akan terbuka)"
# File sertifikat origin disimpan di ~/.cloudflared/cert.pem milik user pemilik tunnel.
if ! sudo -u dimas test -f /home/dimas/.cloudflared/cert.pem; then
  echo "Ikuti tautan yang muncul, pilih zona $DOMAIN, lalu Authorize."
  sudo -u dimas cloudflared tunnel login
fi

say "3/6 Buat / pakai tunnel bernama '$TUNNEL'"
if ! sudo -u dimas cloudflared tunnel list 2>/dev/null | awk '{print $2}' | grep -qx "$TUNNEL"; then
  sudo -u dimas cloudflared tunnel create "$TUNNEL"
fi
TUNNEL_ID="$(sudo -u dimas cloudflared tunnel list | awk -v t="$TUNNEL" '$2==t{print $1}' | head -1)"
[ -n "$TUNNEL_ID" ] || die "Tidak bisa menemukan ID tunnel $TUNNEL."
echo "Tunnel ID: $TUNNEL_ID"

say "4/6 Tulis konfigurasi tunnel"
install -d -o dimas -g dimas -m 700 /home/dimas/.cloudflared
cat > /home/dimas/.cloudflared/config.yml <<EOF
tunnel: $TUNNEL_ID
credentials-file: /home/dimas/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: $ORIGIN
  - hostname: www.$DOMAIN
    service: $ORIGIN
  - service: http_status:404
EOF
chown dimas:dimas /home/dimas/.cloudflared/config.yml
chmod 600 /home/dimas/.cloudflared/config.yml

say "5/6 Buat DNS record di Cloudflare"
sudo -u dimas cloudflared tunnel route dns "$TUNNEL" "$DOMAIN"
sudo -u dimas cloudflared tunnel route dns "$TUNNEL" "www.$DOMAIN"

say "6/6 Pasang systemd service & matikan akses lama"
install -m 644 /home/dimas/portfolio-laravel/deploy/cloudflared-portfolio.service \
  /etc/systemd/system/cloudflared-portfolio.service
systemctl daemon-reload
systemctl enable --now cloudflared-portfolio.service

# Tunnel sementara (quick tunnel) & Funnel Tailscale tidak diperlukan lagi.
systemctl disable --now portfolio-tunnel.service 2>/dev/null || true
systemctl disable --now portfolio-funnel.service 2>/dev/null || true
tailscale funnel --bg 80 off >/dev/null 2>&1 || true

say "Selesai"
echo "Cek:  https://$DOMAIN"
echo "Log:  journalctl -u cloudflared-portfolio -f"
