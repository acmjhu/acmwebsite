# JHU ACM Website — Project Specification

## 1. Project Overview

A rebuild of the Johns Hopkins University ACM chapter website. The new site preserves the visual identity and core functionality of the original (blue/white color scheme, glassmorphic card design, gradient accents, clean professional aesthetic) while migrating to a modern, streamlined tech stack and a simplified page structure.

**Repository:** New repo (old GitHub repo retained as reference for design/content)

---

## 2. Tech Stack

| Layer        | Technology                          | Reasoning                                                                 |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------- |
| Framework    | **Next.js 14+ (Pages Router)**      | SSR/SSG support, API routes built-in, large ecosystem, Vercel-native      |
| Language     | **TypeScript**                      | Type safety, better DX, consistent with old codebase                      |
| Styling      | **Tailwind CSS 3.x**               | Utility-first, fast iteration, removes need for custom CSS files          |
| Database     | **NeonDB (Serverless PostgreSQL)**  | Serverless Postgres, generous free tier, branches for dev/staging          |
| ORM          | **Prisma**                          | Type-safe queries, auto-generated types, excellent migration tooling      |
| Deployment   | **Vercel**                          | Zero-config Next.js deploys, edge functions, preview deploys per PR       |
| Auth         | **None (public site)**              | No user accounts — admin dashboard uses a simple password-protected route |
| Admin Auth   | **NextAuth.js (Credentials only)**  | Lightweight; only used to gate the `/admin` routes for officers           |

### Key Architecture Decisions

- **No user authentication.** The old site had full user accounts (signup, login, profile, membership tracking). The new site removes all of this. Event signups collect name + email directly and store them in the database.
- **API Routes in Next.js.** The old site ran a separate Express backend (`acm_backend/`). The new site consolidates everything into Next.js API routes (`pages/api/`), eliminating the need for a separate server.
- **Server-side rendering for public pages.** Home, About, Events, and Lineages pages use `getServerSideProps` or `getStaticProps` to fetch data at build/request time, improving SEO and load performance.
- **Admin dashboard is password-protected.** A simple credentials-based NextAuth setup restricts `/admin` routes to authorized officers only. No public-facing auth flows.

---

## 3. Pages & Content Specification

### 3.1 Home Page (`/`)

The landing page and primary entry point. Should immediately communicate what JHU ACM is and direct visitors to key areas.

**Sections:**

1. **Hero Section** — Large banner with ACM logo, tagline ("Johns Hopkins ACM Chapter"), and a one-line mission summary. Animated gradient background matching old site's blue theme (`#003366` → `#0055a5`).
2. **Quick Links / Feature Cards** — 3–4 cards linking to: Events, About Us, Lineages. Each card has an icon, short description, and hover animation.
3. **Upcoming Events Preview** — Pulls the next 3 upcoming events from the database. Each shows event name, date, and location. "View All Events →" link to Events page.
4. **Announcements / News** (optional) — A small section for pinned announcements managed via admin dashboard.
5. **Footer** — Contact email (`jhuacmofficers@gmail.com`), Instagram link (`@jhuacm`), GitHub link, and copyright.

**Data requirements:** Upcoming events (from `events` table), optional announcements (from `announcements` table).

---

### 3.2 About + Contact Page (`/about`)

Combines the old About Us and Credits pages. Provides organizational info, officer profiles, and contact details.

**Sections:**

1. **Mission Statement** — ACM's mission and description of the JHU chapter. Reuse content from old site:
   - _"We are a student organization of the Johns Hopkins University dedicated to furthering the knowledge and advancement of computers and information technology through the free exchange of ideas and information."_
