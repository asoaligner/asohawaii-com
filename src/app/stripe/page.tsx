import type { Metadata } from "next";
import Nav from "@/components/stripe/Nav";
import Hero from "@/components/stripe/Hero";
import WhyEasyRx from "@/components/stripe/WhyEasyRx";
import GettingStarted from "@/components/stripe/GettingStarted";
import HowToSubmit from "@/components/stripe/HowToSubmit";
import ScannerCards from "@/components/stripe/ScannerCards";
import FAQ from "@/components/stripe/FAQ";
import CTAForm from "@/components/stripe/CTAForm";
import Support from "@/components/stripe/Support";

export const metadata: Metadata = {
  title: "ASO Hawaii — Stripe-inspired variant",
};

export default function StripePage() {
  return (
    <div className="stripe-root">
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
