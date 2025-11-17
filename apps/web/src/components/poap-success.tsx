"use client";

import { useMiniApp } from "@/contexts/miniapp-context";
import { formatAddress } from "@/lib/ens";
import type { EventDetails, TokenDetails } from "@/lib/poap-service";
import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { PersonalityType } from "./personality-quiz";

interface PoapSuccessProps {
  tokenId: number;
  eventId: number;
  claimedDate: string;
  address: string;
  personalityType: PersonalityType;
  initialEventData?: {
    id: number;
    fancy_id: string;
    name: string;
    description: string;
    image_url: string;
    year: number;
    start_date: string;
    end_date: string;
  } | null;
}

const personalityResults: Record<
  PersonalityType,
  {
    bgColor: string;
    textColor: string;
    accentColor: string;
  }
> = {
  "mini app maxi": {
    bgColor: "bg-celo-purple",
    textColor: "text-celo-yellow",
    accentColor: "bg-celo-pink",
  },
  "verified human": {
    bgColor: "bg-celo-blue",
    textColor: "text-black",
    accentColor: "bg-white",
  },
  "impact regen": {
    bgColor: "bg-celo-green",
    textColor: "text-celo-yellow",
    accentColor: "bg-celo-lime",
  },
  "L2 believer": {
    bgColor: "bg-celo-orange",
    textColor: "text-black",
    accentColor: "bg-celo-yellow",
  },
  "stablecoin savvy": {
    bgColor: "bg-celo-yellow",
    textColor: "text-black",
    accentColor: "bg-celo-brown",
  },
};

