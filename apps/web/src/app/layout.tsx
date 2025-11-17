import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import Providers from "@/components/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// Embed metadata for Farcaster sharing
const frame = {
  version: "1",
  imageUrl: `${appUrl}/opengraph-image.png`,
  button: {
    title: "Launch celo-personality",
    action: {
      type: "launch_frame",
      name: "celo-personality",
      url: appUrl,
      splashImageUrl: `${appUrl}/icon.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const metadata: Metadata = {
  title: "Celo Personality",
  description: "Discover your Celo personality through an interactive quiz",
  icons: {
    icon: "/celo.avif",
  },
  openGraph: {
    title: "Celo Personality",
    description: "Discover your Celo personality through an interactive quiz",
    images: [`${appUrl}/opengraph-image.png`],
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navbar is included on all pages */}
        <div className="relative flex min-h-screen flex-col">
          <Providers>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#000",
                  color: "#fff",
                  border: "3px solid #000",
                  borderRadius: "0",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  fontSize: "14px",
                },
                success: {
                  iconTheme: {
                    primary: "#fcff52",
                    secondary: "#000",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ff4444",
                    secondary: "#000",
                  },
                },
              }}
            />
          </Providers>
        </div>
      </body>
    </html>
  );
}
