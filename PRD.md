# Product Requirements Document (PRD)
## Sistem Manajemen Buku Tamu Digital (e-Guestbook WebApp)

---

## 1. Ringkasan Produk & Peran Pengguna

**Nama Produk:** Sistem Manajemen Buku Tamu Digital (e-Guestbook WebApp)

**Platform:** Aplikasi Web Responsif (Tablet Kiosk Lobi, Mobile Browser via QR, & Desktop Admin)

**Standar Desain UI:** Komponen berbasis React, Tailwind CSS, dan `shadcn/ui` (Referensi: **21st.dev / Origin UI**)

**Metode Bukti Kunjungan:** 100% Tanda Tangan Goresan Langsung (*Direct Digital Signature Canvas*) tanpa penggunaan kamera/foto.

**Tujuan & Konsep Utama Sistem**
Aplikasi ini menggantikan buku tamu fisik dengan sistem pencatatan digital terpusat yang mengutamakan kecepatan, kenyamanan privasi pengunjung, dan kemudahan rekapitulasi. Dengan meniadakan fitur pengambilan foto kamera dan memfokuskan bukti kehadiran pada **tanda tangan digital yang digoreskan langsung di layar perangkat**, sistem terbebas dari kendala teknis pemblokiran izin kamera *browser* (*camera permission error*), menghemat ruang penyimpanan *server*, serta menjaga kenyamanan tamu saat melakukan registrasi.

**Peran Pengguna (User Roles)**

* **Tamu / Pengunjung (Antarmuka Publik):** Mengakses halaman sambutan dan formulir registrasi mandiri (*self check-in*) melalui tablet kiosk di meja resepsionis atau memindai QR Code dari ponsel pribadi, lalu membubuhkan tanda tangan langsung di layar.
* **Resepsionis / Petugas Jaga (Operator Dasbor):** Memantau daftar tamu yang masuk secara *real-time*, memverifikasi keabsahan data dan tanda tangan tamu, serta memperbarui status kepulangan tamu (*check-out*).
* **Administrator (Dasbor Admin & CMS):** Mengelola data master (daftar divisi/tujuan, akun operator), mengubah konten tampilan publik (logo, teks sambutan, pengumuman), memantau grafik analitik kunjungan, dan mengunduh laporan resmi berisikan bukti tanda tangan tamu.

---

## 2. Spesifikasi Fitur & Pemetaan Komponen UI

| Modul Sistem | Nama Fitur | Deskripsi Fungsional | Referensi Komponen (`21st.dev`) | Prioritas |
| --- | --- | --- | --- | --- |
| **Antarmuka Publik (Tamu)** | **Halaman Sambutan & QR Lobi** | Layar utama yang menampilkan identitas instansi, pesan sambutan dinamis, tombol aksi besar **"Isi Buku Tamu"**, serta kode QR statis untuk akses via ponsel tamu. | `Heroes` (*Minimal Hero*) & `Backgrounds` (*Dot/Grid Pattern*) | *Must-Have* |
| **Antarmuka Publik (Tamu)** | **Formulir Registrasi Tamu** | Input data terstruktur meliputi: Nama Lengkap, Instansi/Asal, Nomor WhatsApp/HP, Divisi/Pihak yang Ditemui, Jumlah Tamu, dan Keperluan Kunjungan. | **Origin UI** `Inputs`, `Select` / `Combobox`, & `Textarea` | *Must-Have* |
| **Antarmuka Publik (Tamu)** | **Kanvas Tanda Tangan Digital** | Kotak kanvas interaktif di bagian bawah formulir tempat tamu menggoreskan tanda tangan menggunakan jari, *stylus*, atau *mouse*. Dilengkapi tombol **"Ulangi Tanda Tangan"** (*Clear*) dan validasi wajib isi. | `react-signature-canvas` + Kerangka `Card` bergaris putus-putus (`border-dashed`) | *Must-Have* |
| **Antarmuka Publik (Tamu)** | **Tiket Kunjungan Digital** | Kartu bukti *check-in* yang tampil otomatis setelah formulir dikirim, memuat Kode Kunjungan unik, waktu masuk, ringkasan data, dan pratinjau tanda tangan. | `Cards` (*Ticket/Badge Card*) & Status `Badge` | *Should-Have* |
| **Dasbor Admin & Operator** | **Tabel Pantauan Tamu Real-Time** | Tabel interaktif yang menampilkan daftar tamu harian lengkap dengan indikator status (*Sedang Berkunjung* / *Selesai*), waktu masuk-keluar, dan **kolom pratinjau gambar tanda tangan**. | **Origin UI** `Data Table` (*TanStack Table*) + `Dialog/Modal` (Zoom Tanda Tangan) | *Must-Have* |
| **Dasbor Admin & Operator** | **Aksi Cepat Check-Out & Filter** | Fitur pencarian instan berdasarkan nama/instansi, filter rentang tanggal dan divisi tujuan, serta tombol aksi satu klik untuk mengubah status tamu menjadi *Checked-Out*. | `Search Input`, `Date Range Picker`, & `Action Buttons` | *Must-Have* |
| **Dasbor Admin & Operator** | **Analitik & Ekspor Laporan Resmi** | Kartu metrik ringkasan (Total Tamu Hari Ini, Tamu Aktif, Tamu Selesai), grafik tren kunjungan, serta ekspor laporan ke **PDF** dan **Excel (.xlsx)** yang menyertakan kolom gambar tanda tangan tamu. | `Stat Cards` (*KPI Tiles*) & `Area/Bar Chart` | *Must-Have* |
| **Manajemen Konten (CMS)** | **Pengaturan Halaman Publik & Master Data** | Panel bagi Admin untuk memperbarui nama/logo instansi, teks sambutan di halaman depan, mengaktifkan/menonaktifkan daftar divisi tujuan, serta mengelola akun operator. | `Tabs`, `Settings Form`, & `Switch/Toggle` | *Should-Have* |

