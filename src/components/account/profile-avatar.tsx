import { cn } from "@/lib/utils";

/** Shared initials avatar for the account menu and activity entries. */
export function ProfileAvatar({
  className,
  name,
}: {
  className?: string;
  name: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-5 shrink-0 select-none items-center justify-center rounded-md bg-[lch(55%_60_270/1)] font-normal text-[9px] text-white! leading-none tracking-normal",
        className
      )}
    >
      {name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}
