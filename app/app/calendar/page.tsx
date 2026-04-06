"use client";

import { useEffect, useState } from "react";

interface CalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  location?: string;
  htmlLink?: string;
}

function formatDateTime(dt?: { dateTime?: string; date?: string }) {
  if (!dt) return "—";
  const raw = dt.dateTime ?? dt.date;
  if (!raw) return "—";
  const d = new Date(raw);
  if (dt.date) return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function dayLabel(dt?: { dateTime?: string; date?: string }) {
  if (!dt) return "";
  const raw = dt.dateTime ?? dt.date;
  if (!raw) return "";
  const d = new Date(raw);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return "";
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setEvents(data);
      })
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
        <p className="text-sm text-gray-500 mt-1">Upcoming events from Google Calendar.</p>
      </div>

      {loading && (
        <div className="text-sm text-gray-400">Loading events…</div>
      )}

      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl p-4">
          {error} — make sure Google is connected.
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-400">
          No upcoming events found.
        </div>
      )}

      <div className="space-y-3">
        {events.map((event) => {
          const label = dayLabel(event.start);
          return (
            <div key={event.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex gap-4">
              <div className="w-1 rounded-full bg-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{event.summary ?? "(No title)"}</p>
                  {label && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                      {label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatDateTime(event.start)}</p>
                {event.location && (
                  <p className="text-xs text-gray-400 mt-0.5">{event.location}</p>
                )}
                {event.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
