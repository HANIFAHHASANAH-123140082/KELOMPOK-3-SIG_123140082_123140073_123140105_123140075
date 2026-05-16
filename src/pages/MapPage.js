import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { parkingLocations } from "../data/parkingData";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Car,
} from "lucide-react";

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

const statusIcon = (s) =>
  s === "Buka"
    ? createIcon("#22c55e")
    : s === "Penuh"
      ? createIcon("#f97316")
      : createIcon("#ef4444");

const statusColor = (s) =>
  s === "Buka" ? "#22c55e" : s === "Penuh" ? "#f97316" : "#ef4444";

const FlyAndOpen = ({ target, markerRefs }) => {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], 17, { duration: 1.2 });
    setTimeout(() => {
      markerRefs.current[target.id]?.openPopup();
    }, 1350);
  }, [target]);
  return null;
};

const MapPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [selected, setSelected] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const markerRefs = useRef({});

  const filtered = parkingLocations.filter((p) => {
    const matchSearch =
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.alamat.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "Semua" ||
      (filter === "Mobil" && p.tipe.includes("Mobil")) ||
      (filter === "Motor" && p.tipe.includes("Motor"));
    return matchSearch && matchFilter;
  });

  const handleSelect = (item) => {
    setSelected(item);
    setFlyTarget({ ...item, _t: Date.now() });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: 370,
          minWidth: 370,
          height: "100vh",
          backgroundColor: "#0f172a",
          display: "flex",
          flexDirection: "column",
          zIndex: 1000,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "20px 18px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              color: "#64748b",
              textDecoration: "none",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 14,
            }}
          >
            <ArrowLeft size={13} /> Kembali ke Home
          </Link>
          <h2
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: "1.2rem",
              margin: 0,
            }}
          >
            EKSPLORASI
          </h2>
          <h2
            style={{
              color: "#3b82f6",
              fontWeight: 900,
              fontSize: "1.2rem",
              margin: "2px 0 0",
              fontStyle: "italic",
            }}
          >
            TITIK PARKIR
          </h2>
          <p
            style={{
              color: "#475569",
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginTop: 4,
            }}
          >
            Kecamatan Ratu Agung Digital Map
          </p>
        </div>

        <div style={{ padding: "14px 16px 0" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 13,
                top: 12,
                color: "#475569",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari lokasi, jalan, atau gedung..."
              style={{
                width: "100%",
                padding: "11px 12px 11px 38px",
                backgroundColor: "#1e293b",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                color: "white",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 7, padding: "10px 16px" }}>
          {["Semua", "Mobil", "Motor"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "none",
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer",
                backgroundColor: filter === f ? "#2563eb" : "#1e293b",
                color: filter === f ? "white" : "#64748b",
                textTransform: "uppercase",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div
          style={{
            padding: "0 16px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                boxShadow: "0 0 7px #3b82f6",
              }}
            />
            <span
              style={{
                color: "#94a3b8",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Terdeteksi {filtered.length} Lokasi
            </span>
          </div>
          <Filter size={13} color="#475569" />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 16px" }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                backgroundColor:
                  selected?.id === item.id ? "#1e3a5f" : "#1e293b",
                borderRadius: 14,
                marginBottom: 9,
                overflow: "hidden",
                cursor: "pointer",
                border:
                  selected?.id === item.id
                    ? "1px solid #3b82f6"
                    : "1px solid transparent",
                transition: "all 0.2s",
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={item.img}
                  alt={item.nama}
                  style={{
                    width: "100%",
                    height: 110,
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: statusColor(item.status),
                    color: "white",
                    padding: "3px 9px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {item.status}
                </span>
              </div>
              <div style={{ padding: "10px 13px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginBottom: 3,
                  }}
                >
                  <Star size={11} color="#fbbf24" fill="#fbbf24" />
                  <span
                    style={{ color: "#fbbf24", fontSize: 11, fontWeight: 700 }}
                  >
                    {item.rating}
                  </span>
                </div>
                <h4
                  style={{
                    color: "white",
                    fontWeight: 900,
                    margin: "0 0 3px",
                    fontSize: 13,
                  }}
                >
                  {item.nama}
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <MapPin size={10} color="#64748b" />
                  <p style={{ color: "#64748b", fontSize: 10, margin: 0 }}>
                    {item.alamat}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Clock size={10} color="#475569" />
                    <span style={{ color: "#475569", fontSize: 10 }}>
                      {item.jamOperasional}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Car size={10} color="#475569" />
                    <span style={{ color: "#475569", fontSize: 10 }}>
                      {item.slotTersedia}/{item.totalSlot} slot
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAP */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={[-3.7988, 102.2614]}
          zoom={15}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <FlyAndOpen target={flyTarget} markerRefs={markerRefs} />
          {filtered.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={statusIcon(item.status)}
              ref={(r) => {
                markerRefs.current[item.id] = r;
              }}
              eventHandlers={{ click: () => setSelected(item) }}
            >
              <Popup maxWidth={260}>
                <div style={{ fontFamily: "sans-serif", padding: 4 }}>
                  <img
                    src={item.img}
                    alt={item.nama}
                    style={{
                      width: "100%",
                      height: 110,
                      objectFit: "cover",
                      borderRadius: 8,
                      marginBottom: 10,
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 6,
                    }}
                  >
                    <strong
                      style={{
                        fontSize: 13,
                        color: "#0f172a",
                        lineHeight: 1.3,
                        flex: 1,
                      }}
                    >
                      {item.nama}
                    </strong>
                    <span
                      style={{
                        backgroundColor: statusColor(item.status) + "20",
                        color: statusColor(item.status),
                        padding: "3px 8px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 800,
                        marginLeft: 8,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: 11,
                      color: "#64748b",
                    }}
                  >
                    {item.alamat}
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 6,
                      marginBottom: 8,
                    }}
                  >
                    {[
                      {
                        label: "Slot",
                        val: `${item.slotTersedia}/${item.totalSlot}`,
                      },
                      { label: "Rating", val: `⭐ ${item.rating}` },
                      { label: "Mobil", val: item.tarif.mobil },
                      { label: "Motor", val: item.tarif.motor },
                    ].map((d) => (
                      <div
                        key={d.label}
                        style={{
                          backgroundColor: "#f8fafc",
                          borderRadius: 8,
                          padding: "6px 8px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            color: "#94a3b8",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            marginBottom: 2,
                          }}
                        >
                          {d.label}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "#0f172a",
                          }}
                        >
                          {d.val}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}
                  >
                    🕐 {item.jamOperasional}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {item.fasilitas.map((f) => (
                      <span
                        key={f}
                        style={{
                          backgroundColor: "#eff6ff",
                          color: "#2563eb",
                          padding: "3px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 999,
            backgroundColor: "rgba(15,23,42,0.92)",
            backdropFilter: "blur(12px)",
            borderRadius: 14,
            padding: "14px 18px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p
            style={{
              color: "#475569",
              fontSize: 9,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              margin: "0 0 10px",
            }}
          >
            MAP INDICATORS
          </p>
          {[
            { color: "#22c55e", label: "Titik Tersedia" },
            { color: "#f97316", label: "Titik Padat" },
            { color: "#ef4444", label: "Sedang Tutup" },
          ].map((ind) => (
            <div
              key={ind.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 7,
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  backgroundColor: ind.color,
                }}
              />
              <span
                style={{
                  color: "#94a3b8",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {ind.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
