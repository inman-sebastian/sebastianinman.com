import { site } from "@/content/site";
import { ButtonLink, ConsultButton } from "@/components/ButtonLink";
import { SiteImage } from "@/components/SiteImage";

type CTABandProps = {
  heading?: string;
  subline?: string;
  /** Service slug; pre-checks that service's card on the contact form */
  service?: string;
};

/** Full-width call-to-action band used at the bottom of most pages */
export function CTABand({
  heading = "Not sure where to start? Let's figure that out together.",
  subline = `Tell me what's eating up your time, and I'll give you a straight answer about what's worth automating and what it would cost. No pressure, no jargon.`,
  service,
}: CTABandProps) {
  return (
    <section className="relative bg-pine text-white">
      {/* Sawtooth top edge: band-green teeth biting up into the page, so
          the CTA band + footer read as one continuous green block with a
          single textured top edge. Sits 1px into the band against
          subpixel hairlines. */}
      <svg
        aria-hidden="true"
        className="absolute inset-x-0 top-px h-2.5 w-full -translate-y-full text-pine"
      >
        <defs>
          <pattern
            id="cta-zigzag"
            width="20"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 10 L10 0 L20 10 Z" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cta-zigzag)" />
      </svg>
      {/* Treetop silhouette background; drifts slowly like the hero.
          Its own overflow-hidden wrapper (not on the section, which would
          clip the sawtooth above) keeps the drift from bleeding out. */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <SiteImage
          fill
          src="/images/cta-treetops.jpg"
          alt="Silhouetted pine treetops"
          prompt="Wide 16:9 flat illustration used as a background: a solid deep pine green field (#234f3e) with a silhouetted skyline of pine treetops rising from the bottom edge in a slightly darker green (#18382c), and one or two subtle layered ridgelines behind them. The upper two thirds are completely plain solid deep pine green with no detail. Flat vector style, no texture, no text or lettering anywhere."
          className="hero-kenburns !bg-transparent object-bottom"
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold">{heading}</h2>
        <p className="mx-auto mt-4 max-w-xl text-balance leading-relaxed text-white/85">
          {subline}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <ConsultButton service={service} />
          <ButtonLink
            href={service ? `/contact?service=${service}` : "/contact"}
            variant="light"
          >
            Send a message
          </ButtonLink>
        </div>
        <p className="mt-6 text-sm text-white/70">
          Or just call:{" "}
          <a
            href={site.phoneHref}
            className="whitespace-nowrap underline underline-offset-2 hover:text-white"
          >
            {site.phone}
          </a>
        </p>
      </div>
    </section>
  );
}
