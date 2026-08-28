"use client";

import { useActionState } from "react";
import { PipelineMap, type MapPin } from "@/components/PipelineMap";
import { locateEveryoneAction, type LocateState } from "@/app/locate/actions";

/**
 * The map, plus the one button that fills in anybody missing from it.
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
  const [state, formAction, pending] = useActionState<LocateState, FormData>(
    () => locateEveryoneAction(),
    {}
  );

  const prospects = pins.filter((p) => p.kind === "prospect").length;
  const clients = pins.length - prospects;

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          On the map
        </p>
        <p className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-terracotta" />
            {prospects} prospect{prospects === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-pine" />
            {clients} client{clients === 1 ? "" : "s"}
          </span>
        </p>
        {unplaced > 0 && (
          <form action={formAction} className="ml-auto">
            <button type="submit" className="btn btn-quiet" disabled={pending}>
              {pending
                ? "Looking them up..."
                : `Place ${unplaced} more on the map`}
            </button>
          </form>
        )}
      </div>

      {state.error && (
        <p className="bg-terracotta-tint px-4 py-2 text-sm text-terracotta-dark">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="bg-pine-tint px-4 py-2 text-sm text-pine-dark">
          {state.message}
        </p>
      )}

      {pins.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted">
          Nobody has a location yet.
          {unplaced > 0
            ? " Use the button above to look them up."
            : " Research some businesses and they will show up here."}
        </p>
      ) : (
        <PipelineMap pins={pins} token={token} />
      )}

      <p className="border-t border-line px-4 py-2 text-xs text-muted">
        Pins are usually the middle of a town, not a street address.
      </p>
    </section>
  );
}
