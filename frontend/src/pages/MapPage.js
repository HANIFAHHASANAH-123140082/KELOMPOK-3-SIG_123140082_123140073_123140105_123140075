import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Filter, MapPin, Clock, Car, Navigation, Menu, ChevronLeft } from "lucide-react";

const API = "http://localhost:8000/api";

// Kustomisasi scrollbar untuk sidebar agar tampilan lebih minimalis
const hideScrollbarStyle = `
  .sidebar-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .sidebar-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.35);
    border-radius: 99px;
  }
  .sidebar-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.6);
  }
  .sidebar-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, 0.35) transparent;
  }
`;

// Konfigurasi default icon Leaflet untuk menghindari error image asset tidak ditemukan
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Fungsi pembuat custom marker berbentuk pin lingkaran dinamis berdasarkan warna status
const createIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;background:${color};border:3px solid white;transform:rotate(-45deg);box-shadow:0 3px 12px rgba(0,0,0,0.35);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -22],
  });

// Komponen helper untuk efek animasi transisi peta (fly) dan otomatis membuka popup marker
const FlyAndOpen = ({ target, markerRefs }) => {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.latitude, target.longitude], 17, { duration: 1.2 });
    setTimeout(() => markerRefs.current[target.id]?.openPopup(), 1350);
  }, [target]);
  return null;
};

// Fungsi utilitas format string waktu dan mata uang rupiah
const formatJam = (jam) => { if (!jam) return "-"; return jam.substring(0, 5); };
const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

