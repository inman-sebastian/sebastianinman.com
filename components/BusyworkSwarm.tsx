"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An organic field of floating "busywork" chips the visitor can pop.
 * Popped chips burst away and, a few seconds later, a fresh one drifts
 * back in from the pool: you can swat busywork all day, it keeps
 * coming. The anchor chip ("…and whatever else…") never pops; it makes
 * the and-then-some point explicit. Used on the homepage and service
 * pages; service chips come from MDX frontmatter (`busywork`).
 */

type Slot = { text: string; phase: "in" | "out" | "hidden"; gen: number };

const chipTints = ["bg-pine-tint/80", "bg-terracotta-tint/80", "bg-surface"];

export function BusyworkSwarm({
  chips,
  anchor = "…and whatever else is eating your week",
}: {
  chips: string[];
  anchor?: string;
}) {
  const visibleCount = Math.min(chips.length, 12);
  const pointer = useRef(visibleCount);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [slots, setSlots] = useState<Slot[]>(() =>
    chips.slice(0, visibleCount).map((text) => ({ text, phase: "in", gen: 0 }))
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const pop = (i: number) => {
    setSlots((s) => {
      if (s[i].phase !== "in") return s;
      const copy = [...s];
      copy[i] = { ...copy[i], phase: "out" };
      return copy;
    });
    timers.current.push(
      setTimeout(() => {
        setSlots((s) => {
          const copy = [...s];
          copy[i] = { ...copy[i], phase: "hidden" };
          return copy;
        });
        timers.current.push(
          setTimeout(() => {
            setSlots((s) => {
              const shown = new Set(
                s.filter((_, j) => j !== i).map((x) => x.text)
              );
              let guard = 0;
              let next = chips[pointer.current % chips.length];
              while (shown.has(next) && guard < chips.length) {
                pointer.current += 1;
                next = chips[pointer.current % chips.length];
                guard += 1;
              }
              pointer.current += 1;
              const copy = [...s];
              copy[i] = { text: next, phase: "in", gen: copy[i].gen + 1 };
              return copy;
            });
          }, 900 + Math.random() * 800)
        );
      }, 300)
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {slots.map((slot, i) => (
        <span
          key={i}
          className="swarm-float inline-block"
          style={
            {
              "--f-dur": `${6 + (i % 5)}s`,
              "--f-del": `${(i % 7) * 0.6}s`,
            } as React.CSSProperties
          }
        >
          <button
            key={`${i}:${slot.gen}`}
            type="button"
            onClick={() => pop(i)}
            aria-label={`${slot.text}. Pop it (it'll be back).`}
            style={{
              rotate: `${((i * 37) % 7) - 3}deg`,
              visibility: slot.phase === "hidden" ? "hidden" : undefined,
            }}
            className={`cursor-pointer rounded-full border border-line px-4 py-2 text-sm text-pine-dark shadow-sm transition-[scale] duration-200 hover:scale-105 motion-reduce:hover:scale-100 ${
              chipTints[i % chipTints.length]
            } ${slot.phase === "out" ? "hero-card-exit" : "hero-card-enter"}`}
          >
            {slot.text}
          </button>
        </span>
      ))}
      <span className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white">
        {anchor}
      </span>
    </div>
  );
}
