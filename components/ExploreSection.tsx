"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export default function ExploreSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const projects = [
    {
      title: "Custom Streetwear Drop",
      desc: "A full custom apparel drop with branding, labels & packaging.",
      img: "/assets/img/round-neck/white.png",
    },
    {
      title: "Team Jersey Collection",
      desc: "Sports jerseys for school/college teams with perfect fit.",
      img: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=1000&q=80",
    },
    {
      title: "Corporate Merch Kit",
      desc: "Complete merch kit for businesses — tees, hoodies, mugs.",
      img: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1000&q=80",
    },
    {
      title: "Bulk Hoodie Production",
      desc: "High-quality winter hoodies delivered in bulk for events.",
      img: "https://images.unsplash.com/photo-1557800634-95f1c7b3f236?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let ctx = gsap.context(() => {
      const items = gsap.utils.toArray(".project") as HTMLElement[];
      const totalSlides = items.length;

      const totalWidth = window.innerWidth * (totalSlides - 1);

      // ✅ TIMELINE for horizontal movement
      const tl = gsap.timeline({
        defaults: { ease: "none" },
      });

      tl.to(track, {
        x: -totalWidth,
        duration: 1,
      });

      // ✅ MAIN pinned scrolltrigger
      ScrollTrigger.create({
        trigger: section,
        animation: tl,
        pin: true,
        scrub: 1,
        pinSpacing: true, // ✅ fixes vertical scroll happening
        anticipatePin: 1, // ✅ fixes Next.js offset issue
        start: "top top",
        end: "+=" + totalWidth,
      });

      // ✅ Each section reveal animation
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0.25, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              trigger: item,
              containerAnimation: tl,
              start: "left center",
              end: "right center",
              scrub: true,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-screen h-screen overflow-hidden"
    >
      {/* Horizontal Track */}
      <div
        ref={trackRef}
        className="absolute top-0 left-0 h-full flex"
        style={{ width: `${projects.length * 100}vw` }}
      >
        {projects.map((p, i) => (
          <div
            key={i}
            className="project w-screen h-full flex items-center justify-center px-6 md:px-20"
          >
            {/* ================================
        SLIDE 1 — Full Height Tilted Product Hero
       ================================= */}
            {i === 1 && (
              <motion.div
                className="relative w-full h-full flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0.3 }}
                whileHover={{ opacity: 1, scale: 1.02 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="absolute inset-0 bg-blue-200/30 blur-3xl rounded-3xl"
                  animate={{ opacity: [0.2, 0.35, 0.2] }}
                  transition={{ repeat: Infinity, duration: 6 }}
                />

                <motion.img
                  src={p.img}
                  alt={p.title}
                  className="h-[70vh] md:h-[80vh] object-contain drop-shadow-2xl rotate-3"
                  whileHover={{ rotate: 0, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 200 }}
                />

                <h2 className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tight text-blue-900 drop-shadow-lg">
                  {p.title}
                </h2>
                <p className="text-gray-700 text-lg md:text-xl max-w-lg mt-3">
                  {p.desc}
                </p>
              </motion.div>
            )}

            {/* ================================
        SLIDE 2 — Angled Float Layout + Stamp
       ================================= */}
            {i === 0 && (
              <div className="relative flex flex-col md:flex-row items-center gap-10 w-full max-w-5xl">
                <motion.div
                  className="relative"
                  whileHover={{ rotate: -2, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 150 }}
                >
                  <div className="absolute -top-4 -left-4 text-amber-700 text-8xl font-black opacity-20 -rotate-12 select-none">
                    ★
                  </div>
                  <Image
                    src={p.img}
                    alt={p.title}
                    width={500}
                    height={400}
                    className="rounded-2xl shadow-2xl object-cover"
                  />
                </motion.div>

                <div className="max-w-md text-left">
                  <h2 className="text-5xl md:text-6xl font-extrabold uppercase text-amber-800">
                    {p.title}
                  </h2>
                  <p className="text-gray-700 mt-4 text-lg">{p.desc}</p>
                </div>
              </div>
            )}

            {/* ================================
        SLIDE 3 — Magazine Editorial Split Layout
       ================================= */}
            {i === 2 && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl gap-10 items-center"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
              >
                <div className="flex flex-col space-y-4 text-left">
                  <h2 className="text-6xl md:text-7xl font-black uppercase text-gray-900">
                    {p.title}
                  </h2>

                  <p className="text-xl text-gray-700 max-w-md">{p.desc}</p>
                </div>

                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 120 }}
                >
                  <div className="absolute -inset-3 border-4 border-gray-900/30 rounded-xl"></div>
                  <Image
                    src={p.img}
                    alt={p.title}
                    width={550}
                    height={450}
                    className="rounded-xl shadow-xl object-cover"
                  />
                </motion.div>
              </motion.div>
            )}

            {/* ================================
        SLIDE 4 — Dark Premium Spotlight
       ================================= */}
            {i === 3 && (
              <motion.div
                className="relative w-full max-w-6xl flex flex-col md:flex-row items-center gap-12 bg-black/90 p-10 rounded-3xl shadow-2xl"
                initial={{ y: 20, opacity: 0.85 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-emerald-700/20 blur-3xl"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                />

                <Image
                  src={p.img}
                  alt={p.title}
                  width={450}
                  height={400}
                  className="rounded-2xl shadow-2xl object-cover"
                />

                <div className="text-white max-w-lg">
                  <h2 className="text-5xl md:text-6xl font-extrabold uppercase">
                    {p.title}
                  </h2>
                  <p className="text-gray-200 text-lg mt-3">{p.desc}</p>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
