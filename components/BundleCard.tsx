import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";

/**
 * The "Need more than one?" bundle card. Mirrors the ServiceCard anatomy
 * (flush image, corner chip, top-aligned content) so it sits in a
 * services grid as a sibling; the terracotta tint sets it apart from the
 * five priced services. Used as the sixth card on the homepage grid and
 * the /services overview.
 */
export function BundleCard({
  headingLevel = "h3",
}: {
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <Link
      href="/contact"
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-terracotta/20 bg-terracotta-tint transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-lg motion-reduce:hover:translate-y-0"
    >
      <div className="relative p-px">
        <SiteImage
          src="/images/services/mix-and-match.jpg"
          alt="Illustration of service pieces fitting together like a puzzle"
          prompt="Flat illustration of two friendly hands assembling four large rounded puzzle pieces on a warm wooden workshop table so they click together into one neat square, each piece decorated with a simple picture: a laptop showing a small storefront website, a chat bubble, two connected gears, and a little rising chart, earthy cream, pine green, and terracotta palette. No text or lettering anywhere."
          width={800}
          height={600}
          sizes="(min-width: 1152px) 368px, (min-width: 640px) 50vw, 100vw"
          className="!rounded-t-[11px] !rounded-b-none"
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold text-terracotta shadow-sm">
          One flat quote
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 pt-4">
        <Heading className="text-xl font-semibold text-pine-dark">
          Need more than one?
        </Heading>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/80">
          Most of my clients do. Combined projects get scoped together with
          one flat quote, and it usually costs less than doing them
          separately.
        </p>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-dark">
            Popular combos
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {[
              "New Website + AI Assistant",
              "Automation + Tool Integration",
              "AI Insights + Automation",
            ].map((combo) => (
              <li
                key={combo}
                className="whitespace-nowrap rounded-md bg-surface/80 px-2 py-1 text-xs font-medium text-ink"
              >
                {combo}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 border-t border-terracotta/20 pt-4 text-sm font-semibold text-terracotta-dark group-hover:underline">
          Let&rsquo;s scope it together →
        </p>
      </div>
    </Link>
  );
}
