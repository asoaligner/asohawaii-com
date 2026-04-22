"use client";

import { useState } from "react";
import { faqs } from "@/data/content";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="apple-section">
      <div className="apple-section-label">FAQ</div>
      <h2 className="apple-section-title">Questions, answered.</h2>

      <div
        style={{
          marginTop: 32,
          textAlign: "left",
          borderTop: "1px solid var(--a-border)",
        }}
      >
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              style={{ borderBottom: "1px solid var(--a-border)" }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 24,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    color: "var(--a-black)",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {f.q}
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: isOpen ? "var(--a-blue)" : "var(--a-light-gray)",
                    color: isOpen ? "#fff" : "var(--a-black)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 400,
                    transition: "all 0.2s",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                  }}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <p
                  style={{
                    paddingBottom: 24,
                    fontSize: 15,
                    color: "var(--a-gray-80)",
                    lineHeight: 1.55,
                    maxWidth: 680,
                  }}
                >
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
