import { useEffect, useRef } from "react";
import {
  EMPLOYEE_COLUMNS,
  type EmployeeField,
  type EmployeeRecord,
} from "../data/employee-schema";
import { needsHrFollowUp } from "../data/hr-view";
import { EmployeeReviewContent } from "./employee-review";

const FIELD_LABELS: Record<EmployeeField, string> = {
  employee_id: "ID",
  full_name: "Name",
  email: "Email",
  company: "Company",
  department: "Department",
  job_title: "Job title",
  nationality: "Nationality",
  work_location: "Work location",
  visa_type: "Visa type",
  profile_status: "Profile status",
  case_status: "Case status",
  profile_completion_pct: "Profile completion (%)",
  filed_at: "Filed",
  granted_at: "Granted",
  expires_at: "Expires",
  passport_expiry: "Passport expiry",
  assigned_advisor: "Assigned advisor",
  last_updated: "Last updated",
};

/** Shows every source field with its normalized value and any reasons for review. */
export function EmployeeDetailsContent({ record }: { record: EmployeeRecord }) {
  return (
    <>
      {needsHrFollowUp(record) && (
        <p className="follow-up">Follow up with advisor</p>
      )}
      <p>
        {record.needsReview
          ? `Needs review · ${record.issues.length} data issues`
          : "No data review needed"}
      </p>
      <dl className="employee-fields">
        {EMPLOYEE_COLUMNS.map((field) => {
          const issues = record.issues.filter((issue) =>
            issue.fields.includes(field)
          );
          const normalized = record.normalized[field];
          const raw = record.raw[field];
          return (
            <div className="employee-field" key={field}>
              <dt>{FIELD_LABELS[field]}</dt>
              <dd>
                <span className="source-value">{normalized ?? raw}</span>
                {normalized !== null && String(normalized) !== raw && (
                  <small className="original-field">
                    Original: <span className="source-value">{raw}</span>
                  </small>
                )}
                {normalized === null && raw && (
                  <small className="unresolved-date">
                    Original value · not validated
                  </small>
                )}
                {issues.map((issue) => (
                  <p
                    className="field-issue"
                    key={`${issue.code}:${issue.fields.join(",")}`}
                  >
                    {issue.message}
                    {issue.relatedRowIds?.length
                      ? ` Related CSV lines: ${issue.relatedRowIds.map((id) => id.replace("csv-row-", "")).join(", ")}.`
                      : ""}
                  </p>
                ))}
              </dd>
            </div>
          );
        })}
      </dl>
    </>
  );
}

/** Shows a simple non-modal popover; Escape, clicking outside or Close dismisses it. */
export function EmployeeDetails({
  record,
  onClose,
  view,
  visibleRowIds,
}: {
  record: EmployeeRecord;
  onClose: () => void;
  view: "details" | "validation";
  visibleRowIds: ReadonlySet<string>;
}) {
  const popoverRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const trigger = document.activeElement;
    closeRef.current?.focus();
    /** Dismisses the popover when Escape is pressed. */
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    /** Dismisses the popover when a pointer is pressed outside its content. */
    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !popoverRef.current?.contains(event.target)
      ) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      if (trigger instanceof HTMLElement) {
        trigger.focus();
      }
    };
  }, [onClose]);

  return (
    <section
      aria-labelledby="employee-details-title"
      className="employee-popover"
      ref={popoverRef}
      role="dialog"
    >
      <header className="employee-panel-header">
        <div>
          <h2 id="employee-details-title">
            {view === "validation" ? "Data validation" : "Employee details"}
          </h2>
          <p>{record.normalized.full_name ?? record.raw.full_name}</p>
        </div>
        <button onClick={onClose} ref={closeRef} type="button">
          Close
        </button>
      </header>
      {view === "validation" ? (
        <EmployeeReviewContent record={record} visibleRowIds={visibleRowIds} />
      ) : (
        <EmployeeDetailsContent record={record} />
      )}
    </section>
  );
}
