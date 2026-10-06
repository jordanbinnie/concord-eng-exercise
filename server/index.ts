import "dotenv/config";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { createDb } from "./db/client";
import { resolveDevUser } from "./dev-auth";
import { appRouter } from "./router/index";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Copy .env.example to .env first.");
}

const connection = createDb(databaseUrl);
const server = createHTTPServer({
  router: appRouter,
  // Fake auth: the switcher sends x-dev-user-id, which resolveDevUser checks
  // against the seed allowlist and database. Never trust a client-supplied role.
  // Replace this resolver with real session verification when adding real auth.
  createContext: async ({ req }) => ({
    db: connection.db,
    user: await resolveDevUser(
      connection.db,
      req.headers["x-dev-user-id"]?.toString()
    ),
  }),
});
const port = 3001;
server.listen(port, "127.0.0.1", () => {
  console.log(`tRPC API listening on http://localhost:${port}`);
});

/** Closes the HTTP and PostgreSQL connections during shutdown. */
function shutdown() {
  server.close();
  void connection.close();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
