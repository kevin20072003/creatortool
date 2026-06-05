const { spawnSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const [users, tools, categories] = await Promise.all([
    prisma.user.count(),
    prisma.tool.count(),
    prisma.category.count(),
  ]);

  if (users === 0 || tools === 0 || categories === 0) {
    console.log("SQLite database is empty. Running seed...");
    const result = spawnSync(process.execPath, ["prisma/seed.js"], { stdio: "inherit" });
    if (result.status !== 0) process.exit(result.status || 1);
  } else {
    console.log("SQLite database already has seed data. Skipping seed.");
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
