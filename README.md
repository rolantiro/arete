# ARÉTÉ — Premium Fashion Store

Website e-commerce premium untuk brand fashion, dibangun dengan **Next.js 15**, **React 18**, **TypeScript**, **Tailwind CSS v4**, dan **Supabase**. Desain minimalis-luxury (putih / hitam / abu-abu) dengan glassmorphism ringan, animasi halus, dan dashboard admin lengkap untuk mengelola seluruh konten website tanpa menyentuh kode.

![Status](https://img.shields.io/badge/build-passing-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Fitur

### Untuk Pembeli
- **Katalog produk** dengan filter kategori, foto, nama, harga, tombol Like (wishlist), dan tombol Tambah ke Keranjang
- **Halaman detail produk** dengan pilihan ukuran, warna, jumlah, dan produk terkait
- **Wishlist** — simpan produk favorit tanpa perlu login (berbasis session/cookie)
- **Keranjang belanja** — ubah jumlah, hapus item, lihat subtotal
- **Loading screen** modern dengan animasi reveal logo
- **SEO friendly** — metadata dinamis, `sitemap.xml`, `robots.txt`, Open Graph

### Untuk Admin (dilindungi autentikasi Supabase Auth)
- **Dashboard** — ringkasan jumlah produk, stok menipis, kategori, nilai inventaris
- **Manajemen Produk** — tambah, edit, hapus produk; kelola stok, harga, harga coret, ukuran, warna, status aktif/unggulan
- **Media** — ganti logo, banner beranda, dan gambar bagian "Tentang Kami" — langsung tersimpan ke Supabase Storage
- **Halaman Website** — edit semua teks (hero, tentang kami, footer, SEO) tanpa coding
- **Pengaturan** — kelola kategori produk & ubah password admin
- Semua perubahan tersimpan ke database dan **langsung tampil** di website pembeli (tidak perlu redeploy)

---

## 🛠️ Teknologi

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI Library | React 18 + TypeScript |
| Styling | Tailwind CSS v4 |
| Animasi | Framer Motion |
| Database & Auth | Supabase (PostgreSQL + Supabase Auth + Storage) |
| State (client) | Zustand |
| Validasi | Zod |
| Ikon | Lucide React |
| Notifikasi | Sonner |

---

## 📁 Struktur Folder

```
arete/
├── src/
│   ├── app/
│   │   ├── (store)/             # Halaman pembeli
│   │   │   ├── katalog/
│   │   │   ├── keranjang/
│   │   │   ├── wishlist/
│   │   │   └── produk/[slug]/
│   │   ├── admin/               # Dashboard admin (dilindungi middleware)
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── produk/
│   │   │   ├── media/
│   │   │   ├── halaman/
│   │   │   └── pengaturan/
│   │   ├── api/                 # Route handlers
│   │   │   ├── admin/           # Endpoint khusus admin (products, categories, content, images, upload)
│   │   │   ├── cart/
│   │   │   └── wishlist/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Homepage
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── ui/                  # Button, Input, Container, ConfirmDialog
│   │   ├── store/                # Hero, ProductCard, FeaturedProducts, dll
│   │   ├── admin/                 # AdminSidebar, ProductForm, ImagePicker, TagInput
│   │   └── layout/                # Navbar, Footer, LoadingScreen
│   ├── lib/
│   │   ├── supabase/             # client.ts, server.ts, admin.ts, middleware.ts
│   │   ├── data/                  # products.ts, categories.ts, content.ts
│   │   ├── validations.ts        # Zod schemas
│   │   ├── auth-guard.ts         # requireAdmin() helper untuk API routes
│   │   ├── session.ts             # Guest session id (cart/wishlist)
│   │   └── utils.ts
│   ├── store/                     # Zustand store (counter cart/wishlist)
│   ├── types/                     # TypeScript types
│   ├── fonts/                     # Font self-hosted (Inter, Playfair Display)
│   └── middleware.ts
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init_schema.sql   # Skema tabel
│   │   └── 0002_rls_policies.sql  # Row Level Security
│   └── seed.sql                    # Data contoh (kategori, produk, konten)
├── scripts/
│   └── create-admin.mjs            # Script bantu membuat akun admin pertama
├── .env.example
└── README.md
```

---

## 🗄️ Skema Database

| Tabel | Keterangan |
|---|---|
| `admins` | Profil admin, ditautkan 1:1 ke `auth.users` Supabase Auth |
| `products` | Produk: nama, slug, harga, stok, gambar (jsonb), ukuran, warna, kategori |
| `categories` | Kategori produk |
| `website_content` | Konten teks editable (hero, about, footer, navbar, SEO) — key-value per section |
| `website_images` | Gambar editable (logo, banner, dll) per slot |
| `cart_items` | Item keranjang, di-scope per `session_id` (cookie tamu) |
| `wishlist_items` | Item wishlist, di-scope per `session_id` |

Keamanan diatur lewat **Row Level Security (RLS)**:
- Pembeli (anon) hanya bisa **membaca** produk aktif, kategori, dan konten website
- Hanya baris yang terdaftar di tabel `admins` yang bisa **menulis** (insert/update/delete) ke produk, kategori, konten, dan gambar
- Cart & wishlist dibatasi lewat `session_id` (httpOnly cookie) yang diatur oleh server, bukan oleh klien

---

## 🚀 Panduan Instalasi

### 1. Clone repository

```bash
git clone https://github.com/rolantiro/arete.git
cd arete
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat project Supabase

1. Buka [supabase.com](https://supabase.com) → buat project baru
2. Buka **Project Settings → API**, catat:
   - `Project URL`
   - `anon public key`
   - `service_role key` (rahasia — jangan disebar)

### 4. Konfigurasi environment variables

Salin `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Isi nilainya:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Jalankan migrasi database

Buka **SQL Editor** di dashboard Supabase, jalankan secara berurutan:

1. Isi dari `supabase/migrations/0001_init_schema.sql`
2. Isi dari `supabase/migrations/0002_rls_policies.sql`
3. (Opsional, untuk data contoh) Isi dari `supabase/seed.sql`

> Alternatif: jika sudah menginstal [Supabase CLI](https://supabase.com/docs/guides/cli), jalankan `supabase db push` setelah `supabase link`.

### 6. Buat akun admin pertama

Setiap admin butuh akun di Supabase Auth **dan** baris yang cocok di tabel `admins`. Skrip berikut membuat keduanya sekaligus:

```bash
npm run create-admin -- admin@arete.id PasswordKuat123 "Nama Admin"
```

> Skrip ini membaca `SUPABASE_SERVICE_ROLE_KEY` dari `.env.local`, jadi pastikan file itu sudah terisi sebelum menjalankannya.

### 7. Jalankan secara lokal

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk halaman toko, dan [http://localhost:3000/admin/login](http://localhost:3000/admin/login) untuk login admin.

### 8. Build untuk produksi

```bash
npm run build
npm run start
```

---

## 🌐 Deploy

Cara tercepat: deploy ke [Vercel](https://vercel.com).

1. Import repository ini di Vercel
2. Tambahkan environment variables yang sama seperti `.env.local` di **Project Settings → Environment Variables**
3. Deploy — Vercel otomatis menjalankan `npm run build`

Pastikan `NEXT_PUBLIC_SITE_URL` diisi dengan domain produksi (untuk `sitemap.xml`).

---

## 🔐 Catatan Keamanan

- Jangan pernah commit file `.env.local` atau membagikan `SUPABASE_SERVICE_ROLE_KEY`
- Akses ke `/admin/*` dilindungi oleh `middleware.ts` (cek sesi Supabase Auth) **dan** `src/app/admin/layout.tsx` (cek keberadaan baris di tabel `admins`) — dua lapis, bukan satu
- Semua endpoint tulis di `api/admin/*` memverifikasi admin lewat `requireAdmin()` sebelum mengubah data apa pun
- RLS aktif di seluruh tabel — bahkan jika `anon key` bocor, penyerang tetap tidak bisa menulis data tanpa baris admin yang valid

---

## 📜 Lisensi

MIT — bebas digunakan dan dimodifikasi untuk kebutuhan komersial maupun pribadi.
