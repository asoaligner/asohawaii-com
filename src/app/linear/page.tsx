import type { Metadata } from "next";
import Nav from "@/components/linear/Nav";
import Hero from "@/components/linear/Hero";
import WhyEasyRx from "@/components/linear/WhyEasyRx";
import GettingStarted from "@/components/linear/GettingStarted";
import HowToSubmit from "@/components/linear/HowToSubmit";
import ScannerCards from "@/components/linear/ScannerCards";
import FAQ from "@/components/linear/FAQ";
import CTAForm from "@/components/linear/CTAForm";
import Support from "@/components/linear/Support";

export const metadata: Metadata = {
  title: "ASO Hawaii — Linear-inspired variant",
};

export default function LinearPage() {
  return (
    <div className="linear-root">
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
