import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { findUserById, User } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "leadflow_ultra_secure_secret_key_2026";
const COOKIE_NAME = "leadflow_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "USER";
  name: string;
}

export function signSession(user: Pick<User, "id" | "email" | "role" | "name">): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
