"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "👋 Aloha! I'm the ASO Hawaii assistant. Ask me about turnaround times, scanner setup, products, or pickup — happy to help.",
};

const SUGGESTED_PROMPTS = [
  "What's the typical turnaround time?",
  "How do I submit a case from iTero?",
  "Tell me about ASO ALIGNER.",
  "Can I schedule a pickup on Oahu?",
];

/** Generate a short UUID-ish id for session tracking. Server only cares
 * that it's stable per browser session and distinct across users. */
function generateSessionId(): string {
  // crypto.randomUUID is available in all modern browsers.
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userClinic, setUserClinic] = useState("");
  const [identityProvided, setIdentityProvided] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate a session ID once when the widget first opens.
  useEffect(() => {
    if (open && !sessionId) {
      setSessionId(generateSessionId());
    }
  }, [open, sessionId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userName: userName.trim() || undefined,
          userClinic: userClinic.trim() || undefined,
          messages: nextMessages.filter(
            (m, i) => !(i === 0 && m === WELCOME_MESSAGE)
          ),
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { reply?: string; error?: string }
        | null;

      if (!res.ok || !data || data.error) {
        const errMsg =
          data?.error ||
          "Something went wrong. Please email asohawaii@hotmail.com or call 808-957-0111.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errMsg },
        ]);
      } else if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply! },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Network error — can't reach the assistant right now. Please email asohawaii@hotmail.com or call 808-957-0111.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {/* Floating bubble — shown when panel closed */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat assistant"
          className="fixed bottom-4 right-4 z-[150] inline-flex items-center gap-2 bg-brandOrange text-white px-5 py-3 rounded-full text-sm font-medium shadow-[0_12px_32px_-4px_rgba(249,115,22,0.45),0_2px_8px_rgba(0,0,0,0.15)] hover:shadow-[0_14px_40px_-4px_rgba(249,115,22,0.55),0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all md:bottom-6 md:right-6"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
          Chat with us
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="ASO Hawaii chat assistant"
          className="fixed bottom-4 right-4 z-[150] w-[min(calc(100vw-2rem),380px)] h-[min(calc(100dvh-2rem),600px)] bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(15,41,66,0.35)] border border-gray-200 flex flex-col overflow-hidden md:bottom-6 md:right-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-navy text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brandOrange/20 text-brandOrange flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </div>
              <div>
                <div className="font-serif text-base leading-tight">
                  ASO Hawaii
                </div>
                <div className="text-[11px] text-white/60 tracking-wide">
                  AI assistant · instant reply
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/60"
          >
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role} content={m.content} />
              ))}
              {sending && (
                <div className="inline-flex items-center gap-1 self-start text-gray-400 text-sm px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[pulse_1.2s_ease-in-out_infinite]" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[pulse_1.2s_ease-in-out_infinite]"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[pulse_1.2s_ease-in-out_infinite]"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              )}

              {/* Suggested prompts — only before any user message */}
              {messages.length === 1 && !sending && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {SUGGESTED_PROMPTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      disabled={sending}
                      className="self-start text-left text-[13px] px-3 py-2 rounded-full border border-brandOrange/30 text-navy hover:border-brandOrange hover:bg-brandOrange/5 transition-colors disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional identity form — collapsed by default; opens on click */}
          {!identityProvided && (
            <details className="px-4 py-2 bg-white border-t border-gray-100 text-[12px]">
              <summary className="cursor-pointer text-gray-500 hover:text-navy transition-colors select-none">
                <span className="font-medium text-navy">Optional:</span>{" "}
                tell us who you are{" "}
                <span className="text-gray-400">
                  (helps us follow up)
                </span>
              </summary>
              <div className="pt-3 pb-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 text-navy placeholder:text-gray-400"
                />
                <input
                  type="text"
                  value={userClinic}
                  onChange={(e) => setUserClinic(e.target.value)}
                  placeholder="Clinic / practice name (optional)"
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 text-navy placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setIdentityProvided(true)}
                  className="self-end text-[12px] font-medium text-brandOrange hover:underline"
                >
                  Save
                </button>
              </div>
            </details>
          )}

          {/* Input */}
          <form
            onSubmit={onSubmit}
            className="px-3 py-3 bg-white border-t border-gray-100 flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Type your question…"
              rows={1}
              disabled={sending}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 disabled:opacity-60 max-h-32"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="shrink-0 w-10 h-10 rounded-full bg-brandOrange text-white flex items-center justify-center hover:bg-[#EA6A0E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>

          {/* Footer disclaimer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 text-center">
            AI-assisted · for case-specific questions{" "}
            <a
              href="mailto:asohawaii@hotmail.com"
              className="text-navy hover:text-brandOrange underline underline-offset-2"
            >
              email us
            </a>{" "}
            or call{" "}
            <a
              href="tel:8089570111"
              className="text-navy hover:text-brandOrange underline underline-offset-2"
            >
              808-957-0111
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ role, content }: { role: Message["role"]; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`max-w-[85%] ${isUser ? "self-end" : "self-start"}`}>
      <div
        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-navy text-white rounded-br-sm"
            : "bg-white text-navy border border-gray-200 rounded-bl-sm"
        }`}
      >
        {renderRichText(content)}
      </div>
    </div>
  );
}

function renderRichText(s: string): React.ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return linkify(part, i);
  });
}

function linkify(text: string, key: number): React.ReactNode {
  const re = /(https?:\/\/\S+|\/[a-z][a-z0-9/_-]*)/gi;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const href = m[0];
    out.push(
      <a
        key={`l-${key}-${idx++}`}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-brandOrange hover:underline underline-offset-2 break-words"
      >
        {href}
      </a>
    );
    last = m.index + href.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <span key={`k-${key}`}>{out.length ? out : text}</span>;
}
