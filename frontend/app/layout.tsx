import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

import { Providers } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Anime Tracker",
  description: "Track anime progress, browse trending shows, and keep up with release calendars.",
  icons: {
    icon: "/anime-tracker-icon.png",
    shortcut: "/anime-tracker-icon.png",
    apple: "/anime-tracker-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-display antialiased">
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
