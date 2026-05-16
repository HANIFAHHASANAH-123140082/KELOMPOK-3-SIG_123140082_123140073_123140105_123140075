import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Navigation,
  ChevronRight,
  Database,
  Lock,
  ShieldCheck,
} from "lucide-react";

const LandingPage = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-600/10 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/8 blur-[120px] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] bg-[#0a0f1e]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:rotate-[360deg] transition-all duration-1000">
              <Navigation size={20} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-black italic tracking-tighter uppercase leading-none">
                RATUAGUNG<span className="text-blue-500">GIS</span>
              </span>
              <div className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600 leading-none mt-0.5">
                Spatial Intelligence v2.0
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="p-2.5 rounded-xl text-gray-700 hover:text-gray-400 hover:bg-white/5 transition-all"
              title="Admin Portal"
            >
              <Lock size={15} />
            </Link>
            <Link
              to="/map"
              className="relative group px-7 py-3 overflow-hidden rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_24px_rgba(59,130,246,0.35)]"
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                Buka Peta Digital
              </span>
              <div className="absolute inset-0 bg-blue-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center px-8">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center pt-20">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div
              variants={item}
              className="inline-flex items-center gap-3 bg-blue-600/10 border border-blue-500/20 px-5 py-2 rounded-full mb-8"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                Smart City Initiative 2026
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-7xl lg:text-[8.5rem] font-black leading-[0.85] mb-8 tracking-tighter italic"
            >
              SOLUSI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-700">
                PARKIR.
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed font-medium"
            >
              Sistem Informasi Geografis berbasis web untuk manajemen parkir
              publik di Kecamatan Ratu Agung. Transparansi data, efisiensi
              ruang, dan aksesibilitas tanpa batas.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-5 mb-8">
              <Link
                to="/map"
                className="group inline-flex items-center gap-4 bg-blue-600 px-10 py-5 rounded-[2rem] font-black text-base hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/40 transform hover:-translate-y-1"
              >
                MULAI SEKARANG{" "}
                <ChevronRight
                  className="group-hover:translate-x-2 transition-transform"
                  size={22}
                />
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Link
                to="/login"
                className="inline-flex items-center gap-3 text-gray-600 hover:text-blue-400 transition-all group"
              >
                <div className="w-6 h-[1px] bg-gray-800 group-hover:bg-blue-500 transition-colors" />
                <ShieldCheck
                  size={12}
                  className="text-gray-700 group-hover:text-blue-400 transition-colors"
                />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Akses Admin Portal
                </span>
                <div className="w-6 h-[1px] bg-gray-800 group-hover:bg-blue-500 transition-colors" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative group lg:block hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800 blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative z-10 p-4 bg-white/5 border border-white/10 rounded-[4rem] backdrop-blur-3xl transform group-hover:scale-[1.02] transition-transform duration-700">
              <img
                src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1000"
                className="rounded-[3.5rem] grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000 border border-white/10 shadow-2xl"
                alt="Parking Aerial View"
              />
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -top-7 -right-7 bg-gray-900 border border-white/10 p-5 rounded-[2rem] shadow-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-xl">
                    <Database size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">
                      Data Source
                    </p>
                    <p className="text-xl font-black tracking-tighter italic uppercase">
                      BPS 2024
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-gray-900 border border-blue-500/20 px-4 py-3 rounded-xl shadow-xl"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={14} className="text-blue-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-300">
                    Admin Secured
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-7 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-1.5 rounded-lg">
              <Navigation size={12} className="text-white" />
            </div>
            <span className="font-black italic tracking-tighter uppercase text-sm">
              RATUAGUNG<span className="text-blue-500">GIS</span>
            </span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-700 text-center">
            &copy; 2026 ITERA · Kelompok 3 · Hanifah · Afifa · Ariq · Farhan
          </p>
          <Link
            to="/login"
            className="text-gray-800 hover:text-gray-600 transition-colors"
            title="Admin"
          >
            <Lock size={12} />
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
