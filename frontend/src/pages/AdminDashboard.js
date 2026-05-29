import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Trash2, Edit, LayoutDashboard, Database,
  Settings, LogOut, X, Save, MapPin, AlertTriangle, Menu, ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api";

const hideScrollbarStyle = `
  .admin-sidebar::-webkit-scrollbar { display: none; }
  .admin-sidebar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const inputStyle = {
  width: "100%", padding: "10px 13px", borderRadius: 10,
  border: "1px solid #e2e8f0", fontSize: 14, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fff", color: "#0f172a",
};

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#64748b",
  marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em",
};

const EMPTY = {
  nama: "", alamat: "", jenis_lahan: "terbuka",
  kapasitas_mobil: "", kapasitas_motor: "",
  jam_buka: "08:00", jam_tutup: "21:00",
  latitude: "", longitude: "",
};

const Overlay = ({ children }) => (
  <div style={{ 
    position: "fixed", inset: 0, zIndex: 1100, 
    backgroundColor: "rgba(0,0,0,0.6)", 
    backdropFilter: "blur(6px)", 
    display: "flex", alignItems: "center", 
    justifyContent: "center", padding: 20 
  }}>
    {children}
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State untuk Search Bar
  const [searchAdmin, setSearchAdmin] = useState("");

  // Fungsi Export CSV
  const exportCSV = () => {
    const headers = ["ID", "Nama", "Alamat", "Jenis Lahan", "Kapasitas Mobil", "Kapasitas Motor", "Jam Buka", "Jam Tutup", "Status"];
    const rows = data.map(item => [
      item.id,
      item.nama,
      item.alamat || "-",
      item.jenis_lahan || "-",
      item.kapasitas_mobil,
      item.kapasitas_motor,
      item.jam_buka ? item.jam_buka.substring(0, 5) : "-",
      item.jam_tutup ? item.jam_tutup.substring(0, 5) : "-",
      getStatus(item)
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data_parkir_ratu_agung.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const fetchData = () => {
    axios.get(`${API}/parkir`)
      .then((res) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setForm(EMPTY); setModal("add"); };

  const openEdit = (item) => {
    setForm({
      nama: item.nama || "",
      alamat: item.alamat || "",
      jenis_lahan: item.jenis_lahan || "terbuka",
      kapasitas_mobil: item.kapasitas_mobil || 0,
      kapasitas_motor: item.kapasitas_motor || 0,
      jam_buka: item.jam_buka ? item.jam_buka.substring(0, 5) : "08:00",
      jam_tutup: item.jam_tutup ? item.jam_tutup.substring(0, 5) : "21:00",
      latitude: item.latitude || "",
      longitude: item.longitude || "",
    });
    setEditId(item.id);
    setModal("edit");
  };

  const openDelete = (id) => { setDeleteId(id); setModal("delete"); };
  const closeModal = () => { setModal(null); setEditId(null); setDeleteId(null); };

  const handleSave = async () => {
    if (!form.nama.trim() || !form.latitude || !form.longitude) {
      alert("Nama, Latitude, dan Longitude wajib diisi!");
      return;
    }
    setSaving(true);
    const payload = {
      nama: form.nama,
      alamat: form.alamat,
      jenis_lahan: form.jenis_lahan,
      kapasitas_mobil: Number(form.kapasitas_mobil) || 0,
      kapasitas_motor: Number(form.kapasitas_motor) || 0,
      jam_buka: form.jam_buka || null,
      jam_tutup: form.jam_tutup || null,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    };
    try {
      if (modal === "add") {
        await axios.post(`${API}/parkir`, payload);
      } else {
        await axios.put(`${API}/parkir/${editId}`, payload);
      }
      fetchData();
      closeModal();
      showToast(modal === "add" ? "✅ Lokasi parkir berhasil ditambahkan!" : "✅ Data parkir berhasil diperbarui!");
    } catch (err) {
      alert("Gagal menyimpan data: " + (err.response?.data?.detail || err.message));
    }
    setSaving(false);
  };
  const [toast, setToast] = useState(null);

  const showToast = (pesan, tipe = "success") => {
    setToast({ pesan, tipe });
    setTimeout(() => setToast(null), 3000);
  };
  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/parkir/${deleteId}`);
      fetchData();
      closeModal();
      showToast("🗑️ Lokasi parkir berhasil dihapus!", "error");
    } catch {
      alert("Gagal menghapus data");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuth");
    navigate("/");
  };

  const getStatus = (item) => {
    const now = new Date();
    const jam = now.getHours() * 60 + now.getMinutes();
    if (!item.jam_buka || !item.jam_tutup) return "Buka";
    const [bH, bM] = item.jam_buka.split(":").map(Number);
    const [tH, tM] = item.jam_tutup.split(":").map(Number);
    return jam >= bH * 60 + bM && jam <= tH * 60 + tM ? "Buka" : "Tutup";
  };


  const sidebarItem = {
    display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
    borderRadius: 12, cursor: "pointer", textDecoration: "none", fontSize: 14,
    fontWeight: 600, background: "none", border: "none", width: "100%",
  };

  return (
    <>
      <style>{hideScrollbarStyle}</style>

      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" }}>

        {/* ===== SIDEBAR ===== */}
        <nav
          className="admin-sidebar"
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: 250,
            height: "100vh",
            backgroundColor: "#0f172a",
            color: "white",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            zIndex: 1000,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: sidebarOpen ? "8px 0 40px rgba(0,0,0,0.3)" : "none",
          }}
        >
          {/* Logo + Tombol Tutup */}
          <div style={{ marginBottom: 28, paddingLeft: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)", borderRadius: 10, padding: 8 }}>
                  <MapPin size={16} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "white" }}>ADMIN PORTAL</div>
                  <div style={{ fontSize: 9, color: "#334155", fontWeight: 700, textTransform: "uppercase" }}>RatuAgungGIS v2.0</div>
                </div>
              </div>
              {/* Tombol tutup ‹ */}
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32,
                  backgroundColor: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, cursor: "pointer", color: "#94a3b8", flexShrink: 0,
                }}
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>

          {/* Nav Items */}
          <div
            onClick={() => setActivePage("dashboard")}
            style={{ ...sidebarItem, backgroundColor: activePage === "dashboard" ? "#1e293b" : "transparent", color: activePage === "dashboard" ? "white" : "#64748b" }}
          >
            <LayoutDashboard size={17} /> Dashboard
          </div>
          <div
            onClick={() => setActivePage("spasial")}
            style={{ ...sidebarItem, backgroundColor: activePage === "spasial" ? "#1e293b" : "transparent", color: activePage === "spasial" ? "white" : "#64748b" }}
          >
            <Database size={17} /> Data Spasial
          </div>
          <div
            onClick={() => setActivePage("pengaturan")}
            style={{ ...sidebarItem, backgroundColor: activePage === "pengaturan" ? "#1e293b" : "transparent", color: activePage === "pengaturan" ? "white" : "#64748b" }}
          >
            <Settings size={17} /> Pengaturan
          </div>

          <div style={{ flex: 1 }} />
          <button onClick={handleLogout} style={{ ...sidebarItem, color: "#f87171" }}>
            <LogOut size={17} /> Keluar
          </button>
        </nav>

        {/* ===== MAIN CONTENT ===== */}
        <main style={{
          flex: 1,
          padding: "32px 36px",
          overflowY: "auto",
          marginLeft: sidebarOpen ? 250 : 0,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}>

          {/* Tombol buka sidebar ☰ */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                position: "fixed", top: 16, left: 16, zIndex: 999,
                width: 44, height: 44,
                backgroundColor: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <Menu size={20} />
            </button>
          )}

