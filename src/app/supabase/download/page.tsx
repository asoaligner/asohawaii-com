import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Download · ASO Hawaii — Forms & guides",
  description:
    "Download order forms, submission guides, and reference documents from ASO International Hawaii.",
};

const files = [
  {
    name: "Order Form",
    desc:
      "Printable prescription / order form for ASO Hawaii products. Fill out and include with stone model submissions.",
    href: "/pdf/aso-hawaii-order-form.pdf",
    filename: "aso-hawaii-order-form.pdf",
  },
  {
    name: "ASO ALIGNER Prescription Form",
    desc:
      "Clear-aligner-specific order sheet for ASO ALIGNER treatment planning. Captures staging, material, and attachment preferences.",
    href: "/pdf/aso-aligner-order-form.pdf",
    filename: "aso-aligner-order-form.pdf",
  },
  {
    name: "Product Catalog",
    desc:
      "Complete ASO International product catalog — every appliance line we fabricate, with specifications, material options, and configuration codes.",
    href: "/pdf/aso-general-catalog.pdf",
    filename: "aso-general-catalog.pdf",
  },
];

export default function DownloadPage() {
  return (
    <>
      <section className="supabase-hero" style={{ paddingBottom: 48 }}>
        <div className="sb-eyebrow-pill">▸ resources</div>
        <h1>
          Downloads &amp;{" "}
          <span className="sb-accent">reference docs.</span>
        </h1>
        <p>
          Order forms, submission instructions, and scanner setup guides — all
          as PDFs. Print what you need, attach to case submissions as required.
        </p>
      </section>

      <section
        className="supabase-section-panel"
        style={{ paddingBottom: 80 }}
      >
        <div className="sb-inner">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {files.map((f) => (
              <div
                key={f.name}
                className="supabase-card sb-card-accent"
                style={{ display: "flex", flexDirection: "column" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 48,
                      borderRadius: 6,
                      background: "rgba(62,207,142,0.1)",
                      border: "1px solid rgba(62,207,142,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily:
                        "'Source Code Pro', ui-monospace, monospace",
                      fontSize: 11,
                      color: "var(--sb-green)",
                      letterSpacing: 1,
                    }}
                  >
                    PDF
                  </div>
                  <span className="supabase-badge">downloadable</span>
                </div>
                <h3>{f.name}</h3>
                <p style={{ marginBottom: 20, flexGrow: 1 }}>{f.desc}</p>
                <a
                  href={f.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={f.filename}
                  className="supabase-btn-green"
                  style={{
                    alignSelf: "flex-start",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  ↓ Download
                </a>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 56,
              padding: "32px 32px",
              background: "var(--sb-dark)",
              border: "1px solid var(--sb-dark-border)",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "var(--sb-light-gray)",
                fontSize: 15,
                marginBottom: 20,
              }}
            >
              Looking for something specific? Drop us a line and we&apos;ll get
              the right document to you.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/supabase/contact/"
                className="supabase-btn-secondary"
              >
                Contact us
              </Link>
              <a
                href="mailto:asohawaii@hotmail.com"
                className="supabase-btn-secondary"
                style={{
                  fontFamily:
                    "'Source Code Pro', ui-monospace, monospace",
                }}
              >
                asohawaii@hotmail.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
