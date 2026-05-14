-- Phase 2.1 — Self-service application + ASO approval.
--
-- Tracks doctors who applied for portal access through the public
-- /portal/request-access/ form (typically reached via a not_registered
-- Google sign-in redirect). aso_staff reviews each row and either
-- approves it (creating the matching portal_users row + linking to a
-- clinic) or rejects it with a reason. The email column is NOT UNIQUE
-- on purpose: a rejected applicant can reapply after correcting the
-- info, and the soft 24h cooldown is enforced in the apply endpoint.

CREATE TABLE IF NOT EXISTS portal_pending_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Identity. email always present; google_id + name come from a
  -- prior Google OAuth attempt when the applicant landed via callback.
  email TEXT NOT NULL,
  google_id TEXT,
  name TEXT,

  -- Self-reported application fields. doctor_name + clinic_name are
  -- enforced as non-empty by the API (clinic_name carries a NOT NULL
  -- constraint here so even direct DB inserts have to provide it).
  doctor_name TEXT,
  clinic_name TEXT NOT NULL,
  aso_account_number TEXT,
  easyrx_email TEXT,
  reason TEXT,

  -- Submission audit
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
  admin_notified_at TEXT,

  -- Review state
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TEXT,
  reviewed_by_user_id INTEGER REFERENCES portal_users(id),
  approved_clinic_id INTEGER REFERENCES portal_clinics(id),
  rejection_reason TEXT,
  migrated_user_id INTEGER REFERENCES portal_users(id),

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_portal_pending_users_status
  ON portal_pending_users(status);

CREATE INDEX IF NOT EXISTS idx_portal_pending_users_email
  ON portal_pending_users(email);

CREATE INDEX IF NOT EXISTS idx_portal_pending_users_attempted_at
  ON portal_pending_users(attempted_at DESC);
