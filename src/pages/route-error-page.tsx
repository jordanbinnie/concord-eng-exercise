import type { ErrorComponentProps } from "@tanstack/react-router";
import { queryErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/button";

/** Keeps a failed route recoverable without exposing internal errors. */
export function RouteErrorPage({ reset, error }: ErrorComponentProps) {
  return (
    <section className="flex min-h-64 flex-1 flex-col items-center justify-center gap-3 px-3 text-center">
      <h1 className="font-semibold text-2xl text-sidebar-accent-foreground leading-8">
        Couldn’t load this page
      </h1>
      <p className="text-[14px] text-muted-foreground leading-5">
        {queryErrorMessage(error)}
      </p>
      <Button className="cursor-default" onClick={reset} variant="outline">
        Try again
      </Button>
    </section>
  );
}
