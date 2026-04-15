import type { ReactNode } from "react";
import Script from "next/script";

export default function InternalFigmaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
      <Script
        src="https://mcp.figma.com/mcp/html-to-design/capture.js"
        strategy="beforeInteractive"
      />
    </>
  );
}
