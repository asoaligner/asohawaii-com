import { howToSteps } from "@/data/content";

export default function HowToSubmit() {
  return (
    <section id="how-to" className="apple-section-dark">
      <div className="apple-inner">
        <div className="apple-section-label">How to Submit</div>
        <h2 className="apple-section-title">
          From scan to submission in under five minutes.
        </h2>
        <p
          className="apple-section-sub"
          style={{ color: "rgba(255,255,255,0.72)" }}
        >
          A repeatable, six-step workflow your team can master on day one.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            textAlign: "left",
          }}
        >
          {howToSteps.map((s) => (
            <div key={s.n} className="apple-card-dark">
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 200,
                  color: "var(--a-link-dark)",
                  letterSpacing: "-2px",
                  lineHeight: 1,
                  marginBottom: 20,
                }}
              >
                {s.n}
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
