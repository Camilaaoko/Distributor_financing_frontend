"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HERO_SLIDES, HERO_ICONS } from '@/lib/constants/landing';
import type { HeroSlide } from '@/types/landing';

const slideIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  factoring: HERO_ICONS.file,
  'po-financing': HERO_ICONS.truck,
  revolving: HERO_ICONS.zap,
  repayment: HERO_ICONS.checkcircle,
};

const metricIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Approval Rate': HERO_ICONS.award,
  'Avg. Funding': HERO_ICONS.zap,
  'Fee Range': HERO_ICONS.chart,
  'Max Coverage': HERO_ICONS.shield,
  'Turnaround': HERO_ICONS.target,
  'Manufacturers': HERO_ICONS.building,
  'Utilization': HERO_ICONS.zap,
  'Renewal': HERO_ICONS.globe,
  'Limit Growth': HERO_ICONS.trendingup,
  'Collection Rate': HERO_ICONS.checkcircle,
  'Automation': HERO_ICONS.zap,
  'Reconciliation': HERO_ICONS.target,
};

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  }, [activeIndex]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const currentSlide = HERO_SLIDES[activeIndex];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20"
      aria-label="Hero section"
    >
      <div className="absolute inset-0 bg-[var(--color-emtech-bg)]" />
      <HeroBackgroundSVG className="absolute inset-0 opacity-60" />

      <div className="relative max-w-[1600px] mx-auto px-6 py-20 md:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 mb-6">
                <Badge variant="cyan" size="sm">
                  {currentSlide.tag}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--color-emtech-text)] leading-tight tracking-tight mb-6">
                {currentSlide.title}
                <br />
                <span className="text-[var(--color-emtech-cyan)]">Ecosystem Platform</span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--color-emtech-text-secondary)] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                {currentSlide.description}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8 max-w-xl mx-auto lg:mx-0">
                {currentSlide.metrics.map((metric, i) => {
                  const MetricIcon = metricIcons[metric.label] || HERO_ICONS.chart;
                  return (
                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <MetricIcon className="w-5 h-5 text-[var(--color-emtech-cyan)]" aria-hidden="true" />
                      </div>
                      <div className="text-2xl font-bold text-[var(--color-emtech-navy)]">{metric.value}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{metric.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href={currentSlide.ctaHref} className="flex items-center gap-2">
                    {currentSlide.ctaText}
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                  <Link href={currentSlide.secondaryCtaHref} className="flex items-center gap-2">
                    {currentSlide.secondaryCtaText}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="relative" aria-hidden="true">
            <SlideVisualization slide={currentSlide} />
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3" aria-label="Slide navigation">
          <button
            onClick={prevSlide}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white text-slate-600 hover:text-[var(--color-emtech-navy)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emtech-orange)]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Slide indicators">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Go to slide ${i + 1}: ${HERO_SLIDES[i].title}`}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emtech-orange)] focus-visible:ring-offset-2',
                  i === activeIndex
                    ? 'bg-[var(--color-emtech-orange)] w-8'
                    : 'bg-slate-300 hover:bg-slate-400'
                )}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white text-slate-600 hover:text-[var(--color-emtech-navy)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emtech-orange)]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function SlideVisualization({ slide }: { slide: HeroSlide }) {
  const SlideIcon = slideIcons[slide.id] || HERO_ICONS.building;

  return (
    <div className="relative aspect-square max-w-lg mx-auto">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full text-[var(--color-emtech-cyan)] opacity-80"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1044A5" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#009BE5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#F27A18" stopOpacity="0.15" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="400" height="400" fill="url(#heroGradient)" rx="24" />

        <g filter="url(#glow)" stroke="url(#heroGradient)" strokeWidth="1.5" fill="none">
          <circle cx="200" cy="200" r="140" strokeDasharray="880" strokeDashoffset="0" opacity="0.3" />
          <circle cx="200" cy="200" r="100" strokeDasharray="628" strokeDashoffset="0" opacity="0.4" />
          <circle cx="200" cy="200" r="60" strokeDasharray="377" strokeDashoffset="0" opacity="0.5" />
        </g>

        <g className="node-group">
          <circle cx="200" cy="200" r="24" fill="#1044A5" opacity="0.9" />
          <circle cx="200" cy="200" r="18" fill="#009BE5" />
          <circle cx="200" cy="200" r="10" fill="#F27A18" />
        </g>

        <g stroke="#1044A5" strokeWidth="2" opacity="0.6">
          <line x1="200" y1="200" x2="80" y2="80" strokeDasharray="10,5" />
          <line x1="200" y1="200" x2="320" y2="80" strokeDasharray="10,5" />
          <line x1="200" y1="200" x2="80" y2="320" strokeDasharray="10,5" />
          <line x1="200" y1="200" x2="320" y2="320" strokeDasharray="10,5" />
        </g>

        <g fill="#1044A5" opacity="0.8">
          <circle cx="80" cy="80" r="12" />
          <circle cx="320" cy="80" r="12" />
          <circle cx="80" cy="320" r="12" />
          <circle cx="320" cy="320" r="12" />
        </g>

        <g fill="#009BE5">
          <circle cx="120" cy="150" r="6" />
          <circle cx="280" cy="150" r="6" />
          <circle cx="120" cy="250" r="6" />
          <circle cx="280" cy="250" r="6" />
        </g>

        <g fill="#F27A18" opacity="0.8">
          <polygon points="200,80 210,100 190,100" />
          <polygon points="200,320 210,300 190,300" />
          <polygon points="80,200 100,210 100,190" />
          <polygon points="320,200 300,210 300,190" />
        </g>
      </svg>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" aria-hidden="true">
        <SlideIcon className="w-8 h-8 text-[var(--color-emtech-navy)] drop-shadow-lg" />
      </div>
    </div>
  );
}

function HeroBackgroundSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 800" className={`w-full h-full ${className || ""}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1044A5" stopOpacity="0.03" />
          <stop offset="50%" stopColor="#009BE5" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#F27A18" stopOpacity="0.02" />
        </linearGradient>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1044A5" strokeWidth="0.5" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#bgGrad)" />
      <rect width="1200" height="800" fill="url(#grid)" />
    </svg>
  );
}