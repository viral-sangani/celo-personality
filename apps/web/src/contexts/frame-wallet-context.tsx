"use client";

import { env } from "@/lib/env";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { celo } from "wagmi/chains";

// Setup networks - only Celo mainnet
const networks = [celo];

// Get projectId from environment
const projectId = env.NEXT_PUBLIC_REOWN_PROJECT_ID || "build-time-placeholder";

// Create metadata object
const metadata = {
  name: "Celo Personality Quiz",
  description: "Discover your Celo personality through an interactive quiz",
  url: env.NEXT_PUBLIC_URL,
  icons: [`${env.NEXT_PUBLIC_URL}/OIQ_Icon.png`],
};

// Create Wagmi Adapter for Reown
const wagmiAdapter = new WagmiAdapter({
  networks: networks as any, // Type assertion to satisfy AppKitNetwork type
  projectId,
  ssr: true,
});

// Initialize AppKit modal (called outside React component)
if (typeof window !== "undefined" && projectId !== "build-time-placeholder") {
  createAppKit({
    adapters: [wagmiAdapter],
    networks: networks as any,
    projectId,
    metadata,
    features: {
      analytics: true,
    },
  });
}

// IMPORTANT: According to Reown docs, we MUST use wagmiAdapter.wagmiConfig directly
// in the WagmiProvider for proper integration. The adapter's config includes all
// Reown connectors (WalletConnect, Coinbase, Injected, social logins, etc.).
//
// For Farcaster support: We'll conditionally use either the adapter's config (for Reown)
// or create a config with Farcaster connector (for Farcaster miniapp).
// Since we can't easily merge both, we'll detect the environment and use the appropriate config.

// Check if we're in Farcaster environment (this will be set by the miniapp SDK)
const isFarcasterEnv =
  typeof window !== "undefined" && (window as any).farcaster !== undefined;

// Use the adapter's wagmiConfig directly for Reown (this is required per docs)
// Only create a separate config for Farcaster if we're in Farcaster environment
const config = isFarcasterEnv
  ? createConfig({
      chains: [celo],
      connectors: [farcasterMiniApp()],
      transports: {
        [celo.id]: http(),
      },
    })
  : wagmiAdapter.wagmiConfig; // Use adapter's config directly for Reown

const queryClient = new QueryClient();

export default function FrameWalletProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
