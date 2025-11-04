"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // hero intro animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-title span", {
      y: 120,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
    })
      .from(".hero-desc", { y: 40, opacity: 0, duration: 0.6 }, "-=0.5")
      .from(".hero-btn", { scale: 0.9, opacity: 0, duration: 0.4 }, "-=0.3");

    // GSAP ticker scroll animation
    const ticker = tickerRef.current;
    if (ticker) {
      const distance = ticker.scrollWidth / 2; // move half its width for seamless loop

      const tween = gsap.to(ticker, {
        x: -distance,
        ease: "none",
        duration: 25,
        repeat: -1,
      });

      // optional pause on hover
      ticker.addEventListener("mouseenter", () => tween.pause());
      ticker.addEventListener("mouseleave", () => tween.resume());
    }
  }, []);

  return (
    <section className="relative flex items-center justify-center h-screen overflow-hidden bg-white">
      {/* 🔥 Top Scrolling Strip (GSAP driven) */}
      <div className="absolute top-0 left-0 w-full bg-black text-white py-3 sm:py-4 overflow-hidden z-[5]">
        <div
          ref={tickerRef}
          className="flex whitespace-nowrap font-semibold text-sm sm:text-lg uppercase tracking-widest gap-20 px-10"
        >
          <span>✦ New Drop Every Month</span>
          <span>✦ Exclusive Streetwear Arrivals</span>
          <span>✦ Limited Collections</span>
          <span>✦ Don’t Miss Out</span>

          {/* duplicate content for seamless looping */}
          <span>✦ New Drop Every Month</span>
          <span>✦ Exclusive Streetwear Arrivals</span>
          <span>✦ Limited Collections</span>
          <span>✦ Don’t Miss Out</span>
        </div>
      </div>

      {/* MODEL IMAGE */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80"
          alt="Model"
          width={1000}
          height={1200}
          className="object-contain z-[2] scale-[1.2] sm:scale-100"
          priority
        />
      </div>

      {/* TITLE with masking */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-[3] mix-blend-difference pointer-events-none">
        <h1
          className="hero-title uppercase font-extrabold leading-[0.9] tracking-tight text-black relative"
          style={{
            fontSize: "clamp(2.2rem, 10vw, 7rem)",
          }}
        >
          <span className="block mix-blend-difference text-white">
            Discover
          </span>
          <span className="block mix-blend-difference text-white">Clothes</span>
          <span className="block mix-blend-difference text-white">
            Unique Style
          </span>
        </h1>
      </div>

      {/* Stroke text behind model */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-[1]">
        <h1
          className="uppercase font-extrabold leading-[0.9] tracking-tight text-transparent"
          style={{
            WebkitTextStroke: "2px black",
            fontSize: "clamp(2.2rem, 10vw, 7rem)",
          }}
        >
          Discover
          <br />
          Clothes
          <br />
          Unique Style
        </h1>
      </div>

      {/* RIGHT TEXT + CTA */}
      <div className="absolute right-6 bottom-16 sm:right-10 sm:bottom-20 text-center sm:text-right z-[4] px-4 sm:px-0">
        <p className="hero-desc text-gray-600 text-xs sm:text-sm max-w-[280px] sm:max-w-xs mb-3 sm:mb-4 mx-auto sm:mx-0 leading-relaxed">
          Explore a curated collection of clothing designed to complement your
          personal style and elevate your everyday look.
        </p>
        <button className="hero-btn inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-3 rounded-full bg-black text-white text-sm sm:text-base font-semibold hover:bg-gray-900 transition-all">
          Shop Now <ArrowUpRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* LEFT STATS */}
      <div className="absolute left-0 right-0 bottom-5 sm:left-10 sm:bottom-24 text-gray-800 font-semibold z-[4] flex sm:block justify-center gap-6 sm:gap-0 sm:space-y-4 text-xs sm:text-base">
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
