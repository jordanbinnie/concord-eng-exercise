# Notes

The original CSV validation and HR view, built at Concord's office, are in commit `a13c6df`, along with the notes from that version. The notes below cover the work I added afterwards.

## What I added afterwards

After the on-site exercise, I built out a database-backed version of the app.

- Replaced the CSV data with PostgreSQL and Drizzle. The setup script applies the schema directly and seeds the demo data.
- Added users, companies, beneficiary profiles, cases, visa types, jurisdictions, and case advisors. There is one case per beneficiary, and a case can have multiple advisors. There is also an information table for questions and JSON answers.
- Added tRPC with separate routers, Zod input validation, and types inferred from the router through to the frontend. The case queries and review logic live in separate functions under `server/utils/cases`.
- Added a fake user switcher with one HR user, advisor, and beneficiary. Private procedures require a selected demo user, and the API limits cases by company, advisor assignment, or beneficiary ownership.
- Built the UI with shadcn, Base UI, and Tailwind. HR and advisors have a searchable case table, status summaries, a needs-attention filter, and a case details side panel. Beneficiaries see their own case directly.
- Moved pagination, search, sorting, and attention filtering into PostgreSQL. The table loads 10 cases at a time, while a separate query provides totals across all accessible cases.
- Added TanStack Query.
- Added review flags for RFEs, passports expiring before the recorded visa expiry, incomplete profiles on unfiled cases, and active cases with no update for more than 30 days.
- Added a profile completion percentage based on nationality, passport expiry, job title, department, and work location. Each field counts equally, and the UI shows which are missing. This measures how much information has been provided, not whether it's been verified.
- Seeded 41 fictional users and 37 cases across two companies, including examples for each review flag and cases with multiple flags. Rerunning the seed refreshes the sample records without duplicating them.

You can swap between HR, Beneficiary and Advisor roles.


## How to run it

With Docker running:

```bash
bun install
bun run setup-database
bun run dev:api
```

In another terminal:

```bash
bun run dev
```
