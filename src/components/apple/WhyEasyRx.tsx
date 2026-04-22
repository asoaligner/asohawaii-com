import { benefits } from "@/data/content";

export default function WhyEasyRx() {
  return (
    <section id="why" className="apple-section">
      <div className="apple-section-label">Why EasyRx</div>
      <h2 className="apple-section-title">
        Built for how modern practices actually work.
      </h2>
      <p className="apple-section-sub">
        No more chasing paperwork, no more lost scans. Every case submitted with
        confidence.
      </p>

      <div className="apple-card-grid">
        {benefits.map((b) => (
          <div key={b.title} className="apple-card">
            <h3>{b.title}</h3>
            <p>{b.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
