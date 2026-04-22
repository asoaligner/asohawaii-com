import type { Metadata } from "next";
import {
  Nav,
  Hero,
  WhyEasyRx,
  GettingStarted,
  HowToSubmit,
  ScannerCards,
  FAQ,
  CTAForm,
  Support,
} from "@/components/vercel/Sections";

export const metadata: Metadata = {
  title: "ASO Hawaii — Vercel-inspired variant",
};

export default function VercelPage() {
  return (
    <div className="vercel-root">
      <Nav />
      <main>
        <Hero />
        <WhyEasyRx />
        <GettingStarted />
        <HowToSubmit />
        <ScannerCards />
        <FAQ />
        <CTAForm />
        <Support />
      </main>
    </div>
  );
}
