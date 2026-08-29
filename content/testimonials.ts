/**
 * Reviews from real clients, quoted verbatim.
 *
 * These were left on Google for Southern Oregon Web Design, the
 * freelance shop Sebastian ran before this one. That business and its
 * Google profile are permanently closed, so the originals are no longer
 * publicly viewable and the site says where they came from rather than
 * implying they are recent reviews of this business. Screenshots of the
 * originals are kept off-repo.
 *
 * Rules for this file:
 *
 * - Verbatim. Trim for length with an ellipsis if you must, never for
 *   meaning, and never tidy somebody's grammar.
 * - Client reviews only. A fourth 5-star review exists from a developer
 *   Sebastian worked alongside rather than for; it is deliberately not
 *   here, because putting a colleague among client testimonials is the
 *   one genuinely misleading move available.
 * - `about` decides where a quote may appear. Every one of these speaks
 *   to web work and to being good to deal with. None of them says
 *   anything about automation or AI, so none may sit beside that copy.
 */

export type Testimonial = {
  quote: string;
  name: string;
  /** Roughly when it was left, as shown on the review */
  when: string;
  /** Service slugs this quote actually speaks to */
  about: string[];
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "With Sebastian's knowledge and expertise, he was able to offer valuable suggestions for our site and implement them in a timely manner. Professional and great to work with!",
    name: "Marci Lake",
    when: "2024",
    about: ["website-design"],
  },
  {
    quote:
      "Easy to work with, knowledgeable and creative. A solid problem solver with a hard to find mix of technical knowledge and design capabilities.",
    name: "Todd McDonald",
    when: "2023",
    about: ["website-design"],
  },
  {
    quote:
      "Sebastian was very professional, had great communication, and all around fantastic to work with!",
    name: "Darren Cossette",
    when: "2024",
    about: ["website-design"],
  },
];

/**
 * Where they came from, in the register of the other section intros
 * rather than as a disclaimer bolted on.
 *
 * It still carries the two facts that matter: this was freelance work,
 * and it was a couple of years ago. The year on each card does the rest.
 * What it no longer does is lead with the name of a business that no
 * longer exists, which told a reader nothing they needed and read like
 * an apology. Do not quietly drop "freelance work" or the timeframe;
 * those are the parts doing the honest work.
 */
export const testimonialSource =
  "These are from my freelance work a couple of years back, mostly websites. Every one was left by somebody who hired me and saw the job through. Newer ones will turn up here as current projects finish.";

/** The quotes that honestly speak to a given service */
export function testimonialsFor(slug: string): Testimonial[] {
  return testimonials.filter((t) => t.about.includes(slug));
}
