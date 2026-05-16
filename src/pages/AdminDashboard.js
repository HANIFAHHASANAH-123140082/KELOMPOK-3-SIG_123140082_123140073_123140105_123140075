import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  LayoutDashboard,
  Database,
  Settings,
  LogOut,
  X,
  Save,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { parkingLocations as initialData } from "../data/parkingData";

const EMPTY = {
  nama: "",
  alamat: "",
  tipe: "Mobil & Motor",
  status: "Buka",
  slotTersedia: "",
  totalSlot: "",
  jamOperasional: "",
  rating: "",
  lat: "",
  lng: "",
  tarif: { mobil: "Rp 3.000", motor: "Rp 2.000" },
  fasilitas: "",
  img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800",
};

const statusColor = (s) =>
  s === "Buka" ? "#22c55e" : s === "Penuh" ? "#f97316" : "#ef4444";

const inputStyle = {
  width: "100%",
  padding: "10px 13px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  backgroundColor: "#fff",
  color: "#0f172a",
};

const selectStyle = { ...inputStyle, cursor: "pointer" };

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(initialData);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const openAdd = () => {
    setForm(EMPTY);
    setModal("add");
  };
  const openEdit = (item) => {
    setForm({ ...item, fasilitas: item.fasilitas.join(", ") });
    setEditId(item.id);
    setModal("edit");
  };
  const openDelete = (id) => {
    setDeleteId(id);
    setModal("delete");
  };
  const closeModal = () => {
    setModal(null);
    setEditId(null);
    setDeleteId(null);
  };

  const handleSave = () => {
    if (!form.nama.trim() || !form.alamat.trim()) {
      alert("Nama dan Alamat wajib diisi!");
      return;
    }
    const entry = {
      ...form,
      id: editId ?? Date.now(),
      slotTersedia: Number(form.slotTersedia) || 0,
      totalSlot: Number(form.totalSlot) || 0,
      rating: Number(form.rating) || 0,
      lat: Number(form.lat) || 0,
      lng: Number(form.lng) || 0,
      fasilitas: form.fasilitas
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
    };
    if (modal === "add") setData((p) => [...p, entry]);
    else setData((p) => p.map((d) => (d.id === editId ? entry : d)));
    closeModal();
  };

  const handleDelete = () => {
    setData((p) => p.filter((d) => d.id !== deleteId));
    closeModal();
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuth");
    navigate("/");
  };

  const Overlay = ({ children }) => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {children}
    </div>
  );

  const sidebarItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 14px",
    borderRadius: 12,
    color: "#64748b",
    cursor: "pointer",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s",
    background: "none",
    border: "none",
    width: "100%",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <nav
        style={{
          width: 250,
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "white",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ marginBottom: 28, paddingLeft: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                borderRadius: 10,
                padding: 8,
              }}
            >
              <MapPin size={16} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                ADMIN PORTAL
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#334155",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                RatuAgungGIS v2.0
              </div>
            </div>
          </div>
        </div>

        <Link
          to="/admin"
          style={{
            ...sidebarItemStyle,
            backgroundColor: "#1e293b",
            color: "white",
          }}
        >
          <LayoutDashboard size={17} /> Dashboard
        </Link>
        <div style={sidebarItemStyle}>
          <Database size={17} /> Data Spasial
        </div>
        <div style={sidebarItemStyle}>
          <Settings size={17} /> Pengaturan
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleLogout}
          style={{ ...sidebarItemStyle, color: "#f87171" }}
        >
          <LogOut size={17} /> Keluar
        </button>
      </nav>

      {/* MAIN */}
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Kelola Titik Parkir
            </h1>
            <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
              Kecamatan Ratu Agung, Kota Bengkulu
            </p>
          </div>
          <button
            onClick={openAdd}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: 13,
              boxShadow: "0 6px 18px rgba(37,99,235,0.3)",
            }}
          >
            <Plus size={17} /> Tambah Lokasi Baru
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 18,
            marginBottom: 28,
          }}
        >
          {[
            { label: "Total Parkir", val: data.length, color: "#2563eb" },
            {
              label: "Sedang Buka",
              val: data.filter((d) => d.status === "Buka").length,
              color: "#22c55e",
            },
            {
              label: "Penuh / Tutup",
              val: data.filter((d) => d.status !== "Buka").length,
              color: "#f97316",
            },
            {
              label: "Total Slot",
              val: data.reduce((a, b) => a + (b.totalSlot || 0), 0),
              color: "#8b5cf6",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                backgroundColor: "white",
                padding: "20px 22px",
                borderRadius: 16,
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                borderLeft: `4px solid ${s.color}`,
              }}
            >
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: 0,
                }}
              >
                {s.label}
              </p>
              <h2
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  margin: "7px 0 0",
                }}
              >
                {s.val}
              </h2>
            </div>
          ))}
        </div>

        {/* Table */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 18,
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f8fafc" }}>
              <tr>
                {[
                  "Nama Lokasi",
                  "Tipe",
                  "Status",
                  "Slot",
                  "Rating",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: "#64748b",
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #f1f5f9",
                      fontWeight: 700,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#0f172a",
                        fontSize: 14,
                      }}
                    >
                      {item.nama}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}
                    >
                      {item.alamat}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 13,
                      color: "#334155",
                    }}
                  >
                    {item.tipe}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        backgroundColor: statusColor(item.status) + "18",
                        color: statusColor(item.status),
                        padding: "4px 11px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 13,
                      color: "#334155",
                    }}
                  >
                    {item.slotTersedia}/{item.totalSlot}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 13,
                      color: "#334155",
                    }}
                  >
                    ⭐ {item.rating}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => openEdit(item)}
                      style={{
                        border: "none",
                        background: "#eff6ff",
                        color: "#2563eb",
                        padding: "8px 10px",
                        borderRadius: 8,
                        marginRight: 8,
                        cursor: "pointer",
                      }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => openDelete(item.id)}
                      style={{
                        border: "none",
                        background: "#fef2f2",
                        color: "#ef4444",
                        padding: "8px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
              <MapPin size={36} style={{ margin: "0 auto 10px" }} />
              <p style={{ fontWeight: 700 }}>Belum ada data parkir</p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL ADD/EDIT */}
      {(modal === "add" || modal === "edit") && (
        <Overlay>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 32,
              width: "100%",
              maxWidth: 580,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                {modal === "add" ? "Tambah Lokasi Baru" : "Edit Lokasi"}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Nama Lokasi *</label>
                <input
                  style={inputStyle}
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Parkir Mall Bengkulu"
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Alamat *</label>
                <input
                  style={inputStyle}
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  placeholder="Jl. Contoh No. 1, Ratu Agung"
                />
              </div>
              <div>
                <label style={labelStyle}>Tipe Kendaraan</label>
                <select
                  style={selectStyle}
                  value={form.tipe}
                  onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                >
                  <option>Mobil & Motor</option>
                  <option>Mobil</option>
                  <option>Motor</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  style={selectStyle}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Buka</option>
                  <option>Penuh</option>
                  <option>Tutup</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Slot Tersedia</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.slotTersedia}
                  onChange={(e) =>
                    setForm({ ...form, slotTersedia: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label style={labelStyle}>Total Slot</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.totalSlot}
                  onChange={(e) =>
                    setForm({ ...form, totalSlot: e.target.value })
                  }
                  placeholder="50"
                />
              </div>
              <div>
                <label style={labelStyle}>Jam Operasional</label>
                <input
                  style={inputStyle}
                  value={form.jamOperasional}
                  onChange={(e) =>
                    setForm({ ...form, jamOperasional: e.target.value })
                  }
                  placeholder="08:00 - 22:00"
                />
              </div>
              <div>
                <label style={labelStyle}>Rating (0-5)</label>
                <input
                  style={inputStyle}
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  placeholder="4.5"
                />
              </div>
              <div>
                <label style={labelStyle}>Latitude</label>
                <input
                  style={inputStyle}
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  placeholder="-3.7955"
                />
              </div>
              <div>
                <label style={labelStyle}>Longitude</label>
                <input
                  style={inputStyle}
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  placeholder="102.2614"
                />
              </div>
              <div>
                <label style={labelStyle}>Tarif Mobil</label>
                <input
                  style={inputStyle}
                  value={form.tarif.mobil}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tarif: { ...form.tarif, mobil: e.target.value },
                    })
                  }
                  placeholder="Rp 3.000"
                />
              </div>
              <div>
                <label style={labelStyle}>Tarif Motor</label>
                <input
                  style={inputStyle}
                  value={form.tarif.motor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tarif: { ...form.tarif, motor: e.target.value },
                    })
                  }
                  placeholder="Rp 2.000"
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Fasilitas (pisahkan koma)</label>
                <input
                  style={inputStyle}
                  value={form.fasilitas}
                  onChange={(e) =>
                    setForm({ ...form, fasilitas: e.target.value })
                  }
                  placeholder="CCTV, Petugas, Penerangan"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 24,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  padding: "10px 22px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "10px 22px",
                  borderRadius: 12,
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 13,
                  boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                }}
              >
                <Save size={15} /> {modal === "add" ? "Simpan" : "Update"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* MODAL DELETE */}
      {modal === "delete" && (
        <Overlay>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 36,
              width: "100%",
              maxWidth: 400,
              textAlign: "center",
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                backgroundColor: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <AlertTriangle size={26} color="#ef4444" />
            </div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "1.05rem",
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              Hapus Lokasi?
            </h3>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 26px" }}>
              Data akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
};

export default AdminDashboard;
