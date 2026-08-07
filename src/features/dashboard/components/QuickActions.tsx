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
    <Card>
      <CardHeader>
        <CardTitle>Quick Add</CardTitle>
      </CardHeader>

      <CardContent>
        <nav aria-label="Quick actions" className="flex flex-col gap-1">
          {MOCK_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                href={action.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                <span className="text-sm">{action.label}</span>
              </Link>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}
