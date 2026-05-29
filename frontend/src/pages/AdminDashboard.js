/**
 * AdminDashboard.js
 * Halaman utama admin portal — menampilkan ringkasan data,
 * quick stats, dan activity log aktivitas terakhir.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  LayoutDashboard, ParkingSquare, BarChart2, Map,
  Info, LogOut, Menu, ChevronLeft, MapPin,
  Car, Bike, Clock, TrendingUp, Activity,
  CheckCircle, XCircle, AlertCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Base URL API backend
const API = "http://localhost:8000/api";

// ─── Komponen Sidebar ────────────────────────────────────────────────────────
// Diletakkan di luar agar tidak di-recreate setiap render
const Sidebar = ({ open, onClose, activePage, onNavigate, onLogout }) => {
  const menuItems = [
    { id: "dashboard",  icon: LayoutDashboard, label: "Dashboard"      },
    { id: "parkir",     icon: ParkingSquare,   label: "Kelola Parkir"  },
    { id: "statistik",  icon: BarChart2,        label: "Statistik"      },
    { id: "peta",       icon: Map,             label: "Peta Admin"     },
    { id: "tentang",    icon: Info,            label: "Tentang"        },
  ];

  return (
    <nav
      className="admin-sidebar"
      style={{
        position: "fixed", top: 0, left: 0,
        width: 240, height: "100vh",
        backgroundColor: "#0f172a", color: "white",
        padding: "20px 12px",
        display: "flex", flexDirection: "column", gap: 2,
        zIndex: 1000, overflowY: "auto", overflowX: "hidden",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: open ? "8px 0 40px rgba(0,0,0,0.3)" : "none",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 24, paddingLeft: 4 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              background: "linear-gradient(135deg,#2563eb,#4f46e5)",
              borderRadius: 10, padding: 8,
            }}>
              <MapPin size={15} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "white" }}>ADMIN PORTAL</div>
              <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, textTransform: "uppercase" }}>
                RatuAgungGIS v2.0
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, backgroundColor: "#1e293b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, cursor: "pointer", color: "#94a3b8",
            }}
          >
            <ChevronLeft size={15} />
          </button>
        </div>
      </div>

      {/* Menu navigasi */}
      {menuItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          style={{
            display: "flex", alignItems: "center", gap: 11,
            padding: "10px 12px", borderRadius: 10, cursor: "pointer",
            border: "none", width: "100%", textAlign: "left",
            fontSize: 13, fontWeight: 600,
            backgroundColor: activePage === id ? "#1e293b" : "transparent",
            color: activePage === id ? "white" : "#64748b",
            transition: "all 0.15s ease",
          }}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* Tombol keluar */}
      <button
        onClick={onLogout}
        style={{
          display: "flex", alignItems: "center", gap: 11,
          padding: "10px 12px", borderRadius: 10, cursor: "pointer",
          border: "none", width: "100%", fontSize: 13, fontWeight: 600,
          backgroundColor: "transparent", color: "#f87171",
        }}
      >
        <LogOut size={16} /> Keluar
      </button>
    </nav>
  );
};

// ─── Komponen Toast Notifikasi ────────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  const isError = toast.tipe === "error";
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      backgroundColor: isError ? "#fef2f2" : "#f0fdf4",
      border: `1px solid ${isError ? "#fecaca" : "#bbf7d0"}`,
      color: isError ? "#ef4444" : "#16a34a",
      padding: "13px 18px", borderRadius: 12,
      boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
      fontSize: 13, fontWeight: 700, maxWidth: 300,
    }}>
      {toast.pesan}
    </div>
  );
};

// ─── Komponen Overlay Modal ───────────────────────────────────────────────────
// Diletakkan di luar AdminDashboard agar tidak di-recreate saat state berubah
const Overlay = ({ children }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 1100,
    backgroundColor: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(5px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  }}>
    {children}
  </div>
);

