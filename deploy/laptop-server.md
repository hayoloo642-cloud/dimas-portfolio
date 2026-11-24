# Deploy di laptop sendiri (server 24 jam)

Portofolio ini **tidak** lagi berjalan lewat `php artisan serve`. Di laptop ini
sudah dipasang stack produksi:

```
internet
   │  HTTPS
   ▼
Tailscale Funnel  →  https://dimas-portfolio.tail347dfc.ts.net
   │  127.0.0.1:80
   ▼
nginx  →  php-fpm (user dimas)  →  Laravel
```

Karena koneksi rumah di balik CGNAT (tidak ada IP publik dan port-forwarding
tidak mungkin), akses internet memakai **Tailscale Funnel**: domain tetap,
sertifikat HTTPS otomatis, tanpa perlu akun hosting.

## URL

| | |
| --- | --- |
| Publik | https://dimas-portfolio.tail347dfc.ts.net |
| Panel admin | https://dimas-portfolio.tail347dfc.ts.net/panel-dim4s |
| Lokal | http://127.0.0.1 (juga http://192.168.1.9 di jaringan rumah) |

Password admin awal `admin123` — ganti dari tab **Pengaturan** setelah login.

## Yang sudah dipasang

| Bagian | Detail |
| --- | --- |
| `nginx` | Server block di `/etc/nginx/conf.d/portfolio.conf` |
| `php-fpm` | Pool terpisah di `/etc/php-fpm.d/portfolio.conf`, jalan sebagai `dimas` |
| `tailscaled` | Node `dimas-portfolio`, Funnel aktif |
| `portfolio-funnel.service` | Memasang ulang Funnel setiap boot |
| `portfolio-health.timer` | Cek situs tiap 10 menit, restart nginx/php-fpm bila perlu |
| SELinux | `httpd_read_user_content`, `httpd_can_network_connect`, label `httpd_sys_content_t` / `httpd_sys_rw_content_t` |
| Anti-sleep | `/etc/systemd/logind.conf.d/90-portfolio-server.conf` + XFCE power manager |

Semua unit sudah `systemctl enable`, jadi menyala sendiri saat laptop dinyalakan.
Tidak ada password disk (tanpa LUKS), jadi boot langsung jalan.

## Perintah harian

```bash
systemctl status nginx php-fpm portfolio-funnel portfolio-health.timer
tailscale funnel status          # cek tunnel publik
tail -f /var/log/portfolio-health.log
```

Setelah mengubah kode:

```bash
cd ~/portfolio-laravel
php artisan optimize:clear
php artisan config:cache && php artisan route:cache && php artisan view:cache
sudo systemctl restart php-fpm
```

Healthcheck akan otomatis memulihkan kalau ada yang mati, tapi restart manual
lebih cepat.

## Kalau URL publik mati

```bash
sudo systemctl restart tailscaled
sudo tailscale funnel --bg 80
```

Kalau Tailscale minta login ulang:

```bash
sudo tailscale up --hostname=dimas-portfolio --accept-dns=false
```

## Catatan

- Laptop harus **menyala dan terhubung Wi-Fi** agar situs bisa diakses. Kalau
  laptop mati, situs ikut mati — konsekuensi hosting sendiri.
- Funnel hanya membuka port 80 lewat HTTPS Tailscale, bukan seluruh laptop.
- Batas Funnel gratis: kuota bandwidth wajar untuk portofolio pribadi.
