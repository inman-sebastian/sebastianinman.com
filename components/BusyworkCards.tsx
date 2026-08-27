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

/**
 * Keyword -> icon rules, first match wins. Ordered so specific words
 * beat generic ones ("Voicemail tag" must hit phone, not tag; "Retyping
 * customer info" must hit sync, not users). The shared icon map holds
 * Heroicons outline paths; if it ever needs to grow much, switching to
 * the @heroicons/react package gives the same visuals without
 * hand-copying path data.
 */
const ICON_RULES: [pattern: RegExp, icon: keyof typeof heroCardIcons][] = [
  [/call|phone|voicemail/i, "phone"],
  [/retyp|copy.?paste|data entry|spreadsheet|sync|app.?hopping/i, "sync"],
  [/invoice|quote|price|\bfees?\b|receipt|subscription/i, "tag"],
  [/review|seller/i, "star"],
  // calendar before chart: "Double bookings" must hit /booking/, not /book/
  [/appointment|booking|reminder|schedul|season/i, "calendar"],
  [/report|numbers|sales|book|decision/i, "chart"],
  [/inbox|email|mail|repl|question/i, "mail"],
  [/website|online|site/i, "globe"],
  [/customer|lead|client|staff|crew|competitor/i, "users"],
];

function iconFor(item: string): keyof typeof heroCardIcons {
  return ICON_RULES.find(([pattern]) => pattern.test(item))?.[1] ?? "clock";
}

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
                    d={heroCardIcons[iconFor(item)]}
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
