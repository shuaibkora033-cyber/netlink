import type { ReactNode } from "react";

// Distinct SVG icon per industry id. Shared by the homepage's compact
// Industries grid and the full /industries page's IndustryCard grid.
export const INDUSTRY_ICONS: Record<string, ReactNode> = {
  solar: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  "home-services": (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M3 12L12 4l9 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  healthcare: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 21C12 21 3 15 3 9a5 5 0 0110 0 5 5 0 0110 0c0 6-9 12-9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9h6M12 6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  "real-estate": (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="2" y="7" width="13" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 11h5a1 1 0 011 1v10H15V11z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 11v2M6 15v2M9 11v2M9 15v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2 7V5a1 1 0 011-1h11a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  professional: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 13h20" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3 2" />
      <path d="M10 13v2h4v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  legal: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 3v18M7 7l-4 8a3.6 3.6 0 007 0l-4-8zM17 7l-4 8a3.6 3.6 0 007 0l-4-8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 21h16M5 7h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  finance: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 12.5l1 1 2-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  b2b: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="6" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.8 9l3 5.5M16.2 9l-3 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  "local-service": (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  construction: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-3 3z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 5l-5 5 5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 19l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 20h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  ecommerce: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

// Fallback icon for any industry id with no dedicated icon above.
export const DEFAULT_INDUSTRY_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
