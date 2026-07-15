/**
 * Central content source for the Netlink site.
 * Edit this file to update copy, services, FAQs, industries, etc.
 * Do not put secrets or API keys here — this file ships to the client.
 *
 * Positioning: Netlink is a done-for-you lead generation and appointment
 * setting system for service businesses — not a general marketing agency.
 */

// ─── Site meta ───────────────────────────────────────────────────────────────

export const site = {
  name: "Netlink",
  domain: "netlink.agency",
  tagline: "Done-for-you lead generation and appointment setting for service businesses",
  email: "info@netlink.agency",
  phone: "+1 (202) 474-4630",
  phoneHref: "tel:+12024744630",
  social: {
    instagram: "https://instagram.com/netlinkagency",
    linkedin: "https://www.linkedin.com/company/netlink-agency",
  },
};

// ─── Nav ─────────────────────────────────────────────────────────────────────
// Real page routes (multi-page site). The logo link covers "Home", so it's
// not repeated here.

export const nav = [
  { label: "Lead Generation", href: "/lead-generation" },
  { label: "Appointment Setting", href: "/appointment-setting" },
  { label: "Process", href: "/process" },
  { label: "Industries", href: "/industries" },
  { label: "Results", href: "/results" },
  { label: "About", href: "/about" },
];

// ─── Footer link columns ──────────────────────────────────────────────────────

export const footerExploreLinks = [
  { label: "Home", href: "/" },
  { label: "Process", href: "/process" },
  { label: "Industries", href: "/industries" },
  { label: "Results", href: "/results" },
  { label: "About", href: "/about" },
];

export const footerServiceLinks = [
  { label: "Lead Generation", href: "/lead-generation" },
  { label: "Appointment Setting", href: "/appointment-setting" },
  { label: "Book Consultation", href: "/book-consultation" },
];

// ─── Hero ────────────────────────────────────────────────────────────────────

export const hero = {
  eyebrow: "Fully Managed Lead Generation & Appointment Setting",
  rotatingWords: ["Appointments", "Sales Calls", "Consultations", "Discovery Calls"],
  headlineStart: "Turn Qualified Prospects Into Booked",
  subheadline:
    "Netlink helps service businesses generate qualified leads, follow up with prospects, and book sales appointments using high-converting funnels, paid ads, automation, and managed appointment setting.",
  primaryCta: "Book a Free Growth Consultation",
  secondaryCta: "See How It Works",
};

// ─── Hero stats strip ────────────────────────────────────────────────────────

export const stats = [
  { value: 850, suffix: "+", label: "Qualified leads generated" },
  { value: 42, suffix: "%", label: "Booked appointment rate" },
  { value: 61, suffix: "%", label: "Lower cost per qualified lead" },
  { value: 24, suffix: "/7", label: "Pipeline visibility" },
];

// ─── Problem ─────────────────────────────────────────────────────────────────

export const problem = {
  eyebrow: "The problem",
  title: "Still depending on referrals, random leads, or campaigns that don't turn into calls?",
  body: "Most service businesses aren't short on marketing spend — they're short on a system that turns that spend into booked, qualified appointments.",
  points: [
    {
      title: "Inconsistent lead flow",
      text: "Your pipeline depends on referrals or unpredictable ad performance.",
    },
    {
      title: "Low-quality leads",
      text: "You get form fills, but few prospects are ready to speak.",
    },
    {
      title: "Slow follow-up",
      text: "Good leads go cold because no one follows up fast enough.",
    },
    {
      title: "No clear system",
      text: "Ads, landing pages, CRM, and sales follow-up are disconnected.",
    },
  ],
};

// ─── Solution (5-card bento grid) ────────────────────────────────────────────
// span: 2 = wide card (2 columns on lg), span: 1 = standard card.
// Layout (3-col desktop): 2+1 | 1+1+1

