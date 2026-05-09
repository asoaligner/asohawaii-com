/**
 * Hard-coded appliance-type list for the dashboard filter. The actual
 * appliance_type column is freeform TEXT (upstream-controlled by VisualDLP /
 * Shop sync), so this list is just the dropdown UX — picking a value not
 * present in the data simply yields zero matches.
 *
 * Replace with an API call (e.g. /api/portal/appliance-types) once we
 * have enough rows to derive a usable distinct list. Deliberately kept
 * trivial for Phase 1.2.
 */
export const APPLIANCE_TYPES: readonly string[] = [
  "Plate Type Retainer",
  "Hawley Retainer",
  "Spring Retainer",
  "Lingual Retainer",
  "Aligner",
  "Expander",
  "Splint",
  "Mouthguard",
  "Other",
] as const;
