import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/google";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);

  // Store tokens in a secure httpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set("google_tokens", JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return NextResponse.redirect(new URL("/app", req.url));
}
