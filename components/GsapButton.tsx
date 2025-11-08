"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface GsapButtonProps {
  onClick: () => void | Promise<void>;
  loading: boolean;
  disabled?: boolean;
  text: string;
  loadingText: string;
  className?: string;
}

export default function GsapButton({
  onClick,
  loading,
  disabled,
  text,
  loadingText,
  className = "",
}: GsapButtonProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading && barRef.current) {
      gsap.fromTo(
        barRef.current,
        { x: "-100%" },
        { x: "100%", duration: 1.2, ease: "linear", repeat: -1 }
      );
    } else {
      gsap.killTweensOf(barRef.current);
      gsap.set(barRef.current, { x: "-100%" });
    }
  }, [loading]);

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative overflow-hidden rounded-full font-semibold transition-colors 
        ${disabled || loading ? "opacity-70 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {/* sliding fill */}
      <div
        ref={barRef}
        className="absolute inset-0 bg-white/20 pointer-events-none"
        aria-hidden
      />
      <span className="relative z-10">{loading ? loadingText : text}</span>
    </button>
  );
}
