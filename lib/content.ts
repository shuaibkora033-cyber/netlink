/**
 * Central content source for the Netlink site.
 * Edit this file to update copy, services, FAQs, industries, etc.
 * Do not put secrets or API keys here — this file ships to the client.
 */

// ─── Site meta ───────────────────────────────────────────────────────────────

export const site = {
  name: "Netlink",
  domain: "netlink.agency",
  tagline: "Performance-driven growth for service businesses",
  email: "info@netlink.agency",
  phone: "+1 (202) 474-4630",
  phoneHref: "tel:+12024744630",
  social: {
    instagram: "https://instagram.com/netlinkagency",
    linkedin: "https://www.linkedin.com/company/netlink-agency",
  },
};

// ─── Nav ─────────────────────────────────────────────────────────────────────

export const nav = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Industries", href: "#industries" },
  { label: "Results", href: "#results" },
  { label: "FAQ", href: "#faq" },
];

// ─── Hero ────────────────────────────────────────────────────────────────────

export const hero = {
  eyebrow: "Digital growth agency",
  rotatingWords: ["Leads", "Websites", "Campaigns", "Growth"],
  headlineStart: "Build a digital growth system that turns clicks into",
  subheadline:
    "Netlink helps service businesses build high-converting websites, launch performance campaigns, and create lead generation systems designed to scale.",
  primaryCta: "Get a Free Growth Consultation",
  secondaryCta: "Explore Services",
};

// ─── Hero stats strip ────────────────────────────────────────────────────────

export const stats = [
  { value: 120, suffix: "+", label: "Campaigns launched" },
  { value: 3.4, suffix: "×", label: "Avg. return on ad spend" },
  { value: 68, suffix: "%", label: "Lower cost per lead" },
  { value: 24, suffix: "/7", label: "Performance monitoring" },
];

// ─── Problem ─────────────────────────────────────────────────────────────────

export const problem = {
  eyebrow: "The problem",
  title: "Most service businesses lose growth in the gaps.",
  body: "You don't have a traffic problem — you have a conversion problem. Leads leak out of slow websites, disconnected campaigns, and follow-up that never happens. Netlink closes those gaps with one connected system.",
  points: [
    {
      title: "Traffic that doesn't convert",
      text: "Ad spend drives visitors to pages that were never built to turn attention into booked calls.",
    },
    {
      title: "Leads with no system",
      text: "Enquiries slip through the cracks because there's no reliable process to qualify and follow up fast.",
    },
    {
      title: "Marketing you can't measure",
      text: "Without clean tracking, you're guessing which channels actually produce revenue — and which just burn budget.",
    },
  ],
};

// ─── Services (9-service bento grid) ─────────────────────────────────────────
// span: 2 = wide card (2 columns on lg), span: 1 = standard card.
// Layout (3-col desktop): 2+1 | 1+2 | 1+1+1 | 2+1

export const services = [
  {
    id: "lead-gen",
    title: "Lead Generation",
    text: "Strategic inbound and outbound funnels that identify, engage, and qualify high-intent prospects before handing them to your team.",
    features: ["Inbound funnels", "Lead scoring", "CRM integration"],
    span: 2,
  },
  {
    id: "appt-setting",
    title: "Appointment Setting",
    text: "Systematic outreach and follow-up sequences that land qualified prospects directly onto your sales calendar.",
    features: ["Calendar integration", "Automated follow-up", "Qualification scripts"],
    span: 1,
  },
  {
    id: "web-dev",
    title: "Web Development",
    text: "High-converting websites and landing pages built for speed, trust, and measurable action — not just aesthetics.",
    features: ["Conversion-first build", "Sub-2s load times", "Mobile-first"],
    span: 1,
  },
  {
    id: "uiux",
    title: "UI/UX Design",
    text: "Interfaces designed around real user psychology to reduce friction, build trust, and maximize every conversion opportunity.",
    features: ["User research", "Wireframes & prototypes", "Design systems"],
    span: 2,
  },
  {
    id: "perf-marketing",
    title: "Performance Marketing",
    text: "Data-driven paid media across Meta, Google, and beyond — engineered for maximum reach and predictable ROI.",
    features: ["Paid social & search", "Creative testing", "ROI tracking"],
    span: 1,
  },
  {
    id: "google-ads",
    title: "Google Ads",
    text: "Intent-based search campaigns that capture high-value prospects at the exact moment they're searching for you.",
    features: ["Search & display", "Remarketing", "Smart bidding"],
    span: 1,
  },
  {
    id: "social-media",
    title: "Social Media Marketing",
    text: "Content and community strategies that build authority, grow reach, and turn followers into paying customers.",
    features: ["Content strategy", "Community management", "Growth analytics"],
    span: 1,
  },
  {
    id: "branding",
    title: "Branding & Creative Direction",
    text: "A distinct brand identity — logo, visuals, and messaging — engineered to position you as the premium choice in your market.",
    features: ["Brand identity", "Logo & visuals", "Ad creative"],
    span: 2,
  },
  {
    id: "conversion",
    title: "Conversion Optimization",
    text: "Systematic testing and funnel analysis that extracts more revenue from your existing traffic without raising ad spend.",
    features: ["A/B testing", "Heatmap analysis", "Funnel audits"],
    span: 1,
  },
] as const;

export type Service = (typeof services)[number];

// ─── Growth system (process) ──────────────────────────────────────────────────

