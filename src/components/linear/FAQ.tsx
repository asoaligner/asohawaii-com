"use client";

import { useState } from "react";
import { faqs } from "@/data/content";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="linear-section">
      <div className="linear-label">// FAQ</div>
      <h2 className="linear-section-title">Questions, answered.</h2>
      <p className="linear-section-sub">
        Still not sure? Call us at{" "}
        <a
          href="tel:8089570111"
          style={{ color: "var(--l-brand)", textDecoration: "none" }}
        >
          808-957-0111
        </a>
        .
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxWidth: 820,
        }}
      >
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="linear-card">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  padding: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 590,
                    color: "var(--l-text-primary)",
                    letterSpacing: "-0.2px",
                  }}
                >
                  {f.q}
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: isOpen
                      ? "var(--l-brand)"
                      : "var(--l-bg-panel)",
                    color: isOpen ? "#fff" : "var(--l-text-tertiary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    transition: "all 0.15s",
                  }}
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <p
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid var(--l-border-subtle)",
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
