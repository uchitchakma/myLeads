import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findUserById, updateUser } from "@/lib/db";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = findUserById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      googleMapsApiKey: user.googleMapsApiKey || "",
      yelpApiKey: user.yelpApiKey || "",
      geminiApiKey: user.geminiApiKey || "",
      smtpConfig: user.smtpConfig || {
        host: "smtp.gmail.com",
        port: 587,
        user: "",
        pass: "",
        senderName: user.name,
        senderEmail: user.email
      }
    }
  });
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, googleMapsApiKey, yelpApiKey, geminiApiKey, smtpConfig } = await req.json();

    const updated = updateUser(session.userId, {
      name: name?.trim(),
      googleMapsApiKey: googleMapsApiKey?.trim() || undefined,
      yelpApiKey: yelpApiKey?.trim() || undefined,
      geminiApiKey: geminiApiKey?.trim() || undefined,
      smtpConfig: smtpConfig || undefined
    });

    return NextResponse.json({
      success: true,
      message: "Personal settings and API keys updated successfully",
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        googleMapsApiKey: updated.googleMapsApiKey || "",
        yelpApiKey: updated.yelpApiKey || "",
        geminiApiKey: updated.geminiApiKey || "",
        smtpConfig: updated.smtpConfig
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 400 });
  }
}
