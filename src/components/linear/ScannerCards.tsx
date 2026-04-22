import { scanners } from "@/data/content";

export default function ScannerCards() {
  return (
    <section id="scanners" className="linear-section-surface">
      <div className="linear-inner">
        <div className="linear-label">// SCANNER INTEGRATIONS</div>
        <h2 className="linear-section-title">
          Every major scanner. One workflow.
        </h2>
        <p className="linear-section-sub">
          Whatever chairside scanner you use, EasyRx routes it to ASO Hawaii.
        </p>

        <div className="linear-card-grid">
          {scanners.map((s) => (
            <div key={s.name} className="linear-card">
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
                      "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 11,
                    color: "var(--l-text-quaternary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {s.maker}
                </div>
                {s.pdf ? (
                  <span className="linear-badge">PDF Guide</span>
                ) : (
                  <span className="linear-badge-neutral">Coming Soon</span>
                )}
              </div>
              <h3>{s.name}</h3>
              <p>{s.body}</p>
              {s.pdf && (
                <a
                  href={s.pdf}
                  style={{
                    marginTop: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 510,
                    color: "var(--l-brand)",
                    textDecoration: "none",
                  }}
                >
                  Download setup guide <span>→</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
