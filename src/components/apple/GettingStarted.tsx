import { gettingStartedSteps } from "@/data/content";

export default function GettingStarted() {
  return (
    <section id="getting-started" className="apple-section-gray">
      <div className="apple-inner">
        <div className="apple-section-label">Getting Started</div>
        <h2 className="apple-section-title">Three steps. That&apos;s it.</h2>
        <p className="apple-section-sub">
          From first contact to sending your first case — most practices are up
          and running within a day.
        </p>

        <div className="apple-card-grid">
          {gettingStartedSteps.map((s) => (
            <div key={s.number} className="apple-card">
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--a-blue)",
                  letterSpacing: "0.5px",
                  marginBottom: 16,
                }}
              >
                STEP {s.number}
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
