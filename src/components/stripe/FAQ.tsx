"use client";

import { useState } from "react";
import { faqs } from "@/data/content";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="stripe-section">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 48,
          alignItems: "start",
        }}
      >
        <div>
          <div className="stripe-label">FAQ</div>
          <h2 className="stripe-section-title">Questions, answered.</h2>
          <p className="stripe-section-sub" style={{ marginBottom: 0 }}>
            Still not sure? Call us at{" "}
            <a
              href="tel:8089570111"
              style={{ color: "var(--s-purple)", textDecoration: "underline" }}
            >
              808-957-0111
            </a>
            .
          </p>
        </div>

        <div>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="stripe-card"
                style={{ marginBottom: 10 }}
              >
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
                      fontWeight: 500,
                      color: "var(--s-navy)",
                    }}
                  >
                    {f.q}
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      fontFamily: "'Source Code Pro', ui-monospace, monospace",
                      fontSize: 18,
                      color: "var(--s-purple)",
                      width: 24,
                      textAlign: "center",
                    }}
                  >
                    {isOpen ? "-" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--s-border)" }}>
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
