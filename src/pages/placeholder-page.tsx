import { PageIllustration } from "@/components/placeholders/page-illustration";

/** Empty state for sections that have not been built yet. */
function PagePlaceholder({
  name,
  analytics,
}: {
  name: string;
  analytics: boolean;
}) {
  return (
    <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-6 px-4 text-center text-muted-foreground">
      <PageIllustration analytics={analytics} />
      <p className="font-medium text-[15px] leading-5">
        {name} hasn’t been built yet.
      </p>
    </div>
  );
}

/** Selects the placeholder for an unfinished workspace section. */
export function PlaceholderPage({
  name,
  slug,
}: {
  name: string;
  slug: string;
}) {
  if (["pre-assessments", "reporting-analytics"].includes(slug)) {
    return (
      <PagePlaceholder analytics={slug === "reporting-analytics"} name={name} />
    );
  }
  return <div className="min-h-40 rounded-[0.75rem] bg-popover shadow-panel" />;
}
