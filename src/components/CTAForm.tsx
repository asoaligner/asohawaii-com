"use client";

import { useState } from "react";
import { FORMSPREE_ENDPOINT, FORMSPREE_READY } from "@/data/config";

const scannerOptions = [
  "iTero",
  "Medit",
  "Shining 3D",
  "3Shape TRIOS",
  "Primescan",
  "DEXIS",
  "Other",
];

type Status = "idle" | "submitting" | "success" | "error";

export default function CTAForm() {
  const [scanners, setScanners] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const submitted = status === "success";

  function toggleScanner(s: string) {
    setScanners((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("_formType", "EasyRx Invitation Request");
    data.append("_subject", "[ASO Hawaii] EasyRx Invitation Request");
    data.append("scanners_in_use", scanners.join(", "));
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        const body = await res.json().catch(() => null);
        setErrorMsg(body?.error ?? `Request failed (${res.status}).`);
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error.");
      setStatus("error");
    }
  }

  return (
    <section id="request" className="py-24 md:py-32 bg-navy text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #F97316 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          <div className="lg:pr-6">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Request Invitation
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-tightest text-balance">
              Ready to send your first digital case?
            </h2>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-lg">
              Tell us a bit about your practice. We&apos;ll send your EasyRx
              invitation — most activations complete the same business day.
            </p>

            <ul className="mt-10 space-y-3 text-white/80 text-[15px]">
              {[
                "No setup fee. No per-case charge.",
                "Works with every major scanner.",
                "HIPAA-compliant by design.",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-brandOrange/20 text-brandOrange flex items-center justify-center">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8l3 3 7-7" />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-7 sm:p-9">
            {submitted ? (
              <div className="text-center py-10">
                <div className="mx-auto w-14 h-14 rounded-full bg-brandOrange/20 text-brandOrange flex items-center justify-center mb-5">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl">Thanks — we&apos;ll be in touch.</h3>
                <p className="mt-3 text-white/70 text-[15px] max-w-sm mx-auto">
                  Our team will verify your practice and send your EasyRx
                  invitation shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {!FORMSPREE_READY && (
                  <div className="text-[11px] text-brandOrange bg-brandOrange/5 border border-brandOrange/25 rounded-md px-3 py-2">
                    <span className="font-serif italic">dev notice</span> — set{" "}
                    <code className="font-mono">
                      NEXT_PUBLIC_FORMSPREE_ENDPOINT
                    </code>{" "}
                    in .env.local to enable delivery.
                  </div>
                )}
                <Field label="Doctor's Name" name="doctor_name" required />
                <Field label="Practice Name" name="practice_name" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" type="tel" required />

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-3">
                    Scanners in use
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {scannerOptions.map((s) => {
                      const active = scanners.includes(s);
                      return (
                        <button
                          type="button"
                          key={s}
                          onClick={() => toggleScanner(s)}
                          className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
                            active
                              ? "bg-brandOrange text-white border-brandOrange"
                              : "bg-transparent text-white/80 border-white/20 hover:border-white/50"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {status === "error" && errorMsg && (
                  <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full inline-flex items-center justify-center gap-2 bg-brandOrange text-white font-medium px-6 py-3.5 rounded-full hover:bg-brandOrange/90 transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "submitting"
                    ? "Submitting…"
                    : "Send my invitation request"}
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </button>

                <p className="text-xs text-white/50 text-center">
                  By submitting you agree to be contacted by ASO International
                  Hawaii regarding EasyRx setup.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs uppercase tracking-widest text-white/60 mb-2"
      >
        {label}
        {required && <span className="text-brandOrange ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full bg-white/[0.03] border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brandOrange focus:bg-white/[0.06] transition-colors"
      />
    </div>
  );
}
