-- Phase 2.X — Aligner setup review linkage (manual override).
--
-- Phase 1 implementation uses a build-time manifest + fuzzy match
-- (patient first name + clinic doctor lastname) to surface the right
-- /cases/{slug}/ page from a portal order. When the fuzzy match is
-- wrong (e.g. two unrelated patients share a first name within the
-- same clinic), aso_staff can pin the correct slug here and the order
-- detail UI prefers it over the auto-match candidates.
--
-- Left nullable — the column is purely an override; the dashboard
-- works fine when it's NULL and the manifest carries the canonical
-- list.

ALTER TABLE portal_orders ADD COLUMN review_slug TEXT;

CREATE INDEX IF NOT EXISTS idx_portal_orders_review_slug
  ON portal_orders(review_slug) WHERE review_slug IS NOT NULL;
