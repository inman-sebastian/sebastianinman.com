import type { ClientRecord } from "./clients";
import { socialNetwork } from "./socials";

/**
 * How Sebastian can reach one business for a first message.
 *
 * A channel is a per-message choice, not a stored attribute of the
 * record: the same business might get an email or a DM depending on what
 * it has and what he decides in the moment. So this is derived fresh from
 * the record's `email` and `socials` every time the composer loads, and
 * nothing here is written back.
 *
 * Only channels the record actually supports are offered. Email needs an
 * address; a DM needs a profile on a network that has DMs. Yelp, Pinterest
 * and the like live in `socials` for display but are not message channels.
 */

export type ChannelId = "email" | "instagram" | "facebook";

export type Channel = {
  id: ChannelId;
  kind: "email" | "dm";
  /** Chip and heading label, e.g. "Instagram DM" */
  label: string;
  /** The address for email, or a readable @handle / page name for a DM */
  target: string;
  /** The profile URL to open and paste into; "" for email */
  targetUrl: string;
};

/** The networks that are genuinely message channels, mapped to their id. */
const DM_NETWORKS: Record<string, ChannelId> = {
  instagram: "instagram",
  facebook: "facebook",
};

const DM_LABEL: Record<ChannelId, string> = {
  email: "Email",
  instagram: "Instagram DM",
  facebook: "Facebook DM",
};

/** A readable handle for the chip and confirm step. The Open-profile link
    carries the real URL, so this only has to be recognisable, not exact. */
function handleFrom(url: string, id: ChannelId): string {
  let path = "";
  try {
    path = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
  } catch {
    return url;
  }
  const segs = path.split("/").filter(Boolean);
  if (id === "instagram") return segs[0] ? `@${segs[0]}` : url;
  // Facebook: drop a leading "p" segment and a trailing numeric page id,
  // which leaves the readable name on the common URL shapes.
  const name = (segs[0] === "p" ? segs[1] : segs[0]) ?? "";
  return name.replace(/-?\d{6,}$/, "") || name || url;
}

/** Every channel this record can actually be reached on, email first. */
export function availableChannels(client: ClientRecord): Channel[] {
  const out: Channel[] = [];
  if (client.email) {
    out.push({
      id: "email",
      kind: "email",
      label: DM_LABEL.email,
      target: client.email,
      targetUrl: "",
    });
  }
  for (const id of ["instagram", "facebook"] as const) {
    const url = client.socials.find((u) => {
      const net = socialNetwork(u);
      return net ? DM_NETWORKS[net.name.toLowerCase()] === id : false;
    });
    if (url) {
      out.push({
        id,
        kind: "dm",
        label: DM_LABEL[id],
        target: handleFrom(url, id),
        targetUrl: url,
      });
    }
  }
  return out;
}

/** The channel to open on by default: email if there is one, else the
    first DM available. */
export function defaultChannel(client: ClientRecord): ChannelId {
  return availableChannels(client)[0]?.id ?? "email";
}

/** Resolve a requested channel id against what the record supports,
    falling back to the default. */
export function resolveChannel(
  client: ClientRecord,
  requested: string | undefined
): Channel | null {
  const list = availableChannels(client);
  if (list.length === 0) return null;
  const wanted = list.find((c) => c.id === requested);
  return wanted ?? list.find((c) => c.id === defaultChannel(client)) ?? list[0];
}
