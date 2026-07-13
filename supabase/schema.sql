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
  button_text        text not null default 'Get a Free Growth Consultation',
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
  hero_badge           text not null default 'Digital growth agency',
  hero_headline        text not null default 'Build a digital growth system that turns clicks into',
  hero_rotating_words  text[] not null default array['Leads','Websites','Campaigns','Growth'],
  hero_subheadline     text not null default 'Netlink helps service businesses build high-converting websites, launch performance campaigns, and create lead generation systems designed to scale.',
  primary_cta_text     text not null default 'Get a Free Growth Consultation',
  primary_cta_link     text not null default '#contact',
  secondary_cta_text   text not null default 'Explore Services',
  secondary_cta_link   text not null default '#services',
  stats                jsonb not null default '[
    {"value": 120, "suffix": "+", "label": "Campaigns launched"},
    {"value": 3.4, "suffix": "×", "label": "Avg. return on ad spend"},
    {"value": 68, "suffix": "%", "label": "Lower cost per lead"},
    {"value": 24, "suffix": "/7", "label": "Performance monitoring"}
  ]'::jsonb,
  growth_steps         jsonb not null default '[
    {"num": "01", "title": "Discover", "text": "We audit your funnel, market, and numbers to find where growth is leaking — and where the biggest wins are hiding."},
    {"num": "02", "title": "Build", "text": "We design conversion-focused pages, offers, and tracking, then wire up the automation that turns interest into booked calls."},
    {"num": "03", "title": "Launch", "text": "We deploy performance campaigns with sharp creative and tight targeting, driving qualified traffic into your new system."},
    {"num": "04", "title": "Optimize", "text": "We monitor every metric that matters and iterate weekly — scaling what works and cutting what does not to compound results."}
  ]'::jsonb,
  industries           jsonb not null default '[
    {"id": "solar", "name": "Solar & Clean Energy"},
    {"id": "home-services", "name": "Home Services & HVAC"},
    {"id": "healthcare", "name": "Healthcare & Wellness"},
    {"id": "real-estate", "name": "Real Estate & Property"},
    {"id": "professional", "name": "Professional Services"},
    {"id": "construction", "name": "Construction & Trades"},
    {"id": "ecommerce", "name": "E-commerce & Retail"},
    {"id": "finance", "name": "Financial Services"}
  ]'::jsonb,
  final_cta            jsonb not null default '{
    "eyebrow": "Let''s talk",
    "title": "Get a free growth consultation",
    "text": "Tell us about your business and goals. We''ll audit where growth is leaking and show you exactly how Netlink''s system can fill your pipeline — no pressure, no obligation.",
    "bullets": [
      "A tailored growth plan for your business",
      "Where your funnel is leaking leads today",
      "Realistic projections and clear next steps"
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
  ('Lead Generation', 'Strategic inbound and outbound funnels that identify, engage, and qualify high-intent prospects before handing them to your team.', 'lead-gen', 0, true),
  ('Appointment Setting', 'Systematic outreach and follow-up sequences that land qualified prospects directly onto your sales calendar.', 'appt-setting', 1, true),
  ('Web Development', 'High-converting websites and landing pages built for speed, trust, and measurable action — not just aesthetics.', 'web-dev', 2, true),
  ('UI/UX Design', 'Interfaces designed around real user psychology to reduce friction, build trust, and maximize every conversion opportunity.', 'uiux', 3, true),
  ('Performance Marketing', 'Data-driven paid media across Meta, Google, and beyond — engineered for maximum reach and predictable ROI.', 'perf-marketing', 4, true),
  ('Google Ads', 'Intent-based search campaigns that capture high-value prospects at the exact moment they''re searching for you.', 'google-ads', 5, true),
  ('Social Media Marketing', 'Content and community strategies that build authority, grow reach, and turn followers into paying customers.', 'social-media', 6, true),
  ('Branding & Creative Direction', 'A distinct brand identity — logo, visuals, and messaging — engineered to position you as the premium choice in your market.', 'branding', 7, true),
  ('Conversion Optimization', 'Systematic testing and funnel analysis that extracts more revenue from your existing traffic without raising ad spend.', 'conversion', 8, true)
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
  ('Solar', '3.8× ROAS in 90 days', 'Rebuilt the funnel and paid social system for a residential solar installer, cutting cost per booked consultation significantly.',
    '[{"value": "3.8×", "label": "Return on ad spend"}, {"value": "−54%", "label": "Cost per appointment"}]'::jsonb, 0, true),
  ('Home services', '212 qualified leads / month', 'Launched a lead-gen and appointment-setting engine for an HVAC company, filling the calendar during a traditionally slow season.',
    '[{"value": "212", "label": "Monthly qualified leads"}, {"value": "4.1×", "label": "Pipeline growth"}]'::jsonb, 1, true),
  ('Professional services', '+180% booked calls', 'New conversion-focused website plus search campaigns nearly tripled inbound consultations for a consulting firm.',
    '[{"value": "+180%", "label": "Booked calls"}, {"value": "2.3 s", "label": "Page load time"}]'::jsonb, 2, true)
on conflict do nothing;
