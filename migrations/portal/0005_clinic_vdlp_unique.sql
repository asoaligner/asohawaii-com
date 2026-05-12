-- Phase 1.4d-5 prep: prevent duplicate clinic rows on bulk re-import.
--
-- Before this migration `portal_clinics.visualdlp_account_id` was a
-- plain TEXT column with no constraint, so re-running the bulk import
-- script (or two scripts inserting the same VisualDLP AccountId from
-- different sources) could create duplicates. Partial UNIQUE index
-- enforces uniqueness only where the column is non-null so the dozens
-- of pre-1.4b-2 rows that have NULL keep working.
--
-- INSERT OR IGNORE now becomes idempotent against both aso_account_number
-- (already UNIQUE) and visualdlp_account_id.

CREATE UNIQUE INDEX IF NOT EXISTS idx_portal_clinics_vdlp_unique
  ON portal_clinics(visualdlp_account_id)
  WHERE visualdlp_account_id IS NOT NULL;
