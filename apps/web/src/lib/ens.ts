/**
 * Resolve ENS name from Ethereum address
 * Falls back to truncated address if ENS not available
 */
export async function resolveENS(address: string): Promise<string> {
  try {
    // Use public ENS resolver API
    const response = await fetch(
      `https://api.ensideas.com/ens/resolve?address=${address}`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.name) {
        return data.name;
      }
    }
  } catch (error) {
    console.warn("ENS resolution failed:", error);
  }

  // Fallback to truncated address
  return truncateAddress(address);
}

/**
 * Truncate Ethereum address for display
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format address for display (ENS or truncated)
 */
export async function formatAddress(address: string): Promise<string> {
  try {
    const ensName = await resolveENS(address);
    return ensName;
  } catch (error) {
    return truncateAddress(address);
  }
}
