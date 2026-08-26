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
  children,
}: HeroSplashProps) {
  return (
    <section className="relative overflow-hidden bg-pine-dark">
      <HeroCards poolA={poolA} poolB={poolB} />
      <div
        className={`relative mx-auto flex max-w-6xl items-center px-4 sm:px-6 ${
          compact
            ? "py-16 md:min-h-[440px] md:py-20"
            : "py-20 md:min-h-[560px] md:py-24 lg:min-h-[640px]"
        }`}
      >
        <div className="max-w-xl">
          {eyebrow && (
            // Lightened terracotta for contrast on the dark green
            <p className="max-w-md text-balance text-sm font-semibold uppercase tracking-wide text-[#e09468]">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-background sm:text-5xl">
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
