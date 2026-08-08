"use client";

import { signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const name = user?.name || "User";
  const email = user?.email || "";
  const image = user?.image || undefined;

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id="header-user-avatar"
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full ml-1"
        aria-label="User menu"
      >
        <Avatar size="sm" className="cursor-pointer border border-border/60">
          {image && <AvatarImage src={image} alt={name} />}
          <AvatarFallback className="text-xs font-semibold bg-violet-500/15 text-violet-600 dark:text-violet-400">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56 p-1.5 shadow-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-2 font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-xs font-semibold leading-none text-foreground">
                {name}
              </p>
              {email && (
                <p className="text-[11px] leading-none text-muted-foreground truncate">
                  {email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          id="user-menu-profile"
          className="text-xs gap-2 py-1.5 cursor-pointer text-muted-foreground focus:text-foreground"
        >
          <UserIcon className="size-3.5" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          id="user-menu-signout"
          variant="destructive"
          className="text-xs gap-2 py-1.5 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-500/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="size-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
