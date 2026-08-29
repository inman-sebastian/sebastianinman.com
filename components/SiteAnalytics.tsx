"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/react";

/**
 * Vercel Web Analytics, minus the traffic that isn't a visitor.
 *
 * Two kinds of noise were drowning out the real numbers while the site
 * was being built: Sebastian loading his own pages, and the browser
 * automation used to build and check them. Eight visitors in a week is
 * a useful number only if none of them are us.
 *
 * `beforeSend` runs in the browser and dropping an event here means it
 * is never sent at all, so nothing filtered is stored or billed. This
 * needs a client component of its own: the root layout is a server
 * component, and a function prop cannot cross that boundary.
 */

/** Everything that runs the site without being an audience for it */
function isOurOwnTraffic(): boolean {
  if (typeof window === "undefined") return true;

  // Sebastian's own browser, opted out by hand. The key is Vercel's
  // documented convention:
  //   localStorage.setItem("va-disable", "1")
  try {
    if (window.localStorage.getItem("va-disable")) return true;
  } catch {
    // Private mode or blocked storage. Not a reason to drop a real
    // visitor, so fall through to the checks below.
  }

  // Set by CDP-driven Chrome, which covers agent-browser, Playwright,
  // Puppeteer and Selenium. Verified true from agent-browser.
  if (navigator.webdriver) return true;

  const ua = navigator.userAgent;
  // agent-browser reports HeadlessChrome; Claude's own browser reports a
  // Claude/<version> token and leaves navigator.webdriver false, so the
  // check above does not catch it on its own.
  return /Headless/i.test(ua) || /\bClaude\//.test(ua);
}

export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) =>
        isOurOwnTraffic() ? null : event
      }
    />
  );
}
