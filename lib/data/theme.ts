import { cache } from "react";
import { getPublicSupabase } from "@/lib/supabase/client";
import { site } from "@/lib/content";

export type ThemeSettings = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  buttonText: string;
  navbarCtaText: string;
  sectionVisibility: Record<string, boolean>;
  contactEmail: string;
  phoneNumber: string;
  whatsappLink: string;
  socialLinks: Record<string, string>;
};

export const DEFAULT_SECTION_VISIBILITY: Record<string, boolean> = {
  clients: true,
  googleRating: true,
  problem: true,
  services: true,
  growthSystem: true,
  industries: true,
  caseStudies: true,
  googleReviews: true,
  whyChoose: true,
  faq: true,
  contact: true,
};

export const DEFAULT_THEME: ThemeSettings = {
  primaryColor: "#0dfdd1",
  secondaryColor: "#22d3ee",
  backgroundColor: "#050507",
  buttonText: "Get a Free Growth Consultation",
  navbarCtaText: "Free Consultation",
  sectionVisibility: DEFAULT_SECTION_VISIBILITY,
  contactEmail: site.email,
  phoneNumber: site.phone,
  whatsappLink: "",
  socialLinks: { ...site.social },
};

type ThemeSettingsRow = {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  button_text: string;
  navbar_cta_text: string;
  section_visibility: Record<string, boolean> | null;
  contact_email: string;
  phone_number: string;
  whatsapp_link: string | null;
  social_links: Record<string, string> | null;
};

export const getThemeSettings = cache(async function getThemeSettings(): Promise<ThemeSettings> {
  const supabase = getPublicSupabase();
  if (!supabase) return DEFAULT_THEME;

  try {
    const { data, error } = await supabase
      .from("theme_settings")
      .select(
        "primary_color, secondary_color, background_color, button_text, navbar_cta_text, section_visibility, contact_email, phone_number, whatsapp_link, social_links"
      )
      .eq("id", 1)
      .maybeSingle<ThemeSettingsRow>();

    if (error || !data) return DEFAULT_THEME;

    return {
      primaryColor: data.primary_color ?? DEFAULT_THEME.primaryColor,
      secondaryColor: data.secondary_color ?? DEFAULT_THEME.secondaryColor,
      backgroundColor: data.background_color ?? DEFAULT_THEME.backgroundColor,
      buttonText: data.button_text ?? DEFAULT_THEME.buttonText,
      navbarCtaText: data.navbar_cta_text ?? DEFAULT_THEME.navbarCtaText,
      sectionVisibility: {
        ...DEFAULT_SECTION_VISIBILITY,
        ...(data.section_visibility ?? {}),
      },
      contactEmail: data.contact_email ?? DEFAULT_THEME.contactEmail,
      phoneNumber: data.phone_number ?? DEFAULT_THEME.phoneNumber,
      whatsappLink: data.whatsapp_link ?? "",
      socialLinks: { ...DEFAULT_THEME.socialLinks, ...(data.social_links ?? {}) },
    };
  } catch {
    return DEFAULT_THEME;
  }
});

/** Converts a display phone number into a tel: href, keeping only digits and a leading +. */
export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