// ─── Komponen Kartu Statistik ─────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon: Icon }) => (
  <div style={{
    backgroundColor: "white", padding: "20px 22px",
    borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    borderLeft: `4px solid ${color}`,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", margin: 0 }}>
          {label}
        </p>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", margin: "6px 0 0" }}>
          {value}
        </h2>
        {sub && (
          <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>{sub}</p>
        )}
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color={color} />
      </div>
    </div>
  </div>
);

// ─── Komponen Item Activity Log ───────────────────────────────────────────────
const ActivityItem = ({ log }) => {
  const iconMap = {
    tambah: { icon: CheckCircle, color: "#22c55e", bg: "#f0fdf4" },
    edit:   { icon: AlertCircle, color: "#f59e0b", bg: "#fffbeb" },
    hapus:  { icon: XCircle,     color: "#ef4444", bg: "#fef2f2" },
  };
  const { icon: Icon, color, bg } = iconMap[log.aksi] || iconMap.tambah;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 0", borderBottom: "1px solid #f8fafc",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        backgroundColor: bg, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, margin: 0 }}>
          {log.pesan}
        </p>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
          {log.waktu}
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Komponen utama AdminDashboard
// ═══════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const navigate    = useNavigate();
  const location    = useLocation();

  // ─── State ────────────────────────────────────────────────────────────────
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activePage,  setActivePage]  = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast,       setToast]       = useState(null);

  // Activity log — disimpan di state agar persisten selama sesi
  const [activityLog, setActivityLog] = useState([]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  // Menampilkan notifikasi singkat
  const showToast = useCallback((pesan, tipe = "success") => {
    setToast({ pesan, tipe });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Menambahkan entri ke activity log
  const addLog = useCallback((aksi, pesan) => {
    const now = new Date();
    const waktu = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      + " — " + now.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    setActivityLog(prev => [{ aksi, pesan, waktu, id: Date.now() }, ...prev].slice(0, 20));
  }, []);

  // Mengambil data parkir dari API
  const fetchData = useCallback(() => {
    axios.get(`${API}/parkir`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Sinkronisasi halaman aktif jika dinavigasi dari halaman lain
  useEffect(() => {
    const state = location.state;
    if (state?.page) setActivePage(state.page);
  }, [location]);

  // ─── Kalkulasi statistik ──────────────────────────────────────────────────
  const getStatus = (item) => {
    const now = new Date();
    const jam = now.getHours() * 60 + now.getMinutes();
    if (!item.jam_buka || !item.jam_tutup) return "Buka";
    const [bH, bM] = item.jam_buka.split(":").map(Number);
    const [tH, tM] = item.jam_tutup.split(":").map(Number);
    return jam >= bH * 60 + bM && jam <= tH * 60 + tM ? "Buka" : "Tutup";
  };

  const totalBuka        = data.filter(d => getStatus(d) === "Buka").length;
  const totalSlotMobil   = data.reduce((a, b) => a + (b.kapasitas_mobil  || 0), 0);
  const totalSlotMotor   = data.reduce((a, b) => a + (b.kapasitas_motor  || 0), 0);
  const pctBuka          = data.length ? Math.round((totalBuka / data.length) * 100) : 0;

  // ─── Handler logout ───────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("isAdminAuth");
    navigate("/");
  };

  // ─── Navigasi antar halaman ───────────────────────────────────────────────
  const handleNavigate = (page) => {
    setActivePage(page);
    // Kirim fungsi helper ke halaman anak melalui state navigasi internal
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* CSS global: sembunyikan scrollbar sidebar */}
      <style>{`
        .admin-sidebar::-webkit-scrollbar { display: none; }
        .admin-sidebar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .page-anim { animation: fadeIn 0.25s ease-out; }
      `}</style>

      <div style={{
        display: "flex", minHeight: "100vh",
        backgroundColor: "#f1f5f9",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        {/* Konten utama */}
        <main style={{
          flex: 1, padding: "32px 36px", overflowY: "auto",
          marginLeft: sidebarOpen ? 240 : 0,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}>
          {/* Tombol buka sidebar */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                position: "fixed", top: 16, left: 16, zIndex: 999,
                width: 42, height: 42, backgroundColor: "#0f172a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              }}
            >
              <Menu size={19} />
            </button>
          )}

          {/* ── Halaman Dashboard ─────────────────────────────────────────── */}
          {activePage === "dashboard" && (
            <PageDashboard
              data={data}
              loading={loading}
              totalBuka={totalBuka}
              totalSlotMobil={totalSlotMobil}
              totalSlotMotor={totalSlotMotor}
              pctBuka={pctBuka}
              activityLog={activityLog}
              getStatus={getStatus}
            />
          )}

          {/* ── Halaman Kelola Parkir ──────────────────────────────────────── */}
          {activePage === "parkir" && (
            <PageKelolaParkir
              data={data}
              loading={loading}
              fetchData={fetchData}
              showToast={showToast}
              addLog={addLog}
              getStatus={getStatus}
            />
          )}

          {/* ── Halaman Statistik ─────────────────────────────────────────── */}
          {activePage === "statistik" && (
            <PageStatistik data={data} />
          )}

          {/* ── Halaman Peta Admin ────────────────────────────────────────── */}
          {activePage === "peta" && (
            <PagePeta
              data={data}
              onEdit={(item) => {
                // Pindah ke halaman kelola lalu trigger edit
                handleNavigate("parkir");
              }}
            />
          )}

          {/* ── Halaman Tentang ───────────────────────────────────────────── */}
          {activePage === "tentang" && (
            <PageTentang onLogout={handleLogout} />
          )}
        </main>
      </div>

      <Toast toast={toast} />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-halaman: Dashboard Overview
// ═══════════════════════════════════════════════════════════════════════════════
const PageDashboard = ({
  data, loading, totalBuka, totalSlotMobil, totalSlotMotor, pctBuka,
  activityLog, getStatus,
}) => {
  // Lima lokasi parkir terakhir ditambahkan (berdasarkan id tertinggi)
  const recentData = [...data].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="page-anim">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
          Selamat datang kembali — ringkasan data WebGIS Parkir Ratu Agung
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Lokasi"    value={data.length}       color="#2563eb" icon={MapPin}      sub="Titik parkir terdaftar" />
        <StatCard label="Sedang Buka"     value={`${pctBuka}%`}     color="#22c55e" icon={TrendingUp}   sub={`${totalBuka} dari ${data.length} lokasi`} />
        <StatCard label="Kapasitas Mobil" value={totalSlotMobil}    color="#8b5cf6" icon={Car}          sub="Total slot tersedia" />
        <StatCard label="Kapasitas Motor" value={totalSlotMotor}    color="#f59e0b" icon={Bike}         sub="Total slot tersedia" />
      </div>

      {/* Baris tengah: tabel terbaru + activity log */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>

        {/* Tabel 5 lokasi terbaru */}
        <div style={{
          backgroundColor: "white", borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden",
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#0f172a" }}>
              🅿️ Lokasi Parkir Terbaru
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
              5 data terakhir yang ditambahkan
            </p>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13 }}>
              Memuat data...
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f8fafc" }}>
                <tr>
                  {["Nama Lokasi", "Jenis", "Kapasitas", "Status"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: "left",
                      fontSize: 11, fontWeight: 700, color: "#64748b",
                      textTransform: "uppercase", borderBottom: "1px solid #f1f5f9",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentData.map(item => {
                  const buka = getStatus(item) === "Buka";
                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{item.nama}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.alamat || "-"}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#475569", textTransform: "capitalize" }}>
                        {item.jenis_lahan || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#475569" }}>
                        🚗 {item.kapasitas_mobil} / 🏍️ {item.kapasitas_motor}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          backgroundColor: (buka ? "#22c55e" : "#ef4444") + "18",
                          color: buka ? "#22c55e" : "#ef4444",
                          padding: "3px 10px", borderRadius: 20,
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {buka ? "Buka" : "Tutup"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Activity Log */}
        <div style={{
          backgroundColor: "white", borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden",
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#0f172a" }}>
              <Activity size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Activity Log
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Aktivitas admin terbaru</p>
          </div>
          <div style={{ padding: "8px 20px", maxHeight: 340, overflowY: "auto" }}>
            {activityLog.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
                Belum ada aktivitas dalam sesi ini
              </p>
            ) : (
              activityLog.map(log => <ActivityItem key={log.id} log={log} />)
            )}
          </div>
        </div>
      </div>

      {/* Ringkasan status jam operasional */}
      <div style={{
        backgroundColor: "white", borderRadius: 16, marginTop: 20,
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "20px 24px",
      }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>
          ⏱️ Status Operasional Saat Ini
        </h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {data.slice(0, 8).map(item => {
            const buka = getStatus(item) === "Buka";
            return (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 14px", borderRadius: 10,
                backgroundColor: buka ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${buka ? "#bbf7d0" : "#fecaca"}`,
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  backgroundColor: buka ? "#22c55e" : "#ef4444",
                }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: buka ? "#15803d" : "#b91c1c" }}>
                  {item.nama.replace("Parkir ", "")}
                </span>
              </div>
            );
          })}
          {data.length > 8 && (
            <div style={{
              padding: "8px 14px", borderRadius: 10,
              backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
              fontSize: 12, color: "#64748b", fontWeight: 600,
            }}>
              +{data.length - 8} lainnya
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-halaman: Kelola Parkir (CRUD)
// ═══════════════════════════════════════════════════════════════════════════════

// Style input form yang konsisten
const inputStyle = {
  width: "100%", padding: "10px 13px", borderRadius: 10,
  border: "1px solid #e2e8f0", fontSize: 14, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
  backgroundColor: "#fff", color: "#0f172a",
};

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#64748b",
  marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em",
};

// Nilai awal form kosong
const EMPTY_FORM = {
  nama: "", alamat: "", jenis_lahan: "terbuka",
  kapasitas_mobil: "", kapasitas_motor: "",
  jam_buka: "08:00", jam_tutup: "21:00",
  latitude: "", longitude: "",
};

const PageKelolaParkir = ({ data, loading, fetchData, showToast, addLog, getStatus }) => {
  const [modal,    setModal]    = useState(null); // "add" | "edit" | "delete" | null
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [editId,   setEditId]   = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const PER_PAGE = 8;

  // ─── Fungsi CRUD ──────────────────────────────────────────────────────────

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };

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
      nama: form.nama, alamat: form.alamat, jenis_lahan: form.jenis_lahan,
      kapasitas_mobil: Number(form.kapasitas_mobil) || 0,
      kapasitas_motor: Number(form.kapasitas_motor) || 0,
      jam_buka: form.jam_buka || null, jam_tutup: form.jam_tutup || null,
      latitude: Number(form.latitude), longitude: Number(form.longitude),
    };
    try {
      if (modal === "add") {
        await axios.post(`${API}/parkir`, payload);
        addLog("tambah", `Menambahkan lokasi "${form.nama}"`);
        showToast("✅ Lokasi parkir berhasil ditambahkan!");
      } else {
        await axios.put(`${API}/parkir/${editId}`, payload);
        addLog("edit", `Mengedit data "${form.nama}"`);
        showToast("✅ Data parkir berhasil diperbarui!");
      }
      fetchData();
      closeModal();
    } catch (err) {
      alert("Gagal menyimpan: " + (err.response?.data?.detail || err.message));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const nama = data.find(d => d.id === deleteId)?.nama || "lokasi ini";
    try {
      await axios.delete(`${API}/parkir/${deleteId}`);
      addLog("hapus", `Menghapus lokasi "${nama}"`);
      showToast("🗑️ Lokasi parkir berhasil dihapus!", "error");
      fetchData();
      closeModal();
    } catch {
      alert("Gagal menghapus data");
    }
  };

  // Export ke CSV
  const exportCSV = () => {
    const headers = ["ID","Nama","Alamat","Jenis Lahan","Kap. Mobil","Kap. Motor","Jam Buka","Jam Tutup","Status"];
    const rows = data.map(item => [
      item.id, item.nama, item.alamat || "-", item.jenis_lahan || "-",
      item.kapasitas_mobil, item.kapasitas_motor,
      item.jam_buka?.substring(0,5) || "-",
      item.jam_tutup?.substring(0,5) || "-",
      getStatus(item),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a   = document.createElement("a");
    a.href = url; a.download = "data_parkir_ratu_agung.csv"; a.click();
    URL.revokeObjectURL(url);
    addLog("tambah", "Mengekspor data ke CSV");
  };

  // ─── Filter & pagination ──────────────────────────────────────────────────
  const filtered = data.filter(item =>
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    (item.alamat && item.alamat.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset ke halaman 1 jika filter berubah
  useEffect(() => { setPage(1); }, [search]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="page-anim">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Kelola Parkir</h1>
          <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>Kelola data titik parkir Kecamatan Ratu Agung</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={exportCSV} style={{
            backgroundColor: "#059669", color: "white", border: "none",
            padding: "11px 18px", borderRadius: 12, fontWeight: 700,
            fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
          }}>
            📥 Export CSV
          </button>
          <button onClick={openAdd} style={{
            backgroundColor: "#2563eb", color: "white", border: "none",
            padding: "11px 18px", borderRadius: 12, fontWeight: 700,
            fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
          }}>
            + Tambah Lokasi
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div style={{ backgroundColor: "white", borderRadius: 18, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {/* Search bar */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau alamat parkir..."
              style={{ ...inputStyle, paddingLeft: 34, fontSize: 13 }}
            />
          </div>
          {search && (
            <button onClick={() => setSearch("")} style={{
              padding: "9px 13px", borderRadius: 10, border: "1px solid #e2e8f0",
              background: "white", cursor: "pointer", fontSize: 12, color: "#64748b", fontWeight: 700,
            }}>
              Reset
            </button>
          )}
          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
            {filtered.length} lokasi ditemukan
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Memuat data...</div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f8fafc" }}>
                <tr>
                  {["Nama Lokasi","Jenis Lahan","Status","Kapasitas","Jam Operasional","Aksi"].map(h => (
                    <th key={h} style={{
                      padding: "11px 16px", textAlign: "left", color: "#64748b",
                      fontSize: "0.7rem", textTransform: "uppercase",
                      borderBottom: "1px solid #f1f5f9", fontWeight: 700,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(item => {
                  const buka = getStatus(item) === "Buka";
                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{item.nama}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.alamat || "-"}</div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#334155", textTransform: "capitalize" }}>
                        {item.jenis_lahan || "-"}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{
                          backgroundColor: (buka ? "#22c55e" : "#ef4444") + "18",
                          color: buka ? "#22c55e" : "#ef4444",
                          padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                        }}>
                          {buka ? "● Buka" : "● Tutup"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#475569" }}>
                        🚗 {item.kapasitas_mobil} &nbsp;|&nbsp; 🏍️ {item.kapasitas_motor}
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#475569" }}>
                        {item.jam_buka?.substring(0,5) || "-"} – {item.jam_tutup?.substring(0,5) || "-"}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 7 }}>
                          <button onClick={() => openEdit(item)} style={{
                            width: 32, height: 32, backgroundColor: "#eff6ff",
                            border: "none", borderRadius: 8, cursor: "pointer", color: "#2563eb",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }} title="Edit">
                            ✏️
                          </button>
                          <button onClick={() => openDelete(item.id)} style={{
                            width: 32, height: 32, backgroundColor: "#fef2f2",
                            border: "none", borderRadius: 8, cursor: "pointer", color: "#ef4444",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }} title="Hapus">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                padding: "12px 18px", borderTop: "1px solid #f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Halaman {page} dari {totalPages} ({filtered.length} total)
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
                      backgroundColor: "white", cursor: page === 1 ? "not-allowed" : "pointer",
                      fontSize: 12, color: page === 1 ? "#cbd5e1" : "#334155", fontWeight: 600,
                    }}
                  >← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        border: p === page ? "none" : "1px solid #e2e8f0",
                        backgroundColor: p === page ? "#2563eb" : "white",
                        color: p === page ? "white" : "#334155",
                        cursor: "pointer", fontSize: 12, fontWeight: 700,
                      }}
                    >{p}</button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
                      backgroundColor: "white", cursor: page === totalPages ? "not-allowed" : "pointer",
                      fontSize: 12, color: page === totalPages ? "#cbd5e1" : "#334155", fontWeight: 600,
                    }}
                  >Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal Tambah / Edit ────────────────────────────────────────────── */}
      {(modal === "add" || modal === "edit") && (
        <Overlay>
          <div style={{
            backgroundColor: "white", borderRadius: 20, width: "100%", maxWidth: 540,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden",
          }}>
            {/* Header modal */}
            <div style={{
              padding: "18px 24px", borderBottom: "1px solid #f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              backgroundColor: "#f8fafc",
            }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#0f172a" }}>
                {modal === "add" ? "✨ Tambah Lokasi Parkir" : "✏️ Edit Lokasi Parkir"}
              </h3>
              <button onClick={closeModal} style={{
                background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18,
              }}>✕</button>
            </div>

            {/* Body modal */}
            <div style={{
              padding: "22px 24px",
              display: "flex", flexDirection: "column", gap: 14,
              maxHeight: "calc(100vh - 180px)", overflowY: "auto",
            }}>
              <div>
                <label style={labelStyle}>Nama Lokasi *</label>
                <input
                  value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Parkir Pasar Minggu"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Alamat Lengkap</label>
                <textarea
                  value={form.alamat}
                  onChange={e => setForm({ ...form, alamat: e.target.value })}
                  placeholder="Nama jalan, nomor, RT/RW..."
                  style={{ ...inputStyle, height: 68, resize: "none" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Latitude *</label>
                  <input type="number" step="any" value={form.latitude}
                    onChange={e => setForm({ ...form, latitude: e.target.value })}
                    placeholder="-3.80123" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Longitude *</label>
                  <input type="number" step="any" value={form.longitude}
                    onChange={e => setForm({ ...form, longitude: e.target.value })}
                    placeholder="102.26123" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Jenis Lahan</label>
                <select value={form.jenis_lahan}
                  onChange={e => setForm({ ...form, jenis_lahan: e.target.value })}
                  style={inputStyle}>
                  <option value="terbuka">Terbuka (Halaman/Jalan)</option>
                  <option value="gedung">Gedung / Indoor</option>
                  <option value="kanopi">Berkanopi / Atap</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Kapasitas Mobil</label>
                  <input type="number" value={form.kapasitas_mobil}
                    onChange={e => setForm({ ...form, kapasitas_mobil: e.target.value })}
                    placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Kapasitas Motor</label>
                  <input type="number" value={form.kapasitas_motor}
                    onChange={e => setForm({ ...form, kapasitas_motor: e.target.value })}
                    placeholder="0" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Jam Buka</label>
                  <input type="time" value={form.jam_buka}
                    onChange={e => setForm({ ...form, jam_buka: e.target.value })}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Jam Tutup</label>
                  <input type="time" value={form.jam_tutup}
                    onChange={e => setForm({ ...form, jam_tutup: e.target.value })}
                    style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div style={{
              padding: "14px 24px", borderTop: "1px solid #f1f5f9",
              display: "flex", justifyContent: "flex-end", gap: 10, backgroundColor: "#f8fafc",
            }}>
              <button onClick={closeModal} style={{
                padding: "10px 18px", borderRadius: 10, border: "1px solid #e2e8f0",
                backgroundColor: "white", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>Batal</button>
              <button onClick={handleSave} disabled={saving} style={{
                padding: "10px 20px", borderRadius: 10, border: "none",
                backgroundColor: "#2563eb", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>
                {saving ? "Menyimpan..." : "💾 Simpan Data"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Modal Konfirmasi Hapus ─────────────────────────────────────────── */}
      {modal === "delete" && (
        <Overlay>
          <div style={{
            backgroundColor: "white", borderRadius: 20, width: "100%", maxWidth: 380,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden",
          }}>
            <div style={{ padding: "28px 24px 20px", textAlign: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                backgroundColor: "#fef2f2", color: "#ef4444",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                fontSize: 22,
              }}>⚠️</div>
              <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 900, color: "#0f172a" }}>
                Hapus Lokasi Parkir?
              </h3>
              {/* Tampilkan nama lokasi yang akan dihapus */}
              <div style={{
                backgroundColor: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 10, padding: "10px 14px", margin: "12px 0", textAlign: "left",
              }}>
                <p style={{ color: "#ef4444", fontSize: 13, fontWeight: 700, margin: 0 }}>
                  {data.find(d => d.id === deleteId)?.nama || "Lokasi ini"}
                </p>
                <p style={{ color: "#94a3b8", fontSize: 11, margin: "3px 0 0" }}>
                  {data.find(d => d.id === deleteId)?.alamat || ""}
                </p>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                Data akan dihapus permanen dan tidak bisa dikembalikan.
              </p>
            </div>
            <div style={{
              padding: "14px 20px", backgroundColor: "#f8fafc",
              borderTop: "1px solid #f1f5f9", display: "flex", gap: 10,
            }}>
              <button onClick={closeModal} style={{
                flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #e2e8f0",
                backgroundColor: "white", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>Batal</button>
              <button onClick={handleDelete} style={{
                flex: 1, padding: "10px", borderRadius: 10, border: "none",
                backgroundColor: "#ef4444", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>Ya, Hapus</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-halaman: Statistik
// ═══════════════════════════════════════════════════════════════════════════════
const PageStatistik = ({ data }) => {
  const [filterJenis, setFilterJenis] = useState("semua");

  // Filter data berdasarkan jenis lahan yang dipilih
  const filtered = filterJenis === "semua"
    ? data
    : data.filter(d => d.jenis_lahan === filterJenis);

  // Hitung distribusi jenis lahan untuk pie chart manual
  const terbuka = data.filter(d => d.jenis_lahan === "terbuka").length;
  const gedung  = data.filter(d => d.jenis_lahan === "gedung").length;
  const kanopi  = data.filter(d => d.jenis_lahan === "kanopi").length;
  const total   = data.length || 1;

  // Top 5 parkir berdasarkan total kapasitas
  const top5 = [...filtered]
    .sort((a, b) => (b.kapasitas_mobil + b.kapasitas_motor) - (a.kapasitas_mobil + a.kapasitas_motor))
    .slice(0, 5);
  const maxKap = top5[0] ? top5[0].kapasitas_mobil + top5[0].kapasitas_motor : 1;

  return (
    <div className="page-anim">
      {/* Header + Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Statistik</h1>
          <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>Analitik dan visualisasi data parkir</p>
        </div>
        {/* Filter jenis lahan */}
        <div style={{ display: "flex", gap: 8 }}>
          {["semua","terbuka","gedung","kanopi"].map(j => (
            <button key={j} onClick={() => setFilterJenis(j)} style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
              backgroundColor: filterJenis === j ? "#2563eb" : "white",
              color: filterJenis === j ? "white" : "#64748b",
              fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize",
            }}>
              {j === "semua" ? "Semua" : j}
            </button>
          ))}
        </div>
      </div>

      {/* Ringkasan angka */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Lokasi Dianalisis", val: filtered.length, color: "#2563eb" },
          { label: "Total Slot Mobil", val: filtered.reduce((a,b)=>a+(b.kapasitas_mobil||0),0), color: "#8b5cf6" },
          { label: "Total Slot Motor", val: filtered.reduce((a,b)=>a+(b.kapasitas_motor||0),0), color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{
            backgroundColor: "white", padding: "18px 20px",
            borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            borderLeft: `4px solid ${s.color}`,
          }}>
            <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", margin: 0 }}>
              {s.label}
            </p>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", margin: "6px 0 0" }}>{s.val}</h2>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Distribusi jenis lahan */}
        <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "22px 24px" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>
            🥧 Distribusi Jenis Lahan
          </h3>
          {[
            { label: "Terbuka", count: terbuka, color: "#3b82f6" },
            { label: "Gedung",  count: gedung,  color: "#8b5cf6" },
            { label: "Kanopi",  count: kanopi,  color: "#f59e0b" },
          ].map(({ label, count, color }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{label}</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  {count} lokasi ({Math.round((count/total)*100)}%)
                </span>
              </div>
              <div style={{ height: 10, backgroundColor: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${(count/total)*100}%`,
                  backgroundColor: color, borderRadius: 99,
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Top 5 kapasitas terbesar */}
        <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "22px 24px" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>
            🏆 Top 5 Kapasitas Terbesar
          </h3>
          {top5.map((item, i) => {
            const kap = item.kapasitas_mobil + item.kapasitas_motor;
            return (
              <div key={item.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#334155", fontWeight: 700 }}>
                    #{i+1} {item.nama.replace("Parkir ","")}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{kap} slot</span>
                </div>
                <div style={{ height: 8, backgroundColor: "#f1f5f9", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${(kap/maxKap)*100}%`,
                    backgroundColor: ["#2563eb","#22c55e","#f59e0b","#ef4444","#8b5cf6"][i],
                    borderRadius: 8, transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabel detail kapasitas */}
      <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#0f172a" }}>
            📋 Tabel Detail Kapasitas
          </h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f8fafc" }}>
            <tr>
              {["Nama Lokasi","Jenis","Mobil","Motor","Total","Proporsi Mobil"].map(h => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left", fontSize: 11,
                  fontWeight: 700, color: "#64748b", textTransform: "uppercase",
                  borderBottom: "1px solid #f1f5f9",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const totalKap = item.kapasitas_mobil + item.kapasitas_motor || 1;
              const pctMobil = Math.round((item.kapasitas_mobil / totalKap) * 100);
              return (
                <tr key={item.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "11px 16px", fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                    {item.nama}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: "#475569", textTransform: "capitalize" }}>
                    {item.jenis_lahan || "-"}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700, color: "#2563eb" }}>
                    {item.kapasitas_mobil}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>
                    {item.kapasitas_motor}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 900, color: "#0f172a" }}>
                    {item.kapasitas_mobil + item.kapasitas_motor}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, backgroundColor: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pctMobil}%`, backgroundColor: "#2563eb", borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#64748b", minWidth: 30 }}>{pctMobil}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-halaman: Peta Admin
// ═══════════════════════════════════════════════════════════════════════════════
const PagePeta = ({ data, onEdit }) => {
  const [selected, setSelected] = useState(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = window.L;
      if (!L) return;

      // Kalau map sudah ada, hapus dulu sebelum buat baru
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map("admin-map").setView([-3.8013, 102.2613], 14);
      mapInstanceRef.current = map;  // simpan instance

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      data.forEach(item => {
        if (!item.latitude || !item.longitude) return;
        const marker = L.marker([item.latitude, item.longitude]).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:180px">
            <strong style="font-size:14px;color:#0f172a">${item.nama}</strong><br/>
            <span style="font-size:12px;color:#64748b">${item.alamat || "-"}</span><br/>
            <hr style="margin:8px 0;border-color:#f1f5f9"/>
            <span style="font-size:12px">🚗 ${item.kapasitas_mobil} mobil</span><br/>
            <span style="font-size:12px">🏍️ ${item.kapasitas_motor} motor</span><br/>
            <span style="font-size:12px">⏱️ ${item.jam_buka?.substring(0,5)||"-"} – ${item.jam_tutup?.substring(0,5)||"-"}</span>
          </div>
        `);
      });
    };

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    // Cleanup: hapus map instance saat unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="page-anim">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Peta Admin</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
          Visualisasi spasial {data.length} titik parkir — klik marker untuk detail
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        {/* Kontainer peta Leaflet */}
        <div style={{
          backgroundColor: "white", borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden",
          height: 540,
        }}>
          <div id="admin-map" style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Panel daftar lokasi */}
        <div style={{
          backgroundColor: "white", borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#0f172a" }}>
              📍 Daftar Titik ({data.length})
            </h3>
          </div>
          <div style={{ overflowY: "auto", maxHeight: 490 }}>
            {data.map(item => (
              <div
                key={item.id}
                onClick={() => setSelected(selected?.id === item.id ? null : item)}
                style={{
                  padding: "11px 14px", borderBottom: "1px solid #f8fafc",
                  cursor: "pointer",
                  backgroundColor: selected?.id === item.id ? "#eff6ff" : "white",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{item.nama}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                  {item.latitude?.toFixed(5)}, {item.longitude?.toFixed(5)}
                </div>
                {selected?.id === item.id && (
                  <div style={{ marginTop: 8, fontSize: 11, color: "#475569" }}>
                    <div>🚗 {item.kapasitas_mobil} &nbsp;|&nbsp; 🏍️ {item.kapasitas_motor}</div>
                    <div>⏱️ {item.jam_buka?.substring(0,5)||"-"} – {item.jam_tutup?.substring(0,5)||"-"}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-halaman: Tentang
// ═══════════════════════════════════════════════════════════════════════════════
const PageTentang = ({ onLogout }) => {
  const [statusAPI, setStatusAPI] = useState("Memeriksa...");

  // Cek konektivitas ke backend saat halaman dimuat
  useEffect(() => {
    axios.get(`${API}/parkir`)
      .then(() => setStatusAPI("Online ✅"))
      .catch(() => setStatusAPI("Offline ❌"));
  }, []);

  const tim = [
    { nama: "Hanifah Hasanah",        nim: "123140082", peran: "Ketua & Dokumentasi" },
    { nama: "Afifa Aulia",            nim: "123140073", peran: "Backend Developer"   },
    { nama: "Ariq Ramadhinov Ronny",  nim: "123140105", peran: "Database Engineer"   },
    { nama: "M. Farhan Muzakhi",      nim: "123140075", peran: "Frontend Developer"  },
  ];

  const infoApp = [
    { label: "Nama Aplikasi",  val: "WebGIS Parkir Publik"            },
    { label: "Versi",          val: "2.0.0"                           },
    { label: "Wilayah Studi",  val: "Kecamatan Ratu Agung, Bengkulu"  },
    { label: "Backend",        val: "FastAPI (Python)"                },
    { label: "Database",       val: "PostgreSQL + PostGIS"            },
    { label: "Frontend",       val: "React.js + Leaflet.js"           },
    { label: "Semester",       val: "Genap 2025/2026"                 },
    { label: "Status API",     val: statusAPI                         },
  ];

  return (
    <div className="page-anim">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Tentang Aplikasi</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>Informasi sistem dan tim pengembang</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Informasi aplikasi */}
        <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "22px 24px" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>ℹ️ Informasi Aplikasi</h3>
          {infoApp.map(item => (
            <div key={item.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0", borderBottom: "1px solid #f1f5f9",
            }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>{item.val}</span>
            </div>
          ))}
        </div>

        {/* Tim pengembang */}
        <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "22px 24px" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>👥 Tim Pengembang</h3>
          {tim.map(t => (
            <div key={t.nim} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 0", borderBottom: "1px solid #f1f5f9",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                backgroundColor: "#eff6ff", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 900, color: "#2563eb",
              }}>
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

      {/* Teknologi yang digunakan */}
      <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "22px 24px", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>🔧 Teknologi</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {["React.js","Leaflet.js","FastAPI","PostgreSQL","PostGIS","Axios","React Router","Lucide React"].map(tech => (
            <span key={tech} style={{
              padding: "6px 14px", borderRadius: 20,
              backgroundColor: "#eff6ff", color: "#2563eb",
              fontSize: 12, fontWeight: 700, border: "1px solid #bfdbfe",
            }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Tombol logout */}
      <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", padding: "22px 24px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 900, color: "#0f172a" }}>🔐 Keluar dari Sistem</h3>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
          Klik tombol di bawah untuk mengakhiri sesi admin
        </p>
        <button onClick={onLogout} style={{
          backgroundColor: "#ef4444", color: "white", border: "none",
          padding: "11px 22px", borderRadius: 12, fontWeight: 700,
          cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
        }}>
          <LogOut size={15} /> Keluar dari Admin Portal
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;