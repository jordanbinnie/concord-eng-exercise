import { z } from "zod";
import { caseReferenceSchema } from "../../../shared/case-reference";

export const casePageInput = z.object({
  pageIndex: z.number().int().min(0).max(1_000_000).default(0),
  pageSize: z.number().int().min(1).max(100).default(10),
  cursor: z.number().int().min(0).max(1_000_000).optional(),
  search: z.string().trim().max(200).default(""),
  status: z
    .enum(["all", "pre-assessment", "in-progress", "filed", "approved"])
    .default("all"),
  group: z.enum(["monitored", "needs-action", "overdue"]).optional(),
  needsAttention: z.boolean().default(false),
  sort: z
    .object({
      id: z.enum([
        "Employee ID",
        "Name",
        "Email",
        "Company",
        "Visa type",
        "Status",
        "Needs attention",
        "Deadline",
      ]),
      desc: z.boolean(),
    })
    .optional(),
});

export const caseByIdInput = z.object({ id: caseReferenceSchema });
