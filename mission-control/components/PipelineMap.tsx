"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * Everyone with a location, on one map.
 *
 * Pins are usually the middle of a town rather than a doorstep, because
 * that is all the research honestly knows. Records sharing a town get a
 * small deterministic offset so six businesses in Medford read as six
 * pins instead of one.
 */

export type MapPin = {
  slug: string;
  label: string;
  city: string;
  lat: number;
  lng: number;
  kind: "prospect" | "client";
  href: string;
  detail: string;
};

const COLOUR = { prospect: "#c05f33", client: "#234f3e" };

export function PipelineMap({
  pins,
  token,
}: {
  pins: MapPin[];
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
      // The Rogue Valley, until the pins say otherwise
      center: [-122.87, 42.33],
      zoom: 8.4,
      attributionControl: true,
    });
    instance.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.current = instance;

    return () => {
      instance.remove();
      map.current = null;
    };
  }, [token]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || pins.length === 0) return;

    const markers = pins.map((pin) => {
      // A plain dot, not a link: the pin opens the popup and the popup
      // holds the link. Making the pin itself an anchor meant one click
      // both navigated and opened a bubble, which is neither.
      const dot = document.createElement("div");
      dot.title = `${pin.label} · ${pin.city}`;
      dot.style.cssText = `width:15px;height:15px;border-radius:50%;border:2.5px solid #fffdf8;box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:pointer;background:${COLOUR[pin.kind]}`;

      return new mapboxgl.Marker({ element: dot })
        .setLngLat([pin.lng, pin.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 14, closeButton: false }).setHTML(
            `<div style="font-family:inherit;font-size:13px;line-height:1.5">
               <strong>${escapeHtml(pin.label)}</strong><br>
               <span style="color:#6b6257">${escapeHtml(pin.detail)}</span><br>
               <a href="${escapeHtml(pin.href)}" style="color:#234f3e;font-weight:600">Open the record</a>
             </div>`
          )
        )
        .addTo(instance);
    });

    // Frame everything, unless there is only one, which would zoom to
    // street level on a pin that only claims to know the town
    if (pins.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      for (const pin of pins) bounds.extend([pin.lng, pin.lat]);
      instance.fitBounds(bounds, { padding: 60, maxZoom: 11, duration: 0 });
    } else {
      instance.setCenter([pins[0].lng, pins[0].lat]);
      instance.setZoom(10);
    }

    return () => {
      for (const marker of markers) marker.remove();
    };
  }, [pins]);

  if (!token) {
    return (
      <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
        No <code>MAPBOX_API_KEY</code> in the repo root&apos;s{" "}
        <code>.env.local</code>, so there is no map.
      </p>
    );
  }

  return <div ref={container} className="h-80 w-full rounded-xl" />;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
