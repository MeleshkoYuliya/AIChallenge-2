# Development Report

A retrospective on building the **Host & Cheer** event platform with Lovable.

---

## 1. Tools & Techniques

### Platform
- **Lovable** as the AI-assisted IDE — prompt-driven scaffolding, file edits, and live preview.
- **Lovable Cloud** (managed Supabase) for database, auth, storage, realtime, and edge functions — no separate provider setup.

### Frontend Stack
- **React 18 + Vite 5 + TypeScript** for the SPA shell.
- **React Router v6** for routing, with `HostRoute` / `CheckerRoute` guard components for role-gated pages.
- **TanStack Query** for server-state caching where useful; direct Supabase calls in pages for simpler flows.
- **Tailwind CSS v3** + **shadcn/ui** as the component primitives, themed via HSL semantic tokens in `index.css` / `tailwind.config.ts`.
- **lucide-react** icons, **date-fns** for formatting, **sonner** for toasts.
- **qrcode** to render attendee tickets as inline SVG.

### Backend Techniques
- **Postgres RLS everywhere** — every table protected; access derived from a `has_role(user, host, role)` SECURITY DEFINER function to avoid recursive policy evaluation.
- **Database triggers** for business rules:
  - `handle_rsvp_capacity` — auto-assigns `going` vs `waitlist` on insert.
  - `promote_waitlist` — promotes the next waitlisted attendee when an RSVP is cancelled.
- **Realtime subscriptions** on the `rsvps` table so a waitlisted user is notified the moment they're promoted.
- **Storage buckets** for cover images and gallery photos, with host-approval workflow before public display.
- **Single-use invite tokens** (7-day expiry) for adding hosts/checkers to a host org.

### Workflow Techniques
- **Search-replace edits** over full file rewrites to keep diffs reviewable.
- **Parallel reads** when gathering context across multiple files.
- **Migration-first schema changes** — every DB change went through a SQL migration, never hand edits.
- **Requirements audit pass** — re-read each spec bullet against the code instead of trusting memory.

---

## 2. What Worked Well

- **Lovable Cloud + RLS** removed an entire backend project. Auth, storage, and DB came online with one toggle.
- **Triggers for capacity/waitlist** kept the client trivial — the UI just inserts an RSVP and reads back the assigned status. No race conditions to manage in JS.
- **Realtime promotion toast** ("🎉 You're off the waitlist") was a high-delight feature for very little code.
- **`has_role` SECURITY DEFINER** pattern cleanly avoided the classic "RLS policy queries the same table it protects" infinite recursion.
- **Semantic Tailwind tokens** kept the dark theme consistent across ~15 pages without one-off color classes.
- **Role-gated route components** (`HostRoute`, `CheckerRoute`) centralized access control — pages stayed focused on their feature.
- **QR + ICS in the browser** — no server roundtrip needed for tickets or calendar export.
- **shadcn/ui + Tailwind** allowed rapid composition of dialogs, tabs, tooltips, and forms with consistent styling.

---

## 3. What Did Not Work (or needed rework)

- **Initial role storage temptation** — early instinct was to put a `role` column on `profiles`. Switched to a dedicated `host_members` table after recognizing the privilege-escalation risk. Worth it, but cost a migration.
- **CHECK constraints for time logic** — tried `CHECK (expire_at > now())` on invites; Postgres rejects non-immutable expressions. Replaced with a validation trigger.
- **Client-side moderation filtering** was the first instinct for hidden reports; moved to a `hidden_at` column + RLS so hidden items never leave the DB to unauthorized clients.
- **Free/Paid toggle** — originally tried to hide the "Paid" option entirely. Better UX was to show it disabled with a tooltip explaining the platform is currently free-only, signaling future capability.
- **Aggregating ratings in the DB** with a view felt heavy for current scale; ended up computing averages client-side in `Explore` after fetching feedback rows. Acceptable now; would move to a materialized view or `rpc` if event counts grow.
- **Auto-confirm email** was tempting for faster demos but left off per security guidance — users do verify email, which slows first-run testing slightly.

---

## 4. Notable Decisions

| Decision | Rationale |
|---|---|
| Roles in `host_members`, **never** on `profiles` | Prevents privilege escalation via profile updates. |
| `has_role()` as SECURITY DEFINER | Avoids recursive RLS evaluation while keeping policies declarative. |
| DB triggers own capacity & waitlist | Single source of truth; eliminates client race conditions. |
| Free events only (Paid disabled + tooltip) | Scopes v1; communicates future intent without dead UI. |
| Public + Unlisted visibility (no Private) | Unlisted via slug-only access is enough for friends-only events; full Private would need an invite layer not in scope. |
| Host-approval gate on gallery uploads | Prevents abuse on public event pages without blocking attendee participation. |
| Reports flow with `hidden_at` + review queue | Keeps moderation reversible and auditable rather than hard-deleting. |
| Past events stay browsable, RSVP hidden | Discovery and history matter; "Ended" badge + grayscale cover communicates state clearly. |
| QR codes rendered client-side as SVG | No server load; crisp at any size; works offline once page is loaded. |
| `redirect` query param on `/auth` | RSVP-while-signed-out flow returns the user exactly where they started. |
| Single-use, 7-day invite tokens | Standard security posture for org membership invites. |
| Realtime only on `rsvps` (not everywhere) | Targeted use — promotion notifications — avoids subscription sprawl. |
| Tailwind semantic tokens, no raw colors in components | Theme changes happen in one file; no hunt-and-replace. |

---

## 5. Summary

The combination of **Lovable Cloud + Postgres RLS + DB triggers** carried most of the architectural weight. The frontend stayed thin and declarative, business invariants lived next to the data, and role-based access was enforced in one place. The main lessons were the usual Postgres ones — don't put roles on profile tables, don't put non-immutable expressions in CHECK constraints — both caught early enough to fix cleanly.
