import { inArray } from "drizzle-orm";
import { caseTasks } from "../db/schema";
import { demoId } from "./data";
import { seedDate, seedDateOnly } from "./dates";
import type { SeedCaseContext, SeedTransaction } from "./types";
import { workflows } from "./workflows";

export async function seedCaseTasks(
  tx: SeedTransaction,
  context: SeedCaseContext
) {
  const { plan, id, hrId, advisorId, employeeId, values, now } = context;
  const taskIds = [
    demoId(6, plan.case * 10 + 1),
    demoId(6, plan.case * 10 + 2),
  ];
  await tx.delete(caseTasks).where(inArray(caseTasks.id, taskIds));
  if (plan.task) {
    const task = workflows[plan.task];
    const owners = { hr: hrId, advisor: advisorId, employee: employeeId };
    await tx.insert(caseTasks).values({
      id: taskIds[0],
      caseId: id,
      title: task.title,
      description: task.description,
      assignedToUserId: owners[task.owner],
      targetDate: seedDateOnly(now, plan.target ?? null),
      createdAt: values.updatedAt,
    });
  }
  if (plan.filed !== undefined) {
    await tx.insert(caseTasks).values({
      id: taskIds[1],
      caseId: id,
      title: "Review application draft",
      description:
        "The application draft was reviewed before the recorded filing.",
      assignedToUserId: advisorId,
      completedAt: seedDate(now, -(plan.filed + 1)),
      createdAt: seedDate(now, -(plan.filed + 7)),
      targetDate: seedDateOnly(now, -(plan.filed + 1)),
    });
  }
}
