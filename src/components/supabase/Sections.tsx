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
    <nav className="supabase-nav">
      <a href="#" className="supabase-nav-brand">
        <span className="supabase-brand-icon" />
        aso_hawaii
      </a>
      <ul
        style={{
          display: "flex",
          gap: 32,
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
      <a href="#request" className="supabase-nav-cta">
        Request invitation →
      </a>
    </nav>
  );
}

export function Hero() {
  return (
    <section className="supabase-hero">
      <div className="supabase-hero-label">
        ▸ {heroCopy.eyebrow}
      </div>
      <h1>
        Submit cases to <span className="sb-accent">ASO Hawaii</span>{" "}
        digitally, with zero hassle.
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
        <a href="#request" className="supabase-btn-green">
          {heroCopy.primaryCta} →
        </a>
        <a href="#how-to" className="supabase-btn-secondary">
          {heroCopy.secondaryCta}
        </a>
      </div>

      <div
        style={{
          marginTop: 96,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 0,
          border: "1px solid var(--sb-dark-border)",
          borderRadius: 12,
          background: "var(--sb-near-black)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {[
          { k: "150+", v: "practices" },
          { k: "HIPAA", v: "compliance" },
          { k: "6", v: "scanner integrations" },
          { k: "< 1 day", v: "avg_setup_time" },
        ].map((s, i) => (
          <div
            key={s.v}
            style={{
              padding: "22px 24px",
              borderLeft:
                i === 0 ? "none" : "1px solid var(--sb-dark-border)",
            }}
          >
            <div
              style={{
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
                fontSize: 11,
                color: "var(--sb-mid-gray)",
                textTransform: "uppercase",
                letterSpacing: 1.2,
                marginBottom: 10,
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 400,
                color: "var(--sb-green)",
              }}
            >
              {s.k}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WhyEasyRx() {
  return (
    <section id="why" className="supabase-section-panel">
      <div className="sb-inner">
        <div className="supabase-label">▸ WHY_EASYRX</div>
        <h2 className="supabase-section-title">
          Built for how modern orthodontic practices{" "}
          <span style={{ color: "var(--sb-green)" }}>actually</span> work.
        </h2>
        <p className="supabase-section-sub">
          No more chasing paperwork, no more lost scans. Every case, scan, and
          note in one secure thread.
        </p>
        <div className="supabase-card-grid">
          {benefits.map((b, i) => (
            <div key={b.title} className="supabase-card">
              <span className="supabase-badge" style={{ marginBottom: 14 }}>
                0{i + 1} / benefit
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
    <section id="getting-started" className="supabase-section">
      <div className="supabase-label">▸ GETTING_STARTED</div>
      <h2 className="supabase-section-title">Three steps. That&apos;s it.</h2>
      <p className="supabase-section-sub">
        From first contact to sending your first case — most practices are up
        and running within a day.
      </p>
      <div className="supabase-card-grid">
        {gettingStartedSteps.map((s) => (
          <div key={s.number} className="supabase-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: "rgba(62,207,142,0.12)",
                  color: "var(--sb-green)",
                  border: "1px solid rgba(62,207,142,0.3)",
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.number}
              </span>
              <span
                style={{
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 11,
                  color: "var(--sb-mid-gray)",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                step
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
    <section id="how-to" className="supabase-section-panel">
      <div className="sb-inner">
        <div className="supabase-label">▸ HOW_TO_SUBMIT</div>
        <h2 className="supabase-section-title">
          From scan to submission in under five minutes.
        </h2>
        <p className="supabase-section-sub">
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
            <div key={s.n} className="supabase-card">
              <div
                style={{
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 12,
                  color: "var(--sb-green)",
                  letterSpacing: 1,
                  marginBottom: 14,
                }}
              >
                [step_{s.n}]
              </div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScannerCards() {
  return (
    <section id="scanners" className="supabase-section">
      <div className="supabase-label">▸ SCANNER_INTEGRATIONS</div>
      <h2 className="supabase-section-title">
        Every major scanner. One workflow.
      </h2>
      <p className="supabase-section-sub">
        Whatever chairside scanner you use, EasyRx routes it to ASO Hawaii.
      </p>
      <div className="supabase-card-grid">
        {scanners.map((s) => (
          <div key={s.name} className="supabase-card">
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
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 11,
                  color: "var(--sb-mid-gray)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {s.maker}
              </span>
              {s.pdf ? (
                <span className="supabase-badge">pdf_guide</span>
              ) : (
                <span className="supabase-badge-neutral">coming_soon</span>
              )}
            </div>
            <h3>{s.name}</h3>
            <p>{s.body}</p>
            {s.pdf && (
              <a
                href={s.pdf}
                style={{
                  marginTop: 18,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--sb-green)",
                  textDecoration: "none",
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                }}
              >
                $ download_setup_guide →
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
    <section id="faq" className="supabase-section">
      <div className="supabase-label">▸ FAQ</div>
      <h2 className="supabase-section-title">Questions, answered.</h2>
      <div style={{ maxWidth: 840, marginTop: 32 }}>
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              className="supabase-card"
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
                  color: "inherit",
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "var(--sb-off-white)",
                  }}
                >
                  {f.q}
                </span>
                <span
                  style={{
                    fontFamily:
                      "'Source Code Pro', ui-monospace, monospace",
                    fontSize: 18,
                    color: "var(--sb-green)",
                    width: 20,
                    textAlign: "center",
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
                    borderTop: "1px solid var(--sb-dark-border)",
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
    <section id="request" className="supabase-section-panel">
      <div className="sb-inner">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: 56,
            alignItems: "start",
          }}
        >
          <div>
            <div className="supabase-label">▸ REQUEST_INVITATION</div>
            <h2 className="supabase-section-title">
              Ready to send your first digital case?
            </h2>
            <p className="supabase-section-sub">
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
                "$ no setup fee. no per-case charge.",
                "$ works with every major scanner.",
                "$ HIPAA-compliant by design.",
              ].map((t) => (
                <li
                  key={t}
                  style={{
                    fontFamily:
                      "'Source Code Pro', ui-monospace, monospace",
                    fontSize: 13,
                    color: "var(--sb-light-gray)",
                  }}
                >
                  <span style={{ color: "var(--sb-green)", marginRight: 6 }}>
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="supabase-form">
            {submitted ? (
              <div style={{ textAlign: "center", padding: "32px 8px" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    margin: "0 auto 18px",
                    borderRadius: 9999,
                    background: "var(--sb-green)",
                    color: "var(--sb-near-black)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 600,
                  }}
                >
                  ✓
                </div>
                <h3>submission_received</h3>
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
                  { id: "sb-doc", label: "doctors_name", type: "text" },
                  { id: "sb-prac", label: "practice_name", type: "text" },
                  { id: "sb-email", label: "email", type: "email" },
                  { id: "sb-phone", label: "phone", type: "tel" },
                ].map((f) => (
                  <div key={f.id} style={{ marginBottom: 18 }}>
                    <label className="supabase-form-label" htmlFor={f.id}>
                      {f.label}
                    </label>
                    <input
                      id={f.id}
                      type={f.type}
                      required
                      className="supabase-form-input"
                    />
                  </div>
                ))}
                <div style={{ marginBottom: 22 }}>
                  <label className="supabase-form-label">scanners_in_use</label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 8,
                    }}
                  >
                    {scannerOptions.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggle(s)}
                        className={`supabase-chip ${sel.includes(s) ? "active" : ""}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="supabase-btn-green"
                  style={{ width: "100%" }}
                >
                  $ send_invitation_request →
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
    <section id="support" className="supabase-section">
      <div className="supabase-label">▸ SUPPORT</div>
      <h2 className="supabase-section-title">
        We&apos;re here when you need us.
      </h2>
      <p className="supabase-section-sub">
        For case questions, call us directly. For EasyRx software questions,
        their team is a click away.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        <div className="supabase-card">
          <span className="supabase-badge" style={{ marginBottom: 14 }}>
            lab_support
          </span>
          <h3 style={{ marginTop: 10 }}>{company.shortName}</h3>
          <dl
            style={{
              marginTop: 20,
              fontSize: 14,
              color: "var(--sb-light-gray)",
            }}
          >
            <Row label="addr" value={company.address} />
            <Row
              label="phone"
              value={
                <a
                  href={`tel:${company.phone.replace(/-/g, "")}`}
                  style={{
                    color: "var(--sb-green)",
                    textDecoration: "none",
                    fontFamily:
                      "'Source Code Pro', ui-monospace, monospace",
                  }}
                >
                  {company.phone}
                </a>
              }
            />
            <Row label="fax" value={company.fax} />
            <Row
              label="email"
              value={
                <a
                  href={`mailto:${company.email}`}
                  style={{
                    color: "var(--sb-green)",
                    textDecoration: "none",
                    fontFamily:
                      "'Source Code Pro', ui-monospace, monospace",
                  }}
                >
                  {company.email}
                </a>
              }
            />
            <Row
              label="hours"
              value={
                <>
                  {company.hours}
                  <br />
                  <span style={{ color: "var(--sb-mid-gray)" }}>
                    {company.holidays}
                  </span>
                </>
              }
            />
          </dl>
        </div>
        <div className="supabase-card">
          <span className="supabase-badge-neutral" style={{ marginBottom: 14 }}>
            software_support
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
            className="supabase-btn-secondary"
            style={{ marginTop: 20 }}
          >
            $ open easyrxortho.com →
          </a>
        </div>
      </div>
      <div
        style={{
          marginTop: 64,
          paddingTop: 32,
          borderTop: "1px solid var(--sb-dark-border)",
          fontFamily: "'Source Code Pro', ui-monospace, monospace",
          fontSize: 12,
          color: "var(--sb-mid-gray)",
          letterSpacing: 0.5,
        }}
      >
        © {new Date().getFullYear()} {company.name} // all rights reserved
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr",
        gap: 16,
        padding: "10px 0",
        borderBottom: "1px solid var(--sb-dark-border)",
      }}
    >
      <dt
        style={{
          fontFamily: "'Source Code Pro', ui-monospace, monospace",
          fontSize: 11,
          color: "var(--sb-mid-gray)",
          textTransform: "uppercase",
          letterSpacing: 1.2,
          paddingTop: 3,
        }}
      >
        {label}
      </dt>
      <dd style={{ lineHeight: 1.5 }}>{value}</dd>
    </div>
  );
}
