import React from "react";
import { Link } from "react-router-dom";
import { Lock, User, ArrowLeft } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Beranda
        </Link>
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Admin Login</h2>
            <p className="text-slate-400 mt-2">
              Kelola data spasial parkir publik
            </p>
          </div>
          <form className="space-y-6">
            <div className="relative">
              <User
                className="absolute left-4 top-4 text-slate-400"
                size={20}
              />
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Username / Email"
              />
            </div>
            <div className="relative">
              <Lock
                className="absolute left-4 top-4 text-slate-400"
                size={20}
              />
              <input
                type="password"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Password"
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all">
              Masuk Sekarang
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
