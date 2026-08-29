import type { Metadata } from "next";
import { site } from "@/content/site";
import { getPage } from "@/lib/content";
import { LegalPage } from "@/components/LegalPage";

export function generateMetadata(): Metadata {
  const page = getPage("terms");
  return {
    title: "Terms of Service",
    description:
      (page?.frontmatter.metaDescription as string) ?? site.description,
  };
}

export default function TermsPage() {
  return <LegalPage name="terms" eyebrow="Terms" />;
}
