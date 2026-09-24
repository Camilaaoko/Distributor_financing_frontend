"use client";

import React from "react";
import { Verified, BarChart3, Zap, PieChart } from "lucide-react";

const features = [
  {
    icon: Verified,
    title: "Secure & Compliant",
    description: "Bank-level security with 256-bit AES encryption and full regulatory compliance.",
  },
  {
    icon: BarChart3,
    title: "Scalable Platform",
    description: "Built to grow with your business and handle thousands of transactions.",
  },
  {
    icon: Zap,
    title: "Automated Workflows",
    description: "Streamlined onboarding, credit assessment, and approvals.",
  },
  {
    icon: PieChart,
    title: "Real-time Insights",
    description: "Dashboards and analytics to track performance and make data-driven decisions.",
  },
];

export default function FeatureBar() {
  return (
    <section className="section bg-gradient-to-r from-primary to-primary-dark rounded-2xl mx-auto container relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-dark/90" />
      <div className="relative grid grid-4 gap-[var(--space-card-gap)] p-[var(--space-card-padding)] text-on-primary">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4 transition-all duration-300 hover:translate-y-[-4px]">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest/20 text-secondary flex items-center justify-center shrink-0 backdrop-blur-sm">
              <feature.icon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-label-bold text-label-bold mb-1">{feature.title}</h3>
              <p className="font-body-md text-sm opacity-90">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}