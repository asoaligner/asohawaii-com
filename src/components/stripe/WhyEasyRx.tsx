import { benefits } from "@/data/content";

export default function WhyEasyRx() {
  return (
    <section id="why" className="stripe-section">
      <div className="stripe-label">WHY EASYRX</div>
      <h2 className="stripe-section-title">
        Built for how modern orthodontic practices actually work.
      </h2>
      <p className="stripe-section-sub">
        No more chasing paperwork, no more lost scans. Every case, scan, and
        note in one secure thread.
      </p>

      <div className="stripe-card-grid">
        {benefits.map((b, i) => (
          <div key={b.title} className="stripe-card">
            <div
              style={{
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
                fontSize: 11,
                color: "var(--s-purple)",
                fontWeight: 500,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              0{i + 1} / Benefit
            </div>
            <h3>{b.title}</h3>
            <p>{b.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
