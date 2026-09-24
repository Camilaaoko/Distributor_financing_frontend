import type {
  NavMenuItem,
  HeroSlide,
  EcosystemPartner,
  StakeholderPillar,
  AccordionItem,
  FooterCol,
  ContactInfo,
  SocialLink,
  PartnerItem,
} from '@/types/landing';
import {
  Building2,
  Users,
  Landmark,
  Shield,
  BarChart3,
  FileText,
  Truck,
  CreditCard,
  Zap,
  Target,
  Award,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Youtube,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ShieldCheck,
  TrendingUp,
  Factory,
  Store,
  Building,
  Briefcase,
  GraduationCap,
  Handshake,
  Gavel,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const NAV_ITEMS: NavMenuItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  {
    label: 'Financing Solutions',
    dropdown: [
      { label: 'Invoice Discounting', href: '#', description: 'Unlock cash from unpaid invoices' },
      { label: 'PO Financing', href: '#', description: 'Fund purchase orders without collateral' },
      { label: 'Revolving Lines', href: '#', description: 'Flexible working capital that grows with you' },
    ],
  },
  {
    label: 'Knowledge Centre',
    dropdown: [
      { label: 'Documentation', href: '#' },
      { label: 'Case Studies', href: '#' },
      { label: 'API Docs', href: '#' },
    ],
  },
  {
    label: 'Portals',
    dropdown: [
      { label: 'Anchor Manufacturer Portal', href: '#' },
      { label: 'Distributor & Dealer Portal', href: '#' },
      { label: 'Bank & Funder Portal', href: '#' },
      { label: 'Operations & Risk Admin', href: '#' },
    ],
  },
  { label: 'Contact', href: '#contact' },
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'factoring',
    title: 'Invoice Factoring',
    tag: 'Instant Liquidity',
    description: 'Convert unpaid invoices into working capital within 24 hours. No collateral required.',
    metrics: [
      { label: 'Approval Rate', value: '94%' },
      { label: 'Avg. Funding', value: '<24h' },
      { label: 'Fee Range', value: '1.5-3%' },
    ],
    ctaText: 'Apply for Financing',
    ctaHref: '/onboarding',
    secondaryCtaText: 'Explore Solutions',
    secondaryCtaHref: '#solutions',
  },
  {
    id: 'po-financing',
    title: 'PO Financing',
    tag: 'Order Fulfillment',
    description: 'Fund confirmed purchase orders from anchor manufacturers. Scale without balance sheet constraints.',
    metrics: [
      { label: 'Max Coverage', value: '100%' },
      { label: 'Turnaround', value: '48h' },
      { label: 'Manufacturers', value: '12+' },
    ],
    ctaText: 'Apply for Financing',
    ctaHref: '/onboarding',
    secondaryCtaText: 'Explore Solutions',
    secondaryCtaHref: '#solutions',
  },
  {
    id: 'revolving',
    title: 'Revolving Credit Lines',
    tag: 'Flexible Capital',
    description: 'Draw, repay, and redraw as your sales cycle demands. Interest only on utilized amounts.',
    metrics: [
      { label: 'Utilization', value: 'Pay-per-use' },
      { label: 'Renewal', value: 'Annual' },
      { label: 'Limit Growth', value: 'Auto-scaling' },
    ],
    ctaText: 'Apply for Financing',
    ctaHref: '/onboarding',
    secondaryCtaText: 'Explore Solutions',
    secondaryCtaHref: '#solutions',
  },
  {
    id: 'repayment',
    title: 'Automated Repayment Engine',
    tag: 'Set & Forget',
    description: 'Collection directly from distributor sales proceeds. Zero manual reconciliation.',
    metrics: [
      { label: 'Collection Rate', value: '99.2%' },
      { label: 'Automation', value: '100%' },
      { label: 'Reconciliation', value: 'Real-time' },
    ],
    ctaText: 'Apply for Financing',
    ctaHref: '/onboarding',
    secondaryCtaText: 'Explore Solutions',
    secondaryCtaHref: '#solutions',
  },
];

