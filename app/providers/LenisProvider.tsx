"use client";

import { useLenisSmoothScroll } from "../lenis-init";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // run Lenis only on client
  useLenisSmoothScroll();
  return <>{children}</>;
}
