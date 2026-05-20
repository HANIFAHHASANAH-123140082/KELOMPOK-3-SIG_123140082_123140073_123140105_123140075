# WebGIS Sistem Informasi Parkir Publik
## Kecamatan Ratu Agung, Kota Bengkulu

![Status](https://img.shields.io/badge/Status-Active-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

Proyek Akhir Mata Kuliah Sistem Informasi Geografis  
Institut Teknologi Sumatera — Semester Genap 2025/2026

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

Aplikasi WebGIS full-stack untuk menampilkan, mengelola, dan menganalisis lokasi parkir publik di Kecamatan Ratu Agung, Kota Bengkulu. Sistem ini membantu pengemudi menemukan lokasi parkir terdekat secara cepat melalui peta interaktif berbasis web.

---

## Fitur Utama

- **Peta Interaktif** — Menampilkan 20+ lokasi parkir di atas basemap OpenStreetMap
- **Marker Dinamis** — Warna marker otomatis berubah sesuai status buka/tutup berdasarkan jam operasional
- **Pencarian** — Cari lokasi parkir berdasarkan nama atau alamat
- **Filter Kendaraan** — Filter berdasarkan jenis kendaraan (Mobil / Motor)
- **Parkir Terdekat** — Mencari parkir terdekat dari posisi pengguna menggunakan `ST_Distance`
- **Filter Radius** — Menampilkan parkir dalam radius tertentu menggunakan `ST_DWithin`
- **Popup Detail** — Klik marker untuk melihat detail: nama, alamat, kapasitas, jam operasional, tarif
- **Admin Dashboard** — Kelola data parkir (tambah, edit, hapus) dengan autentikasi

---

## Tech Stack

| Komponen | Teknologi | Fungsi |
|---|---|---|
| Database | PostgreSQL + PostGIS | Penyimpanan data spasial |
| Backend | FastAPI (Python) | REST API & query spasial |
| Frontend | ReactJS + Leaflet.js | Antarmuka peta interaktif |
| Styling | TailwindCSS | Tampilan UI |
| Auth | JWT (localStorage) | Keamanan admin |
| Deployment | Railway + Vercel | Hosting backend & frontend |

---

## Struktur Database

Terdiri dari **3 tabel** dengan **2 tipe geometri** berbeda:
kecamatan        — batas wilayah administratif (GEOMETRY Polygon)
parkir           — lokasi titik parkir (GEOMETRY Point)
tarif            — skema tarif per jenis kendaraan (relasi ke parkir)
- Spatial Index: GiST pada kolom `koordinat` dan `batas_wilayah`
- SRID: EPSG:4326
- Sample data: 20 record lokasi parkir

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
- PostgreSQL 15+ dengan ekstensi PostGIS
- Python 3.11+
- Node.js 18+

### 1. Clone Repository
```bash
git clone https://github.com/HANIFAHHASANAH-123140082/KELOMPOK-3-SIG_123140082_123140073_123140105_123140075.git
cd KELOMPOK-3-SIG_123140082_123140073_123140105_123140075
```

### 2. Setup Database
```bash
# Buat database di PostgreSQL
psql -U postgres -c "CREATE DATABASE webgis_parkir;"
psql -U postgres -d webgis_parkir -c "CREATE EXTENSION postgis;"

# Jalankan schema dan data
psql -U postgres -d webgis_parkir -f database/schema.sql
psql -U postgres -d webgis_parkir -f database/seed.sql
```

### 3. Jalankan Backend
```bash
cd backend

# Buat file .env
cp .env.example .env
# Edit .env: ganti username, password, dan port sesuai PostgreSQL kamu
# Contoh: DATABASE_URL=postgresql://postgres:password@localhost:5433/webgis_parkir

# Install dependencies
pip install -r requirements.txt

# Jalankan server
python -m uvicorn app.main:app --reload
```
Backend berjalan di: http://localhost:8000  
Swagger UI: http://localhost:8000/docs

### 4. Jalankan Frontend
```bash
# Buka terminal baru (jangan tutup terminal backend)
cd frontend

npm install
npm start
```
Aplikasi berjalan di: http://localhost:3000

---

## Struktur Folder
KELOMPOK-3-SIG/
│
├── database/
│   ├── schema.sql          # DDL: CREATE TABLE, spatial index
│   └── seed.sql            # Data sample 20 lokasi parkir
│
├── backend/
│   ├── app/
│   │   ├── main.py         # Entry point FastAPI + CORS
│   │   ├── database.py     # Koneksi PostgreSQL
│   │   ├── models.py       # SQLAlchemy models (ORM)
│   │   ├── schemas.py      # Pydantic schemas (validasi)
│   │   ├── crud.py         # Fungsi database + query spasial
│   │   └── api/
│   │       └── endpoints.py # Semua route API
│   ├── .env.example        # Template konfigurasi
│   └── requirements.txt    # Dependencies Python
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.js    # Halaman utama
│       │   ├── MapPage.js        # Peta interaktif (konek API)
│       │   ├── AdminLogin.js     # Login admin
│       │   └── AdminDashboard.js # CRUD data parkir
│       └── components/
│           └── LoadingScreen.js
│
├── PROPOSAL KELOMPOK 3_...pdf
└── README.md

---

## Akses Admin

Untuk mengakses Admin Dashboard:
1. Buka `http://localhost:3000/login`
2. Gunakan kredensial yang sudah dikonfigurasi
3. Setelah login, akses dashboard di `/admin`

---

## Referensi

- [PostGIS Documentation](https://postgis.net/documentation/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Leaflet](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- BPS Kota Bengkulu. (2024). Kecamatan Ratu Agung Dalam Angka 2024
- Perda Kota Bengkulu No. 1 Tahun 2024 tentang Pajak dan Retribusi Daerah