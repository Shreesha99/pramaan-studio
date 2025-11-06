"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Marquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<GSAPTween | null>(null);

  useEffect(() => {
    if (!marqueeRef.current || !innerRef.current) return;

    // Create repeated spaced text
    const base = "  HOODIES  •  T-SHIRTS  •  MUGS  •  BOTTLES  •  KEYCHAINS  •";

    innerRef.current.innerHTML = base + base;

    // GSAP marquee animation
    tweenRef.current = gsap.to(innerRef.current, {
      x: "-50%",
      duration: 22,
      ease: "none",
      repeat: -1,
    });

    // Hover slowdown
    marqueeRef.current.addEventListener("mouseenter", () =>
      tweenRef.current?.timeScale(0.2)
    );
    marqueeRef.current.addEventListener("mouseleave", () =>
      tweenRef.current?.timeScale(1)
    );
  }, []);

  return (
    <div className="relative mt-20">
      {/* LEFT BLUR EDGE */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white via-white/10 to-transparent blur-xl"></div>

      {/* RIGHT BLUR EDGE */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white via-white/10 to-transparent blur-xl"></div>

      {/* MARQUEE WRAPPER */}
      <div
        ref={marqueeRef}
        className="overflow-hidden whitespace-nowrap cursor-pointer"
      >
        <div
          ref={innerRef}
          className="inline-block text-4xl font-extrabold uppercase tracking-[0.3em] text-gray-300 opacity-40"
        ></div>
      </div>
    </div>
  );
}
