import { gettingStartedSteps } from "@/data/content";

export default function GettingStarted() {
  return (
    <section id="getting-started" className="linear-section">
      <div className="linear-label">// GETTING STARTED</div>
      <h2 className="linear-section-title">Three steps. That&apos;s it.</h2>
      <p className="linear-section-sub">
        From first contact to sending your first case — most practices are up
        and running within a day.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        {gettingStartedSteps.map((s) => (
          <div key={s.number} className="linear-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "rgba(94,106,210,0.1)",
                  color: "var(--l-brand)",
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(94,106,210,0.25)",
                }}
              >
                {s.number}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 11,
                  color: "var(--l-text-quaternary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                STEP
              </span>
            </div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
