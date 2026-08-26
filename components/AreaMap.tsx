"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Stylized (but geographically accurate) map of the Rogue Valley with
 * pins for each location landing page, paired with the pill links as a
 * legend. Pin positions are projected from real lat/lon coordinates:
 *   x = (lon - LON_MIN) / (LON_MAX - LON_MIN) * W
 *   y = (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * H
 * with the viewBox aspect matching the real east-west/north-south span
 * at this latitude. If a new location page's city isn't in CITY_COORDS,
 * its pill still renders; add its real coordinates to put it on the map.
 */

const W = 640;
const H = 404;

// Real coordinates, projected with the constants above
// (LON -123.40 to -122.65, LAT 42.15 to 42.50)
const CITY_COORDS: Record<string, { x: number; y: number; label: [number, number, "middle" | "start" | "end"] }> = {
  "Grants Pass": { x: 61, y: 70, label: [61, 52, "middle"] },
  "Central Point": { x: 413, y: 143, label: [413, 127, "middle"] },
  Medford: { x: 447, y: 200, label: [462, 205, "start"] },
  Jacksonville: { x: 369, y: 215, label: [369, 237, "middle"] },
  Phoenix: { x: 497, y: 259, label: [512, 264, "start"] },
  Talent: { x: 522, y: 294, label: [537, 299, "start"] },
  Ashland: { x: 589, y: 352, label: [589, 375, "middle"] },
};

type Area = { slug: string; title: string; city: string };

export function AreaMap({ areas }: { areas: Area[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="mt-8 grid items-center gap-8 md:grid-cols-[1fr_1.6fr]">
      {/* Legend: the actual links */}
      <ul className="flex flex-wrap gap-2 md:flex-col md:gap-2.5">
        {areas.map((area) => (
          <li key={area.slug}>
            <Link
              href={`/${area.slug}`}
              onMouseEnter={() => setHovered(area.city)}
              onMouseLeave={() => setHovered(null)}
              className={`inline-block rounded-full border border-line px-4 py-2 text-sm font-medium text-pine-dark transition-colors ${
                hovered === area.city ? "bg-pine-tint" : "bg-pine-tint/60 hover:bg-pine-tint"
              }`}
            >
              {area.title}
            </Link>
          </li>
        ))}
      </ul>

      {/* The map */}
      <div className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="Stylized map of the Rogue Valley showing the towns I serve, from Grants Pass in the northwest to Ashland in the southeast"
        >
          {/* Terrain hints: Siskiyou ridge (south), hills near Grants Pass */}
          <g stroke="var(--color-pine)" strokeOpacity="0.16" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M540 398 l14 -12 l14 12 M576 392 l13 -11 l13 11 M610 398 l12 -10 l12 10" />
            <path d="M10 26 l12 -10 l12 10 M44 20 l11 -9 l11 9 M20 48 l10 -8 l10 8" />
            <path d="M240 330 l12 -10 l12 10 M274 340 l11 -9 l11 9" />
          </g>

          {/* Jackson / Josephine county line (true longitude ~-123.25) */}
          <path
            d="M128 0 Q124 100 132 200 Q128 300 126 404"
            stroke="var(--color-muted)"
            strokeOpacity="0.22"
            strokeWidth="1.5"
            strokeDasharray="5 6"
            fill="none"
          />
          <text x="78" y="300" className="fill-[var(--color-muted)]" opacity="0.5" fontSize="10" letterSpacing="2.5" textAnchor="middle">
            JOSEPHINE
          </text>
          <text x="315" y="315" className="fill-[var(--color-muted)]" opacity="0.5" fontSize="10" letterSpacing="2.5" textAnchor="middle">
            JACKSON
          </text>

          {/* Rogue River: upper Rogue in from the north, past Gold Hill,
              through Grants Pass, then west out of frame */}
          <path
            d="M515 0 Q488 38 440 62 Q368 88 299 74 Q244 64 196 68 Q120 74 61 64 Q22 70 0 98"
            stroke="var(--color-pine)"
            strokeOpacity="0.4"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <text x="235" y="52" className="fill-[var(--color-pine)]" opacity="0.55" fontSize="10" fontStyle="italic" textAnchor="middle">
            Rogue River
          </text>

          {/* I-5 through the Bear Creek corridor */}
          <path
            d="M632 404 Q610 375 589 352 Q550 320 522 294 Q508 275 497 259 Q470 225 447 200 Q428 168 413 143 Q360 103 299 81 Q245 76 196 78 Q120 84 61 74 Q30 70 0 66"
            stroke="var(--color-muted)"
            strokeOpacity="0.38"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <text x="600" y="330" className="fill-[var(--color-muted)]" opacity="0.6" fontSize="10" fontStyle="italic" textAnchor="middle">
            I-5
          </text>

          {/* Hwy 238: Medford, Jacksonville, Applegate, Murphy, Grants Pass */}
          <path
            d="M447 200 Q400 206 369 215 Q280 244 196 262 Q110 275 62 180 Q50 120 61 70"
            stroke="var(--color-muted)"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            strokeDasharray="1 5"
            fill="none"
            strokeLinecap="round"
          />

          {/* North arrow */}
          <g transform="translate(614, 22)" className="fill-[var(--color-muted)]" opacity="0.55">
            <path d="M0 8 L4 -8 L8 8 L4 4 Z" />
            <text x="4" y="24" fontSize="11" textAnchor="middle">N</text>
          </g>

          {/* Town pins */}
          {Object.entries(CITY_COORDS).map(([city, c]) => {
            const isHovered = hovered === city;
            const [lx, ly, anchor] = c.label;
            return (
              <g key={city}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? 8 : 5.5}
                  fill="var(--color-terracotta)"
                  stroke="var(--color-surface)"
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />
                {isHovered && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="13"
                    fill="none"
                    stroke="var(--color-terracotta)"
                    strokeOpacity="0.4"
                    strokeWidth="2"
                  />
                )}
                <text
                  x={lx}
                  y={ly}
                  fontSize={isHovered ? 14 : 13}
                  fontWeight={isHovered ? 700 : 500}
                  textAnchor={anchor}
                  className="fill-[var(--color-pine-dark)] transition-all"
                >
                  {city}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
