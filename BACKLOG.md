# GDPR Internship Backlog
**Vlad Semenov · Dynatrace Gdańsk · April 23 – May 15, 2026**
**Stack: JavaScript · Azure Functions · Azure SQL · GitHub Actions · JWT**

> `[ ]` → `[x]` when done · ⭐ = show to mentor · outcome = how you know it's done

---

## 🔴 CORE — Must Have

---

### P10 · Repo + CI/CD

- [ ] Create repo with `/frontend` and `/backend` folders
- [ ] `frontend.yml` — triggers only on changes in `frontend/**` → deploys to GitHub Pages
- [ ] `backend.yml` — triggers only on changes in `backend/**` → deploys to Azure Functions
- [ ] All secrets (DB password, Azure credentials) stored in GitHub Secrets — zero secrets in code

**✅ Outcome:** push a change to `/frontend` → only frontend pipeline runs. Push to `/backend` → only backend pipeline runs. Both live URLs accessible in browser.

---

### P10 · Hello World — System is Alive

- [ ] Simple `index.html` in `/frontend` — one button "Check API"
- [ ] Azure Function `GET /health` → returns `{ status: "ok" }`
- [ ] Frontend calls `/health` via `fetch()` and shows result on screen
- [ ] ⭐ Show mentor: button click → response visible in browser

**✅ Outcome:** open live GitHub Pages URL → click button → see `{ status: "ok" }` from real Azure backend.

---

### P9 · Database Setup

- [ ] Azure SQL free-tier database created (or Cosmos DB free tier)
- [ ] Table `users` created:
  ```
  id          UUID PRIMARY KEY
  email       VARCHAR(255) UNIQUE NOT NULL
  password_hash VARCHAR(255) NOT NULL
  role        VARCHAR(50) DEFAULT 'user'
  created_at  DATETIME DEFAULT GETDATE()
  ```
- [ ] Table `records` created:
  ```
  id          UUID PRIMARY KEY
  user_id     UUID REFERENCES users(id)
  name        VARCHAR(255) NOT NULL
  email       VARCHAR(255) NOT NULL
  phone       VARCHAR(50)
  purpose     VARCHAR(500) NOT NULL
  frozen      BIT DEFAULT 0
  created_at  DATETIME DEFAULT GETDATE()
  ```
- [ ] Connection string stored in Azure Function App Settings (env vars) — not in code
- [ ] Backend connects to DB and doesn't crash on startup

**✅ Outcome:** `GET /health` returns `{ status: "ok", db: "connected" }` — DB connection verified.

---

### P9 · Create Record

- [ ] `POST /records` endpoint created
- [ ] Server-side validation: all required fields present, correct format
- [ ] Record saved to Azure SQL with generated UUID
- [ ] Returns `201 Created` with saved record

**✅ Outcome:** POST request via Postman → record appears in database. Missing field → returns `400` with error message.

---

### P9 · List Records

- [ ] `GET /records` returns list of records
- [ ] Pagination supported: `?page=1&limit=10` (10 / 25 / 50)
- [ ] Returns total count + current page info

**✅ Outcome:** GET request → array of records + `{ total, page, limit }` in response. Second page returns different records.

---

### P8 · Update + Delete

- [ ] `GET /records/{id}` — get single record by ID (needed for edit form)
- [ ] `PUT /records/{id}` — update record, server-side validation
- [ ] `DELETE /records/{id}` — delete record
- [ ] All three return `404` if record not found

**✅ Outcome:** GET single record → correct data. Update → changes saved in DB. Delete → subsequent GET returns 404.

---

### P8 · Frontend CRUD ⭐

- [ ] Form: add new record (name, email, phone, purpose)
- [ ] Records list rendered from real API
- [ ] Edit button → form pre-filled with existing data → save calls `PUT`
- [ ] Delete button → confirmation modal → calls `DELETE`
- [ ] Pagination controls (previous / next)
- [ ] Search / filter input
- [ ] Export to CSV button
- [ ] ⭐ Show mentor: full CRUD working end-to-end in browser

