const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Ensure db directory exists
const dbDir = path.join(process.cwd(), "db");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Push schema to create/update tables
console.log("Running prisma db push...");
execSync("npx prisma db push --skip-generate", { stdio: "inherit" });

// Check if DB has data, if not seed it
const dbPath = path.join(dbDir, "custom.db");
let needsSeed = !fs.existsSync(dbPath);

if (!needsSeed) {
  try {
    const { PrismaClient } = require("./node_modules/.prisma/client");
    const prisma = new PrismaClient();
    const count = prisma.resource.count();
    needsSeed = count === 0;
    prisma.$disconnect();
  } catch {
    needsSeed = true;
  }
}

if (needsSeed) {
  console.log("Seeding database...");
  execSync("node seed.js", { stdio: "inherit" });
}

// Start the server
console.log("Starting server...");
execSync("node .next/standalone/server.js", { stdio: "inherit" });