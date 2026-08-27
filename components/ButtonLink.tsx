import Link from "next/link";
import { site } from "@/content/site";
import { CalButton } from "@/components/CalButton";

export type ButtonVariant = "primary" | "secondary" | "light";

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
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

/** Shared button styling; also used by CalButton's modal trigger */
export function buttonClassName(variant: ButtonVariant, className = "") {
  return `inline-block rounded-lg px-6 py-3 text-sm font-semibold transition-[color,background-color,translate] duration-200 ease-out hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`;
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: ButtonLinkProps) {
  const external = href.startsWith("http");
  const classes = buttonClassName(variant, className);
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

/**
 * "Book a free consult" CTA. With a booking link set it opens the
 * Cal.com calendar in a modal (CalButton) so visitors never leave the
 * page; without one it falls back to the contact page. Pass `service`
 * (a service slug) to pre-check that service's card on the contact
 * form; ignored once a booking link exists.
 */
export function ConsultButton({
  variant = "primary",
  className = "",
  service,
}: {
  variant?: ButtonVariant;
  className?: string;
  service?: string;
}) {
  if (site.bookingUrl) {
    return (
      <CalButton variant={variant} className={className}>
        Book a free consult
      </CalButton>
    );
  }
  const contactHref = service ? `/contact?service=${service}` : "/contact";
  return (
    <ButtonLink href={contactHref} variant={variant} className={className}>
      Book a free consult
    </ButtonLink>
  );
}
