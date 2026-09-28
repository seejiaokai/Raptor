# Walk brief — Phase A of the change-recording re-test: walk the one Undo AS IT IS TODAY (28 Sep 26)

You are a walker (Opus). You drive the REAL production build in a scripted real browser and return pictures and a filled
table. **You change no app code** (`raptor-port/src` is off limits). You MAY create walk scripts under
`raptor-port/scripts/handpass/` named `cr-<your id>-*.mjs`, and pictures under
`raptor-port/docs/img/handpass/2026-09-28-change-recording/<your id>/`. Nothing else. Do not run the unit tests, the
build, the e2e suite or the gates (other chats share this PC; the build you drive is already served). Do not commit.

## The world
- The production build is served at **http://localhost:4173/** (already running — do not start or stop it). Open the ROOT.
  A fresh browser context starts with empty storage = a fresh demo world. **Never** `?fresh=1` (it forces memory storage
  and a reload would lose the world).
- Sign in: `#luser` / `#lpass` / `#loginForm button[type=submit]`; `ad` / `a` = Saber (admin), `us` / `us` = Ranger
  (member). Wait for `#vWeek .day` (attached). Sign out: the "Logout" button (on a phone it is in the ☰ drawer).
- The localhost probe bridge (dev PC only): `window.go('<page>')` with pages `editsched`, `viewsched`, `inputs`, `quals`,
  `logic`, `leavewar`, `tracker`, `help`, `admin`; `window.CURPAGE`; `window.openScheduler(di)` (the board, day 0–6 of
  the loaded week), `window.closeScheduler()`; `window.loadWeek`, `window.INPUTS`, `window.DAYS`, `window.SCHED`,
  `window.undo` (= the one Undo), `window.lwSetRole` / `window.raptorRole` (role in place, never a second sign-in on an
  unwritten world — bug-check order §7.7). Prefer the app's own controls for every gesture you are testing; the bridge
  is for getting to a place and reading state.
- The demo week is Mon 13 – Sun 19 Jul 26 (the weekend is a non-flying duty weekend); a second authored week starts Mon 20
  Jul. The calendar date is 28 Sep 26.
- **The Undo / Redo doors today:** the top bar's `#undoBtn` / `#redoBtn` (Edit Schedule ONLY), the board's `#sbUndo` /
  `#sbRedo`, the Leave War's `[data-testid="lw-undo"]` / `[data-testid="lw-redo"]` (its Period row). A button's `title`
  is its label ("Undo — a change to the schedule") or, greyed, why. Every Undo / Redo pops a short toast (`#toastEl`):
  "Undid: …" / "Redid: …" or a refusal. There is no keyboard Undo.
- Templates to copy: `raptor-port/scripts/handpass/cr-base.mjs` (this re-test's baseline — its step / shot / results.md
  pattern), `dp-walk.mjs` (a long recent walk: publishing, signing, the changes window), `lib.mjs` (helpers: `tap`,
  `board`, `openInputs`, the `B()` scoping of board selectors — the board is drawn twice, desktop and phone twins).
  Publishing a day: its four sign-off boxes (CUR CK, SKED CK, PLANNED BY, APPROVED BY) each need a name, then "Publish day".
- Widths: desktop **1440×900** and phone **390×844** (`isMobile: true, hasTouch: true`). Every scenario at BOTH unless it
  says otherwise.

## The rule you work by (the bug-check order, `raptor-port/docs/bug-check-order.md` §7 — read §7.2–§7.8)
Each step ASSERTS the right behaviour (PASS = the app did what it should), saves a picture, and you OPEN every picture
you save before the step counts (anti-pattern 21). A gesture you cannot make through the app's own controls is itself a
finding (a missing door) — say so, do not inject it. Record every console error and page error.

**What is NOT a finding (owner, D56):** the stored world is demo data, cleared before the database step. Do not report
harm that exists only in data already stored when the code is already correct going forward.

## What "right" is
`raptor-port/docs/undo-contract.md` (read it first), the register rows AM32–AM39d in
`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`, and the scenario lists
`raptor-port/docs/superpowers/briefs/2026-09-28-change-recording-scenarios-fable.md` (S-numbers) and `…-astra.md`
(numbers), which say for each scenario what the screen must show and what proves it wrong. The rulings: D148 (undo only
your own; clears at sign-out), D292 (the admin's member view), D263 (every undo writes a line in the change history),
D98 / D103 (back to what was published reads nothing pending; the four sign-offs come back), AM39c (undo of a publish
unpublishes it; its redo lands published with the four cleared).

## Your scenarios
**Walker A1 — the schedule and the board:** Fable S11, S12, S13 (skip if the October setup cannot be built through the
app in reasonable time — say so), S14, S16, S24, S25, S27, S28, S32; Astra 16, 17, 22. Add: a wave added then undone, a
row deleted then undone, a section dragged then undone — on the board AND the edit week, then Redo each.

**Walker A2 — inputs, the Leave War, roles:** Fable S6, S9, S10, S15, S23, S30, S31; Astra 14, 15, 21, 23, 24; and on
the Leave War: a bid placed, a bid decided (Approve), a bid moved (the Move button), an approved leave removed, an OIL
award given (+OIL), a ⚙ setting changed, the stage advanced — each undone and redone from the Leave War's pair, and one of
them undone from Edit Schedule's top bar. For each undo / redo: the changes window (Edit Schedule's clock) shows its
"Undo — …" / "Redo — …" line on the right day (D263).

## What you return
Your final message: a table — scenario id · width · what you did · what the screen showed · PASS / FAIL · picture file(s)
— then **findings**, each with: the steps to reproduce from a fresh world, what showed, what should have, the picture,
and whether it is new (you may check `main`'s behaviour is the same build — it is: nothing under `raptor-port/src` has
changed on this branch). Then **what you could not walk and why**. Plain words; the owner may read it.