2. **Membership Benefits** — Summarize what members get: office access (Malone Hall), 50 GiB storage, email at acm.jhu.edu / jhuacm.org, VMs, SSH access, J-Card access 24/7, GitLab, workstations, printers, snacks, etc.
3. **Current Officers** — Grid of flip-cards (matching old site style) showing each officer's name, role, photo, bio, and LinkedIn. Pulled from database so it's easy to update year-to-year.
4. **Alumni / Past Officers** — Collapsible or separate section for historical officers.
5. **Contact Section** — Email (`jhuacmofficers@gmail.com`), Instagram (`@jhuacm`), and a simple contact form (name, email, message) that stores submissions or sends an email.
6. **Special Thanks** — Acknowledgment of JHU CS Department, ACM National Organization, contributors.

**Data requirements:** Officers (from `officers` table), alumni (from `officers` table filtered by `is_current = false`).

---

### 3.3 Events & Signup Page (`/events`)

Central hub for all ACM events. Replaces the old events page and removes the need for user accounts — signups are collected inline.

**Sections:**

1. **Upcoming Events** — List/grid of upcoming events, each showing:
   - Event name
   - Date & time (formatted nicely)
   - Location
   - Category tag (e.g., "Workshop", "Social", "Talk", "Coding Circle")
   - Brief description
   - **Signup form** (inline or modal): collects **name** and **email** only. On submit, stores in `event_signups` table and shows confirmation.
   - Optional external link (e.g., Zoom link, slides)
2. **Past Events Archive** — Collapsible or paginated list of past events, sorted reverse-chronologically. No signup form, just event details.
3. **Category Filter** — Filter/tab bar to filter events by category.

**Data requirements:** Events (from `events` table), signups (to `event_signups` table).

---

### 3.4 Lineages Page (`/lineages`)

A new page visualizing ACM officer mentor/mentee "family trees." Each officer mentors newer members, forming multi-generational trees.

**Sections:**

1. **Page Header** — Explanation of the lineage/family tree tradition at JHU ACM.
2. **Tree Visualization** — Interactive tree diagram(s) showing mentor → mentee relationships across years. Each node displays:
   - Name
   - Graduation year
   - Role/title (if officer)
   - Optional photo
3. **Search / Filter** — Search by name or filter by graduation year to find a person in the tree.
4. **Multiple Trees** — There may be multiple independent lineage trees (different "families"). Display them as separate trees or in a combined view with a selector.

**Implementation Notes:**

- Use a library like **D3.js**, **react-d3-tree**, or **reactflow** for tree rendering.
- Data is stored relationally with a self-referencing `mentor_id` foreign key.
- Admin dashboard provides an interface to add/edit lineage members and relationships.

**Data requirements:** Lineage members and relationships (from `lineage_members` table).

---

### 3.5 Admin Dashboard (`/admin`)

Password-protected area for ACM officers to manage site content. Gated by NextAuth.js credentials provider.

**Sub-pages / Tabs:**

1. **Dashboard Home** (`/admin`) — Overview stats: total members signed up, upcoming events count, recent signups.
2. **Event Management** (`/admin/events`)
   - Create new events (name, description, location, category, link, start/end datetime).
   - Edit / delete existing events.
   - View signup list for each event (name + email), with CSV export.
   - Upload attendance spreadsheet (Excel/CSV) to mark who actually attended.
3. **Officer Management** (`/admin/officers`)
   - Add / edit / remove officers (name, role, bio, LinkedIn, photo, term dates, current status).
   - Toggle `is_current` to move officers to alumni.
4. **Lineage Management** (`/admin/lineages`)
   - Add new lineage members (name, graduation year, role, photo).
   - Define mentor → mentee relationships.
   - Visual preview of tree structure.
5. **Announcements** (`/admin/announcements`)
   - Create / edit / delete homepage announcements.
   - Toggle visibility (active/inactive).
6. **Signups & Mailing List** (`/admin/signups`)
   - View all event signups across events.
   - Export mailing list (unique emails from all signups).

**Auth:** Single admin login using NextAuth.js Credentials provider. Store admin email + hashed password in `admins` table. Environment variable `NEXTAUTH_SECRET` for JWT signing.

---

## 4. Database Schema (NeonDB / PostgreSQL)

All tables use UUID primary keys and include `created_at` / `updated_at` timestamps.

### 4.1 `events`

