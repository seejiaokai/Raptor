# The reshape's walk — the scenario-design brief given to Astra (21 Nov 26, chat 131)

---

# Scenario design for the full check of the multi-squadron reshape (batch 1) — Astra's brief

You are Astra, the standing reviewer, asked for ONE job: design the walk's scenarios (the bug-check order's §4, rank 1).
You are not reviewing whether the code is right; you are hunting for what is MISSING from the roll-call and the
scenarios — the surfaces, orders, roles, days and states a walk of the running app must drive so that a defect in the
reshape cannot hide. Read-only: change no file, run nothing that writes. **State each gap and each scenario in your
output the moment you have settled it** — a run can be stopped by its service, and what was said before the stop is
kept. Return the whole report as your final message. If a handoff block is pasted into your context after a compaction,
do not read it, and say so in your report.

**Where you are:** an exported copy of branch `claude/multi-sqn-b1-107` at `@@HEAD@@` (no git history; the branch's
handoff block is blanked; the evidence sheet's reads section and the reader reports of this round do not exist yet). The
app is in `raptor-port/`. At this folder's root: `RESHAPE-stat.txt` (the files the reshape changed under
`raptor-port/src`, from `078bc2f7e`) and `RESHAPE-LOG.txt` (its commit messages, oldest first).

## The finder wording (use it)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat. If the app would do it again to NEW data, report it.

