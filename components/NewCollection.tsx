"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import fireAnimation from "@/public/assets/fire.json";
import Lottie from "lottie-react";
import Marquee from "@/components/Marquee";

const categories = [
  {
    title: "Hoodies",
    subtitle: "Best Seller",
    img: "https://images.unsplash.com/photo-1520975918319-6fcb95fd80ca?auto=format&fit=crop&w=800&q=80",
    highlight: true,
  },
  {
    title: "T-Shirts",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Mugs",
    img: "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Bottles",
    img: "https://images.unsplash.com/photo-1626785774625-dda21735946f?auto=format&fit=crop&w=800&q=80",
  },
];

export default function OurRange() {
  return (
    <section className="max-w-[1300px] mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold uppercase">
          Our Range
        </h2>
        <p className="text-gray-500 mt-3 text-lg">
          Everything we offer to help you express your style.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* MAIN — HOODIES BEST SELLER */}
        <motion.div
          whileHover={{ scale: 1.04, rotate: -1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="md:col-span-5 h-[420px] relative overflow-hidden rounded-2xl shadow-xl group"
        >
          <Image
            src={categories[0].img}
            alt={categories[0].title}
            fill
            className="object-cover group-hover:scale-110 transition-all duration-500"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300" />

          {/* ✅ FIRE BADGE (top right) */}
          <div
            className="absolute top-4 right-4 flex items-center gap-2
             bg-black px-3 py-1.5 rounded-full
             "
          >
            <div className="w-8 h-8">
              <Lottie animationData={fireAnimation} loop autoplay />
            </div>
            <span className="text-xs font-bold tracking-wider text-white">
              BEST SELLER
            </span>
          </div>

          {/* Text */}
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-3xl font-bold drop-shadow-lg">
              {categories[0].title}
            </p>
          </div>
        </motion.div>

        {/* T-Shirts + Mugs */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {[categories[1], categories[2]].map((c, i) => (
            <motion.div
              key={c.title}
              whileHover={{ scale: 1.04, rotate: i === 0 ? 1 : -1 }}
              transition={{ type: "spring", stiffness: 200, damping: 17 }}
              className="h-[200px] relative overflow-hidden rounded-2xl shadow-lg group"
            >
              <Image
                src={c.img}
                alt={c.title}
                fill
                className="object-cover group-hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-all duration-300" />
              <div className="absolute bottom-4 left-4 text-white font-semibold text-xl">
                {c.title}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottles */}
        <motion.div
          whileHover={{ scale: 1.03, rotate: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="md:col-span-3 h-[420px] relative overflow-hidden rounded-2xl shadow-xl group"
        >
          <Image
            src={categories[3].img}
            alt={categories[3].title}
            fill
            className="object-cover group-hover:scale-110 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300" />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-2xl font-bold">{categories[3].title}</p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Marquee */}
      <Marquee />

      {/* ✅ Animations */}
      <style>{`
        @keyframes pulseSmooth {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .animate-pulse-smooth {
          animation: pulseSmooth 1.8s infinite ease-in-out;
        }

        @keyframes fireFlicker {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(-4deg); }
          50% { transform: scale(1.05) rotate(3deg); }
          75% { transform: scale(1.12) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-fire-flicker {
          animation: fireFlicker 1.2s infinite ease-in-out;
        }
      `}</style>
    </section>
  );
}
