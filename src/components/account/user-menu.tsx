"use client";

import { Check, ChevronDown } from "lucide-react";
import { ProfileAvatar } from "@/components/account/profile-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ name }: { name: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="h-7 gap-1.5 rounded-lg px-1.5 py-1 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5"
            size="alt"
            variant="ghost"
          >
            <div data-icon="inline-start">
              <ProfileAvatar name={name} />
            </div>
            <span
              style={{
                color: "var(--foreground)",
                fontFeatureSettings: '"calt"',
                fontSize: "15px",
                fontStyle: "normal",
                fontVariationSettings: '"opsz" 28',
                fontWeight: 550,
                letterSpacing: "-0.00625rem",
              }}
            >
              {name}
            </span>
            <div className="relative size-3" data-icon="inline-end">
              <ChevronDown
                className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2.5}
              />
            </div>
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-[16.25rem]">
        <DropdownMenuGroup>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Switch workspace
              <div className="ml-auto flex w-4 justify-end">
                <span className="text-[0.375rem] text-[lch(66%_1_282/1)] group-data-highlighted/dropdown-menu-item:text-[lch(40%_1_282/1)]! group-data-popup-open/dropdown-menu-item:text-[lch(40%_1_282/1)]!">
                  ▶
                </span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                alignOffset={-3}
                className="w-[15.25rem]"
                sideOffset={4}
              >
                {[name].map((user, index) => (
                  <DropdownMenuItem className="gap-2" key={user}>
                    <ProfileAvatar
                      className="size-4.5 text-[7px]"
                      name={user}
                    />
                    {user}
                    {index === 0 && (
                      <Check aria-hidden="true" className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
