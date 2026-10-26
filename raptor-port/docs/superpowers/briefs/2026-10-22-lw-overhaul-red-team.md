# Brief — the red team of the whole Leave War overhaul design (D1204, night of 21–22 Oct 26)

**His words (D1204):** "Should u just work on red teaming the total design? Like use the /design skill to think on the
changes we discussed for design makes sense etc. before we even build it … We have many designs we discussed just now
make sure they interact properly. Down to the minute details on like gestures, how the screen set up should be, does it
take a lot of taps to get to one place etc. the position of the buttons, alignment, edit ability. Red team some what
ifs. Does the app hold up well etc. plan it well before we build" — then "/impeccable should help too", "Also /design
as well" (read as the design guide).

Two readers run this, each independently and blind to the other: **reader A — the design** (how it looks and is used)
and **reader B — the what-ifs** (whether it holds up). You are told which one you are. Neither wrote any of it.

## What to read (both)

- The rulings: `.claude/rules/decisions/leave-war.md` — the table's top, D1141–D1207 (and §Settled, §Architecture).
  A full row by the shell: `grep -h '^| D1177 |' .claude/decisions-full/*.md`. The owner's other rulings that bear on
  it: the general ones in `.claude/rules/decisions/how-we-work.md` (loaded) and `oil.md`, `inputs.md`.
- The design note: `raptor-port/docs/superpowers/specs/2026-10-21-leave-war-overhaul.md` — §5 (his answers), §6
  (the build sketch), §9 (the full mock-up).
- The drawings: the page `raptor-port/docs/mock/lw-overhaul/full-page.html` names each current picture; the pictures
  are in `raptor-port/docs/mock/lw-overhaul/full/` (open them with the Read tool and LOOK). Tonight's new ones are
  `full/r6-*.png` (the person window and its balance lock, "since your last visit", the Settings window); their
  helpers' write-ups are in `raptor-port/docs/superpowers/briefs/2026-10-22-lw-overhaul-night-drawings-results.md`.
- The app as it is today, at `http://localhost:4197/` (already running — never stop it). Sign in as admin `ad` / `a`
  (Saber) or member `us` / `us` (Ranger). You may drive it with a Playwright script (see `raptor-port/docs/mock/lw-overhaul/full-lib.mjs`
  for sign-in helpers; write scripts with the Write tool into your own scratch folder, run them from `raptor-port/`).
- The design guide `raptor-port/docs/design-practices.md` — §0, §1, §1b, §3, §4, §5a, §6, and every lesson in §9.

## Reader A — the design

Invoke the `impeccable` skill (`critique`) on top of the design guide; his rulings win where they meet. Then:
1. **Walk every task** a member and an admin do, phone (390 wide) and desktop (1536): place a bid (one day, a range, a
   half day), see his balances, check his next leave, correct a balance, attach a document, see what changed since his
   last visit; an admin: open dates for bidding, decide one request, decide all for a period, approve while placing,
   rename a row, set the amber / red points, add the Management group, lock balances, import holidays, add an event.
   For each: **count the taps** from opening the Leave War, name every screen passed through, and say where it is too
   many or a dead end.
2. **Places and alignment:** the same button in the same place on phone and desktop (lesson 28); one main button a
   view; columns that line up (lesson 29); nothing over what it is about; words that only repeat what the screen shows
   (D846); the colours (D1175 look F, the guide's §4 — no colour spent twice); the marks (one mark, one look).
3. **Gestures:** tap, long press, drag, pinch (D1117), swipe — what each does on each screen; any gesture with two
   meanings, any that nothing on screen suggests, any that fights scrolling.
4. **Editing:** what can be edited, by whom, where — and whether the place to edit is where a person would look.
5. **The pieces together:** where two rulings' drawings meet on one screen (the top rows: View · + New · Approvals ·
   the open-dates chip · under-manned · Legend · My leave; the bid window; the day panel; the person window; Settings),
   do they fit, at 390 wide and on his iPhone's wider letters?

## Reader B — the what-ifs

Does the design hold up? Try each and say what the screen would show and whether any ruling covers it:
two admins deciding the same request at once; a member bids while the admin closes those dates; a bid that runs
across a closed stretch, a month's end, or two periods; a member edits his balance while the admin locks; the admin
locks then unlocks; a balance edited to below what he has already booked; Undo after an approval that sent a bell
notice; Undo of opening a month; a renamed Required or Available row (the SANS calendar and the Calendar window read
them); an amber point set above the red; Approve all where one line clashes; a man posted out with bids waiting; a SANS
man; a past date; a leave filed on the Inputs page on a closed day (D1166) and how it shows in Approvals and "since
your last visit"; a document on a bid that is refused, put back, moved; the Management group and a man in two groups;
the year turning over (D1148's year picker, balances per year — [LEAVE-YEAR] is unbuilt); his iPhone's wider letters
on the top rows; a slow phone (the grid's speed rules, `raptor-port/docs/performance.md` §E); a member with no row; no
period yet ("No leave period yet"); the shared database to come (who may write what).
Check each against the CODE where today's behaviour decides it (`raptor-port/src/leavewar/`), and name the file.

## What is not a finding (D56, D489)

A problem that lives only in data already stored is not a finding (the store is demo data, cleared before the database)
— unless new data would be hurt too. A claim is a finding only with a concrete failure (the screen or the task, what
the person meets), its cause, and its exact fix. A fix that would change what a ruling of his means is written as a
**question for him** with a recommended answer — never presented as settled.

## Return (under 1,200 words), and change no file but your one report

Write your report to `raptor-port/docs/superpowers/briefs/2026-10-22-lw-overhaul-red-team-<A|B>.md`, then return it:
findings numbered, most serious first, each: the screen in the app's words · what goes wrong · the cause · the exact fix
(and, for reader A, the tap count before and after) · "question for him" where it changes a ruling. Then a short list of
what you checked and found sound. Do not commit or push.
