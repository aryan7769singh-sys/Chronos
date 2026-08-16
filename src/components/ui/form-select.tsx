import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Visible label text */
  label?: string;
  /** Optional helper text below the control */
  description?: string;
  /** Error message to display */
  error?: string;
  /** Array of option items (alternative to passing children) */
  options?: FormSelectOption[];
  /** Container className */
  containerClassName?: string;
}

export function FormSelect({
  id: customId,
  label,
  description,
  error,
  options,
  required,
  disabled,
  className,
  containerClassName,
  children,
  ...props
}: FormSelectProps) {
  const generatedId = React.useId();
  const selectId = customId || generatedId;
  const descriptionId = description ? `${selectId}-desc` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-foreground select-none"
        >
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}

      {/* Select Box with custom arrow icon */}
      <div className="relative">
        <select
          id={selectId}
          required={required}
          disabled={disabled}
          aria-describedby={
            [descriptionId, errorId].filter(Boolean).join(" ") || undefined
          }
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full h-9 appearance-none rounded-lg border bg-background px-3 pr-8 text-xs text-foreground transition-colors",
            "border-border/60 hover:border-border",
            "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <ChevronDown
          className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p id={errorId} className="text-[11px] font-medium text-destructive">
          {error}
        </p>
      )}

      {/* Helper Description */}
      {description && !error && (
        <p id={descriptionId} className="text-[11px] text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
