import { getTokenDetails } from "@/lib/poap-service";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId: tokenIdParam } = await params;
    const tokenId = parseInt(tokenIdParam, 10);

    if (isNaN(tokenId)) {
      return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
    }

    const tokenDetails = await getTokenDetails(tokenId);

    return NextResponse.json(tokenDetails, { status: 200 });
  } catch (error) {
    console.error("Error fetching token details:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch token details";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
