import HeroVideoPanel, {
  type ImageSlide,
  type VideoClip,
} from "@/components/original/HeroVideoPanel";

/**
 * Hero — full-screen 2-column split composition.
 *
 * Each panel rotates through 4 product clips. When videos are present in
 * /public/videos they are played in sequence (onEnded → next); when the
 * folder is empty the panels cross-fade through fallback product photos.
 *
 * To enable videos, drop MP4 files into /public/videos/ with the filenames
 * listed in LEFT_VIDEOS / RIGHT_VIDEOS below.
 */

// No videos yet — drop MP4s into /public/videos/ and add entries to take
// over from the image slideshow below. See HeroVideoPanel for the schema.
const LEFT_VIDEOS: VideoClip[] = [];
const RIGHT_VIDEOS: VideoClip[] = [];

// Curated hero slides — single-product shots only, verified clean compositions.
// Source files live in /public/images/aso/hero-slides/ (copied from the scrape
// after inspection; text-logo & multi-panel composites were rejected).
// Each slide's `name` must match what is VISIBLY in the photo.
// Captions re-verified by inspecting each image.
const LEFT_IMAGES: ImageSlide[] = [
  {
    // PHOTO: acrylic plate + labial bow + C-clasps on upper arch (Hawley)
    src: "/images/aso/hero-slides/left-01-clear-retainer.jpg",
    alt: "Hawley-style plate retainer with labial bow on stone model",
    name: "Plate Type Retainer",
  },
  {
    // PHOTO: pink MAD sleep appliance with adjustment mechanism
    src: "/images/aso/hero-slides/left-03-somnodent-flex.png",
    alt: "SomnoDent Flex sleep apnea appliance",
    name: "SomnoDent Flex",
  },
  {
    // PHOTO: hard acrylic U-arch occlusal splint (top-down view)
    src: "/images/aso/hero-slides/left-04-occlusal-splint.webp",
    alt: "Hard acrylic occlusal splint — U-arch top-down view",
    name: "Occlusal Splint",
  },
];

const RIGHT_IMAGES: ImageSlide[] = [
  {
    // PHOTO: metal expander with central screw mechanism, miniscrew-assisted
    src: "/images/aso/hero-slides/right-01-mse-marpe.jpg",
    alt: "MSE / MARPE expansion appliance on stone model",
    name: "MSE / MARPE",
  },
  {
    // PHOTO: metal Nance-arch-style banded appliance with molar bands
    src: "/images/aso/hero-slides/right-03-band-appliance.jpg",
    alt: "Banded Nance-arch appliance on stone model",
    name: "Band Appliance",
  },
  {
    // PHOTO: fixed lingual retainer wire on printed segment
    src: "/images/aso/hero-slides/right-04-3d-metal-lingual.jpg",
    alt: "3D-printed metal lingual retainer",
    name: "3D Metal Lingual Retainer",
  },
];

export default function Hero() {
  return (
    <section
      aria-label="Orthodontic Laboratory Solutions"
      className="relative w-full flex flex-col md:flex-row bg-black"
    >
      <div className="relative w-full md:w-1/2 h-[36vh] md:h-[40vh]">
        <HeroVideoPanel
          videos={LEFT_VIDEOS}
          fallbackImages={LEFT_IMAGES}
          alignment="center"
          cta={{ label: "Explore Our Products", href: "/product/" }}
          title={
            <h1 className="font-serif text-white text-balance leading-[1.03] tracking-tightest text-4xl sm:text-5xl lg:text-[3.75rem] max-w-[14ch] mx-auto drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]">
              Orthodontic Laboratory{" "}
              <span className="italic text-brandOrange">Solutions.</span>
            </h1>
          }
        />
      </div>

      <div className="relative w-full md:w-1/2 h-[36vh] md:h-[40vh]">
        <HeroVideoPanel
          videos={RIGHT_VIDEOS}
          fallbackImages={RIGHT_IMAGES}
          alignment="bottom-right"
          cta={{ label: "Explore New Products", href: "/new-products/" }}
        />
      </div>

      {/* Subtle seam between panels on desktop */}
      <div
        aria-hidden
        className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-white/10 pointer-events-none"
      />
    </section>
  );
}
