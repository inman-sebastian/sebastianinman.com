import { site } from "@/content/site";
import { ButtonLink, ConsultButton } from "@/components/ButtonLink";
import { SiteImage } from "@/components/SiteImage";

type CTABandProps = {
  heading?: string;
  subline?: string;
};

/** Full-width call-to-action band used at the bottom of most pages */
export function CTABand({
  heading = "Not sure where to start? Let's figure that out together.",
  subline = `Tell me what's eating up your time, and I'll give you a straight answer about what's worth automating and what it would cost. No pressure, no jargon.`,
}: CTABandProps) {
  return (
    <section className="relative overflow-hidden bg-pine text-white">
      {/* Treetop silhouette background; drifts slowly like the hero */}
      <SiteImage
        fill
        src="/images/cta-treetops.jpg"
        alt="Silhouetted pine treetops"
        prompt="Wide 16:9 flat illustration used as a background: a solid deep pine green field (#234f3e) with a silhouetted skyline of pine treetops rising from the bottom edge in a slightly darker green (#18382c), and one or two subtle layered ridgelines behind them. The upper two thirds are completely plain solid deep pine green with no detail. Flat vector style, no texture, no text or lettering anywhere."
        className="hero-kenburns !bg-transparent object-bottom"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold">{heading}</h2>
        <p className="mx-auto mt-4 max-w-xl text-balance leading-relaxed text-white/85">
          {subline}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <ConsultButton />
          <ButtonLink href="/contact" variant="light">
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
