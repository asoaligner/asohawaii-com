import type { Metadata } from "next";
import Link from "next/link";
import { productCatalog } from "@/data/product-catalog";

export const metadata: Metadata = {
  title: "Products · ASO Hawaii — Complete orthodontic catalogue",
  description:
    "ASO International Hawaii's full product catalogue: retainers, aligners, splints, sleep appliances, functional appliances, IDB, and more. Fabricated from your digital scans.",
};

export default function ProductIndexPage() {
  return (
    <>
      <section className="supabase-hero" style={{ paddingBottom: 48 }}>
        <div className="sb-eyebrow-pill">▸ full catalogue</div>
        <h1>
          Lab{" "}
          <span className="sb-accent">products</span>, engineered for digital
          workflow.
        </h1>
        <p>
          Fifteen product lines, all fabricated from your digital scans. Tap
          into any tile for details, or skip ahead and get a quote.
        </p>
      </section>

      <section className="supabase-section-panel">
        <div className="sb-inner">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {productCatalog.map((p) => {
              const href = p.slug
                ? p.slug === "new-products"
                  ? "/supabase/new-products/"
                  : `/supabase/product/${p.slug}/`
                : "/supabase/get-a-quote/";
              return (
                <Link
                  key={p.tag}
                  href={href}
                  className="supabase-card sb-card-accent"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
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
                          "'Source Code Pro', ui-monospace, monospace",
                        fontSize: 11,
                        color: "var(--sb-mid-gray)",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {p.tag}
                    </span>
                    {p.slug ? (
                      <span className="supabase-badge">see_details</span>
                    ) : (
                      <span className="supabase-badge-neutral">get_quote</span>
                    )}
                  </div>
                  <h3 style={{ marginTop: 4 }}>{p.name}</h3>
                  <p style={{ marginBottom: 18, flexGrow: 1 }}>{p.blurb}</p>
                  <div
                    style={{
                      fontFamily:
                        "'Source Code Pro', ui-monospace, monospace",
                      fontSize: 13,
                      color: "var(--sb-green)",
                    }}
                  >
                    $ {p.slug ? "view_product" : "request_quote"} →
                  </div>
                </Link>
              );
            })}
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
            ▸ consultation_about_our_products
          </div>
          <h2
            className="supabase-section-title"
            style={{ margin: "0 auto 20px" }}
          >
            Not sure which appliance fits your case?
          </h2>
          <p
            className="supabase-section-sub"
            style={{ margin: "0 auto 32px" }}
          >
            We are happy to explain how our orthodontic appliances can support
            your treatment. Please feel free to contact us.
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
              href="/supabase/get-a-quote/"
              className="supabase-btn-green"
            >
              Get a quote →
            </Link>
            <Link
              href="/supabase/contact/"
              className="supabase-btn-secondary"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
