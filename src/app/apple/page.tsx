import type { Metadata } from "next";
import Nav from "@/components/apple/Nav";
import Hero from "@/components/apple/Hero";
import WhyEasyRx from "@/components/apple/WhyEasyRx";
import GettingStarted from "@/components/apple/GettingStarted";
import HowToSubmit from "@/components/apple/HowToSubmit";
import ScannerCards from "@/components/apple/ScannerCards";
import FAQ from "@/components/apple/FAQ";
import CTAForm from "@/components/apple/CTAForm";
import Support from "@/components/apple/Support";

export const metadata: Metadata = {
  title: "ASO Hawaii — Apple-inspired variant",
};

export default function ApplePage() {
  return (
    <div className="apple-root">
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
