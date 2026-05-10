"use client";

/**
 * Self-contained labeled password input with show/hide toggle.
 *
 * Why a dedicated component (instead of a `type: "password"` branch in
 * a generic Field):
 *   - We want every password field to have the eye toggle without each
 *     caller wiring up state and SVGs.
 *   - The `name` attribute is critical for Chrome's password manager;
 *     callers should be steered toward setting it explicitly here.
 *   - The toggle button must NOT be a submit (type="button") — easy to
 *     forget at the call site, hide it inside the component.
 */

import { useId, useState } from "react";

interface Props {
  id: string;
  /** Browser autofill heuristic uses this — set to e.g. "password" or
   *  "new-password" so Chrome can group the field with stored creds. */
  name?: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  /** "current-password" for sign-in / change-password current field;
   *  "new-password" for password creation / new + confirm pairs. */
  autoComplete?: "current-password" | "new-password";
  required?: boolean;
  placeholder?: string;
  hint?: string;
}

export default function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete = "current-password",
  required,
  placeholder,
  hint,
}: Props) {
  const [show, setShow] = useState(false);
  const hintId = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name ?? autoComplete}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          aria-describedby={hint ? hintId : undefined}
          className="w-full rounded-xl border border-gray-200 bg-white pl-3.5 pr-11 py-2.5 text-[14.5px] text-navy focus:border-navy focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-50 transition-colors"
        >
          {show ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
      </div>
      {hint && (
        <p id={hintId} className="mt-1 text-[11.5px] text-gray-500 leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
