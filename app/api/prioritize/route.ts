import { NextRequest, NextResponse } from "next/server";
import { prioritizeTodos } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const { todos } = await req.json();
  const ranked = await prioritizeTodos(todos);
  return NextResponse.json(ranked);
}
