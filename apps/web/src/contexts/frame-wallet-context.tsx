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

// IMPORTANT: According to Reown docs, we SHOULD use wagmiAdapter.wagmiConfig directly
// in the WagmiProvider for proper integration with Reown (social logins, WalletConnect, etc.).
//
// However, we also need Farcaster connector for Farcaster miniapp support.
// The challenge: The adapter's connectors are already instantiated (not factory functions),
// so we can't easily merge them with Farcaster connector.
//
// Solution: Create a config that includes Farcaster connector. The useAppKit hook will
// still work for Reown connections because it's connected to the adapter's initialization
// (createAppKit above). For Farcaster, the connector will be available in the config.
const reownConfig = wagmiAdapter.wagmiConfig;

// Create config with Farcaster connector
// The useAppKit hook will handle Reown connections via the adapter's initialization,
// even though Reown connectors aren't explicitly in this config.
const config = createConfig({
  chains: reownConfig.chains,
  connectors: [
    farcasterMiniApp(), // Farcaster connector - required for Farcaster miniapp
  ],
  transports: {
    [celo.id]: http(),
  },
});

// Note: The adapter's wagmiConfig (reownConfig) has all Reown connectors configured.
// The useAppKit hook works with the adapter's initialization (createAppKit above) to handle
// Reown/WalletConnect connections via the modal, even though we're using a different config.
// For Farcaster, the connector above will be used by connectFarcaster() when isFarcasterMiniapp is true.

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
