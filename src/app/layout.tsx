import type { Metadata, Viewport } from "next";
import "./globals.css";
import fs from "fs";
import path from "path";

// Copy Demo.mp4 from root to public folder on server initialization
try {
  const srcPath = path.join(process.cwd(), "Demo.mp4");
  const destPath = path.join(process.cwd(), "public", "Demo.mp4");
  if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log("✅ Copied Demo.mp4 to public/Demo.mp4 successfully.");
  }
} catch (e) {
  console.error("❌ Failed to copy Demo.mp4:", e);
}

export const metadata: Metadata = {
  title: "HealOne 360 — Unified Healthcare Operating System",
  description: "HealOne 360 is a secure, unified healthcare operating system designed for modern medical practices and clinics, offering EMR, prescriptions, scheduling, and patient portals.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
