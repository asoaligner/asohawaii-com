import Image from "next/image";
import Link from "next/link";
import { company } from "@/data/content";

export default function SharedFooter() {
  return (
    <footer className="supabase-foot">
      <div className="supabase-foot-inner">
        <div className="supabase-foot-grid">
          <div>
            <div className="supabase-foot-label">▸ address</div>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.75,
                color: "var(--sb-off-white)",
              }}
            >
              1441 Kapiolani Blvd #1112
              <br />
              Honolulu, HI 96814
            </p>
            <dl
              style={{
                marginTop: 20,
                display: "grid",
                gap: 8,
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
                fontSize: 13,
                color: "var(--sb-light-gray)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "50px 1fr",
                  gap: 12,
                }}
              >
                <dt style={{ color: "var(--sb-mid-gray)" }}>tel</dt>
                <dd>
                  <a
                    href={`tel:${company.phone.replace(/-/g, "")}`}
                    style={{
                      color: "var(--sb-green)",
                      textDecoration: "none",
                    }}
                  >
                    {company.phone}
                  </a>
                </dd>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "50px 1fr",
                  gap: 12,
                }}
              >
                <dt style={{ color: "var(--sb-mid-gray)" }}>fax</dt>
                <dd>{company.fax}</dd>
              </div>
            </dl>
          </div>

          <div>
            <div className="supabase-foot-label">▸ opening_hours</div>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.75,
                color: "var(--sb-off-white)",
              }}
            >
              Monday – Friday
              <br />
              8:00 am – 4:30 pm
            </p>
            <p
              style={{
                fontSize: 13,
                marginTop: 12,
                color: "var(--sb-mid-gray)",
                fontFamily: "'Source Code Pro', ui-monospace, monospace",
              }}
            >
              Closed on Federal Holidays
            </p>
          </div>

          <div>
            <div className="supabase-foot-label">▸ aso_hawaii</div>
            <div className="supabase-foot-logo-wrap">
              <Image
                src="/images/aso/aso-logo.png"
                alt="ASO International, Inc"
                width={200}
                height={70}
                style={{
                  width: "auto",
                  height: "46px",
                  objectFit: "contain",
                }}
              />
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--sb-mid-gray)",
                lineHeight: 1.7,
                marginTop: 14,
              }}
            >
              A Pioneer in Orthodontic Laboratory Services.
              <br />
              ASO International, Inc.
            </p>
          </div>

          <div>
            <div className="supabase-foot-label">▸ connect</div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: 10,
              }}
            >
              <li>
                <Link
                  href="/supabase/contact/"
                  className="sb-footer-link"
                  style={{
                    fontSize: 14,
                    color: "var(--sb-light-gray)",
                    textDecoration: "none",
                  }}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/supabase/#faq"
                  className="sb-footer-link"
                  style={{
                    fontSize: 14,
                    color: "var(--sb-light-gray)",
                    textDecoration: "none",
                  }}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href="https://easyrxcloud.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sb-footer-link"
                  style={{
                    fontSize: 14,
                    color: "var(--sb-light-gray)",
                    textDecoration: "none",
                  }}
                >
                  EasyRx Login ↗
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="sb-footer-link"
                  style={{
                    fontSize: 14,
                    color: "var(--sb-light-gray)",
                    textDecoration: "none",
                  }}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/aso.orthodonticslab.honolulu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sb-footer-link"
                  style={{
                    fontSize: 14,
                    color: "var(--sb-light-gray)",
                    textDecoration: "none",
                  }}
                >
                  Instagram ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="supabase-foot-copy">
          <span>
            © {new Date().getFullYear()} {company.name} // all rights reserved
          </span>
        </div>
      </div>
    </footer>
  );
}
