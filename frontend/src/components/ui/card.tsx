import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Card: theme-aware container
 * - Uses CSS variables defined in index.css: --card-bg, --card-border, --text-primary
 */
export function Card({ children, className = "", style = {} }: CardProps) {
  return (
    <div
      className={`rounded-2xl shadow-xl p-4 ${className}`}
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        color: "var(--text-primary)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}