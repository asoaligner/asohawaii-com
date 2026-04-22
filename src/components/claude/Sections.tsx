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
    <nav className="claude-nav">
      <a href="#" className="claude-nav-brand">
        <span className="claude-logo-mark">A</span>
        ASO Hawaii
      </a>
      <ul
        style={{
          display: "flex",
          gap: 28,
          listStyle: "none",
          margin: 0,
          padding: 0,
          alignItems: "center",
        }}
      >
        {navLinks.map((l) => (
          <li key={l.href} className="hidden md:block">
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
      <a href="#request" className="claude-nav-cta">
        Request invitation
      </a>
    </nav>
  );
}

export function Hero() {
  return (
    <section className="claude-hero">
      <div className="claude-hero-eyebrow">— {heroCopy.eyebrow}</div>
      <h1>
        Submit cases to{" "}
        <span className="claude-accent">ASO Hawaii</span> digitally, with zero
        hassle.
      </h1>
      <p>{heroCopy.subhead}</p>
      <div
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        <a href="#request" className="claude-btn-brand">
          {heroCopy.primaryCta}
        </a>
        <a href="#how-to" className="claude-btn-sand">
          {heroCopy.secondaryCta}
        </a>
      </div>
    </section>
  );
}

export function WhyEasyRx() {
  return (
    <section id="why" className="claude-section-ivory">
      <div className="claude-inner">
        <div className="claude-label">— Why EasyRx</div>
        <h2 className="claude-section-title">
          Built for how modern orthodontic practices{" "}
          <em style={{ color: "var(--c-terracotta)" }}>actually</em> work.
        </h2>
        <p className="claude-section-sub">
          No more chasing paperwork, no more lost scans. Every case in one
          thoughtful, secure thread.
        </p>
        <div className="claude-card-grid">
          {benefits.map((b, i) => (
            <div key={b.title} className="claude-card">
              <div className="claude-card-label">0{i + 1} · Benefit</div>
              <h3>{b.title}</h3>
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
    <section id="getting-started" className="claude-section">
      <div className="claude-label">— Getting Started</div>
      <h2 className="claude-section-title">Three steps. That&apos;s it.</h2>
      <p className="claude-section-sub">
        From first contact to sending your first case — most practices are up
        and running within a day.
      </p>
      <div className="claude-card-grid">
        {gettingStartedSteps.map((s) => (
          <div key={s.number} className="claude-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "var(--c-terracotta)",
                  color: "var(--c-ivory)",
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontSize: 14,
                  fontWeight: 500,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.number}
              </span>
              <span className="claude-card-label" style={{ margin: 0 }}>
                Step
              </span>
            </div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowToSubmit() {
  return (
    <section id="how-to" className="claude-section-dark">
      <div className="claude-inner">
        <div className="claude-label">— How to Submit</div>
        <h2 className="claude-section-title">
          From scan to submission in{" "}
          <em style={{ color: "var(--c-coral)" }}>under five minutes.</em>
        </h2>
        <p className="claude-section-sub">
          A repeatable, six-step workflow your team can master on day one.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {howToSteps.map((s) => (
            <div
              key={s.n}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontSize: 40,
                  fontStyle: "italic",
                  color: "var(--c-coral)",
                  lineHeight: 1,
                  marginBottom: 16,
                  fontWeight: 400,
                }}
              >
                {s.n}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontSize: 22,
                  fontWeight: 500,
                  color: "var(--c-ivory)",
                  marginBottom: 10,
                  letterSpacing: -0.2,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  color: "var(--c-warm-silver)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScannerCards() {
  return (
    <section id="scanners" className="claude-section-ivory">
      <div className="claude-inner">
        <div className="claude-label">— Scanner Integrations</div>
        <h2 className="claude-section-title">
          Every major scanner. One workflow.
        </h2>
        <p className="claude-section-sub">
          Whatever chairside scanner you use, EasyRx routes it to ASO Hawaii.
        </p>
        <div className="claude-card-grid">
          {scanners.map((s) => (
            <div key={s.name} className="claude-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <span className="claude-card-label" style={{ margin: 0 }}>
                  {s.maker}
                </span>
                {s.pdf ? (
                  <span className="claude-badge">PDF Guide</span>
                ) : (
                  <span className="claude-badge-neutral">Coming Soon</span>
                )}
              </div>
              <h3>{s.name}</h3>
              <p>{s.body}</p>
              {s.pdf && (
                <a
                  href={s.pdf}
                  style={{
                    marginTop: 18,
                    display: "inline-block",
                    fontSize: 14,
                    color: "var(--c-terracotta)",
                    fontWeight: 500,
                    fontFamily: "Arial, sans-serif",
                    textDecoration: "none",
                  }}
                >
                  Download setup guide →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="claude-section">
      <div className="claude-label">— FAQ</div>
      <h2 className="claude-section-title">
        Questions, <em style={{ color: "var(--c-terracotta)" }}>answered.</em>
      </h2>
      <div style={{ maxWidth: 840, marginTop: 32 }}>
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              className="claude-card"
              style={{ marginBottom: 12, padding: 24 }}
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
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: 19,
                    fontWeight: 500,
                    color: "var(--c-deep-dark)",
                    letterSpacing: -0.1,
                  }}
                >
                  {f.q}
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    borderRadius: 9999,
                    background: isOpen
                      ? "var(--c-terracotta)"
                      : "var(--c-warm-sand)",
                    color: isOpen ? "var(--c-ivory)" : "var(--c-charcoal-warm)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    transition: "all 0.2s",
                  }}
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <p
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: "1px solid var(--c-border-cream)",
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

export function CTAForm() {
  const [sel, setSel] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  function toggle(s: string) {
    setSel((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }
  return (
    <section id="request" className="claude-section-ivory">
      <div className="claude-inner">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div>
            <div className="claude-label">— Request Invitation</div>
            <h2 className="claude-section-title">
              Ready to send your first{" "}
              <em style={{ color: "var(--c-terracotta)" }}>digital case?</em>
            </h2>
            <p className="claude-section-sub">
              Tell us a bit about your practice. We&apos;ll send your EasyRx
              invitation — most activations complete the same business day.
            </p>
          </div>
          <div className="claude-card" style={{ padding: 36 }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "32px 8px" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    margin: "0 auto 20px",
                    borderRadius: 12,
                    background: "var(--c-terracotta)",
                    color: "var(--c-ivory)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
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
                  { id: "c-doc", label: "Doctor's Name", type: "text" },
                  { id: "c-prac", label: "Practice Name", type: "text" },
                  { id: "c-email", label: "Email", type: "email" },
                  { id: "c-phone", label: "Phone", type: "tel" },
                ].map((f) => (
                  <div key={f.id} style={{ marginBottom: 18 }}>
                    <label className="claude-form-label" htmlFor={f.id}>
                      {f.label}
                    </label>
                    <input
                      id={f.id}
                      type={f.type}
                      required
                      className="claude-form-input"
                    />
                  </div>
                ))}
                <div style={{ marginBottom: 22 }}>
                  <label className="claude-form-label">Scanners in use</label>
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
                        className={`claude-chip ${sel.includes(s) ? "active" : ""}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="claude-btn-brand"
                  style={{ width: "100%" }}
                >
                  Send my invitation request
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Support() {
  return (
    <section id="support" className="claude-section">
      <div className="claude-label">— Support</div>
      <h2 className="claude-section-title">We&apos;re here when you need us.</h2>
      <p className="claude-section-sub">
        For case questions, call us directly. For EasyRx software questions,
        their team is a click away.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
        }}
      >
        <div className="claude-card">
          <div className="claude-card-label">Lab Support</div>
          <h3>{company.shortName}</h3>
          <dl
            style={{
              marginTop: 20,
              fontSize: 14,
              color: "var(--c-olive-gray)",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <Row label="Address" value={company.address} />
            <Row
              label="Phone"
              value={
                <a
                  href={`tel:${company.phone.replace(/-/g, "")}`}
                  style={{
                    color: "var(--c-terracotta)",
                    textDecoration: "none",
                  }}
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
                  style={{
                    color: "var(--c-terracotta)",
                    textDecoration: "none",
                  }}
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
                  <span style={{ color: "var(--c-stone-gray)" }}>
                    {company.holidays}
                  </span>
                </>
              }
            />
          </dl>
        </div>
        <div className="claude-card">
          <div className="claude-card-label">Software Support</div>
          <h3>EasyRx</h3>
          <p style={{ marginTop: 12 }}>
            Questions about the EasyRx platform — login, scanner integration,
            technical troubleshooting — are handled directly by the EasyRx
            support team.
          </p>
          <a
            href="https://easyrxortho.com"
            target="_blank"
            rel="noopener noreferrer"
            className="claude-btn-sand"
            style={{ marginTop: 24 }}
          >
            Visit EasyRx support →
          </a>
        </div>
      </div>
      <div
        style={{
          marginTop: 64,
          paddingTop: 32,
          borderTop: "1px solid var(--c-border-cream)",
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--c-stone-gray)",
        }}
      >
        © {new Date().getFullYear()} {company.name} — Orthodontic Lab, Honolulu
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
        padding: "10px 0",
        borderBottom: "1px solid var(--c-border-cream)",
      }}
    >
      <dt
        style={{
          fontSize: 11,
          color: "var(--c-stone-gray)",
          textTransform: "uppercase",
          letterSpacing: 2,
          fontWeight: 500,
          paddingTop: 4,
        }}
      >
        {label}
      </dt>
      <dd style={{ lineHeight: 1.5 }}>{value}</dd>
    </div>
  );
}
