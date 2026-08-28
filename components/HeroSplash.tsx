import type { ReactNode } from "react";
import { HeroCards } from "@/components/HeroCards";
import type { HeroCard } from "@/lib/heroCards";

type HeroSplashProps = {
  eyebrow?: string;
  heading: string;
  text?: string;
  /** Rotating example cards; omit to use the homepage defaults */
  poolA?: HeroCard[];
  poolB?: HeroCard[];
  /** Shorter hero for inner pages */
  compact?: boolean;
  /**
   * Match the hero column to a centered max-w-3xl article column (blog
   * posts) instead of the wide 6xl grid, so the hero text and the prose
   * below share a left edge. Extra bottom padding keeps the overlapping
   * article image clear of the text.
   */
  narrow?: boolean;
  /** Set false on pages that don't need the rotating example cards */
  cards?: boolean;
  /**
   * Color of the zigzag teeth along the hero's bottom edge; must match
   * the background of the section that follows ("background" cream by
   * default, "surface" when the next section is a surface band)
   */
  edge?: "background" | "surface";
  /** CTA buttons */
  children?: ReactNode;
};

/**
 * Full-width hero: flat deep-pine background with light-on-dark text and
 * the floating example cards on the right. The site is image-heavy
 * elsewhere, so the hero stays a plain color on purpose.
 */
export function HeroSplash({
  eyebrow,
  heading,
  text,
  poolA,
  poolB,
  compact = false,
  narrow = false,
  cards = true,
  edge = "background",
  children,
}: HeroSplashProps) {
  return (
    <section className="relative overflow-hidden bg-pine-dark">
      {cards && <HeroCards poolA={poolA} poolB={poolB} />}
      {/* Sawtooth bottom edge: cream teeth biting into the green.
          -bottom-px sinks it 1px into the next section so subpixel
          rounding can't leave a green hairline under the teeth. */}
      <svg
        aria-hidden="true"
        className={`absolute inset-x-0 -bottom-px h-2.5 w-full ${
          edge === "surface" ? "text-surface" : "text-background"
        }`}
      >
        <defs>
          <pattern
            id="hero-zigzag"
            width="20"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 10 L10 0 L20 10 Z" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-zigzag)" />
      </svg>
      <div
        className={`relative mx-auto flex items-center px-4 sm:px-6 ${
          narrow ? "max-w-3xl" : "max-w-6xl"
        } ${
          compact
            ? narrow
              ? "py-16 md:min-h-[460px] md:py-20 md:pb-36"
              : "py-16 md:min-h-[460px] md:py-20 md:pb-24"
            : "py-20 md:min-h-[560px] md:py-24 lg:min-h-[640px]"
        }`}
      >
        {/* Capped at the width of the section grids' left column below, so
            the text always clears the rotating cards and any element that
            overlaps up into the hero (images, form card, headshot). Narrow
            heroes span their whole (already narrow) column instead. */}
        <div className={narrow ? undefined : "max-w-xl md:max-w-[calc(50%-1.25rem)]"}>
          {eyebrow && (
            // Lightened terracotta for contrast on the dark green
            <p className="max-w-md text-balance text-sm font-semibold uppercase tracking-wide text-[#e09468]">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-4xl font-semibold leading-none text-background sm:text-5xl">
            {heading}
          </h1>
          {text && (
            <p className="mt-5 text-lg leading-relaxed text-background/80">{text}</p>
          )}
          {children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}
