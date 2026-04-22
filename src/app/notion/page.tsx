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
} from "@/components/notion/Sections";

export const metadata: Metadata = {
  title: "ASO Hawaii — Notion-inspired variant",
};

export default function NotionPage() {
  return (
    <div className="notion-root">
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
