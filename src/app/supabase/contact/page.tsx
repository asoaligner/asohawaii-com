import type { Metadata } from "next";
import Link from "next/link";
import {
  company,
  contactChannels,
  contactHero,
} from "@/data/supabase-content";
import {
  GeneralForm,
  InvitationForm,
  PickupForm,
} from "@/components/supabase/ContactForms";

export const metadata: Metadata = {
  title: "Contact · ASO Hawaii — Get in touch",
  description:
    "Contact ASO International Hawaii. Request an EasyRx invitation, schedule a pick-up, or send us a message. Honolulu-based, serving practices across the Pacific.",
};

export default function ContactPage() {
  return (
    <>
      <section className="supabase-hero" style={{ paddingBottom: 64 }}>
        <div className="sb-eyebrow-pill">{contactHero.eyebrow}</div>
        <h1>
          {contactHero.headlineLead}{" "}
          <span className="sb-accent">{contactHero.headlineAccent}</span>
        </h1>
        <p>{contactHero.subhead}</p>
      </section>

      <section className="supabase-section-panel">
        <div className="sb-inner">
          <div className="supabase-label">▸ channels</div>
          <h2 className="supabase-section-title">
            Which message is this?
          </h2>
          <p className="supabase-section-sub">
            Pick the form that fits. Every submission routes to our team inbox
            and we reply within one business day.
          </p>

          <div className="supabase-card-grid">
            {contactChannels.map((c) => (
              <a
                key={c.tag}
                href={c.href}
                className="supabase-card sb-card-accent"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span className="supabase-badge" style={{ marginBottom: 14 }}>
                  ▸ {c.tag}
                </span>
                <h3 style={{ marginTop: 10 }}>{c.title}</h3>
                <p style={{ marginBottom: 18, flexGrow: 1 }}>{c.body}</p>
                <span
                  style={{
                    fontFamily:
                      "'Source Code Pro', ui-monospace, monospace",
                    fontSize: 13,
                    color: "var(--sb-green)",
                  }}
                >
                  $ {c.cta} →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="invitation"
        className="supabase-section"
        style={{ paddingBottom: 48 }}
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
            <div className="supabase-label">▸ 01 / new_practice</div>
            <h2 className="supabase-section-title">
              Request EasyRx invitation.
            </h2>
            <p className="supabase-section-sub">
              Not yet on EasyRx? Tell us about your practice and we&apos;ll
              send a secure invitation. Most activations complete the same
              business day.
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: 10,
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
                fontSize: 13,
                color: "var(--sb-light-gray)",
              }}
            >
              {[
                "no cost to your practice",
                "scanner-agnostic onboarding",
                "first case typically within 1 business day",
              ].map((t) => (
                <li key={t}>
                  <span style={{ color: "var(--sb-green)", marginRight: 8 }}>
                    $
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="supabase-form">
            <InvitationForm />
          </div>
        </div>
      </section>

      <section
        id="pickup"
        className="supabase-section-panel"
        style={{ paddingTop: 48, paddingBottom: 48 }}
      >
        <div className="sb-inner">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 56,
              alignItems: "start",
            }}
          >
            <div>
              <div className="supabase-label">▸ 02 / pickup</div>
              <h2 className="supabase-section-title">
                Schedule a courier pick-up.
              </h2>
              <p className="supabase-section-sub">
                Hawaii-based practice? Request a pick-up for impressions,
                models, or returns. We cover Honolulu and most of Oahu.
                Mainland practices — ship UPS/FedEx to the address below.
              </p>
              <div
                className="supabase-card"
                style={{
                  background: "transparent",
                  padding: 20,
                }}
              >
                <dl
                  style={{
                    fontFamily:
                      "'Source Code Pro', ui-monospace, monospace",
                    fontSize: 13,
                    color: "var(--sb-light-gray)",
                  }}
                >
                  {[
                    ["ship_to", company.address],
                    ["phone", company.phone],
                    ["hours", company.hours],
                  ].map(([k, v], i) => (
                    <div
                      key={k}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "90px 1fr",
                        gap: 12,
                        padding: "6px 0",
                        borderTop:
                          i === 0
                            ? "none"
                            : "1px solid var(--sb-dark-border)",
                      }}
                    >
                      <dt style={{ color: "var(--sb-mid-gray)" }}>▸ {k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div className="supabase-form">
              <PickupForm />
            </div>
          </div>
        </div>
      </section>

      <section
        id="general"
        className="supabase-section"
        style={{ paddingTop: 48 }}
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
            <div className="supabase-label">▸ 03 / general_inquiry</div>
            <h2 className="supabase-section-title">
              Send us a message.
            </h2>
            <p className="supabase-section-sub">
              Quotes, material questions, complaints, compliments. Our team
              reads every message and replies within one business day.
            </p>
            <div style={{ fontSize: 14, color: "var(--sb-light-gray)", lineHeight: 1.7 }}>
              Prefer to talk?
              <br />
              <a
                href={`tel:${company.phone.replace(/-/g, "")}`}
                style={{
                  color: "var(--sb-green)",
                  textDecoration: "none",
                  fontFamily:
                    "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 15,
                }}
              >
                {company.phone}
              </a>
              <span style={{ color: "var(--sb-mid-gray)", marginLeft: 8 }}>
                Mon–Fri, 8:00 AM – 4:30 PM HST
              </span>
            </div>
          </div>
          <div className="supabase-form">
            <GeneralForm />
          </div>
        </div>
      </section>

      <section className="supabase-section-panel">
        <div className="sb-inner">
          <div className="supabase-label">▸ visit</div>
          <h2 className="supabase-section-title">Honolulu HQ.</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            <div className="supabase-card">
              <div
                style={{
                  fontFamily:
                    "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 11,
                  color: "var(--sb-green)",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 14,
                }}
              >
                ▸ address
              </div>
              <h3 style={{ marginTop: 10 }}>{company.shortName}</h3>
              <p style={{ marginTop: 12, whiteSpace: "pre-line" }}>
                {company.address}
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  company.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="supabase-btn-secondary"
                style={{ marginTop: 20 }}
              >
                $ open_in_maps →
              </a>
            </div>
            <div className="supabase-card">
              <div
                style={{
                  fontFamily:
                    "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 11,
                  color: "var(--sb-green)",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 14,
                }}
              >
                ▸ direct_lines
              </div>
              <dl
                style={{
                  fontSize: 14,
                  color: "var(--sb-light-gray)",
                  marginTop: 8,
                }}
              >
                {[
                  [
                    "phone",
                    <a
                      key="p"
                      href={`tel:${company.phone.replace(/-/g, "")}`}
                      style={{
                        color: "var(--sb-green)",
                        textDecoration: "none",
                        fontFamily:
                          "'Source Code Pro', ui-monospace, monospace",
                      }}
                    >
                      {company.phone}
                    </a>,
                  ],
                  ["fax", company.fax],
                  [
                    "email",
                    <a
                      key="e"
                      href={`mailto:${company.email}`}
                      style={{
                        color: "var(--sb-green)",
                        textDecoration: "none",
                        fontFamily:
                          "'Source Code Pro', ui-monospace, monospace",
                      }}
                    >
                      {company.email}
                    </a>,
                  ],
                  ["hours", `${company.hours} — ${company.holidays}`],
                ].map(([k, v], i) => (
                  <div
                    key={String(k)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr",
                      gap: 16,
                      padding: "10px 0",
                      borderTop:
                        i === 0
                          ? "none"
                          : "1px solid var(--sb-dark-border)",
                    }}
                  >
                    <dt
                      style={{
                        fontFamily:
                          "'Source Code Pro', ui-monospace, monospace",
                        fontSize: 11,
                        color: "var(--sb-mid-gray)",
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        paddingTop: 3,
                      }}
                    >
                      ▸ {k}
                    </dt>
                    <dd style={{ lineHeight: 1.5 }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div style={{ marginTop: 48, textAlign: "center" }}>
            <Link
              href="/supabase/#faq"
              style={{
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
                fontSize: 13,
                color: "var(--sb-green)",
                textDecoration: "none",
              }}
            >
              $ check_the_faq_first →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
