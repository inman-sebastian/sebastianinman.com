import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getBlogPosts, getLandingPages, getServices } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/services", "/about", "/faq", "/blog", "/contact"].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const blogPosts = getBlogPosts().map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "yearly" as const,
    priority: 0.6,
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

  return [...staticPages, ...servicePages, ...landingPages, ...blogPosts];
}