export function PoapSuccess({
  tokenId,
  eventId,
  claimedDate,
  address,
  personalityType,
  initialEventData,
}: PoapSuccessProps) {
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [displayAddress, setDisplayAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMiniAppReady, context } = useMiniApp();

  const resultData = personalityResults[personalityType];
  const isFarcasterMiniapp = Boolean(context?.client);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch event and token details in parallel from API routes
        const [eventResponse, tokenResponse] = await Promise.all([
          fetch(`/api/poap/event/${eventId}`),
          fetch(`/api/poap/token/${tokenId}`).catch(() => null), // Token details optional
        ]);

        if (!eventResponse.ok) {
          throw new Error(
            `Failed to fetch event: ${eventResponse.status} ${eventResponse.statusText}`
          );
        }

        const eventData: EventDetails = await eventResponse.json();
        let tokenData: TokenDetails | null = null;

        if (tokenResponse && tokenResponse.ok) {
          tokenData = await tokenResponse.json();
        }

        setEventDetails(eventData);
        setTokenDetails(tokenData);

        // Resolve ENS name
        const formattedAddress = await formatAddress(address);
        setDisplayAddress(formattedAddress);
      } catch (err) {
        console.error("Failed to fetch POAP data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load POAP details"
        );

        // Fallback to initial event data if available
        if (initialEventData) {
          // Create a minimal event details object from initial data
          setEventDetails({
            id: initialEventData.id,
            fancy_id: initialEventData.fancy_id,
            name: initialEventData.name,
            description: initialEventData.description,
            location_type: "",
            city: "",
            country: "",
            channel: "",
            platform: "",
            event_url: "",
            image_url: initialEventData.image_url,
            animation_url: "",
            year: initialEventData.year,
            start_date: initialEventData.start_date,
            end_date: initialEventData.end_date,
            expiry_date: "",
            created_date: "",
            timezone: "",
            from_admin: false,
            virtual_event: false,
            event_template_id: 0,
            private_event: false,
          });
        }

        // Format address even on error
        const formattedAddress = await formatAddress(address);
        setDisplayAddress(formattedAddress);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tokenId, eventId, address, initialEventData]);

  const handleShare = async () => {
    // Format personality type: capitalize each word
    const formatPersonalityType = (type: PersonalityType): string => {
      return type
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const formattedPersonality = formatPersonalityType(personalityType);
    const shareText = `I just took the Celo Onchain Identity Quiz!

My identity: ${formattedPersonality}`;
    const appUrl = process.env.NEXT_PUBLIC_URL || window.location.origin;
    const shareUrl = `${appUrl}/share/${tokenId}`;

    try {
      // If in Farcaster miniapp, try to use SDK to open the cast composer directly
      if (isFarcasterMiniapp && isMiniAppReady) {
        try {
          const actions = sdk.actions as any;

          if (typeof actions.composeCast === "function") {
            await actions.composeCast({
              text: shareText,
              embeds: [shareUrl],
              close: false,
            });
            toast.success("Cast composer opened");
            return;
          }

          // Try openUrl to open the shareable page (user can share from there)
          if (typeof actions.openUrl === "function") {
            await actions.openUrl(shareUrl);
            toast.success("Opening share page...");
            return;
          }
        } catch (sdkError) {
          console.warn("SDK share failed, falling back:", sdkError);
          // Fall through to fallback methods
        }
      }

      // Fallback: Use Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Celo Onchain Identity Quiz",
            text: shareText,
            url: shareUrl,
          });
          toast.success("Shared!");
        } catch (err) {
          // User cancelled or error occurred
          if ((err as Error).name !== "AbortError") {
            console.error("Share error:", err);
          }
        }
      } else {
        // Final fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share POAP");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${resultData.bgColor} ${resultData.textColor} p-0 relative overflow-hidden flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="font-inter text-lg sm:text-xl uppercase tracking-tight font-bold">
            Loading POAP...
          </div>
        </div>
      </div>
    );
  }

  if (error && !eventDetails) {
    return (
      <div
        className={`min-h-screen ${resultData.bgColor} ${resultData.textColor} p-0 relative overflow-hidden flex items-center justify-center`}
      >
        <div className="text-center max-w-md px-4">
          <div className="font-inter text-lg sm:text-xl uppercase tracking-tight font-bold mb-4">
            Error loading POAP
          </div>
          <div className="font-inter text-sm">{error}</div>
        </div>
      </div>
    );
  }

  const event = eventDetails || (initialEventData as any);
  const poapImageUrl = event?.image_url || "";

  return (
    <div
      className={`min-h-screen ${resultData.bgColor} ${resultData.textColor} p-0 relative overflow-hidden`}
    >
      {/* Decorative blocks - hidden on mobile, visible on larger screens */}
      <div
        className={`hidden md:block absolute top-0 right-0 w-32 h-32 lg:w-48 lg:h-48 ${resultData.accentColor} border-4 border-black`}
      ></div>
      <div
        className={`hidden md:block absolute bottom-0 left-0 w-48 h-24 lg:w-64 lg:h-32 border-4 border-black`}
      ></div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center p-4 sm:p-6 md:p-10 lg:p-12 gap-6 md:gap-8 lg:gap-12">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="font-inter text-[10px] sm:text-xs tracking-widest mb-3 md:mb-4 uppercase font-bold">
            POAP MINTED
          </div>
          <h1 className="font-alpina text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tighter mb-4">
            {event?.name || "Celo Personality POAP"}
          </h1>
        </div>

        {/* POAP Image - Large and Centered */}
        <div className="flex justify-center">
          <div className="border-brutal-container bg-white p-4 sm:p-6 md:p-8">
            {poapImageUrl ? (
              <img
                src={poapImageUrl}
                alt={event?.name || "POAP"}
                className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain"
              />
            ) : (
              <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gray-200 flex items-center justify-center">
                <div className="font-inter text-sm uppercase">No Image</div>
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="max-w-3xl mx-auto w-full space-y-4 sm:space-y-6">
          {/* Description */}
          {event?.description && (
            <div
              className={`border-brutal-container ${resultData.accentColor} p-5 sm:p-6 md:p-10 lg:p-12`}
            >
              <p className="font-inter text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-black">
                {event.description}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Mint Date */}
            <div className="border-brutal-container bg-black text-white p-4 sm:p-5 md:p-6">
              <div className="font-inter text-[10px] sm:text-xs uppercase tracking-widest mb-2 font-bold opacity-70">
                Minted
              </div>
              <div className="font-inter text-sm sm:text-base font-750">
                {formatDate(claimedDate)}
              </div>
            </div>

            {/* Wallet Address */}
            <div className="border-brutal-container bg-black text-white p-4 sm:p-5 md:p-6">
              <div className="font-inter text-[10px] sm:text-xs uppercase tracking-widest mb-2 font-bold opacity-70">
                Collected By
              </div>
              <div className="font-inter text-sm sm:text-base font-750 break-all">
                {displayAddress}
              </div>
            </div>

            {/* Event Dates */}
            {event?.start_date && event?.end_date && (
              <>
                <div className="border-brutal-container bg-black text-white p-4 sm:p-5 md:p-6">
                  <div className="font-inter text-[10px] sm:text-xs uppercase tracking-widest mb-2 font-bold opacity-70">
                    Start Date
                  </div>
                  <div className="font-inter text-sm sm:text-base font-750">
                    {formatEventDate(event.start_date)}
                  </div>
                </div>
                <div className="border-brutal-container bg-black text-white p-4 sm:p-5 md:p-6">
                  <div className="font-inter text-[10px] sm:text-xs uppercase tracking-widest mb-2 font-bold opacity-70">
                    End Date
                  </div>
                  <div className="font-inter text-sm sm:text-base font-750">
                    {formatEventDate(event.end_date)}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleShare}
              className="flex-1 btn-brutal bg-white text-black px-6 sm:px-8 py-4 sm:py-5 md:py-6 font-inter font-750 text-sm sm:text-base md:text-lg uppercase tracking-tight md:hover:bg-black md:hover:text-white active:bg-black active:text-white"
            >
              Share POAP
            </button>
            <a
              href={`https://poap.xyz/token/${tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn-brutal bg-black text-white px-6 sm:px-8 py-4 sm:py-5 md:py-6 font-inter font-750 text-sm sm:text-base md:text-lg uppercase tracking-tight text-center md:hover:bg-white md:hover:text-black active:bg-white active:text-black"
            >
              View on POAP.xyz
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
