# Portofolio Dimas Parama — Laravel

Situs portofolio editorial satu halaman + panel admin rahasia, dibangun dengan
**Laravel 13**, **SQLite**, dan front-end yang sama persis dengan versi sebelumnya.

Desain, tipografi, animasi, dan seluruh isi tidak berubah sama sekali. Yang
berubah hanya fondasinya: dari server Node milik sendiri menjadi aplikasi
Laravel lengkap dengan database, migration, model, dan upload media.

---

## 1. Menjalankan

Butuh PHP 8.2+ dan Composer.

```bash
cd ~/portfolio-laravel

composer install          # hanya sekali
cp .env.example .env      # kalau .env belum ada
php artisan key:generate
php artisan migrate

php artisan serve
```

Buka **http://127.0.0.1:8000**

Database SQLite otomatis dibuat di `database/database.sqlite`.
Tidak ada `npm install`, tidak ada build step. Semua aset ada di `public/`.

---

## 2. Panel admin (akses khusus)

Panel admin **tidak ditautkan** di halaman mana pun. Tiga cara membukanya:

| Cara | Aksi |
| --- | --- |
| Gestur | Ketuk logo **Dimas** di navbar **5×** dalam 3 detik |
| Pintasan | Tekan **Ctrl/Cmd + Shift + A** |
| Langsung | Buka `/panel-dim4s` |

Halaman publik tidak memuat path admin sama sekali — gestur dan pintasan
diarahkan ke alias `/kelola` yang hanya melakukan redirect di server. Jadi
`ADMIN_PATH` tetap tidak terlihat di source HTML.

Ganti path rahasianya di `.env`:

```env
ADMIN_PATH=nama-rahasia-kamu
ADMIN_PASSWORD=password-awal
```

Setelah `.env` diubah jalankan `php artisan config:clear`.

### Password

Password awal: **`admin123`** (diatur lewat `ADMIN_PASSWORD` saat pertama kali).
Segera ganti di **Pengaturan → Ganti password admin**.

Password disimpan sebagai hash **bcrypt** di tabel `settings`, bukan teks biasa.
Panel memakai token `x-admin-token` (HMAC) sehingga API tetap stateless.

### Mode edit publik

Secara bawaan **edit publik nonaktif** — hanya admin yang login bisa menyimpan.
Bisa dinyalakan di **Pengaturan → Akses edit**.

---

## 3. Yang bisa diedit dari panel

Semua bagian situs, tanpa menyentuh kode:

- **Identitas** — nama, nama panggilan, aksara Jepang, peran, surel, lokasi, bio, link CV
- **Intro** — kanji, nama, tahun, label lewati
- **Hero** — label, tanggal, kredit proyek, sapaan, kutipan, teks berjalan
- **Profil** — judul, paragraf, foto (upload / hapus BG / URL), fakta singkat
- **Biografi** — cerita **biografi**, daftar riwayat, dan **riwayat pendidikan** (bisa ditambah)
- **Prestasi** — item akordeon: judul, deskripsi, cerita, foto, tag, tahun, urutan
- **Project** — kartu project (sampul, judul, deskripsi, peran, tahun, tautan) plus **foto dokumentasi** yang bisa ditambah, diganti, dihapus, dan diurutkan
- **Sertifikat** — gambar sertifikat, nomor, judul, penerbit, tahun, deskripsi, urutan
- **Quote** — label, kutipan, penulis
- **Keahlian** — daftar keahlian dengan tingkat & ikon, plus **integrasi GitHub**
- **Galeri** — foto dengan upload, judul, keterangan, urutan
- **Kontak & Footer** — sapaan penutup, sosial media, kredit, tanggal, wordmark
- **Tampilan** — tema terang / gelap / **midnight**, warna aksen
- **Pengaturan** — akses edit, ganti password, status data

Setiap kolom gambar punya tombol **Upload**, **Hapus BG**, **Pakai URL**, dan **Hapus**.
Upload dikompres otomatis ke WebP di browser lalu disimpan ke
`storage/app/public/uploads/`. Hapus BG memakai model AI yang berjalan di browser.

Perubahan tersimpan otomatis ±1,4 detik setelah berhenti mengetik, atau tekan
**Simpan** / `Ctrl+S`.

---

## 4. Struktur

