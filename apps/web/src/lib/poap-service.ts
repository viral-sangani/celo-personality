import { env } from "./env";

type PersonalityType =
  | "mini app maxi"
  | "verified human"
  | "impact regen"
  | "L2 believer"
  | "stablecoin savvy";

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface QRCode {
  qr_hash: string;
  claimed: boolean;
}

interface ClaimQRResponse {
  id: number;
  qr_hash: string;
  tx_hash: string | null;
  event_id: number;
  beneficiary: string;
  user_input: string;
  signer: string | null;
  claimed: boolean;
  claimed_date: string | null;
  created_date: string;
  is_active: boolean;
  secret: string;
  event?: {
    id: number;
    fancy_id: string;
    name: string;
    description: string;
    image_url: string;
    year: number;
    start_date: string;
    end_date: string;
  };
}

export interface EventDetails {
  id: number;
  fancy_id: string;
  name: string;
  description: string;
  location_type: string;
  city: string;
  country: string;
  channel: string;
  platform: string;
  event_url: string;
  image_url: string;
  animation_url: string;
  year: number;
  start_date: string;
  end_date: string;
  expiry_date: string;
  created_date: string;
  timezone: string;
  from_admin: boolean;
  virtual_event: boolean;
  event_template_id: number;
  private_event: boolean;
  drop_image?: {
    public_id: string;
    drop_id: number;
    gateways: Array<{
      image_id: string;
      filename: string;
      mime_type: string;
      url: string;
      type: string;
    }>;
  };
}

export interface TokenDetails {
  id: number;
  owner: string;
  event: {
    id: number;
    fancy_id: string;
    name: string;
    description: string;
    image_url: string;
    country: string;
    city: string;
    year: number;
    start_date: string;
    end_date: string;
  };
  created: string;
}

// Token cache
let cachedToken: {
  accessToken: string;
  expiresAt: number;
} | null = null;

const POAP_API_BASE = "https://api.poap.tech";
const POAP_AUTH_BASE = "https://auth.accounts.poap.xyz";

/**
 * Validate that POAP environment variables are properly configured
 * Throws an error if using build-time placeholders
 */
function validatePoapConfig() {
  if (
    env.POAP_API_KEY === "build-time-placeholder" ||
    env.POAP_CLIENT_ID === "build-time-placeholder" ||
    env.POAP_CLIENT_SECRET === "build-time-placeholder" ||
    env.POAP_EVENT_ID_MINI_APP_MAXI === 0 ||
    env.POAP_EVENT_ID_VERIFIED_HUMAN === 0 ||
    env.POAP_EVENT_ID_IMPACT_REGEN === 0 ||
    env.POAP_EVENT_ID_L2_BELIEVER === 0 ||
    env.POAP_EVENT_ID_STABLECOIN_SAVVY === 0 ||
    env.POAP_SECRET_CODE_MINI_APP_MAXI === "build-time-placeholder" ||
    env.POAP_SECRET_CODE_VERIFIED_HUMAN === "build-time-placeholder" ||
    env.POAP_SECRET_CODE_IMPACT_REGEN === "build-time-placeholder" ||
    env.POAP_SECRET_CODE_L2_BELIEVER === "build-time-placeholder" ||
    env.POAP_SECRET_CODE_STABLECOIN_SAVVY === "build-time-placeholder"
  ) {
    throw new Error(
      "POAP environment variables are not configured. Please set all POAP_* environment variables in your Vercel project settings."
    );
  }
}

/**
 * Get a valid access token, generating a new one if expired
 */
export async function getAccessToken(): Promise<string> {
  validatePoapConfig();

  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken;
  }

  // Generate new token
  const response = await fetch(`${POAP_AUTH_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audience: "https://api.poap.tech",
      grant_type: "client_credentials",
      client_id: env.POAP_CLIENT_ID,
      client_secret: env.POAP_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get POAP access token: ${response.status} ${errorText}`
    );
  }

  const data: AccessTokenResponse = await response.json();

  // Cache the token with expiry (subtract 60 seconds for safety margin)
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.accessToken;
}

/**
 * Get event ID for a personality type
 */
export function getEventIdForPersonality(
  personalityType: PersonalityType
): number {
  validatePoapConfig();

  const mapping: Record<PersonalityType, number> = {
    "mini app maxi": env.POAP_EVENT_ID_MINI_APP_MAXI,
    "verified human": env.POAP_EVENT_ID_VERIFIED_HUMAN,
    "impact regen": env.POAP_EVENT_ID_IMPACT_REGEN,
    "L2 believer": env.POAP_EVENT_ID_L2_BELIEVER,
    "stablecoin savvy": env.POAP_EVENT_ID_STABLECOIN_SAVVY,
  };

  return mapping[personalityType];
}

/**
 * Get secret code for a personality type
 */
export function getSecretCodeForPersonality(
  personalityType: PersonalityType
): string {
  validatePoapConfig();

  const mapping: Record<PersonalityType, string> = {
    "mini app maxi": env.POAP_SECRET_CODE_MINI_APP_MAXI,
    "verified human": env.POAP_SECRET_CODE_VERIFIED_HUMAN,
    "impact regen": env.POAP_SECRET_CODE_IMPACT_REGEN,
    "L2 believer": env.POAP_SECRET_CODE_L2_BELIEVER,
    "stablecoin savvy": env.POAP_SECRET_CODE_STABLECOIN_SAVVY,
  };

  return mapping[personalityType];
}