const MapPage = () => {
  // State utama penampung data dari backend dan filtering client-side
  const [parkirData, setParkirData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [selected, setSelected] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [terdekatMode, setTerdekatMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const markerRefs = useRef({});
  
  // State untuk melacak mode tampilan peta (Dark Mode / Light Mode)
  const [isDark, setIsDark] = useState(true);

  // State dan kontrol fitur pencarian berbasis jangkauan radius (Fitur 7)
  const [radiusMode, setRadiusMode] = useState(false);
  const [radiusValue, setRadiusValue] = useState(1000);

  // Logika jam digital real-time untuk komponen sidebar
  const [jamSekarang, setJamSekarang] = useState("");
  useEffect(() => {
    const updateJam = () => {
      const now = new Date();
      const jam = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const hari = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      setJamSekarang({ jam, hari });
    };
    updateJam();
    const interval = setInterval(updateJam, 1000);
    return () => clearInterval(interval);
  }, []);

  // Manajemen ulasan dan rating tempat parkir menggunakan LocalStorage (Fitur 20)
  const [ratings, setRatings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("parkir_ratings") || "{}"); } catch { return {}; }
  });
  
  const handleRating = (parkirId, bintang) => {
    const existing = ratings[parkirId] || { total: 0, count: 0 };
    const newRatings = {
      ...ratings,
      [parkirId]: { total: existing.total + bintang, count: existing.count + 1 }
    };
    setRatings(newRatings);
    localStorage.setItem("parkir_ratings", JSON.stringify(newRatings));
  };

  const getRating = (parkirId) => {
    const r = ratings[parkirId];
    if (!r || r.count === 0) return null;
    return { avg: (r.total / r.count).toFixed(1), count: r.count };
  };

  // Mengambil data titik koordinat parkir dari API backend saat inisialisasi awal
  useEffect(() => {
    axios.get(`${API}/parkir`)
      .then((res) => { setParkirData(res.data); setFiltered(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Handler sinkronisasi filter pencarian teks serta kategori jenis kendaraan
  useEffect(() => {
    if (radiusMode || terdekatMode) return;

    let result = parkirData;
    if (search) result = result.filter(p =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      (p.alamat && p.alamat.toLowerCase().includes(search.toLowerCase()))
    );
    if (filter === "Mobil") result = result.filter(p => p.kapasitas_mobil > 0);
    if (filter === "Motor") result = result.filter(p => p.kapasitas_motor > 0);
    setFiltered(result);
  }, [search, filter, parkirData, radiusMode, terdekatMode]);

  // Aksi ketika pengguna memilih salah satu item dari daftar sidebar
  const handleSelect = (item) => {
    setSelected(item);
    setFlyTarget({ ...item, _t: Date.now() });
  };

  // Mengambil data parkir terdekat memanfaatkan geolocation browser (HTML5 Geolocation)
  const handleCariTerdekat = () => {
    setRadiusMode(false); 
    if (!navigator.geolocation) {
      const lat = -3.7988, lng = 102.2614;
      axios.get(`${API}/parkir/terdekat?lat=${lat}&lng=${lng}&limit=5`)
        .then(res => { setFiltered(res.data); setTerdekatMode(true); });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        axios.get(`${API}/parkir/terdekat?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&limit=5`)
          .then(res => { setFiltered(res.data); setTerdekatMode(true); });
      },
      () => {
        const lat = -3.7988, lng = 102.2614;
        axios.get(`${API}/parkir/terdekat?lat=${lat}&lng=${lng}&limit=5`)
          .then(res => { setFiltered(res.data); setTerdekatMode(true); });
      }
    );
  };

  const handleResetTerdekat = () => { setFiltered(parkirData); setTerdekatMode(false); };

  // Query data ke backend berdasarkan batas radius meter tertentu (Fitur 7)
  const handleCariDalamRadius = () => {
    const lat = -3.7988;
    const lng = 102.2614;
    axios.get(`${API}/parkir/dalam-radius?lat=${lat}&lng=${lng}&radius=${radiusValue}`)
      .then(res => {
        setFiltered(res.data);
        setRadiusMode(true);
        setTerdekatMode(false); 
      });
  };

  // Menentukan warna penanda marker berdasarkan status jam operasional saat ini
  const getMarkerColor = (item) => {
    const now = new Date();
    const jam = now.getHours() * 60 + now.getMinutes();
    if (!item.jam_buka || !item.jam_tutup) return "#3b82f6";
    const [bH, bM] = item.jam_buka.split(":").map(Number);
    const [tH, tM] = item.jam_tutup.split(":").map(Number);
    return (jam >= bH * 60 + bM && jam <= tH * 60 + tM) ? "#22c55e" : "#ef4444";
  };

  const getStatusLabel = (item) => {
    const now = new Date();
    const jam = now.getHours() * 60 + now.getMinutes();
    if (!item.jam_buka || !item.jam_tutup) return "Buka";
    const [bH, bM] = item.jam_buka.split(":").map(Number);
    const [tH, tM] = item.jam_tutup.split(":").map(Number);
    return (jam >= bH * 60 + bM && jam <= tH * 60 + tM) ? "Buka" : "Tutup";
  };

  if (loading) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", color: "white", fontSize: 18 }}>
      Memuat data parkir...
    </div>
  );

  return (
    <>
      <style>{hideScrollbarStyle}</style>

      <div style={{ display: "flex", height: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: "hidden", position: "relative", backgroundColor: isDark ? "#0f172a" : "#f1f5f9" }}>

        {/* ==================== SIDEBAR UTAMA ==================== */}
        <div
          className="sidebar-scroll"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "min(380px, 92vw)",
            height: "100vh",
            backgroundColor: isDark ? "#0f172a" : "white",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: sidebarOpen ? "8px 0 40px rgba(0,0,0,0.5)" : "none",
          }}
        >
          {/* Section Informasi Judul & Panel Kembali */}
          <div style={{ padding: "20px 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#64748b", textDecoration: "none", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <ArrowLeft size={13} /> Kembali
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                title="Tutup sidebar"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36,
                  backgroundColor: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <ChevronLeft size={18} />
              </button>
            </div>
            <h2 style={{ color: "white", fontWeight: 900, fontSize: "1.2rem", margin: 0 }}>EKSPLORASI</h2>
            <h2 style={{ color: "#3b82f6", fontWeight: 900, fontSize: "1.2rem", margin: "2px 0 0", fontStyle: "italic" }}>TITIK PARKIR</h2>
            <p style={{ color: "#475569", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 4 }}>
              Kecamatan Ratu Agung Digital Map
            </p>
            
            {/* Widget penunjuk waktu digital real-time */}
            {jamSekarang && (
              <div style={{ marginTop: 10, backgroundColor: "#1e293b", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ color: "white", fontSize: 20, fontWeight: 900, letterSpacing: "0.05em", fontVariantNumeric: "tabular-nums" }}>
                  {jamSekarang.jam}
                </div>
                <div style={{ color: "#475569", fontSize: 10, fontWeight: 600, marginTop: 2 }}>
                  {jamSekarang.hari}
                </div>
              </div>
            )}
          </div>

          {/* Kolom Pencarian Input */}
          <div style={{ padding: "14px 16px 0" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 13, top: 12, color: "#475569" }} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setTerdekatMode(false); setRadiusMode(false); }}
                placeholder="Cari lokasi parkir..."
                style={{ width: "100%", padding: "11px 12px 11px 38px", backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Group Kontrol Filter dan Tombol Fitur Geospasial */}
          <div style={{ display: "flex", gap: 7, padding: "10px 16px", flexWrap: "wrap" }}>
            {["Semua", "Mobil", "Motor"].map((f) => (
              <button key={f} onClick={() => { setFilter(f); setTerdekatMode(false); setRadiusMode(false); }}
                style={{ padding: "6px 14px", borderRadius: 20, border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer", backgroundColor: filter === f && !terdekatMode && !radiusMode ? "#2563eb" : "#1e293b", color: filter === f && !terdekatMode && !radiusMode ? "white" : "#64748b", textTransform: "uppercase" }}>
                {f}
              </button>
            ))}
            <button onClick={terdekatMode ? handleResetTerdekat : handleCariTerdekat}
              style={{ padding: "6px 14px", borderRadius: 20, border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer", backgroundColor: terdekatMode ? "#22c55e" : "#1e293b", color: terdekatMode ? "white" : "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
              <Navigation size={11} /> {terdekatMode ? "Reset" : "Terdekat"}
            </button>

            <button onClick={radiusMode ? () => { setRadiusMode(false); setFiltered(parkirData); } : handleCariDalamRadius}  
              style={{ padding: "6px 14px", borderRadius: 20, border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer", backgroundColor: radiusMode ? "#8b5cf6" : "#1e293b", color: radiusMode ? "white" : "#64748b", display: "flex", alignItems: "center", gap: 4 }}>  
              🎯 {radiusMode ? "Reset" : "Radius"}
            </button>
          </div>

          {/* Ringkasan Data Statistik Kapasitas Lahan Parkir */}
          <div style={{ margin: "10px 16px", backgroundColor: "#1e293b", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ color: "#475569", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 10px" }}>STATISTIK WILAYAH</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Total Lokasi", val: parkirData.length, color: "#3b82f6" },
                { label: "Sedang Buka", val: parkirData.filter(p => getStatusLabel(p) === "Buka").length, color: "#22c55e" },
                { label: "Total Slot Mobil", val: parkirData.reduce((a, b) => a + (b.kapasitas_mobil || 0), 0), color: "#8b5cf6" },
                { label: "Total Slot Motor", val: parkirData.reduce((a, b) => a + (b.kapasitas_motor || 0), 0), color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ backgroundColor: "#0f172a", borderRadius: 8, padding: "8px 10px", borderLeft: `3px solid ${s.color}` }}>
                  <div style={{ color: "#475569", fontSize: 8, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{s.label}</div>
                  <div style={{ color: "white", fontSize: 16, fontWeight: 900 }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Kontrol Rentang Jarak Slider Radius */}
          {radiusMode && (
            <div style={{ margin: "4px 16px 8px", backgroundColor: "#1e293b", borderRadius: 12, padding: "12px 14px", border: "1px solid #8b5cf6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>🎯 Filter Radius</span>
                <span style={{ color: "white", fontSize: 13, fontWeight: 900 }}>{radiusValue} m</span>
              </div>
              <input
                type="range" min="200" max="3000" step="100"
                value={radiusValue}
                onChange={e => setRadiusValue(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#8b5cf6" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: "#475569", fontSize: 10 }}>200m</span>
                <span style={{ color: "#475569", fontSize: 10 }}>3000m</span>
              </div>
              <button onClick={handleCariDalamRadius}
                style={{ marginTop: 8, width: "100%", padding: "8px", borderRadius: 8, border: "none", backgroundColor: "#8b5cf6", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                Terapkan Radius {radiusValue}m
              </button>
            </div>
          )}

          {/* Indikator Total Data Hasil Filter */}
          <div style={{ padding: "0 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#3b82f6", boxShadow: "0 0 7px #3b82f6" }} />
              <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {terdekatMode ? `${filtered.length} Terdekat` : radiusMode ? `${filtered.length} Dalam Radius` : `${filtered.length} Lokasi`}
              </span>
            </div>
            <Filter size={13} color="#475569" />
          </div>

          {/* List Item Hasil Pencarian Tempat Parkir */}
          <div style={{ padding: "0 10px 32px" }}>
            {filtered.map((item) => (
              <div key={item.id} onClick={() => handleSelect(item)}
                style={{ backgroundColor: selected?.id === item.id ? "#1e3a5f" : "#1e293b", borderRadius: 14, marginBottom: 9, overflow: "hidden", cursor: "pointer", border: selected?.id === item.id ? "1px solid #3b82f6" : "1px solid transparent", transition: "all 0.2s" }}>
                <div style={{ padding: "12px 13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <h4 style={{ color: "white", fontWeight: 900, margin: 0, fontSize: 13, flex: 1, marginRight: 8 }}>{item.nama}</h4>
                    <span style={{ backgroundColor: getMarkerColor(item) + "30", color: getMarkerColor(item), padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>
                      {getStatusLabel(item)}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <MapPin size={10} color="#64748b" />
                    <p style={{ color: "#64748b", fontSize: 10, margin: 0 }}>{item.alamat}</p>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={10} color="#475569" />
                      <span style={{ color: "#475569", fontSize: 10 }}>{formatJam(item.jam_buka)} - {formatJam(item.jam_tutup)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Car size={10} color="#475569" />
                      <span style={{ color: "#475569", fontSize: 10 }}>Mobil: {item.kapasitas_mobil} | Motor: {item.kapasitas_motor}</span>
                    </div>
                  </div>
                  {item.jarak_meter && (
                    <div style={{ marginTop: 6, color: "#22c55e", fontSize: 10, fontWeight: 700 }}>
                      📍 {(item.jarak_meter / 1000).toFixed(2)} km dari lokasi kamu
                    </div>
                  )}
                  
                  {/* Tampilan akumulasi rating ulasan */}
                  {getRating(item.id) && (
                    <div style={{ marginTop: 4, color: "#f59e0b", fontSize: 10, fontWeight: 700 }}>
                      ⭐ {getRating(item.id).avg} ({getRating(item.id).count} ulasan)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== WORKSPACE PETA KANVAS ==================== */}
        <div style={{ flex: 1, position: "relative", width: "100%" }}>

          {/* Tombol pemicu buka kembali panel sidebar */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              title="Buka sidebar"
              style={{
                position: "absolute", top: 16, left: 16, zIndex: 998,
                width: 44, height: 44,
                backgroundColor: "rgba(15,23,42,0.92)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              <Menu size={20} />
            </button>
          )}

          {/* Tombol pengubah tema warna antarmuka (Dark/Light mode) */}
          <button
            onClick={() => setIsDark(!isDark)}
            style={{ position: "fixed", top: 16, right: 16, zIndex: 1001, backgroundColor: isDark ? "#1e293b" : "white", border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontSize: 16 }}>
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Kontainer Render Peta Leaflet */}
          <MapContainer center={[-3.7988, 102.2614]} zoom={15} style={{ width: "100%", height: "100%" }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap contributors' />
            
            {/* Batas poligon wilayah administrasi studi kasus Kecamatan Ratu Agung */}
            <GeoJSON
              data={{
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [[[102.255, -3.780], [102.285, -3.780], [102.285, -3.810], [102.255, -3.810], [102.255, -3.780]]]
                },
                properties: { nama: "Kecamatan Ratu Agung" }
              }}
              style={{ color: "#3b82f6", weight: 2, fillOpacity: 0.05, fillColor: "#3b82f6" }}
            />
            
            <FlyAndOpen target={flyTarget} markerRefs={markerRefs} />
            
            {/* Mapping data sebaran objek penanda tempat parkir */}
            {filtered.map((item) => (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={createIcon(getMarkerColor(item))}
                ref={(r) => { markerRefs.current[item.id] = r; }}
                eventHandlers={{ click: () => setSelected(item) }}
              >
                <Popup maxWidth={280}>
                  <div style={{ fontFamily: "sans-serif", padding: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <strong style={{ fontSize: 14, color: "#0f172a", lineHeight: 1.3, flex: 1 }}>{item.nama}</strong>
                      <span style={{ backgroundColor: getMarkerColor(item) + "20", color: getMarkerColor(item), padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 800, marginLeft: 8 }}>
                        {getStatusLabel(item)}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>{item.alamat}</p>
                    
                    {/* Detail Informasi Spesifikasi Lahan */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                      {[
                        { label: "Jenis", val: item.jenis_lahan || "-" },
                        { label: "Jam Buka", val: `${formatJam(item.jam_buka)} - ${formatJam(item.jam_tutup)}` },
                        { label: "Kapasitas Mobil", val: `${item.kapasitas_mobil} slot` },
                        { label: "Kapasitas Motor", val: `${item.kapasitas_motor} slot` },
                      ].map((d) => (
                        <div key={d.label} style={{ backgroundColor: "#f8fafc", borderRadius: 8, padding: "6px 8px" }}>
                          <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{d.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{d.val}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Rincian Tarif Retribusi Kendaraan */}
                    {item.tarifs && item.tarifs.length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>TARIF:</div>
                        {item.tarifs.map((t) => (
                          <div key={t.id} style={{ fontSize: 11, color: "#334155" }}>
                            {t.jenis_kendaraan}: {formatRupiah(t.tarif_jam_pertama)}/jam pertama, {formatRupiah(t.tarif_jam_berikutnya)}/jam berikutnya
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {item.jarak_meter && (
                      <div style={{ marginTop: 8, color: "#22c55e", fontSize: 11, fontWeight: 700 }}>
                        📍 {(item.jarak_meter / 1000).toFixed(2)} km dari lokasi kamu
                      </div>
                    )}

                    {/* Form Interaktif Pengisian Rating Bintang */}
                    <div style={{ marginTop: 10, borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, marginBottom: 6 }}>BERI RATING:</div>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {[1,2,3,4,5].map(bintang => (
                          <button key={bintang} onClick={() => handleRating(item.id, bintang)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 2, transition: "transform 0.1s" }}
                            onMouseEnter={e => e.target.style.transform = "scale(1.3)"}
                            onMouseLeave={e => e.target.style.transform = "scale(1)"}
                          >
                            {getRating(item.id) && Math.round(getRating(item.id).avg) >= bintang ? "⭐" : "☆"}
                          </button>
                        ))}
                        {getRating(item.id) && (
                          <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, marginLeft: 4 }}>
                            {getRating(item.id).avg} ({getRating(item.id).count} ulasan)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Integrasi Navigasi Eksternal Rute Google Maps dan Berbagi Tautan */}
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1, backgroundColor: "#2563eb", color: "white", padding: "8px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                      >
                        🗺️ Buka Maps
                      </a>
                      <button
                        onClick={() => {
                          const link = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
                          navigator.clipboard.writeText(link);
                          const el = document.getElementById(`copied-${item.id}`);
                          if (el) { el.style.display = "block"; setTimeout(() => { el.style.display = "none"; }, 2000); }
                        }}
                        style={{ flex: 1, backgroundColor: "#1e293b", color: "#94a3b8", padding: "8px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, border: "1px solid #334155", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                      >
                        🔗 Salin Link
                      </button>
                    </div>
                    <div id={`copied-${item.id}`} style={{ display: "none", marginTop: 6, backgroundColor: "#22c55e20", color: "#22c55e", borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 700, textAlign: "center" }}>
                      ✅ Link berhasil disalin!
                    </div>

                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legenda Indikator Peta */}
          <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 999, backgroundColor: "rgba(15,23,42,0.92)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "14px 18px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ color: "#475569", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 10px" }}>KETERANGAN</p>
            {[
              { color: "#22c55e", label: "Sedang Buka" },
              { color: "#ef4444", label: "Sedang Tutup" },
              { color: "#3b82f6", label: "Tidak Diketahui" }
            ].map((ind) => (
              <div key={ind.label} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: ind.color }} />
                <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{ind.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MapPage;