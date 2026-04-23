"use client";

import { OriginalForm, OrigField } from "@/components/OriginalForm";

const DROPBOX_UPLOAD_URL =
  "https://www.dropbox.com/request/qyzCwOz9KVlxBTerdIoU";

export default function GetAQuotePage() {
  return (
    <>
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              Pricing &amp; specs
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] tracking-tightest text-navy text-balance">
              Get a <span className="italic text-brandOrange">quote.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Fill out the form below to request a quote for ASO Hawaii
              products. Our team will respond within one business day with
              pricing and details. You may upload STL or ZIP files directly, or
              include any specific instructions in the message field.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
            <div className="lg:col-span-5">
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
                Prefer to talk?
              </div>
              <h2 className="font-serif text-3xl leading-[1.15] tracking-tightest text-navy text-balance">
                Reach us <span className="italic">directly.</span>
              </h2>
              <p className="mt-5 text-gray-600 leading-relaxed">
                Want to walk through a complex case before submitting? We&apos;re
                happy to explain how our appliances can support your treatment.
              </p>
              <dl className="mt-8 divide-y divide-gray-100 border-y border-gray-100">
                {[
                  [
                    "Phone",
                    <a
                      key="p"
                      href="tel:8089570111"
                      className="text-navy hover:text-brandOrange transition-colors"
                    >
                      808-957-0111
                    </a>,
                  ],
                  [
                    "Email",
                    <a
                      key="e"
                      href="mailto:asohawaii@hotmail.com"
                      className="text-navy hover:text-brandOrange transition-colors"
                    >
                      asohawaii@hotmail.com
                    </a>,
                  ],
                  ["Hours", "Mon–Fri · 8:00 am – 4:30 pm HST"],
                  ["Response", "Within 1 business day"],
                ].map(([k, v], i) => (
                  <div
                    key={String(k) + i}
                    className="grid grid-cols-[110px_1fr] gap-4 py-3.5"
                  >
                    <dt className="text-xs uppercase tracking-widest text-gray-400 pt-1">
                      {k}
                    </dt>
                    <dd className="text-[15px] text-gray-700 leading-relaxed">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-gray-50/60 border border-gray-200 p-7 sm:p-9">
                <OriginalForm formType="Get a Quote" submitLabel="Send request">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <OrigField
                      id="q-fn"
                      name="first_name"
                      label="First Name"
                      required
                    />
                    <OrigField
                      id="q-ln"
                      name="last_name"
                      label="Last Name"
                      required
                    />
                  </div>
                  <OrigField
                    id="q-clinic"
                    name="clinic_name"
                    label="Clinic Name"
                    required
                  />
                  <OrigField
                    id="q-email"
                    name="email"
                    type="email"
                    label="Email Address"
                    required
                  />
                  <OrigField
                    id="q-msg"
                    name="message"
                    label="Message"
                    as="textarea"
                    required
                    placeholder="What are you quoting? Appliance type, quantity, rush service, special requirements…"
                  />
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                      Upload File{" "}
                      <span className="text-gray-400 normal-case tracking-normal">
                        · STL / ZIP optional
                      </span>
                    </label>
                    <input
                      name="attachment"
                      type="file"
                      accept=".stl,.zip,.ply,.obj"
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-navy file:text-white hover:file:bg-navy-light file:cursor-pointer"
                    />
                    <p className="mt-3 text-[12.5px] text-gray-500">
                      Larger scans or multiple files?{" "}
                      <a
                        href={DROPBOX_UPLOAD_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 text-navy hover:text-brandOrange transition-colors"
                      >
                        Upload via Dropbox →
                      </a>
                    </p>
                  </div>
                </OriginalForm>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
