import type { Metadata } from "next";
import { site } from "@/content/site";
import { ContactForm } from "@/components/ContactForm";
import { ConsultButton } from "@/components/ButtonLink";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name}. Free consult for small businesses that want help with automation, AI, or a better website. ${site.location}.`,
};

export default function ContactPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
      <div>
        <h1 className="text-4xl font-semibold text-pine-dark sm:text-5xl">
          Let&rsquo;s talk about your business
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
          The first conversation is always free. Tell me what&rsquo;s eating your
          time or what you wish just worked, and I&rsquo;ll tell you honestly
          whether I can help.
        </p>

        <div className="mt-8 flex flex-col gap-4">
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

      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <ContactForm />
      </div>
    </section>
  );
}
