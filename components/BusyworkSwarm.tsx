"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * An organic field of floating "busywork" chips the visitor can pop.
 * Popped chips burst away, the field elastically closes the gap, and a
 * fresh chip from the pool springs in moments later: you can swat
 * busywork all day, it keeps coming. The anchor chip never pops.
 *
 * Elasticity: every layout change (a chip leaving or arriving) is
 * FLIP-animated, so neighboring chips slide to their new positions on a
 * springy curve instead of snapping. Service chips come from MDX
 * frontmatter (`busywork`).
 */

type Slot = { text: string; phase: "in" | "out" | "hidden"; gen: number };

const chipTints = ["bg-pine-tint/80", "bg-terracotta-tint/80", "bg-surface"];
const dotColors = ["bg-terracotta", "bg-pine", "bg-terracotta/70", "bg-pine/70"];

/** Scattering dots + expanding ring shown while a chip pops */
function Burst({ seed }: { seed: number }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className="burst-ring absolute left-1/2 top-1/2 h-10 w-10 rounded-full border-2 border-terracotta/60" />
      {Array.from({ length: 8 }, (_, k) => {
        const angle =
          (k / 8) * Math.PI * 2 + ((seed * 53 + k * 19) % 10) * 0.06;
        const dist = 26 + ((seed * 31 + k * 7) % 14);
        return (
          <span
            key={k}
            className={`burst-dot absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full ${
              dotColors[k % dotColors.length]
            }`}
            style={
              {
                "--dx": `${Math.cos(angle) * dist}px`,
                "--dy": `${Math.sin(angle) * dist}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </span>
  );
}

/** Synthesized cartoon-bubble pop: a quick sine "bloop" that chirps
 *  upward and dies fast, pitch-randomized per pop. Created lazily
 *  inside the click gesture. */
let audioCtx: AudioContext | null = null;
function playPop() {
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    // Small delay so the sound lands on the rupture, not the inflate
    const t = ctx.currentTime + 0.09;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const f0 = 340 + Math.random() * 220;
    osc.type = "sine";
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f0 * 3.2, t + 0.07);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.007);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.11);
  } catch {
    // no audio support; popping stays silent
  }
}

// useLayoutEffect warns during SSR; fall back harmlessly on the server
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

  // FLIP: slide every chip from its previous position to its new one
  // whenever the field's layout changes. Positions are offsets within
  // the (relative) container, so scrolling can't contaminate them.
  const flipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const prevPos = useRef<Map<number, { x: number; y: number }>>(new Map());

  useIsoLayoutEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    flipRefs.current.forEach((el, i) => {
      if (!el) return;
      const x = el.offsetLeft;
      const y = el.offsetTop;
      const prev = prevPos.current.get(i);
      if (prev && !reduced) {
        const dx = prev.x - x;
        const dy = prev.y - y;
        if (dx !== 0 || dy !== 0) {
          el.animate(
            [
              { transform: `translate(${dx}px, ${dy}px)` },
              { transform: "translate(0, 0)" },
            ],
            { duration: 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
          );
        }
      }
      prevPos.current.set(i, { x, y });
    });
  });

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const pop = (i: number) => {
    if (slots[i].phase !== "in") return;
    playPop();
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
      }, 520)
    );
  };

  return (
    <div className="relative flex flex-wrap items-center gap-3">
      {slots.map((slot, i) => (
        // Popped chips keep their space (visibility, not display) so the
        // field stays still; only the respawn nudges neighbors if the
        // replacement is a different size.
        <span
          key={i}
          ref={(el) => {
            flipRefs.current[i] = el;
          }}
          className="inline-block"
          style={{
            visibility: slot.phase === "hidden" ? "hidden" : undefined,
          }}
        >
          <span
            className="swarm-float relative inline-block"
            style={
              {
                "--f-dur": `${6 + (i % 5)}s`,
                "--f-del": `${(i % 7) * 0.6}s`,
              } as React.CSSProperties
            }
          >
            {slot.phase === "out" && <Burst seed={i * 13 + slot.gen * 7} />}
            <button
              key={`${i}:${slot.gen}`}
              type="button"
              onClick={() => pop(i)}
              aria-label={`${slot.text}. Pop it (it'll be back).`}
              style={{ rotate: `${((i * 37) % 7) - 3}deg` }}
              className={`cursor-pointer rounded-full border border-line px-4 py-2 text-sm text-pine-dark shadow-sm transition-[scale] duration-200 hover:scale-105 motion-reduce:hover:scale-100 ${
                chipTints[i % chipTints.length]
              } ${slot.phase === "out" ? "chip-pop" : "hero-card-enter"}`}
            >
              {slot.text}
            </button>
          </span>
        </span>
      ))}
      <span
        ref={(el) => {
          flipRefs.current[visibleCount] = el;
        }}
        className="inline-block"
      >
        <span className="inline-block rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white">
          {anchor}
        </span>
      </span>
    </div>
  );
}
