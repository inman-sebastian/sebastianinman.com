import type { ReactNode } from "react";
import { site } from "@/content/site";
import { SiteImage } from "@/components/SiteImage";
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
 * Full-width hero: the shared 16:9 landscape as background, a gradient
 * that keeps the text side readable while leaving the artwork (and the
 * floating example cards) clear on the right, and left-aligned content.
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
    <section className="relative overflow-hidden border-b border-line">
      <SiteImage
        fill
        priority
        src={site.heroImage.src}
        alt={site.heroImage.alt}
        prompt={site.heroImage.prompt}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-background/90 to-background/50 md:bg-gradient-to-r md:from-background md:via-background/65 md:via-45% md:to-transparent md:to-80%"
      />
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
            <p className="max-w-md text-balance text-sm font-semibold uppercase tracking-wide text-terracotta">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-pine-dark sm:text-5xl">
            {heading}
          </h1>
          {text && <p className="mt-5 text-lg leading-relaxed text-ink/80">{text}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}
