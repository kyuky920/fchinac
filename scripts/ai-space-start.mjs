import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import mysql from "mysql2/promise";

const root = process.cwd();
const migrationFiles = [
  "001_initial_schema.sql",
  "003_auth_schema.sql",
  "004_language_management.sql",
  "005_member_management.sql",
  "006_legacy_supported_locales.sql",
  "007_registration_profile_and_legal.sql",
  "008_legacy_password_scheme.sql",
  "009_admin_content_and_lectures.sql",
];

function resolveDatabaseUrl() {
  const directUrl =
    process.env.DATABASE_URL ??
    process.env.MYSQL_URL ??
    process.env.MYSQL_DATABASE_URL ??
    process.env.MYSQL_PUBLIC_URL ??
    process.env.MARIADB_URL ??
    process.env.DB_URL;

  if (directUrl) return directUrl;

  const host =
    process.env.MYSQL_HOST ??
    process.env.MYSQLHOST ??
    process.env.MARIADB_HOST ??
    process.env.DATABASE_HOST ??
    process.env.DB_HOST;
  const port =
    process.env.MYSQL_PORT ??
    process.env.MYSQLPORT ??
    process.env.MARIADB_PORT ??
    process.env.DATABASE_PORT ??
    process.env.DB_PORT ??
    "3306";
  const user =
    process.env.MYSQL_USER ??
    process.env.MYSQLUSER ??
    process.env.MARIADB_USER ??
    process.env.DATABASE_USER ??
    process.env.DB_USER;
  const password =
    process.env.MYSQL_PASSWORD ??
    process.env.MYSQLPASSWORD ??
    process.env.MARIADB_PASSWORD ??
    process.env.DATABASE_PASSWORD ??
    process.env.DB_PASSWORD;
  const database =
    process.env.MYSQL_DATABASE ??
    process.env.MYSQLDATABASE ??
    process.env.MYSQL_DB ??
    process.env.MARIADB_DATABASE ??
    process.env.DATABASE_NAME ??
    process.env.DB_DATABASE ??
    process.env.DB_NAME;

  if (!host || !user || password === undefined || !database) return undefined;

  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}

async function applyMigrations(databaseUrl) {
  const connection = await mysql.createConnection({
    uri: databaseUrl,
    multipleStatements: true,
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        migration_name VARCHAR(191) PRIMARY KEY,
        applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    for (const migrationName of migrationFiles) {
      const [rows] = await connection.execute(
        "SELECT 1 FROM schema_migrations WHERE migration_name = ? LIMIT 1",
        [migrationName],
      );
      if (rows.length > 0) continue;

      const migrationPath = path.join(root, "database", "migrations", migrationName);
      const source = await readFile(migrationPath, "utf8");
      const sql = source.replace(/^USE fchinac_dev;\s*/im, "");
      await connection.query(sql);
      await connection.execute(
        "INSERT INTO schema_migrations (migration_name) VALUES (?)",
        [migrationName],
      );
      console.log(`[database] applied ${migrationName}`);
    }
  } finally {
    await connection.end();
  }
}

const databaseUrl = resolveDatabaseUrl();
if (databaseUrl) {
  await applyMigrations(databaseUrl);
} else {
  console.warn("[database] no managed database environment variables were found");
}

if (process.env.AI_SPACE_MIGRATE_ONLY === "true") {
  process.exit(0);
}

process.env.HOSTNAME = "0.0.0.0";
await import(pathToFileURL(path.join(root, "server.js")).href);
