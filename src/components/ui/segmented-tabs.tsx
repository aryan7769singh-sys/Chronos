"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SegmentedTabOption<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedTabsProps<T extends string = string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Active selected tab ID */
  value: T;
  /** Callback fired when user selects a new tab */
  onValueChange: (value: T) => void;
  /** List of tab options */
  options: readonly SegmentedTabOption<T>[] | SegmentedTabOption<T>[];
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Optional accessible label for the tablist */
  "aria-label"?: string;
}

export function SegmentedTabs<T extends string = string>({
  value,
  onValueChange,
  options,
  size = "default",
  className,
  "aria-label": ariaLabel = "Segmented navigation",
  ...props
}: SegmentedTabsProps<T>) {
  const tabsRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabledOptions = options.filter((o) => !o.disabled);
    const currentIndex = enabledOptions.findIndex((o) => o.id === options[index].id);

    let nextIndex = -1;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % enabledOptions.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = enabledOptions.length - 1;
    }

    if (nextIndex !== -1 && enabledOptions[nextIndex]) {
      const nextOption = enabledOptions[nextIndex];
      onValueChange(nextOption.id);

      // Focus the newly active tab button
      const buttons = tabsRef.current?.querySelectorAll<HTMLButtonElement>("button[role='tab']");
      const targetBtn = Array.from(buttons || []).find(
        (b) => b.getAttribute("data-tab-id") === nextOption.id
      );
      targetBtn?.focus();
    }
  };

  const sizeClasses = {
    sm: "py-1 px-2.5 text-xs gap-1.5",
    default: "py-1 px-3 text-xs font-medium gap-1.5",
    lg: "py-1.5 px-3.5 text-sm font-medium gap-2",
  };

  const containerSizes = {
    sm: "p-0.5 rounded-lg",
    default: "p-1 rounded-xl",
    lg: "p-1.5 rounded-xl",
  };

  return (
    <div
      ref={tabsRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 bg-muted/60 border border-border/60 max-w-full overflow-x-auto scrollbar-none shrink-0",
        containerSizes[size],
        className
      )}
      {...props}
    >
      {options.map((option, index) => {
        const isActive = value === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            data-tab-id={option.id}
            id={`tab-${option.id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={option.disabled}
            onClick={() => onValueChange(option.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "inline-flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer select-none whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0",
              sizeClasses[size],
              isActive
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
              option.disabled && "pointer-events-none opacity-40 cursor-not-allowed"
            )}
          >
            {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
            <span>{option.label}</span>
            {option.badge && (
              <span className="ml-1 inline-flex items-center">{option.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
