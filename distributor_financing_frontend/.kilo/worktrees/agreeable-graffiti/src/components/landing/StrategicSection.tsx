"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, Globe, ShieldCheck, Users, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Accordion } from '@/components/ui/Accordion';
import { ACCORDION_ITEMS, STRATEGIC_DIRECTION } from '@/lib/constants/landing';

const pillarIcons = {
  'SME Liquidity Access': Users,
  'Trade Corridor Support': Globe,
  'Digital Public Infrastructure': ShieldCheck,
  'Climate-Smart Financing': TrendingUp,
};

export function StrategicSection() {
  return (
    <section
      id="strategy"
      className="py-16 md:py-24 bg-white"
      aria-labelledby="strategic-heading"
    >
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="cyan" size="md" className="mb-4">
            Strategic Direction
          </Badge>
          <h2 id="strategic-heading" className="text-3xl md:text-4xl font-extrabold text-[var(--color-emtech-text)] mb-4">
            Building Africa&apos;s Financial Infrastructure
          </h2>
          <p className="text-lg text-[var(--color-emtech-text-secondary)] max-w-2xl mx-auto">
            Our 2024–2028 roadmap aligns with Kenya&apos;s Vision 2030 and the East African Community
            financial integration agenda.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="lg:sticky lg:top-24">
            <Accordion items={ACCORDION_ITEMS} defaultOpen={['purpose']} allowMultiple={false} />
          </div>

          <div>
            <Card variant="elevated" padding="lg" className="h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-emtech-navy)]/10 text-[var(--color-emtech-navy)] flex items-center justify-center">
                  <Target className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-emtech-text)]">{STRATEGIC_DIRECTION.title}</h3>
                  <p className="text-sm text-[var(--color-emtech-text-secondary)]">{STRATEGIC_DIRECTION.description}</p>
                </div>
              </div>

              <div className="space-y-6 mb-8" role="list" aria-label="Strategic pillars">
                {STRATEGIC_DIRECTION.pillars.map((pillar, i) => {
                  const Icon = pillarIcons[pillar.title as keyof typeof pillarIcons] || Target;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl"
                      role="listitem"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-emtech-navy)]/10 text-[var(--color-emtech-navy)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--color-emtech-text)] mb-1">{pillar.title}</h4>
                        <p className="text-sm text-[var(--color-emtech-text-secondary)] mb-2">{pillar.description}</p>
                        <Badge variant="cyan" size="sm">{pillar.metric}</Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <Button variant="outline" size="md" asChild className="w-full sm:w-auto">
                <a href={STRATEGIC_DIRECTION.whitepaperHref} className="flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" aria-hidden="true" />
                  {STRATEGIC_DIRECTION.whitepaperLabel}
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}