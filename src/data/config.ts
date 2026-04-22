export const FORMSPREE_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ??
  "https://formspree.io/f/YOUR_FORM_ID";

export const FORMSPREE_READY = !FORMSPREE_ENDPOINT.endsWith("YOUR_FORM_ID");