export const services = [
  {
    id: "lead-gen",
    title: "Lead Generation",
    text: "We launch campaigns designed to attract qualified prospects.",
    features: ["Paid social & search", "Audience targeting", "Qualified intent"],
    span: 2,
  },
  {
    id: "appt-setting",
    title: "Appointment Setting",
    text: "We help move qualified prospects into booked calls.",
    features: ["Calendar integration", "Qualification scripts", "Show-up follow-up"],
    span: 1,
  },
  {
    id: "conversion",
    title: "Conversion Funnels",
    text: "We build landing pages that turn visitors into inquiries.",
    features: ["High-converting pages", "Clear offers", "Fast load times"],
    span: 1,
  },
  {
    id: "lead-nurturing",
    title: "Lead Nurturing",
    text: "We follow up with prospects through structured workflows.",
    features: ["Automated sequences", "Multi-channel follow-up", "Lead scoring"],
    span: 1,
  },
  {
    id: "reporting-dashboard",
    title: "Reporting Dashboard",
    text: "You see leads, booked appointments, and pipeline performance clearly.",
    features: ["Lead tracking", "Booking rate", "Weekly summaries"],
    span: 1,
  },
] as const;

export type Service = (typeof services)[number];

// ─── Process ──────────────────────────────────────────────────────────────────

export const process = {
  eyebrow: "How it works",
  title: "A Repeatable System That Turns Prospects Into Booked Appointments.",
  steps: [
    {
      num: "01",
      title: "Diagnose",
      text: "We audit your market, offer, funnel, and current lead flow to find where appointments are being lost.",
    },
    {
      num: "02",
      title: "Build",
      text: "We create the landing page, tracking, CRM flow, lead forms, and appointment booking system.",
    },
    {
      num: "03",
      title: "Generate",
      text: "We launch targeted campaigns to attract qualified prospects.",
    },
    {
      num: "04",
      title: "Qualify",
      text: "We filter, nurture, and follow up with leads so your team speaks to better prospects.",
    },
    {
      num: "05",
      title: "Book",
      text: "Qualified prospects are moved into booked appointments or sales consultations.",
    },
    {
      num: "06",
      title: "Optimize",
      text: "We track cost per lead, booking rate, show-up rate, and close performance to improve the system.",
    },
  ],
};

// ─── Industries ───────────────────────────────────────────────────────────────
// ids matching solar/home-services/real-estate/healthcare/finance reuse the
// existing bespoke icons in Industries.tsx; legal/b2b/local-service fall
// back to that component's generic icon.

export const industries = [
  { id: "solar", name: "Solar Companies" },
  { id: "home-services", name: "Roofing & Home Improvement" },
  { id: "real-estate", name: "Real Estate & Investment Services" },
  { id: "healthcare", name: "Medical & Clinics" },
  { id: "legal", name: "Legal Services" },
  { id: "finance", name: "Financial Services" },
  { id: "b2b", name: "B2B Service Providers" },
  { id: "local-service", name: "Local Service Businesses" },
];

// ─── Google rating strip ──────────────────────────────────────────────────────
// Update rating and reviewCount once you have your Google Place data.

export const googleRating = {
  rating: 5.0,
  reviewCount: 47,
};

// ─── Results / case studies ───────────────────────────────────────────────────

export const caseStudies = [
  {
    industry: "Solar",
    title: "312 Booked Appointments in 90 Days",
    text: "Rebuilt the lead flow and appointment workflow for a residential solar installer, filling their calendar with qualified consultations.",
    metrics: [
      { value: "312", label: "Booked appointments" },
      { value: "38%", label: "Show-up rate lift" },
    ],
  },
  {
    industry: "Home services",
    title: "58% Lower Cost Per Qualified Lead",
    text: "Launched a lead generation and nurture system for a roofing company, cutting wasted ad spend on unqualified inquiries.",
    metrics: [
      { value: "−58%", label: "Cost per qualified lead" },
      { value: "4.2×", label: "Pipeline growth" },
    ],
  },
  {
    industry: "Professional services",
    title: "+210% Qualified Sales Calls",
    text: "New conversion funnel plus managed appointment setting nearly tripled booked consultations for a B2B service provider.",
    metrics: [
      { value: "+210%", label: "Qualified sales calls" },
      { value: "91%", label: "Lead response rate" },
    ],
  },
];

// ─── Managed growth team ──────────────────────────────────────────────────────

export const why = {
  eyebrow: "How we work",
  title: "A Fully Managed Growth Team — Not Just Another Ad Account",
  reasons: [
    {
      title: "Campaign Manager",
      text: "Handles paid acquisition and performance optimization.",
    },
    {
      title: "Funnel Specialist",
      text: "Improves landing pages, forms, and conversion flow.",
    },
    {
      title: "Appointment Workflow",
      text: "Ensures leads are routed, followed up, and booked.",
    },
    {
      title: "Reporting Dashboard",
      text: "Shows lead volume, quality, booked calls, and performance.",
    },
  ],
};

