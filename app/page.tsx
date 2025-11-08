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
          <section id="products" className="reveal-section">
            <NewCollection />
          </section>

          <ExploreSection />
        </div>
      </main>

      <Footer />
    </>
  );
}
