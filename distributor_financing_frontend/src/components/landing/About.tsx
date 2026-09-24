"use client";

import React from "react";

export default function About() {
  return (
    <section id="about" className="section bg-surface">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <span className="font-label-bold text-label-bold text-secondary tracking-wider uppercase">
            Mission & Vision
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-2 mb-6">
            Powering growth across the value chain
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            EMTech House is dedicated to building a robust distributor financing ecosystem. We empower banks,
            manufacturers, and dealers by automating onboarding, enabling consent-based credit assessment, and
            facilitating revolving credit facilities to foster sustainable growth.
          </p>
        </div>
      </div>
    </section>
  );
}