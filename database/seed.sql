-- ============================================
-- Data Sample Kecamatan Ratu Agung
-- ============================================
INSERT INTO kecamatan (nama_kecamatan, batas_wilayah) VALUES (
    'Ratu Agung',
    ST_SetSRID(ST_GeomFromText('POLYGON((
        102.255 -3.780,
        102.285 -3.780,
        102.285 -3.810,
        102.255 -3.810,
        102.255 -3.780
    ))'), 4326)
);

-- ============================================
-- Data Sample Lokasi Parkir (20 record)
-- ============================================
INSERT INTO parkir (nama, alamat, koordinat, jenis_lahan, kapasitas_mobil, kapasitas_motor, jam_buka, jam_tutup) VALUES
('Parkir Pasar Panorama',       'Jl. S. Parman, Ratu Agung',        ST_SetSRID(ST_MakePoint(102.2650, -3.7950), 4326), 'terbuka', 30, 80,  '06:00', '21:00'),
('Parkir Mall Bengkulu Indah',  'Jl. Ahmad Yani, Ratu Agung',       ST_SetSRID(ST_MakePoint(102.2680, -3.7980), 4326), 'gedung',  100, 200, '09:00', '22:00'),
('Parkir RSUD M. Yunus',        'Jl. Dr. M. Hatta, Ratu Agung',     ST_SetSRID(ST_MakePoint(102.2700, -3.8010), 4326), 'terbuka', 50, 100, '00:00', '23:59'),
('Parkir Kantor Walikota',      'Jl. Sudirman, Ratu Agung',         ST_SetSRID(ST_MakePoint(102.2630, -3.7920), 4326), 'terbuka', 40, 60,  '07:00', '17:00'),
('Parkir Plaza Bengkulu',       'Jl. Hibrida Raya, Ratu Agung',     ST_SetSRID(ST_MakePoint(102.2720, -3.7960), 4326), 'gedung',  80, 150, '09:00', '21:00'),
('Parkir Masjid Jamik',         'Jl. Soeprapto, Ratu Agung',        ST_SetSRID(ST_MakePoint(102.2610, -3.7900), 4326), 'terbuka', 20, 50,  '05:00', '22:00'),
('Parkir Lapangan Merdeka',     'Jl. Pembangunan, Ratu Agung',      ST_SetSRID(ST_MakePoint(102.2640, -3.7870), 4326), 'terbuka', 35, 70,  '07:00', '20:00'),
('Parkir Bank BRI Sudirman',    'Jl. Sudirman No.1, Ratu Agung',    ST_SetSRID(ST_MakePoint(102.2625, -3.7940), 4326), 'terbuka', 15, 30,  '08:00', '17:00'),
('Parkir Hotel Nala',           'Jl. Pariwisata, Ratu Agung',       ST_SetSRID(ST_MakePoint(102.2690, -3.7930), 4326), 'gedung',  60, 80,  '00:00', '23:59'),
('Parkir Ramayana',             'Jl. S. Parman, Ratu Agung',        ST_SetSRID(ST_MakePoint(102.2655, -3.7970), 4326), 'gedung',  70, 120, '09:00', '21:00'),
('Parkir Samsat Bengkulu',      'Jl. Adam Malik, Ratu Agung',       ST_SetSRID(ST_MakePoint(102.2710, -3.8020), 4326), 'terbuka', 40, 80,  '07:30', '16:00'),
('Parkir Kantor Pos',           'Jl. Soeprapto, Ratu Agung',        ST_SetSRID(ST_MakePoint(102.2605, -3.7910), 4326), 'terbuka', 10, 25,  '08:00', '17:00'),
('Parkir Stasiun TVRI',         'Jl. Jend. Sudirman, Ratu Agung',   ST_SetSRID(ST_MakePoint(102.2635, -3.7895), 4326), 'terbuka', 25, 45,  '07:00', '18:00'),
('Parkir BNI 46 Bengkulu',      'Jl. Soeprapto No.14, Ratu Agung',  ST_SetSRID(ST_MakePoint(102.2615, -3.7925), 4326), 'terbuka', 12, 20,  '08:00', '16:00'),
('Parkir Mandiri Sudirman',     'Jl. Sudirman No.5, Ratu Agung',    ST_SetSRID(ST_MakePoint(102.2628, -3.7935), 4326), 'terbuka', 15, 25,  '08:00', '17:00'),
('Parkir Gramedia Bengkulu',    'Jl. Ahmad Yani, Ratu Agung',       ST_SetSRID(ST_MakePoint(102.2675, -3.7985), 4326), 'terbuka', 20, 40,  '09:00', '21:00'),
('Parkir Gedung Dinas PU',      'Jl. Pembangunan, Ratu Agung',      ST_SetSRID(ST_MakePoint(102.2645, -3.7880), 4326), 'terbuka', 30, 50,  '07:00', '17:00'),
('Parkir Taman Remaja',         'Jl. Hibrida, Ratu Agung',          ST_SetSRID(ST_MakePoint(102.2715, -3.7950), 4326), 'terbuka', 25, 60,  '08:00', '22:00'),
('Parkir Polresta Bengkulu',    'Jl. Ahmad Yani, Ratu Agung',       ST_SetSRID(ST_MakePoint(102.2685, -3.7975), 4326), 'terbuka', 45, 90,  '00:00', '23:59'),
('Parkir Gedung Juang',         'Jl. Soeprapto, Ratu Agung',        ST_SetSRID(ST_MakePoint(102.2608, -3.7918), 4326), 'terbuka', 18, 35,  '07:00', '20:00');


-- ============================================
-- Data Sample Tarif
-- ============================================
INSERT INTO tarif (parkir_id, jenis_kendaraan, tarif_jam_pertama, tarif_jam_berikutnya) VALUES
(1,  'mobil', 5000, 3000), (1,  'motor', 2000, 1000),
(2,  'mobil', 5000, 3000), (2,  'motor', 2000, 1000),
(3,  'mobil', 3000, 2000), (3,  'motor', 2000, 1000),
(4,  'mobil', 3000, 2000), (4,  'motor', 1000, 1000),
(5,  'mobil', 5000, 3000), (5,  'motor', 2000, 1000),
(6,  'mobil', 3000, 2000), (6,  'motor', 1000, 1000),
(7,  'mobil', 3000, 2000), (7,  'motor', 2000, 1000),
(8,  'mobil', 3000, 2000), (8,  'motor', 1000, 1000),
(9,  'mobil', 7000, 5000), (9,  'motor', 3000, 2000),
(10, 'mobil', 5000, 3000), (10, 'motor', 2000, 1000),
(11, 'mobil', 3000, 2000), (11, 'motor', 1000, 1000),
(12, 'mobil', 3000, 2000), (12, 'motor', 1000, 1000),
(13, 'mobil', 3000, 2000), (13, 'motor', 1000, 1000),
(14, 'mobil', 3000, 2000), (14, 'motor', 1000, 1000),
(15, 'mobil', 3000, 2000), (15, 'motor', 1000, 1000),
(16, 'mobil', 5000, 3000), (16, 'motor', 2000, 1000),
(17, 'mobil', 3000, 2000), (17, 'motor', 1000, 1000),
(18, 'mobil', 3000, 2000), (18, 'motor', 2000, 1000),
(19, 'mobil', 3000, 2000), (19, 'motor', 1000, 1000),
(20, 'mobil', 3000, 2000), (20, 'motor', 1000, 1000);
