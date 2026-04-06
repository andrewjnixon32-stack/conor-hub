import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { askClaude } from "@/lib/claude";
import { getClientFromCookies, createCalendarEvent } from "@/lib/google";

export async function POST(req: NextRequest) {
  const { notes } = await req.json();

  const prompt = `You are an assistant for Conor McKenna, a life insurance broker. Analyze these notes and extract two things:

1. Action items / to-dos (things he needs to do, follow up on, call, email, etc.)
2. Calendar events (meetings, appointments, calls with a specific date or time mentioned)

Today's date is ${new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" })}.

Return ONLY valid JSON in this exact format:
{
  "todos": [
    { "text": "the action item as a clear to-do" }
  ],
  "events": [
    { "title": "event title", "date": "YYYY-MM-DD", "time": "HH:MM" }
  ]
}

If there are no todos, return an empty array. If there are no events, return an empty array. Only include events that have a clear date or time mentioned. For events without a specific time, use "09:00".

Notes:
${notes}`;

  const text = await askClaude(prompt);
  let result: { todos: { text: string }[]; events: { title: string; date: string; time: string }[] } = { todos: [], events: [] };

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    result = jsonMatch ? JSON.parse(jsonMatch[0]) : { todos: [], events: [] };
  } catch {
    return NextResponse.json({ todos: [], events: [], eventsCreated: 0 });
  }

  // Create calendar events in Google Calendar if connected
  let eventsCreated = 0;
  if (result.events.length > 0) {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("google_tokens")?.value ?? null;
    const auth = await getClientFromCookies(tokenCookie);

    if (auth) {
      for (const event of result.events) {
        try {
          const startDateTime = `${event.date}T${event.time || "09:00"}:00`;
          // Default 1 hour duration
          const [h, m] = (event.time || "09:00").split(":").map(Number);
          const endH = String(h + 1).padStart(2, "0");
          const endDateTime = `${event.date}T${endH}:${String(m).padStart(2, "0")}:00`;

          await createCalendarEvent(auth, {
            summary: event.title,
            start: startDateTime,
            end: endDateTime,
          });
          eventsCreated++;
        } catch {
          // Skip events that fail
        }
      }
    }
  }

  return NextResponse.json({ ...result, eventsCreated });
}
