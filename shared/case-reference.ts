import { z } from "zod";

const referencePattern = /^CASE-[1-9]\d*$/i;

/** Human-facing app references coexist with immutable UUIDs for existing links. */
export const caseReferenceSchema = z.union([
  z.uuid(),
  z
    .string()
    .regex(referencePattern)
    .transform((value) => value.toUpperCase()),
]);
