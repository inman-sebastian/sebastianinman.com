/**
 * Single source of truth for site-wide info.
 * Edit values here; every page pulls from this file.
 */
export const site = {
  name: "Sebastian Inman",
  // The www host is canonical; the apex 308-redirects to it on Vercel
  url: "https://www.sebastianinman.com",

  // Short positioning line used in the header/footer and default SEO
  tagline: "Automation & AI help for small businesses",

  // Default meta description (used when a page doesn't set its own)
  description:
    "I help small businesses save hours every week with practical automation, AI tools, and websites that actually bring in customers. Based in Southern Oregon, working with businesses everywhere.",

  email: "hello@sebastianinman.com",
  phone: "(541) 592-9047",
  phoneHref: "tel:+15415929047",

  // Scheduling link for the "Book a free consult" buttons.
  // Empty string = buttons fall back to the contact page.
  bookingUrl: "https://cal.com/sebastian-inman-y8vyf8/free-discovery-call",

  location: "Southern Oregon",
  serviceAreaLine: "Based in Southern Oregon, working with small businesses everywhere.",
} as const;
