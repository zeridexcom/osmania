import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "admin_session";
const TOKEN_TTL_SECONDS = 12 * 60 * 60;
const RESULT_VIEW_COOKIE = "result_view_token";
const RESULT_VIEW_TTL = 5 * 60; // 5 minutes

export interface AdminSession {
  username: string;
}

interface AdminTokenPayload extends AdminSession {
  sub: string;
  iat: number;
  exp: number;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_JWT_SECRET must be set and at least 32 characters long"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(
  payload: AdminSession
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + TOKEN_TTL_SECONDS)
    .setSubject(payload.username)
    .sign(getSecretKey());
}

export async function verifyAdminToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const username = (payload as Partial<AdminTokenPayload>).username;
    if (typeof username !== "string" || username.length === 0) {
      return null;
    }
    return { username };
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    const filler = Buffer.alloc(aBuf.length);
    timingSafeEqual(aBuf, filler);
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyAdminCredentials(
  username: string,
  password: string
): boolean {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) {
    return false;
  }
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function signResultViewToken(
  htno: string,
  examYear: number
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ htno, examYear })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + RESULT_VIEW_TTL)
    .sign(getSecretKey());
}

export async function verifyResultViewToken(
  token: string
): Promise<{ htno: string; examYear: number } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const h = (payload as Record<string, unknown>).htno;
    const ey = (payload as Record<string, unknown>).examYear;
    if (typeof h !== "string" || typeof ey !== "number") return null;
    return { htno: h, examYear: ey };
  } catch {
    return null;
  }
}

export async function setResultViewCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(RESULT_VIEW_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: RESULT_VIEW_TTL,
  });
}

export async function getResultViewCookie(): Promise<{
  htno: string;
  examYear: number;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(RESULT_VIEW_COOKIE)?.value;
  if (!token) return null;
  return verifyResultViewToken(token);
}
