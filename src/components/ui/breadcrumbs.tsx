import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  /** Label to display */
  label: string;
  /** Optional navigation target. If omitted, rendered as static text. */
  href?: string;
  /** Optional leading icon component */
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  /** Ordered list of breadcrumb items from root to current leaf */
  items: BreadcrumbItem[];
  /** Optional custom separator (defaults to ChevronRight) */
  separator?: React.ReactNode;
  /** Maximum width class for truncation (defaults to max-w-[160px] sm:max-w-[220px]) */
  maxItemWidth?: string;
}

export function Breadcrumbs({
  items,
  separator,
  maxItemWidth = "max-w-[140px] sm:max-w-[200px]",
  className,
  ...props
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center min-w-0", className)}
      {...props}
    >
      <ol className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 flex-wrap sm:flex-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {index > 0 && (
                <li
                  aria-hidden="true"
                  className="flex items-center text-muted-foreground/40 shrink-0 px-0.5"
                >
                  {separator || <ChevronRight className="size-3" />}
                </li>
              )}

              <li className="flex items-center min-w-0">
                {isLast ? (
                  <span
                    aria-current="page"
                    className={cn(
                      "font-semibold text-foreground truncate inline-flex items-center gap-1.5",
                      maxItemWidth
                    )}
                  >
                    {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
                    <span className="truncate">{item.label}</span>
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "hover:text-foreground transition-colors truncate inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs",
                      maxItemWidth
                    )}
                  >
                    {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "truncate inline-flex items-center gap-1.5",
                      maxItemWidth
                    )}
                  >
                    {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
                    <span className="truncate">{item.label}</span>
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
