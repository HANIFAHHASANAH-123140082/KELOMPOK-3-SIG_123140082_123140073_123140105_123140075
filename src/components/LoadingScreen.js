import React from "react";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";

const LoadingScreen = () => (
  <motion.div
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0f1e] text-white"
  >
    <motion.div
      animate={{ rotate: 360, scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="bg-blue-600 p-5 rounded-full mb-6 shadow-2xl shadow-blue-500/50"
    >
      <Navigation size={48} />
    </motion.div>
    <h2 className="text-xl font-black tracking-[0.5em] uppercase italic">
      RATU AGUNG GIS
    </h2>
    <p className="text-gray-500 text-[10px] mt-4 font-bold tracking-widest uppercase">
      Memuat Data Spasial...
    </p>
  </motion.div>
);
export default LoadingScreen;
