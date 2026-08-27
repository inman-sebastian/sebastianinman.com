import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { getLandingPages, getServices } from "@/lib/content";
import { SiteImage } from "@/components/SiteImage";
import { HeroSplash } from "@/components/HeroSplash";
import { Reveal } from "@/components/Reveal";
import { ServiceCard } from "@/components/ServiceCard";
import { BusyworkCards } from "@/components/BusyworkCards";
import { ButtonLink, ConsultButton } from "@/components/ButtonLink";
import { CTABand } from "@/components/CTABand";

const steps = [
  {
    title: "We talk, for free",
    text: "Tell me what's eating your time or falling through the cracks. Thirty minutes, no jargon, no obligation.",
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
  // City-level location pages for the areas strip (campaign pages excluded)
  const areas = getLandingPages().filter((p) => p.kind === "location");

  return (
    <>
      <HeroSplash
        edge="surface"
        eyebrow={site.serviceAreaLine}
        heading="Your business runs better when the busywork runs itself."
        text="I'm Sebastian. I help small businesses like yours get hours back every week with practical automation, helpful AI tools, and websites that bring in customers. No jargon, no hype, and priced for a small business budget."
      >
        <ConsultButton />
        <ButtonLink href="/services" variant="light">
          See what I do
        </ButtonLink>
      </HeroSplash>

      {/* Who I help. No top border: the hero's sawtooth edge sits directly
          on this section, and a border draws a hairline under the teeth. */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-semibold text-pine-dark">
              You didn&rsquo;t start a business to chase paperwork.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              Most of the owners I talk to aren&rsquo;t looking for &ldquo;digital
              transformation.&rdquo; They just want the paperwork to stop eating
              their evenings, the phone to stop going to voicemail, and a website
              they aren&rsquo;t embarrassed by. That&rsquo;s where we start:
              finding the hours your business is losing to busywork, and quietly
              taking them back.
            </p>
          </Reveal>
          <div className="mt-10 max-w-4xl">
            <BusyworkCards
              items={[
                "Chasing late invoices",
                "Retyping customer info",
                "Missed calls",
                "After-hours questions",
                "No-show appointments",
                "Inbox overload",
                "Copy-paste bookkeeping",
                "Overdue follow-ups",
                "Review replies",
                "Month-end reports",
                "Website updates",
                "Double bookings",
                "Reminder texts",
                "Quote follow-ups",
              ]}
            />
          </div>
          <Reveal delay={900}>
            <p className="mt-6 text-sm text-muted">
              If a few of these look familiar, we should talk.
            </p>
          </Reveal>
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
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          Five services, one goal: give you your time back. Every project
          starts with a free consult and a flat quote, so you know exactly
          what you&rsquo;re getting and what it costs before anything begins.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={(i % 2) * 120} className="h-full">
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works: three steps on a connected timeline */}
      <section className="border-y border-line bg-pine-tint/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-semibold text-pine-dark">
              How it works
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-muted">
              Three steps. No jargon, no surprise invoices.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 180} className="h-full">
                <div className="flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pine font-serif text-lg font-semibold text-white">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-pine-dark">
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
                </div>
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
          sizes="(min-width: 768px) 33vw, 100vw"
        />
        <div>
          <h2 className="text-3xl font-semibold text-pine-dark">
            You know your business. I know the tools.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            I&rsquo;m Sebastian, a developer based in Southern Oregon. You
            bring what you know about your customers, your busy seasons, and
            how the work really gets done. I bring the tools that take the
            repetitive parts off your plate. Every good project I&rsquo;ve
            built started that way: as a conversation between those two
            things.
          </p>
          <ButtonLink href="/about" variant="secondary" className="mt-6">
            More about me
          </ButtonLink>
        </div>
      </section>

      {/* Areas strip: local-trust moment + links to the location pages,
          each chip carrying its town's illustration as a thumbnail (the
          tool-chip-with-favicon language, with our own art) */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Reveal>
            <h2 className="text-center font-serif text-lg font-semibold text-pine-dark">
              Working with small businesses all over Southern Oregon
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <ul className="mt-6 flex flex-wrap justify-center gap-3">
              {areas.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/${area.slug}`}
                    className="flex items-center gap-2.5 rounded-lg border border-line bg-background py-1.5 pl-1.5 pr-4 text-sm font-medium text-pine-dark transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0"
                  >
                    <Image
                      src={area.image}
                      alt=""
                      width={80}
                      height={60}
                      className="h-9 w-12 rounded-md object-cover"
                    />
                    {area.city}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
