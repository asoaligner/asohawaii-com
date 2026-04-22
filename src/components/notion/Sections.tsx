"use client";

import { useState } from "react";
import {
  benefits,
  company,
  faqs,
  gettingStartedSteps,
  heroCopy,
  howToSteps,
  scannerOptions,
  scanners,
} from "@/data/content";

const navLinks = [
  { label: "Why EasyRx", href: "#why" },
  { label: "Getting Started", href: "#getting-started" },
  { label: "How to Submit", href: "#how-to" },
  { label: "Scanners", href: "#scanners" },
  { label: "FAQ", href: "#faq" },
  { label: "Support", href: "#support" },
];

export function Nav() {
  return (
    <nav className="notion-nav">
      <a href="#" className="notion-nav-brand">
        <span style={{ fontSize: 22 }}>◼</span> ASO Hawaii
      </a>
      <ul
        style={{
          display: "flex",
          gap: 24,
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {navLinks.map((l) => (
          <li key={l.href} className="hidden md:block">
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
      <a href="#request" className="notion-nav-cta">
        Request invitation
      </a>
    </nav>
  );
}

export function Hero() {
  return (
    <section className="notion-hero">
      <div className="notion-hero-eyebrow">New · {heroCopy.eyebrow}</div>
      <h1>{heroCopy.headline}</h1>
      <p>{heroCopy.subhead}</p>
      <div
        style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
      >
        <a href="#request" className="notion-btn-blue">
          {heroCopy.primaryCta}
        </a>
        <a href="#how-to" className="notion-btn-ghost">
          {heroCopy.secondaryCta}
        </a>
      </div>
    </section>
  );
}

export function WhyEasyRx() {
  return (
    <section id="why" className="notion-section-warm">
      <div className="notion-inner">
        <div className="notion-label">WHY EASYRX</div>
        <h2 className="notion-section-title">
          Built for how modern practices actually work.
        </h2>
        <p className="notion-section-sub">
          No more chasing paperwork, no more lost scans.
        </p>
        <div className="notion-card-grid">
          {benefits.map((b, i) => (
            <div key={b.title} className="notion-card">
              <span className="notion-badge" style={{ marginBottom: 14 }}>
                Benefit 0{i + 1}
              </span>
              <h3 style={{ marginTop: 10 }}>{b.title}</h3>
              <p>{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GettingStarted() {
  return (
    <section id="getting-started" className="notion-section">
      <div className="notion-label">GETTING STARTED</div>
      <h2 className="notion-section-title">Three steps. That&apos;s it.</h2>
      <p className="notion-section-sub">
        From first contact to sending your first case — most practices are up
        and running within a day.
      </p>
      <div className="notion-card-grid">
        {gettingStartedSteps.map((s) => (
          <div key={s.number} className="notion-card">
            <span className="notion-badge-neutral" style={{ marginBottom: 14 }}>
              STEP {s.number}
            </span>
            <h3 style={{ marginTop: 10 }}>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowToSubmit() {
  return (
    <section id="how-to" className="notion-section-dark">
      <div className="notion-inner">
        <div className="notion-label" style={{ color: "rgba(255,255,255,0.6)" }}>
          HOW TO SUBMIT
        </div>
        <h2 className="notion-section-title">
          From scan to submission in under five minutes.
        </h2>
        <p className="notion-section-sub">
          A repeatable, six-step workflow your team can master on day one.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {howToSteps.map((s) => (
            <div
              key={s.n}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <span
                className="notion-badge-neutral"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: 14,
                }}
              >
                {s.n}
              </span>
              <h3 style={{ marginTop: 10, color: "#fff", fontWeight: 700 }}>
                {s.title}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.65)" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScannerCards() {
  return (
    <section id="scanners" className="notion-section">
      <div className="notion-label">SCANNER INTEGRATIONS</div>
      <h2 className="notion-section-title">
        Every major scanner. One workflow.
      </h2>
      <p className="notion-section-sub">
        Whatever chairside scanner you use, EasyRx routes it to ASO Hawaii.
      </p>
      <div className="notion-card-grid">
        {scanners.map((s) => (
          <div key={s.name} className="notion-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--n-gray-300)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontWeight: 600,
                }}
              >
                {s.maker}
              </span>
              {s.pdf ? (
                <span className="notion-badge">PDF Guide</span>
              ) : (
                <span className="notion-badge-neutral">Coming Soon</span>
              )}
            </div>
            <h3>{s.name}</h3>
            <p>{s.body}</p>
            {s.pdf && (
              <a
                href={s.pdf}
                style={{
                  marginTop: 16,
                  display: "inline-block",
                  fontSize: 14,
                  color: "var(--n-blue)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Download setup guide →
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="notion-section-warm">
      <div className="notion-inner">
        <div className="notion-label">FAQ</div>
        <h2 className="notion-section-title">Questions, answered.</h2>
        <div style={{ maxWidth: 820, marginTop: 32 }}>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="notion-card"
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
                  }}
                >
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      letterSpacing: -0.2,
                    }}
                  >
                    {f.q}
                  </span>
                  <span
                    style={{
                      color: "var(--n-gray-500)",
                      fontSize: 22,
                      fontWeight: 400,
                      lineHeight: 1,
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
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

export function CTAForm() {
  const [sel, setSel] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  function toggle(s: string) {
    setSel((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }
  return (
    <section id="request" className="notion-section">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 48,
          alignItems: "start",
        }}
      >
        <div>
          <div className="notion-label">REQUEST INVITATION</div>
          <h2 className="notion-section-title">
            Ready to send your first digital case?
          </h2>
          <p className="notion-section-sub">
            Tell us a bit about your practice. We&apos;ll send your EasyRx
            invitation — most activations complete the same business day.
          </p>
        </div>
        <div className="notion-card">
          {submitted ? (
            <div style={{ textAlign: "center", padding: "32px 8px" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  margin: "0 auto 18px",
                  borderRadius: 9999,
                  background: "var(--n-blue)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                ✓
              </div>
              <h3>Thanks — we&apos;ll be in touch.</h3>
              <p style={{ marginTop: 8 }}>
                Our team will verify your practice shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              {[
                { id: "n-doc", label: "Doctor's Name", type: "text" },
                { id: "n-prac", label: "Practice Name", type: "text" },
                { id: "n-email", label: "Email", type: "email" },
                { id: "n-phone", label: "Phone", type: "tel" },
              ].map((f) => (
                <div key={f.id} style={{ marginBottom: 16 }}>
                  <label className="notion-form-label" htmlFor={f.id}>
                    {f.label}
                  </label>
                  <input
                    id={f.id}
                    type={f.type}
                    required
                    className="notion-form-input"
                  />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label className="notion-form-label">Scanners in use</label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 6,
                  }}
                >
                  {scannerOptions.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggle(s)}
                      className={`notion-chip ${sel.includes(s) ? "active" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="notion-btn-blue"
                style={{ width: "100%" }}
              >
                Send my invitation request
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export function Support() {
  return (
    <section id="support" className="notion-section-warm">
      <div className="notion-inner">
        <div className="notion-label">SUPPORT</div>
        <h2 className="notion-section-title">We&apos;re here when you need us.</h2>
        <p className="notion-section-sub">
          For case questions, call us directly. For EasyRx software, their team
          is a click away.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          <div className="notion-card">
            <span className="notion-badge" style={{ marginBottom: 14 }}>
              Lab Support
            </span>
            <h3 style={{ marginTop: 10 }}>{company.shortName}</h3>
            <dl style={{ marginTop: 16, fontSize: 14, color: "var(--n-gray-500)" }}>
              <Row label="Address" value={company.address} />
              <Row
                label="Phone"
                value={
                  <a
                    href={`tel:${company.phone.replace(/-/g, "")}`}
                    style={{ color: "var(--n-blue)" }}
                  >
                    {company.phone}
                  </a>
                }
              />
              <Row label="Fax" value={company.fax} />
              <Row
                label="Email"
                value={
                  <a
                    href={`mailto:${company.email}`}
                    style={{ color: "var(--n-blue)" }}
                  >
                    {company.email}
                  </a>
                }
              />
              <Row
                label="Hours"
                value={
                  <>
                    {company.hours}
                    <br />
                    <span style={{ color: "var(--n-gray-300)" }}>
                      {company.holidays}
                    </span>
                  </>
                }
              />
            </dl>
          </div>
          <div className="notion-card">
            <span className="notion-badge-neutral" style={{ marginBottom: 14 }}>
              Software Support
            </span>
            <h3 style={{ marginTop: 10 }}>EasyRx</h3>
            <p style={{ marginTop: 12 }}>
              Questions about the EasyRx platform — login, scanner integration,
              troubleshooting — are handled by the EasyRx team.
            </p>
            <a
              href="https://easyrxortho.com"
              target="_blank"
              rel="noopener noreferrer"
              className="notion-btn-ghost"
              style={{ marginTop: 20 }}
            >
              Visit EasyRx support →
            </a>
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid rgba(0,0,0,0.08)",
            fontSize: 13,
            color: "var(--n-gray-300)",
          }}
        >
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr",
        gap: 16,
        padding: "8px 0",
      }}
    >
      <dt
        style={{
          fontSize: 12,
          color: "var(--n-gray-300)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontWeight: 600,
          paddingTop: 2,
        }}
      >
        {label}
      </dt>
      <dd style={{ lineHeight: 1.5 }}>{value}</dd>
    </div>
  );
}
