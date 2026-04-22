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
    <section id="request" className="apple-section-gray">
      <div className="apple-inner" style={{ maxWidth: 720 }}>
        <div className="apple-section-label">Request Invitation</div>
        <h2 className="apple-section-title">
          Ready to send your first digital case?
        </h2>
        <p className="apple-section-sub">
          Tell us a bit about your practice. We&apos;ll send your EasyRx
          invitation — most activations complete the same business day.
        </p>

        {submitted ? (
          <div
            className="apple-card"
            style={{ background: "#fff", textAlign: "center", padding: 48 }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "var(--a-blue)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              Thanks — we&apos;ll be in touch.
            </h3>
            <p
              style={{
                fontSize: 17,
                color: "var(--a-gray-80)",
                maxWidth: 400,
                margin: "0 auto",
              }}
            >
              Our team will verify your practice and send your EasyRx invitation
              shortly.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="apple-form"
            style={{
              background: "#fff",
              padding: 40,
              borderRadius: 18,
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div className="apple-form-group">
              <label className="apple-form-label" htmlFor="a-doctor">
                Doctor&apos;s Name
              </label>
              <input
                id="a-doctor"
                type="text"
                required
                className="apple-form-input"
              />
            </div>
            <div className="apple-form-group">
              <label className="apple-form-label" htmlFor="a-practice">
                Practice Name
              </label>
              <input
                id="a-practice"
                type="text"
                required
                className="apple-form-input"
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div className="apple-form-group">
                <label className="apple-form-label" htmlFor="a-email">
                  Email
                </label>
                <input
                  id="a-email"
                  type="email"
                  required
                  className="apple-form-input"
                />
              </div>
              <div className="apple-form-group">
                <label className="apple-form-label" htmlFor="a-phone">
                  Phone
                </label>
                <input
                  id="a-phone"
                  type="tel"
                  required
                  className="apple-form-input"
                />
              </div>
            </div>

            <div className="apple-form-group">
              <label className="apple-form-label">Scanners in use</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {scannerOptions.map((s) => {
                  const active = scanners.includes(s);
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggle(s)}
                      className={`apple-chip ${active ? "active" : ""}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="apple-btn-blue"
              style={{ width: "100%", marginTop: 8 }}
            >
              Send my invitation request
            </button>
            <p
              style={{
                fontSize: 12,
                color: "var(--a-gray-48)",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              By submitting you agree to be contacted by ASO International
              Hawaii regarding EasyRx setup.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
