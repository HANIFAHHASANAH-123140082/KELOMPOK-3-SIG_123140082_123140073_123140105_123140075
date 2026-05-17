# WebGIS Perparkiran Kecamatan Ratu Agung - Backend

Repository ini berisi kode sumber backend menggunakan **FastAPI** dan **PostGIS** untuk melayani data spasial perparkiran di wilayah Kecamatan Ratu Agung, Kota Bengkulu.

## Fitur Utama
* Manajemen data spasial titik parkir (Latitude & Longitude).
* Integrasi basis data relasional spasial dengan PostgreSQL & PostGIS.
* Dokumentasi API otomatis menggunakan Swagger UI (`/docs`).

## Cara Menjalankan di Lokal
1. Aktifkan virtual environment.
2. Install library: `pip install -r requirements.txt`
3. Jalankan server: `uvicorn app.main:app --reload`