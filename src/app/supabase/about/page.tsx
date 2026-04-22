import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About · ASO International Hawaii — Japan's leading orthodontic lab",
  description:
    "About ASO International Hawaii. Founded in Tokyo 1982, Japan's largest orthodontic laboratory. ISO 13485 certified. First fully systemized clear aligner in Japan (2005). Serving 29 dental universities + global practices from Honolulu.",
};

const pillars = [
  {
    tag: "01 / expertise",
    title: "Unmatched technical expertise.",
    body:
      "A pioneer in the lab industry founded by Toshimasa Aso. Our team is supported by expert orthodontists, with ISO 13485-certified quality assurance across every facility.",
  },
  {
    tag: "02 / digital",
    title: "Digital innovation meets premium design.",
    body:
      "First in Japan to develop a fully systemized clear aligner solution in 2005. CAD/CAM pipelines, 3D printers, and high-performance materials for aligners, retainers, and custom appliances.",
  },
  {
    tag: "03 / reach",
    title: "Trusted across Japan and beyond.",
    body:
      "Clients include 29 dental universities and many leading orthodontic clinics. ASO Hawaii (est. 2005) was our first overseas production center, followed by Manila and Silicon Valley.",
  },
];

const story = [
  {
    year: "1982",
    title: "Founded in Tokyo.",
    body:
      "Toshimasa Aso founds ASO International, Inc. in Tokyo — a mission to bring orthodontic laboratory work up to the precision standard of top Japanese craftsmanship.",
  },
  {
    year: "1982 – 2005",
    title: "Grew into Japan's largest orthodontic lab.",
    body:
      "Production and sales centers established in Tokyo, Niigata, Nagoya, and Osaka. Built a network of 50+ domestic and international facilities over four decades.",
  },
  {
    year: "2005",
    title: "Digital first — fully systemized clear aligner.",
    body:
      "First in Japan to ship a fully systemized clear aligner workflow. ASO International Hawaii opens the same year as our first overseas production center.",
  },
  {
    year: "Now",
    title: "Global, digital, ISO 13485.",
    body:
      "Offices in Tokyo, Honolulu, Manila, and Silicon Valley. Serving 29 dental universities and practices across the Pacific. ISO 13485 quality certification across facilities.",
  },
];

const numbers = [
  { k: "40+ yrs", v: "since_founding" },
  { k: "50+", v: "facilities" },
  { k: "29", v: "dental_universities" },
  { k: "ISO 13485", v: "quality_certified" },
];

export default function AboutPage() {
  return (
    <>
      <section className="supabase-hero" style={{ paddingBottom: 64 }}>
        <div className="sb-eyebrow-pill">▸ about us</div>
        <h1>
          Japan&apos;s leading orthodontic lab — now serving{" "}
          <span className="sb-accent">Hawaii.</span>
        </h1>
        <p>
          ASO International, Inc. was founded in Tokyo in 1982 and has grown
          into Japan&apos;s largest and most advanced orthodontic laboratory.
          ASO Hawaii brings that same pipeline — CAD/CAM, ISO 13485, fully
          systemized aligners — to practices across the Pacific.
        </p>
      </section>

      <section className="supabase-section-panel">
        <div className="sb-inner">
          <div className="supabase-label">▸ three_pillars</div>
          <h2 className="supabase-section-title">
            What sets ASO International apart.
          </h2>
          <p className="supabase-section-sub">
            Four decades of orthodontic lab work, engineered into a modern
            digital pipeline.
          </p>

          <div className="supabase-card-grid">
            {pillars.map((p) => (
              <div key={p.tag} className="supabase-card sb-card-accent">
                <span className="supabase-badge" style={{ marginBottom: 14 }}>
                  {p.tag}
                </span>
                <h3 style={{ marginTop: 10 }}>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="supabase-section">
        <div className="supabase-label">▸ by_the_numbers</div>
        <h2 className="supabase-section-title">Operating footprint.</h2>
        <p className="supabase-section-sub">
          ASO International across Japan and the Pacific.
        </p>

        <div
          className="sb-hero-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 0,
          }}
        >
          {numbers.map((s, i) => (
            <div
              key={s.v}
              style={{
                padding: "28px 26px",
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
                  marginBottom: 12,
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 400,
                  color: "var(--sb-green)",
                  letterSpacing: "-0.8px",
                }}
              >
                {s.k}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="supabase-section-panel">
        <div className="sb-inner">
          <div className="supabase-label">▸ timeline</div>
          <h2 className="supabase-section-title">
            From Tokyo, 1982 → Honolulu, today.
          </h2>
          <p className="supabase-section-sub">
            A brief timeline of how we got here.
          </p>

          <div style={{ display: "grid", gap: 14 }}>
            {story.map((s) => (
              <div
                key={s.year}
                className="supabase-card"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(120px, 140px) 1fr",
                  gap: 28,
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    fontFamily:
                      "'Source Code Pro', ui-monospace, monospace",
                    fontSize: 13,
                    color: "var(--sb-green)",
                    letterSpacing: 1.2,
                    paddingTop: 4,
                  }}
                >
                  ▸ {s.year}
                </div>
                <div>
                  <h3 style={{ marginBottom: 10 }}>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="supabase-section">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <div className="supabase-label">▸ our_mission</div>
            <h2 className="supabase-section-title">
              Bringing world-class orthodontic technology to the world.
            </h2>
            <p className="supabase-section-sub">
              Delivering professional, cutting-edge orthodontic technology from
              Japan to the world. We also run seminars, technician training,
              and collaborative research with orthodontic clinicians — proud
              to serve Hawaii&apos;s dental community.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="/supabase/contact/#invitation"
                className="supabase-btn-green"
              >
                Start sending cases →
              </Link>
              <Link
                href="/supabase/product/"
                className="supabase-btn-secondary"
              >
                See our catalogue
              </Link>
            </div>
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
              ▸ global_offices
            </div>
            <dl style={{ fontSize: 14, color: "var(--sb-light-gray)" }}>
              {[
                ["tokyo", "Headquarters · est. 1982"],
                ["niigata_nagoya_osaka", "Production & sales centers"],
                ["honolulu", "First overseas lab · est. 2005"],
                ["manila", "Production center"],
                ["silicon_valley", "U.S. mainland operations"],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 1fr",
                    gap: 16,
                    padding: "10px 0",
                    borderTop:
                      i === 0 ? "none" : "1px solid var(--sb-dark-border)",
                  }}
                >
                  <dt
                    style={{
                      fontFamily:
                        "'Source Code Pro', ui-monospace, monospace",
                      fontSize: 11,
                      color: "var(--sb-mid-gray)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      paddingTop: 3,
                    }}
                  >
                    ▸ {k}
                  </dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
