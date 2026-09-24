"use client";

import React from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import { EcosystemMarquee } from "@/components/landing/EcosystemMarquee";
import FeatureBar from "@/components/landing/FeatureBar";
import HowItWorks from "@/components/landing/HowItWorks";
import { StakeholderPillars } from "@/components/landing/StakeholderPillars";
import Calculator from "@/components/landing/Calculator";
import SecurityCompliance from "@/components/landing/SecurityCompliance";
import About from "@/components/landing/About";
import Resources from "@/components/landing/Resources";
import Contact from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md antialiased">
      <Header />
      <main className="pt-20">
        <Hero />
        <EcosystemMarquee />
        <FeatureBar />
        <HowItWorks />
        <StakeholderPillars />
        <Calculator />
        <SecurityCompliance />
        <About />
        <Resources />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}