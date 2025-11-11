"use client";

import Header from "@/components/Header/Header";
import Hero from "@/components/Hero";
import NewCollection from "@/components/NewCollection";
import InstagramShowcase from "@/components/ExploreSection";
import Footer from "@/components/Footer";
import { useGsapAnimations } from "@/lib/useGsapAnimations";

export default function HomePage() {
  useGsapAnimations();

  return (
    <>
      <Header />

      <main className="overflow-x-hidden">
        {/* NORMAL VERTICAL SECTIONS */}
        <div id="vertical-content">
          <Hero />
          <section id="products" className="reveal-section">
            <NewCollection />
          </section>

          <InstagramShowcase />
        </div>
      </main>

      <Footer />
    </>
  );
}
