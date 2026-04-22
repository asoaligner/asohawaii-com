import { company } from "@/data/content";

export default function Support() {
  return (
    <section id="support" className="apple-section">
      <div className="apple-section-label">Support</div>
      <h2 className="apple-section-title">We&apos;re here when you need us.</h2>
      <p className="apple-section-sub">
        For case questions, call us directly. For EasyRx software questions,
        their team is a click away.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          textAlign: "left",
        }}
      >
        <div className="apple-card">
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--a-gray-48)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 8,
            }}
          >
            Lab Support
          </div>
          <h3>{company.shortName}</h3>
          <dl style={{ marginTop: 20, fontSize: 15, color: "var(--a-gray-80)" }}>
            <AppleRow label="Address" value={company.address} />
            <AppleRow
              label="Phone"
              value={
                <a href={`tel:${company.phone.replace(/-/g, "")}`} style={{ color: "var(--a-link)" }}>
                  {company.phone}
                </a>
              }
            />
            <AppleRow label="Fax" value={company.fax} />
            <AppleRow
              label="Email"
              value={
                <a
                  href={`mailto:${company.email}`}
                  style={{ color: "var(--a-link)" }}
                >
                  {company.email}
                </a>
              }
            />
            <AppleRow
              label="Hours"
              value={
                <>
                  {company.hours}
                  <br />
                  <span style={{ color: "var(--a-gray-48)" }}>
                    {company.holidays}
                  </span>
                </>
              }
            />
          </dl>
        </div>

        <div className="apple-card">
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--a-gray-48)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 8,
            }}
          >
            Software Support
          </div>
          <h3>EasyRx</h3>
          <p style={{ marginTop: 16 }}>
            Questions about the EasyRx platform — logging in, scanner
            integration, or technical troubleshooting — are handled directly by
            the EasyRx support team.
          </p>
          <a
            href="https://easyrxortho.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 24,
              display: "inline-block",
              fontSize: 14,
              color: "var(--a-link)",
            }}
          >
            Visit EasyRx support &rsaquo;
          </a>
        </div>
      </div>

      <div
        style={{
          marginTop: 64,
          paddingTop: 32,
          borderTop: "1px solid var(--a-border)",
          fontSize: 12,
          color: "var(--a-gray-48)",
          textAlign: "center",
        }}
      >
        © {new Date().getFullYear()} {company.name}. All rights reserved.
      </div>
    </section>
  );
}

function AppleRow({
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
        gridTemplateColumns: "90px 1fr",
        gap: 16,
        padding: "8px 0",
      }}
    >
      <dt
        style={{
          fontSize: 12,
          color: "var(--a-gray-48)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontWeight: 600,
          paddingTop: 2,
        }}
      >
        {label}
      </dt>
      <dd style={{ lineHeight: 1.5 }}>{value}</dd>
    </div>
  );
}
