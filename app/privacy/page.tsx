import type { Metadata } from "next";
import { site } from "@/content/site";
import { getPage } from "@/lib/content";
import { LegalPage } from "@/components/LegalPage";

export function generateMetadata(): Metadata {
  const page = getPage("privacy");
  return {
    title: "Privacy Policy",
    description:
      (page?.frontmatter.metaDescription as string) ?? site.description,
  };
}

export default function PrivacyPage() {
  return <LegalPage name="privacy" eyebrow="Privacy" />;
}
