import type { EmployeeRecord } from "../data/employee-schema";

/** Shows the row's data validation status and opens its issues on request. */
export function EmployeeReview({
  record,
  isOpen,
  onOpen,
}: {
  record: EmployeeRecord;
  isOpen: boolean;
  onOpen: () => void;
}) {
  if (!record.needsReview) {
    return <span className="review-clear">No issues found</span>;
  }

  return (
    <button
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className="review-button"
      onClick={onOpen}
      type="button"
    >
      Check data ({record.issues.length})
      <span className="sr-only"> for {record.raw.full_name}</span>
    </button>
  );
}

/** Lists review reasons alongside their original and normalized field values. */
export function EmployeeReviewContent({
  record,
  visibleRowIds,
}: {
  record: EmployeeRecord;
  visibleRowIds: ReadonlySet<string>;
}) {
  return (
    <ul className="review-issues">
      {record.issues.map((issue) => (
        <li key={`${issue.code}:${issue.fields.join(",")}`}>
          <p className="review-reason">{issue.message}</p>
          <dl>
            {issue.fields.map((field) => (
              <div className="review-field" key={field}>
                <dt>{field.replaceAll("_", " ")}</dt>
                <dd>
                  Original:{" "}
                  <span className="source-value">
                    {record.raw[field] || "(blank)"}
                  </span>
                  <br />
                  Normalized:{" "}
                  {record.normalized[field] ?? "Unresolved / missing"}
                </dd>
              </div>
            ))}
          </dl>
          {issue.relatedRowIds && (
            <p className="review-related">
              Related records:{" "}
              {issue.relatedRowIds.map((rowId) =>
                visibleRowIds.has(rowId) ? (
                  <a href={`#${rowId}`} key={rowId}>
                    CSV line {rowId.replace("csv-row-", "")}
                  </a>
                ) : (
                  <span key={rowId}>
                    CSV line {rowId.replace("csv-row-", "")} (outside this view)
                  </span>
                )
              )}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
