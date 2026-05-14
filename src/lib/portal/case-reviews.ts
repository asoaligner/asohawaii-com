/**
 * Client-side helpers for matching portal_orders to /cases/{slug}/
 * aligner setup review pages.
 *
 * The manifest is built at deploy time by `scripts/build-cases-
 * manifest.mjs` from the embedded `CASE_DATA` literal in each
 * `public/cases/{slug}/index.html`. We fetch it once per page session
 * (cached via the in-flight promise) and run a small fuzzy match in
 * the browser — no extra D1 round-trip needed.
 *
 * Match rule for a single (order → cases) lookup:
 *   1. If order.review_slug is set, prefer that slug exactly and skip
 *      the fuzzy match entirely (aso_staff override).
 *   2. Otherwise: clinic.name must contain the entry's doctor_last
 *      (case-insensitive substring) AND order.patient_name must start
 *      with the entry's patient_first followed by a space, or equal
 *      patient_full exactly.
 *   3. Tied matches sort by generated_date DESC, slug ASC.
 */

export interface CaseReviewEntry {
  slug: string;
  patient_first: string;
  patient_full: string;
  doctor_last: string;
  doctor_name: string;
  generated_date: string | null;
  status: string | null;
}

const MANIFEST_URL = "/cases/index.json";

let cachedFetch: Promise<CaseReviewEntry[] | null> | null = null;

export function fetchCaseReviewManifest(): Promise<CaseReviewEntry[] | null> {
  if (cachedFetch) return cachedFetch;
  cachedFetch = (async () => {
    try {
      const res = await fetch(MANIFEST_URL, { cache: "force-cache" });
      if (!res.ok) return null;
      const data = (await res.json()) as CaseReviewEntry[];
      if (!Array.isArray(data)) return null;
      return data;
    } catch {
      return null;
    }
  })();
  return cachedFetch;
}

interface MatchInput {
  reviewSlug: string | null;
  clinicName: string | null;
  patientName: string | null;
}

export function matchCaseReviews(
  manifest: CaseReviewEntry[] | null,
  input: MatchInput,
): { pinned: CaseReviewEntry | null; candidates: CaseReviewEntry[] } {
  if (!manifest || manifest.length === 0) {
    return { pinned: null, candidates: [] };
  }

  // Explicit override always wins.
  if (input.reviewSlug) {
    const pinned = manifest.find((m) => m.slug === input.reviewSlug) ?? null;
    return { pinned, candidates: [] };
  }

  const clinicName = (input.clinicName ?? "").toLowerCase();
  const patientName = (input.patientName ?? "").trim().toLowerCase();
  if (!clinicName || !patientName) {
    return { pinned: null, candidates: [] };
  }

  const candidates = manifest.filter((entry) => {
    if (!entry.doctor_last || !entry.patient_first) return false;
    const docLast = entry.doctor_last.toLowerCase();
    if (!clinicName.includes(docLast)) return false;
    const patientFirst = entry.patient_first.toLowerCase();
    const patientFull = entry.patient_full.toLowerCase();
    // Exact full-name match OR firstname-prefix match (so "Mika Young"
    // in the order matches a case with patient_first "Mika"). Trailing
    // space guards against false hits like "Mikayla Young".
    return (
      patientName === patientFull ||
      patientName.startsWith(patientFirst + " ") ||
      patientName === patientFirst
    );
  });

  // Already sorted in manifest by generated_date DESC / slug ASC, but
  // the manifest sort key is global — re-sort locally so candidates
  // stay newest-first even after filtering.
  candidates.sort((a, b) => {
    const dateCmp = String(b.generated_date || "").localeCompare(
      String(a.generated_date || ""),
    );
    if (dateCmp !== 0) return dateCmp;
    return a.slug.localeCompare(b.slug);
  });

  return { pinned: null, candidates };
}

export function caseReviewUrl(slug: string): string {
  return `/cases/${encodeURIComponent(slug)}/`;
}
