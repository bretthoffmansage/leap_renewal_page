import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEAP Membership Renewal Finder",
  description: "Find the correct LEAP membership renewal page for your account.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
