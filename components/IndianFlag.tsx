"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/* ==========================
 🇮🇳 Smooth Animated India Flag
========================== */
const IndiaFlag = () => {
  const flagRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!flagRef.current) return;

    const waves = flagRef.current.querySelectorAll(".wave");

    waves.forEach((path, i) => {
      const tl = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: {
          duration: 1.6 + i * 0.3,
          ease: "sine.inOut",
        },
      });

      // Animate wave amplitude dynamically
      tl.to(path, {
        keyframes: [
          {
            attr: {
              d: "M0,0 Q45,15 90,0 T180,0 T270,0 T360,0 T450,0 T540,0",
            },
          },
          {
            attr: {
              d: "M0,0 Q45,-15 90,0 T180,0 T270,0 T360,0 T450,0 T540,0",
            },
          },
        ],
      });
    });
  }, []);

  return (
    <svg
      ref={flagRef}
      viewBox="0 0 540 300"
      className="w-10 h-6 inline-block align-middle"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Stripes */}
      <rect width="540" height="100" fill="#FF9933" />
      <rect y="100" width="540" height="100" fill="#FFFFFF" />
      <rect y="200" width="540" height="100" fill="#138808" />

      {/* Waving overlays */}
      <path
        className="wave"
        d="M0,0 Q45,0 90,0 T180,0 T270,0 T360,0 T450,0 T540,0"
        fill="none"
        stroke="#FF9933"
        strokeWidth="8"
        opacity="0.3"
        transform="translate(0, 50)"
      />
      <path
        className="wave"
        d="M0,0 Q45,0 90,0 T180,0 T270,0 T360,0 T450,0 T540,0"
        fill="none"
        stroke="#138808"
        strokeWidth="8"
        opacity="0.3"
        transform="translate(0, 250)"
      />

      {/* Chakra */}
      <circle
        cx="270"
        cy="150"
        r="30"
        fill="none"
        stroke="#000080"
        strokeWidth="4"
      />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        return (
          <line
            key={i}
            x1="270"
            y1="150"
            x2={270 + 30 * Math.cos((angle * Math.PI) / 180)}
            y2={150 + 30 * Math.sin((angle * Math.PI) / 180)}
            stroke="#000080"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

export default IndiaFlag;
