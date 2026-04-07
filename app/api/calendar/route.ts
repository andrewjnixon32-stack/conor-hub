import { NextRequest, NextResponse } from "next/server";
import { getClientFromCookies, getUpcomingEvents } from "@/lib/google";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("google_tokens");
  if (!tokenCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const auth = await getClientFromCookies(tokenCookie.value, cookieStore);
  if (!auth) {
    return NextResponse.json({ error: "Invalid tokens" }, { status: 401 });
  }

  const events = await getUpcomingEvents(auth, 20);
  return NextResponse.json(events);
}
