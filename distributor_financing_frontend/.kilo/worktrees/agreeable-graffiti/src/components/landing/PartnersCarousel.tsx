"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { REGULATORY_PARTNERS } from '@/lib/constants/landing';
import type { PartnerItem } from '@/types/landing';

function PartnerLogo({ partner }: { partner: PartnerItem }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group min-w-[280px]" role="listitem">
      <div className="w-14 h-14 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors grayscale hover:grayscale-0">
        <div className="w-full h-full text-slate-400 group-hover:text-[var(--color-emtech-navy)] transition-colors" aria-hidden="true">
          {partner.logo}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900 truncate">{partner.name}</div>
        <Badge variant="purple" size="sm">{partner.category}</Badge>
      </div>
    </div>
  );
}

function MarqueeContent({ partners, reverse = false }: { partners: PartnerItem[]; reverse?: boolean }) {
  return (
    <div
      className={cn(
        'flex gap-4 whitespace-nowrap will-change-transform',
        reverse ? 'animate-marquee-reverse' : 'animate-marquee'
      )}
      aria-hidden="true"
    >
      {partners.map((partner) => (
        <PartnerLogo key={partner.id} partner={partner} />
      ))}
    </div>
  );
}

export function PartnersCarousel() {
  const duplicatedPartners = [...REGULATORY_PARTNERS, ...REGULATORY_PARTNERS];

  return (
    <section
      id="partners"
      className="py-16 md:py-20 bg-[var(--color-emtech-bg)] border-y border-slate-200"
      aria-labelledby="partners-heading"
    >
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="cyan" size="md" className="mb-4">
            Institutional Trust
          </Badge>
          <h2 id="partners-heading" className="text-3xl md:text-4xl font-extrabold text-[var(--color-emtech-text)] mb-4">
            Regulatory & Institutional Partners
          </h2>
          <p className="text-lg text-[var(--color-emtech-text-secondary)] max-w-2xl mx-auto">
            Operating under the oversight of Kenya&apos;s central regulatory bodies and industry associations.
          </p>
        </div>

        <div className="overflow-hidden" role="list" aria-label="Regulatory partners">
          <MarqueeContent partners={duplicatedPartners} reverse={false} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-10" role="list" aria-label="Regulatory partners static">
          {REGULATORY_PARTNERS.map((partner) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group"
              role="listitem"
            >
              <Card variant="outlined" padding="md" className="h-full text-center group-hover:border-blue-300 group-hover:shadow-md transition-all">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors grayscale group-hover:grayscale-0">
                  <div className="w-full h-full text-slate-400 group-hover:text-[var(--color-emtech-navy)] transition-colors" aria-hidden="true">
                    {partner.logo}
                  </div>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm mb-1">{partner.name}</h4>
                <Badge variant="purple" size="sm">{partner.category}</Badge>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}