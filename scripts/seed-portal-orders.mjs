#!/usr/bin/env node
/**
 * Generate INSERT SQL for ~10 dummy portal_orders rows so the Phase 1.2
 * dashboard + detail UI can be exercised end-to-end before the real
 * VisualDLP / Shop sync ships.
 *
 * Usage:
 *   node scripts/seed-portal-orders.mjs > portal-orders-seed.sql
 *   wrangler d1 execute aso-chat-logs --remote --file=portal-orders-seed.sql
 *   rm portal-orders-seed.sql
 *
 * Defaults:
 *   --clinic-id        1            (ASO Hawaii Internal seeded earlier)
 *   --count            10
 *   --start-id         1001         (high enough not to collide with real
 *                                    auto-increment rows; INSERTs use
 *                                    explicit ids)
 *
 * Each row uses (source, source_order_id) so re-running with the same
 * --start-id is idempotent (UNIQUE constraint blocks duplicates). To
 * re-seed with different data, bump --start-id or DELETE first.
 *
 * Generates a deterministic-but-varied mix:
 *   - 6 visualdlp + 4 shop
 *   - mix of past (✓ delivered) + future delivery dates
 *   - some rows with tracking, some without
 *   - some with design_notes, some bare
 *   - one row with internal_memo (aso_staff only sees it)
 */

const args = parseArgs(process.argv.slice(2));

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) die(`Unexpected positional: ${a}`);
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
    "Usage: node scripts/seed-portal-orders.mjs [--clinic-id N] [--count N] [--start-id N]\n",
  );
  process.exit(1);
}

const clinicId = Number(args["clinic-id"] ?? 1);
const count = Number(args.count ?? 10);
const startId = Number(args["start-id"] ?? 1001);

if (!Number.isInteger(clinicId) || clinicId <= 0) die("--clinic-id must be a positive integer");
if (!Number.isInteger(count) || count <= 0 || count > 100) die("--count must be 1-100");
if (!Number.isInteger(startId) || startId <= 0) die("--start-id must be a positive integer");

const APPLIANCES = [
  "Plate Type Retainer",
  "Hawley Retainer",
  "Spring Retainer",
  "Lingual Retainer",
  "Aligner",
  "Expander",
  "Splint",
  "Mouthguard",
];

// Sample patient + note text, kept generic.
const PATIENTS = [
  "Doe, J.",
  "Smith, R.",
  "Tanaka, H.",
  "Lee, M.",
  "Garcia, C.",
  "Nakamura, S.",
  "Brown, K.",
  "Patel, A.",
  "Watanabe, Y.",
  "Kim, D.",
];

const DESIGN_NOTES = [
  "Standard fit, palatal coverage as discussed.",
  "Lingual bar to avoid #11 prominence; thin where possible.",
  null,
  "Spring pressure light; patient reports tenderness.",
  null,
  "Color: clear acrylic, polished finish.",
];

// Deterministic helpers — no Math.random so reruns produce identical SQL.
function pick(arr, i) {
  return arr[i % arr.length];
}

function ymdOffset(daysFromToday) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function sqlString(s) {
  if (s === null || s === undefined) return "NULL";
  return `'${String(s).replace(/'/g, "''")}'`;
}
function sqlInt(n) {
  return String(n);
}

const lines = [];
lines.push(
  "-- Portal orders dummy data for Phase 1.2 UI testing.",
  `-- Generated at ${new Date().toISOString()}.`,
  `-- clinic_id=${clinicId}, count=${count}, start-id=${startId}.`,
  "-- Idempotent: re-runs hit the (source, source_order_id) UNIQUE constraint.",
  "",
);

for (let i = 0; i < count; i++) {
  const id = startId + i;
  const isShop = i % 5 === 4 || i % 5 === 2; // 2 of every 5
  const source = isShop ? "shop" : "visualdlp";
  const sourceOrderId = isShop ? `shop-pp-${id}` : `vdlp-${id}`;
  const orderNumber = isShop ? `S${id}` : `H${id}`;
  const patient = pick(PATIENTS, i);
  const appliance = pick(APPLIANCES, i);

  // Spread order dates across the last 60 days.
  const orderDate = ymdOffset(-(60 - i * 6));
  // Delivery: past for first half, future for second half. One null in
  // the middle to exercise the "—" rendering path.
  let deliveryDate;
  if (i === Math.floor(count / 2)) {
    deliveryDate = null;
  } else if (i < count / 2) {
    deliveryDate = ymdOffset(-(40 - i * 5));
  } else {
    deliveryDate = ymdOffset((i - count / 2) * 4 + 2);
  }

  // Tracking only for rows whose delivery is in the past or near future.
  const hasTracking = deliveryDate !== null && (i % 3 !== 0);
  const trackingNumber = hasTracking
    ? `94001${String(id).padStart(8, "0")}`
    : null;
  const trackingCarrier = hasTracking
    ? isShop
      ? "USPS"
      : i % 2 === 0
        ? "USPS"
        : "Walking"
    : null;

  const designNotes = pick(DESIGN_NOTES, i);
  const additionalMemo = i === 0 ? "Patient prefers afternoon pickup." : null;
  const internalMemo =
    i === 1 ? "Lab note: bench requested extra polish on facial." : null;

  const valueList = [
    sqlInt(id),
    sqlInt(clinicId),
    sqlString(source),
    sqlString(sourceOrderId),
    sqlString(orderNumber),
    sqlString(patient),
    sqlString(appliance),
    sqlString(orderDate),
    sqlString(deliveryDate),
    "NULL", // delivery_notes
    sqlString(trackingNumber),
    sqlString(trackingCarrier),
    "NULL", // instruction_pdf_url
    "NULL", // product_photos
    "NULL", // stl_files
    sqlString(designNotes),
    sqlString(additionalMemo),
    sqlString(internalMemo),
    sqlString(orderDate), // synced_at
    "NULL", // source_data
  ].join(", ");

  lines.push(
    "INSERT OR IGNORE INTO portal_orders",
    "  (id, clinic_id, source, source_order_id, order_number, patient_name, appliance_type, order_date, delivery_date, delivery_notes, tracking_number, tracking_carrier, instruction_pdf_url, product_photos, stl_files, design_notes, additional_memo, internal_memo, synced_at, source_data)",
    `VALUES (${valueList});`,
    "",
  );
}

process.stdout.write(lines.join("\n"));
