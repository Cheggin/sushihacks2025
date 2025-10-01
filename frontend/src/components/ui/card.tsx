import * as React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border-2 transition-all duration-300",
        // No background - transparent to show liquid glass
        "bg-transparent",
        // Vibrant border with glow effect
        "border-white/40 hover:border-white/60",
        // Subtle shadow for depth
        "shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]",
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