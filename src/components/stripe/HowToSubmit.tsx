import { howToSteps } from "@/data/content";

export default function HowToSubmit() {
  return (
    <section id="how-to" className="stripe-section">
      <div className="stripe-label">HOW TO SUBMIT</div>
      <h2 className="stripe-section-title">
        From scan to submission in under five minutes.
      </h2>
      <p className="stripe-section-sub">
        A repeatable, six-step workflow your team can master on day one.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {howToSteps.map((s) => (
          <div key={s.n} className="stripe-card">
            <div
              style={{
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--s-slate)",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              STEP // {s.n}
            </div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
