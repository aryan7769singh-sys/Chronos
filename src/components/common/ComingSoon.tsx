import { Clock } from "lucide-react";

interface ComingSoonProps {
  /** The feature/page title displayed as the heading */
  title: string;
  /** Optional override for the sub-message */
  description?: string;
}

/**
 * Reusable placeholder component for pages that are not yet implemented.
 * Renders a centred layout with a clock icon, title, and description.
 */
export function ComingSoon({
  title,
  description = "This feature is on the roadmap. Check back soon.",
}: ComingSoonProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 min-h-[calc(100vh-8rem)] select-none">
      <div className="flex items-center justify-center size-16 rounded-2xl bg-muted">
        <Clock className="size-7 text-muted-foreground" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col items-center gap-2 text-center max-w-xs">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
