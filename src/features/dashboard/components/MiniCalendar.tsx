"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

export function MiniCalendar() {
  const today = new Date();
  const [selected] = useState<Date>(today);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Calendar</CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {format(today, "MMMM yyyy")}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex justify-center p-0 pb-3">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={today}
          className="w-full"
          showOutsideDays={false}
        />
      </CardContent>
    </Card>
  );
}
