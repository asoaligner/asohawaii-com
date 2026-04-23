"use client";

import Link from "next/link";
import { OriginalForm, OrigField } from "@/components/OriginalForm";

// Content mirrors asohawaii.com/contact-us verbatim. Design is the
// polished Original style (Fraunces-free, Source Serif 4 headings).

const DROPBOX_UPLOAD_URL =
  "https://www.dropbox.com/request/qyzCwOz9KVlxBTerdIoU";
const INSTAGRAM_URL =
  "https://www.instagram.com/aso.orthodonticslab.honolulu/";

export default function ContactPage() {
  return (
    <>
      {/* HERO */}
      <section
        id="general"
        className="relative hero-gradient overflow-hidden scroll-mt-24"
      >
        <div className="absolute inset-0 subtle-grid opacity-40 pointer-events-none" />
        <div className="container-narrow relative pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm text-xs text-gray-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brandOrange" />
              Contact Us
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] leading-[1.05] tracking-tightest text-navy text-balance">
              Get in <span className="italic text-brandOrange">touch.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
              Feel free to reach out with any questions, comments, or feedback
              using the form below. We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* DIRECT CHANNELS */}
      <section className="py-16 md:py-20 bg-white border-b border-gray-200/60">
        <div className="container-narrow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-7">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                Phone
              </div>
              <a
                href="tel:8089570111"
                className="font-serif text-2xl text-navy hover:text-brandOrange transition-colors"
              >
                808-957-0111
              </a>
              <p className="mt-3 text-sm text-gray-500">
                Mon–Fri · 8:00 AM – 4:30 PM HST
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-7">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                Email
              </div>
              <a
                href="mailto:asohawaii@hotmail.com"
                className="font-serif text-2xl text-navy hover:text-brandOrange transition-colors break-all"
              >
                asohawaii@hotmail.com
              </a>
              <p className="mt-3 text-sm text-gray-500">
                Digital submissions:{" "}
                <a
                  href="mailto:aso-digital@outlook.com"
                  className="text-navy hover:text-brandOrange underline underline-offset-2"
                >
                  aso-digital@outlook.com
                </a>
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-7">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                Follow
              </div>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 group"
              >
                <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-brandOrange/15 to-brandOrange/5 text-brandOrange flex items-center justify-center group-hover:from-brandOrange group-hover:to-brandOrange group-hover:text-white transition-all">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                  </svg>
                </span>
                <span>
                  <span className="block font-serif text-lg text-navy group-hover:text-brandOrange transition-colors">
                    @aso.orthodonticslab.honolulu
                  </span>
                  <span className="block text-sm text-gray-500">
                    Follow us on Instagram
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTACT FORM */}
      <section
        id="invitation"
        className="py-20 md:py-24 bg-white scroll-mt-24"
      >
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
            <div className="lg:col-span-5">
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
                Send a message
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
                Questions, quotes, or{" "}
                <span className="italic">anything else.</span>
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Our team reads every message. Response within one business day.
              </p>

              <div className="mt-10 rounded-2xl bg-brandOrange/5 border border-brandOrange/20 p-6">
                <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-2">
                  Need to send files?
                </div>
                <p className="text-[15px] text-navy leading-relaxed mb-4">
                  You can upload STL or ZIP files directly inside the form, or
                  use our secure Dropbox upload link below.
                </p>
                <a
                  href={DROPBOX_UPLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brandOrange transition-colors"
                >
                  Open Dropbox upload
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  >
                    <path d="M5 3h8v8M13 3L3 13" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-gray-50/60 border border-gray-200 p-7 sm:p-9">
                <OriginalForm
                  formType="General Inquiry"
                  submitLabel="Send message"
                  successBody="Thanks for submitting! Our team will reply within one business day."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <OrigField
                      id="c-fn"
                      name="first_name"
                      label="First Name"
                      required
                    />
                    <OrigField
                      id="c-ln"
                      name="last_name"
                      label="Last Name"
                      required
                    />
                  </div>
                  <OrigField
                    id="c-clinic"
                    name="clinic_name"
                    label="Clinic Name"
                    required
                  />
                  <OrigField
                    id="c-email"
                    name="email"
                    type="email"
                    label="Email Address"
                    required
                  />
                  <OrigField
                    id="c-msg"
                    name="message"
                    label="Message"
                    as="textarea"
                    required
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
                      accept=".stl,.zip,.ply,.obj,.pdf"
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-navy file:text-white hover:file:bg-navy-light file:cursor-pointer"
                    />
                  </div>
                </OriginalForm>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR LOCATION */}
      <section
        id="location"
        className="py-20 md:py-24 bg-gray-50/60 border-t border-gray-200/60"
      >
        <div className="container-narrow">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
              Our Location
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tightest text-navy text-balance">
              1441 Kapiolani Blvd <span className="italic">#1112</span>
            </h2>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              Honolulu, HI 96814
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-gray-200 p-8">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-5">
                Address
              </div>
              <p className="font-serif text-xl text-navy leading-relaxed">
                ASO International Hawaii, Inc.
                <br />
                1441 Kapiolani Blvd #1112
                <br />
                Honolulu, HI 96814
              </p>
              <a
                href="https://maps.google.com/?q=1441+Kapiolani+Blvd+%231112+Honolulu+HI+96814"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brandOrange transition-colors"
              >
                Open in Maps
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <path d="M5 3h8v8M13 3L3 13" />
                </svg>
              </a>
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 p-8">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-5">
                Business Hours
              </div>
              <p className="font-serif text-xl text-navy leading-relaxed">
                Monday – Friday
                <br />
                8:00 AM – 4:30 PM
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Closed on Federal Holidays
              </p>
              <dl className="mt-6 grid grid-cols-[60px_1fr] gap-y-2 text-sm">
                <dt className="text-gray-400 uppercase tracking-widest text-xs pt-1">
                  Tel
                </dt>
                <dd>
                  <a
                    href="tel:8089570111"
                    className="text-navy hover:text-brandOrange transition-colors"
                  >
                    808-957-0111
                  </a>
                </dd>
                <dt className="text-gray-400 uppercase tracking-widest text-xs pt-1">
                  Fax
                </dt>
                <dd className="text-navy">808-957-0222</dd>
              </dl>
            </div>
          </div>

          <div className="mt-6 rounded-2xl overflow-hidden border border-gray-200 bg-white">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3719.5489!2d-157.8397!3d21.2937!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7c006e0e0!2s1441+Kapiolani+Blvd+Honolulu!5e0!3m2!1sen!2sus!4v1700000000000"
              width="100%"
              height="320"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ASO International Hawaii — 1441 Kapiolani Blvd"
              className="block"
            />
          </div>
        </div>
      </section>

      {/* SECONDARY CTAs */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/pick-up"
              className="group rounded-2xl border border-gray-200 bg-white p-7 hover:border-navy/30 hover:shadow-[0_8px_40px_-12px_rgba(15,41,66,0.12)] transition-all"
            >
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
                Oahu Pick-Up
              </div>
              <h3 className="font-serif text-xl text-navy leading-snug">
                Request a courier pick-up
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Mon–Fri afternoon window for impressions, models, or returns.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-brandOrange transition-colors">
                Schedule pick-up
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </Link>

            <Link
              href="/get-a-quote"
              className="group rounded-2xl border border-gray-200 bg-white p-7 hover:border-navy/30 hover:shadow-[0_8px_40px_-12px_rgba(15,41,66,0.12)] transition-all"
            >
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
                Pricing
              </div>
              <h3 className="font-serif text-xl text-navy leading-snug">
                Get a quote
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Pricing returned within one business day. Attach STL/ZIP
                directly.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-brandOrange transition-colors">
                Request a quote
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </Link>

            <Link
              href="/download"
              className="group rounded-2xl border border-gray-200 bg-white p-7 hover:border-navy/30 hover:shadow-[0_8px_40px_-12px_rgba(15,41,66,0.12)] transition-all"
            >
              <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-3">
                PDFs
              </div>
              <h3 className="font-serif text-xl text-navy leading-snug">
                Download Rx forms &amp; catalog
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Prescription forms and the full ASO product catalog.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-brandOrange transition-colors">
                Open downloads
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
