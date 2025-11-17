import { getEventDetails } from "@/lib/poap-service";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId: eventIdParam } = await params;
    const eventId = parseInt(eventIdParam, 10);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const eventDetails = await getEventDetails(eventId);

    return NextResponse.json(eventDetails, { status: 200 });
  } catch (error) {
    console.error("Error fetching event details:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch event details";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
