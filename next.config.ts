import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/internal/ai-concierge-cta",
        destination: "/",
        permanent: false,
      },
      {
        source: "/stakeholder-notes-slides.html",
        destination: "/internal/presentation",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
