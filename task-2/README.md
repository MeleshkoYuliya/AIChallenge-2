# Host & Cheer — Usage Guide

A walkthrough of the four core flows: **Publish → RSVP → Ticket → Check-in**.
This is a how-to for using the app, not a spec. For architecture see [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md); for retrospective notes see [`report.md`](./report.md).

---

## Before you start

- Open the app and click **Sign up** (top right).
- On the signup form, pick a role:
  - **Attendee** — you only want to discover and RSVP to events.
  - **Host** — you also want to publish and manage events.
  - **Checker** — you'll scan/verify tickets at the door for a host.
- Verify your email, then sign in.

You can browse all events (including past ones) without an account — you just can't RSVP, publish, or check in until you're signed in.

---

## Flow 1 — Publish an event (Host)

1. **Become a host.** From the navbar, click **Host** to open the **Host dashboard**. If you signed up as a Host, you already have a host org; otherwise the dashboard will prompt you to create one (name + slug).
2. **Open the editor.** Click **New event**. You'll land on `/host/events/new`.
3. **Fill in the basics:**
   - Title, description, cover image (uploaded to storage).
   - Start / end date-time and timezone.
   - Venue address **or** an online URL (one or the other).
   - Capacity (used for the waitlist).
4. **Choose visibility:**
   - **Public** — appears on `/explore` and your host page.
   - **Unlisted** — only reachable via the direct event URL (`/e/<slug>`); great for invite-only gatherings.
5. **Pricing:** the **Free / Paid** toggle is shown but **Paid is disabled** — the platform is free-only for now. The tooltip explains the limitation.
6. **Save as draft** to keep editing, or **Publish** to make it live.
7. After publishing, share the URL from the event page. You can return to **Host dashboard → your event → Edit** anytime.

> **Tip:** Invite teammates as co-hosts or checkers from **Host → Members**. Invites are single-use and expire after 7 days.

---

## Flow 2 — RSVP to an event (Attendee)

1. From `/explore` or a shared link, open an event page (`/e/<slug>`).
2. Click **RSVP**.
   - **Signed out?** You'll be sent to sign-in and returned to the same event automatically after login.
   - **Below capacity?** You're marked **Going** immediately.
   - **At capacity?** The button reads **Join waitlist** — you're added with a position number.
3. **If someone cancels**, the next person on the waitlist is promoted automatically. You'll see a toast on the event page in real time: *"🎉 You're off the waitlist — you're going!"*
4. **Cancel anytime** from the same event page (**Cancel RSVP** / **Leave waitlist**).
5. Past events show an **Ended** badge and hide the RSVP button — you can still browse the page, gallery, and leave feedback.

---

## Flow 3 — Your ticket (Attendee)

Once you're **Going**, the event page shows two things in the sidebar:

1. **A QR pass** — a unique code rendered as a QR. This is what gets scanned at check-in. It's tied to your account and event; don't share it.
2. **Add to Calendar** — downloads an `.ics` file you can import into Apple/Google/Outlook.

You can find all your upcoming tickets later from **Tickets** in the navbar (`/tickets`), which lists everything you're going to or waitlisted for. Each row links back to the event so you can pull up the QR again.

After the event ends:
- The **Feedback** section unlocks — leave a 1–5 star rating + optional comment.
- The **Gallery** stays open — upload photos from the event. They show up publicly only after the host approves them.

---

## Flow 4 — Check-in at the door (Checker / Host)

1. Sign in as a user who is a **Host** or **Checker** on the event's host org.
2. From the navbar click **Check-in**, or go straight to **My Events** and pick the event.
3. On the event's check-in page (`/host/check-in/<slug>`):
   - Live counters show **Checked in / Going / Capacity** and update as people arrive.
   - Type or paste the attendee's **QR code** (or short ticket code) into the input and submit.
   - A green confirmation appears with the attendee's name. Duplicates are rejected with a clear message — no one gets checked in twice.
4. Made a mistake? Each just-checked-in entry has an **Undo** action that reverts the status.
5. The list updates in real time, so multiple checkers at the same door stay in sync.

---

## Bonus flows

### Reporting bad content
Any signed-in user can hit the **Report** button on an event or a gallery photo. The report lands in the host's **Moderation queue** (`/host/moderation`), where a host can:
- **Hide** the event/photo (it disappears from public view), or
- **Dismiss** the report.

### My Events
`/my-events` is the at-a-glance hub for users with a role — events you host, events you check in for, and quick actions for each (edit, check-in, view).

### Sharing your host page
Every host has a public page at `/h/<host-slug>` that lists upcoming and past events — share that link in your bio.

---

## Quick map

| You want to… | Go to |
|---|---|
| Browse events | `/explore` |
| See an event | `/e/<event-slug>` |
| Sign in / sign up | `/auth` |
| Manage your host org | `/host` |
| Create / edit an event | `/host/events/new` · `/host/events/<slug>/edit` |
| Invite co-hosts or checkers | `/host/members` |
| Review reports | `/host/moderation` |
| Check people in | `/host/check-in/<slug>` |
| Your tickets | `/tickets` |
| Your hosting + checking events | `/my-events` |

That's the whole loop: **publish** an event → attendees **RSVP** → they get a **ticket** → you **check them in** at the door. Everything else (waitlist promotion, calendar export, gallery, feedback, moderation) hangs off these four steps.
