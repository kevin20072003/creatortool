const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function readStatements() {
  const migrationPath = path.join(process.cwd(), "prisma", "migrations", "20260605150000_init", "migration.sql");
  const sql = fs
    .readFileSync(migrationPath, "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function main() {
  for (const statement of readStatements()) {
    await prisma.$executeRawUnsafe(statement);
  }
  console.log("SQLite schema initialized.");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