**Also not a finding:** a scheduler who is not an admin (D785 — every scheduler is an admin; a member and a person with
no sign-in stay in scope). "No screen saves a move of squadron yet" — the walk saves a move through the developer
bridge as SETUP only, and every control it checks is pressed on screen; design scenarios as if a move exists. The guest
view is removed on purpose (D2239). **Held, on purpose** (the plan §8 and the backlog item's list): K2, K3 (the gate
trusting the page's own memory), A3 (people made on a shared store before its first boot), B7 ("Request access" names
no squadron — step 5, unbuilt), C7 (sign-out's reload), C10 (a measure); Admin → Squadrons and a screen that gives View
or Plan (step 5 and P1/P2, unbuilt — Admin → Users still lists both squadrons); the Tracker is not re-read in place at
midnight (the plan §14 item 3 — after his own move it changes at the next sign-in; the war and the schedule change at
midnight); the midnight band says the generic "This change could not be saved." where his home did not change that day.

## What was built (the user promise)

Read, in this order:
1. The reshape plan `raptor-port/docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md`: its head ("For him, in
   five lines"), §1 (the 35 faults at a glance — where each one goes), §11 (what a person sees), §12 (his eight
   questions and their answers), §13 (the walks the plan asked for), and each piece's own walk and risk section — §3.5,
   §4.6, §5.5, §6.5 — then §7 (the one-by-one fixes) and §19 / §19b (the Plan audit's and the blind read's items).
2. The evidence sheet `raptor-port/docs/handpass/2026-11-21-msq-reshape.md` — the eight answers, the host's roll-call
   (its rows are below), the cases already carried by a test.
3. The faults the reshape answers: the 35, in `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` §Fix read 17 and
   the proofs under `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/` and
   `…/2026-11-20-msq-plan-audit-repro/`.
4. The approved drawings: `raptor-port/docs/mock/2026-11-20-multi-sqn-reshape/` (the Leave War's rows across a move,
   the midnight band, Q8's words).
5. The rulings' full rows by `grep -h '^| D2243 |' .claude/decisions-full/*.md` (the same for each: D2191, D2192, D2194,
   D2199, D2201, D2202, D2203, D2205, D2211, D2218, D2221, D2223, D2225, D2228, D2239–D2243, D2245–D2250, D2252, D2253).
   The area pages: `.claude/rules/decisions/people-accounts.md`, `inputs.md`, `leave-war.md`, `oil.md`, `tracker.md`,
   `scheduler.md`. Records: `raptor-port/docs/data-model.md` §11, `raptor-port/docs/notifications-register.md`.

In one paragraph (the host's summary of the plan — where it and the plan differ, the plan and the rulings win): every
"whose is he, on which day" question now has one answer that always takes its day — a man who moves squadron is his old
squadron's up to the day before and his new one's from the move day, on every page: the Inputs list, calendar and
window, Edit Schedule's day panel, crew list and sign-off boxes, publish and sign, Quals, Medical, the SANS calendar,
the OIL answer list, the Leave War's rows (drawn: his row in each squadron's war, the days not that squadron's shown as
drawn) and its posting pass, the Tracker, the bell. His View and Plan of other squadrons end at the start of his move
day and never come back; one check judges homes, places and rights as dated rows; one last-admin rule holds at every
door (Suspend, Demote, Archive, Delete, a posting, a move, a re-link, "+ New squadron") for every date, with one words
table; an admin holding Plan of a squadron has full access to it. The posting passes run over every squadron. Undo and
Redo keep each step with the squadron it was made in — a step in a squadron he can no longer enter is passed over or
said blocked. At midnight on his move day the page changes to his new squadron without a reload; a window he has open
is held and a band says so (drawn). A holiday list and the OIL answer list are each squadron's own. An input's late mark
goes by its own squadron's cut-off. The waiting screen no longer offers a read-only look at the schedule.

Seeded sign-ins (name / password): `ad`/`a` (Saber, 142 admin AND the master admin), `ad2`/`a2` (Hunter, a second 142
admin), `us`/`us` (Ranger, 142 member), `ad9`/`a9` (Kestrel, 149's only admin), `us9`/`us9` (Osprey, 149 member). The
walk drives the production build in a real browser at a desktop (1536 × 864, Chromium) and an iPhone (402 × 874,
WebKit, touch), each walker in its own fresh browser storage, the page clock installed by the script (so the day
before a move, the move day, the day after and 23:58 → past midnight can each be reached with the page open). The
developer bridge on localhost is for SETUP of a move and for READING state only.

## The host's roll-call so far (find what is missing)

The thing: **a person who moves squadron, and each squadron's own people, records and rights, on every day** — each page
that shows or writes them, for each seeded sign-in, desktop and phone. Columns: SHOW (the right people and records for
the day, the refusal in the app's words where refused) · USABLE (the allowed act works end to end and lands only in its
squadron and its days) · PAINTED (nothing of the other squadron, or of the other side of the move day, changes).

Inputs — list, filter, deleted and archived groups · Inputs calendar — notes, day titles, their edits and Undo · the
input window — people picker and Save across a move (Q8's words) · Edit Schedule — day panel, crew palette, free all
day, ALL AVAIL crowd · Edit Schedule — sign-off boxes · publish and sign — the frozen roster · Quals · Medical counts ·
SANS calendar and day · the OIL answer list · the Leave War — rows across a move, a day now another squadron's · the
Leave War — posting pass, held note · the Tracker — people, the change at the next sign-in · Admin → Users — Suspend,
Demote, Archive, Delete of a last admin · Admin → Users — re-link, Restore, Delete and their Undo · "+ New squadron"
(no screen yet) · the bell — posting lines to a squadron's admins · the top bar's Undo / Redo — steps across the
midnight change · the midnight band on a Leave War window and a Tracker pop-up · the waiting screen with no guest view.

## What to hand back

1. **Roll-call gaps:** every page, control, window, reader or downstream consumer missing above that shows or writes
   what the reshape changed — with where in the app (a file and line is fine) and why it could differ. Look hardest at
   readers of "whose is he on a day" that the reshape's own lists (`RESHAPE-stat.txt`) do NOT touch.
2. **Ranked scenarios, about twenty-four to thirty, for a walk fanned out over four or five walkers in parallel:** each
   with setup (through the app's own controls, except the move itself), the sign-in, the day the clock stands on,
   action, EXPECTED with its source (a ruling's number, a plan section, a line of §11, an approved drawing, or two
   surfaces of the app that must agree) — or "RECORD exactly what it says" where you cannot settle it (a count, a
   refusal's words, a published day's state above all) — and the observation that would disprove correctness. Mark each
   desktop, phone or both. Must cover: each page above on the day before, the move day and the day after, for the man
   who moved and for a man who did not; an input stretched across his move, saved by each squadron's admin; the
   sign-off boxes and publish and sign for a day he was the old squadron's; OIL answered for each squadron's own
   holiday; the Leave War's Undo of an entry on a day now the other squadron's, from a cell of two and of one; every
   last-admin door with its words, and Undo and Redo of each allowed step; a re-link and its Undo; an admin with Plan of
   149 working 149's pages (Plan is given through the bridge as setup); midnight with nothing open, a Leave War window
   open, a Tracker pop-up open, then Undo; a member's refused bid showing no Move; the waiting screen.
3. **Orders:** every pair of actions in both orders that matters here (a move then Undo then Redo; a leave filed before
   and after the move is saved; the posting pass before and after the other squadron's admin acts; a window opened
   before midnight and saved after).
4. **The plain-user round** (D1557) for each seeded sign-in: the everyday tasks start to finish on Inputs, the schedule's
   day panel and crew list, publish and sign, Quals, Medical, the SANS calendar, the Leave War, the Tracker and Admin →
   Users; every control that opens or closes pressed (Close, ✕, Escape, a tap outside), every other place that should
   show the result looked at.
5. **A split into five walkers' shares** that never need the same fixture, each about equal, with which scenarios need
   the clock moved.
6. **Explicit negatives:** what you checked and found nothing to add.

Name each control as the screen names it, and say where you found it.
