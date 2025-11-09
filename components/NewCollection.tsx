"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import fireAnimation from "@/public/assets/fire.json";
import Marquee from "@/components/Marquee";

const categories = [
  {
    title: "Hoodies",
    subtitle: "Best Seller",
    img: "/assets/img/hoodies/bundle.png",
    highlight: true,
  },
  {
    title: "T-Shirts",
    img: "/assets/img/round-neck/blue-shirt.png",
  },
  {
    title: "Mugs",
    img: "/assets/img/mugs.png",
  },
  {
    title: "Bottles",
    img: "/assets/img/bottle.png",
  },
];

export default function OurRange() {
  const buttonRefs = useRef<HTMLAnchorElement[]>([]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      buttonRefs.current.forEach((btn) => {
        const card = btn.closest(".anim-card");
        if (!card) return;

        if (isMobile) {
          // 📱 Mobile: show immediately with gentle pulse
          gsap.fromTo(
            btn,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              delay: 0.15,
              ease: "power2.out",
              onComplete: () => {
                gsap.to(btn, {
                  scale: 1.04,
                  repeat: -1,
                  yoyo: true,
                  duration: 1.5,
                  ease: "power1.inOut",
                });
              },
            }
          );
        } else {
          // 🖥️ Desktop: hover-based GSAP timeline
          const tl = gsap.timeline({ paused: true });
          tl.fromTo(
            btn,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
          );

          card.addEventListener("mouseenter", () => tl.play());
          card.addEventListener("mouseleave", () => tl.reverse());
        }
      });
    });

    return () => ctx.revert();
  }, []);

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
        {/* MAIN — HOODIES */}
        <motion.div
          whileHover={{ scale: 1.04, rotate: -1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="md:col-span-5 h-[420px] relative overflow-hidden rounded-2xl shadow-xl group anim-card"
        >
          <Image
            src={categories[0].img}
            alt={categories[0].title}
            fill
            sizes="400px"
            className="object-cover group-hover:scale-110 transition-all duration-500"
          />

          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300" />

          {/* Fire Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black px-3 py-1.5 rounded-full">
            <div className="w-8 h-8">
              <Lottie animationData={fireAnimation} loop autoplay />
            </div>
            <span className="text-xs font-bold tracking-wider text-white">
              BEST SELLER
            </span>
          </div>

          {/* Text + Button */}
          <div className="absolute bottom-6 left-6 text-white space-y-3">
            <p className="text-3xl font-bold drop-shadow-lg">
              {categories[0].title}
            </p>
            <Link
              href="/products"
              ref={(el) => {
                if (el && !buttonRefs.current.includes(el)) {
                  buttonRefs.current.push(el);
                }
              }}
              className="inline-block opacity-0 md:opacity-0 px-4 py-2 text-sm font-semibold bg-white/10 backdrop-blur-sm border border-white/30 rounded-full hover:bg-white/20 transition-all"
            >
              Shop Now →
            </Link>
          </div>
        </motion.div>

        {/* T-Shirts + Mugs */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {[categories[1], categories[2]].map((c, i) => (
            <motion.div
              key={c.title}
              whileHover={{ scale: 1.04, rotate: i === 0 ? 1 : -1 }}
              transition={{ type: "spring", stiffness: 200, damping: 17 }}
              className="h-[200px] relative overflow-hidden rounded-2xl shadow-lg group anim-card"
            >
              <Image
                src={c.img}
                alt={c.title}
                fill
                sizes="400px"
                className="object-cover group-hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-all duration-300" />
              <div className="absolute bottom-4 left-4 text-white space-y-2">
                <p className="font-semibold text-xl">{c.title}</p>
                <Link
                  href="/products"
                  ref={(el) => {
                    if (el && !buttonRefs.current.includes(el)) {
                      buttonRefs.current.push(el);
                    }
                  }}
                  className="inline-block opacity-0 md:opacity-0 px-3 py-1 text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/30 rounded-full hover:bg-white/20 transition-all"
                >
                  Shop Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottles */}
        <motion.div
          whileHover={{ scale: 1.03, rotate: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="md:col-span-3 h-[420px] relative overflow-hidden rounded-2xl shadow-xl group anim-card"
        >
          <Image
            src={categories[3].img}
            alt={categories[3].title}
            fill
            sizes="400px"
            className="object-cover group-hover:scale-110 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300" />
          <div className="absolute bottom-6 left-6 text-white space-y-3">
            <p className="text-2xl font-bold">{categories[3].title}</p>
            <Link
              href="/products"
              ref={(el) => {
                if (el && !buttonRefs.current.includes(el)) {
                  buttonRefs.current.push(el);
                }
              }}
              className="inline-block opacity-0 md:opacity-0 px-4 py-2 text-sm font-semibold bg-white/10 backdrop-blur-sm border border-white/30 rounded-full hover:bg-white/20 transition-all"
            >
              Shop Now →
            </Link>
          </div>
        </motion.div>
      </div>

      <Marquee />
    </section>
  );
}
