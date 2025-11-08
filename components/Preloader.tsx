"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Preloader() {
  const [done, setDone] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (done) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.to(wrapperRef.current, {
          opacity: 0,
          y: -40,
          duration: 0.6,
          ease: "power4.inOut",
          onComplete: () => {
            sessionStorage.setItem("pramaan_loaded", "true");
            setDone(true);
          },
        });
      },
    });

    // 0.0s → 0.5s — reveal letters quickly
    tl.from(lettersRef.current, {
      opacity: 0,
      y: 30,
      stagger: 0.04,
      duration: 0.5,
      ease: "back.out(1.6)",
    });

    // 0.4s → 1.0s — logo pop
    tl.from(
      logoRef.current,
      {
        scale: 0.7,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(2)",
      },
      "-=0.3"
    );

    // 0.8s → 1.4s — quick fill animation
    tl.fromTo(
      fillRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 0.6,
        transformOrigin: "left center",
        ease: "power2.inOut",
      },
      "-=0.2"
    );

    // 1.0s — instantly update percent to 100%
    tl.call(() => {
      if (percentRef.current) percentRef.current.innerText = "100%";
    });

    // 1.4s → 2.0s — fade-out handled in onComplete
    return () => {
      tl.kill();
    };
  }, [done]);

  if (done) return null;

  const text = "PraMaan".split("");

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white"
    >
      {/* ✅ Logo */}
      <img
        ref={logoRef}
        src="/assets/img/nav-logo.png"
        className="w-16 h-16 mb-6 opacity-90"
      />

      {/* ✅ Letters */}
      <div className="relative flex gap-1">
        {text.map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) lettersRef.current[i] = el;
            }}
            className="text-6xl font-black tracking-wider"
            style={{
              WebkitTextStroke: "2px black",
              color: "transparent",
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* ✅ Percentage (instant) */}
      <div
        ref={percentRef}
        className="mt-6 text-sm font-semibold text-gray-600"
      >
        0%
      </div>

      {/* ✅ Gradient fill bar */}
      <div
        ref={fillRef}
        className="absolute bottom-0 left-0 h-[4px] w-full bg-gradient-to-r from-black to-gray-400 scale-x-0"
      />
    </div>
  );
}