const banks: EcosystemPartner[] = [
  { id: 'kcb', name: 'KCB Bank', code: 'KCB', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'equity', name: 'Equity Bank', code: 'EQTY', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'ncba', name: 'NCBA Bank', code: 'NCBA', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'coop', name: 'Co-operative Bank', code: 'COOP', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'abs', name: 'Absa Bank Kenya', code: 'ABSA', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'stanbic', name: 'Stanbic Bank', code: 'STAN', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'stanchart', name: 'Standard Chartered', code: 'SCBK', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'dtb', name: 'Diamond Trust Bank', code: 'DTB', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'imb', name: 'I&M Bank', code: 'I&M', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'family', name: 'Family Bank', code: 'FAM', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'prime', name: 'Prime Bank', code: 'PRIME', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'credit', name: 'Credit Bank', code: 'CRDB', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'sidian', name: 'Sidian Bank', code: 'SID', category: 'bank', subtext: 'Commercial Bank' },
  { id: 'kingdom', name: 'Kingdom Bank', code: 'KING', category: 'bank', subtext: 'Commercial Bank' },
];

const manufacturers: EcosystemPartner[] = [
  { id: 'eabl', name: 'East African Breweries', code: 'EABL', category: 'manufacturer', subtext: 'FMCG Manufacturer' },
  { id: 'bidco', name: 'Bidco Africa', code: 'BIDCO', category: 'manufacturer', subtext: 'FMCG Manufacturer' },
  { id: 'brookside', name: 'Brookside Dairy', code: 'BROOK', category: 'manufacturer', subtext: 'Dairy Manufacturer' },
  { id: 'bamburi', name: 'Bamburi Cement', code: 'BAMB', category: 'manufacturer', subtext: 'Cement Manufacturer' },
  { id: 'bat', name: 'BAT Kenya', code: 'BAT', category: 'manufacturer', subtext: 'Tobacco Manufacturer' },
  { id: 'unga', name: 'Unga Group', code: 'UNGA', category: 'manufacturer', subtext: 'Food Manufacturer' },
  { id: 'kevian', name: 'Kevian Kenya', code: 'KEV', category: 'manufacturer', subtext: 'Beverage Manufacturer' },
  { id: 'devki', name: 'Devki Steel', code: 'DEVK', category: 'manufacturer', subtext: 'Steel Manufacturer' },
  { id: 'kenafric', name: 'Kenafric Industries', code: 'KEN', category: 'manufacturer', subtext: 'Confectionery Manufacturer' },
  { id: 'mombasa', name: 'Mombasa Cement', code: 'MOM', category: 'manufacturer', subtext: 'Cement Manufacturer' },
  { id: 'delmonte', name: 'Del Monte Kenya', code: 'DEL', category: 'manufacturer', subtext: 'Food Manufacturer' },
  { id: 'kapa', name: 'Kapa Oil Refineries', code: 'KAPA', category: 'manufacturer', subtext: 'Edible Oils Manufacturer' },
];

const distributors: EcosystemPartner[] = [
  { id: 'carrefour', name: 'Carrefour Kenya', code: 'CARR', category: 'distributor', subtext: 'Retail Chain' },
  { id: 'naivas', name: 'Naivas Supermarket', code: 'NAIV', category: 'distributor', subtext: 'Retail Chain' },
  { id: 'quickmart', name: 'Quickmart Supermarket', code: 'QUICK', category: 'distributor', subtext: 'Retail Chain' },
  { id: 'twiga', name: 'Twiga Foods', code: 'TWIG', category: 'distributor', subtext: 'B2B Food Distribution' },
  { id: 'greenspoon', name: 'Greenspoon Kenya', code: 'GREEN', category: 'distributor', subtext: 'Fresh Produce Distribution' },
  { id: 'hasbah', name: 'Hasbah Kenya', code: 'HASB', category: 'distributor', subtext: 'FMCG Distribution' },
  { id: 'chandarana', name: 'Chandarana Supermarkets', code: 'CHAN', category: 'distributor', subtext: 'Retail Chain' },
  { id: 'kotecha', name: 'Kotecha Group', code: 'KOT', category: 'distributor', subtext: 'Wholesale Distribution' },
];

const regulators: EcosystemPartner[] = [
  { id: 'cbk', name: 'Central Bank of Kenya', code: 'CBK', category: 'regulator', subtext: 'Regulatory Sandbox' },
  { id: 'metropol', name: 'Metropol CRB', code: 'METR', category: 'regulator', subtext: 'Credit Reference Bureau' },
  { id: 'transunion', name: 'TransUnion Kenya', code: 'TU', category: 'regulator', subtext: 'Credit Reference Bureau' },
  { id: 'kam', name: 'Kenya Association of Manufacturers', code: 'KAM', category: 'regulator', subtext: 'Industry Association' },
  { id: 'kepsa', name: 'Kenya Private Sector Alliance', code: 'KEPSA', category: 'regulator', subtext: 'Private Sector Apex Body' },
  { id: 'kba', name: 'Kenya Bankers Association', code: 'KBA', category: 'regulator', subtext: 'Banking Industry Body' },
];

