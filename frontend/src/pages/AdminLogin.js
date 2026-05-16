import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, User, ArrowLeft, AlertCircle } from "lucide-react";

const AdminLogin = ({ setAuth }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("isAdminAuth", "true");
        setAuth(true);
        navigate("/admin");
      } else {
        setError("Username atau password salah.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#0f172a] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="bg-blue-600/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <Lock className="text-blue-500" size={30} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Admin Portal
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Masuk untuk mengelola data spasial parkir.
          </p>
        </div>

        <div className="space-y-5">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-gray-600 ml-1 uppercase tracking-widest block mb-2">
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-3.5 text-gray-600"
                size={16}
              />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-[#1e293b] border border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-700"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-600 ml-1 uppercase tracking-widest block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-3.5 text-gray-600"
                size={16}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-[#1e293b] border border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 py-4 rounded-2xl font-black text-white text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Memverifikasi..." : "Akses Dashboard"}
          </button>

          <p className="text-center text-xs text-gray-700 pt-1">
            Login: <span className="font-mono text-gray-500">admin</span> /{" "}
            <span className="font-mono text-gray-500">admin123</span>
          </p>
        </div>
      </motion.div>

      <button
        onClick={() => navigate("/")}
        className="mt-7 flex items-center gap-2 text-gray-600 hover:text-gray-400 transition text-sm font-semibold"
      >
        <ArrowLeft size={14} /> Kembali ke Beranda
      </button>
    </div>
  );
};

export default AdminLogin;
