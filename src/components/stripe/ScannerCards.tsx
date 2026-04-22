import { scanners } from "@/data/content";

export default function ScannerCards() {
  return (
    <section
      id="scanners"
      className="stripe-section-shell"
      style={{ background: "#f6f9fc" }}
    >
      <div className="stripe-inner">
        <div className="stripe-label">SCANNER INTEGRATIONS</div>
        <h2 className="stripe-section-title">
          Every major scanner. One workflow.
        </h2>
        <p className="stripe-section-sub">
          Whatever chairside scanner you use, EasyRx routes it to ASO Hawaii.
        </p>

        <div className="stripe-card-grid">
          {scanners.map((s) => (
            <div key={s.name} className="stripe-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontFamily:
                      "'Source Code Pro', ui-monospace, monospace",
                    fontSize: 11,
                    color: "var(--s-slate)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {s.maker}
                </div>
                {s.pdf ? (
                  <span className="stripe-badge">PDF Guide</span>
                ) : (
                  <span className="stripe-badge-neutral">Coming Soon</span>
                )}
              </div>
              <h3>{s.name}</h3>
              <p>{s.body}</p>
              {s.pdf && (
                <a
                  href={s.pdf}
                  style={{
                    marginTop: 18,
                    display: "inline-block",
                    fontSize: 14,
                    color: "var(--s-purple)",
                    textDecoration: "none",
                  }}
                >
                  Download setup guide &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
