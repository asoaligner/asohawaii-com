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
    <section id="request" className="stripe-section-navy">
      <div className="stripe-inner">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 56,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 56,
              alignItems: "start",
            }}
          >
            <div>
              <div className="stripe-label">REQUEST INVITATION</div>
              <h2 className="stripe-section-title">
                Ready to send your first digital case?
              </h2>
              <p className="stripe-section-sub">
                Tell us a bit about your practice. We&apos;ll send your EasyRx
                invitation — most activations complete the same business day.
              </p>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "32px 0 0",
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
                      color: "rgba(255,255,255,0.85)",
                      fontSize: 15,
                      fontWeight: 300,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        background: "rgba(21,190,83,0.25)",
                        border: "1px solid rgba(21,190,83,0.5)",
                        color: "var(--s-success)",
                        fontSize: 12,
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

            <div className="stripe-form">
              {submitted ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      margin: "0 auto 20px",
                      borderRadius: 4,
                      background: "var(--s-purple)",
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
                      fontWeight: 500,
                      marginBottom: 8,
                      color: "var(--s-navy)",
                    }}
                  >
                    Thanks — we&apos;ll be in touch.
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--s-slate)",
                      fontWeight: 400,
                    }}
                  >
                    Our team will verify your practice and send your invitation
                    shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 20 }}>
                    <label className="stripe-form-label" htmlFor="s-doctor">
                      Doctor&apos;s Name
                    </label>
                    <input
                      id="s-doctor"
                      type="text"
                      required
                      className="stripe-form-input"
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label className="stripe-form-label" htmlFor="s-practice">
                      Practice Name
                    </label>
                    <input
                      id="s-practice"
                      type="text"
                      required
                      className="stripe-form-input"
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <label className="stripe-form-label" htmlFor="s-email">
                        Email
                      </label>
                      <input
                        id="s-email"
                        type="email"
                        required
                        className="stripe-form-input"
                      />
                    </div>
                    <div>
                      <label className="stripe-form-label" htmlFor="s-phone">
                        Phone
                      </label>
                      <input
                        id="s-phone"
                        type="tel"
                        required
                        className="stripe-form-input"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label className="stripe-form-label">Scanners in use</label>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      {scannerOptions.map((s) => {
                        const active = scanners.includes(s);
                        return (
                          <button
                            type="button"
                            key={s}
                            onClick={() => toggle(s)}
                            className={`stripe-chip ${active ? "active" : ""}`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="stripe-btn-purple"
                    style={{ width: "100%" }}
                  >
                    Send invitation request &rarr;
                  </button>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--s-slate)",
                      textAlign: "center",
                      marginTop: 14,
                      fontWeight: 400,
                    }}
                  >
                    By submitting you agree to be contacted by ASO Hawaii.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
