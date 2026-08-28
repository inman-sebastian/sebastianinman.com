"use client";

import { useEffect, useState } from "react";
import { heroCardIcons, type HeroCard } from "@/lib/heroCards";

/**
 * Small UI cards floating over the hero landscape, showing busywork
 * handling itself. Each of the two slots rotates through a pool of
 * examples, popping cards in and out bubble-style on staggered timers.
 * Pages can pass their own pools (service pages define theirs in MDX
 * frontmatter); the defaults below are the homepage's mix. Desktop only.
 */

// Homepage defaults. Top slot: one-line notifications, each based on a
// real automation small businesses actually run
const defaultPoolA: HeroCard[] = [
  {
    type: "notice",
    icon: "check",
    title: "Invoice #142 paid",
    sub: "Reminder went out on its own",
  },
  {
    type: "notice",
    icon: "calendar",
    title: "Appointment reminders sent",
    sub: "5 of tomorrow's 8 already confirmed",
  },
  {
    type: "notice",
    icon: "star",
    title: "New 5-star review",
    sub: "Thank-you reply drafted and ready",
  },
  {
    type: "notice",
    icon: "sync",
    title: "New customer entered once",
    sub: "Billing, email, and calendar all updated",
  },
  {
    type: "notice",
    icon: "star",
    title: "Review request sent",
    sub: "Right after the job wrapped up",
  },
  {
    type: "notice",
    icon: "tag",
    title: "Low stock flagged",
    sub: "Reorder reminder before the weekend rush",
  },
];

// Homepage defaults. Lower slot: chats and conversions
const defaultPoolB: HeroCard[] = [
  {
    type: "chat",
    question: "Are you open Saturday?",
    answer: "Yes! Open 9 to 3. Want me to save you a spot?",
    caption: "Answered automatically at 9:42 PM",
  },
  {
    type: "chat",
    question: "Do you carry cedar fence boards?",
    answer: "We do! 6-foot boards are in stock right now.",
    caption: "Answered automatically at 6:15 AM",
  },
  {
    type: "voice",
    duration: "0:14",
    text: "Hi, hoping you can fit me in for a cut this Friday afternoon. Call me back!",
    caption: "Voicemail transcribed the moment it landed",
  },
  {
    type: "chat",
    question: "Do you deliver?",
    answer: "We do, within 15 miles! Want a quote?",
    caption: "Answered automatically on a Sunday",
  },
  {
    type: "translate",
    original: "\u00bfHacen pedidos grandes para eventos?",
    translated: "Do you take large orders for events?",
    caption: "Translated automatically, both directions",
  },
];

// Homepage defaults. Middle slot (homepage only): a second mixed pool so
// the desktop hero reads as a lively cluster instead of two far corners
const defaultPoolC: HeroCard[] = [
  {
    type: "notice",
    icon: "chart",
    title: "Weekly numbers ready",
    sub: "Saturday sales up 12% over last month",
  },
  {
    type: "notice",
    icon: "mail",
    title: "Missed call texted back",
    sub: "They heard from you in seconds",
  },
  {
    type: "chat",
    question: "Can I move my appointment to Thursday?",
    answer: "Done! See you Thursday at 2.",
    caption: "Rescheduled without a phone call",
  },
  {
    type: "notice",
    icon: "sync",
    title: "Sales synced to the books",
    sub: "The register and QuickBooks finally agree",
  },
  {
    type: "notice",
    icon: "users",
    title: "New lead saved",
    sub: "Website form straight into your customer list",
  },
];

const EXIT_MS = 300;

/** Cycles through a pool: waits, pops the card out, swaps, pops the next in */
function useRotation(poolLength: number, periodMs: number, offsetMs: number) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (poolLength <= 1) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    let swapTimer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      setLeaving(true);
      swapTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % poolLength);
        setLeaving(false);
      }, EXIT_MS);
    };
    const start = setTimeout(() => {
      tick();
      interval = setInterval(tick, periodMs);
    }, offsetMs);
    return () => {
      clearTimeout(start);
      clearTimeout(swapTimer);
      if (interval) clearInterval(interval);
    };
  }, [poolLength, periodMs, offsetMs]);

  return { index, leaving };
}

