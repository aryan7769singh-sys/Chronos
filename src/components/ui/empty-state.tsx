import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Leading icon illustrating the empty state */
  icon: LucideIcon;
  /** Primary title message */
  title: string;
  /** Optional secondary explanatory text */
  description?: React.ReactNode;
  /** Primary call-to-action button/element */
  action?: React.ReactNode;
  /** Optional secondary action or link */
  secondaryAction?: React.ReactNode;
  /** Container styling variant */
  variant?: "default" | "dashed" | "card";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "dashed",
  className,
  children,
  ...props
}: EmptyStateProps) {
  const variantClasses = {
    default: "py-12 px-6 text-center bg-transparent",
    dashed: "p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/70 bg-card/30",
    card: "p-8 sm:p-12 text-center rounded-2xl border border-border/60 bg-card/50 shadow-xs",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3.5",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {/* Icon Container */}
      <div
        className="size-12 rounded-2xl bg-muted/80 border border-border/50 flex items-center justify-center text-muted-foreground shrink-0"
        aria-hidden="true"
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </div>

      {/* Text Area */}
      <div className="max-w-sm space-y-1 text-center">
        <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <div className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2.5 pt-1.5 flex-wrap justify-center">
          {action}
          {secondaryAction}
        </div>
      )}

      {/* Optional custom slot */}
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
