/**
 * Single source of truth for site-wide info.
 * Edit values here; every page pulls from this file.
 */
export const site = {
  name: "Sebastian Inman",
  url: "https://sebastianinman.com",

  // Short positioning line used in the header/footer and default SEO
  tagline: "Automation & AI help for small businesses",

  // Default meta description (used when a page doesn't set its own)
  description:
    "I help small businesses save hours every week with practical automation, AI tools, and websites that actually bring in customers. Based in Southern Oregon, working with businesses everywhere.",

  email: "hello@sebastianinman.com", // TODO: inbox not set up yet; see CLAUDE.md deferred tasks
  phone: "(541) 592-9047",
  phoneHref: "tel:+15415929047",

  // Scheduling link for the "Book a free consult" buttons.
  // Empty string = buttons fall back to the contact page.
  bookingUrl: "",

  // Shared 16:9 splash used behind the hero on the homepage and every
  // service page. The prompt must stay identical to the one in IMAGES.md.
  heroImage: {
    src: "/images/home-hero.jpg",
    alt: "Wide illustration of layered pine forest ridges in deep greens under a calm dusk sky",
    prompt:
      "Wide 16:9 flat illustration in deep pine greens: layered ridgelines of silhouetted pine forest rising from the bottom of the frame, each ridge a step darker toward the foreground, from #234f3e in the far ridges down to #132c1f in the nearest trees, with soft mist drifting between the layers. Above the ridges, a calm dusk sky in muted deep greens fading from #2a5a47 near the horizon upward into #18382c fills most of the frame with almost no detail. The composition is asymmetrical: the tallest trees and richest ridge detail gather along the right side, while the left and upper areas stay smooth and calm. A few tiny warm firefly glints in soft terracotta float near the right treeline. No people, no animals, no buildings, no signs, no words or lettering anywhere. Flat vector style, no texture.",
  },

  location: "Southern Oregon",
  serviceAreaLine: "Based in Southern Oregon, working with small businesses everywhere.",
} as const;
