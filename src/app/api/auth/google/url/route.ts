import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/db";

export async function GET() {
  const settings = getSystemSettings();
  const google = settings.googleAuth;

  if (!google.enabled || !google.clientId) {
    return NextResponse.json({ enabled: false });
  }

  const redirectUri = google.redirectUri || "https://myleads.ucdreams.com/api/auth/google/callback";
  const params = new URLSearchParams({
    client_id: google.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    access_type: "offline",
    prompt: "select_account"
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.json({ enabled: true, url: authUrl });
}
