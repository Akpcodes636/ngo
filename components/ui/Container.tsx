import { ReactNode } from "react";
import clsx from "clsx";

export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  return <Tag className={clsx("container-page", className)}>{children}</Tag>;
}
