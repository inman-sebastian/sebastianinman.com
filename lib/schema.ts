import { site } from "@/content/site";
import type { Service, LandingPage, BlogPost } from "@/lib/content";

/**
 * JSON-LD for the whole site, built in one place so every page agrees
 * about who Sebastian is.
 *
 * Three decisions worth knowing before adding to this file:
 *
 * 1. NO Review or AggregateRating markup, ever, for the testimonials on
 *    this site. Google stopped showing review rich results in 2019 when
 *    the entity being reviewed controls the reviews, which is exactly
 *    the case for quotes we publish about ourselves. It earns no stars,
 *    and marking it up anyway just states a rating no search engine will
 *    use. Real reviews on a Google Business Profile are the path to
 *    stars, and those live on Google, not here.
 *    https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful
 *
 * 2. The business is a ProfessionalService with NO street address.
 *    LocalBusiness formally requires a PostalAddress, but Sebastian
 *    works from home and CLAUDE.md forbids publishing that address. So
 *    the address carries region and country only, which is true and
 *    leaks nothing, and `areaServed` does the real work of saying where
 *    he operates. The cost is that Google will not grant local rich
 *    results without a full address; the alternative is publishing his
 *    home address, which is not a trade worth making.
 *
 * 3. Every id is a stable fragment URL (#business, #person, #website) so
 *    the graph on one page can reference the same entity as another
 *    instead of describing a new one each time.
 */

const ID = {
  business: `${site.url}/#business`,
  person: `${site.url}/#person`,
  website: `${site.url}/#website`,
};

/** Towns and counties named on the site as places he works */
const AREAS = [
  "Medford",
  "Ashland",
  "Grants Pass",
  "Central Point",
  "Jacksonville",
  "Phoenix",
  "Talent",
  "Jackson County",
  "Josephine County",
];

/** Sebastian himself, referenced by the business and by every article */
export function person() {
  return {
    "@type": "Person",
    "@id": ID.person,
    name: site.name,
    url: `${site.url}/about`,
    jobTitle: "Automation and AI consultant",
    email: site.email,
    telephone: site.phone,
    knowsAbout: [
      "Business process automation",
      "Small business websites",
      "AI assistants for customer service",
      "Software integration",
    ],
  };
}

/**
 * The business. A ProfessionalService is a LocalBusiness subtype, which
 * is what he is; the missing street address is a deliberate privacy
 * choice, not an oversight (see the header).
 */
export function business() {
  return {
    "@type": "ProfessionalService",
    "@id": ID.business,
    name: site.name,
    url: site.url,
    description: site.description,
    email: site.email,
    telephone: site.phone,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressRegion: "OR",
      addressCountry: "US",
    },
    areaServed: AREAS.map((name) => ({ "@type": "AdministrativeArea", name })),
    founder: { "@id": ID.person },
    // A one-person business: the founder is the whole staff
    employee: { "@id": ID.person },
    knowsLanguage: "en-US",
  };
}

export function website() {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    url: site.url,
    name: site.name,
    description: site.description,
    publisher: { "@id": ID.business },
    inLanguage: "en-US",
  };
}

/**
 * The site-wide graph, rendered once in the root layout.
 *
 * A @graph rather than three separate script tags: it lets the entities
 * reference each other by id, and every page then points at these
 * instead of restating them.
 */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [business(), person(), website()],
  };
}

/** What each service is, and what it starts at */
export function serviceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    serviceType: service.title,
    provider: { "@id": ID.business },
    areaServed: AREAS.map((name) => ({ "@type": "AdministrativeArea", name })),
    url: `${site.url}/services/${service.slug}`,
    ...(service.startingPrice
      ? {
          offers: {
            "@type": "Offer",
            price: service.startingPrice,
            priceCurrency: "USD",
            // The listed price is a floor, and the site says so
            // everywhere; this is the machine-readable version of that.
            priceSpecification: {
              "@type": "PriceSpecification",
              price: service.startingPrice,
              priceCurrency: "USD",
              valueAddedTaxIncluded: false,
              minPrice: service.startingPrice,
            },
            availability: "https://schema.org/InStock",
            url: `${site.url}/services/${service.slug}`,
          },
        }
      : {}),
  };
}

/** All five services as one catalogue, for the services index */
export function serviceCatalog(services: Service[]) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Services",
    url: `${site.url}/services`,
    provider: { "@id": ID.business },
    itemListElement: services.map((s, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        name: s.title,
        description: s.summary,
        url: `${site.url}/services/${s.slug}`,
      },
      ...(s.startingPrice
        ? { price: s.startingPrice, priceCurrency: "USD" }
        : {}),
    })),
  };
}

/**
 * A location page describes the same business serving one town, so it
 * says exactly that rather than inventing a second business per city.
 */
export function landingSchema(page: LandingPage) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.metaTitle,
    description: page.metaDescription,
    url: `${site.url}/${page.slug}`,
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.business },
    ...(page.city
      ? {
          mainEntity: {
            "@type": "Service",
            provider: { "@id": ID.business },
            areaServed: { "@type": "AdministrativeArea", name: page.city },
            name: page.title,
          },
        }
      : {}),
  };
}

export function blogPostSchema(post: BlogPost) {
  const url = `${site.url}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    // Nothing tracks edits per post, so claiming a modified date would
    // be inventing one. Publication date only.
    author: { "@id": ID.person },
    publisher: { "@id": ID.business },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: "en-US",
    ...(post.image ? { image: `${site.url}${post.image}` } : {}),
  };
}

/** The blog as a whole, for its index page */
export function blogSchema(posts: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${site.name} on automation for small businesses`,
    url: `${site.url}/blog`,
    publisher: { "@id": ID.business },
    inLanguage: "en-US",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `${site.url}/blog/${post.slug}`,
      author: { "@id": ID.person },
    })),
  };
}

/** Trail for anything below the top level */
export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: `${site.url}${step.path}`,
    })),
  };
}

/** One place that knows how to put JSON-LD on a page */
export function jsonLdProps(data: unknown) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  } as const;
}
