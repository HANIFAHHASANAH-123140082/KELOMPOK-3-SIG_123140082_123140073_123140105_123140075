import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Trash2, Edit, LayoutDashboard, Database,
  Settings, LogOut, X, Save, MapPin, AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api";

const statusColor = (s) =>
  s === "Buka" ? "#22c55e" : s === "Penuh" ? "#f97316" : "#ef4444";

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

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
    } catch (err) {
      alert("Gagal menyimpan data: " + (err.response?.data?.detail || err.message));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/parkir/${deleteId}`);
      fetchData();
      closeModal();
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

  const Overlay = ({ children }) => (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {children}
    </div>
  );

  const sidebarItem = { display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, color: "#64748b", cursor: "pointer", textDecoration: "none", fontSize: 14, fontWeight: 600, background: "none", border: "none", width: "100%" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* SIDEBAR */}
      <nav style={{ width: 250, minHeight: "100vh", backgroundColor: "#0f172a", color: "white", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ marginBottom: 28, paddingLeft: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)", borderRadius: 10, padding: 8 }}>
              <MapPin size={16} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "white" }}>ADMIN PORTAL</div>
              <div style={{ fontSize: 9, color: "#334155", fontWeight: 700, textTransform: "uppercase" }}>RatuAgungGIS v2.0</div>
            </div>
          </div>
        </div>
        <Link to="/admin" style={{ ...sidebarItem, backgroundColor: "#1e293b", color: "white" }}><LayoutDashboard size={17} /> Dashboard</Link>
        <div style={sidebarItem}><Database size={17} /> Data Spasial</div>
        <div style={sidebarItem}><Settings size={17} /> Pengaturan</div>
        <div style={{ flex: 1 }} />
        <button onClick={handleLogout} style={{ ...sidebarItem, color: "#f87171" }}><LogOut size={17} /> Keluar</button>
      </nav>

      {/* MAIN */}
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Kelola Titik Parkir</h1>
            <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>Kecamatan Ratu Agung, Kota Bengkulu</p>
          </div>
          <button onClick={openAdd} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px 20px", borderRadius: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
            <Plus size={17} /> Tambah Lokasi Baru
          </button>
        </div>

        {/* Stats */}
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

        {/* Table */}
        <div style={{ backgroundColor: "white", borderRadius: 18, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Memuat data...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f8fafc" }}>
                <tr>
                  {["Nama Lokasi", "Jenis", "Status", "Kapasitas", "Jam Operasional", "Aksi"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9", fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
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
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#334155" }}>🚗 {item.kapasitas_mobil} | 🏍️ {item.kapasitas_motor}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#334155" }}>
                      {item.jam_buka?.substring(0, 5)} - {item.jam_tutup?.substring(0, 5)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => openEdit(item)} style={{ border: "none", background: "#eff6ff", color: "#2563eb", padding: "8px 10px", borderRadius: 8, marginRight: 8, cursor: "pointer" }}><Edit size={14} /></button>
                      <button onClick={() => openDelete(item.id)} style={{ border: "none", background: "#fef2f2", color: "#ef4444", padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* MODAL ADD/EDIT */}
      {(modal === "add" || modal === "edit") && (
        <Overlay>
          <div style={{ backgroundColor: "white", borderRadius: 24, padding: 32, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#0f172a" }}>
                {modal === "add" ? "Tambah Lokasi Baru" : "Edit Lokasi"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Nama Lokasi *</label>
                <input style={inputStyle} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Parkir Pasar Ratu Agung" />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Alamat</label>
                <input style={inputStyle} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Jl. Contoh No. 1, Ratu Agung" />
              </div>
              <div>
                <label style={labelStyle}>Jenis Lahan</label>
                <select style={inputStyle} value={form.jenis_lahan} onChange={(e) => setForm({ ...form, jenis_lahan: e.target.value })}>
                  <option value="terbuka">Terbuka</option>
                  <option value="gedung">Gedung</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Kapasitas Mobil</label>
                <input style={inputStyle} type="number" value={form.kapasitas_mobil} onChange={(e) => setForm({ ...form, kapasitas_mobil: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label style={labelStyle}>Kapasitas Motor</label>
                <input style={inputStyle} type="number" value={form.kapasitas_motor} onChange={(e) => setForm({ ...form, kapasitas_motor: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label style={labelStyle}>Jam Buka</label>
                <input style={inputStyle} type="time" value={form.jam_buka} onChange={(e) => setForm({ ...form, jam_buka: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Jam Tutup</label>
                <input style={inputStyle} type="time" value={form.jam_tutup} onChange={(e) => setForm({ ...form, jam_tutup: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Latitude *</label>
                <input style={inputStyle} type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-3.7988" />
              </div>
              <div>
                <label style={labelStyle}>Longitude *</label>
                <input style={inputStyle} type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="102.2614" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={closeModal} style={{ padding: "10px 22px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 700, color: "#64748b", fontSize: 13 }}>Batal</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: "#2563eb", color: "white", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 7, fontSize: 13 }}>
                <Save size={15} /> {saving ? "Menyimpan..." : modal === "add" ? "Simpan" : "Update"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* MODAL DELETE */}
      {modal === "delete" && (
        <Overlay>
          <div style={{ backgroundColor: "white", borderRadius: 24, padding: 36, width: "100%", maxWidth: 400, textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <AlertTriangle size={26} color="#ef4444" />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem", fontWeight: 900, color: "#0f172a" }}>Hapus Lokasi?</h3>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 26px" }}>Data akan dihapus permanen dari database.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={closeModal} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 700, color: "#64748b", fontSize: 13 }}>Batal</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#ef4444", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Ya, Hapus</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
};

export default AdminDashboard;