import { useEffect, useState } from "react";
import { Card } from "./components/card";
import { HrEmployeeTable } from "./components/hr-employee-table";
import type { EmployeeRecord } from "./data/employee-schema";
import {
  ALL_CASE_STATUSES,
  getCaseStatuses,
  getCompanies,
  getCompanyEmployees,
  MISSING_CASE_STATUS,
} from "./data/hr-view";
import { loadEmployees } from "./data/load-employees";
import type { DataError } from "./data/result";

/** Shows one company's employee cases, HR follow-ups and data-review issues. */
function App() {
  const [rows, setRows] = useState<EmployeeRecord[]>([]);
  const [company, setCompany] = useState("");
  const [caseStatus, setCaseStatus] = useState(ALL_CASE_STATUSES);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DataError | null>(null);

  useEffect(() => {
    loadEmployees().then((result) => {
      if (result.success) {
        setRows(result.data);
        setCompany(getCompanies(result.data)[0] ?? "");
      } else {
        setError(result.error);
      }
      setLoading(false);
    });
  }, []);

  const companies = getCompanies(rows);
  const companyEmployees = getCompanyEmployees(rows, company);
  const caseStatuses = getCaseStatuses(companyEmployees);
  const employees = getCompanyEmployees(rows, company, caseStatus, search);

  /** Resets row filters when the HR user switches companies. */
  function selectCompany(name: string) {
    setCompany(name);
    setCaseStatus(ALL_CASE_STATUSES);
    setSearch("");
  }

  return (
    <div className="page">
      <h1>{company || "HR visa tracking"}</h1>
      <p className="subtitle">Employee visa cases</p>
      <div className="company-filter">
        <label htmlFor="company">Company</label>
        <select
          disabled={loading || !companies.length}
          id="company"
          onChange={(event) => selectCompany(event.target.value)}
          value={company}
        >
          {!companies.length && (
            <option value="">
              {loading ? "Loading companies…" : "No companies available"}
            </option>
          )}
          {companies.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div className="employee-filters">
        <div className="filter-field">
          <label htmlFor="case-status-filter">Case status</label>
          <select
            disabled={loading || !companyEmployees.length}
            id="case-status-filter"
            onChange={(event) => setCaseStatus(event.target.value)}
            value={caseStatus}
          >
            <option value={ALL_CASE_STATUSES}>All statuses</option>
            {caseStatuses.map((status) => (
              <option key={status} value={status}>
                {status === MISSING_CASE_STATUS ? "Missing status" : status}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="employee-search">Search employees</label>
          <input
            disabled={loading || !companyEmployees.length}
            id="employee-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ID, name or email"
            type="search"
            value={search}
          />
        </div>
      </div>
      {loading && <p role="status">Loading employee records…</p>}
      {error && (
        <div className="load-error" role="alert">
          <strong>Unable to load employee records</strong>
          <p>{error.message}</p>
          <small>Error: {error.code}</small>
        </div>
      )}
      {!(loading || error) && (
        <>
          <div className="summary-cards">
            <Card label="Employees shown" value={employees.length} />
            <Card
              label="Need data review"
              value={employees.filter((row) => row.needsReview).length}
            />
          </div>
          <p className="review-help">
            RFE cases need follow-up with the advisor. Use the red Check data
            button to see validation issues. Uncertain dates have not been
            corrected.
          </p>
          <HrEmployeeTable
            emptyMessage={
              caseStatus || search.trim()
                ? "No employees match these filters."
                : "No employee records for this company."
            }
            key={`${company}:${caseStatus}:${search}`}
            records={employees}
          />
        </>
      )}
    </div>
  );
}

export default App;
