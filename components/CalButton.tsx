"use client";

import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";
import { site } from "@/content/site";
import { buttonClassName, type ButtonVariant } from "@/components/ButtonLink";

/**
 * A booking button that opens the Cal.com calendar in a modal overlay
 * instead of navigating away. Renders a real link to the booking page,
 * so middle-click, long-press, and blocked-script visitors still get
 * there; the embed script intercepts plain clicks and shows the modal.
 */

/** "https://cal.com/user/event" -> "user/event" (what the embed expects) */
const CAL_LINK = site.bookingUrl.replace(/^https?:\/\/cal\.com\//, "");
const NAMESPACE = "booking";

export function CalButton({
  variant = "primary",
  className = "",
  children,
}: {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: NAMESPACE });
      cal("ui", {
        theme: "light",
        cssVarsPerTheme: { light: { "cal-brand": "#234f3e" } },
        hideEventTypeDetails: false,
      });
    })();
  }, []);

  return (
    <a
      href={site.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-cal-link={CAL_LINK}
      data-cal-namespace={NAMESPACE}
      data-cal-config='{"theme":"light"}'
      className={buttonClassName(variant, className)}
    >
      {children}
    </a>
  );
}
