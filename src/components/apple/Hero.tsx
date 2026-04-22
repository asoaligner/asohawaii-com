import { heroCopy } from "@/data/content";

export default function Hero() {
  return (
    <section className="apple-hero">
      <div className="apple-eyebrow">{heroCopy.eyebrow}</div>
      <h1>{heroCopy.headline}</h1>
      <p>{heroCopy.subhead}</p>
      <div
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <a href="#request" className="apple-btn-blue">
          {heroCopy.primaryCta}
        </a>
        <a href="#how-to" className="apple-btn-outline">
          {heroCopy.secondaryCta} &rsaquo;
        </a>
      </div>

      <div
        style={{
          marginTop: 64,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 24,
          maxWidth: 700,
          margin: "64px auto 0",
          textAlign: "center",
        }}
      >
        {[
          { k: "150+", v: "Practices" },
          { k: "HIPAA", v: "Compliance" },
          { k: "All", v: "Scanners" },
          { k: "Same-day", v: "Onboarding" },
        ].map((s) => (
          <div key={s.v}>
            <div
              style={{
                fontSize: 40,
                fontWeight: 600,
                letterSpacing: "-0.5px",
                color: "var(--a-black)",
              }}
            >
              {s.k}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--a-gray-48)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginTop: 4,
                fontWeight: 600,
              }}
            >
              {s.v}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
