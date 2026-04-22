import type { Metadata } from "next";
import {
  ConsultationBand,
  CustomOralAppliances,
  FAQ,
  Hero,
  HowToSubmitEasyRx,
  NewProducts,
  RequestEasyRxForm,
  ScannerPlatforms,
  TrustedLab,
} from "@/components/supabase/HomeSections";

export const metadata: Metadata = {
  title: "ASO International Hawaii — Orthodontic Laboratory Solutions",
  description:
    "Orthodontic laboratory in Honolulu. Retainers, aligners, and custom appliances for dental professionals — delivered from your digital scans via EasyRx. Scanner-agnostic, HIPAA-compliant.",
};

export default function SupabaseHome() {
  return (
    <>
      <Hero />
      <NewProducts />
      <CustomOralAppliances />
      <ConsultationBand />
      <TrustedLab />
      <HowToSubmitEasyRx />
      <RequestEasyRxForm />
      <ScannerPlatforms />
      <FAQ />
    </>
  );
}
