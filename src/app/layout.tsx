import type { Metadata } from "next";
import "./globals.css";
import { communityPro, manrope, sourceSans } from "./fonts";

export const metadata: Metadata = {
  title: "LinkedIn Hire",
  description:
    "Prototype microsite landing page for learning about LinkedIn Recruiter and contacting sales.",
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
