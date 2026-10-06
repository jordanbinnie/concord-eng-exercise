# Concord — Visa Tracking

A visa dashboard with demo views for HR, advisors, and beneficiaries.

## How to run it

With Bun installed and Docker running:

```bash
bun install
bun run setup-database
bun run dev:api
```

In another terminal:

```bash
bun run dev
```

Open the URL printed by Vite. Use the sidebar switcher to try each role.

See [NOTES.MD](NOTES.MD) for what I built and the current limitations.