| Column        | Type                     | Constraints                    | Description                          |
| ------------- | ------------------------ | ------------------------------ | ------------------------------------ |
| `id`          | `UUID`                   | PK, default `gen_random_uuid()`| Unique event identifier              |
| `name`        | `VARCHAR(255)`           | NOT NULL                       | Event title                          |
| `description` | `TEXT`                   |                                | Full event description               |
| `location`    | `VARCHAR(255)`           |                                | Venue / room                         |
| `category`    | `VARCHAR(50)`            | NOT NULL                       | e.g., Workshop, Talk, Social         |
| `link`        | `VARCHAR(500)`           |                                | External link (Zoom, slides, etc.)   |
| `start_time`  | `TIMESTAMPTZ`            | NOT NULL                       | Event start                          |
| `end_time`    | `TIMESTAMPTZ`            | NOT NULL                       | Event end                            |
| `created_at`  | `TIMESTAMPTZ`            | DEFAULT `now()`                |                                      |
| `updated_at`  | `TIMESTAMPTZ`            | DEFAULT `now()`                |                                      |

### 4.2 `event_signups`

| Column      | Type            | Constraints                     | Description                       |
| ----------- | --------------- | ------------------------------- | --------------------------------- |
| `id`        | `UUID`          | PK, default `gen_random_uuid()` | Unique signup identifier          |
| `event_id`  | `UUID`          | FK → `events.id`, NOT NULL      | Which event                       |
| `name`      | `VARCHAR(255)`  | NOT NULL                        | Attendee's name                   |
| `email`     | `VARCHAR(255)`  | NOT NULL                        | Attendee's email                  |
| `attended`  | `BOOLEAN`       | DEFAULT `false`                 | Whether they actually showed up   |
| `created_at`| `TIMESTAMPTZ`   | DEFAULT `now()`                 |                                   |

**Unique constraint:** `(event_id, email)` — prevents duplicate signups per event.

### 4.3 `officers`

| Column           | Type            | Constraints                     | Description                         |
| ---------------- | --------------- | ------------------------------- | ----------------------------------- |
| `id`             | `UUID`          | PK, default `gen_random_uuid()` | Unique officer identifier           |
| `name`           | `VARCHAR(255)`  | NOT NULL                        | Full name                           |
| `role`           | `VARCHAR(100)`  | NOT NULL                        | e.g., President, VP, Treasurer      |
| `bio`            | `TEXT`          |                                 | Short biography                     |
| `email`          | `VARCHAR(255)`  |                                 | Contact email                       |
| `linkedin`       | `VARCHAR(500)`  |                                 | LinkedIn profile URL                |
| `image_url`      | `VARCHAR(500)`  |                                 | Profile photo URL                   |
| `term_start`     | `DATE`          |                                 | Start of officer term               |
| `term_end`       | `DATE`          |                                 | End of officer term                 |
| `is_current`     | `BOOLEAN`       | DEFAULT `true`                  | Currently serving?                  |
| `display_order`  | `INTEGER`       | DEFAULT `0`                     | Sort order on page                  |
| `created_at`     | `TIMESTAMPTZ`   | DEFAULT `now()`                 |                                     |
| `updated_at`     | `TIMESTAMPTZ`   | DEFAULT `now()`                 |                                     |

### 4.4 `lineage_members`

| Column            | Type            | Constraints                     | Description                              |
| ----------------- | --------------- | ------------------------------- | ---------------------------------------- |
| `id`              | `UUID`          | PK, default `gen_random_uuid()` | Unique person identifier                 |
| `name`            | `VARCHAR(255)`  | NOT NULL                        | Full name                                |
| `graduation_year` | `INTEGER`       |                                 | Expected/actual grad year                |
| `role`            | `VARCHAR(100)`  |                                 | Officer title (if any)                   |
| `image_url`       | `VARCHAR(500)`  |                                 | Optional photo                           |
| `mentor_id`       | `UUID`          | FK → `lineage_members.id`       | Self-ref: this person's mentor (parent)  |
| `tree_name`       | `VARCHAR(100)`  |                                 | Which family tree they belong to         |
| `created_at`      | `TIMESTAMPTZ`   | DEFAULT `now()`                 |                                          |
| `updated_at`      | `TIMESTAMPTZ`   | DEFAULT `now()`                 |                                          |

