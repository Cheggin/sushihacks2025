import * as React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border transition-all duration-300 card-surface",
        // Accessible surface and border
        "bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] border-[var(--color-border)]",
        // Subtle shadow for depth
        "shadow-[0_6px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_10px_32px_rgba(0,0,0,0.35)]",
        className
      )}
      {...props}
    />
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={clsx("p-5", className)} {...props} />;
}