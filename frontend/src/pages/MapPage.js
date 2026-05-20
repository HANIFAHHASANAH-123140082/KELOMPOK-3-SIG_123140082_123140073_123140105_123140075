import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Filter, MapPin, Clock, Car, Navigation } from "lucide-react";

const API = "http://localhost:8000/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const createIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;background:${color};border:3px solid white;transform:rotate(-45deg);box-shadow:0 3px 12px rgba(0,0,0,0.35);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -22],
  });

const FlyAndOpen = ({ target, markerRefs }) => {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.latitude, target.longitude], 17, { duration: 1.2 });
    setTimeout(() => markerRefs.current[target.id]?.openPopup(), 1350);
  }, [target]);
  return null;
};

const formatJam = (jam) => {
  if (!jam) return "-";
  return jam.substring(0, 5);
};

const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

const MapPage = () => {
  const [parkirData, setParkirData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [selected, setSelected] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [terdekatMode, setTerdekatMode] = useState(false);
  const markerRefs = useRef({});

  // Ambil data dari API
  useEffect(() => {
    axios.get(`${API}/parkir`)
      .then((res) => {
        setParkirData(res.data);
        setFiltered(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter berdasarkan search dan jenis kendaraan
  useEffect(() => {
    let result = parkirData;
    if (search) {
      result = result.filter(
        (p) =>
          p.nama.toLowerCase().includes(search.toLowerCase()) ||
          (p.alamat && p.alamat.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (filter === "Mobil") result = result.filter((p) => p.kapasitas_mobil > 0);
    if (filter === "Motor") result = result.filter((p) => p.kapasitas_motor > 0);
    setFiltered(result);
  }, [search, filter, parkirData]);

  const handleSelect = (item) => {
    setSelected(item);
    setFlyTarget({ ...item, _t: Date.now() });
  };

  const handleCariTerdekat = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung GPS");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
        axios.get(`${API}/parkir/terdekat?lat=${latitude}&lng=${longitude}&limit=5`)
          .then((res) => {
            setFiltered(res.data);
            setTerdekatMode(true);
          });
      },
      () => {
        // Kalau GPS tidak bisa, pakai koordinat tengah Ratu Agung
        const lat = -3.7988;
        const lng = 102.2614;
        axios.get(`${API}/parkir/terdekat?lat=${lat}&lng=${lng}&limit=5`)
          .then((res) => {
            setFiltered(res.data);
            setTerdekatMode(true);
          });
      }
    );
  };

  const handleResetTerdekat = () => {
    setFiltered(parkirData);
    setTerdekatMode(false);
    setUserLocation(null);
  };

  const getMarkerColor = (item) => {
    const now = new Date();
    const jamSekarang = now.getHours() * 60 + now.getMinutes();
    if (!item.jam_buka || !item.jam_tutup) return "#3b82f6";
    const [bH, bM] = item.jam_buka.split(":").map(Number);
    const [tH, tM] = item.jam_tutup.split(":").map(Number);
    const buka = bH * 60 + bM;
    const tutup = tH * 60 + tM;
    if (jamSekarang >= buka && jamSekarang <= tutup) return "#22c55e";
    return "#ef4444";
  };

  const getStatusLabel = (item) => {
    const now = new Date();
    const jamSekarang = now.getHours() * 60 + now.getMinutes();
    if (!item.jam_buka || !item.jam_tutup) return "Buka";
    const [bH, bM] = item.jam_buka.split(":").map(Number);
    const [tH, tM] = item.jam_tutup.split(":").map(Number);
    const buka = bH * 60 + bM;
    const tutup = tH * 60 + tM;
    return jamSekarang >= buka && jamSekarang <= tutup ? "Buka" : "Tutup";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", color: "white", fontSize: 18 }}>
        Memuat data parkir...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: "hidden" }}>
      {/* SIDEBAR */}
      <div style={{ width: 370, minWidth: 370, height: "100vh", backgroundColor: "#0f172a", display: "flex", flexDirection: "column", zIndex: 1000, overflowY: "auto" }}>
        
        <div style={{ padding: "20px 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#64748b", textDecoration: "none", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
            <ArrowLeft size={13} /> Kembali
          </Link>
          <h2 style={{ color: "white", fontWeight: 900, fontSize: "1.2rem", margin: 0 }}>EKSPLORASI</h2>
          <h2 style={{ color: "#3b82f6", fontWeight: 900, fontSize: "1.2rem", margin: "2px 0 0", fontStyle: "italic" }}>TITIK PARKIR</h2>
          <p style={{ color: "#475569", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 4 }}>
            Kecamatan Ratu Agung Digital Map
          </p>
        </div>

        <div style={{ padding: "14px 16px 0" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 13, top: 12, color: "#475569" }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setTerdekatMode(false); }}
              placeholder="Cari lokasi parkir..."
              style={{ width: "100%", padding: "11px 12px 11px 38px", backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 7, padding: "10px 16px" }}>
          {["Semua", "Mobil", "Motor"].map((f) => (
            <button key={f} onClick={() => { setFilter(f); setTerdekatMode(false); }}
              style={{ padding: "6px 14px", borderRadius: 20, border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer", backgroundColor: filter === f && !terdekatMode ? "#2563eb" : "#1e293b", color: filter === f && !terdekatMode ? "white" : "#64748b", textTransform: "uppercase" }}>
              {f}
            </button>
          ))}
          <button onClick={terdekatMode ? handleResetTerdekat : handleCariTerdekat}
            style={{ padding: "6px 14px", borderRadius: 20, border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer", backgroundColor: terdekatMode ? "#22c55e" : "#1e293b", color: terdekatMode ? "white" : "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
            <Navigation size={11} /> {terdekatMode ? "Reset" : "Terdekat"}
          </button>
        </div>

        <div style={{ padding: "0 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#3b82f6", boxShadow: "0 0 7px #3b82f6" }} />
            <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {terdekatMode ? `${filtered.length} Terdekat` : `${filtered.length} Lokasi`}
            </span>
          </div>
          <Filter size={13} color="#475569" />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 16px" }}>
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
                <div style={{ display: "flex", gap: 12 }}>
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAP */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer center={[-3.7988, 102.2614]} zoom={15} style={{ width: "100%", height: "100%" }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          <GeoJSON
            data={{
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [[
                  [102.255, -3.780],
                  [102.285, -3.780],
                  [102.285, -3.810],
                  [102.255, -3.810],
                  [102.255, -3.780]
                ]]
              },
              properties: { nama: "Kecamatan Ratu Agung" }
            }}
            style={{ color: "#3b82f6", weight: 2, fillOpacity: 0.05, fillColor: "#3b82f6" }}
          />
          <FlyAndOpen target={flyTarget} markerRefs={markerRefs} />
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
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 999, backgroundColor: "rgba(15,23,42,0.92)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "14px 18px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ color: "#475569", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 10px" }}>KETERANGAN</p>
          {[{ color: "#22c55e", label: "Sedang Buka" }, { color: "#ef4444", label: "Sedang Tutup" }, { color: "#3b82f6", label: "Tidak Diketahui" }].map((ind) => (
            <div key={ind.label} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: ind.color }} />
              <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{ind.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPage;