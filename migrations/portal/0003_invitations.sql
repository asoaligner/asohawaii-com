-- Phase 1.4d-1: invitation system.
--
-- aso_staff issues an invitation; the recipient clicks an emailed link and
-- sets a password to claim the account. The link carries an opaque
-- base64url token whose SHA-256 hash is stored here, so a leak of this
-- row does not let an attacker mint working acceptance URLs (same pattern
-- as portal_password_reset_tokens in migration 0002).
--
-- Lifecycle on a row:
--   created (used_at / revoked_at NULL, expires_at in future)
--     → consumed (used_at set, used_by_user_id set)
--     OR expired (now > expires_at, used_at still NULL)
--     OR revoked (revoked_at set by aso_staff before consumption)
--
-- TTL: 7 days per Phase 1.4 decisions. Enforced by the accept-invite
-- endpoint comparing datetime('now') against expires_at.
--
-- We do NOT enforce single-active-invitation-per-email here; the issue
-- endpoint handles policy (revoke prior pending invitations OR refuse).

CREATE TABLE IF NOT EXISTS portal_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  name TEXT,
  clinic_id INTEGER NOT NULL REFERENCES portal_clinics(id),
  role TEXT NOT NULL DEFAULT 'member',
  inviter_user_id INTEGER REFERENCES portal_users(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  used_by_user_id INTEGER REFERENCES portal_users(id),
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_portal_invitations_email ON portal_invitations(email);
CREATE INDEX IF NOT EXISTS idx_portal_invitations_expires ON portal_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_portal_invitations_clinic ON portal_invitations(clinic_id);
