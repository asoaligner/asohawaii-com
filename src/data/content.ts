export const company = {
  name: "ASO International Hawaii, Inc.",
  shortName: "ASO Hawaii",
  address: "1441 Kapiolani Blvd #1112, Honolulu, HI 96814",
  phone: "808-957-0111",
  fax: "808-957-0222",
  email: "asohawaii@hotmail.com",
  hours: "Monday–Friday · 8:00 AM – 4:30 PM",
  holidays: "Closed on Federal Holidays",
  practices: "150+",
};

export const heroCopy = {
  eyebrow: "Trusted by 150+ practices across Hawaii",
  headline: "Submit cases to ASO Hawaii digitally, with zero hassle.",
  subhead:
    "EasyRx connects your practice directly to our lab — secure, HIPAA-compliant case submission from any scanner, with full history and no paperwork.",
  primaryCta: "Request an invitation",
  secondaryCta: "See how it works",
};

export const benefits = [
  {
    title: "Nothing gets lost.",
    body:
      "Every case, scan, and note lives in one secure thread — traceable from submission through delivery. No lost faxes. No missing attachments.",
  },
  {
    title: "HIPAA compliant by design.",
    body:
      "End-to-end encrypted transmission, role-based access, and a full audit trail. Your patient data stays protected at every step.",
  },
  {
    title: "Full case history at a glance.",
    body:
      "Every prescription, scan, and communication on a single timeline. Review past cases, reorder retainers, and clone submissions in seconds.",
  },
];

export const gettingStartedSteps = [
  {
    number: "01",
    title: "Request an invitation",
    body:
      "Fill out the form. We verify your practice and set up your EasyRx connection — usually the same business day.",
  },
  {
    number: "02",
    title: "Check your inbox",
    body:
      "You'll receive a secure invite from EasyRx. Click the link, set your password, and your account is live.",
  },
  {
    number: "03",
    title: "Start sending cases",
    body:
      "Submit your first case in minutes. Upload scans from any scanner, attach notes, and your case arrives at ASO Hawaii instantly.",
  },
];

export const howToSteps = [
  { n: "01", title: "Sign in to EasyRx", body: "Log in with your invitation credentials." },
  { n: "02", title: "Create a new case", body: "Select ASO International Hawaii as the lab." },
  { n: "03", title: "Attach your scan", body: "Upload STL/PLY or connect your scanner integration." },
  { n: "04", title: "Add your prescription", body: "Appliance, materials, notes, reference photos." },
  { n: "05", title: "Review and submit", body: "Double-check the summary; submit encrypted instantly." },
  { n: "06", title: "Track progress", body: "Received → production → shipped, all in dashboard." },
];

export type Scanner = {
  name: string;
  maker: string;
  body: string;
  pdf?: string;
};

export const scanners: Scanner[] = [
  {
    name: "iTero",
    maker: "Align Technology",
    body: "Export OrthoCAD files directly from MyiTero and attach them to your EasyRx case.",
    pdf: "/pdf/ASO_iTero_EasyRx_Setup_Guide.pdf",
  },
  {
    name: "Medit",
    maker: "Medit Link",
    body: "Send scans from Medit Link to ASO Hawaii via EasyRx integration.",
  },
  {
    name: "Shining 3D",
    maker: "Aoralscan / IntraOral",
    body: "Upload STL output from Shining 3D Dental Studio straight into EasyRx.",
  },
  {
    name: "3Shape TRIOS",
    maker: "3Shape Unite",
    body: "Connect your TRIOS scanner through 3Shape Unite for seamless case submission.",
  },
  {
    name: "Primescan",
    maker: "Dentsply Sirona",
    body: "Export Primescan cases as STL and attach to your EasyRx prescription.",
  },
  {
    name: "DEXIS",
    maker: "DEXIS IS 3800 / 3800W",
    body: "Submit DEXIS IS scans through EasyRx in the same workflow as your other cases.",
  },
];

export const faqs = [
  {
    q: "Is EasyRx included, or is there a cost for my practice?",
    a: "EasyRx is provided at no cost to practices submitting to ASO International Hawaii. No setup fees, monthly fees, or per-case charges.",
  },
  {
    q: "How long does setup take?",
    a: "Most practices send their first case within one business day. We verify your practice and send a secure invite to activate EasyRx.",
  },
  {
    q: "Which intraoral scanners are supported?",
    a: "All major scanners — iTero, Medit, Shining 3D, 3Shape TRIOS, Primescan, and DEXIS. If it exports STL/PLY, it works.",
  },
  {
    q: "Is my patient data secure?",
    a: "Yes. HIPAA-compliant, end-to-end encryption, role-based access, complete audit trail. We do not share data with third parties.",
  },
  {
    q: "Can I still submit cases via fax or paper?",
    a: "Yes, but digital is faster, reduces errors, and gives you a complete case history that paper cannot match.",
  },
  {
    q: "What if I need help using EasyRx?",
    a: "Call 808-957-0111 or email asohawaii@hotmail.com. EasyRx also has a dedicated software support team.",
  },
];

export const scannerOptions = [
  "iTero",
  "Medit",
  "Shining 3D",
  "3Shape TRIOS",
  "Primescan",
  "DEXIS",
  "Other",
];
