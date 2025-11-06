"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BrandStrip from "@/components/BrandStrip";
import NewCollection from "@/components/NewCollection";
import FeaturedCollection from "@/components/FeaturedCollection";
import ExploreSection from "@/components/ExploreSection";
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
          <section className="reveal-section">
            <NewCollection />
          </section>
          <section className="reveal-section">
            <FeaturedCollection />
          </section>
        </div>

        {/* FULL-SCREEN PINNED SECTION */}
        <ExploreSection />
      </main>

      <Footer />
    </>
  );
}
