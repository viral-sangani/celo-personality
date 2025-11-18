"use client";

import { useWalletConnection } from "@/hooks/use-wallet-connection";
import { useEffect, useRef } from "react";

interface WalletConnectButtonsProps {
  onConnect?: () => void;
  isSecretCodeValid?: boolean;
}

export function WalletConnectButtons({
  onConnect,
  isSecretCodeValid = true,
}: WalletConnectButtonsProps) {
  const { isConnected, isConnecting, connectWallet, error } =
    useWalletConnection();

  // Track if we initiated the connection to avoid calling onConnect on mount
  const connectionInitiatedRef = useRef(false);
  const previousConnectedRef = useRef(isConnected);

  // Call onConnect when connection state changes from false to true
  useEffect(() => {
    const wasDisconnected = !previousConnectedRef.current;
    const isNowConnected = isConnected;

    if (wasDisconnected && isNowConnected && connectionInitiatedRef.current) {
      // Connection just completed
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[WalletConnectButtons] Connection completed, calling onConnect"
        );
      }
      onConnect?.();
      connectionInitiatedRef.current = false; // Reset for future connections
    }

    previousConnectedRef.current = isConnected;
  }, [isConnected, onConnect]);

  const handleConnect = async () => {
    if (!isSecretCodeValid) {
      return;
    }
    try {
      connectionInitiatedRef.current = true;
      await connectWallet();
      // Don't call onConnect here - it will be called in the useEffect when isConnected changes
    } catch (err) {
      // Error is handled by the hook
      console.error("Failed to connect wallet:", err);
      connectionInitiatedRef.current = false;
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting || isConnected || !isSecretCodeValid}
      className={`btn-brutal w-full border-3 sm:border-4 border-black px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 font-inter font-750 text-base sm:text-lg md:text-xl uppercase tracking-tight ${
        !isSecretCodeValid
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed"
      }`}
    >
      {isConnecting
        ? "CONNECTING..."
        : isConnected
        ? "CONNECTED"
        : error
        ? "RETRY CONNECTION"
        : "CONNECT WALLET"}
    </button>
  );
}
