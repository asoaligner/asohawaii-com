-- Phase 1.5b: portal_order_files.
--
-- One row per file uploaded against a portal_orders row. Originally the
-- 0001 schema stuffed filenames into JSON-encoded TEXT columns
-- (portal_orders.product_photos, stl_files, instruction_pdf_url); that
-- was fine when files only existed in Formspree email attachments, but
-- with R2-backed downloads we need per-file metadata (R2 key, MIME type,
-- size, uploader). Split out into its own table so portal_orders stays
-- about the order itself.
--
-- category values (free TEXT; constrained by application code):
--   'stl'      — STL scan files
--   'photo'    — clinical photo
--   'rx_pdf'   — Rx / lab slip PDF
--   'other'    — fallback bucket
--
-- r2_key is the object key inside the PORTAL_UPLOADS bucket. UNIQUE so
-- a re-submission can never bind the same R2 object to two rows.
-- ON DELETE behaviour is intentionally not declared — D1 does not enforce
-- foreign keys by default and we never delete rows in practice (orders
-- and files are append-only).

CREATE TABLE IF NOT EXISTS portal_order_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES portal_orders(id),
  category TEXT NOT NULL,
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  content_type TEXT,
  size_bytes INTEGER,
  uploaded_by_user_id INTEGER REFERENCES portal_users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_portal_order_files_order ON portal_order_files(order_id);
CREATE INDEX IF NOT EXISTS idx_portal_order_files_category ON portal_order_files(order_id, category);
