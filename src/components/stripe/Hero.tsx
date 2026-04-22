import { heroCopy } from "@/data/content";

export default function Hero() {
  return (
    <section className="stripe-hero">
      <div className="stripe-hero-inner">
        <div className="stripe-hero-eyebrow">— {heroCopy.eyebrow}</div>
        <h1>
          Submit cases to{" "}
          <span style={{ color: "var(--s-magenta)" }}>ASO Hawaii</span>{" "}
          digitally, with zero hassle.
        </h1>
        <p>{heroCopy.subhead}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="#request" className="stripe-btn-primary">
            {heroCopy.primaryCta} &rarr;
          </a>
          <a href="#how-to" className="stripe-btn-hero-ghost">
            {heroCopy.secondaryCta}
          </a>
        </div>

        <div
          style={{
            marginTop: 96,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 24,
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: 40,
          }}
        >
          {[
            { k: "150+", v: "Practices onboarded" },
            { k: "HIPAA", v: "End-to-end encryption" },
            { k: "6", v: "Scanner integrations" },
            { k: "< 1d", v: "Average setup time" },
          ].map((s) => (
            <div key={s.v}>
              <div
                style={{
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 11,
                  color: "var(--s-magenta-light)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: 8,
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 300,
                  color: "#fff",
                  letterSpacing: "-1px",
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