**Note:** `mentor_id` is nullable — root nodes (tree founders) have `NULL` mentor. The `tree_name` groups members into distinct family trees for display.

### 4.5 `announcements`

| Column      | Type            | Constraints                     | Description                      |
| ----------- | --------------- | ------------------------------- | -------------------------------- |
| `id`        | `UUID`          | PK, default `gen_random_uuid()` | Unique announcement identifier   |
| `title`     | `VARCHAR(255)`  | NOT NULL                        | Announcement headline            |
| `content`   | `TEXT`          |                                 | Full announcement text           |
| `is_active` | `BOOLEAN`       | DEFAULT `true`                  | Show on homepage?                |
| `created_at`| `TIMESTAMPTZ`   | DEFAULT `now()`                 |                                  |
| `updated_at`| `TIMESTAMPTZ`   | DEFAULT `now()`                 |                                  |

### 4.6 `admins`

| Column          | Type            | Constraints                     | Description                   |
| --------------- | --------------- | ------------------------------- | ----------------------------- |
| `id`            | `UUID`          | PK, default `gen_random_uuid()` | Unique admin identifier       |
| `email`         | `VARCHAR(255)`  | UNIQUE, NOT NULL                | Admin login email             |
| `password_hash` | `VARCHAR(255)`  | NOT NULL                        | bcrypt-hashed password        |
| `created_at`    | `TIMESTAMPTZ`   | DEFAULT `now()`                 |                               |

### 4.7 `contact_submissions`

| Column      | Type            | Constraints                     | Description                   |
| ----------- | --------------- | ------------------------------- | ----------------------------- |
| `id`        | `UUID`          | PK, default `gen_random_uuid()` | Unique submission identifier  |
| `name`      | `VARCHAR(255)`  | NOT NULL                        | Sender name                   |
| `email`     | `VARCHAR(255)`  | NOT NULL                        | Sender email                  |
| `message`   | `TEXT`          | NOT NULL                        | Message body                  |
| `is_read`   | `BOOLEAN`       | DEFAULT `false`                 | Admin has read it?            |
| `created_at`| `TIMESTAMPTZ`   | DEFAULT `now()`                 |                               |

### Entity Relationship Summary

```
events  ──<  event_signups      (one event has many signups)
officers                        (standalone, filtered by is_current)
lineage_members  ──<  lineage_members  (self-referencing via mentor_id)
announcements                   (standalone)
admins                          (standalone)
contact_submissions             (standalone)
```

---

## 5. API Routes (Next.js `pages/api/`)

All routes return JSON. Admin routes are protected via NextAuth session check.

### Public Routes

| Method | Route                              | Description                         |
| ------ | ---------------------------------- | ----------------------------------- |
| GET    | `/api/events`                      | List all events (upcoming + past)   |
| GET    | `/api/events/[id]`                 | Get single event details            |
| POST   | `/api/events/[id]/signup`          | Submit name + email signup          |
| GET    | `/api/officers`                    | List current officers               |
| GET    | `/api/officers/alumni`             | List past officers                  |
| GET    | `/api/lineages`                    | Get all lineage trees               |
| GET    | `/api/announcements`               | Get active announcements            |
| POST   | `/api/contact`                     | Submit contact form                 |

### Admin Routes (protected)

