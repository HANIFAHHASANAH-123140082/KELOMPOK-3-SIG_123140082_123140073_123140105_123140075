import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
/* PENTING: Pastikan semua file di bawah ini sudah ada di folder src/pages/ 
  Sesuai struktur folder di screenshot kamu.
*/
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import LoadingScreen from "./components/LoadingScreen";

/**
 * SISTEM WEBGIS PARKIR RATU AGUNG v2.0
 * Developed by: M. Farhan Muzakhi (123140075) & Team
 * Description: Core Application Entry Point with Global Route Protection
 */

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulasi sistem autentikasi untuk keamanan Admin Portal
  useEffect(() => {
    const authStatus = localStorage.getItem("isAdminAuth");
    if (authStatus === "true") setIsAuthenticated(true);

    // Timer loading screen agar transisi lebih smooth dan profesional
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="app-container min-h-screen bg-[#0a0f1e] selection:bg-blue-500/30">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route
            path="/login"
            element={<AdminLogin setAuth={setIsAuthenticated} />}
          />

          {/* Protected Admin Routes - Hanya bisa diakses jika login */}
          <Route
            path="/admin"
            element={
              isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />
            }
          />
          {/* Tambahkan alias route ini */}
          <Route
            path="/admin/dashboard"
            element={
              isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />
            }
          />

          {/* Catch-all Route: Jika user mengetik URL ngasal, lempar ke Landing Page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
