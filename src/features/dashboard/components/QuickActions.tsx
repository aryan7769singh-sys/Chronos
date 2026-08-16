import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MOCK_QUICK_ACTIONS } from "../constants/mockData";

export function QuickActions() {
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold">Quick Add</CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <nav aria-label="Quick actions" className="flex flex-col gap-1">
          {MOCK_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                href={action.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "w-full justify-start gap-2.5 text-xs text-muted-foreground hover:text-foreground h-8"
                )}
              >
                <Icon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}
