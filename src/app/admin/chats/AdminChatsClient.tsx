"use client";

import { useEffect, useState } from "react";

type SessionRow = {
  id: string;
  created_at: number;
  user_name: string | null;
  user_clinic: string | null;
  user_country: string | null;
  message_count: number;
  first_question: string | null;
  last_message_at: number | null;
};

type MessageRow = {
  id: number;
  created_at: number;
  role: "user" | "assistant";
  content: string;
};

type SessionDetail = {
  id: string;
  created_at: number;
  user_name: string | null;
  user_clinic: string | null;
  user_country: string | null;
  user_agent_short: string | null;
};

/** Stash the password in sessionStorage so we don't re-prompt every call.
 * NOT localStorage — sessionStorage clears when browser is closed. */
const STORAGE_KEY = "aso-admin-pw";

export default function AdminChatsClient() {
  const [password, setPassword] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<{
    session: SessionDetail;
    messages: MessageRow[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [digestBusy, setDigestBusy] = useState(false);
  const [digestMsg, setDigestMsg] = useState<string | null>(null);

  // On mount: grab password from sessionStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) setPassword(saved);
    }
  }, []);

  // Once password is set, load the session list
  useEffect(() => {
    if (password) fetchSessions("");

  }, [password]);

  async function fetchSessions(q: string) {
    if (!password) return;
    setLoading(true);
    setError(null);
    try {
      const url = q
        ? `/api/admin/chats?q=${encodeURIComponent(q)}`
        : `/api/admin/chats`;
      const res = await fetch(url, {
        headers: { Authorization: basicAuth(password) },
      });
      if (res.status === 401) {
        setError("Wrong password.");
        setPassword(null);
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      if (!res.ok) {
        setError(`Error ${res.status}`);
        return;
      }
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function loadSession(id: string) {
    if (!password) return;
    setSelectedId(id);
    setSelectedDetail(null);
    try {
      const res = await fetch(`/api/admin/chats?session=${encodeURIComponent(id)}`, {
        headers: { Authorization: basicAuth(password) },
      });
      if (!res.ok) {
        setError(`Error loading session: ${res.status}`);
        return;
      }
      const data = await res.json();
      setSelectedDetail(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const input = form.querySelector("input") as HTMLInputElement | null;
    if (input) {
      const pw = input.value;
      sessionStorage.setItem(STORAGE_KEY, pw);
      setPassword(pw);
    }
  }

  async function sendDigestNow(hours: number) {
    if (!password || digestBusy) return;
    setDigestBusy(true);
    setDigestMsg(null);
    try {
      const res = await fetch(`/api/admin/daily-summary?hours=${hours}`, {
        method: "POST",
        headers: { Authorization: basicAuth(password) },
      });
      const data = (await res.json().catch(() => null)) as {
        sent?: boolean;
        sessionCount?: number;
        error?: string;
      } | null;
      if (!res.ok || !data || data.error) {
        setDigestMsg(`Failed: ${data?.error || res.status}`);
      } else {
        setDigestMsg(
          `Sent digest email for ${data.sessionCount ?? 0} session(s).`
        );
      }
    } catch (e) {
      setDigestMsg(e instanceof Error ? e.message : "Network error");
    } finally {
      setDigestBusy(false);
    }
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setPassword(null);
    setSessions([]);
    setSelectedId(null);
    setSelectedDetail(null);
  }

  // Login screen
  if (!password) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <h1 className="font-serif text-2xl text-navy mb-2">Chat log viewer</h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter the admin password to continue.
          </p>
          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-navy text-white font-medium hover:bg-navy-light transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl leading-tight">ASO Hawaii · Chat logs</h1>
          <p className="text-[11px] text-white/60">
            {sessions.length} session{sessions.length === 1 ? "" : "s"}
            {selectedId && " · viewing one"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => sendDigestNow(24)}
            disabled={digestBusy}
            className="text-[11px] bg-brandOrange text-white px-3 py-1.5 rounded-md hover:bg-[#EA6A0E] transition-colors disabled:opacity-50"
          >
            {digestBusy ? "Sending…" : "Email digest (24h)"}
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-[11px] text-white/70 hover:text-white underline underline-offset-2"
          >
            Sign out
          </button>
        </div>
      </div>
      {digestMsg && (
        <div className="bg-brandOrange/10 border-b border-brandOrange/30 px-6 py-2 text-sm text-navy">
          {digestMsg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: session list + search */}
        <aside className="lg:col-span-5 xl:col-span-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchSessions(query);
            }}
            className="flex gap-2 mb-4"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, clinic, message text…"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-navy text-white hover:bg-navy-light"
            >
              Search
            </button>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  fetchSessions("");
                }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-navy"
              >
                Clear
              </button>
            )}
          </form>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
          {loading && (
            <div className="text-gray-400 text-sm px-3 py-4">Loading…</div>
          )}

          <div className="flex flex-col gap-2">
            {sessions.length === 0 && !loading && (
              <div className="text-gray-400 text-sm px-3 py-8 text-center bg-white border border-gray-200 rounded-xl">
                No chat sessions yet.
              </div>
            )}
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => loadSession(s.id)}
                className={`text-left px-4 py-3 rounded-xl border transition-colors bg-white ${
                  selectedId === s.id
                    ? "border-brandOrange ring-2 ring-brandOrange/20"
                    : "border-gray-200 hover:border-navy/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-navy text-sm">
                    {s.user_name || s.user_clinic || "(anonymous)"}
                    {s.user_clinic && s.user_name && (
                      <span className="text-gray-400 font-normal">
                        {" · "}
                        {s.user_clinic}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 shrink-0">
                    {formatTime(s.created_at)}
                  </div>
                </div>
                {s.first_question && (
                  <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                    {s.first_question}
                  </div>
                )}
                <div className="mt-1 text-[10px] text-gray-400 flex gap-3">
                  <span>{s.message_count} msgs</span>
                  {s.user_country && <span>📍 {s.user_country}</span>}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Right column: session detail */}
        <section className="lg:col-span-7 xl:col-span-8">
          {!selectedId ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
              Select a session to view the full transcript.
            </div>
          ) : !selectedDetail ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
              Loading…
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="font-serif text-lg text-navy">
                  {selectedDetail.session.user_name || "Anonymous user"}
                  {selectedDetail.session.user_clinic && (
                    <span className="text-gray-500 font-normal">
                      {" · "}
                      {selectedDetail.session.user_clinic}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {formatFull(selectedDetail.session.created_at)}
                  {selectedDetail.session.user_country && (
                    <> · {selectedDetail.session.user_country}</>
                  )}
                  {selectedDetail.session.user_agent_short && (
                    <>
                      {" · "}
                      <span className="text-gray-300">
                        {browserName(selectedDetail.session.user_agent_short)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="px-6 py-5 flex flex-col gap-4">
                {selectedDetail.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] ${
                      m.role === "user" ? "self-end" : "self-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-navy text-white rounded-br-sm"
                          : "bg-gray-100 text-navy rounded-bl-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 px-2">
                      {m.role === "user" ? "User" : "AI"} ·{" "}
                      {formatTime(m.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function basicAuth(password: string): string {
  return "Basic " + btoa("admin:" + password);
}

function formatTime(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFull(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function browserName(ua: string): string {
  if (/Edge?\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Unknown browser";
}