export const ECOSYSTEM_PARTNERS: EcosystemPartner[] = [
  ...banks,
  ...manufacturers,
  ...distributors,
  ...regulators,
];

export const ECOSYSTEM_PARTNERS_DUPLICATED: EcosystemPartner[] = [
  ...ECOSYSTEM_PARTNERS,
  ...ECOSYSTEM_PARTNERS,
];

export const CATEGORY_CONFIG: Record<EcosystemPartner['category'], { label: string; color: string; bgColor: string; icon: LucideIcon }> = {
  bank: { label: 'Bank', color: 'text-blue-700', bgColor: 'bg-blue-50', icon: Building2 },
  manufacturer: { label: 'Manufacturer', color: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: Factory },
  distributor: { label: 'Distributor', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: Truck },
  regulator: { label: 'Regulator', color: 'text-purple-700', bgColor: 'bg-purple-50', icon: Scale },
};

export const STAKEHOLDER_PILLARS: StakeholderPillar[] = [
  {
    id: 'manufacturers',
    role: 'Anchor Manufacturers',
    badge: 'Supply Chain Leaders',
    title: 'Real-Time Inventory Off-Take',
    description: 'Gain visibility into distributor inventory levels and automate replenishment to accelerate sales cycles.',
    points: [
      'Real-time inventory off-take visibility',
      'De-risked trade credit exposure',
      'Accelerated sales order fulfillment',
      'Automated demand forecasting',
    ],
    colorAccent: 'text-blue-600',
    icon: Factory,
  },
  {
    id: 'distributors',
    role: 'Distributors & Dealers',
    badge: 'Network Partners',
    title: 'Collateral-Light Working Capital',
    description: 'Access instant credit limits based on verified manufacturer purchase orders and sales history.',
    points: [
      'Collateral-light working capital',
      'Instant credit limit approval',
      'Seamless order fulfillment',
      'Digital repayment tracking',
    ],
    colorAccent: 'text-amber-600',
    icon: Store,
  },
  {
    id: 'banks',
    role: 'Banks & Financial Institutions',
    badge: 'Capital Providers',
    title: 'Automated Risk Scoring & Settlement',
    description: 'Deploy capital with confidence using verified invoices, real-time escrow, and automated collections.',
    points: [
      'Automated risk scoring models',
      'Real-time escrow & settlement',
      'Verified invoice authentication',
      'Portfolio health analytics',
    ],
    colorAccent: 'text-emerald-600',
    icon: Landmark,
  },
  {
    id: 'operations',
    role: 'Operations & Risk Management',
    badge: 'Platform Governance',
    title: 'Automated KYC/AML & Compliance',
    description: 'End-to-end regulatory compliance with automated onboarding, monitoring, and collection rules.',
    points: [
      'Automated KYC/AML screening',
      'Portfolio health analytics',
      'Configurable repayment rules',
      'Audit-ready reporting',
    ],
    colorAccent: 'text-purple-600',
    icon: Shield,
  },
];

