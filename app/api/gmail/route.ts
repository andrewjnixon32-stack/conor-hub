import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getClientFromCookies, getRecentEmails } from "@/lib/google";
import { extractTasksFromEmails } from "@/lib/claude";

export async function POST() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("google_tokens");
  if (!tokenCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const auth = await getClientFromCookies(tokenCookie.value, cookieStore);
  if (!auth) {
    return NextResponse.json({ error: "Invalid tokens" }, { status: 401 });
  }

  const emails = await getRecentEmails(auth, 20);
  const tasks = await extractTasksFromEmails(emails);
  return NextResponse.json(tasks);
}
