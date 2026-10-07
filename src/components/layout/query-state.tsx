import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** Shared loading, empty, and recoverable query states using the workspace typography. */
export function QueryState({
  message,
  loading = false,
  onRetry,
}: {
  message: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  if (loading) {
    return <PageLoadingState message={message} />;
  }
  return (
    <div
      aria-live="polite"
      className="flex min-h-32 flex-col items-center justify-center gap-3 px-3 py-6 font-[450] text-[14px] text-muted-foreground leading-5"
    >
      <p>{message}</p>
      {onRetry && (
        <Button
          className="cursor-default"
          onClick={onRetry}
          size="sm"
          variant="outline"
        >
          Try again
        </Button>
      )}
    </div>
  );
}

/** Small spinner centered in the available page content. */
export function PageLoadingState({
  message = "Loading…",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-32 flex-1 items-center justify-center text-muted-foreground">
      <Spinner aria-label={message} className="size-4" />
    </div>
  );
}

export function RoutePendingState() {
  return <PageLoadingState message="Loading case…" />;
}
