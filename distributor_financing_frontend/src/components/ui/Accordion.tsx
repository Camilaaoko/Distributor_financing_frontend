"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccordionItem } from '@/types/landing';

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, defaultOpen = [], allowMultiple = false, className }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpen);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      }
      return allowMultiple ? [...prev, id] : [id];
    });
  };

  const isOpen = (id: string) => openIds.includes(id);

  return (
    <div className={cn('space-y-3', className)} role="region" aria-label="Accordion">
      {items.map((item) => (
        <AccordionItemComponent
          key={item.id}
          item={item}
          isOpen={isOpen(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  );
}

interface AccordionItemComponentProps {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItemComponent({ item, isOpen, onToggle }: AccordionItemComponentProps) {
  const contentId = `accordion-content-${item.id}`;
  const headerId = `accordion-header-${item.id}`;

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
      <button
        id={headerId}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={cn(
          'w-full px-6 py-4 flex items-center justify-between text-left',
          'hover:bg-slate-50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emtech-orange)] focus-visible:ring-offset-2'
        )}
      >
        <span className="font-semibold text-slate-900 pr-4">{item.title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-shrink-0 text-slate-500"
          aria-hidden="true"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={contentId}
            role="region"
            aria-labelledby={headerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-slate-600 leading-relaxed">
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}