**✅ Outcome:** open app in browser → add, edit, delete records — all changes persist after page refresh.

---

## 🟠 SHOULD HAVE — Security + Structure

---

### P8 · Error Handling

- [ ] All endpoints return correct HTTP codes: `400`, `401`, `403`, `404`, `500`
- [ ] Error responses use consistent format: `{ error: "message" }`
- [ ] No stack traces or internal details in error responses

**✅ Outcome:** send bad request → get `400` with readable message. Access protected route without token → get `401`. No raw exception text visible.

---

### P8 · Registration + Login (JWT)

- [ ] `POST /auth/register` — create user, hash password with **bcrypt**
- [ ] `POST /auth/login` — verify password, return JWT token
- [ ] JWT contains: `userId`, `email`, `role`, `exp` (expiry)
- [ ] JWT TTL set to **15 minutes**
- [ ] Refresh token (long-lived, 7 days) stored in HttpOnly cookie
- [ ] `POST /auth/refresh` — issues new JWT using refresh token
- [ ] Token stored in HttpOnly cookie (not localStorage)
- [ ] `POST /auth/logout` — invalidates token

**✅ Outcome:** register → login → receive token. Use token on protected route → works. Use expired/invalid token → get `401`.

---

### P7 · Protect Endpoints + RBAC

- [ ] All `/records` endpoints require valid JWT
- [ ] Middleware extracts and verifies token on every request
- [ ] RBAC roles: `admin` sees all records, `user` sees only own records
- [ ] Account lockout after 5 failed login attempts

**✅ Outcome:** request without token → `401`. User A cannot see User B's records. Admin can see all.

---

### P7 · Server-side Validation

- [ ] Every field validated: type, max length, allowed format
- [ ] Email format validated with regex
- [ ] Phone: digits only, max 15 chars
- [ ] Purpose: max 500 chars
- [ ] Validation errors return `400` with field-level messages

**✅ Outcome:** submit form with invalid email → `400` with `{ error: "email: invalid format" }`.

---

### P6 · Security Hardening

- [ ] Rate limiting: max 30 requests/min per IP
- [ ] Parameterized queries or ORM — SQL Injection protection
- [ ] HTML output encoding — XSS protection
- [ ] CSRF token for all data-modifying forms
- [ ] HTTP headers: `CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`
- [ ] CORS: allowed domains only (not `*`)
- [ ] GitHub Dependabot enabled

**✅ Outcome:** try `'; DROP TABLE records; --` in form field → safely stored as plain text, DB unaffected.

---

## 🟡 GDPR CORE — What Makes This Project Special

---

### P8 · My Data Page (Art. 15)

- [ ] Logged-in user can see all data stored about them
- [ ] Shows: personal data, consents, processing purposes

**✅ Outcome:** login → open "My Data" → see all your records and what data is stored.

---

### P8 · Delete Account (Art. 17)

- [ ] User can request permanent deletion of account + all personal data
- [ ] Confirmation step required ("type DELETE to confirm")
- [ ] All records linked to user are removed from DB
- [ ] Email notification sent after deletion

**✅ Outcome:** delete account → login attempt fails → all records gone from DB.

---

### P7 · Export Data (Art. 20)

- [ ] `GET /records/export` → download all own records as JSON
- [ ] `GET /records/export?format=csv` → download as CSV
- [ ] Export includes all fields including timestamps

**✅ Outcome:** click Export → file downloads → file contains all user's records in correct format.

---

### P6 · Edit Own Data (Art. 16)

- [ ] User can edit their own personal data from "My Data" page
- [ ] Changes saved with timestamp

**✅ Outcome:** edit name → save → "My Data" shows updated name.

---

### P6 · Consent Management (Art. 7)

