<div align="center">
  <br />
  <h1>🎟️ TiketEvent Web Client</h1>
  <p><strong>Modern, Ultra-Fast Single Page Application (SPA) for Event Discovery & Ticketing</strong></p>
  <p><em>Built with React 19, Tailwind CSS v4, Midtrans Snap Popup Payment, Real-time Camera QR Scanner & Playwright E2E Smoke Testing.</em></p>

  <p>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/Framework-React%2019-61DAFB?style=flat-square&logo=react" alt="React 19" /></a>
    <a href="https://vite.dev"><img src="https://img.shields.io/badge/Bundler-Vite%208-646CFF?style=flat-square&logo=vite" alt="Vite 8" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 4" /></a>
    <a href="https://midtrans.com"><img src="https://img.shields.io/badge/Payment-Midtrans%20Snap-002B49?style=flat-square" alt="Midtrans" /></a>
    <a href="https://playwright.dev"><img src="https://img.shields.io/badge/Testing-Playwright%20E2E-2EAD33?style=flat-square&logo=playwright" alt="Playwright" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" /></a>
  </p>
  <br />
</div>

---

## ⚡ Fitur Utama

* **Jelajahi & Cari Event**: Tampilan kartu event interaktif dengan filter pencarian instan, badge tanggal, dan status sisa kuota.
* **Integrasi Midtrans Snap Popup**: Pembayaran aman langsung di halaman aplikasi tanpa redirect eksternal (Virtual Account, QRIS, GoPay, Kartu Kredit).
* **Manajemen Tiket Saya (E-Tiket & QR Code)**: Tampilan e-tiket digital ber-QR code dengan modal perbesar QR untuk kemudahan verifikasi di pintu masuk.
* **Portal Admin Lengkap**:
  * **Dashboard Metrik**: Ringkasan total pendapatan, penjualan per event, dan order terbaru.
  * **Manajemen Event & Banner**: CRUD event lengkap dengan upload gambar banner (pratinjau lokal sebelum simpan) dan pengaturan jenis tiket.
  * **Scanner Check-in Kamera**: Scanner kamera bawaan berbasis `html5-qrcode` untuk memindai QR code tiket secara real-time dengan proteksi double check-in dan input kode manual.
* **Desain Responsif**: Dioptimalkan untuk perangkat mobile (menu hamburger, tata letak satu kolom) hingga desktop layar lebar.

---

## 🚀 Panduan Instalasi Lokal (Quick Start)

### 1. Kebutuhan Sistem
* Node.js 22 LTS atau yang lebih baru (disarankan Node 24)
* npm 10+
* Backend TiketEvent API yang sedang berjalan di `http://localhost:8000`

### 2. Langkah Menjalankan
```bash
# 1. Clone & masuk ke folder frontend
git clone https://github.com/ticketing-system-platform/ticketing-system-frontend.git frontend
cd frontend

# 2. Pasang dependensi
npm install

# 3. Salin file konfigurasi environment
cp .env.example .env

# 4. Sesuaikan variabel di file .env:
#    VITE_API_URL=http://localhost:8000/api
#    VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
#    VITE_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js

# 5. Jalankan development server
npm run dev
```
Aplikasi dapat diakses di browser melalui `http://localhost:5173`.

---

## 🛠️ Perintah Skrip Tersedia

| Script | Perintah | Fungsi |
|---|---|---|
| `dev` | `npm run dev` | Menjalankan Vite dev server dengan Hot Module Replacement (HMR) |
| `build` | `npm run build` | Melakukan kompilasi aset produksi ke folder `dist/` |
| `lint` | `npm run lint` | Menjalankan static analysis ESLint (aturan React 19 & Tailwind) |
| `preview` | `npm run preview` | Menjalankan preview lokal dari hasil build produksi |
| `test:e2e` | `npm run test:e2e` | Menjalankan smoke test otomatis browser Playwright (15 skenario) |
| `test:e2e:report` | `npm run test:e2e:report` | Menampilkan laporan HTML hasil pengujian Playwright |

---

## 🧪 Smoke Test Otomatis (Playwright)

Proyek ini telah dilengkapi dengan suite pengujian otomatis browser menyeluruh menggunakan **Playwright**:
```bash
npm run test:e2e
```
Skenario yang diuji secara otomatis (berjalan serial ±5 menit):
1. Navigasi beranda, pencarian event, dan filter draft.
2. Detail event, kuota maksimal per pembelian, dan redirect login.
3. Form pendaftaran akun, validasi input, login, dan logout.
4. Alur checkout lengkap & pembayaran BCA Virtual Account via Midtrans Sandbox Simulator.
5. Verifikasi penerbitan e-tiket pasca pembayaran.
6. Halaman Tiket Saya dan modal perbesar QR code.
7. Penguncian kuota selama order pending dan pembatalan otomatis.
8. CRUD event dan jenis tiket oleh admin.
9. Filter dan pencarian data transaksi admin.
10. Verifikasi check-in QR code menggunakan kamera virtual palsu.
11. Tampilan responsif navigasi mobile.

---

## 📁 Struktur Direktori

```text
frontend/
├── e2e/                     # Skenario pengujian Playwright (helpers & smoke test)
├── public/                  # Aset statis & favicon SVG
├── src/
│   ├── components/          # Komponen UI modular (Navbar, Alert, EventCard, Loading, dll.)
│   ├── context/             # AuthContext (state sesi login, user, token)
│   ├── lib/                 # Utility axios API client, formatter rupiah/tanggal, Midtrans Snap loader
│   ├── pages/
│   │   ├── admin/           # Halaman admin (Dashboard, Events, TicketTypes, Orders, Scanner)
│   │   ├── customer/        # Halaman customer (Checkout, MyOrders, MyTickets, PaymentStatus)
│   │   ├── EventDetail.jsx  # Halaman detail event & pemilihan tiket
│   │   ├── Home.jsx         # Halaman utama & pencarian
│   │   ├── Login.jsx        # Halaman masuk
│   │   └── Register.jsx     # Halaman registrasi
│   ├── App.jsx              # Definisi route & layout aplikasi
│   ├── index.css            # Tailwind CSS v4 styling
│   └── main.jsx             # Entrypoint React 19
├── playwright.config.js     # Konfigurasi pengujian Playwright
└── vite.config.js           # Konfigurasi bundler Vite 8 & Tailwind plugin
```

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Lihat file [LICENSE](LICENSE) untuk informasi lebih lanjut.
