import { benefits } from "@/data/content";

export default function WhyEasyRx() {
  return (
    <section id="why" className="linear-section-surface">
      <div className="linear-inner">
        <div className="linear-label">// WHY EASYRX</div>
        <h2 className="linear-section-title">
          Built for how modern orthodontic practices actually work.
        </h2>
        <p className="linear-section-sub">
          No more chasing paperwork, no more lost scans. Every case, scan, and
          note lives in one secure thread.
        </p>

        <div className="linear-card-grid">
          {benefits.map((b, i) => (
            <div key={b.title} className="linear-card">
              <div
                style={{
                  fontFamily:
                    "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--l-brand)",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                [0{i + 1}] benefit
              </div>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
