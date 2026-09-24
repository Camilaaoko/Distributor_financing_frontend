"use client";

import React from "react";
import { BookOpen, FileText, Code2, ArrowRight } from "lucide-react";

const resources = [
  {
    icon: BookOpen,
    title: "Case Studies",
    description: "Discover how industry leaders and tier-1 banks are leveraging our platform for accelerated off-take.",
    linkText: "Read more",
  },
  {
    icon: FileText,
    title: "Whitepapers",
    description: "In-depth analysis and institutional frameworks for structured distributor financing.",
    linkText: "Download",
  },
  {
    icon: Code2,
    title: "Platform Documentation",
    description: "Technical integration guides, REST APIs, and webhook documentation for ERP & core banking connectors.",
    linkText: "View docs",
  },
];

export default function Resources() {
  return (
    <section id="resources" className="py-20 bg-gradient-to-b from-white via-[#F7F9FC] to-white border-b border-slate-200/80">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Institutional Resources &amp; Guides
          </h2>
          <p className="text-base text-[#64748B] mt-3">
            Access whitepapers, case studies, and technical API documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-b from-white via-white to-slate-50/90 rounded-3xl border border-slate-200/90 p-8 flex flex-col justify-between shadow-sm hover:shadow-[0_25px_60px_-12px_rgba(31,77,168,0.42),0_12px_24px_-8px_rgba(31,77,168,0.30)] hover:border-[#1F4DA8]/60 hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 shadow-2xs flex items-center justify-center text-[#1F4DA8] mb-6 group-hover:scale-105 group-hover:bg-[#F58220] group-hover:border-[#F58220] group-hover:text-white transition-all duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E293B] mb-2">{resource.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed mb-6">{resource.description}</p>
                </div>

                <a
                  href="#contact"
                  className="text-[#1F4DA8] font-bold text-sm hover:text-[#3A6FD8] flex items-center gap-1.5 self-start group/link transition-colors"
                >
                  <span>{resource.linkText}</span>
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}