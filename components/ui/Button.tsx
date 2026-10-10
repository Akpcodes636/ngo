import Link from "next/link";
import { ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "outline-light" | "outline-dark";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-150 focus-visible:outline-[3px] focus-visible:outline-gold-500 focus-visible:outline-offset-[3px] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-gold-500 text-forest-900 hover:bg-gold-400 shadow-sm",
  secondary: "bg-[#5B805F] text-white hover:bg-forest-600",
  "outline-light": "border-2 border-white text-white hover:bg-white/10",
  "outline-dark":
    "border-2 border-forest-700 text-forest-700 hover:bg-forest-700 hover:text-white",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type LinkProps = CommonProps & {
  href: string;
  type?: never;
  onClick?: never;
};

type ButtonElProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

export function Button(props: LinkProps | ButtonElProps) {
  const { children, variant = "primary", size = "md", className } = props;
  const classes = clsx(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, className: _className, ...rest } =
    props as ButtonElProps;
  void _variant;
  void _size;
  void _className;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