function CardBody({ card }: { card: HeroCard }) {
  // Cards size to their content (w-max) up to a cap, so most lines never
  // wrap at all; the cap keeps rare long lines wrapping naturally
  // (long first line, shorter second) instead of balance's stubby first
  // lines. Right edge stays anchored, so width variance grows leftward.
  if (card.type === "chat") {
    return (
      <div className="flex w-[22rem] max-w-[22rem] flex-col gap-2 rounded-xl border border-line bg-surface/95 p-4 shadow-lg">
        <p className="self-start rounded-2xl rounded-bl-sm bg-pine-tint px-3 py-1.5 text-sm text-pine-dark">
          {card.question}
        </p>
        <p className="self-end rounded-2xl rounded-br-sm bg-pine px-3 py-1.5 text-sm text-white">
          {card.answer}
        </p>
        <p className="mt-1 text-xs text-muted">{card.caption}</p>
      </div>
    );
  }
  if (card.type === "voice") {
    // A voicemail bubble (waveform + duration) with its transcription
    // written out beneath it: reading beats replaying
    return (
      <div className="flex w-[22rem] max-w-[22rem] flex-col gap-2 rounded-xl border border-line bg-surface/95 p-4 shadow-lg">
        <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-sm bg-pine-tint px-3 py-2">
          <span className="flex items-center gap-[3px]" aria-hidden="true">
            {[5, 9, 13, 8, 15, 11, 6, 12, 9, 4].map((h, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-pine"
                style={{ height: `${h}px` }}
              />
            ))}
          </span>
          <span className="text-sm font-semibold text-pine-dark">{card.duration}</span>
        </div>
        <p className="text-sm leading-relaxed text-ink">&ldquo;{card.text}&rdquo;</p>
        <p className="mt-1 text-xs text-muted">{card.caption}</p>
      </div>
    );
  }
  if (card.type === "translate") {
    // Same speaker twice: the original message, then its translation in
    // an outlined bubble (not a pine reply bubble, which would read as
    // the business answering rather than translating)
    return (
      <div className="flex w-[22rem] max-w-[22rem] flex-col gap-2 rounded-xl border border-line bg-surface/95 p-4 shadow-lg">
        <p className="self-start rounded-2xl rounded-bl-sm bg-pine-tint px-3 py-1.5 text-sm text-pine-dark">
          {card.original}
        </p>
        <p className="self-start rounded-2xl rounded-tl-sm border border-line bg-background px-3 py-1.5 text-sm text-ink">
          {card.translated}
        </p>
        <p className="mt-1 text-xs text-muted">{card.caption}</p>
      </div>
    );
  }
  return (
    // pr-5: the icon makes the left padding read bigger than it is, so the
    // right side gets a touch more to visually balance the card
    <div className="w-max max-w-[21rem] rounded-xl border border-line bg-surface/95 p-4 pr-5 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine-tint text-pine">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={heroCardIcons[card.icon]} />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-pine-dark">{card.title}</p>
          <p className="text-sm text-muted">{card.sub}</p>
        </div>
      </div>
    </div>
  );
}

export function HeroCards({
  poolA = defaultPoolA,
  poolB = defaultPoolB,
  third = false,
}: {
  poolA?: HeroCard[];
  poolB?: HeroCard[];
  /** Render the middle slot too (the tall homepage hero only; compact
      inner-page heroes don't have the room) */
  third?: boolean;
}) {
  // Staggered periods and offsets so no two slots ever swap in sync;
  // the middle slot's odd period makes the rhythm drift naturally
  const slotA = useRotation(poolA.length, 8000, 5000);
  const slotB = useRotation(poolB.length, 8000, 9000);
  const slotC = useRotation(third ? defaultPoolC.length : 0, 9500, 12500);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      <div className={`absolute right-[8%] rotate-2 ${third ? "top-[12%]" : "top-[18%]"}`}>
        <div className="hero-card-float-a">
          <div
            key={slotA.index}
            className={slotA.leaving ? "hero-card-exit" : "hero-card-enter"}
          >
            <CardBody card={poolA[slotA.index]} />
          </div>
        </div>
      </div>
      {/* Middle slot: hugs the far right edge so the drifting cluster
          never reaches toward the hero text column */}
      {third && (
        <div className="absolute right-[2%] top-[41%] -rotate-1">
          <div className="hero-card-float-b">
            <div
              key={slotC.index}
              className={slotC.leaving ? "hero-card-exit" : "hero-card-enter"}
            >
              <CardBody card={defaultPoolC[slotC.index]} />
            </div>
          </div>
        </div>
      )}
      {/* Kept clear of the hero's bottom edge: inner pages overlap an
          image into that area (see the service page intro section) */}
      <div
        className={`absolute ${
          third ? "bottom-[14%] right-[18%] rotate-1" : "bottom-[24%] right-[16%] -rotate-1"
        }`}
      >
        <div className={third ? "hero-card-float-a" : "hero-card-float-b"}>
          <div
            key={slotB.index}
            className={slotB.leaving ? "hero-card-exit" : "hero-card-enter"}
          >
            <CardBody card={poolB[slotB.index]} />
          </div>
        </div>
      </div>
    </div>
  );
}
