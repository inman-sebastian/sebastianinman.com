/**
 * The shape a message takes once it is in the hub, whatever channel it
 * came from. Each connector (lib/gmail.ts, lib/instagram.ts, ...) fetches
 * from its platform and normalizes to this, so the store, matching, and
 * the inbox UI never have to care which channel a message is from.
 *
 * Kept in its own module with no dependencies so a connector and the
 * store can both import it without a cycle.
 */

export type MessageChannel = "gmail" | "instagram" | "facebook";

export const CHANNEL_LABEL: Record<MessageChannel, string> = {
  gmail: "Email",
  instagram: "Instagram",
  facebook: "Facebook",
};

export type ChannelMessage = {
  /** The platform's own message id; the dedupe key across syncs */
  id: string;
  threadId: string;
  /** RFC 5322 Message-ID for email threading; "" for channels without one */
  rfcMessageId: string;
  channel: MessageChannel;
  direction: "in" | "out";
  /** Email address or a handle/username, depending on the channel */
  from: string;
  to: string;
  /** "" for channels without subjects (DMs) */
  subject: string;
  /** ISO, or "" when nothing usable was on the message */
  date: string;
  snippet: string;
  body: string;
};
