# WebGIS Sistem Informasi Parkir Publik
## Kecamatan Ratu Agung, Kota Bengkulu

![Status](https://img.shields.io/badge/Status-Active-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

Proyek Akhir Mata Kuliah Sistem Informasi Geografis  
Institut Teknologi Sumatera — Semester Genap 2025/2026

## Video Demo WebGIS Parkir Publik Kelompok 3 

[![Demo WebGIS Parkir Publik](https://img.youtube.com/vi/7m854Ia5LFg/maxresdefault.jpg)](https://www.youtube.com/watch?v=7m854Ia5LFg)

---

## Anggota Kelompok 3

| Nama | NIM | Peran |
|---|---|---|
| Hanifah Hasanah | 123140082 | Ketua, Perancang Sistem & Dokumentasi |
| Afifa Aulia | 123140073 | Backend Developer |
| Ariq Ramadhinov Ronny | 123140105 | Database Engineer |
| M. Farhan Muzakhi | 123140075 | Frontend Developer |

**Dosen Pengampu:**
- Muhammad Habib Algifari, S.Kom., M.T.I.
- Alya Khairunnisa Rizkita, S.Kom., M.Kom.

---

## Deskripsi Proyek

Aplikasi WebGIS ini menyediakan peta interaktif titik-titik parkir publik di Kecamatan Ratu Agung, Bengkulu. Pengguna umum dapat melihat lokasi parkir, kapasitas, dan status operasional secara real-time. Admin dapat mengelola data parkir melalui portal admin yang dilengkapi fitur CRUD, statistik, dan visualisasi peta.

---

## Fitur Utama

### Halaman Publik
- **Landing Page** — Tampilan awal dengan informasi aplikasi
- **Peta Interaktif** — Visualisasi titik parkir menggunakan Leaflet.js dengan marker dan popup detail

### Portal Admin
- **Dashboard** — Ringkasan statistik: total lokasi, persentase buka, kapasitas mobil & motor, activity log
- **Kelola Parkir (CRUD)** — Tambah, edit, hapus data lokasi parkir dengan:
  - Form validasi koordinat khusus wilayah Bengkulu
  - Mini-map interaktif di form (klik peta untuk isi koordinat otomatis)
  - Pencarian & filter lokasi
  - Pagination data
  - Export data ke CSV (dengan encoding UTF-8 BOM untuk Excel)
- **Statistik** — Visualisasi data dengan:
  - Donut chart distribusi jenis lahan
  - Grouped bar chart perbandingan kapasitas mobil vs motor (Top 5)
  - Tabel detail kapasitas dengan progress bar proporsi
- **Peta Admin** — Peta lengkap semua titik parkir dengan panel daftar lokasi
- **Sidebar Dinamis** — Badge notifikasi lokasi tutup, nama admin, jam & tanggal real-time

---

## Tech Stack

### Frontend
| Teknologi | Fungsi |
|-----------|--------|
| React.js | Framework UI |
| React Router DOM | Routing halaman |
| Leaflet.js | Peta interaktif |
| Recharts | Grafik & chart |
| Axios | HTTP client ke API |
| Lucide React | Ikon UI |
| Framer Motion | Animasi |
| Tailwind CSS | Utility CSS |

### Backend
| Teknologi | Fungsi |
|-----------|--------|
| FastAPI (Python) | REST API framework |
| SQLAlchemy | ORM database |
| GeoAlchemy2 | Ekstensi spasial SQLAlchemy |
| Pydantic | Validasi data |
| Uvicorn | ASGI server |
| python-dotenv | Manajemen environment variable |

### Database
| Teknologi | Fungsi |
|-----------|--------|
| PostgreSQL | Database utama |
| PostGIS | Ekstensi data spasial |

---

## Struktur Database

Terdiri dari **3 tabel** dengan **2 tipe geometri** berbeda:
kecamatan        — batas wilayah administratif (GEOMETRY Polygon)
parkir           — lokasi titik parkir (GEOMETRY Point)
tarif            — skema tarif per jenis kendaraan (relasi ke parkir)
- Spatial Index: GiST pada kolom `koordinat` dan `batas_wilayah`
- SRID: EPSG:4326
- Sample data: 20 record lokasi parkir
  
### Fitur Spasial Database

Implementasi PostGIS pada sistem ini memanfaatkan:

- ST_Distance untuk menghitung jarak lokasi parkir terdekat.
- ST_DWithin untuk pencarian lokasi parkir dalam radius tertentu.
- Spatial Index GiST untuk meningkatkan performa query spasial.

---

## API Endpoints

| Method | Endpoint | Tipe | Deskripsi |
|---|---|---|---|
| GET | `/api/parkir` | CRUD | Ambil semua data parkir |
| GET | `/api/parkir/{id}` | CRUD | Ambil detail satu parkir |
| POST | `/api/parkir` | CRUD | Tambah data parkir baru |
| PUT | `/api/parkir/{id}` | CRUD | Update data parkir |
| DELETE | `/api/parkir/{id}` | CRUD | Hapus data parkir |
| GET | `/api/parkir/terdekat` | **Spasial** | Parkir terdekat (ST_Distance) |
| GET | `/api/parkir/dalam-radius` | **Spasial** | Parkir dalam radius (ST_DWithin) |
| GET | `/api/tarif/{parkir_id}` | CRUD | Ambil tarif berdasarkan parkir |
| POST | `/api/tarif/{parkir_id}` | CRUD | Tambah tarif |
| GET | `/api/kecamatan` | CRUD | Data batas wilayah kecamatan |

Dokumentasi lengkap: `http://localhost:8000/docs` (Swagger UI)

---

## Cara Menjalankan

### Prasyarat
- Node.js >= 16
- Python >= 3.9
- PostgreSQL >= 13 + ekstensi PostGIS
- Git

---

### 1. Clone Repository

```bash
git clone https://github.com/<username>/KELOMPOK-3-SIG_123140082_123140073_123140105_123140075.git
cd KELOMPOK-3-SIG_123140082_123140073_123140105_123140075
```

---

### 2. Setup Backend

```bash
cd backend
```

Buat virtual environment dan install dependensi:

```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

pip install -r requirements.txt
```

Buat file `.env` di folder `backend/`:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5433/webgis_parkir
```

Pastikan database PostgreSQL + PostGIS sudah berjalan, lalu buat database:

```sql
CREATE DATABASE webgis_parkir;
\c webgis_parkir
CREATE EXTENSION postgis;
```

Jalankan backend:

```bash
uvicorn main:app --reload --port 8000
```

Backend berjalan di: `http://localhost:8000`  
Dokumentasi API: `http://localhost:8000/docs`

---

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start
```

Frontend berjalan di: `http://localhost:3000`

---

## Struktur Folder

```
KELOMPOK-3-SIG/
├── frontend/                     # Aplikasi React
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   └── src/
│       ├── components/
│       │   ├── LoadingScreen.js  # Komponen loading
│       │   └── MapPortal.js      # Portal peta
│       ├── data/
│       │   └── parkingData.js    # Data statis parkir
│       ├── pages/
│       │   ├── LandingPage.js    # Halaman awal
│       │   ├── HomePage.js       # Halaman beranda
│       │   ├── MapPage.js        # Peta publik
│       │   ├── LoginPage.js      # Login pengguna
│       │   ├── AdminLogin.js     # Login admin
│       │   ├── AdminDashboard.js # Portal admin (CRUD, statistik, peta)
│       │   └── NotFoundPage.js   # Halaman 404
│       ├── App.js                # Root component & routing
│       └── index.js              # Entry point
│
└── backend/                      # Aplikasi FastAPI
    ├── app/
    │   ├── api/
    │   │   └── endpoints.py      # Route API
    │   ├── models.py             # Model database
    │   ├── database.py           # Koneksi database
    │   └── schemas.py            # Schema Pydantic
    ├── main.py                   # Entry point FastAPI
    ├── requirements.txt          # Dependensi Python
    └── .env                      # Konfigurasi environment
```

## Akses Admin

| URL | Keterangan |
|-----|------------|
| `http://localhost:3000` | Halaman publik |
| `http://localhost:3000/admin` | Halaman login admin |

Kredensial default admin dapat disesuaikan di file konfigurasi backend.

---

## Model Data Parkir

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | Integer | Primary key |
| `nama` | String | Nama lokasi parkir |
| `alamat` | String | Alamat lengkap |
| `jenis_lahan` | String | `terbuka` / `gedung` / `kanopi` |
| `kapasitas_mobil` | Integer | Jumlah slot mobil |
| `kapasitas_motor` | Integer | Jumlah slot motor |
| `jam_buka` | Time | Jam operasional buka |
| `jam_tutup` | Time | Jam operasional tutup |
| `latitude` | Float | Koordinat lintang |
| `longitude` | Float | Koordinat bujur |

> Koordinat valid untuk wilayah Bengkulu: Latitude `-4.2` s/d `-3.5`, Longitude `101.9` s/d `102.6`

---

## Tampilan Aplikasi

| Halaman | Deskripsi |
|---------|-----------|
| Landing Page | Halaman sambutan dengan informasi aplikasi |
| Peta Publik | Peta interaktif Leaflet dengan marker lokasi parkir |
| Admin Dashboard | Ringkasan statistik dan activity log |
| Kelola Parkir | Tabel CRUD dengan mini-map koordinat |
| Statistik | Donut chart dan grouped bar chart |
| Peta Admin | Visualisasi spasial seluruh titik parkir |

### Landing Page

Halaman utama aplikasi WebGIS Parkir Publik Kecamatan Ratu Agung.

![Landing Page](frontend/ss1.png)

---

### Peta Interaktif

Menampilkan persebaran lokasi parkir pada peta digital berbasis Leaflet.

![Peta Interaktif](frontend/ss2.png)

---

### Detail Lokasi Parkir

Informasi detail lokasi parkir yang dipilih pengguna.

![Detail Lokasi Parkir](frontend/ss3.png)

---

### Login Admin

Halaman autentikasi administrator sistem.

![Login Admin](frontend/ss4.png)

---

### Dashboard Admin

Dashboard untuk memantau statistik dan mengelola data parkir.

![Dashboard Admin](frontend/ss6.png)

---

### Form Tambah Lokasi Parkir

Form untuk menambahkan data lokasi parkir baru ke dalam sistem.

![Form Tambah Lokasi Parkir](frontend/ss5.png)

---

## Referensi

- [PostGIS Documentation](https://postgis.net/documentation/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Leaflet](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- BPS Kota Bengkulu. (2024). Kecamatan Ratu Agung Dalam Angka 2024
- Perda Kota Bengkulu No. 1 Tahun 2024 tentang Pajak dan Retribusi Daerah
