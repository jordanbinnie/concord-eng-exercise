import { demoBeneficiaries } from "./beneficiaries";
import type { CasePlan } from "./case-plans";
import { casePlans } from "./case-plans";

/** Fails before writing if fictional records contradict their own recorded timeline. */
export function validateSeed(plans: CasePlan[] = casePlans) {
  const ids = new Set<number>();
  for (const plan of plans) {
    if (ids.has(plan.case)) {
      throw new Error(`Duplicate CASE-${plan.case}`);
    }
    ids.add(plan.case);
    const person = demoBeneficiaries.find(
      (employee) => employee.user === plan.employee
    );
    if (
      !(person && plan.advisors.length) ||
      plan.advisors.some((id) => ![3, 6].includes(id))
    ) {
      throw new Error(`Invalid ownership or assignments for CASE-${plan.case}`);
    }
    validateTimeline(plan);
    validateStatus(plan);
    if (plan.status === "RFE Issued" && person.visa !== "h1b") {
      throw new Error("This fixture only records US requests for evidence");
    }
  }
}

function validateTimeline(plan: CasePlan) {
  if (
    plan.created < plan.updated ||
    plan.updated < 0 ||
    (plan.target !== undefined &&
      plan.target !== null &&
      plan.target < -plan.updated)
  ) {
    throw new Error(`Invalid update or task timeline for CASE-${plan.case}`);
  }
  if (
    plan.filed !== undefined &&
    (plan.created < plan.filed + 7 || plan.filed < plan.updated)
  ) {
    throw new Error(`Invalid filing timeline for CASE-${plan.case}`);
  }
}

function validateStatus(plan: CasePlan) {
  if (
    plan.status === "Approved" &&
    (plan.filed === undefined ||
      plan.approved === undefined ||
      plan.expires === undefined)
  ) {
    throw new Error(`Missing recorded approval facts for CASE-${plan.case}`);
  }
  if (
    plan.approved !== undefined &&
    (plan.filed === undefined ||
      plan.approved > plan.filed ||
      plan.approved < plan.updated ||
      (plan.expires ?? 0) <= -plan.approved)
  ) {
    throw new Error(`Invalid approval timeline for CASE-${plan.case}`);
  }
  if (
    ["Filed", "RFE Issued"].includes(plan.status) &&
    plan.filed === undefined
  ) {
    throw new Error(`Missing filing for CASE-${plan.case}`);
  }
  if (
    ["Pre-assessment", "In progress"].includes(plan.status) &&
    (plan.filed !== undefined ||
      plan.approved !== undefined ||
      plan.expires !== undefined)
  ) {
    throw new Error(
      `Unfiled CASE-${plan.case} must not have an invented outcome`
    );
  }
}