| Method | Route                                    | Description                          |
| ------ | ---------------------------------------- | ------------------------------------ |
| POST   | `/api/admin/events`                      | Create event                         |
| PUT    | `/api/admin/events/[id]`                 | Update event                         |
| DELETE | `/api/admin/events/[id]`                 | Delete event                         |
| GET    | `/api/admin/events/[id]/signups`         | Get signups for event                |
| POST   | `/api/admin/events/[id]/attendance`      | Upload attendance sheet              |
| POST   | `/api/admin/officers`                    | Add officer                          |
| PUT    | `/api/admin/officers/[id]`               | Update officer                       |
| DELETE | `/api/admin/officers/[id]`               | Remove officer                       |
| POST   | `/api/admin/lineages`                    | Add lineage member                   |
| PUT    | `/api/admin/lineages/[id]`               | Update lineage member                |
| DELETE | `/api/admin/lineages/[id]`               | Remove lineage member                |
| POST   | `/api/admin/announcements`               | Create announcement                  |
| PUT    | `/api/admin/announcements/[id]`          | Update announcement                  |
| DELETE | `/api/admin/announcements/[id]`          | Delete announcement                  |
| GET    | `/api/admin/signups`                     | All signups across events            |
| GET    | `/api/admin/signups/export`              | Export mailing list CSV              |
| GET    | `/api/admin/contact-submissions`         | View contact form submissions        |

---

## 6. Development Plan

### Phase 1 — Project Scaffolding (Week 1)

- [ ] Initialize Next.js project with TypeScript and Pages Router
- [ ] Configure Tailwind CSS
- [ ] Set up NeonDB database and connection string
- [ ] Initialize Prisma with schema, run initial migration
- [ ] Set up NextAuth.js with Credentials provider for admin
- [ ] Create shared layout component (Navbar + Footer)
- [ ] Configure Vercel project and environment variables
- [ ] Set up ESLint + Prettier

### Phase 2 — Public Pages (Weeks 2–3)

- [ ] **Home Page** — Hero section, quick links, upcoming events preview, footer
- [ ] **About + Contact Page** — Mission statement, membership benefits, officer grid (flip cards), contact form
- [ ] **Events Page** — Event listing with category filters, inline signup form, past events archive
- [ ] **Lineages Page** — Tree visualization with D3/react-d3-tree, search/filter, multiple tree support
- [ ] Responsive design pass for all pages (mobile, tablet, desktop)

### Phase 3 — API Routes & Database Integration (Weeks 3–4)

- [ ] Public API routes: events, officers, lineages, announcements, contact
- [ ] Event signup flow (POST → store in db → confirmation UI)
- [ ] Contact form submission flow
- [ ] Server-side data fetching (`getServerSideProps` / `getStaticProps`) for all public pages

### Phase 4 — Admin Dashboard (Weeks 4–5)

- [ ] Admin login page and session management
- [ ] Dashboard home with stats overview
- [ ] Event CRUD + signup viewer + CSV export + attendance upload
- [ ] Officer CRUD (add/edit/remove, toggle current/alumni)
- [ ] Lineage member CRUD + relationship management
- [ ] Announcement CRUD
- [ ] Contact submissions viewer

### Phase 5 — Polish & Deploy (Week 6)

- [ ] Design polish: animations, transitions, hover states matching old site's aesthetic
- [ ] Accessibility audit (keyboard nav, screen reader, contrast ratios)
- [ ] SEO: meta tags, Open Graph, page titles
- [ ] Performance: image optimization, lazy loading, Lighthouse audit
- [ ] Final testing across browsers and devices
- [ ] Production deploy to Vercel
- [ ] Seed database with current officers, lineage data, and upcoming events
- [ ] Documentation: README, contributing guide, environment variable reference

---

## 7. Design Guidelines

Preserve the visual identity from the old site while modernizing the implementation with Tailwind utility classes.

### Color Palette

| Token         | Hex         | Usage                                    |
| ------------- | ----------- | ---------------------------------------- |
| `primary`     | `#003366`   | Primary dark blue — headers, nav, CTAs   |
| `primary-mid` | `#0055a5`   | Mid blue — accents, gradients            |
| `primary-light`| `#e8f0fe`  | Light blue — backgrounds, hover states   |
| `white`       | `#ffffff`   | Card backgrounds, text on dark           |
| `gray-50`     | `#f8fafc`   | Page backgrounds                         |
| `gray-500`    | `#6b7280`   | Secondary text                           |
| `gray-800`    | `#1f2937`   | Primary text                             |
| `success`     | `#10b981`   | Confirmations, active states             |
| `danger`      | `#ef4444`   | Errors, delete actions                   |

