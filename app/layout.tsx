import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getThemeSettings } from "@/lib/data/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Netlink | Lead Generation & Appointment Setting System";
const description =
  "Netlink helps service businesses generate qualified leads and book sales appointments through funnels, ads, automation, and managed follow-up.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.netlink.agency"),
  title: {
    default: title,
    template: "%s — Netlink",
  },
  description,
  keywords: [
    "lead generation",
    "appointment setting",
    "done-for-you lead generation",
    "qualified appointments",
    "sales pipeline",
    "service business growth",
  ],
  authors: [{ name: "Netlink" }],
  openGraph: {
    type: "website",
    url: "https://www.netlink.agency",
    siteName: "Netlink",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={
        {
          "--color-neon": theme.primaryColor,
          "--color-cyan": theme.secondaryColor,
          "--color-ink": theme.backgroundColor,
        } as React.CSSProperties
      }
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
