import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findProductBySlug,
  productCatalog,
  slugList,
} from "@/data/product-catalog";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return slugList()
    .filter((s) => s !== "new-products")
    .map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: Params;
}): Metadata {
  const product = findProductBySlug(params.slug);
  if (!product) return { title: "Product · ASO Hawaii" };
  return {
    title: `${product.name} · ASO Hawaii`,
    description: product.description,
  };
}

export default function ProductDetailPage({ params }: { params: Params }) {
  const product = findProductBySlug(params.slug);
  if (!product || product.slug === "new-products") notFound();

  const related = productCatalog
    .filter(
      (p) =>
        p.slug &&
        p.slug !== product.slug &&
        p.category === product.category
    )
    .slice(0, 3);

  return (
    <>
      <section className="supabase-hero" style={{ paddingBottom: 48 }}>
        <div className="sb-eyebrow-pill">▸ {product.tag}</div>
        <h1>
          {product.name.includes("®") ? (
            <>
              {product.name.replace("®", "")}
              <span style={{ color: "var(--sb-green)" }}>®</span>
            </>
          ) : (
            product.name
          )}
        </h1>
        <p>{product.blurb}</p>
        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          <Link
            href="/supabase/get-a-quote/"
            className="supabase-btn-green"
          >
            Get a quote →
          </Link>
          <Link
            href="/supabase/how-to-order/"
            className="supabase-btn-secondary"
          >
            How to submit a case
          </Link>
        </div>
      </section>

      <section className="supabase-section-panel">
        <div className="sb-inner">
          <div className="sb-product-hero-grid">
            <div>
              <div className="supabase-label">▸ overview</div>
              <h2
                style={{
                  fontSize: 40,
                  fontWeight: 400,
                  lineHeight: 1.15,
                  letterSpacing: "-1px",
                  color: "var(--sb-off-white)",
                  marginBottom: 20,
                }}
              >
                {product.name}
              </h2>
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: "var(--sb-light-gray)",
                  marginBottom: 28,
                }}
              >
                {product.description}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 32px",
                  display: "grid",
                  gap: 10,
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 14,
                  color: "var(--sb-light-gray)",
                }}
              >
                {product.bullets.map((b) => (
                  <li key={b}>
                    <span
                      style={{
                        color: "var(--sb-green)",
                        marginRight: 10,
                      }}
                    >
                      ▸
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {product.heroImage && (
              <div className="sb-product-hero-media">
                <Image
                  src={product.heroImage}
                  alt={product.name}
                  width={1080}
                  height={720}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="supabase-section">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
              ▸ submission
            </div>
            <h3>Digital or stone — your call.</h3>
            <p>
              STL/PLY exports from any major scanner, or traditional stone
              models. Typical turnaround 7–10 business days.
            </p>
            <Link
              href="/supabase/how-to-order/"
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--sb-green)",
                textDecoration: "none",
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
              }}
            >
              $ how_to_order →
            </Link>
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
              ▸ pricing
            </div>
            <h3>Quote by case.</h3>
            <p>
              Pricing depends on appliance type, complexity, and quantity.
              Quotes typically returned within one business day.
            </p>
            <Link
              href="/supabase/get-a-quote/"
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--sb-green)",
                textDecoration: "none",
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
              }}
            >
              $ request_quote →
            </Link>
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
              ▸ rush_service
            </div>
            <h3>Need it faster?</h3>
            <p>
              Rush service is available on request. Additional fees may apply
              based on complexity and requested turnaround.
            </p>
            <a
              href="tel:8089570111"
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--sb-green)",
                textDecoration: "none",
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
              }}
            >
              ▸ 808-957-0111
            </a>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="supabase-section-panel">
          <div className="sb-inner">
            <div className="supabase-label">▸ related_products</div>
            <h2 className="supabase-section-title">Similar lines.</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {related.map((r) => (
                <Link
                  key={r.tag}
                  href={`/supabase/product/${r.slug}/`}
                  className="supabase-card sb-card-accent"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span
                    className="supabase-badge"
                    style={{ marginBottom: 14, alignSelf: "flex-start" }}
                  >
                    ▸ {r.tag}
                  </span>
                  <h3 style={{ marginTop: 6 }}>{r.name}</h3>
                  <p style={{ flexGrow: 1 }}>{r.blurb}</p>
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily:
                        "'Source Code Pro', ui-monospace, monospace",
                      fontSize: 13,
                      color: "var(--sb-green)",
                    }}
                  >
                    $ view_product →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="supabase-section" style={{ textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link
            href="/supabase/product/"
            style={{
              fontFamily: "'Source Code Pro', ui-monospace, monospace",
              fontSize: 13,
              color: "var(--sb-green)",
              textDecoration: "none",
            }}
          >
            ← back to all products
          </Link>
        </div>
      </section>
    </>
  );
}
