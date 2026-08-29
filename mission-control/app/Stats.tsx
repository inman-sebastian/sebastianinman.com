import Link from "next/link";
import { money } from "@/lib/format";
import { moneySummary, stripeReady } from "@/lib/stripe";
import { analyticsReady, siteTraffic } from "@/lib/analytics";

/**
 * The row of numbers across the top.
 *
 * This is what makes the page a dashboard rather than a stack of lists:
 * the state of the business in one line, with the detail underneath
 * rather than mixed in. Nothing here repeats below, and nothing below
 * repeats here.
 *
 * Each cell that depends on somebody else's server sits in its own
 * Suspense boundary, so the numbers this machine already knows appear
 * instantly and Stripe and Vercel fill in when they answer. One slow
 * call cannot hold up the row.
 */

export function Stat({
  label,
  value,
  sub,
  href,
  alarming = false,
  pending = false,
}: {
  label: string;
  value: string;
  sub?: string;
  href?: string;
  alarming?: boolean;
  pending?: boolean;
}) {
  const body = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-1 font-serif text-3xl font-semibold leading-none ${
          pending
            ? "text-line"
            : alarming
              ? "text-terracotta-dark"
              : "text-pine-dark"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </>
  );

  // Dividers live on the cell, not as gaps in a coloured grid: five
  // cells do not divide evenly into three or two columns, and a painted
  // gap turns the empty sixth cell into a stray block when the row
  // wraps. A cell that does not exist draws nothing.
  const className = `border-b border-r border-line bg-surface px-4 py-3 ${
    href ? "transition hover:bg-pine-tint/40" : ""
  }`;
  return href ? (
    <Link href={href} className={`block ${className}`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** Placeholder of the same shape, so the row does not jump when it lands */
export function StatPending({ label }: { label: string }) {
  return <Stat label={label} value="..." pending />;
}

export async function MoneyStats() {
  if (!stripeReady()) return null;
  try {
    const { outstanding, overdue } = await moneySummary();
    return (
      <>
        <Stat label="Outstanding" value={money(outstanding) || "$0"} />
        <Stat
          label="Overdue"
          value={money(overdue) || "$0"}
          alarming={overdue > 0}
        />
      </>
    );
  } catch {
    // The panel below says what went wrong; a broken number in the top
    // row would just be noise repeated twice
    return null;
  }
}

export async function TrafficStat() {
  if (!analyticsReady()) return null;
  try {
    const { week, previousWeek } = await siteTraffic();
    // A percentage against a base of zero is not a number anybody can
    // use, so the first week with traffic just says what it is
    const change =
      previousWeek.visitors === 0
        ? "last 7 days"
        : `${week.visitors >= previousWeek.visitors ? "+" : ""}${Math.round(
            ((week.visitors - previousWeek.visitors) / previousWeek.visitors) * 100
          )}% on last week`;
    return (
      <Stat label="Visitors" value={String(week.visitors)} sub={change} />
    );
  } catch {
    return null;
  }
}
