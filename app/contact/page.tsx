import type { Metadata } from "next";
import { site } from "@/content/site";
import { getServices } from "@/lib/content";
import { ContactForm } from "@/components/ContactForm";
import { HeroSplash } from "@/components/HeroSplash";
import { ConsultButton } from "@/components/ButtonLink";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name}. Free consult for small businesses that want help with automation, AI, or a better website. ${site.location}.`,
};

export default function ContactPage() {
  // Slug + title only; the checkbox cards need nothing heavier
  const services = getServices().map(({ slug, title }) => ({ slug, title }));
  return (
    <>
      <HeroSplash
        compact
        cards={false}
        eyebrow="Contact"
        heading="Let's talk about your business"
        text="The first conversation is always free. Tell me what's eating your time or what you wish just worked, and I'll tell you honestly whether I can help."
      />

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-2">
        <div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                Email
              </p>
              <a
                href={`mailto:${site.email}`}
                className="text-lg font-medium text-pine hover:text-pine-dark"
              >
                {site.email}
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                Phone
              </p>
              <a
                href={site.phoneHref}
                className="text-lg font-medium text-pine hover:text-pine-dark"
              >
                {site.phone}
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                Prefer to grab a time?
              </p>
              <ConsultButton variant="secondary" className="mt-2" />
            </div>
          </div>

          <p className="mt-8 max-w-md text-sm leading-relaxed text-muted">
            {site.serviceAreaLine} Local businesses: happy to meet in person.
            Coffee&rsquo;s on me.
          </p>
        </div>

        {/* The form card pulls up over the hero green, matching the
            overlapping-image treatment on the other inner pages. Needs
            `relative` to paint above the hero (a positioned section). */}
        <div className="relative rounded-2xl border border-line bg-surface p-6 ring-[6px] ring-background sm:p-8 md:-mt-28 md:shadow-lg">
          <ContactForm services={services} />
        </div>
      </section>
    </>
  );
}
