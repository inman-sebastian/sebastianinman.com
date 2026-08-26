"use client";

import { useEffect, useState } from "react";

/**
 * Small UI cards floating over the hero landscape, showing busywork
 * handling itself. Each of the two slots rotates through a pool of
 * examples, popping cards in and out bubble-style on staggered timers
 * so different business owners see something that fits their world.
 * Edit the pools below to change the examples. Desktop only.
 */

type Card =
  | { type: "notice"; icon: keyof typeof icons; title: string; sub: string }
  | { type: "chat"; question: string; answer: string; caption: string };

// Top slot: one-line notifications
const poolA: Card[] = [
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
];

// Lower slot: chats and insights
const poolB: Card[] = [
  {
    type: "chat",
    question: "Are you open Saturday?",
    answer: "Yes! Open 9 to 3. Want me to save you a spot?",
    caption: "Answered automatically at 9:42 PM",
  },
  {
    type: "notice",
    icon: "chart",
    title: "Weekly numbers ready",
    sub: "Saturday sales up 12% over last month",
  },
  {
    type: "chat",
    question: "Do you carry cedar fence boards?",
    answer: "We do! 6-foot boards are in stock right now.",
    caption: "Answered automatically at 6:15 AM",
  },
];

const icons = {
  check: "m4.5 12.75 6 6 9-13.5",
  calendar:
    "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
  star: "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z",
  sync: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",
  chart:
    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
};

const EXIT_MS = 300;

/** Cycles through a pool: waits, pops the card out, swaps, pops the next in */
function useRotation(poolLength: number, periodMs: number, offsetMs: number) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
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

function CardBody({ card }: { card: Card }) {
  if (card.type === "chat") {
    return (
      <div className="flex w-72 flex-col gap-2 rounded-xl border border-line bg-surface/95 p-4 shadow-lg">
        <p className="self-start rounded-2xl rounded-bl-sm bg-pine-tint px-3 py-1.5 text-xs text-pine-dark">
          {card.question}
        </p>
        <p className="self-end rounded-2xl rounded-br-sm bg-pine px-3 py-1.5 text-xs text-white">
          {card.answer}
        </p>
        <p className="mt-1 text-[11px] text-muted">{card.caption}</p>
      </div>
    );
  }
  return (
    <div className="w-64 rounded-xl border border-line bg-surface/95 p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine-tint text-pine">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={icons[card.icon]} />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-pine-dark">{card.title}</p>
          <p className="text-xs text-muted">{card.sub}</p>
        </div>
      </div>
    </div>
  );
}

export function HeroCards() {
  // Staggered so the two slots never swap at the same moment
  const slotA = useRotation(poolA.length, 8000, 5000);
  const slotB = useRotation(poolB.length, 8000, 9000);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      <div className="absolute right-[8%] top-[18%] rotate-2">
        <div className="hero-card-float-a">
          <div
            key={slotA.index}
            className={slotA.leaving ? "hero-card-exit" : "hero-card-enter"}
          >
            <CardBody card={poolA[slotA.index]} />
          </div>
        </div>
      </div>
      <div className="absolute bottom-[16%] right-[16%] -rotate-1">
        <div className="hero-card-float-b">
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