{/* ===== HALAMAN DATA SPASIAL ===== */}
          {activePage === "spasial" && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Data Spasial</h1>
                <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>Informasi geografis lokasi parkir Kecamatan Ratu Agung</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 28 }}>
                {[
                  { label: "Tipe Geometri Point", val: "20 Titik", desc: "Koordinat lokasi parkir", color: "#2563eb", icon: "📍" },
                  { label: "Tipe Geometri Polygon", val: "1 Area", desc: "Batas Kecamatan Ratu Agung", color: "#22c55e", icon: "🔷" },
                  { label: "Sistem Koordinat", val: "EPSG:4326", desc: "WGS84 — Standar GPS Global", color: "#8b5cf6", icon: "🌐" },
                ].map(s => (
                  <div key={s.label} style={{ backgroundColor: "white", padding: "20px 22px", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", borderLeft: `4px solid ${s.color}` }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                    <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px" }}>{s.label}</p>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: "0 0 4px" }}>{s.val}</h2>
                    <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{s.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 28 }}>
                <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#eff6ff" }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#1e40af" }}>📋 Tabel Parkir</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#3b82f6" }}>Tabel utama — 20 record</p>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead style={{ backgroundColor: "#f8fafc" }}>
                      <tr>
                        {["Kolom", "Tipe Data"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["id", "SERIAL PRIMARY KEY"],
                        ["nama", "VARCHAR(100)"],
                        ["alamat", "TEXT"],
                        ["koordinat", "GEOMETRY(Point, 4326) 🗺️"],
                        ["jenis_lahan", "VARCHAR(50)"],
                        ["kapasitas_mobil", "INTEGER"],
                        ["kapasitas_motor", "INTEGER"],
                        ["jam_buka", "TIME"],
                        ["jam_tutup", "TIME"],
                      ].map(([col, type]) => (
                        <tr key={col} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "10px 16px", fontWeight: 700, color: "#0f172a" }}>{col}</td>
                          <td style={{ padding: "10px 16px", color: "#6366f1", fontFamily: "monospace", fontSize: 12 }}>{type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f0fdf4" }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#15803d" }}>💰 Tabel Tarif</h3>
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "#22c55e" }}>Relasi ke parkir — 40 record</p>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead style={{ backgroundColor: "#f8fafc" }}>
                        <tr>
                          {["Kolom", "Tipe Data"].map(h => (
                            <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["id", "SERIAL PRIMARY KEY"],
                          ["parkir_id", "INTEGER (FK)"],
                          ["jenis_kendaraan", "VARCHAR(20)"],
                          ["tarif_jam_pertama", "INTEGER"],
                          ["tarif_jam_berikutnya", "INTEGER"],
                        ].map(([col, type]) => (
                          <tr key={col} style={{ borderBottom: "1px solid #f8fafc" }}>
                            <td style={{ padding: "10px 16px", fontWeight: 700, color: "#0f172a" }}>{col}</td>
                            <td style={{ padding: "10px 16px", color: "#6366f1", fontFamily: "monospace", fontSize: 12 }}>{type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#faf5ff" }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#7e22ce" }}>🗺️ Tabel Kecamatan</h3>
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "#8b5cf6" }}>Batas wilayah — Polygon</p>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead style={{ backgroundColor: "#f8fafc" }}>
                        <tr>
                          {["Kolom", "Tipe Data"].map(h => (
                            <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["id", "SERIAL PRIMARY KEY"],
                          ["nama_kecamatan", "VARCHAR(100)"],
                          ["batas_wilayah", "GEOMETRY(Polygon, 4326) 🔷"],
                        ].map(([col, type]) => (
                          <tr key={col} style={{ borderBottom: "1px solid #f8fafc" }}>
                            <td style={{ padding: "10px 16px", fontWeight: 700, color: "#0f172a" }}>{col}</td>
                            <td style={{ padding: "10px 16px", color: "#6366f1", fontFamily: "monospace", fontSize: 12 }}>{type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "20px 24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>🔍 Endpoint Query Spasial</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    { method: "GET", url: "/api/parkir/terdekat", fungsi: "ST_Distance", desc: "Mencari parkir terdekat dari koordinat pengguna, diurutkan dari yang paling dekat" },
                    { method: "GET", url: "/api/parkir/dalam-radius", fungsi: "ST_DWithin", desc: "Menampilkan semua parkir dalam radius tertentu (meter) dari posisi pengguna" },
                    { method: "GET", url: "/api/parkir/geojson", fungsi: "GeoJSON Output", desc: "Mengembalikan semua data parkir dalam format GeoJSON standar internasional" },
                    { method: "GET", url: "/api/kecamatan/geojson", fungsi: "GeoJSON Polygon", desc: "Mengembalikan batas wilayah kecamatan dalam format GeoJSON Polygon" },
                  ].map(e => (
                    <div key={e.url} style={{ backgroundColor: "#f8fafc", borderRadius: 12, padding: "14px 16px", borderLeft: "3px solid #2563eb" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 900 }}>{e.method}</span>
                        <code style={{ fontSize: 12, color: "#6366f1", fontWeight: 700 }}>{e.url}</code>
                      </div>
                      <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginBottom: 4 }}>Fungsi: {e.fungsi}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{e.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHART STATISTIK */}
              <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "24px", marginTop: 18 }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>📊 Statistik Visual</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {/* PIE CHART: Terbuka vs Gedung */}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Jenis Lahan Parkir</p>
                    {(() => {
                      const terbuka = data.filter(d => d.jenis_lahan === "terbuka").length;
                      const gedung = data.filter(d => d.jenis_lahan === "gedung").length;
                      const total = terbuka + gedung || 1;
                      return (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                            <div style={{ flex: 1, height: 24, backgroundColor: "#f1f5f9", borderRadius: 12, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${(terbuka/total)*100}%`, backgroundColor: "#3b82f6", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ color: "white", fontSize: 10, fontWeight: 900 }}>{terbuka}</span>
                              </div>
                            </div>
                            <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 700, minWidth: 60 }}>Terbuka</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                            <div style={{ flex: 1, height: 24, backgroundColor: "#f1f5f9", borderRadius: 12, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${(gedung/total)*100}%`, backgroundColor: "#8b5cf6", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ color: "white", fontSize: 10, fontWeight: 900 }}>{gedung}</span>
                              </div>
                            </div>
                            <span style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 700, minWidth: 60 }}>Gedung</span>
                          </div>
                          <p style={{ fontSize: 11, color: "#94a3b8", margin: "8px 0 0" }}>
                            {terbuka} parkir terbuka ({Math.round((terbuka/total)*100)}%) · {gedung} gedung parkir ({Math.round((gedung/total)*100)}%)
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                  {/* BAR CHART: Top 5 Kapasitas */}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Top 5 Kapasitas Terbesar</p>
                    {[...data].sort((a, b) => (b.kapasitas_mobil + b.kapasitas_motor) - (a.kapasitas_mobil + a.kapasitas_motor)).slice(0, 5).map(item => {
                      const total = item.kapasitas_mobil + item.kapasitas_motor;
                      const maxTotal = Math.max(...data.map(d => d.kapasitas_mobil + d.kapasitas_motor));
                      return (
                        <div key={item.id} style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 11, color: "#334155", fontWeight: 600 }}>{item.nama.replace("Parkir ", "")}</span>
                            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{total} slot</span>
                          </div>
                          <div style={{ height: 8, backgroundColor: "#f1f5f9", borderRadius: 8, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(total/maxTotal)*100}%`, backgroundColor: "#22c55e", borderRadius: 8, transition: "width 0.5s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}
          
          {/* ===== HALAMAN PENGATURAN ===== */}
          {activePage === "pengaturan" && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Pengaturan</h1>
                <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>Konfigurasi sistem WebGIS Parkir Publik</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 28 }}>
                <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "24px" }}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>ℹ️ Informasi Aplikasi</h3>
                  {[
                    { label: "Nama Aplikasi", val: "WebGIS Parkir Publik" },
                    { label: "Versi", val: "1.0.0" },
                    { label: "Wilayah Studi", val: "Kecamatan Ratu Agung, Bengkulu" },
                    { label: "Backend", val: "FastAPI Python" },
                    { label: "Database", val: "PostgreSQL + PostGIS" },
                    { label: "Frontend", val: "ReactJS + Leaflet.js" },
                    { label: "Semester", val: "Genap 2025/2026" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>{item.val}</span>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "24px" }}>
                  <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>👥 Tim Pengembang</h3>
                  {[
                    { nama: "Hanifah Hasanah", nim: "123140082", peran: "Ketua & Dokumentasi" },
                    { nama: "Afifa Aulia", nim: "123140073", peran: "Backend Developer" },
                    { nama: "Ariq Ramadhinov Ronny", nim: "123140105", peran: "Database Engineer" },
                    { nama: "M. Farhan Muzakhi", nim: "123140075", peran: "Frontend Developer" },
                  ].map(t => (
                    <div key={t.nim} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#2563eb", flexShrink: 0 }}>
                        {t.nama.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{t.nama}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{t.nim} · {t.peran}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "24px", marginBottom: 18 }}>
                <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>🔌 Status Koneksi</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                  {[
                    { label: "Backend API", url: "localhost:8000", status: "Online", color: "#22c55e" },
                    { label: "Database PostGIS", url: "localhost:5433", status: "Online", color: "#22c55e" },
                    { label: "Frontend React", url: "localhost:3000", status: "Online", color: "#22c55e" },
                  ].map(s => (
                    <div key={s.label} style={{ backgroundColor: "#f0fdf4", borderRadius: 12, padding: "16px", border: "1px solid #bbf7d0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: s.color, textTransform: "uppercase" }}>{s.status}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{s.url}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "24px" }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>🔐 Keluar dari Sistem</h3>
                <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Klik tombol di bawah untuk keluar dari Admin Portal</p>
                <button onClick={handleLogout}
                  style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                  <LogOut size={16} /> Keluar dari Admin Portal
                </button>
              </div>
            </div>
          )}

          {/* ===== HALAMAN DASHBOARD ===== */}
          {activePage === "dashboard" && (
            <div>
              {/* Bagian Flex Header Tombol Baru */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Kelola Titik Parkir</h1>
                  <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>Kecamatan Ratu Agung, Kota Bengkulu</p>
                </div>
                
                {/* Pembungkus Flex Tombol Export dan Tombol Tambah Lokasi */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button onClick={exportCSV}
                    style={{ backgroundColor: "#059669", color: "white", border: "none", padding: "12px 20px", borderRadius: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, marginRight: 10 }}>
                    📥 Export CSV
                  </button>
                  <button onClick={openAdd} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px 20px", borderRadius: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                    <Plus size={17} /> Tambah Lokasi Baru
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 28 }}>
                {[
                  { label: "Total Parkir", val: data.length, color: "#2563eb" },
                  { label: "Sedang Buka", val: data.filter((d) => getStatus(d) === "Buka").length, color: "#22c55e" },
                  { label: "Sedang Tutup", val: data.filter((d) => getStatus(d) === "Tutup").length, color: "#ef4444" },
                  { label: "Total Slot Mobil", val: data.reduce((a, b) => a + (b.kapasitas_mobil || 0), 0), color: "#8b5cf6" },
                ].map((s) => (
                  <div key={s.label} style={{ backgroundColor: "white", padding: "20px 22px", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", borderLeft: `4px solid ${s.color}` }}>
                    <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", margin: 0 }}>{s.label}</p>
                    <h2 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#0f172a", margin: "7px 0 0" }}>{s.val}</h2>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: "white", borderRadius: 18, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Memuat data...</div>
                ) : (
                  <>
                    {/* FITUR 5: SEARCH BAR COMPONENT */}
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ position: "relative", flex: 1 }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
                        <input
                          value={searchAdmin}
                          onChange={e => setSearchAdmin(e.target.value)}
                          placeholder="Cari nama atau alamat parkir..."
                          style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", color: "#0f172a" }}
                        />
                      </div>
                      {searchAdmin && (
                        <button onClick={() => setSearchAdmin("")}
                          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                          Reset
                        </button>
                      )}
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead style={{ backgroundColor: "#f8fafc" }}>
                        <tr>
                          {["Nama Lokasi", "Jenis", "Status", "Kapasitas", "Jam Operasional", "Aksi"].map((h) => (
                            <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9", fontWeight: 700 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* FITUR 5: MAPPING DATA DENGAN SUNTIKAN FILTER */}
                        {data.filter(item =>
                          item.nama.toLowerCase().includes(searchAdmin.toLowerCase()) ||
                          (item.alamat && item.alamat.toLowerCase().includes(searchAdmin.toLowerCase()))
                        ).map((item) => (
                          <tr key={item.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{item.nama}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.alamat}</div>
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#334155" }}>{item.jenis_lahan || "-"}</td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{ backgroundColor: (getStatus(item) === "Buka" ? "#22c55e" : "#ef4444") + "18", color: getStatus(item) === "Buka" ? "#22c55e" : "#ef4444", padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                {getStatus(item)}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                              🚗 {item.kapasitas_mobil} | 🏍️ {item.kapasitas_motor}
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                              ⏱️ {item.jam_buka ? item.jam_buka.substring(0,5) : "-"} - {item.jam_tutup ? item.jam_tutup.substring(0,5) : "-"}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => openEdit(item)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, backgroundColor: "#eff6ff", border: "none", borderRadius: 8, cursor: "pointer", color: "#2563eb" }}>
                                  <Edit size={15} />
                                </button>
                                <button onClick={() => openDelete(item.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, backgroundColor: "#fef2f2", border: "none", borderRadius: 8, cursor: "pointer", color: "#ef4444" }}>
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===== MODAL ADD / EDIT ===== */}
      {(modal === "add" || modal === "edit") && (
        <Overlay>
          <div style={{ backgroundColor: "white", borderRadius: 20, width: "100%", maxWidth: 540, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", overflow: "hidden", animation: "modalIn 0.2s ease-out" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f8fafc" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
                {modal === "add" ? "✨ Tambah Lokasi Parkir" : "✏️ Edit Lokasi Parkir"}
              </h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16, maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
              <div>
                <label style={labelStyle}>Nama Lokasi *</label>
                <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Parkir Pasar Minggu" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Alamat Lengkap</label>
                <textarea value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="Nama jalan, nomor, RT/RW..." style={{ ...inputStyle, height: 70, resize: "none" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Latitude *</label>
                  <input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="-3.80123" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Longitude *</label>
                  <input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="102.26123" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Jenis Lahan</label>
                <select value={form.jenis_lahan} onChange={e => setForm({ ...form, jenis_lahan: e.target.value })} style={inputStyle}>
                  <option value="terbuka">Terbuka (Halaman/Jalan)</option>
                  <option value="gedung">Gedung / Indoor</option>
                  <option value="kanopi">Berkanopi / Atap</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Kapasitas Mobil (Slot)</label>
                  <input type="number" value={form.kapasitas_mobil} onChange={e => setForm({ ...form, kapasitas_mobil: e.target.value })} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Kapasitas Motor (Slot)</label>
                  <input type="number" value={form.kapasitas_motor} onChange={e => setForm({ ...form, kapasitas_motor: e.target.value })} placeholder="0" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Jam Buka</label>
                  <input type="time" value={form.jam_buka} onChange={e => setForm({ ...form, jam_buka: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Jam Tutup</label>
                  <input type="time" value={form.jam_tutup} onChange={e => setForm({ ...form, jam_tutup: e.target.value })} style={inputStyle} />
                </div>
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10, backgroundColor: "#f8fafc" }}>
              <button onClick={closeModal} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #e2e8f0", backgroundColor: "white", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Batal
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: "10px 20px", borderRadius: 10, border: "none", backgroundColor: "#2563eb", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Save size={15} /> {saving ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ===== MODAL DELETE WITH NEW CONFIRMATION (FITUR 6) ===== */}
      {modal === "delete" && (
        <Overlay>
          <div style={{ backgroundColor: "white", borderRadius: 20, width: "100%", maxWidth: 400, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", p: 0, overflow: "hidden" }}>
            <div style={{ padding: "28px 24px 20px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#fef2f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <AlertTriangle size={22} />
              </div>
              
              {/* SUNTIKAN FITUR 6 DI SINI */}
              <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem", fontWeight: 900, color: "#0f172a" }}>Hapus Lokasi Parkir?</h3>
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", margin: "0 0 16px", textAlign: "left" }}>
                <p style={{ color: "#ef4444", fontSize: 13, fontWeight: 700, margin: 0 }}>
                  {data.find(d => d.id === deleteId)?.nama || "Lokasi ini"}
                </p>
                <p style={{ color: "#94a3b8", fontSize: 11, margin: "4px 0 0" }}>
                  {data.find(d => d.id === deleteId)?.alamat || ""}
                </p>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 26px", lineHeight: 1.5, textAlign: "center" }}>
                Data ini akan dihapus permanen dari database dan tidak bisa dikembalikan.
              </p>
            </div>
            
            <div style={{ padding: "14px 20px", backgroundColor: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
              <button onClick={closeModal} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid #e2e8f0", backgroundColor: "white", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Batal
              </button>
              <button onClick={handleDelete} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", backgroundColor: "#ef4444", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </Overlay>
      )}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          backgroundColor: toast.tipe === "error" ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${toast.tipe === "error" ? "#fecaca" : "#bbf7d0"}`,
          color: toast.tipe === "error" ? "#ef4444" : "#16a34a",
          padding: "14px 20px", borderRadius: 14,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          fontSize: 13, fontWeight: 700,
          animation: "slideIn 0.3s ease",
          maxWidth: 320
        }}>
          <style>{`@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
          {toast.pesan}
        </div>
      )}
    </>
  );
};

export default AdminDashboard;