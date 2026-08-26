import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";
import type { LandingPage } from "@/lib/content";

/**
 * Card for one service area on the About page: abstract topographic map
 * art up top (same flush 1px-inset treatment as ServiceCard), town name,
 * and a one-line local hook. Links to the area's landing page.
 */
export function AreaCard({ area }: { area: LandingPage }) {
  return (
    <Link
      href={`/${area.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-lg motion-reduce:hover:translate-y-0"
    >
      <div className="p-px">
        <SiteImage
          src={area.image}
          alt={area.imageAlt}
          prompt={area.imagePrompt}
          width={800}
          height={600}
          className="!rounded-t-[11px] !rounded-b-none"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-pine-dark transition-colors duration-300 group-hover:text-pine">
          {area.title}
        </h3>
        {area.areaBlurb && (
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {area.areaBlurb}
          </p>
        )}
      </div>
    </Link>
  );
}
