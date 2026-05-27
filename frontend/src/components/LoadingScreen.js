import React, { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "#0a0f1e",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", zIndex: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* LOGO ANIMASI */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          border: "3px solid #1e293b",
          borderTop: "3px solid #3b82f6",
          animation: "spin 1s linear infinite",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 28
        }}>🗺️</div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <h2 style={{
        color: "white", fontSize: "1.4rem", fontWeight: 900,
        margin: "0 0 8px", animation: "fadeIn 0.5s ease"
      }}>
        WebGIS Parkir Publik
      </h2>

      <p style={{
        color: "#3b82f6", fontSize: 13, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.2em",
        margin: "0 0 32px"
      }}>
        Kecamatan Ratu Agung
      </p>

      {/* PROGRESS BAR */}
      <div style={{
        width: 200, height: 4, backgroundColor: "#1e293b",
        borderRadius: 10, overflow: "hidden", marginBottom: 16
      }}>
        <div style={{
          height: "100%", backgroundColor: "#3b82f6",
          borderRadius: 10, width: "70%",
          animation: "pulse 1.5s ease-in-out infinite"
        }} />
      </div>

      <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
        Memuat sistem{".".repeat(dots)}
      </p>
    </div>
  );
};

export default LoadingScreen;