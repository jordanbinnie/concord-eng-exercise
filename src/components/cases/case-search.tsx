import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";

/** Searches cases from the right side of the filter row. */
export function CaseSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative ml-auto w-full sm:w-70">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
        strokeWidth={2.5}
      />
      <Input
        aria-label="Search cases, names or email"
        className="h-8 bg-popover pr-[0.5625rem] pl-[30px] font-medium text-[14px] text-muted-foreground leading-5 placeholder:text-muted-foreground md:text-[14px]"
        maxLength={200}
        onChange={onChange}
        placeholder="Search cases, names or email..."
        type="search"
        value={value}
      />
    </div>
  );
}
