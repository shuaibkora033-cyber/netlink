-- ============================================================================
-- Netlink — admin dashboard schema
-- ============================================================================
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / ON CONFLICT).
--
-- Access model:
--   - RLS is enabled on every table.
--   - The `anon` key (used by the public website) may only SELECT, and only
--     rows that are visible/public. It has no INSERT/UPDATE/DELETE policies,
--     so writes from that key are always rejected by Postgres.
--   - The `service_role` key (used only by /api/admin/* server routes) has
--     `bypassrls` and is never sent to the browser, so it can read/write
--     everything regardless of the policies below.
-- ============================================================================

create extension if not exists pgcrypto;

-- ── admin_users ─────────────────────────────────────────────────────────────
-- Not used by v1 login (which checks ADMIN_EMAIL/ADMIN_PASSWORD env vars).
-- Included now so a future move to per-user admin accounts / Supabase Auth
-- is a data migration, not a schema rewrite.
create table if not exists admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);
alter table admin_users enable row level security;
-- No policies: no role other than service_role (which bypasses RLS) can read/write this table.

-- ── theme_settings ──────────────────────────────────────────────────────────
-- Singleton table — always exactly one row, id = 1.
create table if not exists theme_settings (
  id                 smallint primary key default 1,
  primary_color      text not null default '#0dfdd1',
  secondary_color    text not null default '#22d3ee',
  background_color   text not null default '#050507',
  button_text        text not null default 'Book a Free Growth Consultation',
  navbar_cta_text    text not null default 'Free Consultation',
  section_visibility jsonb not null default '{
    "clients": true,
    "googleRating": true,
    "problem": true,
    "services": true,
    "growthSystem": true,
    "industries": true,
    "caseStudies": true,
    "googleReviews": true,
    "whyChoose": true,
    "dashboardReporting": true,
    "faq": true,
    "contact": true
  }'::jsonb,
  contact_email      text not null default 'info@netlink.agency',
  phone_number       text not null default '+1 (202) 474-4630',
  whatsapp_link      text not null default '',
  social_links       jsonb not null default '{
    "instagram": "https://instagram.com/netlinkagency",
    "linkedin": "https://www.linkedin.com/company/netlink-agency"
  }'::jsonb,
  updated_at         timestamptz not null default now(),
  constraint theme_settings_singleton check (id = 1)
);
alter table theme_settings enable row level security;
drop policy if exists "public can read theme_settings" on theme_settings;
create policy "public can read theme_settings" on theme_settings
  for select to anon using (true);

insert into theme_settings (id) values (1)
  on conflict (id) do nothing;

-- ── homepage_content ────────────────────────────────────────────────────────
-- Singleton table — always exactly one row, id = 1.
create table if not exists homepage_content (
  id                   smallint primary key default 1,
  hero_badge           text not null default 'Fully Managed Lead Generation & Appointment Setting',
  hero_headline        text not null default 'Turn Qualified Prospects Into Booked',
  hero_rotating_words  text[] not null default array['Appointments','Sales Calls','Consultations','Discovery Calls'],
  hero_subheadline     text not null default 'Netlink helps service businesses generate qualified leads, follow up with prospects, and book sales appointments using high-converting funnels, paid ads, automation, and managed appointment setting.',
  primary_cta_text     text not null default 'Book a Free Growth Consultation',
  primary_cta_link     text not null default '#contact',
  secondary_cta_text   text not null default 'See How It Works',
  secondary_cta_link   text not null default '#process',
  stats                jsonb not null default '[
    {"value": 850, "suffix": "+", "label": "Qualified leads generated"},
    {"value": 42, "suffix": "%", "label": "Booked appointment rate"},
    {"value": 61, "suffix": "%", "label": "Lower cost per qualified lead"},
    {"value": 24, "suffix": "/7", "label": "Pipeline visibility"}
  ]'::jsonb,
  growth_steps         jsonb not null default '[
    {"num": "01", "title": "Diagnose", "text": "We audit your market, offer, funnel, and current lead flow to find where appointments are being lost."},
    {"num": "02", "title": "Build", "text": "We create the landing page, tracking, CRM flow, lead forms, and appointment booking system."},
    {"num": "03", "title": "Generate", "text": "We launch targeted campaigns to attract qualified prospects."},
    {"num": "04", "title": "Qualify", "text": "We filter, nurture, and follow up with leads so your team speaks to better prospects."},
    {"num": "05", "title": "Book", "text": "Qualified prospects are moved into booked appointments or sales consultations."},
    {"num": "06", "title": "Optimize", "text": "We track cost per lead, booking rate, show-up rate, and close performance to improve the system."}
  ]'::jsonb,
  industries           jsonb not null default '[
    {"id": "solar", "name": "Solar Companies"},
    {"id": "home-services", "name": "Roofing & Home Improvement"},
    {"id": "real-estate", "name": "Real Estate & Investment Services"},
    {"id": "healthcare", "name": "Medical & Clinics"},
    {"id": "legal", "name": "Legal Services"},
    {"id": "finance", "name": "Financial Services"},
    {"id": "b2b", "name": "B2B Service Providers"},
    {"id": "local-service", "name": "Local Service Businesses"}
  ]'::jsonb,
  final_cta            jsonb not null default '{
    "eyebrow": "Let''s talk",
    "title": "See If Netlink Is The Right Growth Partner For Your Business",
    "text": "We work best with service businesses that already have a real offer, a sales process, and capacity to handle more qualified appointments.",
    "bullets": [
      "A tailored plan to generate and book more qualified appointments",
      "Where your current lead flow is leaking opportunities",
      "Clear next steps if we''re the right fit"
    ]
  }'::jsonb,
  updated_at           timestamptz not null default now(),
  constraint homepage_content_singleton check (id = 1)
);
alter table homepage_content enable row level security;
drop policy if exists "public can read homepage_content" on homepage_content;
create policy "public can read homepage_content" on homepage_content
  for select to anon using (true);

insert into homepage_content (id) values (1)
  on conflict (id) do nothing;

-- ── services ─────────────────────────────────────────────────────────────────
create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  icon_key    text,
  order_index int not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table services enable row level security;
drop policy if exists "public can read visible services" on services;
create policy "public can read visible services" on services
  for select to anon using (is_visible = true);

-- ── clients ──────────────────────────────────────────────────────────────────
create table if not exists clients (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  logo_url          text,
  website_url       text,
  industry          text,
  is_visible        boolean not null default true,
  needs_light_hover boolean not null default false,
  order_index       int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table clients enable row level security;
drop policy if exists "public can read visible clients" on clients;
create policy "public can read visible clients" on clients
  for select to anon using (is_visible = true);

-- ── faqs ─────────────────────────────────────────────────────────────────────
create table if not exists faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  order_index int not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table faqs enable row level security;
drop policy if exists "public can read visible faqs" on faqs;
create policy "public can read visible faqs" on faqs
  for select to anon using (is_visible = true);

-- ── case_studies ─────────────────────────────────────────────────────────────
create table if not exists case_studies (
  id          uuid primary key default gen_random_uuid(),
  industry    text not null,
  title       text not null,
  body        text not null,
  metrics     jsonb not null default '[]'::jsonb, -- [{ "value": "3.8×", "label": "Return on ad spend" }, ...]
  order_index int not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table case_studies enable row level security;
drop policy if exists "public can read visible case_studies" on case_studies;
create policy "public can read visible case_studies" on case_studies
  for select to anon using (is_visible = true);

-- ── content_sections ─────────────────────────────────────────────────────────
-- Generic per-page, per-section content store for the multi-page site (every
-- route except the homepage, which keeps its own dedicated homepage_content
-- table/editor). One row per (page_slug, section_key): a save only ever
-- touches that single row, so editing one section can never overwrite
-- another, and the unique constraint makes every save a safe upsert instead
-- of risking duplicate rows.
--
-- page_slug:    'lead-generation' | 'appointment-setting' | 'process' |
--               'industries' | 'results' | 'about' | 'book-consultation'
-- section_key:  mirrors the static content object keys in lib/content.ts
--               (e.g. leadGenPage.hero → page_slug='lead-generation',
--               section_key='hero'), so the public-site fallback merge is
--               a trivial per-key lookup.
--
-- No rows are required for the site to work: when a (page_slug, section_key)
-- row doesn't exist yet, both the public pages and the admin editors fall
-- back to the static defaults already in lib/content.ts. The first admin
-- save for a section creates its row.
create table if not exists content_sections (
  id          uuid primary key default gen_random_uuid(),
  page_slug   text not null,
  section_key text not null,
  content     jsonb not null default '{}'::jsonb,
  is_visible  boolean not null default true,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (page_slug, section_key)
);
alter table content_sections enable row level security;
drop policy if exists "public can read visible content_sections" on content_sections;
create policy "public can read visible content_sections" on content_sections
  for select to anon using (is_visible = true);

-- ── industry_cards ───────────────────────────────────────────────────────────
-- Single source of truth for industries — feeds both the homepage's compact
-- industries grid and the full /industries page's detail cards, so there is
-- exactly one place to edit an industry instead of two.
create table if not exists industry_cards (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  problem     text not null default '',
  solution    text not null default '',
  cta_text    text not null default 'Book a Free Growth Consultation',
  cta_href    text not null default '/book-consultation',
  is_visible  boolean not null default true,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table industry_cards enable row level security;
drop policy if exists "public can read visible industry_cards" on industry_cards;
create policy "public can read visible industry_cards" on industry_cards
  for select to anon using (is_visible = true);

insert into industry_cards (slug, name, problem, solution, order_index) values
  ('solar', 'Solar Companies', 'Solar leads are expensive, and unqualified leads waste sales reps'' time on homeowners who can''t finance the system.', 'We qualify leads on homeownership, roof condition, and financing intent before they reach your closers.', 0),
  ('home-services', 'Roofing & Home Improvement', 'Roofing and home improvement leads spike seasonally and are often shopping three other quotes.', 'We build always-on campaigns and fast follow-up so you''re first to call, not the last quote received.', 1),
  ('real-estate', 'Real Estate & Investment Services', 'Real estate and investment leads go cold fast if they aren''t contacted within minutes.', 'Automated instant response plus a structured nurture sequence keeps prospects engaged until they''re ready to talk.', 2),
  ('healthcare', 'Medical & Clinics', 'Medical and clinic inquiries need a compliant, trustworthy funnel — not a generic lead form.', 'We build patient-friendly booking flows and qualification that respect the sensitivity of the inquiry.', 3),
  ('legal', 'Legal Services', 'Legal leads vary wildly in case quality, and intake teams waste hours on cases outside their practice.', 'Qualifying questions filter by case type and urgency before a lead reaches your intake team.', 4),
  ('finance', 'Financial Services', 'Financial services leads require trust-building before prospects will share sensitive information.', 'We use educational funnels and qualification steps that build credibility before the ask.', 5),
  ('b2b', 'B2B Service Providers', 'B2B service leads often stall in long sales cycles with no consistent follow-up system.', 'A structured, multi-touch nurture sequence keeps your pipeline warm across longer buying cycles.', 6),
  ('local-service', 'Local Service Businesses', 'Local service businesses compete on speed — the first business to respond usually wins the job.', 'Instant lead response and booking means you''re talking to the prospect while competitors are still typing an email.', 7)
on conflict (slug) do nothing;

-- ── Additive columns for the admin CMS (safe: nullable, no data loss) ────────
alter table services add column if not exists link_href text;
alter table faqs add column if not exists related_page text;
alter table case_studies add column if not exists challenge text;
alter table case_studies add column if not exists solution text;
alter table case_studies add column if not exists result text;
alter table clients add column if not exists scale numeric;

-- ── media_files ──────────────────────────────────────────────────────────────
-- Metadata for files uploaded to Supabase Storage (e.g. client logos).
-- Not read by the public site directly; admin-only.
create table if not exists media_files (
  id          uuid primary key default gen_random_uuid(),
  file_name   text not null,
  url         text not null,
  size        bigint,
  mime_type   text,
  uploaded_by text,
  created_at  timestamptz not null default now()
);
alter table media_files enable row level security;
-- No anon policies: admin-only via service_role.

-- ── site_settings ────────────────────────────────────────────────────────────
-- Generic key/value escape hatch for settings that don't warrant their own column.
create table if not exists site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table site_settings enable row level security;
drop policy if exists "public can read site_settings" on site_settings;
create policy "public can read site_settings" on site_settings
  for select to anon using (true);

-- ============================================================================
-- Seed data — mirrors the content currently hardcoded in lib/content.ts and
-- lib/clients.ts, so switching the site over to the database changes nothing
-- visually until an admin edits something in the dashboard.
-- ============================================================================

insert into services (title, description, icon_key, order_index, is_visible) values
  ('Lead Generation', 'We launch campaigns designed to attract qualified prospects.', 'lead-gen', 0, true),
  ('Appointment Setting', 'We help move qualified prospects into booked calls.', 'appt-setting', 1, true),
  ('Conversion Funnels', 'We build landing pages that turn visitors into inquiries.', 'conversion', 2, true),
  ('Lead Nurturing', 'We follow up with prospects through structured workflows.', 'lead-nurturing', 3, true),
  ('Reporting Dashboard', 'You see leads, booked appointments, and pipeline performance clearly.', 'reporting-dashboard', 4, true)
on conflict do nothing;

insert into clients (name, logo_url, website_url, industry, is_visible, needs_light_hover, order_index) values
  ('Texas Solar', '/clients/texas-solar.webp', null, 'Solar', true, true, 0),
  ('Ground Up', '/clients/ground-up.webp', null, null, true, true, 1),
  ('Quicken Solar', '/clients/quicken-solar.webp', null, 'Solar', true, true, 2),
  ('Gulf Electrical Solar', '/clients/gulf-electrical-solar.webp', null, 'Solar', true, false, 3),
  ('Bliss Brothers', '/clients/bliss-brothers.webp', null, null, true, true, 4),
  ('Green Wat Consulting', '/clients/green-wat-consulting.webp', null, 'Professional services', true, false, 5),
  ('The Black Closet', '/clients/the-black-closet.webp', null, null, true, false, 6),
  ('ByNusyba', '/clients/bynusyba.webp', null, null, true, false, 7),
  ('Sisters', '/clients/sisters.webp', null, null, true, true, 8),
  ('Yardaz', '/clients/yardaz.webp', null, null, true, true, 9)
on conflict do nothing;

insert into faqs (question, answer, order_index, is_visible) values
  ('What kind of businesses do you work with?', 'We specialize in service businesses — home services, solar, healthcare, professional and local service providers — that rely on a steady flow of qualified leads and booked appointments to grow.', 0, true),
  ('How is Netlink different from a typical agency?', 'Most agencies sell a single service in isolation. We build one connected growth system — website, paid campaigns, and follow-up automation — all measured against revenue, not vanity metrics.', 1, true),
  ('How quickly will I see results?', 'Foundations like tracking and landing pages go live within the first few weeks. Paid campaigns typically show early qualified leads within 2–4 weeks, then compound as we optimize.', 2, true),
  ('Do you require long contracts?', 'No. We earn the relationship month to month. We recommend a minimum runway so campaigns have time to optimize, but we don''t lock you into long, rigid contracts.', 3, true),
  ('How much does it cost?', 'Every engagement is scoped to your goals, market, and starting point. The free growth consultation is where we map the plan and give you clear, honest numbers — no obligation.', 4, true),
  ('What does onboarding look like?', 'We start with a discovery audit of your funnel, market, and existing assets. Within the first two weeks we have a clear growth plan, tracking set up, and initial assets ready to build.', 5, true)
on conflict do nothing;

insert into case_studies (industry, title, body, metrics, order_index, is_visible) values
  ('Solar', '312 Booked Appointments in 90 Days', 'Rebuilt the lead flow and appointment workflow for a residential solar installer, filling their calendar with qualified consultations.',
    '[{"value": "312", "label": "Booked appointments"}, {"value": "38%", "label": "Show-up rate lift"}]'::jsonb, 0, true),
  ('Home services', '58% Lower Cost Per Qualified Lead', 'Launched a lead generation and nurture system for a roofing company, cutting wasted ad spend on unqualified inquiries.',
    '[{"value": "−58%", "label": "Cost per qualified lead"}, {"value": "4.2×", "label": "Pipeline growth"}]'::jsonb, 1, true),
  ('Professional services', '+210% Qualified Sales Calls', 'New conversion funnel plus managed appointment setting nearly tripled booked consultations for a B2B service provider.',
    '[{"value": "+210%", "label": "Qualified sales calls"}, {"value": "91%", "label": "Lead response rate"}]'::jsonb, 2, true)
on conflict do nothing;
