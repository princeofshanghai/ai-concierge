import { Manrope, Source_Sans_3 } from "next/font/google";
import localFont from "next/font/local";

export const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["700", "800"],
  display: "swap",
});

export const communityPro = localFont({
  src: "./fonts/CommunityPro-MediumWEB.woff2",
  variable: "--font-community-pro",
  weight: "500",
  style: "normal",
  display: "swap",
});
