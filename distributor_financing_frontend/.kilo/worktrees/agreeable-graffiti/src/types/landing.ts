import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface DropdownLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavMenuItem {
  label: string;
  href?: string;
  dropdown?: DropdownLink[];
  isExternal?: boolean;
}

export interface HeroSlide {
  id: string;
  title: string;
  tag: string;
  description: string;
  metrics: { label: string; value: string }[];
  ctaText: string;
  ctaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
}

export type EcosystemCategory = 'bank' | 'manufacturer' | 'distributor' | 'regulator';

export interface EcosystemPartner {
  id: string;
  name: string;
  code: string;
  category: EcosystemCategory;
  subtext: string;
}

export interface StakeholderPillar {
  id: string;
  role: string;
  badge: string;
  title: string;
  description: string;
  points: string[];
  colorAccent: string;
  icon: ComponentType<{ className?: string }>;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterCol {
  title: string;
  links: FooterLink[];
}

export interface ContactInfo {
  address: string;
  poBox: string;
  email: string;
  phone: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface PartnerItem {
  id: string;
  name: string;
  logo: React.ReactNode;
  category: string;
}