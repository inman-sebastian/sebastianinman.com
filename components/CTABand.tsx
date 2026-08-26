import { site } from "@/content/site";
import { ButtonLink, ConsultButton } from "@/components/ButtonLink";

type CTABandProps = {
  heading?: string;
  subline?: string;
};

/** Full-width call-to-action band used at the bottom of most pages */
export function CTABand({
  heading = "Not sure where to start? That's what the free consult is for.",
  subline = `Tell me what's eating up your time, and I'll tell you, in plain English, what's worth automating and what it would cost. No pressure, no jargon.`,
}: CTABandProps) {
  return (
    <section className="bg-pine text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
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
