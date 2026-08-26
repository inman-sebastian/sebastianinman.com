import { site } from "@/content/site";
import { ButtonLink, ConsultButton } from "@/components/ButtonLink";

type CTABandProps = {
  heading?: string;
  subline?: string;
};

/** Full-width call-to-action band used at the bottom of most pages */
function Leaf({
  className,
  style,
}: {
  className: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`leaf-drift pointer-events-none absolute ${className}`}
      style={style}
    >
      <path d="M12 2C6.5 6.5 4 12.5 12 22c8-9.5 5.5-15.5 0-20Z" />
      <path
        d="M12 5v14"
        stroke="var(--color-pine)"
        strokeWidth="0.75"
        fill="none"
      />
    </svg>
  );
}

export function CTABand({
  heading = "Not sure where to start? That's what the free consult is for.",
  subline = `Tell me what's eating up your time, and I'll tell you, in plain English, what's worth automating and what it would cost. No pressure, no jargon.`,
}: CTABandProps) {
  return (
    <section className="relative overflow-hidden bg-pine text-white">
      {/* Ambient drifting leaves, a nod to the Southern Oregon pines */}
      <Leaf
        className="left-[6%] top-10 h-8 w-8 text-white/10"
        style={{ "--leaf-tilt": "-18deg", "--leaf-duration": "12s" } as React.CSSProperties}
      />
      <Leaf
        className="right-[10%] top-16 h-12 w-12 text-white/[0.08]"
        style={{ "--leaf-tilt": "24deg", "--leaf-duration": "15s", "--leaf-delay": "2s" } as React.CSSProperties}
      />
      <Leaf
        className="bottom-8 left-[22%] h-10 w-10 text-white/[0.07]"
        style={{ "--leaf-tilt": "40deg", "--leaf-duration": "13s", "--leaf-delay": "5s" } as React.CSSProperties}
      />
      <Leaf
        className="bottom-14 right-[26%] h-6 w-6 text-white/10"
        style={{ "--leaf-tilt": "-30deg", "--leaf-duration": "10s", "--leaf-delay": "3.5s" } as React.CSSProperties}
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
