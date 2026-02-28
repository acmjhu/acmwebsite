const { Client } = require("pg");
const dotenv = require("dotenv");
const { existsSync } = require("fs");

// Load .env.local for local development (mirrors seed.js behavior)
if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}

const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86_400_000);
const daysFromNow = (d) => new Date(now.getTime() + d * 86_400_000);
const hoursLater = (base, h) => new Date(base.getTime() + h * 3_600_000);
const minutesLater = (base, m) => new Date(base.getTime() + m * 60_000);

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // ── Events ─────────────────────────────────────────────────────────────────
  console.log("Seeding events...");

  const pastEvent1Start = daysAgo(60);
  const pastEvent2Start = daysAgo(90);
  const upcomingEvent1Start = daysFromNow(7);
  const upcomingEvent2Start = daysFromNow(21);

  const events = [
    {
      name: "Intro to Git & GitHub Workshop",
      description:
        "Learn the fundamentals of version control with Git and collaborative development workflows on GitHub. Perfect for beginners and a great refresher for everyone. No prior experience required.",
      location: "Malone 228",
      category: "Workshop",
      link: null,
      startTime: pastEvent1Start,
      endTime: hoursLater(pastEvent1Start, 2),
    },
    {
      name: "Fall Coding Circle",
      description:
        "A casual weekly meetup to hack on personal projects, share ideas, and get help from peers. Bring your laptop and anything you've been working on — all skill levels welcome.",
      location: "Hackerman B17",
      category: "Coding Circle",
      link: null,
      startTime: pastEvent2Start,
      endTime: hoursLater(pastEvent2Start, 2),
    },
    {
      name: "Spring Hackathon Kickoff",
      description:
        "Kick off HopHacks Spring 2026! Meet your teammates, brainstorm project ideas, and get hacking. Pizza will be provided. Come ready to build something cool.",
      location: "Levering Hall, Great Hall",
      category: "Social",
      link: "https://hophacks.com",
      startTime: upcomingEvent1Start,
      endTime: hoursLater(upcomingEvent1Start, 3),
    },
    {
      name: "Machine Learning Talk: Neural Networks in Practice",
      description:
        "Prof. Sarah Kim from the CS Department will give an accessible overview of how neural networks are being applied to real-world problems today. A live coding demo and Q&A session will follow.",
      location: "Malone 107",
      category: "Talk",
      link: null,
      startTime: upcomingEvent2Start,
      endTime: minutesLater(upcomingEvent2Start, 90),
    },
  ];

  for (const e of events) {
    await client.query(
      `INSERT INTO events (id, name, description, location, category, link, start_time, end_time)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)`,
      [
        e.name,
        e.description,
        e.location,
        e.category,
        e.link,
        e.startTime,
        e.endTime,
      ],
    );
  }

  console.log(`  ✓ Inserted ${events.length} events (2 past, 2 upcoming).`);

  // ── Announcements ──────────────────────────────────────────────────────────
  console.log("Seeding announcements...");

  const announcements = [
    {
      title: "Officer Applications Are Now Closed",
      content:
        "Thank you to everyone who applied for officer positions for the Spring 2026 semester. Applications are now closed and we will be reaching out to candidates in the coming weeks.",
      isActive: false,
    },
    {
      title: "Fall 2025 General Body Meeting Recap",
      content:
        "Thanks to everyone who attended our Fall GBM! Slides and a recording are available on our Google Drive. Stay tuned for announcements about upcoming workshops and speaker events.",
      isActive: false,
    },
    {
      title: "Officer Applications Open for Fall 2026",
      content:
        "Want to help run JHU ACM? Applications for Fall 2026 officer positions are now open! Roles include President, VP, Treasurer, Secretary, Events Chair, and Webmaster. Apply by March 15 via the link in our Discord.",
      isActive: true,
    },
    {
      title: "Spring 2026 Membership Drive",
      content:
        "ACM membership is free for all JHU students! Sign up at our next GBM or fill out the Google Form linked in our Discord to stay in the loop on events, workshops, and opportunities.",
      isActive: true,
    },
  ];

  for (const a of announcements) {
    await client.query(
      `INSERT INTO announcements (id, title, content, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3)`,
      [a.title, a.content, a.isActive],
    );
  }

  console.log(
    `  ✓ Inserted ${announcements.length} announcements (2 active, 2 inactive).`,
  );

  // ── Officers ───────────────────────────────────────────────────────────────
  console.log("Seeding officers...");

  const officers = [
    {
      name: "Alex Chen",
      role: "President",
      bio: "Senior CS major passionate about distributed systems and open-source software. Previously interned at Google. Loves hiking and bad puns.",
      email: "achen@jhu.edu",
      linkedin: "https://linkedin.com/in/alex-chen-jhu",
      isCurrent: true,
      displayOrder: 1,
      termStart: new Date("2025-09-01"),
      termEnd: new Date("2026-05-31"),
    },
    {
      name: "Maya Patel",
      role: "Vice President",
      bio: "Junior studying CS and Applied Math. Interested in ML research and making ACM events more accessible. Avid runner and amateur photographer.",
      email: "mpatel@jhu.edu",
      linkedin: null,
      isCurrent: true,
      displayOrder: 2,
      termStart: new Date("2025-09-01"),
      termEnd: new Date("2026-05-31"),
    },
    {
      name: "Jordan Kim",
      role: "Treasurer",
      bio: "Sophomore double-majoring in CS and Economics. Manages ACM's budget and coordinates with the university for event funding. Big fan of board games.",
      email: "jkim@jhu.edu",
      linkedin: "https://linkedin.com/in/jordan-kim",
      isCurrent: true,
      displayOrder: 3,
      termStart: new Date("2025-09-01"),
      termEnd: new Date("2026-05-31"),
    },
    {
      name: "Sam Rivera",
      role: "Secretary",
      bio: "Junior in CS. Keeps meeting notes, manages communications, and helps coordinate the officer team. Also co-runs the ACM newsletter.",
      email: "srivera@jhu.edu",
      linkedin: null,
      isCurrent: true,
      displayOrder: 4,
      termStart: new Date("2025-09-01"),
      termEnd: new Date("2026-05-31"),
    },
    {
      name: "Taylor Brooks",
      role: "Events Chair",
      bio: "Senior CS major who loves bringing engaging workshops and speaker talks to campus. Serial hackathon participant and coffee enthusiast.",
      email: "tbrooks@jhu.edu",
      linkedin: "https://linkedin.com/in/taylor-brooks",
      isCurrent: true,
      displayOrder: 5,
      termStart: new Date("2025-09-01"),
      termEnd: new Date("2026-05-31"),
    },
    {
      name: "Chris Wang",
      role: "President",
      bio: "Graduated in 2025. Led ACM through a period of rapid growth, tripling event attendance and launching the lineage mentorship program. Now at Jane Street.",
      email: "cwang@alumni.jhu.edu",
      linkedin: "https://linkedin.com/in/chris-wang-jhu",
      isCurrent: false,
      displayOrder: 10,
      termStart: new Date("2024-09-01"),
      termEnd: new Date("2025-05-31"),
    },
  ];

  for (const o of officers) {
    await client.query(
      `INSERT INTO officers
         (id, name, role, bio, email, linkedin, is_current, display_order, term_start, term_end)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        o.name,
        o.role,
        o.bio,
        o.email,
        o.linkedin,
        o.isCurrent,
        o.displayOrder,
        o.termStart,
        o.termEnd,
      ],
    );
  }

  console.log(
    `  ✓ Inserted ${officers.length} officers (5 current, 1 alumni).`,
  );

  // ── Lineage Members ────────────────────────────────────────────────────────
  // Use CTEs so we can reference newly inserted IDs for mentor relationships
  // without needing a second round-trip.
  console.log("Seeding lineage members...");

  // Lambda Tree: Alice → Bob, Dave; Bob → Carol
  await client.query(`
    WITH
      alice AS (
        INSERT INTO lineage_members (id, name, graduation_year, role, tree_name)
        VALUES (gen_random_uuid(), 'Alice Nguyen', 2019, 'President', 'Lambda Tree')
        RETURNING id
      ),
      bob AS (
        INSERT INTO lineage_members (id, name, graduation_year, role, tree_name, mentor_id)
        SELECT gen_random_uuid(), 'Bob Martinez', 2021, 'Vice President', 'Lambda Tree', id FROM alice
        RETURNING id
      ),
      carol AS (
        INSERT INTO lineage_members (id, name, graduation_year, tree_name, mentor_id)
        SELECT gen_random_uuid(), 'Carol Thompson', 2023, 'Lambda Tree', id FROM bob
        RETURNING id
      ),
      dave AS (
        INSERT INTO lineage_members (id, name, graduation_year, tree_name, mentor_id)
        SELECT gen_random_uuid(), 'David Park', 2022, 'Lambda Tree', id FROM alice
        RETURNING id
      )
    SELECT 1
  `);

  // Sigma Tree: Eve → Frank; Frank → Grace, Henry
  await client.query(`
    WITH
      eve AS (
        INSERT INTO lineage_members (id, name, graduation_year, role, tree_name)
        VALUES (gen_random_uuid(), 'Eve Johnson', 2020, 'President', 'Sigma Tree')
        RETURNING id
      ),
      frank AS (
        INSERT INTO lineage_members (id, name, graduation_year, role, tree_name, mentor_id)
        SELECT gen_random_uuid(), 'Frank Liu', 2022, 'Events Chair', 'Sigma Tree', id FROM eve
        RETURNING id
      ),
      grace AS (
        INSERT INTO lineage_members (id, name, graduation_year, tree_name, mentor_id)
        SELECT gen_random_uuid(), 'Grace Williams', 2024, 'Sigma Tree', id FROM frank
        RETURNING id
      ),
      henry AS (
        INSERT INTO lineage_members (id, name, graduation_year, tree_name, mentor_id)
        SELECT gen_random_uuid(), 'Henry Okafor', 2025, 'Sigma Tree', id FROM frank
        RETURNING id
      )
    SELECT 1
  `);

  console.log(
    "  ✓ Inserted 2 lineages: Lambda Tree (4 members) and Sigma Tree (4 members).",
  );

  console.log("\nDone! All dummy data seeded successfully.");
  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
