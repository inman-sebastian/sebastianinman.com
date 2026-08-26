import Link from "next/link";
import { site } from "@/content/site";
import { getServices } from "@/lib/content";
import { SiteImage } from "@/components/SiteImage";
import { HeroSplash } from "@/components/HeroSplash";
import { Reveal } from "@/components/Reveal";
import { ServiceCard } from "@/components/ServiceCard";
import { ButtonLink, ConsultButton } from "@/components/ButtonLink";
import { CTABand } from "@/components/CTABand";

const steps = [
  {
    title: "We talk, for free",
    text: "Tell me what's eating your time or falling through the cracks. Thirty minutes, plain English, no obligation.",
  },
  {
    title: "You get an honest plan",
    text: "I tell you what's worth fixing, what I'd build, what it costs, and what it saves you. If it's not worth doing, I'll say so.",
  },
  {
    title: "I build it, you get your time back",
    text: "Most projects are done in days or weeks, not months. And I stick around to make sure it keeps working.",
  },
];

export default function HomePage() {
  const services = getServices();

  return (
    <>
      <HeroSplash
        eyebrow={site.serviceAreaLine}
        heading="Your business runs better when the busywork runs itself."
        text="I'm Sebastian. I help small businesses save hours every week with practical automation, helpful AI tools, and websites that bring in customers. Everything explained in plain English, priced for a small business budget."
      >
        <ConsultButton />
        <ButtonLink href="/services" variant="secondary">
          See what I do
        </ButtonLink>
      </HeroSplash>

      {/* Who I help */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold text-pine-dark">
            Sound like your week?
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "The busywork never ends",
                text: "You're doing paperwork at 10pm (retyping orders, chasing invoices, sending the same emails) instead of running your business.",
              },
              {
                title: "Customers slip away",
                text: "Calls go unanswered while you work, leads go cold overnight, and your website isn't pulling its weight, if you have one at all.",
              },
              {
                title: "Everyone says “use AI”",
                text: "You suspect there's something to it, but you don't have time to sort real help from hype, and no one explains it in plain English.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 120} className="h-full">
                <div className="h-full rounded-xl border border-line bg-background p-6">
                  <h3 className="text-lg font-semibold text-pine-dark">
                    {item.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed">
            If any of that sounds familiar, you&rsquo;re exactly who I work with:
            growing small businesses that need technology to help, not to become
            one more thing to manage.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold text-pine-dark">How I help</h2>
          <Link
            href="/services"
            className="text-sm font-semibold text-terracotta hover:text-terracotta-dark"
          >
            See all services →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={(i % 3) * 120} className="h-full">
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-pine-tint/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold text-pine-dark">
            How it works
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 150}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pine font-serif text-lg font-semibold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-pine-dark">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* About blurb */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_2fr]">
        <SiteImage
          src="/images/headshot.jpg"
          alt={`Professional headshot of ${site.name}`}
          prompt="Sebastian's professional headshot (real photo; drop in the existing headshot file)"
          width={600}
          height={700}
        />
        <div>
          <h2 className="text-3xl font-semibold text-pine-dark">
            A neighbor who happens to be a developer
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            I live and work in Jackson County, Oregon, and I&rsquo;d rather help
            the businesses in my own community than build software for companies
            I&rsquo;ll never meet. Big companies have IT departments. You get me,
            and I answer my phone.
          </p>
          <ButtonLink href="/about" variant="secondary" className="mt-6">
            More about me
          </ButtonLink>
        </div>
      </section>

      <CTABand />
    </>
  );
}
