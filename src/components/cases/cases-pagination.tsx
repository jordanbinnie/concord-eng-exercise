import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Fixed footer for case counts and page navigation. */
export function CasesPagination({
  total,
  pageIndex,
  pageSize,
  onPrevious,
  onNext,
  loading = false,
}: {
  total: number;
  pageIndex: number;
  pageSize: number;
  onPrevious: () => void;
  onNext: () => void;
  loading?: boolean;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return (
    <footer className="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-t-[0.5px] bg-surface px-4 py-2 text-[13px] text-muted-foreground max-md:px-3">
      <span aria-live="polite">
        {loading && !total
          ? "Loading…"
          : total
            ? `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, total)} of ${total} cases`
            : "0 cases"}
      </span>
      <div className="flex items-center gap-2">
        <span>
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Button
          aria-label="Previous page"
          className="cursor-default"
          disabled={loading || pageIndex === 0}
          onClick={onPrevious}
          size="icon-sm"
          variant="ghost"
        >
          <ChevronLeft />
        </Button>
        <Button
          aria-label="Next page"
          className="cursor-default"
          disabled={loading || pageIndex + 1 >= pageCount}
          onClick={onNext}
          size="icon-sm"
          variant="ghost"
        >
          <ChevronRight />
        </Button>
      </div>
    </footer>
  );
}
