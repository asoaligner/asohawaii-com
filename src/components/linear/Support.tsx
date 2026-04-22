import { company } from "@/data/content";

export default function Support() {
  return (
    <section id="support" className="linear-section-surface">
      <div className="linear-inner">
        <div className="linear-label">// SUPPORT</div>
        <h2 className="linear-section-title">
          We&apos;re here when you need us.
        </h2>
        <p className="linear-section-sub">
          For case questions, call us directly. For EasyRx software questions,
          their team is a click away.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          <div className="linear-card">
            <div
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11,
                color: "var(--l-brand)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: 14,
              }}
            >
              [lab] support
            </div>
            <h3>{company.shortName}</h3>
            <dl
              style={{
                marginTop: 20,
                fontSize: 14,
                color: "var(--l-text-secondary)",
              }}
            >
              <LinearRow label="addr" value={company.address} />
              <LinearRow
                label="phone"
                value={
                  <a
                    href={`tel:${company.phone.replace(/-/g, "")}`}
                    style={{ color: "var(--l-brand)", textDecoration: "none" }}
                  >
                    {company.phone}
                  </a>
                }
              />
              <LinearRow label="fax" value={company.fax} />
              <LinearRow
                label="email"
                value={
                  <a
                    href={`mailto:${company.email}`}
                    style={{ color: "var(--l-brand)", textDecoration: "none" }}
                  >
                    {company.email}
                  </a>
                }
              />
              <LinearRow
                label="hours"
                value={
                  <>
                    {company.hours}
                    <br />
                    <span style={{ color: "var(--l-text-quaternary)" }}>
                      {company.holidays}
                    </span>
                  </>
                }
              />
            </dl>
          </div>

          <div className="linear-card">
            <div
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11,
                color: "var(--l-brand)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: 14,
              }}
            >
              [software] support
            </div>
            <h3>EasyRx</h3>
            <p style={{ marginTop: 16 }}>
              Questions about the EasyRx platform — logging in, scanner
              integration, technical troubleshooting — are handled by the
              EasyRx support team.
            </p>
            <a
              href="https://easyrxortho.com"
              target="_blank"
              rel="noopener noreferrer"
              className="linear-btn-ghost"
              style={{ marginTop: 20 }}
            >
              Visit EasyRx support →
            </a>
          </div>
        </div>

        <div
          style={{
            marginTop: 64,
            paddingTop: 32,
            borderTop: "1px solid var(--l-border-subtle)",
            fontSize: 13,
            color: "var(--l-text-quaternary)",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            letterSpacing: "0.3px",
          }}
        >
          © {new Date().getFullYear()} {company.name} // all rights reserved
        </div>
      </div>
    </section>
  );
}

function LinearRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr",
        gap: 16,
        padding: "10px 0",
        borderBottom: "1px solid var(--l-border-subtle)",
      }}
    >
      <dt
        style={{
          fontSize: 11,
          color: "var(--l-text-quaternary)",
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          paddingTop: 3,
        }}
      >
        {label}
      </dt>
      <dd style={{ lineHeight: 1.5 }}>{value}</dd>
    </div>
  );
}
