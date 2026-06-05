const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function ensureColumn(table, column, sql) {
  const columns = await prisma.$queryRawUnsafe(`PRAGMA table_info("${table}")`);
  if (!columns.some((item) => item.name === column)) {
    await prisma.$executeRawUnsafe(sql);
  }
}

async function main() {
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AdminLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await ensureColumn("Tool", "iconName", `ALTER TABLE "Tool" ADD COLUMN "iconName" TEXT`);
  await ensureColumn("Tool", "customAds", `ALTER TABLE "Tool" ADD COLUMN "customAds" BOOLEAN NOT NULL DEFAULT false`);
  await ensureColumn("Tool", "scanType", `ALTER TABLE "Tool" ADD COLUMN "scanType" TEXT`);
  await ensureColumn("Tool", "frameRate", `ALTER TABLE "Tool" ADD COLUMN "frameRate" REAL`);
  await ensureColumn("Tool", "fieldRate", `ALTER TABLE "Tool" ADD COLUMN "fieldRate" REAL`);
  await ensureColumn("Tool", "videoFormatPreset", `ALTER TABLE "Tool" ADD COLUMN "videoFormatPreset" TEXT`);
  await ensureColumn("Tool", "interlaceWarnings", `ALTER TABLE "Tool" ADD COLUMN "interlaceWarnings" BOOLEAN NOT NULL DEFAULT true`);
  await ensureColumn("Tool", "onlineDeliveryRecommendation", `ALTER TABLE "Tool" ADD COLUMN "onlineDeliveryRecommendation" BOOLEAN NOT NULL DEFAULT true`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
