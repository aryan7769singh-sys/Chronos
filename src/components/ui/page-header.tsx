import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main page title heading */
  title: string;
  /** Optional secondary subtitle or description */
  description?: React.ReactNode;
  /** Optional leading icon component */
  icon?: LucideIcon;
  /** Optional badge or pill element rendered next to the title */
  badge?: React.ReactNode;
  /** Optional action slot (buttons, menus, etc.) aligned to the right */
  action?: React.ReactNode;
  /** Optional custom styling for the icon container */
  iconClassName?: string;
  /** Whether to render a bottom border divider (defaults to true) */
  bordered?: boolean;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  action,
  iconClassName,
  bordered = true,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        bordered && "pb-4 border-b border-border/50",
        className
      )}
      {...props}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title, Icon, Badge & Subtitle */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            {Icon && (
              <div
                className={cn(
                  "size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0",
                  iconClassName
                )}
                aria-hidden="true"
              >
                <Icon className="size-4.5" />
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {title}
            </h1>

            {badge && (
              <div className="flex items-center shrink-0">
                {typeof badge === "string" || typeof badge === "number" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border/60">
                    {badge}
                  </span>
                ) : (
                  badge
                )}
              </div>
            )}
          </div>

          {description && (
            <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </div>
          )}
        </div>

        {/* Primary Action Area */}
        {action && (
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Sub-header Content (e.g. Filter bars, tabs) */}
      {children && <div className="pt-1">{children}</div>}
    </div>
  );
}
