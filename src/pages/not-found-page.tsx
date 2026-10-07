import { Link } from "@tanstack/react-router";

/** Recoverable empty state for unknown pages or case IDs. */
export function NotFoundPage() {
  return (
    <section className="flex min-h-64 flex-1 flex-col items-center justify-center gap-3 px-3 text-center">
      <h1 className="font-semibold text-2xl text-sidebar-accent-foreground leading-8">
        Page not found
      </h1>
      <p className="text-[14px] text-muted-foreground leading-5">
        This page or case could not be found.
      </p>
      <Link
        className="cursor-default text-[15px] text-header-foreground underline underline-offset-4"
        to="/overview"
      >
        Back to Overview
      </Link>
    </section>
  );
}
