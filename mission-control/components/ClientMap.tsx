"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * Where one business is, on its own record.
 *
 * Separate from PipelineMap rather than a one-pin call to it, because
 * that map is built for a crowd: coloured by stage, framed to bounds,
 * and every pin carries a popup whose only content is a link to the
 * record. On the record itself that link goes to the page you are
 * already reading.
 *
 * The thing this has to get right is not pretending to know more than
 * the research does, and what it knows is less than it looks.
 *
 * lib/geo.ts works out whether a result was a real address or just the
 * middle of a town (its `precise` flag), and then throws that away:
 * only lat and lng reach the record. So a street address in the
 * frontmatter does NOT guarantee the pin is on it, because the geocoder
 * falls back to the town when an address will not resolve, and a unit
 * number is enough to make that happen.
 *
 * Hence one conservative zoom rather than a confident one. It shows the
 * block without planting a flag on a doorstep this app cannot vouch
 * for, and the caption says the address is what was recorded rather
 * than where the pin is. Persisting `precise` onto the record would
 * earn a tighter zoom; until then, guessing it from the address is the
 * kind of quiet lie the research rules exist to stop.
 */
export function ClientMap({
  lat,
  lng,
  label,
  city,
  address,
  token,
}: {
  lat: number;
  lng: number;
  label: string;
  city: string;
  /** The street address as recorded, which is not the same as saying
      the coordinates resolved to it. See the note above. */
  address?: string;
  token: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!container.current || map.current || !token) return;
    mapboxgl.accessToken = token;

    const instance = new mapboxgl.Map({
      container: container.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom: address ? 13.5 : 11,
      attributionControl: true,
    });
    instance.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    // Same dot as the pipeline map, in terracotta: there is only one
    // business here, so stage colour would be saying nothing.
    const dot = document.createElement("div");
    dot.title = `${label} · ${city}`;
    dot.style.cssText =
      "width:15px;height:15px;border-radius:50%;border:2.5px solid #fffdf8;box-shadow:0 1px 4px rgba(0,0,0,.35);background:#c05f33";

    new mapboxgl.Marker({ element: dot }).setLngLat([lng, lat]).addTo(instance);
    map.current = instance;

    return () => {
      instance.remove();
      map.current = null;
    };
  }, [lat, lng, label, city, address, token]);

  if (!token) {
    return (
      <p className="text-xs text-muted">
        No <code>MAPBOX_API_KEY</code> in the repo root&apos;s{" "}
        <code>.env.local</code>, so there is no map.
      </p>
    );
  }

  return (
    <>
      <div ref={container} className="h-56 w-full rounded-xl" />
      <p className="mt-2 text-xs text-muted">
        {address
          ? `${address}, ${city}. The pin is close but may be the middle of town; the record stores where they are, not how sure it was.`
          : `Somewhere in ${city}. No street address was ever found, so the pin is the middle of town.`}
      </p>
    </>
  );
}
