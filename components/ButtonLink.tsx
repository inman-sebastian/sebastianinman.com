import Link from "next/link";
import { site } from "@/content/site";

type ButtonLinkProps = {
  href: string;
  variant?: "primary" | "secondary" | "light";
  className?: string;
  children: React.ReactNode;
};

const variants = {
  primary:
    "bg-terracotta text-white hover:bg-terracotta-dark focus-visible:outline-terracotta",
  secondary:
    "border border-pine text-pine hover:bg-pine-tint focus-visible:outline-pine",
  light:
    "bg-surface text-pine-dark hover:bg-pine-tint focus-visible:outline-white",
};

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: ButtonLinkProps) {
  const external = href.startsWith("http");
  const classes = `inline-block rounded-lg px-6 py-3 text-sm font-semibold transition-[color,background-color,transform] duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

/** "Book a free consult" CTA; uses the booking link when set, contact page otherwise */
export function ConsultButton({
  variant = "primary",
  className = "",
}: {
  variant?: ButtonLinkProps["variant"];
  className?: string;
}) {
  return (
    <ButtonLink href={site.bookingUrl || "/contact"} variant={variant} className={className}>
      Book a free consult
    </ButtonLink>
  );
}
