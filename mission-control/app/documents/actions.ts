"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendTimeline, getClient } from "@/lib/clients";
import {
  createDocument,
  deleteDocument,
  documentsForClient,
  getDocument,
  nextInvoiceNumber,
  saveDocument,
  kindLabel,
  KINDS,
  type DocKind,
} from "@/lib/documents";
import { generatePdf } from "@/lib/paperwork";
import {
  fillTemplate,
  loadTemplate,
  templateSignatures,
  templateTitle,
} from "@/lib/templates";

/**
 * Document writes. These touch docs/clients/drafts/ (git-ignored) and
 * spawn paperwork-app for the PDF. Nothing here emails anybody.
 */

export type DocFormState = { error?: string; message?: string };

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function isKind(value: string): value is DocKind {
  return KINDS.some((k) => k.id === value);
}

export async function createDocumentAction(formData: FormData) {
  const clientSlug = text(formData, "client");
  const kind = text(formData, "kind");
  const client = getClient(clientSlug);
  if (!client || !isKind(kind)) return;

  const template = loadTemplate(kind);
  if (!template) return;

  const invoiceNumber = kind === "invoice" ? nextInvoiceNumber() : undefined;
  // An agreement points at the proposal it goes with, so date that
  // reference off the newest proposal on file for this client
  const proposal =
    kind === "agreement"
      ? documentsForClient(clientSlug).find((d) => d.kind === "proposal")
      : undefined;

  const doc = createDocument({
    record: clientSlug,
    kind,
    title: templateTitle(kind, client, invoiceNumber),
    client: client.business || client.name,
    body: fillTemplate(template.body, client, {
      invoiceNumber,
      proposalDate: proposal?.date,
    }),
    signatures: templateSignatures(kind, client),
    date: new Date().toISOString().slice(0, 10),
  });

  appendTimeline(clientSlug, `${kindLabel(kind)} started`, `Draft: ${doc.slug}`);
  revalidatePath("/documents");
  revalidatePath(`/clients/${clientSlug}`);
  redirect(`/documents/${doc.slug}`);
}

export async function saveDocumentAction(formData: FormData) {
  const slug = text(formData, "slug");
  saveDocument(slug, {
    title: text(formData, "title"),
    date: text(formData, "date"),
    signatures: text(formData, "signatures")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    body: text(formData, "body"),
  });
  revalidatePath("/documents");
  revalidatePath(`/documents/${slug}`);
}

export async function generatePdfAction(
  _prev: DocFormState,
  formData: FormData
): Promise<DocFormState> {
  const slug = text(formData, "slug");
  const doc = getDocument(slug);
  if (!doc) return { error: "That draft is gone." };
  if (doc.placeholders > 0) {
    return {
      error: `Still ${doc.placeholders} placeholder${
        doc.placeholders === 1 ? "" : "s"
      } to fill in. Finish those first, so nothing goes out with {{...}} in it.`,
    };
  }

  const result = await generatePdf(slug);
  revalidatePath(`/documents/${slug}`);
  if (!result.ok) return { error: result.message };
  if (doc.record) {
    appendTimeline(doc.record, `${kindLabel(doc.kind)} PDF generated`, doc.title);
    revalidatePath(`/clients/${doc.record}`);
  }
  return { message: "PDF ready. Give it a read before it goes anywhere." };
}

export async function deleteDocumentAction(formData: FormData) {
  const slug = text(formData, "slug");
  const doc = getDocument(slug);
  const record = doc?.record ?? "";
  deleteDocument(slug);
  revalidatePath("/documents");
  if (record) revalidatePath(`/clients/${record}`);
  redirect(record ? `/clients/${record}` : "/documents");
}
