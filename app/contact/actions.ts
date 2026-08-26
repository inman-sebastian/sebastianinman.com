"use server";

import { site } from "@/content/site";
import { getServices } from "@/lib/content";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "message", string>>;
};

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot: real users never fill this hidden field
  if (formData.get("company_website")) {
    return { status: "success" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const business = String(formData.get("business") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  // Checked service cards arrive as slugs; map them back to titles and
  // drop anything that isn't a real option (tampered values)
  const known = new Map(getServices().map((s) => [s.slug, s.title]));
  known.set("not-sure", "Not sure yet");
  const services = formData
    .getAll("services")
    .map((slug) => known.get(String(slug)))
    .filter((title): title is string => Boolean(title));

  const errors: ContactFormState["errors"] = {};
  if (!name) errors.name = "Please tell me your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "That email doesn't look right. Mind double-checking?";
  if (message.length < 10)
    errors.message = "Tell me a little about what you need. A sentence or two is plenty.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  const summary = [
    `New inquiry from ${site.url}`,
    `Name: ${name}`,
    `Email: ${email}`,
    business ? `Business: ${business}` : null,
    services.length > 0 ? `Interested in: ${services.join(", ")}` : null,
    ``,
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        // TODO: switch to a verified sebastianinman.com sender once the
        // domain is verified in Resend (see CLAUDE.md deferred tasks)
        from: "Website Contact Form <onboarding@resend.dev>",
        to: site.email,
        replyTo: email,
        subject: `New inquiry from ${name}${business ? ` (${business})` : ""}`,
        text: summary,
      });
    } catch (err) {
      console.error("Contact form email failed:", err);
      return {
        status: "error",
        message: `Something went wrong sending your message. Please email me directly at ${site.email}.`,
      };
    }
  } else {
    // No email service configured yet (local dev), so log the submission
    console.log("\n--- Contact form submission (no RESEND_API_KEY set) ---");
    console.log(summary);
    console.log("-------------------------------------------------------\n");
  }

  return { status: "success" };
}
