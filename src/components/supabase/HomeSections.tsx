"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { faqs, scannerOptions } from "@/data/content";
import FormspreeForm, {
  SbField,
} from "@/components/supabase/FormspreeForm";

/* ============================================================
   01 · HERO — "Orthodontic Laboratory Solutions."
   ============================================================ */
export function Hero() {
  return (
    <section className="sb-product-hero">
      <div className="sb-product-hero-grid">
        <div>
          <div className="sb-eyebrow-pill">
            Digital orthodontic lab · Honolulu
          </div>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 400,
              lineHeight: 1.02,
              letterSpacing: "-2px",
              color: "var(--sb-off-white)",
              marginBottom: 24,
            }}
          >
            Orthodontic Laboratory{" "}
            <span style={{ color: "var(--sb-green)" }}>Solutions.</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: "var(--sb-light-gray)",
              maxWidth: 520,
              marginBottom: 32,
            }}
          >
            ASO International Hawaii builds retainers, aligners, and custom
            appliances for dental and orthodontic practices across the Pacific
            — delivered from your digital scans, on EasyRx.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/supabase/product/" className="supabase-btn-green">
              Explore Our Products →
            </Link>
            <Link
              href="/supabase/contact/#invitation"
              className="supabase-btn-secondary"
            >
              Request invitation
            </Link>
          </div>
        </div>
        <div className="sb-product-hero-media">
          <Image
            src="/images/aso/product-1.jpg"
            alt="Clear orthodontic retainer on stone model"
            width={1080}
            height={720}
            priority
          />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   02 · NEW PRODUCTS
   ============================================================ */
export function NewProducts() {
  return (
    <section className="supabase-section-panel">
      <div className="sb-inner">
        <div className="sb-product-hero-grid reverse">
          <div>
            <div className="supabase-label">▸ new_products</div>
            <h2
              style={{
                fontSize: 48,
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-1.5px",
                color: "var(--sb-off-white)",
                marginBottom: 20,
              }}
            >
              New{" "}
              <span style={{ color: "var(--sb-green)" }}>palatal expanders</span>{" "}
              &amp; custom appliances.
            </h2>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: "var(--sb-light-gray)",
                marginBottom: 28,
              }}
            >
              Precision-engineered from STL exports — band-and-loop,
              lingual arch, Nance, TPA, and rapid palatal expanders. Our CAD
              pipeline tracks to exact clinical tolerances.
            </p>
            <Link href="/supabase/new-products/" className="supabase-btn-green">
              Explore New Products →
            </Link>
          </div>
          <div className="sb-product-hero-media">
            <Image
              src="/images/aso/product-3.jpg"
              alt="Palatal expander appliance"
              width={1080}
              height={720}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   03 · CUSTOM ORAL APPLIANCES (Sleep)
   ============================================================ */
