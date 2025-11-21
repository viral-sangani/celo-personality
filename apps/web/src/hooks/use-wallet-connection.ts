"use client";

import { useMiniApp } from "@/contexts/miniapp-context";
import { useAppKit } from "@reown/appkit/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

interface UseWalletConnectionReturn {
  isConnected: boolean;
  isConnecting: boolean;
  isInitializing: boolean;
  address: string | undefined;
  isFarcasterMiniapp: boolean;
  connectFarcaster: () => Promise<void>;
  connectReown: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: Error | null;
}

export function useWalletConnection(): UseWalletConnectionReturn {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isWagmiConnecting } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { context, isMiniAppReady } = useMiniApp();
  const { open: openAppKit } = useAppKit();

  const [error, setError] = useState<Error | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasAttemptedAutoConnect, setHasAttemptedAutoConnect] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Detect if we're in Farcaster miniapp
  const isFarcasterMiniapp = Boolean(context?.client);
  const farcasterConnectorId = useMemo(() => "farcaster", []);

  // Debug logging for Farcaster detection
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[Wallet] Farcaster detection:", {
        isFarcasterMiniapp,
        hasContext: Boolean(context),
        hasClient: Boolean(context?.client),
        connectorsCount: connectors.length,
        connectorIds: connectors.map((c) => c.id),
      });
    }
  }, [isFarcasterMiniapp, context, connectors]);

  const connectReown = useCallback(async () => {
    try {
      setError(null);

      if (process.env.NODE_ENV === "development") {
        console.log("[Wallet] Opening Reown AppKit modal for WalletConnect...");
      }

      // Use Reown's useAppKit hook to open the modal
      // The modal will handle WalletConnect, Coinbase, Injected, and other wallet connections
      openAppKit({ view: "Connect" });

      // Note: The connection will be handled by the AppKit modal
      // We don't need to manually connect here - the modal handles it
      // The connection state will be updated automatically via Wagmi
      // Don't set isConnecting here as the modal handles its own loading states
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to open wallet connection");
      setError(error);
      throw error;
    }
  }, [openAppKit]);

  const connectFarcaster = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Check if connectors are available
      if (connectors.length === 0) {
        setError(
          new Error(
            "Farcaster wallet not ready yet. If you just opened the mini app, please wait a moment and try again."
          )
        );
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[Wallet] Available connectors:",
          connectors.map((c) => ({ id: c.id, name: c.name }))
        );
      }

      // Try to find connector by ID, or use the first one if only one exists
      let frameConnector = connectors.find(
        (connector) => connector.id === farcasterConnectorId
      );

      // Fallback: if no connector found by ID but we have connectors, use the first one
      // (the farcasterMiniApp connector should be the only one)
      if (!frameConnector && connectors.length > 0) {
        frameConnector = connectors[0];
        if (process.env.NODE_ENV === "development") {
          console.log(
            "[Wallet] Using first available connector:",
            frameConnector.id
          );
        }
      }

      if (!frameConnector) {
        setError(
          new Error(
            "Farcaster wallet connector unavailable. Make sure this mini app is opened inside Farcaster."
          )
        );
        return;
      }

      await connect({ connector: frameConnector });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to connect Farcaster wallet");
      setError(error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [connect, connectors, farcasterConnectorId]);

  // Unified connect function that tries Farcaster first, then Reown
  const connectWallet = useCallback(async () => {
    if (process.env.NODE_ENV === "development") {
      console.log("[Wallet] connectWallet called:", {
        isFarcasterMiniapp,
        connectorsAvailable: connectors.length,
        connectorIds: connectors.map((c) => c.id),
      });
    }

    if (isFarcasterMiniapp) {
      // In Farcaster, use Farcaster connector
      if (process.env.NODE_ENV === "development") {
        console.log("[Wallet] Using Farcaster connector");
      }
      return connectFarcaster();
    } else {
      // Outside Farcaster, use Reown/WalletConnect
      if (process.env.NODE_ENV === "development") {
        console.log("[Wallet] Using Reown/WalletConnect");
      }
      return connectReown();
    }
  }, [isFarcasterMiniapp, connectFarcaster, connectReown, connectors]);

  // Track initialization state - waiting for both miniapp SDK and Wagmi connectors
  // According to Farcaster docs: "If a user already has a connected wallet the connector
  // will automatically connect to it (e.g. isConnected will be true)."
  useEffect(() => {
    const providersReady = isMiniAppReady && connectors.length > 0;

    if (providersReady) {
      // Both providers are ready, give the connector a moment to check for existing connection
      const timer = setTimeout(() => {
        setIsInitializing(false);
        if (process.env.NODE_ENV === "development") {
          console.log("[Wallet] Providers ready. isConnected:", isConnected);
        }
      }, 500); // Delay to let connector check for existing connection

      return () => clearTimeout(timer);
    } else if (isFarcasterMiniapp) {
      // Still waiting for providers
      setIsInitializing(true);
    } else {
      // Not in Farcaster miniapp, no need to initialize
      setIsInitializing(false);
    }
  }, [isMiniAppReady, connectors.length, isFarcasterMiniapp, isConnected]);

  // Auto-connect when in Farcaster miniapp
  // Per docs: "It's possible a user doesn't have a connected wallet so you should always
  // check for a connection and prompt them to connect if they aren't already connected."
  // We automatically attempt connection when in Farcaster miniapp.
  useEffect(() => {
    if (
      !isInitializing &&
      isFarcasterMiniapp &&
      !isConnected &&
      !isConnecting &&
      !hasAttemptedAutoConnect &&
      connectors.length > 0
    ) {
      setHasAttemptedAutoConnect(true);

      if (process.env.NODE_ENV === "development") {
        console.log("[Wallet] Auto-connecting to Farcaster wallet...");
      }

      // Small delay to ensure connector is fully ready
      const timer = setTimeout(() => {
        connectFarcaster().catch((err) => {
          if (process.env.NODE_ENV === "development") {
            console.warn("[Wallet] Auto-connect failed:", err.message);
          }
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [
    isInitializing,
    isFarcasterMiniapp,
    isConnected,
    isConnecting,
    hasAttemptedAutoConnect,
    connectors.length,
    connectFarcaster,
  ]);

  const disconnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      wagmiDisconnect();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to disconnect");
      setError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [wagmiDisconnect]);

  // Add debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[Wallet] State:", {
        isMiniAppReady,
        connectorsCount: connectors.length,
        isFarcasterMiniapp,
        isConnected,
        isConnecting: isConnecting || isWagmiConnecting,
        isInitializing,
        hasAttemptedAutoConnect,
      });
    }
  }, [
    isMiniAppReady,
    connectors.length,
    isFarcasterMiniapp,
    isConnected,
    isConnecting,
    isWagmiConnecting,
    isInitializing,
    hasAttemptedAutoConnect,
  ]);

  return {
    isConnected,
    isConnecting: isConnecting || isWagmiConnecting,
    isInitializing,
    address,
    isFarcasterMiniapp,
    connectFarcaster,
    connectReown,
    connectWallet,
    disconnect,
    error,
  };
}
