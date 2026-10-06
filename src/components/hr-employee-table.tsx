import { useCallback, useState } from "react";
import type { EmployeeRecord } from "../data/employee-schema";
import { needsHrFollowUp } from "../data/hr-view";
import { EmployeeDetails } from "./employee-details";
import { EmployeeReview } from "./employee-review";

/** Shows HR fields and separate case-follow-up and data-review indicators. */
export function HrEmployeeTable({
  records,
  emptyMessage = "No employee records for this company.",
}: {
  records: EmployeeRecord[];
  emptyMessage?: string;
}) {
  const [popover, setPopover] = useState<{
    record: EmployeeRecord;
    view: "details" | "validation";
  } | null>(null);
  const closeDetails = useCallback(() => setPopover(null), []);
  const visibleRowIds = new Set(records.map((record) => record.rowId));
  if (!records.length) {
    return <p role="status">{emptyMessage}</p>;
  }
  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">
          Employee visa cases for the selected company
        </caption>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Case Status</th>
            <th scope="col">Expires</th>
            <th scope="col">Attention</th>
            <th scope="col">Data validation</th>
            <th scope="col">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((row) => (
            <tr id={row.rowId} key={row.rowId}>
              <td>{row.normalized.employee_id ?? row.raw.employee_id}</td>
              <td>{row.normalized.full_name ?? row.raw.full_name}</td>
              <td>{row.normalized.email ?? row.raw.email}</td>
              <td>{row.normalized.case_status ?? row.raw.case_status}</td>
              <td>
                {row.normalized.expires_at ?? row.raw.expires_at}
                {row.raw.expires_at && !row.normalized.expires_at && (
                  <small className="unresolved-date">
                    Original value · needs review
                  </small>
                )}
              </td>
              <td>
                {needsHrFollowUp(row) && (
                  <span className="follow-up">Follow up with advisor</span>
                )}
              </td>
              <td>
                <EmployeeReview
                  isOpen={
                    popover?.record.rowId === row.rowId &&
                    popover.view === "validation"
                  }
                  onOpen={() => setPopover({ record: row, view: "validation" })}
                  record={row}
                />
              </td>
              <td>
                <button
                  aria-expanded={
                    popover?.record.rowId === row.rowId &&
                    popover.view === "details"
                  }
                  aria-haspopup="dialog"
                  className="details-button"
                  onClick={() => setPopover({ record: row, view: "details" })}
                  type="button"
                >
                  See more details
                  <span className="sr-only"> for {row.raw.full_name}</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {popover && (
        <EmployeeDetails
          key={`${popover.record.rowId}:${popover.view}`}
          onClose={closeDetails}
          record={popover.record}
          view={popover.view}
          visibleRowIds={visibleRowIds}
        />
      )}
    </div>
  );
}
