# Domain kustom: whoisdimasparama.id

Situs saat ini diakses lewat Tailscale Funnel
(`https://dimas-portfolio.tail347dfc.ts.net`). Funnel **tidak mendukung domain
kustom**, jadi untuk memakai `whoisdimasparama.id` dipakai **Cloudflare Tunnel**
yang tersambung keluar (outbound) — cocok untuk koneksi rumah di balik CGNAT.

```
internet
   │  HTTPS  whoisdimasparama.id
   ▼
Cloudflare (DNS + TLS)  ──tunnel keluar──►  cloudflared di laptop
                                              │  127.0.0.1:80
                                              ▼
                                            nginx → php-fpm → Laravel
```

Tidak perlu IP publik, port forwarding, atau membuka port router.

## Yang sudah disiapkan otomatis

| Berkas | Isi |
| --- | --- |
| `deploy/setup-domain.sh` | Skrip sekali jalan: login, buat tunnel, tulis config, buat DNS, pasang service |
| `deploy/cloudflared-portfolio.service` | Unit systemd agar tunnel hidup sendiri saat boot |
| `/etc/nginx/conf.d/portfolio.conf` | `server_name` menerima domain baru + `real_ip` dari Cloudflare |
| `bootstrap/app.php` | `trustProxies(at: '*')` supaya skema HTTPS & IP asli terbaca |
| `.env` | `APP_URL=https://whoisdimasparama.id` |

Cadangan konfigurasi nginx lama ada di
`/etc/nginx/conf.d/portfolio.conf.bak.<timestamp>`.

## Langkah manual (butuh akun Anda)

### 1. Daftarkan domain `.id`

Pilih salah satu registrar resmi PANDI, misalnya **Rumahweb**, **Domainesia**,
atau **Niagahoster**. Siapkan KTP untuk verifikasi pemilik domain `.id`.
Perkiraan biaya: Rp 200–300 ribu/tahun.

### 2. Pindahkan nameserver ke Cloudflare

1. Buat akun gratis di <https://dash.cloudflare.com/sign-up>.
2. **Add a site** → masukkan `whoisdimasparama.id` → pilih paket **Free**.
3. Cloudflare memberi 2 nameserver, misalnya `xxx.ns.cloudflare.com`.
4. Di panel registrar, ganti nameserver domain ke dua alamat tersebut.
5. Tunggu propagasi (biasanya 5 menit–24 jam) sampai status di Cloudflare
   **Active**.

### 3. Jalankan skrip penyambung

```bash
cd ~/portfolio-laravel
sudo bash deploy/setup-domain.sh
```

Skrip akan membuka tautan login Cloudflare di browser. Pilih zona
`whoisdimasparama.id`, klik **Authorize**, lalu skrip menyelesaikan sisanya:
membuat tunnel `dimas-portfolio`, menulis `~/.cloudflared/config.yml`,
membuat record DNS untuk `whoisdimasparama.id` dan `www`, memasang unit
systemd, dan mematikan Funnel Tailscale + quick tunnel lama.

### 4. Verifikasi

```bash
curl -sI https://whoisdimasparama.id | head -3
systemctl status cloudflared-portfolio
journalctl -u cloudflared-portfolio -f
```

## Perawatan

```bash
sudo systemctl restart cloudflared-portfolio   # muat ulang tunnel
cloudflared tunnel info dimas-portfolio        # status koneksi
```

Kalau laptop mati/reboot, `cloudflared-portfolio` menyala otomatis (unit
sudah `enable`). Anti-sleep dan healthcheck tetap berjalan seperti sebelumnya.

## Catatan

- Sertifikat HTTPS diurus Cloudflare; tidak perlu Certbot/Let's Encrypt.
- Setelah domain aktif, URL lama `dimas-portfolio.tail347dfc.ts.net` tetap bisa
  dimatikan sepenuhnya — skrip sudah mematikan Funnel-nya.
- Panel admin tetap di `https://whoisdimasparama.id/panel-dim4s`.