/**
 * Get unclaimed QR codes for an event
 * Based on POAP API docs: POST /event/{id}/qr-codes
 * Requires: Authorization Bearer token, X-API-Key header, and secret_code in body
 * Reference: https://documentation.poap.tech/reference/posteventqr-codes
 */
export async function getUnclaimedQRCodes(
  eventId: number,
  secretCode: string
): Promise<QRCode[]> {
  const accessToken = await getAccessToken();

  // According to POAP API docs, this endpoint requires:
  // - Authorization: Bearer <token>
  // - X-API-Key header
  // - secret_code in request body
  const response = await fetch(`${POAP_API_BASE}/event/${eventId}/qr-codes`, {
    method: "POST",
    headers: {
      "X-API-Key": env.POAP_API_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      secret_code: secretCode,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[POAP] Error response: ${errorText}`);

    // Parse error message for better formatting
    let errorMessage = "Failed to get QR codes";
    try {
      const errorObj = JSON.parse(errorText);
      errorMessage = errorObj.message || errorObj.error || errorText;
    } catch {
      errorMessage = errorText || "Unknown error";
    }

    throw new Error(errorMessage);
  }

  const data: QRCode[] = await response.json();
  return data;
}

/**
 * Check the status of a QR code
 */
export async function checkQRCodeStatus(
  qrHash: string
): Promise<ClaimQRResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${POAP_API_BASE}/actions/claim-qr?qr_hash=${qrHash}`,
    {
      method: "GET",
      headers: {
        "X-API-Key": env.POAP_API_KEY,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to check QR code status: ${response.status} ${errorText}`
    );
  }

  const data: ClaimQRResponse = await response.json();
  return data;
}

/**
 * Claim a POAP using a QR hash and address
 */
export async function claimPOAP(
  qrHash: string,
  address: string
): Promise<ClaimQRResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${POAP_API_BASE}/actions/claim-qr`, {
    method: "POST",
    headers: {
      "X-API-Key": env.POAP_API_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      qr_hash: qrHash,
      address: address,
      sendEmail: true,
      secret: "NOT_REQUIRED_ANYMORE",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(async () => ({
      message: await response.text(),
    }));
    throw new Error(
      errorData.message || `Failed to claim POAP: ${response.status}`
    );
  }

  const data: ClaimQRResponse = await response.json();
  return data;
}

/**
 * Request more mint codes for an event (25 codes)
 */
export async function requestMoreCodes(eventId: number): Promise<void> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${POAP_API_BASE}/redeem-requests`, {
    method: "POST",
    headers: {
      "X-API-Key": env.POAP_API_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      event_id: eventId,
      requested_codes: 25,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to request more codes: ${response.status} ${errorText}`
    );
  }
}

/**
 * Get full event details by event ID
 */
export async function getEventDetails(eventId: number): Promise<EventDetails> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${POAP_API_BASE}/events/id/${eventId}`, {
    method: "GET",
    headers: {
      "X-API-Key": env.POAP_API_KEY,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get event details: ${response.status} ${errorText}`
    );
  }

  const data: EventDetails = await response.json();
  return data;
}

/**
 * Get token details by token ID
 */
export async function getTokenDetails(tokenId: number): Promise<TokenDetails> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${POAP_API_BASE}/token/${tokenId}`, {
    method: "GET",
    headers: {
      "X-API-Key": env.POAP_API_KEY,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get token details: ${response.status} ${errorText}`
    );
  }

  const data: TokenDetails = await response.json();
  return data;
}

/**
 * Scan an address to find existing POAP for a specific event
 * Based on POAP API docs: GET /actions/scan/{address}/{eventid}
 * Requires: Authorization Bearer token, X-API-Key header
 * Returns the TokenDetails if found, null if not found or on error
 */
export async function scanAddressForEvent(
  address: string,
  eventId: number
): Promise<TokenDetails | null> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      `${POAP_API_BASE}/actions/scan/${address}/${eventId}`,
      {
        method: "GET",
        headers: {
          "X-API-Key": env.POAP_API_KEY,
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    // If not found (404) or no POAP exists, return null
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      // Log error but don't throw - return null to allow graceful fallback
      const errorText = await response.text();
      console.warn(
        `[POAP] Scan failed for address ${address}, event ${eventId}: ${response.status} ${errorText}`
      );
      return null;
    }

    const data = await response.json();

    // Handle different response structures
    // The scan endpoint might return an array or a single object
    let tokenData: TokenDetails | null = null;

    if (Array.isArray(data)) {
      // If it's an array, take the first token
      if (data.length > 0) {
        tokenData = data[0] as TokenDetails;
      }
    } else if (data && typeof data === "object") {
      // If it's a single object, use it directly
      tokenData = data as TokenDetails;
    }

    // Validate that we have the required fields
    if (tokenData && !tokenData.id) {
      console.warn(
        `[POAP] Scan returned data but missing id field:`,
        tokenData
      );
      // Try to find token ID in alternative fields
      if ((tokenData as any).tokenId) {
        tokenData.id = (tokenData as any).tokenId;
      } else if ((tokenData as any).token_id) {
        tokenData.id = (tokenData as any).token_id;
      } else {
        console.warn(`[POAP] Could not find token ID in scan response`);
        return null;
      }
    }

    return tokenData;
  } catch (error) {
    // Handle network errors or other exceptions gracefully
    console.warn(
      `[POAP] Error scanning address ${address} for event ${eventId}:`,
      error
    );
    return null;
  }
}