export const ACCORDION_ITEMS: AccordionItem[] = [
  {
    id: 'purpose',
    title: 'Our Purpose',
    content: (
      <div className="space-y-3 text-slate-600">
        <p>To bridge the liquidity gap between commercial banks, manufacturers, and nationwide distributor networks through a unified, multi-tenant value chain financing platform.</p>
        <p>We enable seamless capital flow from depositors to productive enterprises, unlocking working capital for distributors while de-risking lending for financial institutions.</p>
      </div>
    ),
  },
  {
    id: 'vision',
    title: 'Our Vision',
    content: (
      <div className="space-y-3 text-slate-600">
        <p>To become Africa&apos;s leading distributor financing ecosystem, empowering 100,000+ distributors across Kenya and the East African Community with automated, consent-based credit access by 2028.</p>
        <p>We envision a future where every qualified distributor can access working capital within minutes, not months.</p>
      </div>
    ),
  },
  {
    id: 'values',
    title: 'Core Values',
    content: (
      <div className="space-y-3 text-slate-600">
        <ul className="space-y-2">
          <li className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full" /> <strong>Trust:</strong> Bank-grade security and transparency in every transaction.</li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full" /> <strong>Innovation:</strong> Continuous automation of credit underwriting and settlement.</li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full" /> <strong>Inclusion:</strong> Collateral-light financing for underserved distributor segments.</li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full" /> <strong>Partnership:</strong> Shared value creation across manufacturers, banks, and distributors.</li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full" /> <strong>Compliance:</strong> Regulatory-first architecture with automated KYC/AML.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'mandate',
    title: 'Our Mandate',
    content: (
      <div className="space-y-3 text-slate-600">
        <p>Licensed and regulated under the Central Bank of Kenya (CBK) Sandbox framework, EMTech House operates as a certified credit reference and financial technology provider.</p>
        <p>Our mandate includes: digital onboarding of distributors, consent-based data sharing with Credit Reference Bureaus (Metropol, TransUnion), automated invoice verification, escrow management, and real-time settlement across partner banks.</p>
      </div>
    ),
  },
];

export const STRATEGIC_DIRECTION = {
  title: 'Strategic Direction (2024–2028)',
  description: 'Our roadmap aligns with Kenya\'s Vision 2030 and the East African Community financial integration agenda.',
  pillars: [
    {
      title: 'SME Liquidity Access',
      description: 'Scale distributor financing to 50,000+ SMEs across Kenya, Uganda, and Tanzania.',
      metric: '50K+ SMEs',
      icon: Users,
    },
    {
      title: 'Trade Corridor Support',
      description: 'Enable cross-border invoice financing for EAC trade corridors (Northern & Central).',
      metric: '3 Corridors',
      icon: Globe,
    },
    {
      title: 'Digital Public Infrastructure',
      description: 'Integrate with Kenya\'s digital ID (Maisha Namba) and tax systems (KRA iTax) for instant KYC.',
      metric: '100% Digital',
      icon: ShieldCheck,
    },
    {
      title: 'Climate-Smart Financing',
      description: 'Green lending products for distributors in renewable energy and sustainable agriculture.',
      metric: 'ESG Aligned',
      icon: TrendingUp,
    },
  ],
  whitepaperHref: '/whitepaper.pdf',
  whitepaperLabel: 'Download Platform Whitepaper',
};

export const REGULATORY_PARTNERS: PartnerItem[] = [
  {
    id: 'cbk-sandbox',
    name: 'Central Bank of Kenya Sandbox',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" role="img" aria-label="Central Bank of Kenya">
        <rect width="48" height="48" rx="8" fill="currentColor" opacity="0.1"/>
        <text x="24" y="30" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">CBK</text>
        <text x="24" y="38" textAnchor="middle" fontSize="6" fill="currentColor">SANDBOX</text>
      </svg>
    ),
    category: 'Regulator',
  },
  {
    id: 'metropol',
    name: 'Metropol CRB',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" role="img" aria-label="Metropol Credit Reference Bureau">
        <rect width="48" height="48" rx="8" fill="currentColor" opacity="0.1"/>
        <path d="M12 36L24 16L36 36H12Z" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <path d="M16 28H32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="24" cy="20" r="3" fill="currentColor"/>
      </svg>
    ),
    category: 'Credit Bureau',
  },
  {
    id: 'transunion',
    name: 'TransUnion Kenya',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" role="img" aria-label="TransUnion Kenya">
        <rect width="48" height="48" rx="8" fill="currentColor" opacity="0.1"/>
        <path d="M16 32L24 18L32 32" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <path d="M20 26H28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="24" cy="34" r="2" fill="currentColor"/>
      </svg>
    ),
    category: 'Credit Bureau',
  },
  {
    id: 'kam',
    name: 'Kenya Association of Manufacturers',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" role="img" aria-label="Kenya Association of Manufacturers">
        <rect width="48" height="48" rx="8" fill="currentColor" opacity="0.1"/>
        <path d="M14 34L24 16L34 34H14Z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M18 28H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="22" r="2.5" fill="currentColor"/>
        <rect x="21" y="26" width="6" height="6" rx="1" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
    category: 'Industry Body',
  },
  {
    id: 'kepsa',
    name: 'Kenya Private Sector Alliance',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" role="img" aria-label="Kenya Private Sector Alliance">
        <rect width="48" height="48" rx="8" fill="currentColor" opacity="0.1"/>
        <path d="M16 32L24 16L32 32" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <path d="M16 32L32 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M20 24H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="20" r="2.5" fill="currentColor"/>
      </svg>
    ),
    category: 'Apex Body',
  },
  {
    id: 'kba',
    name: 'Kenya Bankers Association',
    logo: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" role="img" aria-label="Kenya Bankers Association">
        <rect width="48" height="48" rx="8" fill="currentColor" opacity="0.1"/>
        <rect x="12" y="18" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M24 18V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18 26H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 32H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="36" r="1.5" fill="currentColor"/>
      </svg>
    ),
    category: 'Banking Body',
  },
];

