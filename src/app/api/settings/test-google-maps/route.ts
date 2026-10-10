import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { apiKey } = await req.json();
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 15) {
      return NextResponse.json({ 
        success: false, 
        error: "Please enter a valid Google Cloud API Key (starts with AIzaSy...)" 
      }, { status: 400 });
    }

    const testUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=dental+in+Miami&key=${apiKey.trim()}`;
    const res = await fetch(testUrl, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();

    if (data.status === "OK" || data.status === "ZERO_RESULTS") {
      return NextResponse.json({
        success: true,
        message: "✅ Google Places API Connected Successfully! Your key is verified and active with Google Cloud."
      });
    }

    // Google API returned a specific error status
    let errorMessage = data.error_message || `Google API returned status: ${data.status}`;
    if (data.status === "REQUEST_DENIED") {
      errorMessage += ". Check that 'Places API' (or Places API New) is Enabled and Application Restrictions is set to 'None'.";
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to reach Google Places API servers." 
    }, { status: 500 });
  }
}
