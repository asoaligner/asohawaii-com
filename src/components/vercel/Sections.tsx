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
    <nav className="vercel-nav">
      <a href="#" className="vercel-nav-brand">
        <span
          style={{
            display: "inline-block",
            width: 20,
            height: 17,
            background: "#000",
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />
        aso-hawaii
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
      <a href="#request" className="vercel-nav-cta">
        Request invitation
      </a>
    </nav>
  );
}

export function Hero() {
  return (
    <section className="vercel-hero">
      <div className="vercel-hero-eyebrow">▲ {heroCopy.eyebrow}</div>
      <h1>{heroCopy.headline}</h1>
      <p>{heroCopy.subhead}</p>
      <div
        style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
      >
        <a href="#request" className="vercel-btn-dark">
          {heroCopy.primaryCta}
        </a>
        <a href="#how-to" className="vercel-btn-ghost">
          {heroCopy.secondaryCta} →
        </a>
      </div>
    </section>
  );
}

export function WhyEasyRx() {
  return (
    <section id="why" className="vercel-section-grid">
      <div className="vercel-inner">
        <div className="vercel-label">01 · WHY EASYRX</div>
        <h2 className="vercel-section-title">
          Built for how modern practices actually work.
        </h2>
        <p className="vercel-section-sub">
          No more chasing paperwork, no more lost scans.
        </p>
        <div className="vercel-card-grid">
          {benefits.map((b, i) => (
            <div key={b.title} className="vercel-card">
              <span className="vercel-badge" style={{ marginBottom: 14 }}>
                BENEFIT_0{i + 1}
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
    <section id="getting-started" className="vercel-section">
      <div className="vercel-label">02 · GETTING STARTED</div>
      <h2 className="vercel-section-title">Three steps. That&apos;s it.</h2>
      <p className="vercel-section-sub">
        From first contact to sending your first case — most practices are up
        and running within a day.
      </p>
      <div className="vercel-card-grid">
        {gettingStartedSteps.map((s) => (
          <div key={s.number} className="vercel-card">
            <span className="vercel-badge-neutral" style={{ marginBottom: 14 }}>
              STEP_{s.number}
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
    <section id="how-to" className="vercel-section-dark">
      <div className="vercel-inner">
        <div className="vercel-label">03 · HOW TO SUBMIT</div>
        <h2 className="vercel-section-title">
          From scan to submission in under five minutes.
        </h2>
        <p className="vercel-section-sub">
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
                background: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: 28,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 11,
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 14,
                }}
              >
                STEP_{s.n}
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#fff",
                  letterSpacing: -0.7,
                  marginBottom: 10,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.55,
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
    <section id="scanners" className="vercel-section-grid">
      <div className="vercel-inner">
        <div className="vercel-label">04 · SCANNER INTEGRATIONS</div>
        <h2 className="vercel-section-title">
          Every major scanner. One workflow.
        </h2>
        <p className="vercel-section-sub">
          Whatever chairside scanner you use, EasyRx routes it to ASO Hawaii.
        </p>
        <div className="vercel-card-grid">
          {scanners.map((s) => (
            <div key={s.name} className="vercel-card">
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
                    fontFamily:
                      "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 11,
                    color: "var(--v-gray-400)",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  {s.maker}
                </span>
                {s.pdf ? (
                  <span className="vercel-badge">PDF Guide</span>
                ) : (
                  <span className="vercel-badge-neutral">Coming Soon</span>
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
                    color: "var(--v-black)",
                    fontWeight: 500,
                    textDecoration: "none",
                    borderBottom: "1px solid var(--v-black)",
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
    <section id="faq" className="vercel-section">
      <div className="vercel-label">05 · FAQ</div>
      <h2 className="vercel-section-title">Questions, answered.</h2>
      <div style={{ maxWidth: 840, marginTop: 32 }}>
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              className="vercel-card"
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
                    fontWeight: 600,
                    letterSpacing: -0.4,
                  }}
                >
                  {f.q}
                </span>
                <span
                  style={{
                    fontFamily:
                      "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 18,
                    color: "var(--v-gray-500)",
                    width: 20,
                    textAlign: "center",
                  }}
                >
                  {isOpen ? "[-]" : "[+]"}
                </span>
              </button>
              {isOpen && (
                <p
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: "1px solid var(--v-gray-100)",
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
    <section id="request" className="vercel-section">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 48,
          alignItems: "start",
        }}
      >
        <div>
          <div className="vercel-label">06 · REQUEST INVITATION</div>
          <h2 className="vercel-section-title">
            Ready to send your first digital case?
          </h2>
          <p className="vercel-section-sub">
            Tell us a bit about your practice. We&apos;ll send your EasyRx
            invitation — most activations complete the same business day.
          </p>
        </div>
        <div className="vercel-card" style={{ padding: 36 }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "24px 8px" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  margin: "0 auto 18px",
                  borderRadius: 8,
                  background: "var(--v-black)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                ✓
              </div>
              <h3>Submission received.</h3>
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
                { id: "v-doc", label: "DOCTOR'S NAME", type: "text" },
                { id: "v-prac", label: "PRACTICE NAME", type: "text" },
                { id: "v-email", label: "EMAIL", type: "email" },
                { id: "v-phone", label: "PHONE", type: "tel" },
              ].map((f) => (
                <div key={f.id} style={{ marginBottom: 18 }}>
                  <label className="vercel-form-label" htmlFor={f.id}>
                    {f.label}
                  </label>
                  <input
                    id={f.id}
                    type={f.type}
                    required
                    className="vercel-form-input"
                  />
                </div>
              ))}
              <div style={{ marginBottom: 22 }}>
                <label className="vercel-form-label">SCANNERS IN USE</label>
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
                      className={`vercel-chip ${sel.includes(s) ? "active" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="vercel-btn-dark"
                style={{ width: "100%" }}
              >
                SEND INVITATION REQUEST
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
    <section id="support" className="vercel-section-grid">
      <div className="vercel-inner">
        <div className="vercel-label">07 · SUPPORT</div>
        <h2 className="vercel-section-title">
          We&apos;re here when you need us.
        </h2>
        <p className="vercel-section-sub">
          For case questions, call us directly. For EasyRx software questions,
          their team is a click away.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          <div className="vercel-card">
            <span className="vercel-badge" style={{ marginBottom: 14 }}>
              LAB_SUPPORT
            </span>
            <h3 style={{ marginTop: 10 }}>{company.shortName}</h3>
            <dl
              style={{
                marginTop: 20,
                fontSize: 14,
                color: "var(--v-gray-600)",
              }}
            >
              <Row label="ADDR" value={company.address} />
              <Row
                label="PHONE"
                value={
                  <a
                    href={`tel:${company.phone.replace(/-/g, "")}`}
                    style={{
                      color: "var(--v-black)",
                      fontFamily:
                        "'JetBrains Mono', ui-monospace, monospace",
                    }}
                  >
                    {company.phone}
                  </a>
                }
              />
              <Row label="FAX" value={company.fax} />
              <Row
                label="EMAIL"
                value={
                  <a
                    href={`mailto:${company.email}`}
                    style={{
                      color: "var(--v-black)",
                      fontFamily:
                        "'JetBrains Mono', ui-monospace, monospace",
                    }}
                  >
                    {company.email}
                  </a>
                }
              />
              <Row
                label="HOURS"
                value={
                  <>
                    {company.hours}
                    <br />
                    <span style={{ color: "var(--v-gray-400)" }}>
                      {company.holidays}
                    </span>
                  </>
                }
              />
            </dl>
          </div>
          <div className="vercel-card">
            <span className="vercel-badge-neutral" style={{ marginBottom: 14 }}>
              SW_SUPPORT
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
              className="vercel-btn-ghost"
              style={{ marginTop: 20 }}
            >
              $ open easyrxortho.com →
            </a>
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--v-gray-100)",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 12,
            color: "var(--v-gray-500)",
            letterSpacing: 0.5,
          }}
        >
          © {new Date().getFullYear()} {company.name} · all rights reserved
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
        gridTemplateColumns: "80px 1fr",
        gap: 16,
        padding: "8px 0",
        borderBottom: "1px solid var(--v-gray-100)",
      }}
    >
      <dt
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 11,
          color: "var(--v-gray-400)",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          paddingTop: 3,
        }}
      >
        {label}
      </dt>
      <dd style={{ lineHeight: 1.5 }}>{value}</dd>
    </div>
  );
}
