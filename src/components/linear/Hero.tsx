import { heroCopy } from "@/data/content";

export default function Hero() {
  return (
    <section className="linear-hero">
      <div className="linear-hero-eyebrow">{heroCopy.eyebrow}</div>
      <h1>
        Submit cases to <span className="linear-hero-accent">ASO Hawaii</span>{" "}
        digitally, with zero hassle.
      </h1>
      <p>{heroCopy.subhead}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="#request" className="linear-btn-brand">
          {heroCopy.primaryCta}
          <span style={{ opacity: 0.7, marginLeft: 2 }}>↗</span>
        </a>
        <a href="#how-to" className="linear-btn-ghost">
          {heroCopy.secondaryCta}
        </a>
      </div>

      <div
        style={{
          marginTop: 80,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 0,
          border: "1px solid var(--l-border-subtle)",
          borderRadius: 12,
          background: "var(--l-bg-surface)",
          boxShadow: "var(--l-shadow-card)",
          overflow: "hidden",
        }}
      >
        {[
          { k: "150+", v: "Practices onboarded" },
          { k: "HIPAA", v: "End-to-end encryption" },
          { k: "6", v: "Scanner integrations" },
          { k: "< 1 day", v: "Average setup time" },
        ].map((s, i) => (
          <div
            key={s.v}
            style={{
              padding: "24px 28px",
              borderLeft:
                i === 0 ? "none" : "1px solid var(--l-border-subtle)",
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11,
                color: "var(--l-text-quaternary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: 10,
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 590,
                letterSpacing: "-0.8px",
                color: "var(--l-text-primary)",
              }}
            >
              {s.k}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
