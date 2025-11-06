"use client";

import { useLenisSmoothScroll } from "../lenis-init";

export function useLenis() {
  return useLenisSmoothScroll();
}

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useLenisSmoothScroll();
  return <>{children}</>;
}
