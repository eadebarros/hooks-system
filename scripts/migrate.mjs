// Aplica as migrações SQL de ./drizzle. Usa só dependências de produção,
// então roda no pre-deploy do Railway sem precisar do drizzle-kit.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não configurada.");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
await sql.end();
console.log("Migrações aplicadas.");
