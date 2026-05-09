import "dotenv/config";
import { Pool } from "pg";

function isTruthy(value) {
  return ["1", "true", "yes", "on", "require"].includes(
    String(value || "").toLowerCase(),
  );
}

const connectionString = process.env.DATABASE_URL?.trim();
const host = process.env.DB_HOST?.trim();

const poolConfig = connectionString
  ? {
      connectionString,
    }
  : {
      user: process.env.DB_USER,
      host,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT) || 5432,
    };

const shouldUseSsl =
  isTruthy(process.env.DB_SSL) ||
  Boolean(connectionString && /sslmode=require/i.test(connectionString)) ||
  Boolean(host && host.includes("neon.tech"));

if (shouldUseSsl) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

export const pool = new Pool(poolConfig);
