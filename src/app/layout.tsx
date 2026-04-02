import type { Metadata } from "next";
import "./globals.css";
import { communityPro, manrope, sourceSans } from "./fonts";

export const metadata: Metadata = {
  title: "AI concierge prototype",
  description:
    "Design prototype of LinkedIn microsite AI concierge - qualifying leads and routing to sales",
  openGraph: {
    title: "AI concierge prototype",
    description:
      "Design prototype of LinkedIn microsite AI concierge - qualifying leads and routing to sales",
  },
  twitter: {
    title: "AI concierge prototype",
    description:
      "Design prototype of LinkedIn microsite AI concierge - qualifying leads and routing to sales",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${manrope.variable} ${communityPro.variable} bg-background antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
