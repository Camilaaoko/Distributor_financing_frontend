"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { NAV_ITEMS, WHISTLEBLOWER_CTA, NAV_ICONS } from '@/lib/constants/landing';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleKeyDown = (event: React.KeyboardEvent, itemLabel: string) => {
    if (event.key === 'Escape') {
      setActiveDropdown(null);
      setMobileOpen(false);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const item = NAV_ITEMS.find((i) => i.label === itemLabel);
      if (item?.dropdown) {
        setActiveDropdown(activeDropdown === itemLabel ? null : itemLabel);
      }
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : 'bg-transparent'
        )}
      >
        <nav className="max-w-[1600px] mx-auto px-6" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16 md:h-18">
            <Link href="#home" className="flex items-center gap-3" aria-label="EMTech House Home">
              <div className="bg-white p-1.5 rounded-xl shadow-sm flex items-center justify-center w-10 h-10 overflow-hidden border border-slate-200">
                <img
                  src="https://media.licdn.com/dms/image/v2/C4D0BAQEp-yTNrqcBXQ/company-logo_200_200/company-logo_200_200/0/1630461077813/e_m_technology_house_ltd_logo?e=2147483647&v=beta&t=2PFZvqHUbTZQygZBmBHT4CV8a2k3FyN1YKRMY_wqYMw"
                  alt=""
                  className="w-full h-full object-contain"
                  aria-hidden="true"
                />
              </div>
              <span className="text-[var(--color-emtech-navy)] font-bold text-lg md:text-xl tracking-tight hidden sm:block">
                EMTech House
              </span>
            </Link>

            <div className="hidden md:flex md:items-center md:gap-1">
              {NAV_ITEMS.map((item) => (
                <DropdownItem
                  key={item.label}
                  item={item}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  dropdownRef={dropdownRef}
                  onKeyDown={handleKeyDown}
                />
              ))}
            </div>

            <div className="hidden md:flex md:items-center md:gap-3">
              <Button variant="whistleblower" size="sm" asChild>
                <Link href={WHISTLEBLOWER_CTA.href} className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  <span>{WHISTLEBLOWER_CTA.label}</span>
                </Link>
              </Button>
            </div>

            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emtech-orange)]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            ref={mobileMenuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full md:w-80 bg-white shadow-2xl md:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-bold text-slate-900">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2" aria-label="Mobile menu items">
              {NAV_ITEMS.map((item) => (
                <MobileDropdownItem
                  key={item.label}
                  item={item}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  setMobileOpen={setMobileOpen}
                  onKeyDown={handleKeyDown}
                />
              ))}
            </nav>

            <div className="p-4 border-t border-slate-200 space-y-3">
              <Button variant="whistleblower" size="md" className="w-full" asChild>
                <Link href={WHISTLEBLOWER_CTA.href} className="flex items-center justify-center gap-2">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                  <span>{WHISTLEBLOWER_CTA.label}</span>
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface DropdownItemProps {
  item: (typeof NAV_ITEMS)[0];
  activeDropdown: string | null;
  setActiveDropdown: (label: string | null) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onKeyDown: (event: React.KeyboardEvent, itemLabel: string) => void;
}

function DropdownItem({ item, activeDropdown, setActiveDropdown, dropdownRef, onKeyDown }: DropdownItemProps) {
  const isActive = activeDropdown === item.label;
  const hasDropdown = !!item.dropdown;

  if (!hasDropdown) {
    return (
      <Link
        href={item.href!}
        className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-[var(--color-emtech-navy)] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emtech-orange)]"
        onKeyDown={(e) => onKeyDown(e, item.label)}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setActiveDropdown(isActive ? null : item.label)}
        onKeyDown={(e) => onKeyDown(e, item.label)}
        aria-expanded={isActive}
        aria-haspopup="true"
        aria-controls={`dropdown-${item.label}`}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emtech-orange)]',
          isActive ? 'text-[var(--color-emtech-navy)] bg-slate-50' : 'text-slate-700 hover:text-[var(--color-emtech-navy)] hover:bg-slate-50'
        )}
      >
        {item.label}
        <NAV_ICONS.chevronDown className={cn('w-4 h-4 transition-transform', isActive && 'rotate-180')} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            id={`dropdown-${item.label}`}
            role="menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
          >
            {item.dropdown!.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setActiveDropdown(null)}
                className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-[var(--color-emtech-navy)] transition-colors"
                role="menuitem"
              >
                <div className="font-medium">{link.label}</div>
                {link.description && <div className="text-xs text-slate-500 mt-0.5">{link.description}</div>}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MobileDropdownItemProps {
  item: (typeof NAV_ITEMS)[0];
  activeDropdown: string | null;
  setActiveDropdown: (label: string | null) => void;
  setMobileOpen: (open: boolean) => void;
  onKeyDown: (event: React.KeyboardEvent, itemLabel: string) => void;
}

function MobileDropdownItem({ item, activeDropdown, setActiveDropdown, setMobileOpen, onKeyDown }: MobileDropdownItemProps) {
  const isActive = activeDropdown === item.label;
  const hasDropdown = !!item.dropdown;

  if (!hasDropdown) {
    return (
      <Link
        href={item.href!}
        onClick={() => setMobileOpen(false)}
        className="block px-2 py-3 text-base font-medium text-slate-700 hover:text-[var(--color-emtech-navy)] rounded-lg transition-colors"
        onKeyDown={(e) => onKeyDown(e, item.label)}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setActiveDropdown(isActive ? null : item.label)}
        onKeyDown={(e) => onKeyDown(e, item.label)}
        aria-expanded={isActive}
        className={cn(
          'w-full px-4 py-3 flex items-center justify-between text-left text-base font-medium',
          'hover:bg-slate-50 transition-colors',
          isActive ? 'text-[var(--color-emtech-navy)] bg-slate-50' : 'text-slate-700'
        )}
      >
        {item.label}
        <NAV_ICONS.chevronDown className={cn('w-5 h-5 transition-transform text-slate-500', isActive && 'rotate-180')} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-50/50"
          >
            {item.dropdown!.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => { setActiveDropdown(null); setMobileOpen(false); }}
                className="block px-6 py-3 text-sm text-slate-600 hover:text-[var(--color-emtech-navy)] border-t border-slate-200"
              >
                <div className="font-medium">{link.label}</div>
                {link.description && <div className="text-xs text-slate-500 mt-0.5">{link.description}</div>}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}