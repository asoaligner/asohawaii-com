"use client";

import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    q: "What is the typical turnaround time for ASO Hawaii products?",
    a: "Standard turnaround is 7–10 business days. Customized products and clear aligner cases may vary — contact us for a specific quote on complex cases.",
  },
  {
    q: "Do you offer pick-up and delivery?",
    a: "Yes — on Oahu, Monday–Friday, 1:00 pm – 4:00 pm (some remote areas excluded). For same-day pickup, submit your request by 12:00 pm (noon). Mainland practices can ship UPS/FedEx to our Honolulu address.",
  },
  {
    q: "Can I schedule a specific pick-up time?",
    a: "Pickups cannot be scheduled to a precise time. Our driver arrives at some point between 1:00 pm and 4:00 pm, depending on the route.",
  },
  {
    q: "How do I submit a prescription?",
    a: "Online through EasyRx — the easiest, most traceable method. If your practice isn't yet registered with EasyRx, contact the lab and we'll set up your account (typically same business day).",
  },
  {
    q: "What digital file types do you accept?",
    a: "STL files from all major intraoral scanners: iTero, 3Shape TRIOS, Medit, Primescan, DEXIS, and Shining 3D. Note: 3Shape must be sent via EasyRx or email (not 3Shape Communicate).",
  },
  {
    q: "Do you offer rush service?",
    a: "Yes, rush service is available on request. Additional fees may apply depending on case complexity and turnaround requested.",
  },
  {
    q: "What kinds of appliances do you fabricate?",
    a: "Plate-type retainers, banded appliances, lingual retainers, clear aligners (ASO Aligner), occlusal splints, MARPE / MSE, invisible retainers, flippers, night guards, positioners, study models, and IDB. If you don't see what you need listed — ask us.",
  },
  {
    q: "How do I contact ASO Hawaii?",
    a: "Phone 808-957-0111 · Email aso-digital@outlook.com · Hours Monday–Friday, 8:00 am – 4:30 pm HST (closed on federal holidays).",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <section className="supabase-hero" style={{ paddingBottom: 48 }}>
        <div className="sb-eyebrow-pill">▸ dental lab faq</div>
        <h1>
          Questions, <span className="sb-accent">answered.</span>
        </h1>
        <p>
          The most common questions practices ask us. Still not seeing yours?{" "}
          <Link
            href="/supabase/contact/"
            style={{
              color: "var(--sb-green)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Drop us a line
          </Link>
          .
        </p>
      </section>

      <section
        className="supabase-section-panel"
        style={{ paddingBottom: 80 }}
      >
        <div
          className="sb-inner"
          style={{ maxWidth: 920, margin: "0 auto" }}
        >
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="supabase-card"
                style={{ marginBottom: 12 }}
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
                    color: "inherit",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <span
                      style={{
                        fontFamily:
                          "'Source Code Pro', ui-monospace, monospace",
                        fontSize: 11,
                        color: "var(--sb-green)",
                        letterSpacing: 1.2,
                      }}
                    >
                      [{String(i + 1).padStart(2, "0")}]
                    </span>
                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: 500,
                        color: "var(--sb-off-white)",
                      }}
                    >
                      {f.q}
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: "'Source Code Pro', ui-monospace, monospace",
                      fontSize: 20,
                      color: "var(--sb-green)",
                      width: 20,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid var(--sb-dark-border)",
                      fontSize: 15,
                      lineHeight: 1.65,
                    }}
                  >
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}

          <div
            style={{
              marginTop: 48,
              padding: "40px 32px",
              background: "var(--sb-dark)",
              border: "1px solid var(--sb-dark-border)",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
                fontSize: 11,
                color: "var(--sb-green)",
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 14,
              }}
            >
              ▸ consultation_about_our_products
            </div>
            <p
              style={{
                fontSize: 20,
                color: "var(--sb-off-white)",
                maxWidth: 620,
                margin: "0 auto 24px",
                lineHeight: 1.5,
              }}
            >
              We are happy to explain how our orthodontic appliances can support
              your treatment. Please feel free to contact us.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/supabase/contact/"
                className="supabase-btn-green"
              >
                Contact us →
              </Link>
              <Link
                href="/supabase/get-a-quote/"
                className="supabase-btn-secondary"
              >
                Get a quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