export function CustomOralAppliances() {
  return (
    <section className="sb-product-hero">
      <div className="sb-product-hero-grid">
        <div>
          <div className="supabase-label">▸ sleep_apnea</div>
          <h2
            style={{
              fontSize: 48,
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              color: "var(--sb-off-white)",
              marginBottom: 20,
            }}
          >
            Custom oral appliances for{" "}
            <span style={{ color: "var(--sb-green)" }}>better sleep.</span>
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--sb-light-gray)",
              marginBottom: 20,
              maxWidth: 520,
            }}
          >
            Custom-made oral appliances designed to help manage snoring and
            obstructive sleep apnea. Multiple adjustable designs are available
            to meet individual clinical needs.
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 32px",
              display: "grid",
              gap: 10,
              fontSize: 14,
              color: "var(--sb-light-gray)",
              fontFamily: "'Source Code Pro', ui-monospace, monospace",
            }}
          >
            {[
              "mandibular advancement devices (MAD)",
              "tongue-retaining designs",
              "telescoping + elastic mechanisms",
            ].map((t) => (
              <li key={t}>
                <span style={{ color: "var(--sb-green)", marginRight: 8 }}>
                  ▸
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Link href="/supabase/product/" className="supabase-btn-secondary">
            View Products
          </Link>
        </div>
        <div className="sb-product-hero-media">
          <Image
            src="/images/aso/product-2.jpg"
            alt="Sleep apnea oral appliances — multiple designs"
            width={1080}
            height={720}
          />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   04 · CONSULTATION BAND (dark stripe)
   ============================================================ */
export function ConsultationBand() {
  return (
    <section className="sb-consult-band">
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          position: "relative",
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
            fontSize: 26,
            lineHeight: 1.45,
            color: "var(--sb-off-white)",
            marginBottom: 20,
            fontWeight: 400,
            letterSpacing: "-0.5px",
          }}
        >
          We are happy to explain how our orthodontic appliances can support
          your treatment.{" "}
          <span style={{ color: "var(--sb-green)" }}>
            Please feel free to contact us.
          </span>
        </p>
        <Link href="/supabase/contact/" className="supabase-btn-green">
          Contact us →
        </Link>
      </div>
    </section>
  );
}

/* ============================================================
   05 · TRUSTED LAB (value prop)
   ============================================================ */
export function TrustedLab() {
  return (
    <section className="supabase-section" style={{ textAlign: "center" }}>
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        <div
          className="supabase-label"
          style={{ textAlign: "center", marginBottom: 20 }}
        >
          ▸ trusted_lab
        </div>
        <p
          style={{
            fontSize: 32,
            lineHeight: 1.35,
            color: "var(--sb-off-white)",
            letterSpacing: "-0.8px",
            fontWeight: 400,
          }}
        >
          ASO Hawaii is a{" "}
          <span style={{ color: "var(--sb-green)" }}>trusted orthodontic lab</span>{" "}
          providing retainers, aligners, and appliances for dental
          professionals across Honolulu.
        </p>

        <div
          className="sb-hero-stats"
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 0,
            textAlign: "left",
          }}
        >
          {[
            { k: "150+", v: "practices_served" },
            { k: "HIPAA", v: "compliance" },
            { k: "6", v: "scanner_integrations" },
            { k: "< 1 day", v: "onboarding_time" },
          ].map((s, i) => (
            <div
              key={s.v}
              style={{
                padding: "22px 26px",
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
                  fontSize: 28,
                  fontWeight: 400,
                  color: "var(--sb-green)",
                  letterSpacing: "-0.5px",
                }}
              >
                {s.k}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   06 · HOW TO SUBMIT VIA EASYRX (6 steps + EasyRx illustration)
   ============================================================ */
export function HowToSubmitEasyRx() {
  const steps = [
    "Log in to your EasyRx account.",
    "Go to \"Submit Rx\" and create a new prescription.",
    "Select \"ASO Hawaii\" from your connected labs.",
    "Fill out the prescription form.",
    "Attach STL files or photos if needed.",
    "Click \"Submit\".",
  ];
  return (
    <section id="how-to" className="supabase-section-panel">
      <div className="sb-inner">
        <div className="supabase-label">▸ how_to_submit_via_easyrx</div>
        <h2
          style={{
            fontSize: 48,
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            color: "var(--sb-off-white)",
            marginBottom: 20,
            maxWidth: 780,
          }}
        >
          How to submit a case to{" "}
          <span style={{ color: "var(--sb-green)" }}>ASO Hawaii</span> via EasyRx.
        </h2>
        <p className="supabase-section-sub">
          A six-step workflow your front desk can master on day one.
        </p>

        <div className="sb-easyrx-grid">
          <div>
            <div className="sb-easyrx-logo-card">
              <Image
                src="/images/aso/easyrx-logo.png"
                alt="EasyRx — connecting practices, labs, and patients"
                width={500}
                height={500}
              />
            </div>
          </div>

          <div>
            <ol
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: 14,
                counterReset: "step",
              }}
            >
              {steps.map((s, i) => (
                <li
                  key={s}
                  className="supabase-card"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 18,
                    alignItems: "center",
                    padding: "18px 22px",
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(62,207,142,0.12)",
                      border: "1px solid rgba(62,207,142,0.3)",
                      color: "var(--sb-green)",
                      fontFamily:
                        "'Source Code Pro', ui-monospace, monospace",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      color: "var(--sb-off-white)",
                    }}
                  >
                    {s}
                  </span>
                </li>
              ))}
            </ol>

            <div className="sb-easyrx-screen">
              <Image
                src="/images/aso/easyrx-screen.png"
                alt="EasyRx prescription interface for orthodontic submissions"
                width={1200}
                height={800}
              />
            </div>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/supabase/how-to-order/"
                className="supabase-btn-green"
              >
                Full how-to-order guide →
              </Link>
              <a
                href="https://easyrxcloud.com"
                target="_blank"
                rel="noopener noreferrer"
                className="supabase-btn-secondary"
              >
                Open EasyRx ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   07 · REQUEST EASYRX CONNECTION FORM
   ============================================================ */
export function RequestEasyRxForm() {
  const [sel, setSel] = useState<string[]>([]);
  function toggle(s: string) {
    setSel((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }
  return (
    <section id="request" className="supabase-section">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 56,
          alignItems: "start",
        }}
      >
        <div>
          <div className="supabase-label">▸ request_an_easyrx_connection</div>
          <h2
            style={{
              fontSize: 42,
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-1.2px",
              color: "var(--sb-off-white)",
              marginBottom: 18,
            }}
          >
            Request an{" "}
            <span style={{ color: "var(--sb-green)" }}>EasyRx Connection.</span>
          </h2>
          <p className="supabase-section-sub">
            Please fill out the form below to request your EasyRx access with
            ASO Hawaii. Our team will verify and respond within one business
            day.
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
              "same-day activation on business days",
              "scanner-agnostic onboarding",
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
          <FormspreeForm
            formType="EasyRx Invitation Request"
            submitLabel="submit"
          >
            <SbField
              id="h-doc"
              name="doctor_name"
              label="doctors_name"
              required
            />
            <SbField
              id="h-prac"
              name="practice_name"
              label="practice_name"
              required
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <SbField
                id="h-email"
                name="email"
                type="email"
                label="email"
                required
              />
              <SbField
                id="h-phone"
                name="phone"
                type="tel"
                label="phone"
                placeholder="optional"
              />
            </div>
            <SbField
              id="h-addr"
              name="clinic_address"
              label="clinic_address"
              placeholder="optional"
            />
            <div style={{ marginBottom: 22 }}>
              <label className="supabase-form-label">scanners_in_use</label>
              <div className="sb-chip-row" style={{ marginTop: 8 }}>
                {scannerOptions.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggle(s)}
                    className={`supabase-chip ${
                      sel.includes(s) ? "active" : ""
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                type="hidden"
                name="scanners_in_use"
                value={sel.join(", ")}
              />
            </div>
          </FormspreeForm>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   08 · SCANNER PLATFORMS (logos row)
   ============================================================ */
export function ScannerPlatforms() {
  const tiles = [
    {
      alt: "3Shape TRIOS scanner",
      src: "/images/aso/scanner-3shape.png",
    },
    {
      alt: "iTero scanner by Align Technology",
      src: "/images/aso/scanner-itero.jpg",
    },
    {
      alt: "Medit Link",
      src: "/images/aso/scanner-medit.png",
    },
    {
      alt: "Shining 3D dental scanner",
      src: "/images/aso/scanner-shining3d.jpg",
    },
    {
      alt: "Primescan by Dentsply Sirona",
      src: "/images/aso/scanner-primescan.png",
    },
    {
      alt: "DEXIS dental imaging",
      src: "/images/aso/scanner-dexis.jpg",
    },
  ];
  return (
    <section id="scanners" className="supabase-section-panel">
      <div className="sb-inner">
        <div
          className="supabase-label"
          style={{ textAlign: "center", marginBottom: 16 }}
        >
          ▸ supported_platforms
        </div>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.3,
            letterSpacing: "-0.5px",
            color: "var(--sb-off-white)",
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          We accept scan submissions from the following platforms.
        </h2>

        <div className="sb-scanner-strip">
          {tiles.map((t) => (
            <div key={t.alt} className="sb-scanner-tile">
              <Image src={t.src} alt={t.alt} width={240} height={120} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   09 · FAQ
   ============================================================ */
export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const shown = faqs.slice(0, 4);
  return (
    <section id="faq" className="supabase-section">
      <div className="supabase-label">▸ faq</div>
      <h2
        style={{
          fontSize: 42,
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "-1.2px",
          color: "var(--sb-off-white)",
          marginBottom: 20,
        }}
      >
        Questions, <span style={{ color: "var(--sb-green)" }}>answered.</span>
      </h2>
      <p
        style={{
          fontSize: 16,
          color: "var(--sb-light-gray)",
          marginBottom: 32,
        }}
      >
        A quick selection below — see the{" "}
        <Link
          href="/supabase/faq/"
          style={{
            color: "var(--sb-green)",
            textDecoration: "none",
            fontFamily: "'Source Code Pro', ui-monospace, monospace",
          }}
        >
          full FAQ
        </Link>{" "}
        for all 8 questions.
      </p>
      <div style={{ maxWidth: 840 }}>
        {shown.map((f, i) => {
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
      <div style={{ marginTop: 28, maxWidth: 840 }}>
        <Link href="/supabase/faq/" className="supabase-btn-secondary">
          See all FAQ →
        </Link>
      </div>
    </section>
  );
}
