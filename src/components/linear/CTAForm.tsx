"use client";

import { useState } from "react";
import { scannerOptions } from "@/data/content";

export default function CTAForm() {
  const [scanners, setScanners] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggle(s: string) {
    setScanners((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="request" className="linear-section">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 48,
          alignItems: "start",
        }}
      >
        <div>
          <div className="linear-label">// REQUEST INVITATION</div>
          <h2 className="linear-section-title">
            Ready to send your first digital case?
          </h2>
          <p className="linear-section-sub">
            Tell us a bit about your practice. We&apos;ll send your EasyRx
            invitation — most activations complete the same business day.
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 12,
            }}
          >
            {[
              "No setup fee. No per-case charge.",
              "Works with every major scanner.",
              "HIPAA-compliant by design.",
            ].map((t) => (
              <li
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "var(--l-text-secondary)",
                  fontSize: 15,
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(39,166,68,0.15)",
                    color: "var(--l-success)",
                    fontSize: 11,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="linear-form">
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  margin: "0 auto 20px",
                  borderRadius: 12,
                  background: "var(--l-brand)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                ✓
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 590,
                  marginBottom: 8,
                  color: "var(--l-text-primary)",
                  letterSpacing: "-0.4px",
                }}
              >
                Thanks — we&apos;ll be in touch.
              </h3>
              <p style={{ fontSize: 14, color: "var(--l-text-tertiary)" }}>
                Our team will verify your practice and send your invitation
                shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label className="linear-form-label" htmlFor="l-doctor">
                  Doctor&apos;s Name
                </label>
                <input
                  id="l-doctor"
                  type="text"
                  required
                  className="linear-form-input"
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="linear-form-label" htmlFor="l-practice">
                  Practice Name
                </label>
                <input
                  id="l-practice"
                  type="text"
                  required
                  className="linear-form-input"
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                <div>
                  <label className="linear-form-label" htmlFor="l-email">
                    Email
                  </label>
                  <input
                    id="l-email"
                    type="email"
                    required
                    className="linear-form-input"
                  />
                </div>
                <div>
                  <label className="linear-form-label" htmlFor="l-phone">
                    Phone
                  </label>
                  <input
                    id="l-phone"
                    type="tel"
                    required
                    className="linear-form-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label className="linear-form-label">Scanners in use</label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 6,
                  }}
                >
                  {scannerOptions.map((s) => {
                    const active = scanners.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggle(s)}
                        className={`linear-chip ${active ? "active" : ""}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="linear-btn-brand"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Send invitation request
              </button>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--l-text-quaternary)",
                  textAlign: "center",
                  marginTop: 14,
                }}
              >
                By submitting you agree to be contacted by ASO Hawaii.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
