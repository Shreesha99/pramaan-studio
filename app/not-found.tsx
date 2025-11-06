"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <section className="w-screen min-h-screen overflow-hidden bg-[#f8f8f8] relative flex flex-col">
      {/* ✅ NAVBAR */}
      <div className="w-full fixed top-0 left-0 z-[200]">
        <Header />
      </div>

      {/* ✅ Content Wrapper (added padding-top to avoid overlap with header) */}
      <div className="flex-1 flex items-center justify-center pt-24 pb-10 relative">
        {/* Floating Shapes */}
        <motion.div
          className="absolute w-40 h-40 bg-black/5 rounded-full blur-2xl"
          animate={{ x: [0, 60, -40, 0], y: [0, -40, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-32 h-32 bg-[#b69253]/10 rounded-full blur-2xl"
          animate={{ x: [0, -40, 40, 0], y: [0, 40, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        {/* Centered Text */}
        <div className="text-center relative z-10 px-6">
          <motion.h1
            className="text-[120px] md:text-[180px] font-extrabold tracking-tight text-black select-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            404
          </motion.h1>

          <motion.p
            className="text-2xl md:text-3xl font-semibold text-gray-800 mt-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            This page doesn’t exist.
          </motion.p>

          <motion.p
            className="text-gray-600 text-base md:text-lg max-w-md mx-auto mt-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            Maybe it was removed, renamed, or never existed in the first place.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8"
          >
            <Link
              href="/"
              className="
                inline-block px-8 py-3 rounded-full 
                bg-black text-white font-semibold 
                hover:bg-neutral-900 active:scale-95 
                transition-all duration-300 shadow-md
              "
            >
              Go Home
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
