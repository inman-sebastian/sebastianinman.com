import Link from "next/link";
import { site } from "@/content/site";
import { getServices } from "@/lib/content";
import { SiteImage } from "@/components/SiteImage";
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
      {/* Hero: full-width splash with the image as background. The image is
          generated 16:9 with a calm left half so the text stays readable;
          the gradient overlay below guarantees it. */}
      <section className="relative overflow-hidden border-b border-line">
        <SiteImage
          fill
          priority
          src="/images/home-hero.jpg"
          alt="Wide illustration of a peaceful Southern Oregon valley at golden hour, with pine-covered hills and soft mountains"
          prompt="Wide 16:9 splash illustration, warm friendly flat style: a peaceful Southern Oregon valley landscape at golden hour. The LEFT HALF is calm open sky and gentle golden fields with almost no detail (text will sit there). Visual interest builds toward the RIGHT: layered pine-covered hills, soft mountain silhouettes, and a winding dirt road drifting into the valley. No people, no animals, no buildings, no signs, no words or lettering anywhere. Serene, uncluttered, generous negative space. Earthy cream sky, deep pine green and terracotta accents, a few soft wildflowers in the foreground corner."
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-background/55 md:bg-gradient-to-r md:from-background/70 md:via-background/20 md:to-transparent"
        />
        <div className="relative mx-auto flex max-w-6xl items-center px-4 py-20 sm:px-6 md:min-h-[560px] md:py-24 lg:min-h-[640px]">
          <div className="max-w-xl">
            <p className="max-w-md text-balance text-sm font-semibold uppercase tracking-wide text-terracotta">
              {site.serviceAreaLine}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-pine-dark sm:text-5xl">
              Your business runs better when the busywork runs itself.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink/80">
              I&rsquo;m Sebastian. I help small businesses save hours every week
              with practical automation, helpful AI tools, and websites that
              bring in customers. Everything explained in plain English, priced
              for a small business budget.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ConsultButton />
              <ButtonLink href="/services" variant="secondary">
                See what I do
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

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
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-line bg-background p-6"
              >
                <h3 className="text-lg font-semibold text-pine-dark">
                  {item.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
              </div>
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
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services#${service.slug}`}
              className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <SiteImage
                src={service.image}
                alt={service.imageAlt}
                prompt={service.imagePrompt}
                width={800}
                height={600}
              />
              <h3 className="mt-4 text-lg font-semibold text-pine-dark group-hover:text-pine">
                {service.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {service.summary}
              </p>
              <p className="mt-4 text-sm font-semibold text-terracotta">
                Starting at ${service.startingPrice.toLocaleString()}
              </p>
            </Link>
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
              <div key={step.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pine font-serif text-lg font-semibold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-pine-dark">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
              </div>
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
