import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Conexão preguiçosa: o build do Next não precisa de DATABASE_URL.
let instance: PostgresJsDatabase<typeof schema> | undefined;

export function db() {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL não configurada.");
    instance = drizzle(postgres(url, { max: 5 }), { schema });
  }
  return instance;
}

export { schema };
