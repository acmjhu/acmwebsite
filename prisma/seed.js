const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

require("dotenv/config");

const email = process.env.ADMIN_EMAIL || "admin@example.com";
const password = process.env.ADMIN_PASSWORD || "changeme";

const dbPath = path.join(__dirname, "..", "dev.db");
const db = new Database(dbPath);

const hashedPassword = bcrypt.hashSync(password, 12);
const id = require("crypto").randomUUID().replace(/-/g, "").slice(0, 25);
const now = new Date().toISOString();

const stmt = db.prepare(`
  INSERT INTO admins (id, email, password, name, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(email) DO UPDATE SET password = excluded.password, updatedAt = excluded.updatedAt
`);

stmt.run(id, email, hashedPassword, "Admin", now, now);

console.log(`Seeded admin user: ${email}`);
db.close();
