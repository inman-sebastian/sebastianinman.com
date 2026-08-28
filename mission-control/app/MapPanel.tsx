"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PipelineMap, type MapPin } from "@/components/PipelineMap";
import { locateEveryoneAction } from "@/app/locate/actions";
import { STAGES, phaseOf, type Stage } from "@/lib/stages";

/**
 * The map and the one row of chips over it.
 *
 * The chips are the filter and the key at once: each carries the colour
 * its pins are drawn in, so the row explains the map by being the thing
 * you use on it. Clicking one narrows the map to that stage, clicking it
 * again goes back to everyone. Filtering happens here rather than on the
 * server because every pin is already in the browser, and a map that
 * redraws over the network is a map nobody touches.
 */
export function MapPanel({
  pins,
  token,
  unplaced,
}: {
  pins: MapPin[];
  token: string;
  /** How many records have a town but no coordinates yet */
  unplaced: number;
}) {
  const router = useRouter();
  const [locating, startLocating] = useTransition();
  const [problem, setProblem] = useState("");
  const askedFor = useRef(false);

  // Anybody with a town but no pin gets looked up without being asked
  // for. Once per load: the ref stops the refresh below from bouncing
  // straight back in here, and the action itself remembers who it could
  // not place, so a business Mapbox has never heard of does not get
  // looked up again on every visit.
  useEffect(() => {
    if (unplaced === 0 || askedFor.current) return;
    askedFor.current = true;
    startLocating(async () => {
      const result = await locateEveryoneAction();
      if (result.error) setProblem(result.error);
      else router.refresh();
    });
  }, [unplaced, router]);

  const [only, setOnly] = useState<Stage | null>(null);

  const chips = useMemo(() => {
    const tally = new Map<Stage, number>();
    for (const pin of pins) tally.set(pin.stage, (tally.get(pin.stage) ?? 0) + 1);
    // Pipeline order, and only stages somebody is actually at: an empty
    // chip is a question nobody asked
    return STAGES.filter((s) => tally.has(s.id)).map((s) => ({
      id: s.id as Stage,
      label: s.label,
      count: tally.get(s.id) as number,
      colour: phaseOf(s.id).colour,
    }));
  }, [pins]);

  // A chip can only ever be chosen when it has pins, so this is never
  // empty on purpose
  const visible = useMemo(
    () => (only ? pins.filter((p) => p.stage === only) : pins),
    [pins, only]
  );

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          On the map
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <Chip
            label="Everyone"
            count={pins.length}
            colour="#2b2620"
            active={only === null}
            onClick={() => setOnly(null)}
          />
          {chips.map((chip) => (
            <Chip
              key={chip.id}
              label={chip.label}
              count={chip.count}
              colour={chip.colour}
              dot
              active={only === chip.id}
              onClick={() => setOnly(only === chip.id ? null : chip.id)}
            />
          ))}
        </div>

        {locating && (
          <p className="ml-auto text-xs text-muted">
            Looking up {unplaced} more...
          </p>
        )}
      </div>

      {problem && (
        <p className="bg-terracotta-tint px-4 py-2 text-sm text-terracotta-dark">
          {problem}
        </p>
      )}

      {pins.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted">
          {unplaced > 0
            ? "Nobody is placed yet. Looking them up now."
            : "Nobody has a town on file yet. Research some businesses and they will show up here."}
        </p>
      ) : (
        <PipelineMap pins={visible} token={token} />
      )}

      <p className="border-t border-line px-4 py-2 text-xs text-muted">
        {only && (
          <span className="font-semibold text-ink">
            Showing {visible.length} of {pins.length}.{" "}
          </span>
        )}
        Pins are usually the middle of a town, not a street address.
      </p>
    </section>
  );
}

/** A filter and a key entry in one control */
function Chip({
  label,
  count,
  colour,
  dot,
  active,
  onClick,
}: {
  label: string;
  count: number;
  colour: string;
  dot?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
        active ? "text-white" : "border-line bg-surface text-ink"
      }`}
      style={active ? { background: colour, borderColor: colour } : undefined}
    >
      {dot && (
        <span
          className="inline-block size-2 rounded-full"
          style={{ background: active ? "#fffdf8" : colour }}
        />
      )}
      {label}
      <span className={active ? "font-normal opacity-80" : "font-normal text-muted"}>
        {count}
      </span>
    </button>
  );
}
