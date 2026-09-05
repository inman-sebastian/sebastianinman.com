import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import {
  availableChannels,
  resolveChannel,
  type Channel,
} from "@/lib/channels";
import { displayName, getClient } from "@/lib/clients";
import { documentsForClient } from "@/lib/documents";
import { fillEmail, getEmailTemplate, listEmailTemplates } from "@/lib/emails";
import { mailFrom, mailReady } from "@/lib/env";
import { messageById } from "@/lib/messages";
import { attachmentsFor, sendBlockReason } from "@/lib/send";
import { signatureHtml } from "@/lib/signature";
import { stageInfo } from "@/lib/stages";
import { EmailComposer } from "./EmailComposer";

export const dynamic = "force-dynamic";

/** The first email address in a header value like "Jane <jane@x.com>". */
function firstEmail(header: string): string {
  const m = header.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : "";
}

/** "Re: ..." with any existing Re: collapsed, never doubled. */
function reSubject(subject: string): string {
  const bare = subject.replace(/^\s*(re:\s*)+/i, "").trim();
  return `Re: ${bare || "(no subject)"}`;
}

export default async function EmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ template?: string; channel?: string; reply?: string }>;
}) {
  const { slug } = await params;
  const {
    template: requested,
    channel: requestedChannel,
    reply: replyId,
  } = await searchParams;
  const client = getClient(slug);
  if (!client) notFound();

  // Reply mode: a threaded response to one stored message. It is an email
  // send with the address, subject and threading already set, so it skips
  // the channel picker and the templates entirely.
  const replyMsg = replyId ? messageById(slug, replyId) : null;
  const reply = replyMsg
    ? {
        rfcMessageId: replyMsg.rfcMessageId,
        threadId: replyMsg.threadId,
        from: replyMsg.from,
        subject: replyMsg.subject,
        date: replyMsg.date,
        body: replyMsg.body,
      }
    : null;
  const replyToEmail = replyMsg
    ? firstEmail(replyMsg.direction === "in" ? replyMsg.from : replyMsg.to)
    : "";

  const channels = reply ? [] : availableChannels(client);
  const channel: Channel | null = reply
    ? {
        id: "email",
        kind: "email",
        label: "Email",
        target: replyToEmail,
        targetUrl: "",
      }
    : resolveChannel(client, requestedChannel);

  // Nothing to write into: no email and no DM-capable social. Rather than
  // a dead form, hand over the checked opening line to use however he
  // reaches them (a call, in person).
  if (!channel) {
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
            No channel on file for {displayName(client)}
          </h1>
          <p className="mt-1 text-sm text-muted">
            No email address and no Instagram or Facebook to message. Reach
            them however you can; here is the line the research already
            checked, which is the part that proves you looked.
          </p>
        </div>
        <div className="card p-5">
          <Markdown className="text-sm">
            {client.notes || "Nothing recorded."}
          </Markdown>
        </div>
      </div>
    );
  }

  const isDm = channel.kind === "dm";

  const templates = listEmailTemplates();
  // Default to whatever this stage calls for, then whatever is first
  const stageTemplate = stageInfo(client.stage).emailId;
  const activeId =
    Number(requested) || stageTemplate || templates[0]?.id || 0;
  // Neither a DM nor a reply fills a template; only a fresh email does.
  const active = isDm || reply ? null : getEmailTemplate(activeId);
  const filled = reply
    ? { subject: reSubject(reply.subject), body: "" }
    : active
      ? fillEmail(active, client)
      : { subject: "", body: "" };

  // Only a fresh email carries attachments, and only documents with a PDF
  // already built can be attached.
  const documents = isDm || reply ? [] : documentsForClient(slug);
  const built = attachmentsFor(documents.map((d) => d.slug));
  const attachments = built.map((a) => ({
    ...a,
    title: documents.find((d) => d.slug === a.slug)?.title ?? a.slug,
  }));

  const ready = mailReady();

  // The same rule the send action enforces. Research turned these up;
  // they never asked to hear from anyone, so the app hands the message
  // over instead of sending it. A DM is always copy-only too: the app has
  // no way to send one, whatever the record's source.
  const blocked = sendBlockReason(client);
  const onList = blocked?.kind === "do-not-contact" ? blocked.reason : "";
  const copyOnly = isDm
    ? `The app doesn't send ${channel.label}s. You'll read it over, copy it, and send it yourself.`
    : blocked?.kind === "outreach"
      ? blocked.reason
      : undefined;

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
          {reply ? "Reply to" : "Write to"}{" "}
          {client.name || displayName(client)}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isDm
            ? `As a ${channel.label} to ${channel.target}`
            : copyOnly
              ? "To send from your own inbox"
              : `Sending as ${ready ? mailFrom() : "nobody yet"}`}
        </p>
      </div>

      {channels.length > 1 && (
        <nav className="flex flex-wrap gap-2">
          {channels.map((c) => (
            <Link
              key={c.id}
              href={`/clients/${slug}/email?channel=${c.id}`}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                c.id === channel.id
                  ? "bg-terracotta text-background"
                  : "bg-surface text-muted"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </nav>
      )}

      <p className="rounded-lg bg-pine-tint px-4 py-3 text-sm text-pine-dark">
        {copyOnly
          ? "Nothing sends from here. You will read it over, copy it, and send it yourself."
          : "Nothing sends until you read it over and press the button on the next step. This is the only part of the app that reaches anybody, and it is yours to press."}
      </p>

      {onList && (
        <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          <strong>{onList}</strong> Close this one.
        </p>
      )}

      {!ready && !copyOnly && (
        <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          No mail credentials found. <code>RESEND_API_KEY</code> and{" "}
          <code>RESEND_FROM</code> live in the repo root&apos;s{" "}
          <code>.env.local</code>. You can still write and save the wording
          here; sending stays off until they are set.
        </p>
      )}

      {!isDm && !reply && (
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
      )}

      {active?.notes && (
        <details className="card p-4 text-sm">
          <summary className="cursor-pointer font-semibold text-pine-dark">
            What this template says about itself
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-muted">{active.notes}</p>
        </details>
      )}

      <EmailComposer
        clientSlug={slug}
        clientName={displayName(client)}
        channel={channel}
        from={ready ? mailFrom() : ""}
        defaults={{
          to: reply ? replyToEmail : isDm ? "" : client.email,
          ...filled,
        }}
        attachments={attachments}
        canSend={ready && !onList}
        copyOnly={copyOnly}
        signature={signatureHtml()}
        templateId={activeId}
        reply={reply}
      />

      {reply ? (
        <p className="text-xs text-muted">
          This threads under their message and is saved to the conversation
          here. Sending is blocked while any double-brace prompt is left.
        </p>
      ) : isDm ? (
        <p className="text-xs text-muted">
          A DM has no template by design. It is drafted from this record&apos;s
          notes, research and timeline, then copied and sent by hand.
        </p>
      ) : (
        <p className="text-xs text-muted">
          The wording lives in <code>docs/clients/email-templates.md</code>.
          Edit it there and it changes here. Anything in double braces is a
          writing prompt, and sending is blocked while any are left.
        </p>
      )}
    </div>
  );
}
