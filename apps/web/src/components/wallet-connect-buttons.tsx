"use client";

import { useWalletConnection } from "@/hooks/use-wallet-connection";

interface WalletConnectButtonsProps {
  onConnect?: () => void;
}

export function WalletConnectButtons({ onConnect }: WalletConnectButtonsProps) {
  const { isConnected, isConnecting, connectFarcaster, error } =
    useWalletConnection();

  const handleFarcasterConnect = async () => {
    try {
      await connectFarcaster();
      onConnect?.();
    } catch (err) {
      // Error is handled by the hook
      console.error("Failed to connect Farcaster wallet:", err);
    }
  };

  return (
    <button
      onClick={handleFarcasterConnect}
      disabled={isConnecting || isConnected}
      className="btn-brutal w-full bg-white text-black border-3 sm:border-4 border-black px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 font-inter font-750 text-base sm:text-lg md:text-xl uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
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
