import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Netlink Admin", template: "%s — Netlink Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-ink text-fg">{children}</div>;
}
