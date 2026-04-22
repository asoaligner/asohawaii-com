import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New Products · ASO Hawaii — Latest appliance lineup",
  description:
    "ASO Hawaii's newest appliances: SomnoDent sleep devices, MSE/MARPE expanders, LuxCreo 3D-printed aligners, Zendura A retainers, SYMPHONY, SHU-Lider, and more.",
};

type Tile = {
  name: string;
  tag: string;
  blurb: string;
  category: "sleep" | "expander" | "retainer" | "aligner" | "other";
};

const tiles: Tile[] = [
  {
    name: "Keyless Expander",
    tag: "keyless_expander",
    blurb:
      "Self-activating palatal expansion without daily key turns. Lower compliance burden for younger patients.",
    category: "expander",
  },
  {
    name: "MSE / MARPE",
    tag: "mse_marpe",
    blurb:
      "Miniscrew-assisted rapid palatal expansion for skeletal correction in adolescent and adult patients.",
    category: "expander",
  },
  {
    name: "3D Metal Lingual Retainer",
    tag: "3d_metal_lingual",
    blurb:
      "CAD-designed, laser-sintered metal lingual retainers for long-term retention with superior fit.",
    category: "retainer",
  },
  {
    name: "EMA Sleep Appliance",
    tag: "ema",
    blurb:
      "Elastic mandibular advancement device for mild-to-moderate obstructive sleep apnea.",
    category: "sleep",
  },
  {
    name: "SomnoDent Flex",
    tag: "somnodent_flex",
    blurb:
      "Flexible acrylic MAD from SOMNOMED — patient-preferred for comfort in long-term wear.",
    category: "sleep",
  },
  {
    name: "SomnoDent Avant",
    tag: "somnodent_avant",
    blurb:
      "Streamlined SomnoDent design with reduced bulk and improved tongue space.",
    category: "sleep",
  },
  {
    name: "SomnoDent HAE",
    tag: "somnodent_hae",
    blurb:
      "Herbst-style advancement element for precise titration of mandibular position.",
    category: "sleep",
  },
  {
    name: "SomnoDent Fusion",
    tag: "somnodent_fusion",
    blurb:
      "Dual-laminate thermoformed base with hard occlusal surface — durable + comfortable.",
    category: "sleep",
  },
  {
    name: "Zendura A Clear Retainer",
    tag: "zendura_a",
    blurb:
      "Crack-resistant, clarity-preserving clear retainer material — stays clear through daily wear.",
    category: "retainer",
  },
  {
    name: "LuxCreo Direct-Printed Aligner",
    tag: "luxcreo_aligner",
    blurb:
      "3D-printed aligners directly from digital treatment plan — no thermoforming required.",
    category: "aligner",
  },
  {
    name: "LuxCreo Direct Print (Retainer)",
    tag: "luxcreo_retainer",
    blurb:
      "Resin-printed retainers with precise tolerance. Same pipeline as the aligner product.",
    category: "retainer",
  },
  {
    name: "MARPE",
    tag: "marpe",
    blurb:
      "Mini-implant Assisted Rapid Palatal Expansion for skeletal correction.",
    category: "expander",
  },
  {
    name: "MSE",
    tag: "mse",
    blurb:
      "Maxillary Skeletal Expander designed for efficient mid-palatal suture opening.",
    category: "expander",
  },
  {
    name: "SHU-Lider",
    tag: "shu_lider",
    blurb:
      "Guided bite-correction appliance for Class II patients — a modern take on functional therapy.",
    category: "other",
  },
  {
    name: "SYMPHONY",
    tag: "symphony",
    blurb:
      "Customized orthodontic appliance from a digital treatment plan — our CAD team will work with your Rx.",
    category: "other",
  },
];

const catLabel: Record<Tile["category"], string> = {
  sleep: "sleep_apnea",
  expander: "expander",
  retainer: "retainer",
  aligner: "aligner",
  other: "custom",
};

export default function NewProductsPage() {
  return (
    <>
      <section className="supabase-hero" style={{ paddingBottom: 56 }}>
        <div className="sb-eyebrow-pill">▸ newly launched</div>
        <h1>
          New <span className="sb-accent">products</span> from the lab.
        </h1>
        <p>
          Our latest appliances — sleep devices, MSE/MARPE expanders, direct-
          printed aligners/retainers, and CAD-engineered lingual retainers.
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
            {tiles.map((t) => (
              <div
                key={t.name}
                className="supabase-card sb-card-accent"
                style={{ display: "flex", flexDirection: "column" }}
              >
                <span
                  className="supabase-badge"
                  style={{ marginBottom: 14, alignSelf: "flex-start" }}
                >
                  ▸ {catLabel[t.category]}
                </span>
                <h3 style={{ marginTop: 10 }}>{t.name}</h3>
                <p style={{ marginBottom: 18, flexGrow: 1 }}>{t.blurb}</p>
                <div
                  style={{
                    fontFamily:
                      "'Source Code Pro', ui-monospace, monospace",
                    fontSize: 11,
                    color: "var(--sb-mid-gray)",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  [{t.tag}]
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="supabase-section"
        style={{ textAlign: "center", paddingTop: 64 }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <div className="supabase-label" style={{ textAlign: "center" }}>
            ▸ interested
          </div>
          <h2
            className="supabase-section-title"
            style={{ margin: "0 auto 20px" }}
          >
            Want a quote on any of these?
          </h2>
          <p
            className="supabase-section-sub"
            style={{ margin: "0 auto 32px" }}
          >
            Pricing depends on appliance type, complexity, and quantity. Our
            team will reply within one business day.
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
              href="/supabase/product/"
              className="supabase-btn-secondary"
            >
              See full catalogue
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
