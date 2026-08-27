import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import type { Service } from "@/lib/content";

/**
 * The one service card design, used by the homepage grid and the
 * /services overview so they stay consistent. Lift, shadow, and image
 * zoom share one duration/easing so the hover reads as a single motion.
 */
export function ServiceCard({
  service,
  headingLevel = "h3",
}: {
  service: Service;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-lg motion-reduce:hover:translate-y-0"
    >
      {/* Image sits flush against the card's top/left/right with a 1px
          surface gap as a hairline outline; inner radius = outer 12px
          minus the 1px inset so the curves nest cleanly. */}
      <div className="relative p-px">
        <SiteImage
          src={service.image}
          alt={service.imageAlt}
          prompt={service.imagePrompt}
          width={800}
          height={600}
          sizes="(min-width: 1152px) 552px, (min-width: 640px) 50vw, 100vw"
          className="!rounded-t-[11px] !rounded-b-none"
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold text-terracotta shadow-sm">
          From ${service.startingPrice.toLocaleString()}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 pt-4">
      <Heading className="text-xl font-semibold text-pine-dark transition-colors duration-500 group-hover:text-pine">
        {service.title}
      </Heading>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {service.summary}
      </p>
      {service.bestFor.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Best for
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {service.bestFor.map((type) => (
              <li
                key={type}
                className="whitespace-nowrap rounded-md bg-pine-tint/60 px-2 py-1 text-xs font-medium text-pine-dark"
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-4 border-t border-line pt-4 text-sm font-semibold text-pine group-hover:underline">
        See what&rsquo;s included →
      </p>
      </div>
    </Link>
  );
}
