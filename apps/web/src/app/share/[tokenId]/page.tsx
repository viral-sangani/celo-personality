import { getEventDetails, getTokenDetails } from "@/lib/poap-service";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SharePageClient } from "./share-page-client";

const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

interface SharePageProps {
  params: Promise<{ tokenId: string }>;
}

async function getPoapData(tokenId: number) {
  try {
    // First get token details to find the event ID
    const tokenData = await getTokenDetails(tokenId).catch(() => null);

    // If we have token data with event ID, get full event details
    if (tokenData?.event?.id) {
      const eventData = await getEventDetails(tokenData.event.id).catch(
        () => null
      );
      return {
        event: eventData || tokenData.event,
        token: tokenData,
      };
    }

    // Fallback: if no token data, return null
    return { event: null, token: tokenData };
  } catch (error) {
    console.error("Error fetching POAP data:", error);
    return { event: null, token: null };
  }
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { tokenId } = await params;
  const tokenIdNum = parseInt(tokenId, 10);

  if (isNaN(tokenIdNum)) {
    return {
      title: "POAP Not Found",
    };
  }

  const { event, token } = await getPoapData(tokenIdNum);

  const eventName = event?.name || "Celo Personality POAP";
  const eventDescription =
    event?.description ||
    "Discover your Celo personality through an interactive quiz";
  const imageUrl = event?.image_url || `${appUrl}/OIQ_HomeImage.png`;

  // Create MiniApp embed metadata
  const miniappEmbed = {
    version: "1",
    imageUrl: imageUrl,
    button: {
      title: "Take Quiz & Mint Your Own",
      action: {
        type: "launch_miniapp",
        url: appUrl,
        name: "Celo Personality",
        splashImageUrl: `${appUrl}/OIQ_HomeImage.png`,
        splashBackgroundColor: "#FFFFFF",
      },
    },
  };

  // Backward compatibility frame embed
  const frameEmbed = {
    version: "1",
    imageUrl: imageUrl,
    button: {
      title: "Take Quiz & Mint Your Own",
      action: {
        type: "launch_frame",
        url: appUrl,
        name: "Celo Personality",
        splashImageUrl: `${appUrl}/OIQ_HomeImage.png`,
        splashBackgroundColor: "#FFFFFF",
      },
    },
  };

  return {
    title: `${eventName} - Celo Personality`,
    description: eventDescription,
    openGraph: {
      title: eventName,
      description: eventDescription,
      images: [imageUrl],
      type: "website",
    },
    other: {
      "fc:miniapp": JSON.stringify(miniappEmbed),
      "fc:frame": JSON.stringify(frameEmbed),
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { tokenId } = await params;
  const tokenIdNum = parseInt(tokenId, 10);

  if (isNaN(tokenIdNum)) {
    notFound();
  }

  const { event, token } = await getPoapData(tokenIdNum);

  if (!event && !token) {
    notFound();
  }

  const eventName = event?.name || "Celo Personality POAP";
  const eventDescription =
    event?.description ||
    "Discover your Celo personality through an interactive quiz";
  const imageUrl = event?.image_url || token?.event?.image_url || "";

  return (
    <>
      <SharePageClient />
      <div className="min-h-screen bg-celo-tan text-black p-0 relative overflow-hidden flex items-center justify-center">
        <div className="max-w-2xl mx-auto w-full p-6 sm:p-8 md:p-10">
          {/* POAP Image */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="border-3 sm:border-4 border-black bg-white p-4 sm:p-6 md:p-8">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={eventName}
                  className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-gray-200 flex items-center justify-center">
                  <div className="font-inter text-sm uppercase">No Image</div>
                </div>
              )}
            </div>
          </div>

          {/* Event Name */}
          <h1 className="font-alpina text-3xl sm:text-4xl md:text-5xl leading-[0.9] tracking-tighter mb-4 sm:mb-6 text-center">
            {eventName}
          </h1>

          {/* Description */}
          {eventDescription && (
            <div className="border-3 sm:border-4 border-black bg-celo-yellow p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
              <p className="font-inter text-sm sm:text-base md:text-lg leading-relaxed text-black text-center">
                {eventDescription}
              </p>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center">
            <Link
              href="/"
              className="btn-brutal w-full bg-white text-black px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 font-inter font-750 text-base sm:text-lg md:text-xl uppercase tracking-tight text-center block"
            >
              Take Quiz & Mint Your Own
            </Link>
          </div>

          {/* View on POAP.xyz link */}
          {tokenIdNum && (
            <div className="mt-4 sm:mt-6 text-center">
              <a
                href={`https://poap.xyz/token/${tokenIdNum}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-inter text-sm sm:text-base text-black/70 hover:text-black underline"
              >
                View on POAP.xyz
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
