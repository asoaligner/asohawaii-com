-- ASO Portal Phase 1.1 initial schema.
--
-- Tables share the same D1 database as the existing AI-chat tables, so
-- every portal table is prefixed `portal_` to avoid collision and make
-- it obvious which surface owns the data.
--
-- SQLite type notes:
--   - BOOLEAN -> INTEGER 0/1 (SQLite has no boolean)
--   - TIMESTAMP -> TEXT in ISO-8601 (datetime('now') yields 'YYYY-MM-DD HH:MM:SS')
--   - Foreign keys are declared but require `PRAGMA foreign_keys=ON` per
--     connection. D1 does not enforce them by default; treat as docs.

-- ─────────────────────────────────────────────────────────────────────
-- portal_clinics
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_clinics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email_domain TEXT,
  aso_account_number TEXT UNIQUE,
  visualdlp_account_id TEXT,
  contact_email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────────────────
-- portal_users
-- ─────────────────────────────────────────────────────────────────────
-- role values: 'member' (clinic user) | 'admin' (clinic-side admin) |
--              'aso_staff' (ASO Hawaii internal staff with cross-clinic access)
-- auth_provider values for Phase 1.1: 'password'.
--   'google' added in Phase 1.3, 'easyrx' deferred to Phase 2.
--   easyrx_user_id column kept now to avoid a future migration.
CREATE TABLE IF NOT EXISTS portal_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL REFERENCES portal_clinics(id),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  auth_provider TEXT,
  google_id TEXT,
  easyrx_user_id TEXT,
  password_hash TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_portal_users_email ON portal_users(email);
CREATE INDEX IF NOT EXISTS idx_portal_users_clinic ON portal_users(clinic_id);

-- ─────────────────────────────────────────────────────────────────────
-- portal_sessions
-- ─────────────────────────────────────────────────────────────────────
-- One row per active login. id is a UUID stored as TEXT and also encoded
-- in the JWT cookie payload; the row is the source of truth so we can
-- revoke without rotating JWT_SECRET.
CREATE TABLE IF NOT EXISTS portal_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES portal_users(id),
  expires_at TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_user ON portal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires ON portal_sessions(expires_at);

-- ─────────────────────────────────────────────────────────────────────
-- portal_orders
-- ─────────────────────────────────────────────────────────────────────
-- Unified view of orders across upstream sources (visualdlp, shop).
-- (source, source_order_id) is unique so re-syncs upsert cleanly.
CREATE TABLE IF NOT EXISTS portal_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL REFERENCES portal_clinics(id),
  source TEXT NOT NULL,
  source_order_id TEXT NOT NULL,
  order_number TEXT,
  patient_name TEXT,
  appliance_type TEXT,
  order_date TEXT,
  delivery_date TEXT,
  delivery_notes TEXT,
  tracking_number TEXT,
  tracking_carrier TEXT,
  instruction_pdf_url TEXT,
  product_photos TEXT,         -- JSON array of R2 keys
  stl_files TEXT,              -- JSON array of R2 keys
  design_notes TEXT,
  additional_memo TEXT,
  internal_memo TEXT,          -- ASO-only, never returned to clinic users
  synced_at TEXT,
  source_data TEXT,            -- JSON blob of raw upstream payload
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source, source_order_id)
);
CREATE INDEX IF NOT EXISTS idx_portal_orders_clinic ON portal_orders(clinic_id);
CREATE INDEX IF NOT EXISTS idx_portal_orders_delivery ON portal_orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_portal_orders_source ON portal_orders(source, source_order_id);

-- ─────────────────────────────────────────────────────────────────────
-- portal_audit_logs
-- ─────────────────────────────────────────────────────────────────────
-- Append-only. Failed login attempts are also recorded with user_id NULL
-- so we can rate-limit by IP / detect credential stuffing.
CREATE TABLE IF NOT EXISTS portal_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES portal_users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata TEXT,               -- JSON
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_portal_audit_user ON portal_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_audit_created ON portal_audit_logs(created_at);
