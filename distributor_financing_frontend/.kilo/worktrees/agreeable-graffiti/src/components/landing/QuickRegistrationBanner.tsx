"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, ShieldCheck, Clock, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const features = [
  { icon: Zap, label: 'ERP Integration', desc: 'SAP, Oracle, Netsuite connectors' },
  { icon: ShieldCheck, label: 'Digital Underwriting', desc: 'Automated credit scoring' },
  { icon: Clock, label: 'Instant Limits', desc: 'Approval in minutes, not weeks' },
  { icon: LinkIcon, label: 'Single Pipeline', desc: 'End-to-end automated flow' },
];

export function QuickRegistrationBanner() {
  return (
    <section
      id="quick-registration"
      className="relative overflow-hidden bg-[var(--color-emtech-navy)] text-white"
      aria-labelledby="quick-reg-heading"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-emtech-navy)] via-[var(--color-emtech-cyan)]/20 to-[var(--color-emtech-navy)]" />
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <svg viewBox="0 0 1200 400" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="white" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="1200" height="400" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative max-w-[1600px] mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge variant="warning" size="md" className="mb-6 inline-block">
            Fast-Track Onboarding
          </Badge>

          <h2 id="quick-reg-heading" className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
            In One Streamlined Step! Connect Your Supply Chain
          </h2>

          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            ERP integration and digital credit underwriting are now merged into a single automated pipeline.
            Submit your business profile and receive automated credit limits within minutes.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-left p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                  <feature.icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold text-white">{feature.label}</div>
                  <div className="text-xs text-slate-300">{feature.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <Button size="lg" asChild className="w-full sm:w-auto">
            <a href="/onboarding" className="flex items-center justify-center gap-2">
              Login to Access Distributor Financing
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}