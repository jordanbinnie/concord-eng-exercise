import { inArray } from "drizzle-orm";
import { caseEvents } from "../db/schema";
import type { CasePlan } from "./case-plans";
import { demoId } from "./data";
import { seedDate } from "./dates";
import type { SeedCaseContext, SeedTransaction } from "./types";
import type { Workflow } from "./workflows";

function recordedUpdateTitle(plan: CasePlan) {
  if (plan.status === "RFE Issued") {
    return "Request for evidence recorded";
  }
  const titles: Partial<Record<Workflow, string>> = {
    missingCv: "CV and profile link requested",
    roleBrief: "Role details requested from HR",
    documents: "Outstanding documents requested",
    draft: "Application draft prepared for review",
  };
  const taskTitle = plan.task ? titles[plan.task] : undefined;
  if (taskTitle) {
    return taskTitle;
  }
  if (plan.status === "Pre-assessment") {
    return "Initial assessment request recorded";
  }
  if (plan.status === "Approved") {
    return "Visa record reviewed";
  }
  return "Case progress reviewed";
}

export async function seedCaseEvents(
  tx: SeedTransaction,
  context: SeedCaseContext
) {
  const { plan, id, hrId, advisorId, values, now } = context;
  const eventIds = Array.from({ length: 5 }, (_, index) =>
    demoId(7, plan.case * 10 + index)
  );
  await tx.delete(caseEvents).where(inArray(caseEvents.id, eventIds));
  const events = [
    {
      id: eventIds[0],
      caseId: id,
      actorUserId: hrId,
      title: "Case opened",
      occurredAt: values.createdAt,
    },
  ];
  if (plan.filed !== undefined) {
    events.push({
      id: eventIds[1],
      caseId: id,
      actorUserId: advisorId,
      title: "Application filing recorded",
      occurredAt: seedDate(now, -plan.filed),
    });
  }
  if (plan.approved !== undefined) {
    events.push({
      id: eventIds[2],
      caseId: id,
      actorUserId: advisorId,
      title: "Approval and visa expiry recorded",
      occurredAt: seedDate(now, -plan.approved),
    });
  }
  events.push({
    id: eventIds[3],
    caseId: id,
    actorUserId: advisorId,
    title: recordedUpdateTitle(plan),
    occurredAt: values.updatedAt,
  });
  await tx.insert(caseEvents).values(events);
}
