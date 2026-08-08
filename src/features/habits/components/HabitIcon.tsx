import React from "react";
import { getHabitIcon } from "../constants/domain";

export function HabitIcon({
  iconName,
  className,
  strokeWidth = 2,
}: {
  iconName?: string | null;
  className?: string;
  strokeWidth?: number;
}) {
  const IconComp = getHabitIcon(iconName);
  return React.createElement(IconComp, { className, strokeWidth });
}
