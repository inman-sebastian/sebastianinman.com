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
      className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:shadow-xl motion-reduce:hover:translate-y-0"
    >
      <SiteImage
        src={service.image}
        alt={service.imageAlt}
        prompt={service.imagePrompt}
        width={800}
        height={600}
      />
      <Heading className="mt-4 text-xl font-semibold text-pine-dark transition-colors duration-500 group-hover:text-pine">
        {service.title}
      </Heading>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {service.summary}
      </p>
      <p className="mt-4 flex items-center justify-between text-sm font-semibold">
        <span className="text-terracotta">
          Starting at ${service.startingPrice.toLocaleString()}
        </span>
        <span className="text-pine group-hover:underline">Learn more →</span>
      </p>
    </Link>
  );
}
