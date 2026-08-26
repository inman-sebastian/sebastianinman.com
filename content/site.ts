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
    alt: "Wide illustration of a peaceful Southern Oregon valley at golden hour, with pine-covered hills and soft mountains",
    prompt:
      "Wide 16:9 splash illustration, warm friendly flat style: one continuous, peaceful Southern Oregon valley landscape at golden hour with an asymmetrical composition. A big calm cream sky and gently rolling golden fields fill most of the frame, and layered pine-covered hills with soft mountain silhouettes rise gradually along the right side, where a winding dirt road drifts into the distance and a few soft wildflowers sit in the lower corner. A low horizon and generous open sky keep the scene serene and uncluttered. No people, no animals, no buildings, no signs, no words or lettering anywhere. Earthy cream sky, deep pine green and terracotta accents.",
  },

  location: "Southern Oregon",
  serviceAreaLine: "Based in Southern Oregon, working with small businesses everywhere.",
} as const;
