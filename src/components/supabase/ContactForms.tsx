"use client";

import { useState } from "react";
import { scannerOptions } from "@/data/content";
import FormspreeForm, {
  SbField,
} from "@/components/supabase/FormspreeForm";

export function InvitationForm() {
  const [sel, setSel] = useState<string[]>([]);
  function toggle(s: string) {
    setSel((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }
  return (
    <FormspreeForm
      formType="EasyRx Invitation Request"
      submitLabel="send_invitation_request"
    >
      <SbField id="c-inv-doc" name="doctor_name" label="doctors_name" required />
      <SbField
        id="c-inv-prac"
        name="practice_name"
        label="practice_name"
        required
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        <SbField
          id="c-inv-email"
          name="email"
          type="email"
          label="email"
          required
        />
        <SbField
          id="c-inv-phone"
          name="phone"
          type="tel"
          label="phone"
          required
        />
      </div>
      <SbField
        id="c-inv-addr"
        name="clinic_address"
        label="clinic_address"
        placeholder="optional"
      />
      <div style={{ marginBottom: 22 }}>
        <label className="supabase-form-label">scanners_in_use</label>
        <div className="sb-chip-row" style={{ marginTop: 8 }}>
          {scannerOptions.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => toggle(s)}
              className={`supabase-chip ${sel.includes(s) ? "active" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="hidden"
          name="scanners_in_use"
          value={sel.join(", ")}
        />
      </div>
    </FormspreeForm>
  );
}

export function PickupForm() {
  return (
    <FormspreeForm
      formType="Pick-up Request"
      submitLabel="request_pickup"
      successBody="Our courier team will call to confirm the pick-up window within one business day."
    >
      <SbField
        id="c-pick-prac"
        name="practice_name"
        label="practice_name"
        required
      />
      <SbField
        id="c-pick-contact"
        name="contact_name"
        label="contact_name"
        required
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        <SbField
          id="c-pick-phone"
          name="phone"
          type="tel"
          label="phone"
          required
        />
        <SbField
          id="c-pick-email"
          name="email"
          type="email"
          label="email"
          required
        />
      </div>
      <SbField
        id="c-pick-addr"
        name="pickup_address"
        label="pickup_address"
        required
      />
      <SbField
        id="c-pick-when"
        name="preferred_window"
        label="preferred_window"
        placeholder="e.g. Tue afternoon, any morning this week"
      />
      <SbField
        id="c-pick-notes"
        name="notes"
        label="items_to_pickup"
        as="textarea"
        placeholder="What should our courier collect? (impressions, models, returns…)"
      />
    </FormspreeForm>
  );
}

export function GeneralForm() {
  return (
    <FormspreeForm
      formType="General Inquiry"
      submitLabel="send_message"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        <SbField id="c-gen-name" name="name" label="name" required />
        <SbField
          id="c-gen-prac"
          name="practice_name"
          label="practice_name"
          placeholder="optional"
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        <SbField
          id="c-gen-email"
          name="email"
          type="email"
          label="email"
          required
        />
        <SbField
          id="c-gen-phone"
          name="phone"
          type="tel"
          label="phone"
          placeholder="optional"
        />
      </div>
      <SbField
        id="c-gen-subject"
        name="subject"
        label="subject"
        placeholder="e.g. quote for 20 clear retainers"
        required
      />
      <SbField
        id="c-gen-msg"
        name="message"
        label="message"
        as="textarea"
        required
      />
    </FormspreeForm>
  );
}
