import Link from "next/link";
import { displayName, type ClientRecord } from "@/lib/clients";
import { money } from "@/lib/format";

/** The compact card used on the dashboard board */
export function ClientCard({ client }: { client: ClientRecord }) {
  const person = client.name && client.business ? client.name : "";
  return (
    <Link
      href={`/clients/${client.slug}`}
      className="card block p-3 transition hover:border-pine"
    >
      <p className="font-serif text-lg font-semibold leading-snug text-pine-dark">
        {displayName(client)}
      </p>
      {person && <p className="text-sm text-muted">{person}</p>}
      {client.nextStep && (
        <p className="mt-2 text-sm text-ink">{client.nextStep}</p>
      )}
      <p className="mt-2 flex items-center justify-between text-xs text-muted">
        <span>{client.nextStepDue || `Updated ${client.updated}`}</span>
        {client.value && <span className="font-semibold">{money(client.value)}</span>}
      </p>
    </Link>
  );
}
