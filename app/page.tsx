import Link from "next/link";
import { site } from "@/content/site";
import { getServices } from "@/lib/content";
import { SiteImage } from "@/components/SiteImage";
import { HeroSplash } from "@/components/HeroSplash";
import { Reveal } from "@/components/Reveal";
import { ServiceCard } from "@/components/ServiceCard";
import { BusyworkSwarm } from "@/components/BusyworkSwarm";
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
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-semibold text-pine-dark">
              Running a business shouldn&rsquo;t mean drowning in it.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              Most of the owners I talk to aren&rsquo;t looking for &ldquo;digital
              transformation.&rdquo; They just want the paperwork to stop eating
              their evenings, the phone to stop going to voicemail, and a website
              they aren&rsquo;t embarrassed by. That&rsquo;s the work I do: find
              the hours your business is losing to busywork, and quietly hand
              them back.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-10 max-w-4xl">
              <BusyworkSwarm
                chips={[
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
            <p className="mt-6 text-sm text-muted">
              Go ahead, pop a few. They&rsquo;ll be back. Making them disappear
              for good is my job.
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
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={(i % 3) * 120} className="h-full">
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
          <div className="relative mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            <div
              aria-hidden="true"
              className="absolute left-14 right-14 top-5 hidden border-t-2 border-dashed border-pine/25 md:block"
            />
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 180} className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pine font-serif text-lg font-semibold text-white ring-8 ring-[#f1f3ec]">
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
