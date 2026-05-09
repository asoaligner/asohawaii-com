-- Phase 1.3: profile editing (per-user phone) + password-reset tokens.
--
-- 1) portal_users.phone — editable from /portal/profile/. Distinct from
--    portal_clinics.phone (clinic main line) so a user can record their
--    direct line / mobile without overwriting clinic-level contact.
--
-- 2) portal_password_reset_tokens — short-lived single-use tokens.
--    The raw token (32 bytes random, base64url-encoded) goes in the
--    email link only; we store SHA-256 of it in token_hash so a row
--    leak does not let an attacker mint working reset URLs. used_at
--    is set on the first successful consume so re-use is blocked.

ALTER TABLE portal_users ADD COLUMN phone TEXT;

CREATE TABLE IF NOT EXISTS portal_password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES portal_users(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_portal_pwreset_user ON portal_password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_pwreset_expires ON portal_password_reset_tokens(expires_at);
