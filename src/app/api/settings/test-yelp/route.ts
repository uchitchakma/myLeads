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
      return NextResponse.json({ error: "Invalid API key format." }, { status: 400 });
    }

    const cleanKey = apiKey.trim();
    // Test key with Yelp Fusion API
    const testUrl = "https://api.yelp.com/v3/businesses/search?term=dental&location=Miami,%20FL&limit=1";
    const res = await fetch(testUrl, {
      headers: {
        "Authorization": `Bearer ${cleanKey}`,
        "Accept": "application/json"
      },
      signal: AbortSignal.timeout(8000)
    });

    if (res.ok) {
      const data = await res.json();
      const sample = data.businesses?.[0];
      return NextResponse.json({
        success: true,
        message: `Yelp Fusion API connected successfully! Sample verified business: "${sample?.name || "Local Listing"}" in Miami, FL.`
      });
    }

    const errData = await res.json().catch(() => ({}));
    return NextResponse.json({
      success: false,
      error: errData.error?.description || `Yelp API returned HTTP ${res.status}: ${res.statusText}`
    }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to connect to Yelp API servers."
    }, { status: 500 });
  }
}