// ─── Dashboard / reporting ─────────────────────────────────────────────────────

export const dashboard = {
  eyebrow: "Reporting",
  title: "Know Exactly Where Every Lead Stands",
  text: "Track leads, follow-ups, booked appointments, and campaign performance from one dashboard — so you know what's working and where the pipeline needs attention.",
  bullets: [
    "Lead source tracking",
    "Booked appointment tracking",
    "Follow-up status",
    "Campaign performance",
    "Weekly performance summary",
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

// ─── Final CTA / contact ──────────────────────────────────────────────────────

export const contact = {
  eyebrow: "Let's talk",
  title: "See If Netlink Is The Right Growth Partner For Your Business",
  text: "We work best with service businesses that already have a real offer, a sales process, and capacity to handle more qualified appointments.",
  bullets: [
    "A tailored plan to generate and book more qualified appointments",
    "Where your current lead flow is leaking opportunities",
    "Clear next steps if we're the right fit",
  ],
};

// ─── Shared CTA (used by CTASection at the bottom of every subpage) ──────────

export const pageCta = {
  eyebrow: "Let's talk",
  title: "See If Netlink Is The Right Growth Partner For Your Business",
  text: "Book a free growth consultation and we'll map out what a lead generation and appointment setting system would look like for your business.",
  buttonText: "Book a Free Growth Consultation",
  href: "/book-consultation",
};

// ─── Lead Generation page (/lead-generation) — static content ────────────────

export const leadGenPage = {
  hero: {
    eyebrow: "Lead generation",
    title: "Qualified Lead Generation For Service Businesses",
    subtitle:
      "We build the funnels, campaigns, and tracking that turn cold traffic into leads worth your sales team's time — not just form fills.",
  },
  whatWeDo: {
    eyebrow: "What Netlink does",
    title: "One System — Not A Pile Of Disconnected Tactics",
    subtitle:
      "We plan, build, and run the entire lead generation engine so qualified prospects show up in your pipeline every week.",
    items: [
      { title: "Offer & funnel strategy", text: "We map the offer, audience, and funnel before a single dollar is spent on ads." },
      { title: "Landing pages built to convert", text: "Fast, focused pages designed around one action — not a generic website." },
      { title: "Paid campaigns", text: "Search and social campaigns built around buyer intent, not vanity reach." },
    ],
  },
  funnelAdsTracking: {
    eyebrow: "Funnel, ads & tracking",
    title: "Every Click Is Tracked From Ad To Booked Call",
    subtitle: "Nothing runs blind — every stage of the funnel is instrumented so we know exactly what's working.",
    items: [
      { title: "Conversion tracking", text: "Pixel and server-side tracking tied to real bookings, not just clicks." },
      { title: "Multi-channel campaigns", text: "Paid search and paid social run in parallel, weighted toward what converts." },
      { title: "Landing page testing", text: "Ongoing tests on headlines, offers, and forms to lift conversion rate." },
    ],
  },
  leadQuality: {
    eyebrow: "Lead quality system",
    title: "Built To Filter Out Tire-Kickers",
    subtitle: "Qualifying questions, budget filters, and lead scoring keep low-intent leads out of your team's queue.",
    items: [
      { title: "Qualifying questions", text: "Forms and call scripts filter for budget, timeline, and intent up front." },
      { title: "Lead scoring", text: "Leads are scored on fit and intent before they ever reach your sales team." },
      { title: "Spam & duplicate filtering", text: "Automated filtering keeps bad data out of your CRM." },
    ],
  },
  reporting: {
    eyebrow: "Reporting & optimization",
    title: "Weekly Visibility Into Cost, Quality, And Volume",
    subtitle: "You always know what a lead costs, where it came from, and whether it's actually qualified.",
    items: [
      { title: "Cost per qualified lead", text: "Tracked weekly by channel and campaign, not just by overall spend." },
      { title: "Creative & audience testing", text: "Underperforming ads and audiences are cut, winners get more budget." },
      { title: "Weekly optimization review", text: "A standing review of performance so the system keeps improving." },
    ],
  },
};

// ─── Appointment Setting page (/appointment-setting) — static content ────────

export const apptSettingPage = {
  hero: {
    eyebrow: "Appointment setting",
    title: "Turn Leads Into Booked Calls",
    subtitle:
      "A qualified lead is only worth something once it's on your calendar. We build the follow-up and booking system that gets it there.",
  },
  whyLeadsGoCold: {
    eyebrow: "Why leads go cold",
    title: "Most Leads Are Lost In The First 24 Hours",
    subtitle: "Slow, inconsistent, or single-channel follow-up is the single biggest reason booked-call rates stay low.",
    items: [
      { title: "Slow first response", text: "Leads that wait hours for a reply are far less likely to book." },
      { title: "One-and-done follow-up", text: "A single call or email isn't enough — most bookings happen on a later touch." },
      { title: "No structured cadence", text: "Without a defined sequence, follow-up depends on who remembers to do it." },
    ],
  },
  followUpWorkflow: {
    eyebrow: "Follow-up workflow",
    title: "A Structured Sequence, Not Guesswork",
    subtitle: "Every lead enters the same proven cadence the moment they convert.",
    items: [
      { title: "Instant response", text: "Automated first touch within minutes of a lead coming in." },
      { title: "Multi-channel cadence", text: "Call, text, and email sequenced over the following days." },
      { title: "Persistence rules", text: "Leads are worked on a defined schedule until booked or disqualified." },
    ],
  },
  leadQualification: {
    eyebrow: "Lead qualification",
    title: "Only Qualified Prospects Reach Your Calendar",
    subtitle: "Before a call is booked, we confirm fit — so the calls that land are worth taking.",
    items: [
      { title: "Qualification script", text: "A consistent set of questions confirms budget, timeline, and need." },
      { title: "Disqualification path", text: "Poor-fit leads are filtered out instead of clogging your calendar." },
      { title: "Warm handoff notes", text: "Your team gets context on every booked call, not just a name and number." },
    ],
  },
  bookingSystem: {
    eyebrow: "Booking system",
    title: "Calendar-Synced Booking That Reduces No-Shows",
    subtitle: "From first touch to confirmed call, booking is handled without back-and-forth scheduling emails.",
    items: [
      { title: "Calendar integration", text: "Prospects book directly into your team's live availability." },
      { title: "Confirmation sequence", text: "Automated reminders by text and email reduce no-shows." },
      { title: "Reschedule handling", text: "Missed calls are automatically re-engaged instead of falling through." },
    ],
  },
  crmPipeline: {
    eyebrow: "CRM & pipeline visibility",
    title: "Know Exactly Where Every Lead Stands",
    text: "Every lead is tracked from first contact through booked call, show, and outcome — so nothing sits unattended in your pipeline.",
    bullets: [
      "Lead status tracked in real time",
      "Booked, showed, and closed rates by source",
      "Follow-up activity logged per lead",
      "Weekly pipeline summary",
    ],
  },
};

// ─── Industries page (/industries) — static content ──────────────────────────
// Keyed by the same `id`s used in the `industries` array above.

export const industryDetails: Record<string, { problem: string; solution: string }> = {
  solar: {
    problem: "Solar leads are expensive, and unqualified leads waste sales reps' time on homeowners who can't finance the system.",
    solution: "We qualify leads on homeownership, roof condition, and financing intent before they reach your closers.",
  },
  "home-services": {
    problem: "Roofing and home improvement leads spike seasonally and are often shopping three other quotes.",
    solution: "We build always-on campaigns and fast follow-up so you're first to call, not the last quote received.",
  },
  "real-estate": {
    problem: "Real estate and investment leads go cold fast if they aren't contacted within minutes.",
    solution: "Automated instant response plus a structured nurture sequence keeps prospects engaged until they're ready to talk.",
  },
  healthcare: {
    problem: "Medical and clinic inquiries need a compliant, trustworthy funnel — not a generic lead form.",
    solution: "We build patient-friendly booking flows and qualification that respect the sensitivity of the inquiry.",
  },
  legal: {
    problem: "Legal leads vary wildly in case quality, and intake teams waste hours on cases outside their practice.",
    solution: "Qualifying questions filter by case type and urgency before a lead reaches your intake team.",
  },
  finance: {
    problem: "Financial services leads require trust-building before prospects will share sensitive information.",
    solution: "We use educational funnels and qualification steps that build credibility before the ask.",
  },
  b2b: {
    problem: "B2B service leads often stall in long sales cycles with no consistent follow-up system.",
    solution: "A structured, multi-touch nurture sequence keeps your pipeline warm across longer buying cycles.",
  },
  "local-service": {
    problem: "Local service businesses compete on speed — the first business to respond usually wins the job.",
    solution: "Instant lead response and booking means you're talking to the prospect while competitors are still typing an email.",
  },
};

export const industriesPage = {
  hero: {
    eyebrow: "Industries we serve",
    title: "Built For Service Businesses That Run On Booked Appointments",
    subtitle:
      "We specialize in industries where a steady flow of qualified leads and booked calls directly drives revenue.",
  },
};

// ─── Results page (/results) — static content ────────────────────────────────

export const resultsPage = {
  hero: {
    eyebrow: "Results & reporting",
    title: "Lead Generation Results & Reporting",
    subtitle: "A look at how we measure performance — from cost per lead to booked appointments to closed pipeline.",
  },
  metrics: [
    { value: "850+", label: "Qualified leads generated" },
    { value: "42%", label: "Booked appointment rate" },
    { value: "−61%", label: "Lower cost per qualified lead" },
    { value: "91%", label: "Lead response rate within 1 hour" },
  ],
  leadGenKpis: {
    eyebrow: "Lead generation KPIs",
    title: "What We Track On The Lead Gen Side",
    items: [
      { title: "Cost per qualified lead", text: "Tracked weekly by channel and campaign." },
      { title: "Landing page conversion rate", text: "How many visitors take the primary action." },
      { title: "MQL → SQL rate", text: "How many marketing-qualified leads become sales-qualified." },
    ],
  },
  apptKpis: {
    eyebrow: "Appointment setting KPIs",
    title: "What We Track On The Booking Side",
    items: [
      { title: "Booked call rate", text: "Share of qualified leads that convert into a booked call." },
      { title: "Show-up rate", text: "Share of booked calls that actually happen." },
      { title: "Close rate", text: "Share of completed calls that convert into a customer." },
    ],
  },
};

// ─── About page (/about) — static content ─────────────────────────────────────

export const aboutPage = {
  hero: {
    eyebrow: "About Netlink",
    title: "A Managed Lead Generation Partner — Not Just An Ad Account",
    subtitle:
      "Netlink exists to give service businesses a predictable system for booked appointments, not another disconnected marketing tactic.",
  },
  whatWeDo: {
    eyebrow: "What Netlink does",
    title: "We Build And Run The Full Growth System",
    text: "Netlink plans, builds, and manages the lead generation and appointment setting system for service businesses — funnels, paid campaigns, tracking, follow-up, and booking — as one connected system instead of separate vendors.",
  },
  whyWeExist: {
    eyebrow: "Why Netlink exists",
    title: "Most Agencies Sell Tactics. We Sell Booked Appointments.",
    text: "Too many service businesses end up juggling a web designer, an ads freelancer, and a CRM they never set up properly — with no one accountable for whether any of it turns into revenue. Netlink was built to be the single team accountable for the full path from click to booked call.",
  },
  whoWeWorkWith: {
    eyebrow: "Who we work best with",
    title: "We Work Best With Businesses Ready To Handle More Calls",
    text: "We're selective about new partnerships so we can commit real time and resources to every client we take on.",
    bullets: [
      "You already have a real offer and a sales process",
      "You have the capacity to handle more qualified appointments",
      "You want one accountable growth partner, not five vendors",
      "You're focused on booked calls and revenue, not vanity metrics",
    ],
  },
};

// ─── Book Consultation page (/book-consultation) — static content ────────────

export const bookConsultationPage = {
  hero: {
    eyebrow: "Free growth consultation",
    title: "Book A Free Growth Consultation",
    subtitle:
      "See whether Netlink is the right lead generation and appointment setting partner for your business — no obligation.",
  },
  qualification: {
    title: "What To Expect",
    text: "This isn't a generic sales call. We'll look at your current lead flow, offer, and sales process, then tell you honestly whether we're a fit — and what a growth system would look like for your business.",
    bullets: [
      "A review of where your current lead flow is leaking opportunities",
      "A tailored plan to generate and book more qualified appointments",
      "Clear next steps if we're the right fit — no pressure if we're not",
    ],
  },
};
