import { z } from "zod";

export const casePageInput = z.object({
  pageIndex: z.number().int().min(0).max(1_000_000).default(0),
  pageSize: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(200).default(""),
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
      ]),
      desc: z.boolean(),
    })
    .optional(),
});

export const caseByIdInput = z.object({ id: z.uuid() });
