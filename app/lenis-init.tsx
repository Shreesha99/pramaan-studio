"use client";

import { useEffect } from "react";
import Lenis, { type LenisOptions } from "@studio-freight/lenis";

export function useLenisSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      // --- updated API ---
      smooth: true, // enables smooth scrolling on all devices
      duration: 1.2, // scroll speed
      lerp: 0.1, // lower = smoother (0 – 1)
      wheelMultiplier: 1, // adjust wheel sensitivity
      touchMultiplier: 1.5, // adjust touch scroll
    } as LenisOptions);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}
