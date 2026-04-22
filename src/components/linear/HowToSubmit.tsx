import { howToSteps } from "@/data/content";

export default function HowToSubmit() {
  return (
    <section id="how-to" className="linear-section-dark">
      <div className="linear-inner">
        <div className="linear-label">// HOW TO SUBMIT</div>
        <h2 className="linear-section-title">
          From scan to submission in under five minutes.
        </h2>
        <p className="linear-section-sub">
          A repeatable, six-step workflow your team can master on day one.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {howToSteps.map((s) => (
            <div
              key={s.n}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--l-accent)",
                  letterSpacing: "0.8px",
                  marginBottom: 14,
                }}
              >
                step_{s.n}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 590,
                  color: "#fff",
                  marginBottom: 8,
                  letterSpacing: "-0.3px",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.6,
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
