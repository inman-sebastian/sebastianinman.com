import Link from "next/link";
import { notFound } from "next/navigation";
import { displayName, getClient } from "@/lib/clients";
import { documentsForClient } from "@/lib/documents";
import { fillEmail, getEmailTemplate, listEmailTemplates } from "@/lib/emails";
import { mailFrom, mailReady } from "@/lib/env";
import { attachmentsFor } from "@/lib/send";
import { stageInfo } from "@/lib/stages";
import { EmailComposer } from "./EmailComposer";

export const dynamic = "force-dynamic";

export default async function EmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { slug } = await params;
  const { template: requested } = await searchParams;
  const client = getClient(slug);
  if (!client) notFound();

  const templates = listEmailTemplates();
  // Default to whatever this stage calls for, then whatever is first
  const stageTemplate = stageInfo(client.stage).emailId;
  const activeId =
    Number(requested) || stageTemplate || templates[0]?.id || 0;
  const active = getEmailTemplate(activeId);
  const filled = active
    ? fillEmail(active, client)
    : { subject: "", body: "" };

  // Only documents with a PDF already built can be attached
  const documents = documentsForClient(slug);
  const built = attachmentsFor(documents.map((d) => d.slug));
  const attachments = built.map((a) => ({
    ...a,
    title: documents.find((d) => d.slug === a.slug)?.title ?? a.slug,
  }));

  const ready = mailReady();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/clients/${slug}`}
          className="text-sm text-muted hover:underline"
        >
          &larr; {displayName(client)}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-pine-dark">
          Write to {client.name || displayName(client)}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Sending as {ready ? mailFrom() : "nobody yet"}
        </p>
      </div>

      <p className="rounded-lg bg-pine-tint px-4 py-3 text-sm text-pine-dark">
        Nothing sends until you read it over and press the button on the next
        step. This is the only part of the app that reaches anybody, and it is
        yours to press.
      </p>

      {!ready && (
        <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          No mail credentials found. <code>RESEND_API_KEY</code> and{" "}
          <code>RESEND_FROM</code> live in the repo root&apos;s{" "}
          <code>.env.local</code>. You can still write and save the wording
          here; sending stays off until they are set.
        </p>
      )}

      <nav className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <Link
            key={t.id}
            href={`/clients/${slug}/email?template=${t.id}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              t.id === activeId
                ? "bg-pine text-background"
                : "bg-surface text-muted"
            }`}
          >
            {t.id}. {t.title}
          </Link>
        ))}
      </nav>

      <EmailComposer
        clientSlug={slug}
        clientName={displayName(client)}
        from={ready ? mailFrom() : ""}
        defaults={{ to: client.email, ...filled }}
        attachments={attachments}
        canSend={ready}
      />

      <p className="text-xs text-muted">
        The wording lives in <code>docs/clients/email-templates.md</code>. Edit
        it there and it changes here. Anything in double braces is a writing
        prompt, and sending is blocked while any are left.
      </p>
    </div>
  );
}