---

## 3. Alur Pengguna, Spesifikasi Kanvas, & Skema Database

### Alur Utama Sistem (End-to-End User Flow)

1. **Akses Halaman Publik:** Tamu menekan tombol **"Isi Buku Tamu"** di layar kiosk lobi atau memindai QR Code menggunakan ponsel.
2. **Pengisian Identitas & Tujuan:** Tamu mengisi kolom identitas diri, memilih divisi yang dituju, dan menuliskan keperluan kunjungan.
3. **Pembubuhan Tanda Tangan:** Tamu menggoreskan tanda tangan langsung pada kotak kanvas digital. Jika terjadi kesalahan goresan, tamu dapat menekan tombol **Ulangi Tanda Tangan** sebelum mengirim.
4. **Pemrosesan & Bukti Masuk:** Sistem memvalidasi bahwa kanvas tidak kosong, memotong ruang kosong di sekitar tanda tangan (*auto-trim*), mengonversinya menjadi format teks gambar ringan (`Base64 PNG`), menyimpannya ke database, dan menampilkan **Tiket Kunjungan Digital**.
5. **Verifikasi & Penyelesaian (Check-Out):** Data tamu beserta gambar tanda tangannya langsung tampil di **Tabel Dasbor Operator**. Saat tamu selesai berkunjung, petugas menekan tombol **Check-Out** pada baris nama tamu tersebut untuk mencatat waktu keluar.

### Spesifikasi Teknis Kanvas Tanda Tangan (Signature Pad Specs)

* **Pencegahan Pergeseran Layar (*Scroll Locking*):** Elemen `<canvas>` wajib menerapkan properti CSS `touch-action: none` (`touch-none` pada Tailwind) agar layar *browser* tablet/ponsel tidak ikut bergeser ke atas atau ke bawah saat jari tamu sedang menggoreskan tanda tangan.
* **Pemotongan Otomatis (*Auto-Trimming*):** Goresan tanda tangan diekstrak menggunakan metode `.getTrimmedCanvas().toDataURL('image/png')` sehingga proporsi tanda tangan selalu berada tepat di tengah saat ditampilkan di tabel admin maupun saat dicetak ke laporan PDF.
* **Efisiensi Ukuran Data:** Gambar berlatar belakang transparan dengan warna tinta gelap (`#18181b`), menghasilkan ukuran data rata-rata hanya **5 KB – 15 KB per tanda tangan**, sehingga dapat disimpan langsung sebagai kolom `TEXT` di database tanpa membebani ruang penyimpanan *file server*.

### Rancangan Skema Entitas Database (Data Model)

* **Tabel `users` (Akun Admin & Operator)**
  * `id` (PK, UUID / BigInt)
  * `name` (VARCHAR) — Nama petugas/admin
  * `email` (VARCHAR, Unique) — Email login
  * `password_hash` (VARCHAR) — Kata sandi terenkripsi
  * `role` (ENUM: `'admin'`, `'operator'`) — Hak akses pengguna
  * `is_active` (BOOLEAN) — Status aktif akun
  * `created_at` & `updated_at` (TIMESTAMP)

