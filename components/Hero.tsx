"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

const trailImages = [
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1514995428455-447d4443fa7f?auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1542060748-10c28b62716b?auto=format&fit=crop&w=500&q=60",
];

export default function Hero() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entry animations
    gsap.from(".hero-outline span", {
      yPercent: 120,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
    });
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

    // Marquee animation
    // ✅ Seamless marquee scroll
    const ticker = tickerRef.current;
    if (ticker) {
      const content = ticker.innerHTML; // duplicate content
      ticker.innerHTML = content + content;

      const totalWidth = ticker.scrollWidth / 2;

      gsap.to(ticker, {
        x: `-=${totalWidth}`,
        duration: 30,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x: string) => parseFloat(x) % -totalWidth),
        },
      });

      // Optional pause on hover
      ticker.addEventListener("mouseenter", () => gsap.globalTimeline.pause());
      ticker.addEventListener("mouseleave", () => gsap.globalTimeline.resume());
    }

    // Cursor + Trail logic
    const cursor = cursorRef.current;
    const trailContainer = trailContainerRef.current;
    const hero = heroRef.current;

    if (!cursor || !trailContainer || !hero) return; // ✅ Type-safe early exit

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    const xSet = gsap.quickSetter(cursor, "x", "px");
    const ySet = gsap.quickSetter(cursor, "y", "px");
    let lastTrail = 0;
    const TRAIL_DELAY = 150;
    let lastTrailX = 0;
    let lastTrailY = 0;
    const TRAIL_SPACING = 35; // pixels between each particle

    // const createTrail = (x: number, y: number) => {
    //   const now = Date.now();
    //   if (now - lastTrail < TRAIL_DELAY) return;
    //   lastTrail = now;
    //   // ✅ Runtime safety too
    //   if (!trailContainer) return;

    //   const trail = document.createElement("img");
    //   const randomImg =
    //     trailImages[Math.floor(Math.random() * trailImages.length)];
    //   trail.src = randomImg;
    //   trail.className =
    //     "absolute w-12 h-12 object-cover rounded-md pointer-events-none opacity-0";
    //   trail.style.left = `${x - 24}px`;
    //   trail.style.top = `${y - 24}px`;

    //   trailContainer.appendChild(trail);

    //   gsap.fromTo(
    //     trail,
    //     { scale: 0.5, opacity: 0 },
    //     {
    //       opacity: 0.4,
    //       scale: 0.9,
    //       duration: 0.3,
    //       ease: "power2.out",
    //       onComplete: () => {
    //         gsap.to(trail, {
    //           opacity: 0,
    //           scale: 1.1,
    //           duration: 0.25,
    //           ease: "power1.inOut",
    //           onComplete: () => trail.remove(),
    //         });
    //       },
    //     }
    //   );
    // };

    // ✅ Mouse interactions only inside hero
    const moveHandler = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const dx = e.clientX - lastTrailX;
      const dy = e.clientY - lastTrailY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > TRAIL_SPACING) {
        // createTrail(e.clientX, e.clientY);
        lastTrailX = e.clientX;
        lastTrailY = e.clientY;
      }
    };

    hero.addEventListener("mousemove", moveHandler);
    hero.addEventListener("mouseenter", () => {
      gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.3 });
      document.body.style.cursor = "none";
    });
    hero.addEventListener("mouseleave", () => {
      gsap.to(cursor, { opacity: 0, scale: 0.8, duration: 0.3 });
      document.body.style.cursor = "auto";
    });

    gsap.ticker.add(() => {
      pos.x += (mouse.x - pos.x) * 0.15;
      pos.y += (mouse.y - pos.y) * 0.15;
      xSet(pos.x);
      ySet(pos.y);
    });

    return () => {
      hero.removeEventListener("mousemove", moveHandler);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex items-center justify-center h-screen overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-100"
    >
      {/* Cursor Trail Container */}
      <div
        ref={trailContainerRef}
        className="fixed inset-0 z-[60] pointer-events-none hidden sm:block"
      />

      {/* Custom Black Cursor */}
      <div
        ref={cursorRef}
        className="fixed z-[70] top-0 left-0 w-5 h-5 rounded-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.3)] pointer-events-none hidden sm:block opacity-0 scale-0"
      />

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
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black via-black/70 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black via-black/70 to-transparent pointer-events-none" />
      </div>

      {/* Background Model Image */}
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

      {/* Foreground Title */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center z-[3] mix-blend-difference pointer-events-none 
  translate-y-[-30px] sm:translate-y-0"
      >
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

      {/* Outline Title */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center z-[1] 
  translate-y-[-30px] sm:translate-y-0 hero-outline"
      >
        <h1
          className="uppercase font-extrabold leading-[0.9] tracking-tight text-transparent opacity-60"
          style={{
            WebkitTextStroke: "2px black",
            fontSize: "clamp(2.5rem, 9vw, 7rem)",
          }}
        >
          <span className="block">Discover</span>
          <span className="block">Clothes</span>
          <span className="block">Unique Style</span>
        </h1>
      </div>

      {/* CTA and Description */}
      <div className="absolute right-4 bottom-40 sm:right-10 sm:bottom-32 text-center sm:text-right z-[5] px-4 sm:px-0">
        {/* <button className="hero-btn inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-3 rounded-full bg-black text-white text-sm sm:text-base font-semibold transition-all duration-300 hover:bg-gray-900 hover:scale-[1.03] group mb-4 sm:mb-5">
          Shop Now{" "}
          <ArrowUpRightIcon className="w-4 h-4 transform transition-transform duration-300 group-hover:rotate-45" />
        </button> */}
        <p className="hero-desc text-gray-700 text-sm sm:text-base max-w-[320px] sm:max-w-sm mx-auto sm:mx-0 leading-relaxed font-medium">
          Explore a curated range of apparel and lifestyle essentials from
          T-shirts and hoodies to mugs, bottles, and keychains all customizable
          to reflect your unique style
        </p>
      </div>

      {/* Left Stats */}
      <div
        className="hero-stats absolute left-0 right-0 bottom-10 sm:left-10 sm:bottom-32 
                text-gray-900 font-semibold z-[4] flex sm:block justify-center 
                gap-8 sm:gap-0 sm:space-y-6 text-xs sm:text-base"
      >
        {/* Product Types */}
        <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold">20+</h3>
          </div>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">
            Product Types Offered
          </p>
        </div>

        {/* Custom Printing */}
        <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold">Custom</h3>
          </div>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">
            Fully Customizable Printing
          </p>
        </div>

        {/* Pan-India Delivery */}
        <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold">India</h3>
          </div>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">
            Delivered Pan-India
          </p>
        </div>
      </div>
    </section>
  );
}
