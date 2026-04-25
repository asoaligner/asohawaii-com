import Hero from "@/components/Hero";
import IosAcceptanceBand from "@/components/IosAcceptanceBand";
import FeaturedProducts from "@/components/FeaturedProducts";
import CustomOralAppliances from "@/components/CustomOralAppliances";
import ConsultationBand from "@/components/ConsultationBand";
import HowToSubmit from "@/components/HowToSubmit";
import FAQ from "@/components/FAQ";
import CTAForm from "@/components/CTAForm";
import MiniatureCollectionBand from "@/components/MiniatureCollectionBand";
import SubmitCaseBand from "@/components/SubmitCaseBand";

export default function Home() {
  return (
    <>
      <Hero />
      <IosAcceptanceBand />
      <FeaturedProducts />
      <SubmitCaseBand />
      <CustomOralAppliances />
      <MiniatureCollectionBand />
      <ConsultationBand />
      <HowToSubmit />
      <FAQ />
      <CTAForm />
    </>
  );
}
