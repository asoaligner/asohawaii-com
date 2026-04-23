// Production form endpoint (public Formspree form ID — safe to hard-code).
// The NEXT_PUBLIC_FORMSPREE_ENDPOINT env override still wins when Cloudflare
// Pages (or any build) sets it, so staging/test forms can be swapped in
// without a code change. `||` (not `??`) so an empty-string env value also
// falls through to the production endpoint.
export const FORMSPREE_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ||
  "https://formspree.io/f/mojykwyl";

// FORMSPREE_READY gates a dev-only "endpoint not configured" notice in each
// form component. With a real form-id fallback it is effectively always
// true, so the notice only shows if someone deliberately points the env
// var back at the YOUR_FORM_ID placeholder.
export const FORMSPREE_READY = !FORMSPREE_ENDPOINT.endsWith("YOUR_FORM_ID");
