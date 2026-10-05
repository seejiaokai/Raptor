# The read brief — Claude's one check of the Codex stack (D589) — pass 1: the inventory and the leads — 5 Oct 26

One reader, one PIECE of the stack. You are Opus 5.5; Codex (Sol 6.1, planned by Astra) built this stack between 2 and
5 Oct 26 while Claude waited, and no Claude model has checked it as a whole. You READ. You change nothing, build nothing,
run no test, no server and no gate (one PC, one lock — other helpers are working beside you). Your piece, its commits and
its starting documents are in the message that gave you this brief.

**The stack** is the branch `claude/codex-stack-review` (its app code is commit `bcc69fc8`), against `main` at
`de470db5`: Discard marks removed · Rally / work hours · Insights' mission mix · the workflow UI pass (the stylesheet
split, the phone board repair, the Tab route, the phone Insights menu, the tapered wing with the Logic search and the
Insights cross) · the failed-save warning's band. One piece's diff: `git show <commit> -- raptor-port/src raptor-port/e2e`;
the whole stack's: `git diff de470db5 bcc69fc8 -- raptor-port/src`. Read the code AS IT STANDS at the top of the stack
(later pieces changed earlier ones) — the diff tells you where to look, the current files are what ships.

**Read first:** `raptor-port/docs/bug-check-order.md` §2, §2b, §4 (from "The brief that turns a reviewer into a
finder"), §6, §7.3–7.6; `raptor-port/CLAUDE.md` §Architecture rules (the mutation funnel, the persistence funnel);
the area rulings your piece names, one line each in `.claude/rules/decisions/<area>.md`, and — before leaning on any
ruling's detail — its full row: `grep -h '^| D509 |' .claude/decisions-full/*.md` (the shell; a long row is hidden by the
Grep tool). Codex's own evidence sheet for your piece is STARTING MATERIAL, never proof: it was written by the side that
built it.

## What to produce — three tables and a list

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

1. **THE ROLL-CALL (order §6).** Name the THING each change attaches to (a formation's Blue/Red answer, a wave's
   reporting line, a text box on the Tab route, the warning band, a window's surround, the amendments box …). Then list
   EVERY place the app draws or reads that thing — found by searching the WHOLE current source for every call site of the
   shared routine and every kind of row or page that can hold it, not by reading the diff. One row per place, three
   columns: does it SHOW the new mark or words · is the new control USABLE there · what else is PAINTED on the same
   pixels (a chip, a tag, a ring, a sticky bar, a window). Every cell is **YES** (file and function), **NO, because …**
   (the ruling or the reason), or **MISSING**. No blank cell, no bare "n/a". Include: Edit Schedule's week, View-only
   Sched, the Scheduler Board (desktop layout and phone layout), the next-week peek, a look at an older version, the
   published face against the working copy, print and CSV, the changes window and History, Insights, the Logic page, the
   Inputs calendar, the Medical view, the Leave War and its OIL tracker, the Tracker, the phone drawer, every pop-up
   window — each either a row or a one-line reason it cannot hold the thing.
2. **THE DOOR CHECK.** For every action the data allows on that thing, the on-screen control that does it — in each
   state (a day not published / published with nothing waiting / published with changes waiting / a look at an older
   version), for each role (admin, the admin's member view, a member, a guest, a person signed in with no access), at
   desktop and phone width. A state the code permits with no control, or a control drawn where the write path refuses,
   is a finding.
3. **THE ORDERS (§7.4).** Each pair of the piece's own actions in both orders; across the publish line (before
   publishing, after, after an amendment, after an Unpublish); then Undo, Redo, a reload, a sign-out and sign-in, a
   second week, and the storage reset. One row each with the result the rulings require.
4. **THE LEADS.** Every place where the code looks WRONG or a call site looks MISSING. A lead counts only with a
   concrete failure: the exact steps a person takes in the running app, what the ruling says should happen, what the
   code will do instead, the file and function, and the exact fix, step by step (D489 — a claim without those is not
   reported). Rank them, most serious first, and say for each whether `main` (`de470db5`) does the same
   (`git show de470db5:<path>`). Then **explicit negatives**: "I checked X and found nothing", one line each — an
   all-clear is evidence only when it names what was checked.

## What is NOT a finding

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Also not findings: code style, naming, file size, a tidier way to write something (the tidiness note is a separate job);
`src/engine/` is a verbatim port in a compressed one-line style — judge what it does, not how it reads; anything a ruling
says to leave (search `.claude/rules/decisions/` and `OUTSTANDING.md` for the subject before reporting a behaviour as
wrong — it may be ruled, or already filed).

## Where your piece is high-consequence, read for these first

Earned leave (OIL — time off banked) decided from the live copy instead of the published one · a write that skips the
mutation funnel (`slotVal` / `setSlotVal` / `txtSet` → `noteChange` → `afterSchedMutate`) or ends outside a command, so
it is not saved, wears no mark or is never re-checked · a change on a published day that moves something without an
amendment, or an amendment that moves nothing · a sign-off that falls when it should hold, or holds when it should fall
· a role allowed at the page but refused at the write path, or the reverse (`src/state/perms.ts` is the one place) ·
something stored that does not come back after a reload, an Undo or the storage reset · a warning whose wording or
target changed on one screen and not another.

## How to return it

Write your report to the file named in your message (under `raptor-port/docs/handpass/parts/`), with the Write tool —
that one file is the only thing you create. Sections in this order: Roll-call · Doors · Orders · Leads (ranked) ·
Explicit negatives · What I did NOT read, and why. Then reply with: the file's path, the count of MISSING cells, your
leads as one line each (most serious first), and anything you could not settle by reading that only the running app can
show. Keep the reply under 500 words; the file holds the detail.
