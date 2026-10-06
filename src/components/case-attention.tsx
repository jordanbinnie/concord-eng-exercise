import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CaseRecord } from "@/hooks/use-cases";

/** Lists every recorded attention reason without replacing the case's workflow status. */
export function AttentionReasons({
  reasons,
}: {
  reasons: CaseRecord["attention"];
}) {
  return (
    <ul className="space-y-3">
      {reasons.map((reason) => (
        <li key={reason.code}>
          <p className="font-medium text-sm">{reason.title}</p>
          <p className="mt-1 text-muted-foreground text-sm">{reason.reason}</p>
        </li>
      ))}
    </ul>
  );
}

/** Opens a compact explanation of the case's outstanding review reasons. */
export function CaseAttention({ record }: { record: CaseRecord }) {
  if (!record.attention.length) {
    return <span className="text-muted-foreground">None flagged</span>;
  }
  return (
    <Popover>
      <PopoverTrigger render={<Button size="sm" variant="destructive" />}>
        Needs attention ({record.attention.length})
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-96 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto whitespace-normal"
      >
        <PopoverHeader>
          <PopoverTitle>Needs attention</PopoverTitle>
          <PopoverDescription>{record.beneficiary}</PopoverDescription>
        </PopoverHeader>
        <AttentionReasons reasons={record.attention} />
      </PopoverContent>
    </Popover>
  );
}
