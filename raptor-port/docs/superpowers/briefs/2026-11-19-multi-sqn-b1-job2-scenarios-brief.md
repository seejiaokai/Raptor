# Job 2 — the scenario-design brief given to Astra (19 Nov 26)

---

# Scenario design for job 2 — the full check of chat 109's job 1 (multi-squadron batch 1, the fixread2 faults) — Astra's brief (19 Nov 26)

You are Astra, the standing reviewer, asked for ONE job: design the walk's scenarios (the bug-check order's §4, rank 1).
You are not reviewing whether the code is right; you are hunting for what is MISSING from the roll-call and the
scenarios — the surfaces, orders, roles and states a walk of the running app must drive so that a defect in job 1's
fixes cannot hide. Read-only: change no file, run nothing that writes. Return the whole report as your final message.

**Where you are:** an exported copy of branch `claude/multi-sqn-b1-107` at `2b792ebc5`. The app is in `raptor-port/`.
Job 1's source diff is `JOB1-DIFF-src.patch` at this folder's root (from `b63195c56`), its file list `JOB1-DIFF-stat.txt`,
its commits `JOB1-LOG.txt`. The copy has one commit of its own; there is no other git history. If a handoff block is
pasted into your context after a compaction, do not read it, and say so in your report.

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

**Also not a finding:** a scheduler who is not an admin (D785; a member `us`/`us` Ranger, `us9`/`us9` Osprey are in
scope as people who are not schedulers). **Out of scope tonight:** Plan replacing the 'admin' grant level (D2199); each
squadron's own holiday list (D2195 — today one list per place is still built); the shared-place time-zone gate (D2196);
the master's squadron menu (D2197 — today nobody switches the squadron in view from the screen); the words for a posting
the gate refuses for an unforeseen reason (Opus F2 — waiting for his drawing); Admin → Squadrons and Admin → Users'
filtering by squadron (step 5 — Admin → Users still lists both squadrons).

## What was built (the user promise)

Read, in this order:
1. The evidence sheet `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` §"Chat 109 — the fixread2 faults (job 1)"
   — the claim-by-claim table of what job 1 fixed, how, and what it left (F2, Fable's still open 4, 6, 8, `accessreq:`).
2. The faults it answers: `raptor-port/docs/superpowers/briefs/2026-11-18-multi-sqn-b1-fixread2-astra.md`,
   `…-fixread2-opus.md`, `…-fixread2-security.md`, `…-fixread-opus7-open.md`.
3. The plans it followed: `…-fixplan-fable.md` (§4 the order) and `…-fixplan-fable-a3.md` (the master's Archive /
   Restore / Restore as / Delete of another squadron's man writing that squadron's stored Leave War).
4. The diff. The rulings' full rows by `grep -h '^| D2205 |' .claude/decisions-full/*.md`. Area rulings files:
   `.claude/rules/decisions/people-accounts.md`, `inputs.md`, `leave-war.md`, `oil.md`, `tracker.md`, `scheduler.md`;
   the seams `.claude/rules/seams/leave-war.md`, `.claude/rules/seams/tracker.md`. Records: `raptor-port/docs/data-model.md`
   §11 (the permissions table), `raptor-port/docs/data-schema.md`, `raptor-port/docs/notifications-register.md`.

In one paragraph: one guardrail at the commit gate judges every write before-vs-after (G0 a row the loader would drop
or re-key; G1 only a master changes a master's account and account-like fields; G2 the last admin of a squadron is kept,
today and on every new home date; G3 the master mark) — on account rows AND on people and homes. A squadron's Leave War
is changed only by its own admins (the war tells the gate which squadron's world is loaded; a master's posting by a
master). A master's Archive, Restore, Restore as and Delete of another squadron's man now write THAT squadron's stored
Leave War (a store per unloaded squadron, enlisted in the same command — his window, his records, OIL awards from the cut).
A new 149 man's home is written before the war's post-in. Undo / Redo files its change-history line under the
squadron the change was made in. The change history is written and swept only by a squadron's own people (a line's
squadron checked when pushed; `elog:` writes inside a command judged by the line's squadron). A man's inputs are his own
squadron's, members too (each input judged by its people's squadrons before and after). An admin's bell lines and read
marks (`seen:`, `noticeseen:`) are his own squadron's people's; the holiday line still crosses (R32). A squadron's
Tracker is changed only by its own people. A man who moves squadron loses every View / Plan right of his account in the
same command (D2203), its Undo puts them back. The refusal sentences: "Only a master admin can do that" first at every
door (D2205), "Saber is a master admin, so he can't be deleted" first on a master's Delete; the role in force (the raised
developer role) read for refusals.

