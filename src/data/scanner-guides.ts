export type ScannerGuide = {
  id: string;
  scannerName: string;
  scannerFullName: string;
  platform: string;
  description: string;
  pdfFile: string;
  logoPath: string;
  accentColor: string;
  pages: number;
  order: number;
};

export const scannerGuides: ScannerGuide[] = [
  {
    id: "trios",
    scannerName: "3Shape TRIOS",
    scannerFullName: "3Shape TRIOS via EasyRx",
    platform: "EasyRx",
    description:
      "Export STL from TRIOS and upload to EasyRx — HIPAA-compliant, with full case history.",
    pdfFile: "/pdf/scanner-guides/ASO_3Shape_TRIOS_Setup_Guide.pdf",
    logoPath: "/images/aso/scanner-3shape.png",
    accentColor: "#C8102E",
    pages: 3,
    order: 1,
  },
  {
    id: "primescan",
    scannerName: "Primescan",
    scannerFullName: "Dentsply Sirona Primescan via DS Core",
    platform: "DS Core",
    description:
      "Primescan auto-uploads to DS Core. Share with ASO for instant case delivery.",
    pdfFile: "/pdf/scanner-guides/ASO_Primescan_DSCore_Setup_Guide.pdf",
    logoPath: "/images/aso/scanner-primescan.png",
    accentColor: "#0072CE",
    pages: 3,
    order: 2,
  },
  {
    id: "itero",
    scannerName: "iTero",
    scannerFullName: "iTero via EasyRx + MyAligntech",
    platform: "EasyRx + MyiTero",
    description:
      "One-time MyiTero v2 auto-attach setup — scans flow automatically to EasyRx.",
    pdfFile: "/pdf/scanner-guides/ASO_iTero_EasyRx_Setup_Guide.pdf",
    logoPath: "/images/aso/scanner-itero.jpg",
    accentColor: "#00A1DF",
    pages: 5,
    order: 3,
  },
  {
    id: "medit",
    scannerName: "Medit Link",
    scannerFullName: "Medit i700 / i900 via Medit Link",
    platform: "Medit Link",
    description:
      "One-time partnership setup in Medit Link, then send cases in 4 taps.",
    pdfFile: "/pdf/scanner-guides/ASO_MeditLink_Setup_Guide.pdf",
    logoPath: "/images/aso/scanner-medit.png",
    accentColor: "#2B7BE4",
    pages: 3,
    order: 4,
  },
  {
    id: "dexis",
    scannerName: "DEXIS",
    scannerFullName: "DEXIS IS 3800 / 3800W via IS Connect",
    platform: "IS Connect",
    description:
      "Connect your clinic via IS Connect (Classic or Cloud) and send cases in 30 seconds.",
    pdfFile: "/pdf/scanner-guides/ASO_DEXIS_Setup_Guide.pdf",
    logoPath: "/images/aso/scanner-dexis.jpg",
    accentColor: "#F26522",
    pages: 3,
    order: 5,
  },
  {
    id: "shining3d",
    scannerName: "Shining 3D",
    scannerFullName: "Shining 3D Aoralscan / DS-EX Pro via Dental Cloud",
    platform: "Dental Cloud",
    description:
      "Connect in Dental Cloud and share scans with ASO as a trusted partner.",
    pdfFile: "/pdf/scanner-guides/ASO_Shining3D_Setup_Guide.pdf",
    logoPath: "/images/aso/scanner-shining3d.jpg",
    accentColor: "#3B82F6",
    pages: 3,
    order: 6,
  },
];
