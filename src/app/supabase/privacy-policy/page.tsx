import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · ASO International Hawaii",
  description:
    "Privacy policy for ASO International Hawaii — what information we collect, how we use it, data storage, cookies, third-party services, and your rights.",
};

const sections = [
  {
    n: "01",
    title: "Introduction",
    body: (
      <>
        ASO International Hawaii is committed to protecting the privacy of its
        customers and website visitors. This policy outlines how we collect,
        use, and safeguard information submitted through our website and
        services.
      </>
    ),
  },
  {
    n: "02",
    title: "Information We Collect",
    body: (
      <>
        We may collect the following personal information when you interact
        with our services:
        <ul
          style={{
            marginTop: 12,
            paddingLeft: 20,
            display: "grid",
            gap: 6,
          }}
        >
          <li>Name, email address, and phone number</li>
          <li>Practice or clinic details (clinic name, address)</li>
          <li>Order or pick-up request information</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          This information is collected when you fill out contact or service
          forms, reach us by email or phone, or submit a pick-up or order
          request.
        </p>
      </>
    ),
  },
  {
    n: "03",
    title: "How We Use Your Information",
    body: (
      <>
        We use your information to:
        <ul
          style={{
            marginTop: 12,
            paddingLeft: 20,
            display: "grid",
            gap: 6,
          }}
        >
          <li>Process and fulfill your orders or pick-up requests</li>
          <li>
            Communicate with you about your orders, inquiries, or updates
          </li>
          <li>Improve our services and respond effectively to your needs</li>
          <li>Maintain internal records</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          We do not sell or rent your personal information to third parties.
        </p>
      </>
    ),
  },
  {
    n: "04",
    title: "Data Storage and Security",
    body: (
      <>
        Your information is stored securely and we take reasonable
        precautions to protect it against unauthorized access, disclosure, or
        alteration. Transmission between practices and our lab is encrypted
        via EasyRx and standard TLS.
      </>
    ),
  },
  {
    n: "05",
    title: "Cookies",
    body: (
      <>
        Our website may use cookies to enhance your browsing experience. You
        can choose to disable cookies through your browser settings if you
        prefer.
      </>
    ),
  },
  {
    n: "06",
    title: "Third-Party Services",
    body: (
      <>
        We may use third-party services (e.g. Wix Forms, Google Forms,
        EasyRx) to support our operations. Each of these providers has its
        own privacy policy, which we encourage you to review.
      </>
    ),
  },
  {
    n: "07",
    title: "Your Rights",
    body: (
      <>
        You have the right to request access to, correction of, or deletion
        of your personal information. To exercise these rights, contact us
        at{" "}
        <a
          href="mailto:asohawaii@hotmail.com"
          style={{
            color: "var(--sb-green)",
            textDecoration: "none",
            fontFamily: "'Source Code Pro', ui-monospace, monospace",
          }}
        >
          asohawaii@hotmail.com
        </a>
        .
      </>
    ),
  },
  {
    n: "08",
    title: "Updates to This Policy",
    body: (
      <>
        This policy may be updated from time to time. The latest version will
        always be available on this page.
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="supabase-hero" style={{ paddingBottom: 40 }}>
        <div className="sb-eyebrow-pill">▸ effective 2025.06.13</div>
        <h1>
          Privacy <span className="sb-accent">policy.</span>
        </h1>
        <p>
          What we collect, how we use it, and how to exercise your rights.
        </p>
      </section>

      <section
        className="supabase-section"
        style={{ paddingTop: 0, paddingBottom: 64 }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {sections.map((s) => (
            <div
              key={s.n}
              style={{
                borderLeft: "1px solid var(--sb-dark-border)",
                paddingLeft: 32,
                paddingBottom: 40,
                marginBottom: 40,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -16,
                  top: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 9999,
                  background: "var(--sb-near-black)",
                  border: "1px solid var(--sb-dark-border)",
                  color: "var(--sb-green)",
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.n}
              </div>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: "var(--sb-off-white)",
                  marginBottom: 14,
                  letterSpacing: "-0.3px",
                }}
              >
                {s.title}
              </h2>
              <div
                style={{
                  color: "var(--sb-light-gray)",
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                {s.body}
              </div>
            </div>
          ))}

          <div
            style={{
              padding: "32px 32px",
              background: "var(--sb-dark)",
              border: "1px solid var(--sb-dark-border)",
              borderRadius: 12,
              marginTop: 48,
            }}
          >
            <div
              style={{
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
                fontSize: 11,
                color: "var(--sb-green)",
                textTransform: "uppercase",
                letterSpacing: 1.2,
                marginBottom: 14,
              }}
            >
              ▸ contact
            </div>
            <p
              style={{
                fontSize: 15,
                color: "var(--sb-off-white)",
                lineHeight: 1.7,
              }}
            >
              <strong>ASO International Hawaii, Inc.</strong>
              <br />
              1441 Kapiolani Blvd #1112
              <br />
              Honolulu, HI 96814
            </p>
            <p
              style={{
                fontSize: 14,
                color: "var(--sb-light-gray)",
                marginTop: 16,
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
              }}
            >
              ▸ phone{" "}
              <a
                href="tel:8089570111"
                style={{ color: "var(--sb-green)", textDecoration: "none" }}
              >
                808-957-0111
              </a>
              <br />▸ email{" "}
              <a
                href="mailto:asohawaii@hotmail.com"
                style={{ color: "var(--sb-green)", textDecoration: "none" }}
              >
                asohawaii@hotmail.com
              </a>
            </p>
          </div>

          <div style={{ marginTop: 40, textAlign: "center" }}>
            <Link
              href="/supabase/"
              style={{
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
                fontSize: 13,
                color: "var(--sb-green)",
                textDecoration: "none",
              }}
            >
              ← back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