* **Tabel `divisions` (Data Master Divisi / Tujuan)**
  * `id` (PK, UUID / BigInt)
  * `division_name` (VARCHAR) — Nama divisi atau pejabat tujuan
  * `pic_name` (VARCHAR, Nullable) — Nama penanggung jawab ruangan/divisi
  * `room_location` (VARCHAR, Nullable) — Informasi lantai/ruangan
  * `is_active` (BOOLEAN) — Menentukan apakah divisi tampil di *dropdown* form publik

* **Tabel `visits` (Transaksi Buku Tamu & Bukti Tanda Tangan)**
  * `id` (PK, UUID / BigInt)
  * `ticket_code` (VARCHAR, Unique) — Kode unik kunjungan (contoh: `VST-849201`)
  * `visitor_name` (VARCHAR) — Nama lengkap tamu
  * `institution` (VARCHAR) — Instansi / perusahaan / asal tamu
  * `phone_number` (VARCHAR) — Nomor kontak WhatsApp/telepon
  * `division_id` (FK -> `divisions.id`) — Relasi ke divisi yang dikunjungi
  * `visitor_count` (INTEGER, Default: `1`) — Jumlah orang dalam rombongan
  * `purpose` (TEXT) — Rincian keperluan kunjungan
  * `signature_base64` (TEXT, Not Null) — Data gambar tanda tangan digital (`data:image/png;base64,...`)
  * `status` (ENUM: `'checked_in'`, `'checked_out'`) — Status kunjungan saat ini
  * `check_in_time` (TIMESTAMP) — Waktu registrasi masuk
  * `check_out_time` (TIMESTAMP, Nullable) — Waktu keluar lokasi
  * `checked_out_by` (FK -> `users.id`, Nullable) — Petugas yang memproses *check-out*

* **Tabel `site_settings` (Manajemen Konten Antarmuka Publik / CMS)**
  * `id` (PK, Integer)
  * `organization_name` (VARCHAR) — Nama instansi pada header aplikasi
  * `welcome_title` (VARCHAR) — Judul sambutan di halaman publik
  * `welcome_subtitle` (TEXT) — Teks panduan singkat bagi tamu baru
  * `logo_url` (VARCHAR, Nullable) — Path gambar logo instansi
  * `announcement_text` (TEXT, Nullable) — Pengumuman berjalan atau info operasional lobi
  * `updated_at` (TIMESTAMP)

---

## 4. Kebutuhan Non-Fungsional & Kriteria Penerimaan

**Kebutuhan Non-Fungsional (Non-Functional Requirements)**

* **Privasi & Keamanan Akses:** Pengunjung pada antarmuka publik hanya dapat melihat formulir input dan tiket miliknya sendiri; daftar riwayat tamu yang sudah masuk bersifat tertutup dan hanya dapat diakses melalui Dasbor Admin/Operator yang dilindungi autentikasi *login* (JWT / Session).
* **Kompatibilitas Perangkat Tanpa Izin Khusus:** Karena sistem tidak meminta akses perangkat keras (seperti kamera atau mikrofon), formulir wajib berjalan lancar di seluruh *browser* modern (Chrome, Safari iOS, Edge, Firefox) baik melalui jaringan lokal maupun internet publik.
* **Keterpakatan Layar Sentuh (*Touch Ergonomics*):** Seluruh tombol input dan area kanvas tanda tangan memiliki ukuran target sentuh minimal **48px** dengan kontras warna tegas agar mudah dioperasikan oleh tamu dari berbagai kelompok usia.

**Kriteria Penerimaan Sistem (Acceptance Criteria)**

1. Formulir menolak pengiriman data (`Submit`) dan menampilkan pesan peringatan yang jelas apabila tamu sudah mengisi biodata tetapi **belum menggoreskan tanda tangan** pada kanvas.
2. Tombol **"Ulangi Tanda Tangan"** dapat membersihkan kanvas seketika tanpa menghapus isian teks (Nama, Instansi, Nomor HP) yang sudah diketik oleh tamu di kolom atasnya.
3. Goresan tanda tangan yang dikirim oleh tamu langsung tampil sebagai gambar pratinjau yang rapi dan proporsional di dalam kolom **Bukti Tanda Tangan** pada Tabel Dasbor Admin.
4. Dokumen laporan kunjungan yang diekspor ke format **PDF** menampilkan tabel rekapitulasi yang memuat kolom gambar tanda tangan asli dari masing-masing tamu layaknya buku tamu fisik resmi.
