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
} from "@/components/claude/Sections";

export const metadata: Metadata = {
  title: "ASO Hawaii — Claude-inspired variant",
};

export default function ClaudePage() {
  return (
    <div className="claude-root">
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
