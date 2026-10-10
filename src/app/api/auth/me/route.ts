import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findUserById } from "@/lib/db";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const user = findUserById(session.userId);
  if (!user || !user.isActive) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}
