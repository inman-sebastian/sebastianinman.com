import { Reveal } from "@/components/Reveal";
import {
  testimonialSource,
  type Testimonial,
} from "@/content/testimonials";

/**
 * Client reviews, with where they came from said in the intro.
 *
 * That intro is not decoration. These are two and three years old and
 * were left for a business that no longer trades, so it names the work
 * as freelance and dates it, and every card carries its year. Shrink
 * either and the section starts implying something it should not.
 */
export function Testimonials({
  items,
  heading = "What people have said about working with me",
  intro,
}: {
  items: Testimonial[];
  heading?: string;
  intro?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-semibold text-pine-dark">{heading}</h2>
          <p className="mt-2 max-w-2xl text-lg leading-relaxed text-muted">
            {intro ?? testimonialSource}
          </p>
        </Reveal>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.name} delay={i * 120} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-background p-6">
                {/* Five stars, because that is what each of these was.
                    Decorative: the rating is stated in the caption for
                    anyone not seeing the shapes. */}
                <div aria-hidden className="text-sm tracking-wide text-terracotta">
                  ★★★★★
                </div>
                <blockquote className="mt-3 flex-1 leading-relaxed text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 border-t border-line pt-4">
                  <span className="block font-serif text-lg font-semibold text-pine-dark">
                    {t.name}
                  </span>
                  <span className="block text-xs text-muted">
                    Five stars, {t.when}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
