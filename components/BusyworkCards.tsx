import { heroCardIcons } from "@/lib/heroCards";
import { Reveal } from "@/components/Reveal";

/**
 * The "Sound familiar?" busywork pile: small notification-style cards
 * sharing the hero cards' anatomy (icon disc + label) but with opposite
 * mood. Hero cards are alive (rotating, pine icons: work handling
 * itself); these sit still with terracotta icons (tasks waiting on you).
 * Deliberately static; the stagger of the reveal is the only motion.
 * Replaced the interactive poppable swarm, which had drifted from the
 * site's ambient motion language.
 */

const ICON_CYCLE: (keyof typeof heroCardIcons)[] = [
  "mail",
  "clock",
  "calendar",
  "sync",
  "tag",
  "users",
  "chart",
];

export function BusyworkCards({
  items,
  anchor = "…and whatever else is eating your week",
}: {
  items: string[];
  /** Closing card; makes the "and then some" point the pile implies */
  anchor?: string;
}) {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {items.map((item, i) => (
        <li key={item}>
          <Reveal delay={i * 60}>
            <span className="flex items-center gap-2.5 rounded-lg border border-line bg-surface py-2 pl-2.5 pr-4 text-sm font-medium text-ink shadow-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terracotta-tint text-terracotta">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={heroCardIcons[ICON_CYCLE[i % ICON_CYCLE.length]]}
                  />
                </svg>
              </span>
              {item}
            </span>
          </Reveal>
        </li>
      ))}
      <li>
        <Reveal delay={items.length * 60}>
          <span className="flex min-h-11 items-center rounded-lg border border-transparent bg-pine-dark px-4 py-2 text-sm font-medium text-background shadow-sm">
            {anchor}
          </span>
        </Reveal>
      </li>
    </ul>
  );
}
