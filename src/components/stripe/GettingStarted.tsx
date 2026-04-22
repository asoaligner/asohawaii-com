import { gettingStartedSteps } from "@/data/content";

export default function GettingStarted() {
  return (
    <section
      id="getting-started"
      className="stripe-section-shell"
      style={{ background: "#f6f9fc" }}
    >
      <div className="stripe-inner">
        <div className="stripe-label">GETTING STARTED</div>
        <h2 className="stripe-section-title">Three steps. That&apos;s it.</h2>
        <p className="stripe-section-sub">
          From first contact to sending your first case — most practices are up
          and running within a day.
        </p>

        <div className="stripe-card-grid">
          {gettingStartedSteps.map((s) => (
            <div key={s.number} className="stripe-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: "var(--s-purple)",
                    color: "#fff",
                    fontFamily: "'Source Code Pro', ui-monospace, monospace",
                    fontSize: 12,
                    fontWeight: 500,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.number}
                </span>
                <span
                  style={{
                    fontFamily: "'Source Code Pro', ui-monospace, monospace",
                    fontSize: 11,
                    color: "var(--s-slate)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  STEP {s.number}
                </span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
