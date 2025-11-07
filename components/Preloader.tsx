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

    let progress = { value: 0 };

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.to(wrapperRef.current, {
          opacity: 0,
          y: -60,
          duration: 1,
          ease: "power4.inOut",
          onComplete: () => {
            sessionStorage.setItem("pramaan_loaded", "true");
            setDone(true);
          },
        });
      },
    });

    // ✅ Letter bounce reveal
    tl.from(lettersRef.current, {
      opacity: 0,
      y: 40,
      stagger: 0.08,
      duration: 0.8,
      ease: "back.out(1.4)",
    });

    // ✅ Jitter
    tl.to(
      lettersRef.current,
      {
        y: "+=2",
        repeat: 6,
        yoyo: true,
        duration: 0.08,
        stagger: 0.03,
      },
      "-=0.5"
    );

    // ✅ Logo pop
    tl.from(
      logoRef.current,
      {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(2)",
      },
      "-=0.4"
    );

    // ✅ Gradient fill wipe
    tl.fromTo(
      fillRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 2,
        transformOrigin: "left center",
        ease: "power2.inOut",
      },
      "-=0.2"
    );

    // ✅ Percentage counter
    tl.to(
      progress,
      {
        value: 100,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          if (percentRef.current) {
            percentRef.current.innerText = `${Math.floor(progress.value)}%`;
          }
        },
      },
      "-=2"
    );

    return () => {
      tl.kill();
    };
  }, [done]);

  if (done) return null;

  const text = "PraMaan".split("");

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-99999 flex flex-col items-center justify-center bg-white"
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

      {/* ✅ Percentage */}
      <div
        ref={percentRef}
        className="mt-6 text-sm font-semibold text-gray-600"
      >
        0%
      </div>
    </div>
  );
}
