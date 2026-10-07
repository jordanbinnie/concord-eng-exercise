import {
  boolean,
  date,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type InformationAnswer = Exclude<JsonValue, null>;

export const userRole = pgEnum("user_role", ["beneficiary", "hr", "advisor"]);

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").references(() => companies.id),
    employeeId: text("employee_id"),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    role: userRole("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_company_employee_id_unique").on(
      table.companyId,
      table.employeeId
    ),
    index("users_company_id_idx").on(table.companyId),
  ]
);

export const beneficiaryProfiles = pgTable("beneficiary_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  nationality: text("nationality"),
  // Legacy stored flag; the API now calculates completion from the profile fields.
  profileComplete: boolean("profile_complete"),
  passportExpiry: date("passport_expiry", { mode: "string" }),
  department: text("department"),
  jobTitle: text("job_title"),
  workLocation: text("work_location"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const jurisdictions = pgTable("jurisdictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const visaTypes = pgTable(
  "visa_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    jurisdictionId: uuid("jurisdiction_id")
      .notNull()
      .references(() => jurisdictions.id),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("visa_types_jurisdiction_code_unique").on(
      table.jurisdictionId,
      table.code
    ),
  ]
);

export const caseAdvisors = pgTable(
  "case_advisors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("case_advisors_user_case_unique").on(
      table.userId,
      table.caseId
    ),
    index("case_advisors_case_id_idx").on(table.caseId),
  ]
);

export const cases = pgTable(
  "cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference"),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    beneficiaryUserId: uuid("beneficiary_user_id")
      .notNull()
      .references(() => users.id),
    visaTypeId: uuid("visa_type_id").references(() => visaTypes.id),
    status: text("status"),
    filedAt: date("filed_at", { mode: "string" }),
    approvedAt: date("approved_at", { mode: "string" }),
    expiresAt: date("expires_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("cases_company_id_idx").on(table.companyId),
    index("cases_beneficiary_user_id_idx").on(table.beneficiaryUserId),
    uniqueIndex("cases_reference_unique").on(table.reference),
    index("cases_visa_type_id_idx").on(table.visaTypeId),
  ]
);

export const caseTasks = pgTable(
  "case_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id),
    // Internal team targets; authority deadlines require an explicitly recorded source.
    targetDate: date("target_date", { mode: "string" }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("case_tasks_case_id_idx").on(table.caseId)]
);

export const caseEvents = pgTable(
  "case_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    title: text("title").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("case_events_case_id_idx").on(table.caseId)]
);

export const information = pgTable(
  "information",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id),
    question: text("question").notNull(),
    answer: jsonb("answer").$type<InformationAnswer>(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("information_case_id_idx").on(table.caseId)]
);