export const FOOTER_COLS: FooterCol[] = [
  {
    title: 'Ecosystem Partners',
    links: [
      { label: 'Banking Partners', href: '#' },
      { label: 'ERP Connectors (SAP, Oracle)', href: '#' },
      { label: 'Digital Signature Providers', href: '#' },
      { label: 'Credit Reference Bureaus', href: '#' },
      { label: 'Insurance Partners', href: '#' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { label: 'Financing Solutions', href: '#solutions' },
      { label: 'Developer API Docs', href: '#api-docs' },
      { label: 'Security Policy', href: '#security' },
      { label: 'BOI Verification', href: '#boi' },
      { label: 'FAQs', href: '#faqs' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#docs' },
      { label: 'Case Studies', href: '#case-studies' },
      { label: 'Blog & Insights', href: '#blog' },
      { label: 'Webinars', href: '#webinars' },
      { label: 'Whitepapers', href: '/whitepaper.pdf' },
      { label: 'FAQs', href: '#faqs' },
    ],
  },
  {
    title: 'Legal & Compliance',
    links: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
      { label: 'Regulatory Disclosures', href: '#disclosures' },
      { label: 'Whistleblower Hotline', href: '#whistleblower' },
    ],
  },
];

export const FOOTER_NAV_COLS: FooterCol[] = [
  {
    title: 'Solutions',
    links: [
      { label: 'Distributor Financing', href: '#solutions' },
      { label: 'Credit Assessment', href: '#solutions' },
      { label: 'Revolving Credit', href: '#solutions' },
      { label: 'Onboarding & KYC', href: '#onboarding' },
      { label: 'Credit Monitoring', href: '#solutions' },
      { label: 'Collections Management', href: '#solutions' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#docs' },
      { label: 'Case Studies', href: '#case-studies' },
      { label: 'Blog & Insights', href: '#blog' },
      { label: 'Webinars', href: '#webinars' },
      { label: 'Whitepapers', href: '/whitepaper.pdf' },
      { label: 'FAQs', href: '#faqs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#about' },
      { label: 'Our Team', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact Us', href: '#contact' },
      { label: 'Partners', href: '#partners' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
      { label: 'Regulatory Disclosures', href: '#disclosures' },
      { label: 'Security Policy', href: '#security' },
    ],
  },
];

export const NEWSLETTER_CONFIG = {
  title: 'Stay Updated',
  description: 'Subscribe to our newsletter for the latest updates, insights, and product announcements.',
  placeholder: 'Enter your email',
  buttonText: 'Subscribe',
};

export const SECURITY_TRUST = {
  icon: ShieldCheck,
  title: 'Enterprise-Grade Security',
  description: 'Your data is protected with bank-level encryption and compliance standards.',
};

export const SERVICE_MESSAGE = {
  title: 'Proudly serving businesses across Africa',
  icon: Globe,
};

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'LinkedIn', href: 'https://linkedin.com/company/emtech-house', icon: Linkedin },
  { label: 'X (Twitter)', href: 'https://twitter.com/emtechhouse', icon: Twitter },
  { label: 'GitHub', href: 'https://github.com/emtechhouse', icon: Github },
  { label: 'YouTube', href: 'https://youtube.com/@emtechhouse', icon: Youtube },
];

export const CONTACT_INFO: ContactInfo = {
  address: '3rd Floor, Samtech Business Park, Tatu City, Kiambu County',
  poBox: 'P.O. Box 11001 - 00100, Nairobi, Kenya',
  email: 'info@emtechhouse.co.ke',
  phone: '0722 582328',
};

export const WHISTLEBLOWER_CTA = {
  label: 'Whistleblower / Audit',
  href: '#whistleblower',
};

export const NAV_ICONS = {
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronUp: ChevronUp,
};

export const HERO_ICONS = {
  building: Building2,
  users: Users,
  landmark: Landmark,
  shield: Shield,
  chart: BarChart3,
  file: FileText,
  truck: Truck,
  card: CreditCard,
  zap: Zap,
  target: Target,
  award: Award,
  globe: Globe,
  checkcircle: CheckCircle2,
  trendingup: TrendingUp,
};

export const FOOTER_ICONS = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  youtube: Youtube,
  shield: ShieldCheck,
};

export const PILLAR_ICONS = {
  factory: Factory,
  store: Store,
  building: Building,
  briefcase: Briefcase,
  graduation: GraduationCap,
  handshake: Handshake,
  gavel: Gavel,
  scale: Scale,
};