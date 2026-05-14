-- ============================================
-- WebGIS Parkir Publik - Kecamatan Ratu Agung
-- Schema Database
-- ============================================

-- Aktifkan ekstensi PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- TABEL 1: kecamatan
-- Menyimpan batas wilayah administratif
-- Tipe geometri: Polygon
-- ============================================
CREATE TABLE IF NOT EXISTS kecamatan (
    id SERIAL PRIMARY KEY,
    nama_kecamatan VARCHAR(100) NOT NULL,
    batas_wilayah GEOMETRY(Polygon, 4326)
);

-- Spatial index untuk kecamatan
CREATE INDEX idx_kecamatan_batas 
ON kecamatan USING GIST(batas_wilayah);


-- ============================================
-- TABEL 2: parkir
-- Tabel utama lokasi parkir
-- Tipe geometri: Point
-- ============================================
CREATE TABLE IF NOT EXISTS parkir (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    alamat TEXT,
    koordinat GEOMETRY(Point, 4326),
    jenis_lahan VARCHAR(50),      -- 'terbuka' atau 'gedung'
    kapasitas_mobil INTEGER DEFAULT 0,
    kapasitas_motor INTEGER DEFAULT 0,
    jam_buka TIME,
    jam_tutup TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index untuk parkir
CREATE INDEX idx_parkir_koordinat 
ON parkir USING GIST(koordinat);


-- ============================================
-- TABEL 3: tarif
-- Skema tarif per jenis kendaraan
-- Relasi one-to-many ke tabel parkir
-- ============================================
CREATE TABLE IF NOT EXISTS tarif (
    id SERIAL PRIMARY KEY,
    parkir_id INTEGER NOT NULL REFERENCES parkir(id) ON DELETE CASCADE,
    jenis_kendaraan VARCHAR(20) NOT NULL,   -- 'mobil' atau 'motor'
    tarif_jam_pertama INTEGER NOT NULL,      -- dalam rupiah
    tarif_jam_berikutnya INTEGER NOT NULL    -- dalam rupiah
);
