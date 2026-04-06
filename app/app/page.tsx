"use client";

import TodoList, { TodoItem } from "@/components/TodoList";
import { useState, useEffect } from "react";

const STORAGE_KEY = "hub_todos";
const LAST_SCAN_KEY = "hub_last_gmail_scan";
const NOTES_KEY = "hub_notes";

function loadTodos(): TodoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos(todos: TodoItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function shouldAutoScan(): boolean {
  try {
    const now = new Date();

    // Get current time in CST/CDT
    const cstFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = cstFormatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");

    // Only auto-scan at or after 7am CST
    if (hour < 7) return false;

    const last = localStorage.getItem(LAST_SCAN_KEY);
    if (!last) return true;

    // Get today's date string in CST
    const todayCST = new Date().toLocaleDateString("en-US", {
      timeZone: "America/Chicago",
    });
    const lastScanDateCST = new Date(last).toLocaleDateString("en-US", {
      timeZone: "America/Chicago",
    });

    // Scan if last scan was on a previous day
    return lastScanDateCST !== todayCST;
  } catch {
    return false;
  }
}

export default function DashboardPage() {
  const [todos, setTodosState] = useState<TodoItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const [notes, setNotesState] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<{ todos: { text: string }[]; events: { title: string; date: string; time: string }[]; eventsCreated?: number } | null>(null);

  function setTodos(updater: React.SetStateAction<TodoItem[]>) {
    setTodosState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveTodos(next);
      return next;
    });
  }

  useEffect(() => {
    const saved = loadTodos();
    setTodosState(saved);
    const savedNotes = localStorage.getItem(NOTES_KEY) ?? "";
    setNotesState(savedNotes);

    if (shouldAutoScan()) {
      runScan();
    }
  }, []);

  function setNotes(val: string) {
    setNotesState(val);
    localStorage.setItem(NOTES_KEY, val);
  }

  async function analyzeNotes() {
    if (!notes.trim()) return;
    setAnalyzing(true);
    setAnalyzeResult(null);
    try {
      const res = await fetch("/api/analyze-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const result = await res.json();
      setAnalyzeResult(result);
      if (result.todos?.length > 0) {
        addAnalyzedTodos(result.todos);
      }
      setNotes("");
    } catch {
      setAnalyzeResult({ todos: [], events: [] });
    } finally {
      setAnalyzing(false);
    }
  }

  function addAnalyzedTodos(items: { text: string }[]) {
    const newTodos: TodoItem[] = items.map((t) => ({
      id: crypto.randomUUID(),
      text: t.text,
      tab: "Notes",
      done: false,
    }));
    setTodos((prev) => [...newTodos, ...prev]);
  }

  async function runScan() {
    setScanning(true);
    setScanMsg("");
    try {
      const res = await fetch("/api/gmail", { method: "POST" });
      const tasks: { id: string; text: string; from: string; subject: string }[] =
        await res.json();

      localStorage.setItem(LAST_SCAN_KEY, new Date().toISOString());

      if (!Array.isArray(tasks) || tasks.length === 0) {
        setScanMsg("No action items found in recent emails.");
        return;
      }

      const newTodos: TodoItem[] = tasks.map((t) => ({
        id: crypto.randomUUID(),
        text: t.text,
        tab: "Gmail",
        done: false,
      }));

      setTodos((prev) => [...newTodos, ...prev]);
      setScanMsg(`Found ${newTodos.length} action item${newTodos.length === 1 ? "" : "s"} from Gmail.`);
    } catch {
      setScanMsg("Failed to scan Gmail.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            All your to-dos in one place, AI-prioritized.
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {scanning ? "Scanning Gmail…" : "Scan Gmail for Tasks"}
        </button>
      </div>

      {scanMsg && (
        <p className="text-sm text-gray-500">{scanMsg}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Open Follow-ups", value: "—" },
          { label: "Commissions This Month", value: "—" },
          { label: "Upcoming Appointments", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Notes</h3>
          <button
            onClick={analyzeNotes}
            disabled={analyzing || !notes.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {analyzing ? "Analyzing…" : "Analyze with AI"}
          </button>
        </div>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          rows={6}
          placeholder="Jot down anything — meetings, follow-ups, ideas. Hit Analyze to extract tasks and calendar events."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {analyzeResult && (
          <div className="space-y-4">
            {analyzeResult.todos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Added to Work List ({analyzeResult.todos.length})</p>
                <ul className="space-y-1">
                  {analyzeResult.todos.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      <span className="mt-0.5 text-blue-400">•</span>
                      {t.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analyzeResult.events.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  Added to Google Calendar ({analyzeResult.eventsCreated ?? 0}/{analyzeResult.events.length})
                </p>
                <ul className="space-y-1">
                  {analyzeResult.events.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                      <span className="mt-0.5 text-green-400">•</span>
                      <span><span className="font-medium">{e.title}</span> — {e.date}{e.time ? ` at ${e.time}` : ""}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analyzeResult.todos.length === 0 && analyzeResult.events.length === 0 && (
              <p className="text-sm text-gray-400">No tasks or events found in the notes.</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Work List
        </h3>
        <TodoList todos={todos} setTodos={setTodos} />
      </div>
    </div>
  );
}
