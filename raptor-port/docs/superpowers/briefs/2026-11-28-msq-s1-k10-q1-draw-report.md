# Section 1, K10 question Q1 — the drawer's report (chat A211 helper, 28 Nov 26)

A fresh Opus helper, from `../briefs/2026-11-28-msq-s1-k10-q1-draw-brief.md`, on `origin/claude/msq-s1-guard-6ae5e1` at
`985fe7dc7` (later than `f5ddbec8c`), detached. Nothing committed or pushed.

## How it was drawn

- **Build:** under the checks lock (taken, `npm run build` green, released at once). Served with `vite preview` on 4743,
  stopped by its port when done.
- **Ranger's (member) leave** — LL, Tue 14 to Sat 18 Jul, "Local leave", all day — was filed **through the app's own
  door**: Hunter (142's admin), Inputs → List → "+ Input", on Mon 29 Jun 2026 09:00 (so it is not a late input), its
  "No document" question answered "No document". The row was checked on the list before anything else.
- **The move 142 → 149 from Thu 16 Jul was written as set-up into the browser's saved data** (his two home rows), as
  `n204/draw-q30b.mjs` does: no screen saves a move on this branch (the move's save has no caller; the Leave War's
  "Transfer to Sqn" was left out, D2659).
- **Pictured on Fri 17 Jul 2026 09:00**, Hunter (142's admin) signed in. Hunter has no right in 149: his top bar draws
  no squadron picker at all (one squadron only).
- Desktop 1536 × 864 (his PC's screen at 125%), Chromium, drawn at 2×. Teal dashed ring and teal tags = where he looks.
  No phone picture (the list is a different layout on a phone; it would have cost a second drawing).

## The two pictures

1. `raptor-port/docs/mock/2026-11-28-msq-k10-q1/q1-1-142-list-17jul.png` — **the real app today.**
   Caption: *142's Inputs list on Fri 17 Jul, Hunter (142's admin) signed in. Ranger's (member) leave, 14–18 Jul, is
   still listed — he moved to 149 the day before. Under choice B this row would not be here at all; 142 would see the
   leave only on its schedule for 14 and 15 Jul.*
2. `raptor-port/docs/mock/2026-11-28-msq-k10-q1/q1-2-choiceA-read-only-proposed.png` — **proposed, drawn on the real
   app.** Caption: *Choice A: Hunter (142's admin) taps the row and the leave's window opens read only — every field
   shown as plain text (who, the type, all day, the remark "Local leave till 18 Jul", who placed it), nothing to change:
   no Save, no Delete, only Close. The line at its foot is draft wording, to be settled.*

How picture 2 was drawn (one named change, "the read-only window"): on the window the real press opened, the form's
body was set the way the app sets it for a reader who may not change an input — the app's own stylesheet then draws
every field as its value, with the buttons dimmed (his D364 look). The window's date calendar, Delete and Save were
hidden, "Cancel" reads "Close", and one line was added with the app's own read-only line style — all as the built
read-only window draws them. Nothing removed. The same look was checked against a real read-only window of this same
leave: Osprey (149's member) opening it from 149's list today (scratch picture `raptor-port/.tmp/a211-k10-q1/
probe-us9.png`, from `q1-probe.mjs`). The one visible difference is the app's own: an admin's read-only window keeps the
"Several people" switch and the "?" beside Type, dimmed; a member's shows neither.

## The card, as it should be published

**Q1 — Ranger's leave, looked at on his old squadron's list after he has moved**

*Example:* Ranger (member) has local leave from Tue 14 to Sat 18 Jul. On Thu 16 Jul he moves from 142 to 149, so the
leave goes with him to 149 (you ruled this). On Fri 17 Jul, Hunter (142's admin), who has no right in 149, opens 142's
Inputs list. Ranger's (member) leave is still listed there, because its first two days were 142's. Hunter (142's admin)
taps it.

*What he sees today:* the leave's window, open to change — Save and Delete both offered. But Hunter (142's admin) may
no longer change it: only Ranger (member), 149's admins or a master admin may.

*The decision:* what the window does on 142's list.

- **A — it opens read only: everything shown, nothing to change.** *(recommended: 142 still sees what Ranger (member)
  had, and nothing of 149's is changed from 142)* — picture 2.
- **B — it leaves 142's list altogether;** 142 sees it only on its schedule for 14 and 15 Jul. *(about 1 hour more; the
  Medical tab's past and future views lose such records too)* — picture 1 shows the row that would go.

The same answer is used for a waiting medical record that went with him, and for a Medical tab set to a past or a
future day.

## What the drawing found that differs from the plan

1. **Today's app opens Ranger's (member) leave EDITABLE for Hunter (142's admin)** — Save and Delete live, the date
   calendar drawn (scratch picture `raptor-port/.tmp/a211-k10-q1/today-window-editable-whole.png`). So picture 2 is a
   mock-up marked "proposed", not today's look. The plan's card says "What he sees: the leave's window. Hunter may no
   longer change it" — true of the rule, but on screen today he is offered Save; the card above says so.
2. **The row on 142's list shows the whole leave, 14 → 18 Jul**, not "its first two days". The card above reads "still
   listed there, because its first two days were 142's".
3. **The read-only line's words do not fit this case.** The app's present line, "Only Ranger or an admin can change
   this.", is untrue for Hunter, who is an admin. Picture 2 carries draft words ("Ranger has moved to 149. Only Ranger,
   149's admins or a master admin can change this."), tagged "Draft words, to be settled" — they are app words, owed to
   the wording step (Opus drafts, a fresh Fable reviews, D2441) before K10-d builds.
4. **Hunter (142's admin) in the member view** sees no Ranger in his own list's Person filter on 17 Jul (Ranger is 149's
   by then) — noted only; not part of this card.
5. The window's own small calendar marks Mon 13 Jul as "today" while the clock says Fri 17 Jul (the demo's fixed
   Inputs day, plan §10 risk 9). Not in either picture.
6. Where the script lives: the brief puts it in `scripts/handpass/a211/`; the mock-up guide would put a mock-up's
   script beside its pictures in `docs/mock/…` so a notes-only pull request stays notes-only. Left where the brief says;
   the host decides.

## Files

- Pictures: `raptor-port/docs/mock/2026-11-28-msq-k10-q1/q1-1-142-list-17jul.png`,
  `raptor-port/docs/mock/2026-11-28-msq-k10-q1/q1-2-choiceA-read-only-proposed.png`
- Script: `raptor-port/scripts/handpass/a211/draw-k10-q1.mjs` (`FRESH=1` remakes the world); the probe that reached the
  real read-only window as Osprey (149's member): `raptor-port/scripts/handpass/a211/q1-probe.mjs`
- Scratch (not committed, `raptor-port/.tmp/a211-k10-q1/`): the saved world, the whole-screen pictures, today's editable
  window, Osprey's real read-only window.
- Run: no page errors, no console errors.
