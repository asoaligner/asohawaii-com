"use client";

import { useLightbox } from "@/components/LightboxProvider";

type Props = {
  /** Image path to look up in the LightboxProvider's items list. */
  image: string;
  /** aria-label for accessibility. */
  label: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Client-side button wrapper that turns the hero image region into a
 * trigger for the page-level Lightbox. Delegates to openByImage() so
 * the lightbox opens at whichever catalog item owns this image — which
 * means the left/right arrows then cycle through the full lineup
 * starting from the hero's item.
 */
export default function HeroImageButton({
  image,
  label,
  className,
  children,
}: Props) {
  const { openByImage } = useLightbox();
  return (
    <button
      type="button"
      onClick={() => openByImage(image)}
      aria-label={label}
      className={`${className ?? ""} cursor-zoom-in text-left`}
    >
      {children}
    </button>
  );
}
