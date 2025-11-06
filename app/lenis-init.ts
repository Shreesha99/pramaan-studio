"use client";

import Lenis from "@studio-freight/lenis";
import { useEffect, useRef, useState } from "react";

// ✅ GLOBAL hook that gives access to Lenis instance
export function useLenisSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const [instance, setInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    setInstance(lenis);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return instance; // ✅ return actual lenis instance
}
