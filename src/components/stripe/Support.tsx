import { company } from "@/data/content";

export default function Support() {
  return (
    <section id="support" className="stripe-section">
      <div className="stripe-label">SUPPORT</div>
      <h2 className="stripe-section-title">We&apos;re here when you need us.</h2>
      <p className="stripe-section-sub">
        For case questions, call us directly. For EasyRx software questions,
        their team is a click away.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        <div className="stripe-card">
          <div
            style={{
              fontFamily: "'Source Code Pro', ui-monospace, monospace",
              fontSize: 11,
              color: "var(--s-purple)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 14,
            }}
          >
            LAB_SUPPORT
          </div>
          <h3>{company.shortName}</h3>
          <dl
            style={{
              marginTop: 20,
              fontSize: 14,
              color: "var(--s-dark-slate)",
              fontWeight: 400,
            }}
          >
            <StripeRow label="ADDR" value={company.address} />
            <StripeRow
              label="PHONE"
              value={
                <a
                  href={`tel:${company.phone.replace(/-/g, "")}`}
                  style={{ color: "var(--s-purple)", textDecoration: "none" }}
                >
                  {company.phone}
                </a>
              }
            />
            <StripeRow label="FAX" value={company.fax} />
            <StripeRow
              label="EMAIL"
              value={
                <a
                  href={`mailto:${company.email}`}
                  style={{ color: "var(--s-purple)", textDecoration: "none" }}
                >
                  {company.email}
                </a>
              }
            />
            <StripeRow
              label="HOURS"
              value={
                <>
                  {company.hours}
                  <br />
                  <span style={{ color: "var(--s-slate)" }}>
                    {company.holidays}
                  </span>
                </>
              }
            />
          </dl>
        </div>

        <div className="stripe-card">
          <div
            style={{
              fontFamily: "'Source Code Pro', ui-monospace, monospace",
              fontSize: 11,
              color: "var(--s-purple)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 14,
            }}
          >
            SOFTWARE_SUPPORT
          </div>
          <h3>EasyRx</h3>
          <p style={{ marginTop: 16 }}>
            Questions about the EasyRx platform — logging in, scanner
            integration, technical troubleshooting — are handled directly by the
            EasyRx support team.
          </p>
          <a
            href="https://easyrxortho.com"
            target="_blank"
            rel="noopener noreferrer"
            className="stripe-btn-ghost"
            style={{ marginTop: 24 }}
          >
            Visit EasyRx support &rarr;
          </a>
        </div>
      </div>

      <div
        style={{
          marginTop: 64,
          paddingTop: 32,
          borderTop: "1px solid var(--s-border)",
          fontSize: 13,
          color: "var(--s-slate)",
          fontFamily: "'Source Code Pro', ui-monospace, monospace",
          letterSpacing: "0.5px",
        }}
      >
        © {new Date().getFullYear()} {company.name} · All rights reserved
      </div>
    </section>
  );
}

function StripeRow({
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
        padding: "8px 0",
        borderBottom: "1px solid var(--s-border)",
      }}
    >
      <dt
        style={{
          fontSize: 11,
          color: "var(--s-slate)",
          fontFamily: "'Source Code Pro', ui-monospace, monospace",
          letterSpacing: "0.8px",
          paddingTop: 2,
        }}
      >
        {label}
      </dt>
      <dd style={{ lineHeight: 1.5 }}>{value}</dd>
    </div>
  );
}
