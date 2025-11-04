"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intro animations
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-title span", {
        yPercent: 120,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
      })
        .from(".hero-btn", { y: 20, opacity: 0, duration: 0.5 }, "-=0.4")
        .from(".hero-desc", { y: 40, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(
          ".hero-stats > div",
          {
            y: 40,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: "back.out(2)",
          },
          "-=0.3"
        );
    }, heroRef);

    // GSAP ticker animation
    const ticker = tickerRef.current;
    if (ticker) {
      const distance = ticker.scrollWidth / 2;
      const tween = gsap.to(ticker, {
        x: -distance,
        ease: "none",
        duration: 30,
        repeat: -1,
      });

      ticker.addEventListener("mouseenter", () => tween.pause());
      ticker.addEventListener("mouseleave", () => tween.resume());
    }

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex items-center justify-center h-screen overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-100"
    >
      {/* 🔥 Scrolling Strip */}
      <div className="absolute top-0 left-0 w-full bg-black text-white py-3 sm:py-4 overflow-hidden z-[6] shadow-md">
        <div
          ref={tickerRef}
          className="flex whitespace-nowrap font-semibold text-sm sm:text-lg uppercase tracking-widest gap-20 px-10 opacity-90"
        >
          {[
            "✦ New Drop Every Month",
            "✦ Exclusive Streetwear Arrivals",
            "✦ Limited Collections",
            "✦ Don’t Miss Out",
          ].map((text, i) => (
            <span key={i}>{text}</span>
          ))}
          {[
            "✦ New Drop Every Month",
            "✦ Exclusive Streetwear Arrivals",
            "✦ Limited Collections",
            "✦ Don’t Miss Out",
          ].map((text, i) => (
            <span key={i + 4}>{text}</span>
          ))}
        </div>
        {/* subtle edge fade mask */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black via-black/70 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black via-black/70 to-transparent pointer-events-none" />
      </div>

      {/* MODEL IMAGE */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[90%] sm:w-[70%] max-w-[1000px] h-auto">
          <Image
            src="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80"
            alt="Model"
            width={1000}
            height={1200}
            className="object-contain z-[2] scale-[1.25] sm:scale-100 opacity-95 transition-transform duration-[1500ms] hover:scale-[1.05]"
            priority
          />
        </div>
      </div>

      {/* TITLE (Foreground blend) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-[3] mix-blend-difference pointer-events-none">
        <h1
          className="hero-title uppercase font-extrabold leading-[0.9] tracking-tight text-black relative"
          style={{
            fontSize: "clamp(2.5rem, 9vw, 7rem)",
            lineHeight: "0.9",
          }}
        >
          <span className="block mix-blend-difference text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
            Discover
          </span>
          <span className="block mix-blend-difference text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
            Clothes
          </span>
          <span className="block mix-blend-difference text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
            Unique Style
          </span>
        </h1>
      </div>

      {/* STROKED TITLE BEHIND */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-[1]">
        <h1
          className="uppercase font-extrabold leading-[0.9] tracking-tight text-transparent opacity-60"
          style={{
            WebkitTextStroke: "2px black",
            fontSize: "clamp(2.5rem, 9vw, 7rem)",
          }}
        >
          Discover
          <br />
          Clothes
          <br />
          Unique Style
        </h1>
      </div>

      {/* RIGHT CTA + TEXT */}
      <div className="absolute right-4 bottom-16 sm:right-10 sm:bottom-20 text-center sm:text-right z-[5] px-4 sm:px-0">
        {/* SHOP NOW — now above the paragraph */}
        <button className="hero-btn inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-3 rounded-full bg-black text-white text-sm sm:text-base font-semibold transition-all duration-300 hover:bg-gray-900 hover:scale-[1.03] group mb-4 sm:mb-5">
          Shop Now{" "}
          <ArrowUpRightIcon className="w-4 h-4 transform transition-transform duration-300 group-hover:rotate-45" />
        </button>

        <p className="hero-desc text-gray-600 text-xs sm:text-sm max-w-[280px] sm:max-w-xs mx-auto sm:mx-0 leading-relaxed">
          Explore a curated collection of clothing designed to complement your
          personal style and elevate your everyday look.
        </p>
      </div>

      {/* LEFT STATS */}
      <div className="hero-stats absolute left-0 right-0 bottom-6 sm:left-10 sm:bottom-24 text-gray-800 font-semibold z-[4] flex sm:block justify-center gap-6 sm:gap-0 sm:space-y-5 text-xs sm:text-base">
        <div className="text-center sm:text-left">
          <h3 className="text-lg sm:text-2xl font-bold">200+</h3>
          <p className="text-[11px] sm:text-sm text-gray-500">
            International Brands
          </p>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-lg sm:text-2xl font-bold">2K+</h3>
          <p className="text-[11px] sm:text-sm text-gray-500">
            High-Quality Products
          </p>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-lg sm:text-2xl font-bold">30K+</h3>
          <p className="text-[11px] sm:text-sm text-gray-500">
            Happy Customers
          </p>
        </div>
      </div>
    </section>
  );
}
