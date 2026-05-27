import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div style={{
    minHeight: "100vh", backgroundColor: "#0f172a", display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center",
    fontFamily: "'Plus Jakarta Sans', sans-serif", color: "white", padding: 20
  }}>
    <div style={{ fontSize: 120, fontWeight: 900, color: "#1e293b", lineHeight: 1 }}>404</div>
    <div style={{ fontSize: 80 }}>🗺️</div>
    <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: "16px 0 8px", textAlign: "center" }}>
      Halaman Tidak Ditemukan
    </h1>
    <p style={{ color: "#64748b", fontSize: 15, textAlign: "center", maxWidth: 400, marginBottom: 32 }}>
      Sepertinya kamu nyasar! Halaman yang kamu cari tidak ada di peta kami.
    </p>
    <div style={{ display: "flex", gap: 12 }}>
      <Link to="/" style={{ backgroundColor: "#2563eb", color: "white", padding: "12px 24px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
        🏠 Ke Beranda
      </Link>
      <Link to="/map" style={{ backgroundColor: "#1e293b", color: "white", padding: "12px 24px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 14, border: "1px solid #334155" }}>
        🗺️ Buka Peta
      </Link>
    </div>
    <div style={{ marginTop: 48, padding: "16px 24px", backgroundColor: "#1e293b", borderRadius: 12, border: "1px solid #334155" }}>
      <p style={{ color: "#475569", fontSize: 12, margin: 0, textAlign: "center" }}>
        WebGIS Parkir Publik · Kecamatan Ratu Agung · Kota Bengkulu
      </p>
    </div>
  </div>
);

export default NotFoundPage;