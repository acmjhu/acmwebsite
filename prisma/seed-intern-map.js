const { Client } = require("pg");
const dotenv = require("dotenv");
const { existsSync } = require("fs");

if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}

const samples = [
  {
    name: "Alex Chen",
    email: "achen1@jhu.edu",
    company: "Google",
    role: "Software Engineering Intern",
    term: "Summer 2026",
    year: "Junior",
    lat: 37.422,
    lng: -122.084,
    contact: "linkedin.com/in/alexchen",
    status: "approved",
  },
  {
    name: "Maya Patel",
    email: "mpatel3@jhu.edu",
    company: "Microsoft",
    role: "Software Engineering Intern",
    term: "Summer 2026",
    year: "Sophomore",
    lat: 47.642,
    lng: -122.137,
    contact: "mpatel3@jhu.edu",
    status: "approved",
  },
  {
    name: "Jordan Lee",
    email: "jlee22@jhu.edu",
    company: "Meta",
    role: "Data Science Intern",
    term: "Summer 2026",
    year: "Senior",
    lat: 37.484,
    lng: -122.148,
    contact: null,
    status: "approved",
  },
  {
    name: "Sam Rivera",
    email: "srivera@jhu.edu",
    company: "Amazon",
    role: "SDE Intern",
    term: "Summer 2026",
    year: "Junior",
    lat: 47.616,
    lng: -122.337,
    contact: "linkedin.com/in/samrivera",
    status: "approved",
  },
  {
    name: "Priya Nair",
    email: "pnair4@jhu.edu",
    company: "Apple",
    role: "Software Engineering Intern",
    term: "Summer 2026",
    year: "Junior",
    lat: 37.3346,
    lng: -122.009,
    contact: null,
    status: "approved",
  },
  {
    name: "Chris Wang",
    email: "cwang7@jhu.edu",
    company: "Jane Street",
    role: "Software Engineering Intern",
    term: "Summer 2026",
    year: "Senior",
    lat: 40.7128,
    lng: -74.006,
    contact: "cwang7@jhu.edu",
    status: "approved",
  },
  {
    name: "Taylor Brooks",
    email: "tbrooks@jhu.edu",
    company: "Citadel",
    role: "SWE Intern",
    term: "Summer 2026",
    year: "Junior",
    lat: 41.882,
    lng: -87.629,
    contact: null,
    status: "pending",
  },
  {
    name: "Olivia Kim",
    email: "okim2@jhu.edu",
    company: "Google",
    role: "Product Management Intern",
    term: "Fall 2026",
    year: "Sophomore",
    lat: 37.423,
    lng: -122.085,
    contact: "linkedin.com/in/oliviakim",
    status: "approved",
  },
];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  for (const s of samples) {
    await client.query(
      `INSERT INTO intern_map_entries
         (id, name, email, company, role, term, year, lat, lng, contact, photo_url, status, created_at, updated_at)
       VALUES
         (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, $10, NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [s.name, s.email, s.company, s.role, s.term, s.year, s.lat, s.lng, s.contact, s.status]
    );
  }

  console.log(`Seeded ${samples.length} intern map entries.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
