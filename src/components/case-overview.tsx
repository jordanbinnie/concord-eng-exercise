import {
  CalendarDaysIcon,
  Clock3Icon,
  FileTextIcon,
  TriangleAlertIcon,
  UserRoundIcon,
} from "lucide-react";
import { AttentionReasons } from "@/components/case-attention";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import type { CaseDetail } from "@/hooks/use-cases";

type Presentation = "page" | "panel";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats recorded ISO dates for display without shifting the day into the user's timezone. */
function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

/** Gives the person, visa, and status a consistent heading in both case views. */
function CaseSummary({ record }: { record: CaseDetail }) {
  return (
    <Card>
      <CardHeader className="flex @sm:flex-row flex-col @sm:items-center @sm:justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
            <FileTextIcon aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardDescription>Visa application</CardDescription>
            <CardTitle>
              <h2 className="break-words font-semibold text-xl tracking-tight">
                {record.beneficiary}
              </h2>
            </CardTitle>
            <p className="break-words text-muted-foreground text-sm">
              {record.company} · {record.visaType ?? "Visa type not recorded"}
            </p>
          </div>
        </div>
        <Badge
          variant={record.status === "RFE Issued" ? "destructive" : "secondary"}
        >
          <span className="sr-only">Case status: </span>
          {record.status ?? "Status not recorded"}
        </Badge>
      </CardHeader>
      <CardFooter className="flex @sm:flex-row flex-col items-start @sm:items-center @sm:justify-between gap-2 text-muted-foreground text-xs">
        <p className="min-w-0 break-all">
          Case reference <span className="font-mono">{record.id}</span>
        </p>
        <p className="flex shrink-0 items-center gap-1.5">
          <Clock3Icon aria-hidden="true" className="size-3.5" />
          Last updated: {formatDate(record.updatedAt)}
        </p>
      </CardFooter>
    </Card>
  );
}

/** Groups personal details and the recorded profile completion state in a read-only card. */
function PersonalDetails({
  record,
  presentation,
}: {
  record: CaseDetail;
  presentation: Presentation;
}) {
  const fields = [
    ["Full name", record.beneficiary],
    ["Email address", record.email],
    ["Employee ID", record.employeeId],
    ["Company", record.company],
    ["Nationality", record.nationality],
    ["Job title", record.jobTitle],
    ["Department", record.department],
    ["Work location", record.workLocation],
  ];
  const completion = record.profileCompletion;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>
          <h2>
            {presentation === "page" ? "Your details" : "Employee details"}
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={completion.percentage}>
            <ProgressLabel>Profile completion</ProgressLabel>
            <ProgressValue />
          </Progress>
          <p className="text-muted-foreground text-xs">
            {completion.completed} of {completion.total} profile fields provided
          </p>
          {completion.missingFields.length > 0 && (
            <p className="text-muted-foreground text-xs">
              Missing: {completion.missingFields.join(", ")}
            </p>
          )}
        </div>
        <dl className="grid @sm:grid-cols-2 gap-6 border-t pt-6">
          {fields.map(([label, value]) => (
            <div className="min-w-0 space-y-1.5" key={label}>
              <dt className="text-muted-foreground text-sm">{label}</dt>
              <dd className="break-words font-medium text-sm">
                {value ?? "Not recorded"}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

/** Lists known filing and expiry dates, leaving missing dates explicitly unrecorded. */
function KeyDates({ record }: { record: CaseDetail }) {
  const dates = [
    ["Filed on", record.filedAt],
    ["Visa expires", record.expiresAt],
    ["Passport expires", record.passportExpiry],
  ];
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>
          <h2>Key dates</h2>
        </CardTitle>
        <CardAction>
          <CalendarDaysIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="divide-y">
          {dates.map(([label, value]) => (
            <div
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"
              key={label}
            >
              <dt className="text-muted-foreground text-sm">{label}</dt>
              <dd className="font-medium text-sm tabular-nums">
                {formatDate(value)}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

/** Shows every advisor assigned to the case without suggesting unsupported contact actions. */
function Advisors({
  record,
  presentation,
}: {
  record: CaseDetail;
  presentation: Presentation;
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>
          <h2>
            {presentation === "page" ? "Your advisors" : "Assigned advisors"}
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {record.advisors.length ? (
          <ul className="space-y-4">
            {record.advisors.map((advisor) => (
              <li className="flex items-center gap-3" key={advisor.id}>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <UserRoundIcon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                </div>
                <div className="min-w-0">
                  <p className="break-words font-medium text-sm">
                    {advisor.name}
                  </p>
                  <p className="text-muted-foreground text-xs">Case advisor</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No advisor assigned yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** Shares the case cards between the beneficiary page and the compact HR and advisor panel. */
export function CaseOverview({
  record,
  presentation,
}: {
  record: CaseDetail;
  presentation: Presentation;
}) {
  return (
    <div className="@container space-y-6">
      <CaseSummary record={record} />
      <div className="grid items-start gap-6">
        <div className="min-w-0 space-y-6">
          {record.attention.length > 0 && (
            <Card className="ring-destructive/25">
              <CardHeader className="border-destructive/15 border-b">
                <CardTitle>
                  <h2 className="flex items-center gap-2 text-destructive">
                    <TriangleAlertIcon aria-hidden="true" className="size-4" />
                    Needs attention
                  </h2>
                </CardTitle>
                <CardDescription>
                  {presentation === "page"
                    ? "Items to review with your advisor."
                    : "Review the recorded issues and confirm the next steps."}
                </CardDescription>
                <CardAction>
                  <Badge variant="destructive">{record.attention.length}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <AttentionReasons reasons={record.attention} />
              </CardContent>
            </Card>
          )}
          <PersonalDetails presentation={presentation} record={record} />
        </div>
        <div className="grid min-w-0 @lg:grid-cols-2 gap-6">
          <KeyDates record={record} />
          <Advisors presentation={presentation} record={record} />
        </div>
      </div>
    </div>
  );
}
