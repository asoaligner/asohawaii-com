"use client";

import FormspreeForm, {
  SbField,
} from "@/components/supabase/FormspreeForm";

export default function GetAQuotePage() {
  return (
    <>
      <section className="supabase-hero" style={{ paddingBottom: 48 }}>
        <div className="sb-eyebrow-pill">▸ pricing · specs · stl</div>
        <h1>
          Get a <span className="sb-accent">quote.</span>
        </h1>
        <p>
          Fill out the form below to request a quote for ASO Hawaii products.
          Our team will respond within one business day with pricing and
          details. You may upload STL or ZIP files directly, or include any
          specific instructions in the message field.
        </p>
      </section>

      <section
        className="supabase-section-panel"
        style={{ paddingBottom: 80 }}
      >
        <div className="sb-inner">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 56,
              alignItems: "start",
            }}
          >
            <div>
              <div className="supabase-label">▸ need_help</div>
              <h2 className="supabase-section-title">
                Talk to a human, first?
              </h2>
              <p className="supabase-section-sub">
                Prefer to call? Want us to walk through a complex case before
                submitting? Reach us directly.
              </p>
              <dl
                style={{
                  fontSize: 14,
                  color: "var(--sb-light-gray)",
                  marginTop: 16,
                }}
              >
                {[
                  [
                    "phone",
                    <a
                      key="p"
                      href="tel:8089570111"
                      style={{
                        color: "var(--sb-green)",
                        textDecoration: "none",
                        fontFamily:
                          "'Source Code Pro', ui-monospace, monospace",
                      }}
                    >
                      808-957-0111
                    </a>,
                  ],
                  [
                    "email",
                    <a
                      key="e"
                      href="mailto:aso-digital@outlook.com"
                      style={{
                        color: "var(--sb-green)",
                        textDecoration: "none",
                        fontFamily:
                          "'Source Code Pro', ui-monospace, monospace",
                      }}
                    >
                      aso-digital@outlook.com
                    </a>,
                  ],
                  ["hours", "Mon–Fri · 8:00 am – 4:30 pm HST"],
                  ["response", "within 1 business day"],
                ].map(([k, v], i) => (
                  <div
                    key={String(k)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "90px 1fr",
                      gap: 16,
                      padding: "10px 0",
                      borderTop:
                        i === 0
                          ? "none"
                          : "1px solid var(--sb-dark-border)",
                    }}
                  >
                    <dt
                      style={{
                        fontFamily:
                          "'Source Code Pro', ui-monospace, monospace",
                        fontSize: 11,
                        color: "var(--sb-mid-gray)",
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        paddingTop: 3,
                      }}
                    >
                      ▸ {k}
                    </dt>
                    <dd style={{ lineHeight: 1.5 }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="supabase-form">
              <FormspreeForm
                formType="Get a Quote"
                submitLabel="send"
                successBody="Thanks — our team will review your request and reply with pricing and details within one business day."
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <SbField
                    id="q-fn"
                    name="first_name"
                    label="first_name"
                    required
                  />
                  <SbField
                    id="q-ln"
                    name="last_name"
                    label="last_name"
                    required
                  />
                </div>
                <SbField
                  id="q-clinic"
                  name="clinic_name"
                  label="clinic_name"
                  required
                />
                <SbField
                  id="q-email"
                  name="email"
                  type="email"
                  label="email_address"
                  required
                />
                <SbField
                  id="q-msg"
                  name="message"
                  label="message"
                  as="textarea"
                  required
                  placeholder="What are you quoting? Appliance type, quantity, rush service, special requirements…"
                />
                <div style={{ marginBottom: 22 }}>
                  <label className="supabase-form-label" htmlFor="q-file">
                    upload_file
                    <span
                      style={{
                        marginLeft: 8,
                        color: "var(--sb-mid-gray)",
                        textTransform: "none",
                        letterSpacing: 0,
                        fontSize: 11,
                      }}
                    >
                      STL or ZIP · optional
                    </span>
                  </label>
                  <input
                    id="q-file"
                    name="attachment"
                    type="file"
                    accept=".stl,.zip,.ply,.obj"
                    className="supabase-form-input"
                    style={{
                      padding: "10px 14px",
                      fontFamily:
                        "'Source Code Pro', ui-monospace, monospace",
                      fontSize: 12,
                    }}
                  />
                </div>
              </FormspreeForm>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
