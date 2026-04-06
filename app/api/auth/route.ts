import { NextResponse } from "next/server";
import { getOAuthClient, getAuthUrl } from "@/lib/google";

export async function GET() {
  const client = getOAuthClient();
  const url = getAuthUrl(client);
  return NextResponse.redirect(url);
}
