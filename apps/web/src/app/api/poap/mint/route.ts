import {
  checkQRCodeStatus,
  claimPOAP,
  getEventDetails,
  getEventIdForPersonality,
  getSecretCodeForPersonality,
  getTokenDetails,
  getUnclaimedQRCodes,
  requestMoreCodes,
  scanAddressForEvent,
} from "@/lib/poap-service";
import { NextResponse } from "next/server";

type PersonalityType =
  | "mini app maxi"
  | "verified human"
  | "impact regen"
  | "L2 believer"
  | "stablecoin savvy";

interface MintRequest {
  personalityType: PersonalityType;
  address: string;
}

// Validate Ethereum address format
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function POST(request: Request) {
  // Declare variables outside try block so they're accessible in catch block
  let personalityType: PersonalityType | undefined;
  let address: string | undefined;

  try {
    const body: MintRequest = await request.json();
    personalityType = body.personalityType;
    address = body.address;

    // Validate address format
    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Validate personality type
    const validPersonalities: PersonalityType[] = [
      "mini app maxi",
      "verified human",
      "impact regen",
      "L2 believer",
      "stablecoin savvy",
    ];

    if (!validPersonalities.includes(personalityType)) {
      return NextResponse.json(
        { error: "Invalid personality type" },
        { status: 400 }
      );
    }

    // Get event ID and secret code for personality
    const eventId = getEventIdForPersonality(personalityType);
    const secretCode = getSecretCodeForPersonality(personalityType);

    // Function to find and claim an unclaimed QR code
    const findAndClaimUnclaimedCode = async (): Promise<string> => {
      // Get all QR codes for the event
      let qrCodes = await getUnclaimedQRCodes(eventId, secretCode);

      // Filter to only unclaimed codes
      let unclaimedCodes = qrCodes.filter((code) => !code.claimed);

      // If no unclaimed codes, request more
      if (unclaimedCodes.length === 0) {
        await requestMoreCodes(eventId);
        // Wait a moment for codes to be generated
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Get codes again
        qrCodes = await getUnclaimedQRCodes(eventId, secretCode);
        unclaimedCodes = qrCodes.filter((code) => !code.claimed);
      }

      // If still no unclaimed codes after requesting more, throw error
      if (unclaimedCodes.length === 0) {
        throw new Error(
          "No unclaimed POAPs available. Please try again later."
        );
      }

      // Try each unclaimed code until we find one that's actually unclaimed
      for (const code of unclaimedCodes) {
        try {
          // Double-check the status
          const status = await checkQRCodeStatus(code.qr_hash);

          if (!status.claimed) {
            // This code is available, claim it
            try {
              if (!address) {
                throw new Error("Address is required");
              }
              await claimPOAP(code.qr_hash, address);
              return code.qr_hash;
            } catch (claimError) {
              // If claim fails with "already claimed", try next code
              if (
                claimError instanceof Error &&
                (claimError.message.includes("already claimed") ||
                  claimError.message.includes("QR Claim already claimed"))
              ) {
                continue;
              }
              // For other errors, rethrow
              throw claimError;
            }
          }
        } catch (error) {
          // If error is "already claimed", try next code
          if (
            error instanceof Error &&
            (error.message.includes("already claimed") ||
              error.message.includes("QR Claim already claimed"))
          ) {
            continue;
          }
          // For other errors, rethrow
          throw error;
        }
      }

      // If we've tried all codes and they're all claimed, request more and retry once
      await requestMoreCodes(eventId);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      qrCodes = await getUnclaimedQRCodes(eventId, secretCode);
      unclaimedCodes = qrCodes.filter((code) => !code.claimed);

      if (unclaimedCodes.length === 0) {
        throw new Error("All POAPs are claimed. Please try again later.");
      }

      // Try one more time with new codes
      for (const code of unclaimedCodes) {
        try {
          const status = await checkQRCodeStatus(code.qr_hash);
          if (!status.claimed) {
            try {
              if (!address) {
                throw new Error("Address is required");
              }
              await claimPOAP(code.qr_hash, address);
              return code.qr_hash;
            } catch (claimError) {
              if (
                claimError instanceof Error &&
                (claimError.message.includes("already claimed") ||
                  claimError.message.includes("QR Claim already claimed"))
              ) {
                continue;
              }
              throw claimError;
            }
          }
        } catch (error) {
          if (
            error instanceof Error &&
            (error.message.includes("already claimed") ||
              error.message.includes("QR Claim already claimed"))
          ) {
            continue;
          }
          throw error;
        }
      }

      throw new Error("All POAPs are claimed. Please try again later.");
    };

    // Find and claim an unclaimed code
    const qrHash = await findAndClaimUnclaimedCode();

    // Get the claim details to return full data
    const claimDetails = await checkQRCodeStatus(qrHash);

    return NextResponse.json(
      {
        success: true,
        message: "POAP minted successfully!",
        tokenId: claimDetails.id,
        eventId: claimDetails.event_id,
        claimedDate: claimDetails.claimed_date || claimDetails.created_date,
        qrHash: claimDetails.qr_hash,
        event: claimDetails.event
          ? {
              id: claimDetails.event.id,
              fancy_id: claimDetails.event.fancy_id,
              name: claimDetails.event.name,
              description: claimDetails.event.description,
              image_url: claimDetails.event.image_url,
              year: claimDetails.event.year,
              start_date: claimDetails.event.start_date,
              end_date: claimDetails.event.end_date,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POAP minting error:", error);

    // Extract specific error message
    let errorMessage = "Failed to mint POAP";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Check if this is an "already minted" error
    // Check various error message patterns
    const errorLower = errorMessage.toLowerCase();
    const isAlreadyMintedError =
      errorLower.includes("already minted") ||
      errorLower.includes("you already minted") ||
      errorLower.includes("you have already minted") ||
      errorLower.includes("user already has") ||
      errorLower.includes("already have") ||
      errorLower.includes("already claimed") ||
      errorLower.includes("drop");

    if (isAlreadyMintedError && personalityType && address) {
      // Try to find the existing POAP for this address and event
      try {
        const eventId = getEventIdForPersonality(personalityType);
        const existingToken = await scanAddressForEvent(address, eventId);

        if (existingToken) {
          // If token ID is missing, we can't proceed - return error
          if (!existingToken.id) {
            console.error(
              "[Mint API] Existing POAP found but token ID is missing!"
            );
            throw new Error("Found existing POAP but token ID is unavailable");
          }

          // Found existing POAP, return it in the same format as a successful mint
          // Fetch full token details to get the created date
          let claimedDate = existingToken.created;
          if (!claimedDate && existingToken.id) {
            try {
              const tokenDetails = await getTokenDetails(
                typeof existingToken.id === "string"
                  ? parseInt(existingToken.id, 10)
                  : existingToken.id
              );
              claimedDate = tokenDetails.created;
            } catch (tokenError) {
              console.warn(
                "[Mint API] Failed to fetch token details for created date:",
                tokenError
              );
              // Use current date as fallback
              claimedDate = new Date().toISOString();
            }
          }

          const eventDetails = await getEventDetails(eventId);

          const responseData = {
            success: true,
            message: "You already have this POAP!",
            tokenId:
              typeof existingToken.id === "string"
                ? parseInt(existingToken.id, 10)
                : existingToken.id,
            eventId: existingToken.event?.id || eventId,
            claimedDate: claimedDate || new Date().toISOString(),
            event: {
              id: eventDetails.id,
              fancy_id: eventDetails.fancy_id,
              name: eventDetails.name,
              description: eventDetails.description,
              image_url: eventDetails.image_url,
              year: eventDetails.year,
              start_date: eventDetails.start_date,
              end_date: eventDetails.end_date,
            },
            alreadyOwned: true,
          };

          return NextResponse.json(responseData, { status: 200 });
        }
        // If scan didn't find the POAP, fall through to return original error
      } catch (scanError) {
        // If scan fails, log but continue to return original error
        console.warn(
          "Failed to scan for existing POAP, returning original error:",
          scanError
        );
      }
    }

    // Determine status code based on error
    let statusCode = 500;
    if (errorMessage.includes("Invalid")) {
      statusCode = 400;
    } else if (
      errorMessage.includes("No unclaimed") ||
      errorMessage.includes("All POAPs")
    ) {
      statusCode = 404;
    }

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
