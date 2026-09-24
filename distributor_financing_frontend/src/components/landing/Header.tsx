"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { assetPath } from "@/lib/assets";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About Us" },
    { href: "#solutions", label: "Solutions" },
    { href: "#resources", label: "Resources" },
    { href: "#contact", label: "Contact Us" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-16">
        <div className="flex items-center justify-between h-20 md:h-24">
          <Link href="/" className="flex items-center gap-2" aria-label="EMTech House Home">
            <Image
              src={assetPath("/images/emtech_color_logo.png")}
              alt="EMTech House"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
            />
            <span className="font-headline text-headline-md font-bold text-primary hidden sm:block">
              EMTech House
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-label-bold text-on-surface-variant hover:text-secondary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2 rounded-full bg-primary text-on-primary font-label-bold hover:bg-primary-light transition-colors shadow-sm"
            >
              Sign In
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-on-surface"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-outline-variant animate-slide-down">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-label-bold text-on-surface-variant hover:text-secondary hover:bg-surface-container-low rounded-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-outline-variant">
                <Link
                  href="/login"
                  className="px-4 py-3 text-center text-label-bold text-on-primary bg-primary rounded-xl hover:bg-primary-light transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
