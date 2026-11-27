# Section 2, step U1's fix — the report (Opus builder helper, for chat 205, 26 Nov 26)

Brief: `2026-11-26-msq-s2-u1fix-brief.md`. Branch `claude/msq-s2-users-685735`. **Nothing staged, committed or pushed.**
No build, no full suite, no lock taken.

Status: READY FOR INDEPENDENT REVIEW (a permissions change: the security reader's read of this fix is owed).

## What changed, file by file

- **`src/ui/UsersPanel.tsx`** (the only app file changed; `UserAccess.tsx` and `useraccess-model.ts` untouched)
  - `OpenedOn = { unit, short }` — what the page now holds for EVERY open row: the squadron whose page it opened on and
    whether it opened short or whole (U1 held `null` for a whole row, so nothing ever judged it again).
  - `rowChanged(pid, on)` — one predicate: `pageUnit('own') !== on.unit || foreignHere(pid) !== on.short`.
  - `useOpenRowJudged(editing, editOn, close)` — called at the head of `UsersPanel`, set while drawing (the
    `useUsersFilter` pattern, no effect for the state change): when the open row's judgement changed, the row closes
    (`editing` and `editOn` cleared, so its editor unmounts and nothing typed is carried over). If the page's squadron is
    still the one it opened on (a move landed, an Undo, another's change), the Q13 note is raised — `changedWhileOpenWords`,
    `'warn'`, the existing words — from a `useEffect` keyed on a `{ seq, callsign }` state, not from the draw itself, so a
    draw run twice (the app runs under React's StrictMode) never says it twice. Closed by a pick: no note.
  - `toggle` sets `editOn = { unit: pageUnit('own'), short: foreignHere(pid) }` for every row; `closeRow` clears both and
    is now every row's `onClose`, the archived rows' too, and Escape's.
  - `PersonRow` takes `openOn: OpenedOn`; short = `openOn.short`; draws `ForeignEditor` when short, else `PersonEditor`
    only while `!foreignHere(pid)` (rule 4 — never the whole editor for another squadron's man here, even on a draw the page
    did not judge).
  - `PersonEditor` takes `unit` and has the belt `stillHis()` at the head of Save, Suspend / Enable, Give sign-in, Archive
    and Delete (Delete's first tap too): if `rowChanged(pid, { unit, short: false })`, nothing is sent, the Q13 note, the
    row closes.
  - The short row's own judging again at its Save (`ForeignEditor.save`) is kept as it was.
- **`src/ui/msq-s2-rejudge.test.tsx`** — new, 23 tests (below).
- **`src/ui/msq-s2-row.test.tsx`** — two U1 cases re-pointed, one added (below).
- Not changed: `test-support/msq-world.ts`, `ui/usersfilter-model.ts`, `foreignHere`'s meaning, anything under
  `scripts/handpass/n199/` or `.claude/`. `docs/file-map.md` does not list U1's test file either; I left it for the
  orchestrator (a test file, no app file added).

## The proofs — failed before (on U1's code), pass after

All in `msq-s2-rejudge.test.tsx`, names in plain words, no `zz-` name kept. Each was run against U1's `UsersPanel.tsx` first:
18 failed, 5 passed (the 4 pins of §5 and one control — "a row of the page's own man … stays open, and no note").

| Case | Failed before, on | After |
|---|---|---|
| Opus proof 1, saber | "his sign-in never sent from another squadron's page" — the name became `leak@mail` | pass |
| Opus proof 1, hunter | the same line | pass |
| Opus proof 2, pick 142 | "his own squadron's page: the whole row, dots drawn" — no dots (still short) | pass |
| Opus proof 2, pick 150 | "on 150's page, no 149 line" — `['u149']` | pass |
| A1 | "none of the whole row's controls …" — all five drawn | pass |
| A2 | the same line, Hunter | pass |
| A3 (re-shaped, below) | "the pick closed his row" — still open | pass |
| A4 | "nothing on 149's page suspends a 142 man" — he was suspended | pass |
| A5 | "none of the whole row's controls … for a 142 man on 149's page" — all five drawn | pass |
| A6 | `newSignInNameReadable: true` | pass |
| A7 | "none of it on 149's page" — Give sign-in, its boxes, Archive, Delete drawn | pass |

**A3 is the one proof not kept as it stood:** its premise was "his row is open on 149's page" — the fault itself — so
after the fix it would fail on the premise, not on a fault. The lasting test holds the rule instead: the pick closes the
row; opened again on 149's page it is the short row; after an Undo of the rename its Save sends `[[ranger, { grants:
{ u149: 'none' } }]]` and his sign-in name stays the one the Undo left. On U1's code it fails at the pick (row still open);
the reader's own run showed its original form failing on the Save's call (the whole row sent `{ grants, name }`).

## Tests added (failing first) and re-pointed

`msq-s2-rejudge.test.tsx` §3, the belt — Saber (a master admin, so every door would let the write through; only the
belt stops it) on 142's page; Ranger, or a 142 man with no sign-in, moved to 149 from the 16th; the clock rolled to the
16th **with no redraw** (the test asserts the whole row still stands first — the world's reload does not redraw, so the
belt is tested the way the brief asked):
- "Save: a rename typed before the move landed is not sent; the note names him; the row closes" — before: name became `belt@mail`.
- "Suspend: he is not suspended; the note; the row closes" — before: suspended.
- "Give sign-in: no sign-in is made; the note; the row closes" — before: an account made.
- "Archive: he is not archived; the note; the row closes" — before: archived.
- "Delete, armed before the move landed: the second tap deletes nothing; the note; the row closes" — before: deleted.
Each also checks the note was raised exactly once.

§4, the note:
- "Kestrel has Osprey's whole row open, a rename typed; his move to 142 lands and the page redraws: the row closes, the
  note once, nothing sent; later draws say nothing more" (reopened, it is the short row) — before: row stayed open.
- "Saber opens Ranger's whole row on 142's page and picks 149: the row closes, and no note — the pick was his own" —
  before: row stayed open.
- "a row of the page's own man, opened and left alone across later draws, stays open, and no note" — a control, passed
  before and after (so the rule closes only on a real change).

§5, as-built pins (pass before and after):
- "B1 … drawn with his sign-in name, dots and badge — changes at U3 (the Archived fold is the page's own squadron's)"
- "B2 … his callsign box, Restore and Delete — changes at U3 (the Archived fold is the page's own squadron's)"
- "C1 on 150's page his row is the whole row … — closes before the database step ([MSQ-S2-NO-HOME-ROW])"
- "C2 Mako (150's admin) presses Suspend on that row and Hunter is suspended — closes before the database step
  ([MSQ-S2-NO-HOME-ROW])" — the pin asserts today's behaviour: he IS suspended. (`[MSQ-S2-NO-HOME-ROW]` is the name the
  brief gave; I did not check that an OUTSTANDING item of that name exists — the orchestrator's to file if not.)

`msq-s2-row.test.tsx` (re-pointed by name, none weakened):
1. "his move lands while the row is open: Save sends nothing, the row closes, the note names him" → **"his move lands
   while the row is open: the row closes as the move lands, the note names him, nothing sent"** — closed at the redraw,
   never swapped for the whole row, the note, the spy empty. Before (U1's code): failed, "the row closed as the move landed".
2. "the page's squadron changes while the row is open (150 picked): Save sends nothing, the row closes, the note names
   him" → **"… (150 picked): closed at the pick, no note, nothing sent"** — he is still on 150's page, his row closed, no
   Q13 note, the spy empty, his 149 line still View. Before: failed, "his row closed at the pick".
3. Added, so the check at the short row's Save stays tested: **"his move lands with no redraw while the row is open:
   Save sends nothing, the row closes, the note names him"** (passes on both; it is U1's check).

## Checks run (from `raptor-port/`, one file at a time, `npx vitest run <file>`)

| File | Result |
|---|---|
| `src/ui/msq-s2-rejudge.test.tsx` | before the fix 18 failed / 5 passed; after **23/23** |
| `src/ui/msq-s2-row.test.tsx` | on U1's code 2 failed / 13 passed (the two re-pointed); after **15/15** |
| `src/ui/msq-s2-asis.test.tsx` | 24/24 |
| `src/ui/msq-users-row.test.tsx` | 7/7 |
| `src/state/msq-s2-plan.test.ts` | 4/4 |
| `src/state/msq-s2-order.test.ts` | 14/14 |
| `msq-guard-g` 13, `msq-guard-rollcall` 17, `accounts-newperson` 26, `accounts-ui` 21, `msq-fix2-users-moved-admin` 1, `msq-fix3-users-one-save` 3, `msq-squadrons-panel` 17, `msq-users-filter` 24, `onedoor-users` 22, `rolestable` 12, `adminclear` 15, `msq-admin-config` 3, `msq-clear` 6, `msq-fix3-admin-panel-undo` 4, `postout-landing` 4, `reshape-b2-no-guest-switch` 3 | all pass |

22 files, 278 tests, all green after the fix. Also: `npx tsc -p tsconfig.app.json --noEmit` exit 0 (supporting only —
the build is the real type check, NOT RUN by the brief). `npx eslint` — NOT RUN in effect: the project has no ESLint
config (its lint is React Doctor); `npm run lint:changed` ran but, as at U1, could not read `origin/main`'s side and
compared nothing. `npm run build` — NOT RUN (the brief's limit).

## Where the rule was unclear, and what I chose

- **Delete's first tap.** The brief says a belt "at the head of every write". The first tap only arms; I put the belt at
  the head of `del` all the same, so a first tap on a row that changed under it also closes with the note. The test arms
  before the landing and checks the second tap.
- **The archived rows** go through the same `toggle`, so they too are held as opened, and closed by a pick or a change of
  judgement. That changes nothing for the B pins (on an unchanged page their judgement does not change) and only means an
  open archived row closes at a pick — the agent's reading of "one rule, every row".
- **Where the note is raised.** Raised from an effect after the closing draw, not during it, because the app runs under
  StrictMode, where a draw can run twice. The row's closing itself is set while drawing, as asked.
- **A sign-in change** (another person signed in on the same browser, which a test world does) changes the page's
  squadron, so it reads as "the page's squadron changed" — closed with no note. Not a case a person meets on one screen.

## What a person would see differently

Only this, with no new words anywhere: an open row on Admin → Users now closes by itself when the squadron in view is
picked (no note), and when the man's row changes under it with no pick — his move landing, an Undo, another admin's
change — with the existing amber note "<Callsign>’s row changed while it was open, so nothing was saved. Open it
again." And where his move lands with nothing redrawn, pressing any of the whole row's buttons gives that same note and
closes the row instead of acting.

## Not done, found, not changed

- Not mine, untouched: "Edit on 142 →", the refusal at a pick (the core's K4), the unsaved flag (K1), the Archived fold
  (B — U3's), the no-home fail-open (C — the database step).
- A browser check of the closing at a pick and at a landing is owed (the walk).
