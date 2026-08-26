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
    alt: "Wide illustration of a calm river at dusk in deep pine greens, with a soft warm glow on the horizon",
    prompt:
      "Wide 16:9 flat illustration in deep pine greens: a calm, wide river at dusk, its surface filling the lower half of the frame with smooth horizontal ripple lines stepping through deep greens from #234f3e down to #132c1f in the foreground. Above it, a quiet dusk sky in muted deep greens fading upward from #2a5a47 into #18382c, nearly empty of detail. Low on the right side of the horizon, a soft warm terracotta glow of last light melts into the water and draws a gentle shimmering reflection down the right side of the river. The left and upper areas stay smooth and calm. A few smooth dark river stones break the surface in the lower right corner. No people, no animals, no boats, no buildings, no signs, no words or lettering anywhere. Flat vector style, no texture.",
  },

  location: "Southern Oregon",
  serviceAreaLine: "Based in Southern Oregon, working with small businesses everywhere.",
} as const;