```
portfolio-laravel/
├── app/
│   ├── Http/Controllers/
│   │   ├── SiteController.php      # halaman publik
│   │   ├── AdminController.php     # panel rahasia
│   │   └── ApiController.php       # JSON API
│   ├── Models/
│   │   ├── SiteContent.php         # dokumen konten (JSON)
│   │   ├── ContentRevision.php     # riwayat 20 versi terakhir
│   │   ├── Setting.php             # password, token, mode edit
│   │   ├── Media.php               # catatan file upload
│   │   ├── Translation.php         # cache terjemahan
│   │   └── Visit.php               # penghitung kunjungan
│   └── Support/
│       ├── ContentRepository.php   # baca/tulis konten + merge default
│       ├── AdminAuth.php           # login, token, izin
│       └── TranslationService.php  # terjemahan ID ⇄ EN + cache
├── config/portfolio.php
├── database/
│   ├── database.sqlite
│   └── migrations/
├── resources/
│   ├── content/defaults.json       # isi awal situs
│   └── views/site/
│       ├── index.blade.php         # halaman publik
│       └── admin.blade.php         # panel admin
├── public/
│   ├── assets/                     # foto & ikon
│   ├── css/site.css, admin.css
│   └── js/                         # site.js, admin.js, dst.
├── routes/web.php
└── storage/app/public/uploads/     # gambar hasil upload
```

---

## 5. API

Kontrak API sama dengan versi sebelumnya, jadi front-end tidak perlu diubah.

| Method | Path | Fungsi |
| --- | --- | --- |
| GET | `/api/meta` | status login & izin edit |
| POST | `/api/login` | `{password}` → `{token}` |
| GET | `/api/session` | cek token |
| GET | `/api/content` | seluruh konten (Bahasa Indonesia) |
| GET | `/api/content/translated?locale=en` | konten versi Inggris (diterjemahkan & di-cache) |
| PUT | `/api/content` | simpan konten |
| POST | `/api/settings` | mode edit / ganti password |
| POST | `/api/upload` | `{dataUrl}` → `{url}` |
| POST | `/api/visit` | `{token}` → `{count}` penghitung kunjungan |
| GET | `/api/github/{user}` | ringkasan profil & repositori GitHub |
| GET | `/api/health` | status server |

Token dikirim sebagai header `x-admin-token`.

---

## 6. Fitur halaman publik

- **Marquee** berjalan mulus tanpa jeda — satu baris penuh diduplikasi lalu
  digeser `-100%`, jadi tidak pernah ada ruang kosong.
- **Bingkai hero** punya garis cahaya berjalan, sudut yang menggambar sendiri
  saat halaman dibuka, dan bereaksi saat hero disorot.
- **Tema** — terang, gelap, dan **midnight** (biru malam) dengan transisi riak
  melingkar. Pilihan pengunjung disimpan di perangkatnya.
- **Bahasa** — tombol ID/EN di navbar. Teks lama *dan* teks baru yang kamu
  tambahkan lewat admin diterjemahkan otomatis lalu disimpan di tabel
  `translations`, jadi kunjungan berikutnya instan.
- **Kunjungan** — penghitung kecil di footer, satu orang dihitung sekali.
- **GitHub** — repositori publik tampil di halaman keahlian (di-cache 15 menit).
- **Halaman keahlian** sengaja tidak punya tombol di navbar.
- **Sertifikat** — kartu bisa diklik untuk membuka gambar besar.
- **Teks footer** otomatis berjalan bila terlalu panjang, jadi tidak pernah
  terpotong.
- Semua animasi menghormati `prefers-reduced-motion`.

---

## 7. Reset & cadangan

- Konten: tabel `site_contents` (baris tunggal).
- Riwayat: tabel `content_revisions`, 20 versi terakhir.
- Kembalikan ke isi awal:

```bash
php artisan tinker --execute="app(App\Support\ContentRepository::class)->save(app(App\Support\ContentRepository::class)->defaults());"
```

- Kembalikan password ke `ADMIN_PASSWORD` di `.env`:

```bash
php artisan tinker --execute="app(App\Support\AdminAuth::class)->changePassword(config('portfolio.default_password'));"
```

---

## 8. Deploy

Arahkan document root web server ke folder `public/`.
Pastikan `storage/` dan `bootstrap/cache/` bisa ditulis, dan
`php artisan storage:link` sudah dijalankan supaya gambar upload bisa diakses.
