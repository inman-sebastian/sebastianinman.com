import fs from "fs";
import path from "path";
import Image from "next/image";

type SiteImageProps = {
  /** Path under /public, e.g. "/images/hero.jpg" */
  src: string;
  alt: string;
  /**
   * Description of the image to generate. Shown inside the placeholder
   * until the real file exists at `src`. Also log it in IMAGES.md.
   */
  prompt: string;
  /** Box size; defaults to 4:3, the site-wide standard for generated images */
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  /**
   * Render as a full-bleed background that covers its nearest relative
   * ancestor (used by the home hero). Ignores width/height.
   */
  fill?: boolean;
};

/**
 * Renders the real image if the file exists in /public, otherwise a
 * placeholder box showing the generation prompt and target filename.
 * To replace: generate the image and save it to /public at `src`. No
 * code changes needed.
 */
export function SiteImage({
  src,
  alt,
  prompt,
  width = 1200,
  height = 900,
  priority = false,
  className = "",
  fill = false,
}: SiteImageProps) {
  const exists = fs.existsSync(path.join(process.cwd(), "public", src));

  if (fill) {
    if (exists) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className={`object-cover ${className}`}
        />
      );
    }
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex items-center justify-center bg-pine-tint/60 md:justify-end ${className}`}
      >
        <div className="relative z-10 hidden max-w-sm rounded-xl border-2 border-dashed border-line bg-surface/90 p-6 text-center sm:block md:mr-12">
          <p className="text-sm italic leading-relaxed text-pine-dark/70">
            {prompt}
          </p>
          <code className="mt-3 inline-block rounded bg-surface px-2 py-0.5 text-xs text-muted">
            {src}
          </code>
        </div>
      </div>
    );
  }

  if (exists) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        style={{ aspectRatio: `${width} / ${height}` }}
        className={`w-full rounded-xl object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line bg-pine-tint/60 p-6 text-center ${className}`}
    >
      <svg
        className="h-8 w-8 text-pine/50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0 0 21.75 19.5V4.5A1.5 1.5 0 0 0 20.25 3H3.75A1.5 1.5 0 0 0 2.25 4.5v15A1.5 1.5 0 0 0 3.75 21Z"
        />
      </svg>
      <p className="max-w-md text-sm italic leading-relaxed text-pine-dark/70">
        {prompt}
      </p>
      <code className="rounded bg-surface px-2 py-0.5 text-xs text-muted">
        {src}
      </code>
    </div>
  );
}
