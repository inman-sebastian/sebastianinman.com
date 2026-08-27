import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getLandingPages, getServices } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/services", "/about", "/faq", "/contact"].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const servicePages = getServices().map((service) => ({
    url: `${site.url}/services/${service.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const landingPages = getLandingPages().map((page) => ({
    url: `${site.url}/${page.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...landingPages];
}
