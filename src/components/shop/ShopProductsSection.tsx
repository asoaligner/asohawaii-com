"use client";

import ShopProductCard from "./ShopProductCard";

export default function ShopProductsSection() {
  return (
    <section
      id="products"
      className="py-20 md:py-28 bg-gray-50/60 border-y border-gray-200/60 scroll-mt-24"
    >
      <div className="container-narrow">
        <div className="max-w-2xl mb-14">
          <div className="text-xs uppercase tracking-widest text-brandOrange font-medium mb-5">
            The collection
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl leading-[1.15] tracking-tightest text-navy text-balance">
            Two ways to <span className="italic">own a piece.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ShopProductCard
            slug="complete-collection"
            name="Complete Collection (Set of 5)"
            price={220}
            description="Five hand-crafted miniature models showcasing different orthodontic appliance types, displayed in a premium clear acrylic case with subtle ASO branding."
            image="/images/aso/miniature/miniature-set.jpg"
            imageAlt="Complete set of 5 ASO miniature orthodontic models in a clear acrylic display case"
            badge="Bestseller"
            className="lg:col-span-7"
          />
          <ShopProductCard
            slug="individual-model"
            name="Individual Model"
            price={48}
            description="A single hand-crafted miniature, perfect as a keepsake or gift. Choose your favorite appliance type."
            image="/images/aso/miniature/miniature-hand.jpg"
            imageAlt="Individual ASO miniature orthodontic model"
            needsApplianceType
            className="lg:col-span-5"
          />
        </div>
      </div>
    </section>
  );
}
