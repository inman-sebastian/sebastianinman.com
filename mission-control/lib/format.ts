/** Small display helpers shared across the views. */

export function money(amount: number | null): string {
  if (!amount) return "";
  return `$${amount.toLocaleString("en-US")}`;
}

/** Dialable href. A bare 10-digit US number gets the country code so
    the link works from a phone as well as a Mac. */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (phone.trim().startsWith("+")) return `tel:+${digits}`;
  if (digits.length === 10) return `tel:+1${digits}`;
  return `tel:${digits}`;
}

/** "August 27, 2026" from an ISO date, without timezone surprises */
export function longDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
