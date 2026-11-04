import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, findUserByEmail, createUser } from "@/lib/db";
import { signSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = "https://myleads.ucdreams.com";

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error || "Google login was cancelled.")}`);
  }

  const settings = getSystemSettings();
  const google = settings.googleAuth;

  if (!google.enabled || !google.clientId || !google.clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?error=GoogleAuthNotConfigured`);
  }

  try {
    const redirectUri = google.redirectUri || `${baseUrl}/api/auth/google/callback`;

    // 1. Exchange authorization code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: google.clientId,
        client_secret: google.clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || "Failed to exchange token with Google");
    }

    // 2. Fetch user profile
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const profile = await userinfoRes.json();
    if (!profile.email) {
      throw new Error("Unable to retrieve email from Google profile");
    }

    // 3. Find or create user
    let user = findUserByEmail(profile.email);
    if (!user) {
      if (!settings.security?.allowPublicRegistration) {
        return NextResponse.redirect(`${baseUrl}/login?error=RegistrationClosed`);
      }

      const randomPass = "GAuth_" + Math.random().toString(36).substring(2, 12) + "!";
      user = createUser(profile.name || profile.email.split("@")[0], profile.email, randomPass, "USER");
    }

    if (!user.isActive) {
      return NextResponse.redirect(`${baseUrl}/login?error=AccountDeactivated`);
    }

    // 4. Set session cookie and redirect to dashboard
    const token = signSession(user);
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (err: any) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(err.message || "Google authentication failed")}`);
  }
}
