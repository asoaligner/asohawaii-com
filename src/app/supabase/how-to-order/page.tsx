import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Order · ASO Hawaii — Case submission & pickup",
  description:
    "How to send your cases to ASO International Hawaii. Digital scanner submissions (iTero, Medit, Primescan, DEXIS, Shining 3D, 3Shape) or stone models. Oahu afternoon pickup available.",
};

export default function HowToOrderPage() {
  return (
    <>
      <section className="supabase-hero" style={{ paddingBottom: 48 }}>
        <div className="sb-eyebrow-pill">How to order</div>
        <h1>
          How to send your cases to{" "}
          <span className="sb-accent">ASO Hawaii.</span>
        </h1>
        <p>
          Two ways in — digital scanner data or stone models. Whichever your
          workflow, we&apos;ll meet you where you are.
        </p>
      </section>

      <section className="supabase-section-panel">
        <div className="sb-inner">
          <div className="supabase-label">▸ 01 / submission_options</div>
          <h2 className="supabase-section-title">Case Submission Options</h2>
          <p className="supabase-section-sub">
            We accept both digital intraoral scanner data and traditional stone
            models. Pickup and delivery on Oahu in the afternoon only (some
            remote areas excluded). Request a pickup via the button at the top
            of every page — or call us directly.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/supabase/pick-up/" className="supabase-btn-green">
              Request Pick-Up →
            </Link>
            <Link href="/supabase/download/" className="supabase-btn-secondary">
              Download instructions
            </Link>
            <a
              href="tel:8089570111"
              className="supabase-btn-secondary"
              style={{
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
              }}
            >
              ▸ 808-957-0111
            </a>
          </div>
        </div>
      </section>

      <section className="supabase-section">
        <div className="supabase-label">▸ 02 / digital_scanner</div>
        <h2 className="supabase-section-title">Digital scanner submissions.</h2>
        <p className="supabase-section-sub">
          We accept STL exports from every major chairside scanner.
        </p>
        <div className="sb-scanner-strip" style={{ marginBottom: 32 }}>
          {[
            { alt: "3Shape TRIOS", src: "/images/aso/scanner-3shape.png" },
            { alt: "iTero", src: "/images/aso/scanner-itero.jpg" },
            { alt: "Medit Link", src: "/images/aso/scanner-medit.png" },
            { alt: "Primescan", src: "/images/aso/scanner-primescan.png" },
            { alt: "DEXIS", src: "/images/aso/scanner-dexis.jpg" },
            { alt: "Shining 3D", src: "/images/aso/scanner-shining3d.jpg" },
          ].map((t) => (
            <div key={t.alt} className="sb-scanner-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.src} alt={t.alt} />
            </div>
          ))}
        </div>
        <div
          className="supabase-card"
          style={{
            borderLeft: "3px solid var(--sb-green)",
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'Source Code Pro', ui-monospace, monospace",
              fontSize: 11,
              color: "var(--sb-green)",
              textTransform: "uppercase",
              letterSpacing: 1.2,
              marginBottom: 10,
            }}
          >
            ▸ note / 3shape
          </div>
          <p>
            3Shape submissions must be sent via{" "}
            <span
              style={{
                color: "var(--sb-green)",
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
              }}
            >
              EasyRx
            </span>{" "}
            or{" "}
            <a
              href="mailto:aso-digital@outlook.com"
              style={{
                color: "var(--sb-green)",
                textDecoration: "none",
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
              }}
            >
              email
            </a>
            . Direct upload through 3Shape Communicate is not supported. For
            scanners not listed above, please contact us in advance.
          </p>
        </div>
      </section>

      <section className="supabase-section-panel">
        <div className="sb-inner">
          <div className="supabase-label">▸ 03 / stone_models</div>
          <h2 className="supabase-section-title">Stone model submissions.</h2>
          <p className="supabase-section-sub">
            We accept physical stone models cast in hard stone (Type III or
            higher). If you send impressions instead, we&apos;ll pour stone
            models in-house — calibrated and ready for CAD pipeline ingest.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            <div className="supabase-card">
              <div
                style={{
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 11,
                  color: "var(--sb-green)",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 14,
                }}
              >
                ▸ material
              </div>
              <h3>Type III hard stone or higher.</h3>
              <p>
                Softer stones can chip during fabrication. Type III ensures
                tolerances hold through the full CAD/CAM loop.
              </p>
            </div>
            <div className="supabase-card">
              <div
                style={{
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 11,
                  color: "var(--sb-green)",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 14,
                }}
              >
                ▸ packaging
              </div>
              <h3>Securely packaged &amp; labeled.</h3>
              <p>
                Include patient/case ID, doctor name, and prescription inside
                the box. We cross-reference on receipt before production.
              </p>
            </div>
            <div className="supabase-card">
              <div
                style={{
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 11,
                  color: "var(--sb-green)",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 14,
                }}
              >
                ▸ impressions_ok
              </div>
              <h3>We&apos;ll pour in-house.</h3>
              <p>
                Prefer to send impressions? We&apos;ll cast the stone models
                ourselves — no extra charge.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="supabase-section" style={{ textAlign: "center" }}>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <div className="supabase-label" style={{ textAlign: "center" }}>
            ▸ need_help
          </div>
          <h2 className="supabase-section-title" style={{ margin: "0 auto 20px" }}>
            Questions before submitting?
          </h2>
          <p
            className="supabase-section-sub"
            style={{ margin: "0 auto 32px" }}
          >
            For case submission help or to schedule a pickup — call or email
            us. Replies within one business day.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="mailto:aso-digital@outlook.com"
              className="supabase-btn-green"
            >
              aso-digital@outlook.com
            </a>
            <a
              href="tel:8089570111"
              className="supabase-btn-secondary"
              style={{
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
              }}
            >
              ▸ 808-957-0111
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
