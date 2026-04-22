"use client";

import FormspreeForm, {
  SbField,
} from "@/components/supabase/FormspreeForm";

export default function PickUpPage() {
  return (
    <>
      <section className="supabase-hero" style={{ paddingBottom: 40 }}>
        <div className="sb-eyebrow-pill">▸ oahu · afternoon pickup</div>
        <h1>
          Pick-up <span className="sb-accent">request form.</span>
        </h1>
        <p>
          Our driver covers Oahu, Monday–Friday, 1:00 pm – 4:00 pm. Pickups
          cannot be scheduled to a precise time — the driver arrives based on
          route.
        </p>
      </section>

      <section className="supabase-section" style={{ paddingTop: 16 }}>
        <div
          style={{
            maxWidth: 880,
            margin: "0 auto",
          }}
        >
          <div
            className="supabase-card"
            style={{
              borderLeft: "3px solid var(--sb-green)",
              background: "rgba(62,207,142,0.06)",
              borderTop: "1px solid rgba(62,207,142,0.25)",
              borderRight: "1px solid rgba(62,207,142,0.25)",
              borderBottom: "1px solid rgba(62,207,142,0.25)",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                }}
              >
                ⚠️
              </span>
              <div
                style={{
                  fontFamily: "'Source Code Pro', ui-monospace, monospace",
                  fontSize: 11,
                  color: "var(--sb-green)",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                ▸ same_day_after_12pm
              </div>
            </div>
            <p
              style={{
                fontSize: 16,
                color: "var(--sb-off-white)",
                lineHeight: 1.55,
              }}
            >
              For same-day pickup requests after 12:00 pm, please call us
              directly at{" "}
              <a
                href="tel:8089570111"
                style={{
                  color: "var(--sb-green)",
                  textDecoration: "none",
                  fontFamily:
                    "'Source Code Pro', ui-monospace, monospace",
                  fontWeight: 600,
                }}
              >
                808-957-0111
              </a>
              . Form submissions after noon may not be picked up the same day.
            </p>
          </div>

          <div className="supabase-form">
            <FormspreeForm
              formType="Pick-Up Request"
              submitLabel="submit_pick_up_request"
              successBody="Thanks — our courier team will contact you to confirm the pickup window within one business day (or sooner if it's a same-day request phoned in)."
            >
              <SbField
                id="pu-doc"
                name="doctor_name"
                label="doctors_name"
                required
              />
              <SbField
                id="pu-prac"
                name="practice_name"
                label="practice_name"
              />
              <SbField
                id="pu-addr"
                name="address"
                label="address"
                required
                placeholder="pickup street address"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <SbField
                  id="pu-phone"
                  name="phone"
                  type="tel"
                  label="phone_number"
                  required
                />
                <SbField
                  id="pu-date"
                  name="pickup_date"
                  type="date"
                  label="pick_up_date"
                  required
                />
              </div>
              <SbField
                id="pu-notes"
                name="notes"
                label="notes"
                as="textarea"
                placeholder="items to pick up, gate codes, special instructions…"
              />
            </FormspreeForm>
          </div>
        </div>
      </section>
    </>
  );
}
