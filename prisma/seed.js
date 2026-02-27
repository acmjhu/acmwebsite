const { Client } = require("pg");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { existsSync } = require("fs");

// Load .env.local for local development (mirrors prisma.config.ts behavior)
if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}

const email = process.env.ADMIN_EMAIL || "admin@example.com";
const password = process.env.ADMIN_PASSWORD || "changeme";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const hashedPassword = bcrypt.hashSync(password, 12);

  await client.query(
    `INSERT INTO admins (id, email, password_hash, created_at)
     VALUES (gen_random_uuid(), $1, $2, NOW())
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email, hashedPassword],
  );

  console.log(`Seeded admin user: ${email}`);
  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
