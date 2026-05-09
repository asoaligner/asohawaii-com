#!/usr/bin/env node
/**
 * Generate the SQL needed to create an ASO Portal user. Outputs an
 * INSERT statement to stdout that you can pipe into wrangler:
 *
 *   node scripts/create-portal-admin.mjs \
 *     --email koji@asohawaii.com \
 *     --password 'TempP@ss123!' \
 *     --name 'Koji Aso' \
 *     --role aso_staff \
 *     [--clinic-id 1] \
 *     [--ensure-clinic-name "ASO Hawaii Internal"]
 *
 * Then send the output to D1. On Windows / PowerShell, prefer --out so
 * the script writes UTF-8 directly (PowerShell 5.1's `>` redirect emits
 * UTF-16 LE which wrangler silently parses as zero statements):
 *
 *   node scripts/create-portal-admin.mjs ... --out portal-admin.sql
 *   wrangler d1 execute aso-chat-logs --remote --file=portal-admin.sql
 *   # or via stdin (POSIX shells only):
 *   wrangler d1 execute aso-chat-logs --remote --command "$(node scripts/create-portal-admin.mjs ...)"
 *
 * Behaviour:
 *   - bcrypt-hashes the password with cost 10.
 *   - Emits a leading `-- pre-flight check` comment with a SELECT so you
 *     can verify whether the email already exists before INSERT.
 *   - If --ensure-clinic-name is given, prepends an INSERT OR IGNORE for
 *     portal_clinics so the owning clinic exists. Otherwise expects an
 *     existing clinic referenced by --clinic-id (default 1).
 *   - Never logs the password or hash anywhere except the SQL output.
 *
 * Roles allowed: 'member' | 'admin' | 'aso_staff'.
 */

import bcrypt from "bcryptjs";
import { writeFileSync } from "node:fs";

const args = parseArgs(process.argv.slice(2));

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      die(`Unexpected positional argument: ${a}`);
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      die(`Missing value for --${key}`);
    }
    out[key] = next;
    i++;
  }
  return out;
}

function die(msg) {
  process.stderr.write(`Error: ${msg}\n`);
  process.stderr.write(
    "Usage: node scripts/create-portal-admin.mjs --email <e> --password <p> --name <n> --role <member|admin|aso_staff> [--clinic-id <id>] [--ensure-clinic-name <name>]\n",
  );
  process.exit(1);
}

const email = (args.email ?? "").trim().toLowerCase();
const password = args.password ?? "";
const name = (args.name ?? "").trim();
const role = (args.role ?? "aso_staff").trim();
const clinicIdArg = args["clinic-id"];
const ensureClinicName = args["ensure-clinic-name"];
const outPath = args.out ?? null;

if (!email) die("--email is required");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) die("--email must be a valid address");
if (!password) die("--password is required");
if (password.length < 10) die("--password must be at least 10 characters");
if (!name) die("--name is required");
if (!["member", "admin", "aso_staff"].includes(role)) {
  die("--role must be one of: member, admin, aso_staff");
}

const clinicId = clinicIdArg ? Number(clinicIdArg) : 1;
if (!Number.isInteger(clinicId) || clinicId <= 0) {
  die("--clinic-id must be a positive integer");
}

const passwordHash = bcrypt.hashSync(password, 10);

// SQLite literal: wrap in single quotes, double any embedded single quote.
const sqlString = (s) => `'${String(s).replace(/'/g, "''")}'`;

const lines = [];

lines.push(
  "-- ASO Portal user seed.",
  `-- Generated for email=${email} role=${role} at ${new Date().toISOString()}.`,
  `-- Apply with:  wrangler d1 execute aso-chat-logs --remote --command "<sql>"`,
  "--",
  "-- Pre-flight: confirm this email is not already taken before INSERT.",
  `--   SELECT id, email, role, is_active FROM portal_users WHERE email = ${sqlString(email)};`,
  "",
);

if (ensureClinicName) {
  lines.push(
    "-- Ensure the owning clinic row exists (no-op if a row with this name already exists).",
    `INSERT OR IGNORE INTO portal_clinics (id, name, contact_email) VALUES (${clinicId}, ${sqlString(ensureClinicName)}, ${sqlString(email)});`,
    "",
  );
}

lines.push(
  "-- Insert the portal user. Will fail with UNIQUE constraint if email already exists.",
  `INSERT INTO portal_users (clinic_id, email, name, role, auth_provider, password_hash) VALUES (${clinicId}, ${sqlString(email)}, ${sqlString(name)}, ${sqlString(role)}, 'password', ${sqlString(passwordHash)});`,
);

const sql = lines.join("\n") + "\n";
if (outPath) {
  // UTF-8, no BOM. PowerShell 5.1's `>` redirect emits UTF-16 LE which
  // wrangler silently treats as zero statements; writing directly here
  // sidesteps the foot-gun.
  writeFileSync(outPath, sql, { encoding: "utf8" });
  process.stderr.write(
    `Wrote ${sql.length} bytes (UTF-8, no BOM) to ${outPath}\n`,
  );
} else {
  process.stdout.write(sql);
}