export const process = {
  eyebrow: "The Netlink growth system",
  title: "A clear, repeatable system for compounding growth.",
  steps: [
    {
      num: "01",
      title: "Discover",
      text: "We audit your funnel, market, and numbers to find where growth is leaking — and where the biggest wins are hiding.",
    },
    {
      num: "02",
      title: "Build",
      text: "We design conversion-focused pages, offers, and tracking, then wire up the automation that turns interest into booked calls.",
    },
    {
      num: "03",
      title: "Launch",
      text: "We deploy performance campaigns with sharp creative and tight targeting, driving qualified traffic into your new system.",
    },
    {
      num: "04",
      title: "Optimize",
      text: "We monitor every metric that matters and iterate weekly — scaling what works and cutting what doesn't to compound results.",
    },
  ],
};

// ─── Industries ───────────────────────────────────────────────────────────────

export const industries = [
  { id: "solar", name: "Solar & Clean Energy" },
  { id: "home-services", name: "Home Services & HVAC" },
  { id: "healthcare", name: "Healthcare & Wellness" },
  { id: "real-estate", name: "Real Estate & Property" },
  { id: "professional", name: "Professional Services" },
  { id: "construction", name: "Construction & Trades" },
  { id: "ecommerce", name: "E-commerce & Retail" },
  { id: "finance", name: "Financial Services" },
];

// ─── Google rating strip ──────────────────────────────────────────────────────
// Update rating and reviewCount once you have your Google Place data.

export const googleRating = {
  rating: 5.0,
  reviewCount: 47,
};

// ─── Case studies ─────────────────────────────────────────────────────────────

export const caseStudies = [
  {
    industry: "Solar",
    title: "3.8× ROAS in 90 days",
    text: "Rebuilt the funnel and paid social system for a residential solar installer, cutting cost per booked consultation significantly.",
    metrics: [
      { value: "3.8×", label: "Return on ad spend" },
      { value: "−54%", label: "Cost per appointment" },
    ],
  },
  {
    industry: "Home services",
    title: "212 qualified leads / month",
    text: "Launched a lead-gen and appointment-setting engine for an HVAC company, filling the calendar during a traditionally slow season.",
    metrics: [
      { value: "212", label: "Monthly qualified leads" },
      { value: "4.1×", label: "Pipeline growth" },
    ],
  },
  {
    industry: "Professional services",
    title: "+180% booked calls",
    text: "New conversion-focused website plus search campaigns nearly tripled inbound consultations for a consulting firm.",
    metrics: [
      { value: "+180%", label: "Booked calls" },
      { value: "2.3 s", label: "Page load time" },
    ],
  },
];

// ─── Why Netlink ──────────────────────────────────────────────────────────────

export const why = {
  eyebrow: "Why Netlink",
  title: "A partner obsessed with your pipeline, not vanity metrics.",
  reasons: [
    {
      title: "Revenue-first thinking",
      text: "Every decision maps back to booked calls and closed deals — not likes, impressions, or empty dashboards.",
    },
    {
      title: "One connected system",
      text: "Website, campaigns, and follow-up work as a single machine instead of disconnected point solutions.",
    },
    {
      title: "Radical transparency",
      text: "Clean tracking and clear reporting mean you always know exactly what's working and where your money goes.",
    },
    {
      title: "Senior team, no fluff",
      text: "You work directly with strategists and builders who ship — not account managers reading from a script.",
    },
    {
      title: "Speed to results",
      text: "Lean sprints get campaigns live in weeks, so you see qualified leads while competitors are still planning.",
    },
    {
      title: "Built to scale",
      text: "Systems and automation designed to handle more volume without breaking — or ballooning your team.",
    },
  ],
};

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export const faqs = [
  {
    q: "What kind of businesses do you work with?",
    a: "We specialize in service businesses — home services, solar, healthcare, professional and local service providers — that rely on a steady flow of qualified leads and booked appointments to grow.",
  },
  {
    q: "How is Netlink different from a typical agency?",
    a: "Most agencies sell a single service in isolation. We build one connected growth system — website, paid campaigns, and follow-up automation — all measured against revenue, not vanity metrics.",
  },
  {
    q: "How quickly will I see results?",
    a: "Foundations like tracking and landing pages go live within the first few weeks. Paid campaigns typically show early qualified leads within 2–4 weeks, then compound as we optimize.",
  },
  {
    q: "Do you require long contracts?",
    a: "No. We earn the relationship month to month. We recommend a minimum runway so campaigns have time to optimize, but we don't lock you into long, rigid contracts.",
  },
  {
    q: "How much does it cost?",
    a: "Every engagement is scoped to your goals, market, and starting point. The free growth consultation is where we map the plan and give you clear, honest numbers — no obligation.",
  },
  {
    q: "What does onboarding look like?",
    a: "We start with a discovery audit of your funnel, market, and existing assets. Within the first two weeks we have a clear growth plan, tracking set up, and initial assets ready to build.",
  },
];

// ─── Contact ─────────────────────────────────────────────────────────────────

export const contact = {
  eyebrow: "Let's talk",
  title: "Get a free growth consultation",
  text: "Tell us about your business and goals. We'll audit where growth is leaking and show you exactly how Netlink's system can fill your pipeline — no pressure, no obligation.",
  bullets: [
    "A tailored growth plan for your business",
    "Where your funnel is leaking leads today",
    "Realistic projections and clear next steps",
  ],
};
