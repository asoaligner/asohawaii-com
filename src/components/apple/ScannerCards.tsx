import { scanners } from "@/data/content";

export default function ScannerCards() {
  return (
    <section id="scanners" className="apple-section">
      <div className="apple-section-label">Scanner-Specific</div>
      <h2 className="apple-section-title">
        Every major scanner. One workflow.
      </h2>
      <p className="apple-section-sub">
        Whatever chairside scanner you use, EasyRx routes it to ASO Hawaii.
      </p>

      <div className="apple-card-grid">
        {scanners.map((s) => (
          <div key={s.name} className="apple-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--a-gray-48)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {s.maker}
              </div>
              {s.pdf ? (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--a-blue)",
                    background: "rgba(0,113,227,0.1)",
                    padding: "3px 8px",
                    borderRadius: 6,
                    letterSpacing: "0.3px",
                  }}
                >
                  PDF Guide
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--a-gray-48)",
                    background: "rgba(0,0,0,0.05)",
                    padding: "3px 8px",
                    borderRadius: 6,
                    letterSpacing: "0.3px",
                  }}
                >
                  Coming Soon
                </span>
              )}
            </div>
            <h3>{s.name}</h3>
            <p>{s.body}</p>
            {s.pdf && (
              <a
                href={s.pdf}
                style={{
                  fontSize: 14,
                  color: "var(--a-link)",
                  textDecoration: "none",
                  marginTop: 16,
                  display: "inline-block",
                }}
              >
                Download setup guide &rsaquo;
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