- [ ] Separate checkbox per consent purpose (not one "I agree to everything")
- [ ] Purposes: `analytics`, `marketing`, `third-party-sharing`
- [ ] Consent state saved to DB with timestamp
- [ ] User can withdraw any consent at any time

**✅ Outcome:** grant marketing consent → withdraw it → consent history shows both events with timestamps.

---

### P5 · Consent History Log

- [ ] Table `consent_log`: `user_id`, `purpose`, `action` (granted/withdrawn), `timestamp`
- [ ] Visible to user in "My Data" panel

**✅ Outcome:** open consent history → see full list of when each consent was given or withdrawn.

---

## 🟢 NICE TO HAVE — If Time Allows

---

### P5 · Audit Log (Art. 5.2)

- [ ] Table `audit_log`: `user_id`, `action`, `record_id`, `timestamp`
- [ ] Every INSERT / UPDATE / DELETE logged automatically

**✅ Outcome:** make any change → audit_log table has new row with correct action and timestamp.

---

### P5 · Admin Panel

- [ ] Admin can view audit log with filters (date / user / action)
- [ ] Admin can see all users and their roles

**✅ Outcome:** login as admin → see audit log → filter by date → results correct.

---

### P4 · Cookie Consent Banner (Art. 6)

- [ ] Banner shown on first visit: `necessary` / `analytics` / `marketing`
- [ ] Preferences saved to localStorage
- [ ] Banner not shown again if preferences already set

**✅ Outcome:** first visit → banner appears. Set preferences → refresh → banner gone.

---

### P4 · Data Masking by Role

- [ ] Admin: sees full data
- [ ] Support: sees partial (`jan.k***@email.com`, `+48 *** *** 789`)
- [ ] Analyst: sees `[HIDDEN]`

**✅ Outcome:** login as support → records list shows masked email and phone.

---

### P3 · Freeze Processing (Art. 18)

- [ ] User can toggle "freeze" flag on own record
- [ ] Frozen records cannot be modified by other users/admin

**✅ Outcome:** freeze record → try to edit → get `403 Processing restricted`.

---

### P3 · Objection Form (Art. 21)

- [ ] User can submit objection to processing with stated reason
- [ ] Objection saved to DB, visible in admin panel

**✅ Outcome:** submit objection → admin sees it in panel with reason and timestamp.

---

### P2 · Auto-delete After Retention Period (Art. 5.1.e)

- [ ] Scheduled Azure Function runs daily
- [ ] Deletes records older than 2 years
- [ ] Deletion logged in audit log

**✅ Outcome:** record with `created_at` older than 2 years → automatically removed on next scheduled run.

---

### P2 · API Docs

- [ ] Swagger / OpenAPI spec OR simple HTML page listing all endpoints
- [ ] Each endpoint: method, path, params, request body, response

**✅ Outcome:** open `/docs` → see all endpoints documented with examples.

---

### P2 · README + Architecture ⭐

- [ ] `README.md` in repo root
- [ ] Architecture diagram (can be ASCII or simple image)
- [ ] Install + run instructions
- [ ] Live demo link
- [ ] ⭐ Show mentor before final demo

**✅ Outcome:** someone unfamiliar with project can read README and run it locally in under 10 minutes.

---

## 📊 Progress Tracker

| Priority | Group | Tasks | Done |
|---|---|---|---|
| 🔴 P10–P8 | Core | 22 | 0 |
| 🟠 P8–P6 | Security | 17 | 0 |
| 🟡 P8–P5 | GDPR Core | 12 | 0 |
| 🟢 P5–P2 | Nice to Have | 14 | 0 |
| | **Total** | **65** | **0** |

---

## 🧠 Rules

- **Stuck >30 min?** → ask mentor. Don't lose a day on one blocker.
- **Always keep system working end-to-end.** Don't break what already works.
- **Each task has an outcome.** If you can't demonstrate the outcome — task is not done.
- **⭐ tasks** = show to mentor before moving on.
