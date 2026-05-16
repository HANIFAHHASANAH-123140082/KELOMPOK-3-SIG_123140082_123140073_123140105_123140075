import React from "react";
import { Link } from "react-router-dom";
import { Navigation, Map, Lock } from "lucide-react";

const HomePage = () => (
  <div
    style={{
      background: "#0f172a",
      minHeight: "100vh",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
    }}
  >
    <Navigation size={60} color="#3b82f6" />
    <h1 style={{ fontSize: "3rem", margin: "20px 0" }}>
      WebGIS <span style={{ color: "#3b82f6" }}>Parkir</span>
    </h1>
    <p style={{ color: "#94a3b8", marginBottom: "40px" }}>
      Sistem Informasi Parkir Publik Kecamatan Ratu Agung
    </p>
    <div style={{ display: "flex", gap: "20px" }}>
      <Link
        to="/map"
        style={{
          background: "#2563eb",
          color: "white",
          padding: "15px 30px",
          borderRadius: "12px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Buka Peta
      </Link>
      <Link
        to="/login"
        style={{
          background: "#1e293b",
          color: "white",
          padding: "15px 30px",
          borderRadius: "12px",
          textDecoration: "none",
          border: "1px solid #334155",
        }}
      >
        Admin Portal
      </Link>
    </div>
  </div>
);

export default HomePage;
