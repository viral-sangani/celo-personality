"use client";

import { useWalletConnection } from "@/hooks/use-wallet-connection";
import { formatAddress } from "@/lib/ens";
import { env } from "@/lib/env";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { WalletConnectButtons } from "./wallet-connect-buttons";

interface StartPageProps {
  onStart: () => void;
}

export function StartPage({ onStart }: StartPageProps) {
  const {
    isConnected,
    isConnecting,
    isInitializing,
    address,
    isFarcasterMiniapp,
  } = useWalletConnection();
  const [formattedAddress, setFormattedAddress] = useState<string>("");
  const [secretCode, setSecretCode] = useState<string>("");
  const [isSecretCodeValid, setIsSecretCodeValid] = useState<boolean>(false);

  // Hide global navbar when start page is active
  useEffect(() => {
    document.body.classList.add("start-page-active");
    return () => {
      document.body.classList.remove("start-page-active");
    };
  }, []);

  // Fetch and format wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      formatAddress(address)
        .then(setFormattedAddress)
        .catch(() => {
          // Fallback to truncated address if formatting fails
          setFormattedAddress(`${address.slice(0, 6)}...${address.slice(-4)}`);
        });
    } else {
      setFormattedAddress("");
    }
  }, [isConnected, address]);

  // Validate secret code
  useEffect(() => {
    const expectedCode = env.NEXT_PUBLIC_EVENT_SECRET_CODE;
    // If no secret code is configured, allow access
    if (!expectedCode || expectedCode === "") {
      setIsSecretCodeValid(true);
      return;
    }
    // Check if entered code matches (case-insensitive, trimmed)
    setIsSecretCodeValid(
      secretCode.trim().toLowerCase() === expectedCode.trim().toLowerCase()
    );
  }, [secretCode]);

  const handleStartQuiz = () => {
    if (!isSecretCodeValid) {
      toast.error("Please enter a valid secret code");
      return;
    }
    onStart();
  };

  return (
    <div className="h-screen bg-celo-tan text-black p-0 relative overflow-hidden flex flex-col">
      {/* Yellow Header Bar */}
      <div className="w-full bg-celo-yellow border-b-3 sm:border-b-4 border-black">
        <div className="flex h-14 sm:h-16 md:h-20 items-center justify-between px-4 sm:px-6 md:px-10 lg:px-12">
          <div className="font-alpina text-xl sm:text-2xl md:text-3xl tracking-tighter">
            Celo <span className="italic">Personality</span>
          </div>
          <div className="font-inter text-[10px] sm:text-xs uppercase tracking-widest font-bold">
            QUIZ
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="max-w-2xl mx-auto w-full flex flex-col items-center justify-center min-h-full py-12 sm:py-16 md:py-20">
            {/* Title */}
            <h1 className="font-alpina text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tighter mb-6 sm:mb-8 md:mb-10 text-center">
              Celo Identity Quiz
            </h1>

            {/* Description */}
            <p className="font-inter text-base sm:text-lg md:text-xl mb-8 sm:mb-10 md:mb-12 text-center max-w-xl">
              Discover your Celo personality through an interactive quiz. Answer
              5 questions to find out if you're a Mini App Maven, Real Human
              Being, Regenerative Soul, L2 Architect, or Stablecoin Pragmatist.
            </p>

            {/* Secret Code Section */}
            {env.NEXT_PUBLIC_EVENT_SECRET_CODE &&
              env.NEXT_PUBLIC_EVENT_SECRET_CODE !== "" && (
                <div className="w-full max-w-md space-y-3 mb-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="secret-code"
                      className="font-inter text-sm sm:text-base font-750 text-black block text-center"
                    >
                      Enter Secret Code
                    </label>
                    <input
                      id="secret-code"
                      type="text"
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                      placeholder="Enter code from Celo booth"
                      className="w-full border-3 sm:border-4 border-black bg-white px-4 py-3 font-inter text-base sm:text-lg text-black placeholder:text-black/40 focus:outline-none focus:ring-0"
                    />
                    <p className="font-inter text-xs sm:text-sm text-center text-black/70">
                      If you need the secret code, ask someone at the Celo booth
                    </p>
                  </div>
                </div>
              )}

            {/* Wallet Connection Section */}
            <div className="w-full max-w-md space-y-4">
              {isInitializing && isFarcasterMiniapp && !isConnected ? (
                <div className="text-center">
                  <p className="font-inter text-sm sm:text-base mb-4">
                    Initializing...
                  </p>
                </div>
              ) : isConnected ? (
                <div className="space-y-4">
                  {/* Wallet Address Display */}
                  {formattedAddress && (
                    <div className="border-3 sm:border-4 border-black bg-white px-4 py-3 text-center">
                      <p className="font-inter text-xs sm:text-sm text-black/70 mb-1">
                        Connected Wallet
                      </p>
                      <p className="font-inter text-sm sm:text-base font-750 text-black">
                        {formattedAddress}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleStartQuiz}
                    disabled={!isSecretCodeValid}
                    className={`btn-brutal w-full px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 font-inter font-750 text-base sm:text-lg md:text-xl uppercase tracking-tight ${
                      isSecretCodeValid
                        ? "bg-celo-yellow text-black"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    START QUIZ
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {isConnecting ? (
                    <div className="text-center">
                      <p className="font-inter text-sm sm:text-base mb-4">
                        {isFarcasterMiniapp
                          ? "Connecting to your Farcaster wallet..."
                          : "Connecting to your wallet..."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <WalletConnectButtons
                        onConnect={handleStartQuiz}
                        isSecretCodeValid={isSecretCodeValid}
                      />
                      {!isFarcasterMiniapp && (
                        <p className="font-inter text-xs sm:text-sm text-center text-black/70">
                          Connect your wallet using WalletConnect or open this
                          app in Farcaster
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