### Typography

- **Headings:** System font stack, bold, `text-gray-800`
- **Body:** System font stack, regular, `text-gray-600`
- **Maintain generous spacing** — the old site used lots of whitespace which gave it a clean feel

### Component Patterns (from old site)

- **Glassmorphic cards:** `bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg`
- **Gradient top border on cards:** 3px top border with `bg-gradient-to-r from-[#003366] to-[#0055a5]`
- **Hover lift effect:** `hover:-translate-y-1 hover:shadow-xl transition-all duration-300`
- **Flip cards for officers:** Front shows photo + name + role; back shows bio + LinkedIn
- **Section titles:** Uppercase letter-spacing with subtle underline accent
- **Buttons:** Rounded, uppercase, letter-spaced, gradient background, hover scale

### Responsive Breakpoints

- Mobile: `< 640px` (single column)
- Tablet: `640px – 1024px` (two columns)
- Desktop: `> 1024px` (full layout)

---

## 8. File Structure

```
jhu-acm-website/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script for initial data
├── public/
│   ├── images/                # Static images (logo, officer photos)
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── FlipCard.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── Button.tsx
│   │   │   └── CategoryFilter.tsx
│   │   ├── admin/             # Admin-specific components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── EventForm.tsx
│   │   │   ├── OfficerForm.tsx
│   │   │   └── LineageEditor.tsx
│   │   └── lineage/
│   │       └── TreeVisualization.tsx
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── auth.ts            # NextAuth config
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── index.tsx           # Home
│   │   ├── about.tsx           # About + Contact
│   │   ├── events.tsx          # Events & Signup
│   │   ├── lineages.tsx        # Lineages
│   │   ├── admin/
│   │   │   ├── index.tsx       # Dashboard home
│   │   │   ├── login.tsx       # Admin login
│   │   │   ├── events.tsx
│   │   │   ├── officers.tsx
│   │   │   ├── lineages.tsx
│   │   │   ├── announcements.tsx
│   │   │   └── signups.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth].ts
│   │       ├── events/
│   │       ├── officers/
│   │       ├── lineages/
│   │       ├── announcements/
│   │       ├── contact/
│   │       └── admin/
│   ├── styles/
│   │   └── globals.css         # Tailwind directives + custom base styles
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types
│   └── utils/
│       └── helpers.ts          # Date formatting, etc.
├── .env.local                  # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 9. Environment Variables

```env
# Database
DATABASE_URL="postgresql://...@your-neon-db.neon.tech/acm?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Optional
NEXT_PUBLIC_SITE_URL="https://your-domain.vercel.app"
```

---

## 10. Migration Notes (Old → New)

| Old Feature              | New Equivalent                                        |
| ------------------------ | ----------------------------------------------------- |
| React + Vite SPA         | Next.js Pages Router (SSR/SSG)                       |
| Express backend          | Next.js API routes                                   |
| Firebase / Firestore     | NeonDB (PostgreSQL) + Prisma                         |
| Firebase Auth             | Removed (no user accounts); NextAuth for admin only  |
| Custom CSS               | Tailwind CSS                                         |
| User profiles/membership | Removed — replaced with email-based event signups    |
| Booking page (lounge)    | Removed                                              |
| Sponsors page            | Removed                                              |
| Credits page             | Merged into About + Contact                          |
| **New: Lineages page**   | Family tree visualization of mentor/mentee chains    |

### Content to Migrate

- Mission statement and membership benefits text → About page
- Officer data (names, roles, bios, photos) → Seed into `officers` table
- Event structure (name, description, location, category, times) → `events` table schema
- Sponsor data → Removed (can be re-added later if needed)
- Contributor acknowledgments → About page "Special Thanks" section
