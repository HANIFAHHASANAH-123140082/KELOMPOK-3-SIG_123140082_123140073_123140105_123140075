import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Konfigurasi Icon agar tidak error
const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapPortal = () => {
  const centerPos = [-3.8247, 102.2734]; // Koordinat Ratu Agung

  return (
    <div className="w-full h-full grayscale-[0.5] contrast-[1.2] invert-[0.05]">
      <MapContainer
        center={centerPos}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker 1: Suprapto */}
        <Marker position={[-3.824, 102.273]} icon={customIcon}>
          <Popup className="custom-popup">
            <div className="p-2 font-sans">
              <h4 className="font-black text-sm mb-1 uppercase tracking-tight italic">
                Parkir Suprapto
              </h4>
              <p className="text-[10px] text-gray-600 mb-2 font-bold uppercase">
                Ratu Agung, Bengkulu
              </p>
              <div className="bg-blue-600 text-white p-2 rounded-lg text-center text-[11px] font-black">
                12 SLOT TERSEDIA
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Visualisasi Radius */}
        <Circle
          center={centerPos}
          radius={500}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
          }}
        />

        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
};

export default MapPortal;
