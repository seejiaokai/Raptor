# [DB-READINESS] group A, phase 7 — the small OIL follow-ups (plan, 1 Oct 26)

**Branch:** `claude/db-readiness-p7-oil-followups`, cut from `main` after PR #476 (phases 0–6) merged.
**Parent plan:** `2026-09-30-db-readiness-group-a-plan.md` §3 phase 7 — "behaviour, not shape; last, never holding the
shape work" (D147, D453). **Backlog:** `OUTSTANDING.md` priority list, "The small OIL follow-ups — ONE batch".
**No plan red team of its own, said so:** the batch is six small items the group-A plan already listed through its three
rounds; what is spent instead is Astra's scenario design (what is MISSING) before the walk and BOTH reviewers' read of the
final code (earned leave, the published record, saved data — D353).

OIL is earned leave — time off banked, never pay (D25). The words below say "earn" and "credit".

## 1. The six items — what the code does today (read 1 Oct 26) and what this phase does

### 1.1 `[OIL-PERSONAL-PLACEHOLDER]` — ALL / ALL AVAIL on a landed "Personal" request row shows no count
**Today.** A request's row is skipped whole by the day's work walk (`engine/oil.ts dayOilWork`, `g.src`), because a request
is answered by the member, not measured from the row. Who stands behind a placeholder on such a row is written down by a
second loop in `engine/oilev.ts oilEvidence` — but that loop runs over the requests that ASK the OIL question
(`projectOilInputs` → `oilAsks`). "Personal" lands a row like any activity and never asks. So a placeholder on its row is
written down nowhere: no count chip, no window, and nothing frozen at publication (D27, D37, D44 all say it must be).
**Build.** In `oilEvidence`, after the asking loop: every standing request row on the day (not `kept`, not cancelled, not
information-only) that stands a placeholder and has no entry yet gets its crowd written, over the REQUEST's own window
(`inpWin` — an all-day request's row carries no times), when its request exists, does not ask and is not taken off.
**Membership only.** Nobody earns from it: a named man on a Personal row earns nothing today (the request half pays only
asking types; the schedule half skips the row), and D43 says the placeholder behaves exactly like named people. The
credit pass is untouched; `oilEarnedWork` is not edited.
**Tests (red first):** `engine/oilmembership.test.ts` — a Personal row with ALL AVAIL: an entry on a weekday and on a
Saturday; an all-day Personal; a cancelled / ⓘ / `kept` row writes none; a Personal row with no placeholder writes none
(an ordinary day's block byte-identical); the crowd earns nothing on the Saturday; the asking loop's entries unchanged.
UI: the count chip on the board and the week, and the window, on that row.

### 1.2 `[CROWD-SIM-BRIEF]` — the ALL AVAIL window does not flag a crowd man's SIM brief / debrief
**Today.** `engine/validate.ts crowdClashes` flags an event that sits inside a crowd man's own FLIGHT brief or debrief
(D36 + D38). His sim brief / debrief windows are `day.simwin` on the collected day (`engine/events.ts`), read only inside
the warning pass, with the sentences built inline there.
**Build.** One body for the two sim sentences (`simBriefSays`, `simDebriefSays`), used by the warning pass (its lines
byte-identical — `tfin.js` 728/0 is the proof) and by `crowdClashes`; the day's sim windows published per day beside the
events (`SIMW`, set where `EVD` is set, same lifecycle); `crowdClashes` takes an optional `simw` as it takes `evs`, so the
issued face reads the RECORD's own windows (`AvailWindow.tsx` hands in `collectEvents()[di].simwin` with the events).
Ground crew stay exempt, as in the pass. Amber, like the pass.
**Tests (red first):** `engine/validate.test.ts` (or `crowdclash` beside it) — an event inside an OFT EP's 15-minute brief,
inside its 30-minute debrief, inside the AMT's BRIEF row window and its DEBRIEF window; outside both (nothing); a man not
on the sim (nothing); the issued-world argument; `ui/availwin.test.tsx` — the row wears the flag and the count under the
list includes it.

### 1.3 `[OIL-READ-LEFTOVERS]` 2 — the second spare sim seat leaves a hole in the stored crew list
**Today.** `engine/slots.ts setSlotVal` writes `r.pax[n]` / `r.more[n]` at the index the seat names. A sim row always shows
one spare seat and, when full, a second (D50); a drop on the SECOND writes past the end and leaves a hole, saved as `null`
inside a list declared as text. Readers guard it; the saved shape is wrong (and the tables are being settled now).
**Build.** Pad with `''` up to the index before the write, in both branches. The trailing-blank trim stays as it is.
**Tests (red first):** `ui/simspare.test.tsx` — fill to two, drop on the second spare: every entry is text, the skipped
seat is `''`, the man sits where he was dropped, the row still offers the first spare.

### 1.4 `[OIL-READ-LEFTOVERS]` 1 and 4 — closed without code
- **1 (the saved-plan preview's chip and its tap disagree):** already fixed by `[ALL-AVAIL-WINDOW]` (23 Sep 26) — the chip
  and the window share one body, `ui/oilmode.ts oilFromWords`, pinned for a parked plan by `ui/availwin.test.tsx`
  ("a PARKED PLAN is not an issued day"). Checked in the walk, then the item says so.
- **4 (a placeholder that reaches a cockpit by copy draws the jet as crewed):** every door refuses a placeholder in a
  cockpit (D33, D47), so no day, template or plan made by this build can hold one — only data stored before 22 Sep 26.
  That is D56: harm only in data already stored, code correct going forward. The walk's door check tries every door
  (palette tap-arm, drag from the palette, drag from another seat, the crew picker); if one lets it in, this becomes a
  real finding and gets the advisory Fable drafted.

### 1.5 `[STORE-READER-SWEEP]` — a stored record read more narrowly than it is written
A read-only sweep (an Opus helper) pairs every reader of stored data with its writers across the three stores, the row
shapes of phases 1–5b included. Each real finding (the app can write a value today that the next load drops or narrows)
is reproduced by a test that writes through the app's own function, reloads through the real reader and compares — red
first — then fixed by widening the reader. The pairs checked and found matching are listed in the evidence sheet.

### 1.6 `[OIL-WORDS]` — stop calling OIL "money" in the code comments
Comments and test titles only, its own commit, after the code. "money" → "OIL" / "the credit"; "paid / pays" → "credited /
earns". **Proof that no code moved:** the production bundle built before and after the commit is byte-identical, and the
unit suite's count is unchanged. Nothing on screen says pay or money (checked 22 Sep 26; re-checked here).

### 1.7 `[OIL-REQ-NAMEBOX]` — a man put in a request row's name box in place of the requester earns nothing
**A walk question for him first** (the item's own words). The walk establishes whether the app has that door (a puck
dropped on a landed request row's name box) and what the day then shows; the question goes to him with the picture.
Nothing is built before his answer. If yes: `landedExtras` treats the name box like the extras, the requester still
excluded, plus a test.
**ANSWERED 1 Oct 26 — D470: yes.** The man in the name box earns as a man added under the row does; the member who filed
still earns on his own answer. Built in this phase, red first (`engine/oilnamebox.test.ts`), walked by the host.

## 2. The rulings that apply (the rules sweep — each walked, pass or fail, in the evidence sheet)
D25 (earned leave, not pay) · D27, D37 (the count shows wherever the puck lands, OIL Earn on or off) · D31 (never a
silent absence; no credit from a guessed time) · D33, D47 (refused in a cockpit at every door) · D36 (the availability
window stays narrow — step to dekit) · D38–D41, D51, D65, D66, D77 (the ALL AVAIL window; a flagged man APPEARS, flagged)
· D43, D46 (a placeholder behaves like named people; allowed on a request row) · D18 (a second man on a request row earns
as the man who filed it does) · D44, D45, D103 (the crowd frozen at publication on every day; a change reads pending and
the sign-offs fall) · D50 (a sim row always shows one spare seat) · D52 (ALL / ALL AVAIL never include ground crew) ·
D54, D56 (stored demo data is not a finding) · D360, D361 (a row with a start and no end) · D468 (a moved request's
extras stay with the old day) · the 28 Aug 26 rule (Personal and SANS Availability never ask the OIL question).
**No clash found** between any two of them for this batch. One reading stated as an assumption until he says otherwise:
a crowd behind a placeholder on a Personal row is COUNTED and earns nothing, as a named man there earns nothing.

## 3. The eight questions (bug-check order §5) — tier FULL
1 earned leave — YES (the OIL evidence block is edited; the credit must not move). 2 the published record — YES (the
crowd frozen at publication gains an entry). 3 saved data — YES (the sim seat list's saved shape; the readers of stored
records). 4 a shared drawer — YES (the count chip, drawn on the board, the week and View-only Sched). 5 a new gesture —
no (none added). 6 a new surface — no. 7 roles — no (unless the sweep finds one). 8 the warning list — YES (two of its
sentences move into one shared body; the window reads its rule).

## 4. The checks, in order
Red tests first per item → the gates → Astra designs the scenarios (one reviewer, D353) → the roll-call and the door
check → the walk (a scripted real browser on the production build, desktop and phone width, the everything-Saturday, a
published day and a working copy, every order, undo / redo / reload) and what it finds fixed red first → the gates under
the PC lock → both reviewers read the final code with the evidence sheet (Fable 5.1 and Astra, blind to each other; D56's
exclusion in the brief) → fix → re-walk what the fixes touched → the gates → the sheet
`docs/handpass/2026-10-01-dbr-phase7-check.md` → his look.

## 5. For him (product, not technical)
1. `[OIL-REQ-NAMEBOX]` — after the walk shows the door: should a man put in the name box of someone else's request earn
   from it?
   **ANSWERED: yes (D470, 1 Oct 26).**
2. (Assumed, his to overturn) a crowd behind ALL / ALL AVAIL on a member's Personal row is counted and earns nothing.

## 6. Build log
*(written as each item lands)*
