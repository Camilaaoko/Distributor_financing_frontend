"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FOOTER_NAV_COLS,
  SOCIAL_LINKS,
  CONTACT_INFO,
  NEWSLETTER_CONFIG,
} from "@/lib/constants/landing";
import {
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email && email.includes("@")) {
      setSubmitted(true);
      setEmail("");

      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <footer
      id="footer"
      className="w-full rounded-t-xl border-t border-[var(--color-emtech-border)] bg-[var(--color-emtech-bg)] text-[var(--color-emtech-text)]"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="container mx-auto flex w-full flex-col gap-12 px-4 py-12 md:gap-16 md:py-16 lg:px-6">
        {/* ============================================================
            TOP ROW: BRAND + NEWSLETTER
        ============================================================ */}
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:gap-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex max-w-xl flex-col gap-4"
          >
            <Link href="/" aria-label="EMTech House Home" className="inline-block">
              <Image
                src="/images/emtech_color_logo.png"
                alt="EMTech House"
                width={140}
                height={36}
                className="h-9 w-auto"
              />
            </Link>

            <p className="max-w-md text-sm leading-6 text-[var(--color-emtech-text-secondary)] md:text-base">
              Empowering Kenya&apos;s value chain with automated,
              consent-based distributor financing.
            </p>

            <div
              className="mt-1 flex items-center gap-2"
              role="list"
              aria-label="Social media links"
            >
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  role="listitem"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-emtech-border)] bg-[var(--color-emtech-bg)] text-[var(--color-emtech-text-secondary)] transition-all duration-200 hover:border-[var(--color-emtech-blue)] hover:bg-[var(--color-emtech-blue)]/5 hover:text-[var(--color-emtech-blue)]"
                >
                  <social.icon
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="w-full lg:max-w-sm lg:flex-shrink-0"
          >
            <div className="rounded-xl border border-[var(--color-emtech-border)] bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-[var(--color-emtech-blue)]">
                  {NEWSLETTER_CONFIG.title}
                </h3>

                <p className="mt-1.5 text-sm leading-5 text-[var(--color-emtech-text-secondary)]">
                  {NEWSLETTER_CONFIG.description}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2.5"
                noValidate
              >
                <Input
                  type="email"
                  placeholder={NEWSLETTER_CONFIG.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address for newsletter subscription"
                  autoComplete="email"
                  disabled={submitted}
                  required
                  className="w-full"
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={
                    submitted ||
                    !email ||
                    !email.includes("@")
                  }
                  aria-label={
                    submitted
                      ? "Subscribed"
                      : "Subscribe to newsletter"
                  }
                >
                  {submitted ? (
                    <>
                      <svg
                        className="mr-1.5 h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Subscribed
                    </>
                  ) : (
                    NEWSLETTER_CONFIG.buttonText
                  )}
                </Button>

                <p className="pt-1 text-xs leading-4 text-[var(--color-emtech-text-secondary)]">
                  By subscribing, you agree to our{" "}
                  <Link
                    href="#privacy"
                    className="underline underline-offset-2 transition-colors hover:text-[var(--color-emtech-blue)]"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </div>
          </motion.div>
        </div>

        {/* ============================================================
            NAVIGATION + CONTACT
        ============================================================ */}
        <div className="border-t border-[var(--color-emtech-border)] pt-10 md:pt-12">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
            {FOOTER_NAV_COLS.map((col, colIndex) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.05 + colIndex * 0.04,
                }}
              >
                <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-emtech-blue)]">
                  {col.title}
                </h4>

                <ul className="flex flex-col gap-3" role="list">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="block text-sm leading-5 text-[var(--color-emtech-text-secondary)] transition-colors duration-200 hover:text-[var(--color-emtech-blue)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.21,
              }}
              className="col-span-2 md:col-span-2 lg:col-span-1"
            >
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-emtech-blue)]">
                Contact Us
              </h4>

              <address className="not-italic text-sm leading-5 text-[var(--color-emtech-text-secondary)]">
                <div className="mb-4">
                  <p>{CONTACT_INFO.address}</p>

                  <p className="mt-1">{CONTACT_INFO.poBox}</p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <a
                    href={
                      "tel:" +
                      CONTACT_INFO.phone.replace(/\s/g, "")
                    }
                    className="flex items-center gap-2 transition-colors hover:text-[var(--color-emtech-blue)]"
                  >
                    <Phone
                      className="h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>{CONTACT_INFO.phone}</span>
                  </a>

                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="flex items-center gap-2 break-all transition-colors hover:text-[var(--color-emtech-blue)]"
                  >
                    <Mail
                      className="h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>{CONTACT_INFO.email}</span>
                  </a>
                </div>
              </address>
            </motion.div>
          </div>
        </div>

        {/* ============================================================
            BOTTOM LEGAL BAR
        ============================================================ */}
        <div className="border-t border-[var(--color-emtech-border)] pt-6">
          <div className="flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-xs text-[var(--color-emtech-text-secondary)] md:text-left">
              &copy; {currentYear} EMTech House. All rights reserved.
            </p>

            <nav
              aria-label="Legal links"
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            >
              <Link
                href="#privacy"
                className="text-xs text-[var(--color-emtech-text-secondary)] transition-colors hover:text-[var(--color-emtech-blue)]"
              >
                Privacy Policy
              </Link>

              <Link
                href="#terms"
                className="text-xs text-[var(--color-emtech-text-secondary)] transition-colors hover:text-[var(--color-emtech-blue)]"
              >
                Terms of Service
              </Link>

              <Link
                href="#cookies"
                className="text-xs text-[var(--color-emtech-text-secondary)] transition-colors hover:text-[var(--color-emtech-blue)]"
              >
                Cookie Policy
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;