Seeded sign-ins: `ad`/`a` (Saber, 142 admin AND the master admin), `us`/`us` (Ranger, 142 member), `ad2`/`a2`
(Prowler, a second 142 admin), `ad9`/`a9` (Kestrel, 149 admin — 149's only admin), `us9`/`us9` (Osprey, 149 member).
The walk drives the production build in a real browser at a desktop (1536 wide, Chromium) and an iPhone (402 × 874,
WebKit, touch), each walker in its own fresh browser storage; the developer bridge (`window.raptorRole`, `window.PEOPLE`,
`window.go`, …) on localhost is for READING state only, never for making the fixture. No screen today lets a
plain admin switch which squadron he views; Admin → Users lists both squadrons' people for every admin.

## The host's roll-call so far (find what is missing)

The thing: **a squadron's people and records under job 1's gate** — each door that can write them, for each seeded
sign-in, desktop and phone. Columns: SHOW (the right rows, the refusal in the app's words where refused) · USABLE (the
allowed act works, end to end, and lands only in its squadron) · PAINTED (nothing of the other squadron changes).

Admin → Users rows, and each row's Archive / Restore / Restore as / Delete (a 142 admin, a 149 admin, the master, on a
142 man, a 149 man, the master, the last admin of 149) · the people form (Admin → Users' add / edit — callsign, role,
home squadron, the master mark, grants of View / Plan) · a home move (a man's squadron changed, today and dated ahead)
and its Undo · the Leave War of each squadron: its roster, its postings (post-in, post-out, Delete posting), its records
(leave, OIL awards), its Holidays form · the master's Archive / Restore / Delete of a 149 man, then 149's admin opening
149's Leave War · the Inputs page and the input window, its people picker, a member's own input · the bell, its lines and
read marks (each sign-in's own) · the change history — the changes window ("N new", the day heads) and History — after
an edit, an Undo and a Redo · the Tracker of each squadron · the grants on a person's row · sign-out then the other
squadron signing in on the same tab · a reload and a fresh tab.

## What to hand back

1. **Roll-call gaps:** every door, reader or downstream consumer missing above (a page, a control, a window) that can
   write or show what job 1 guards — with where in the app and why it could differ.
2. **Ranked scenarios, about twelve to sixteen, for about two hours of walking by two walkers one after the other:**
   each with setup (made through the app's own controls), action, EXPECTED (with its source: a ruling, a line of
   §11 or the evidence sheet's table, or two surfaces that must agree — or "RECORD exactly what it says" where you
   cannot settle it), and the observation that would disprove correctness. Must cover: the master archiving, restoring
   (and Restore as) and deleting a 149 man, then 149's admin seeing his Leave War right (his window, records, OIL); a
   plain 142 admin refused on a 149 man at every door, in the app's words; the last admin of 149 kept at every door
   (archive, delete, demote, a home move today and dated ahead); a master's account changed by a plain admin refused;
   a home move dropping his grants and its Undo putting them back; Undo / Redo of a change and the history line staying
   in its squadron; the inputs form's people picker for a 142 admin, a 149 admin and a member; the bell for each
   sign-in after the other squadron acts; each squadron's Tracker; a new 149 man added and his post-in date kept.
3. **Orders:** every pair of actions in both orders that matters here (e.g. the master archives a 149 man before / after
   149's admin opened 149's war in another tab; a home move then Undo then Redo; delete then Undo).
4. **The plain-user round** (D1557) for Admin → Users and the Leave War, for a 142 admin, a 149 admin and the master:
   the everyday tasks start to finish, every control that opens or closes pressed (Close, ✕, Escape, a tap outside),
   every other place that should show the result looked at.
5. **Explicit negatives:** what you checked and found nothing to add.

Name each control as the screen names it, and say where you found it (a file and its line is fine for this report).
