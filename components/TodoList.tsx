"use client";

import { useState } from "react";

export interface TodoItem {
  id: string;
  text: string;
  tab: string;
  done: boolean;
  priority?: number;
  reason?: string;
}

interface Props {
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
}

export default function TodoList({ todos, setTodos }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  function addTodo() {
    if (!input.trim()) return;
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: input.trim(),
      tab: "Dashboard",
      done: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInput("");
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  async function prioritize() {
    setLoading(true);
    try {
      const res = await fetch("/api/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todos }),
      });
      const ranked: { id: string; priority: number; reason: string }[] =
        await res.json();
      setTodos((prev) =>
        prev
          .map((t) => {
            const r = ranked.find((r) => r.id === t.id);
            return r ? { ...t, priority: r.priority, reason: r.reason } : t;
          })
          .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
      );
    } finally {
      setLoading(false);
    }
  }

  const pending = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a to-do..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Add
        </button>
        <button
          onClick={prioritize}
          disabled={loading || pending.length === 0}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Prioritizing…" : "AI Prioritize"}
        </button>
      </div>

      <ul className="space-y-2">
        {pending.map((todo) => (
          <li
            key={todo.id}
            className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg"
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">{todo.text}</p>
              {todo.priority !== undefined && (
                <p className="text-xs text-purple-600 mt-0.5">
                  #{todo.priority} · {todo.reason}
                </p>
              )}
              <span className="text-xs text-gray-400">{todo.tab}</span>
            </div>
            <button
              onClick={() => removeTodo(todo.id)}
              className="text-gray-300 hover:text-red-400 text-lg leading-none"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {done.length > 0 && (
        <details className="text-sm text-gray-400">
          <summary className="cursor-pointer select-none">
            {done.length} completed
          </summary>
          <ul className="mt-2 space-y-1">
            {done.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 p-2 opacity-50"
              >
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleTodo(todo.id)}
                  className="h-4 w-4"
                />
                <span className="line-through text-xs">{todo.text}</span>
                <button
                  onClick={() => removeTodo(todo.id)}
                  className="ml-auto text-gray-300 hover:text-red-400"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
