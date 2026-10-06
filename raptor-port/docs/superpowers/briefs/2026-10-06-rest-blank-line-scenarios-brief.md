# Scenario-design brief — the crew-rest fault `[REST-BLANK-LINE]` (D602) — the FULL check — 6 Oct 26

You are designing TEST SCENARIOS for a walk of the running app, and hunting for what is MISSING. You are not reviewing
code for style and you are not asked whether the code is "clean". Work READ-ONLY: change nothing, build nothing, run no
test and start no server. Report as your final message, in the format at the foot.

**The state of the code you read.** Branch `claude/rest-blank-line`, cut from `main` at the merge of PR #481. THE FIX IS
NOT BUILT YET — you are reading the faulty code, on purpose, so that your scenarios come from what was promised and not
from what a builder happened to write. Opus 5.5 builds it after your report.

**Read first, from the live files:**
- the fault as filed: `OUTSTANDING.md` `[REST-BLANK-LINE]`; the reader's finding and proposed fix:
  `raptor-port/docs/handpass/parts/stack-read2-AB.md` F1;
- the owner's rulings — one line each in `.claude/rules/decisions/scheduler.md`, `oil.md`, `how-we-work.md`, each
  ruling's full row by `grep -h '^| D185 |' .claude/decisions-full/*.md`. The ones that govern this: **D602** (fix it
  first), **D183, D184, D185, D188** (a crew-rest breach, its ring and the dotted "breaks tomorrow's crew rest" mark stay
  LIVE on a published day's face), **D179** (everything else on a published day freezes), **D469, D472** (a hidden
  warning), **D503, D505, D506** (a reporting clock later than its take-off is the previous day; the earliest applicable
  in-time / Rally), **D509**, **D56** (below);
- the settled crew-rest rules: `.claude/rules/decisions/scheduler.md` §Settled before this list (the SC in-time; "The
  flagging engine reads across week boundaries"; "A new flying line comes up blank"), `raptor-port/docs/engine-rules.md`
  (crew rest), `raptor-port/docs/ui-contracts.md` §Three crew-rest rings, `raptor-port/docs/feature-impact.md` Flow F;
- the method: `raptor-port/docs/bug-check-order.md` §2, §2b, §6, §7; and `raptor-port/CLAUDE.md` "The rules-engine
  robustness doctrine" (its full text: `raptor-port/docs/guide-full.md` §The rules-engine robustness doctrine) — the
  owner's FIVE gotcha families must each be walked: people not following the format · missing input · user errors ·
  deletions and edits from another page · sync between copies;
- `.claude/rules/raptor-executor.md` (the builder's rules — you never approve, and the reviewer is never bypassed).

## The promise

A man needs 12 hours of rest before he flies. When he ended late yesterday and is told to report inside those 12 hours
today, the app says so: a red "Crew rest breach" line in today's warning list, a red ring and a CR chip on his puck
today, and a dotted "breaks tomorrow's crew rest" mark on yesterday's puck with its trace line; the crew picker refuses
or warns ("crew rest — not clear until …") before the drop; an SC seat stays closed to him until he is clear. A softer
amber "Tight turning" note covers the nominal report. The same day's "Tight turn" note covers two sorties too close
together.

**The fault.** "+ Line" adds a flying line that comes up BLANK (no take-off, no landing). Put that man in its seat and
the breach he already had — the warning, the ring, the dotted mark — all disappear, although nothing about his rest
changed. A blank crewed line on YESTERDAY, in a wave drawn before his late landing, likewise stops today's breach ever
being raised. The same-day tight turn can be missed the same way. Cause, as read: the blank line's times are
not-a-number and every comparison with them is false (`raptor-port/src/engine/validate.ts`, the crew-rest pass
`crewRestDay` — yesterday's last end, today's earliest report — and the same-day tight-turn pairing;
`raptor-port/src/engine/events.ts` `buildDay` mints the leg). Run through the rule on 6 Oct 26, not on screen: the
warning goes when he is put on a line with no take-off (his own day, or the day before), comes back when a take-off is
typed there, a landing not needed; a landing alone does not bring it back.

**What "fixed" must mean:** a line with nothing to measure neither raises a breach of its own nor hides one that his
other commitments raise. The count of a man's sorties that deliberately includes a timeless line (the "double turn"
chip) stays as it is.

## What I want from you

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Specifically:

1. **Every reader of the crew-rest result.** Name each place the app shows or uses it — the warning list on each page
   that has one, each puck drawer (week, board, published face, the version look, the next-week peek, print / export if
   any), the dotted mark and its trace line, the "Breaks Monday" forward trace across a week boundary, the crew picker's
   pre-drop line and its struck names, the SC seat's "not clear yet", the drop toast, Insights' issue counts, the Logic
   page's prose, a hidden warning — and say for each whether the fault reaches it and how a walker would SEE the fix
   there.
2. **Every way a leg ends up with a time that is not a number**, through the app's own controls: "+ Line", "+ Wave", a
   wave or day template, a take-off cleared after it was typed, a landing typed with no take-off, a take-off with no
   landing, something typed that is not a time, an SC / AVALON / BB line with blank times, a cancelled line or aircraft,
   a line on the previous week's Sunday or next week's Monday, a saved plan brought out, an older version loaded onto
   the working copy, Undo / Redo. For each: which of the three places in the rule it reaches.
3. **The cases a simple "skip the line with no take-off" would get WRONG.** In particular: a line with no take-off but
   a typed Brief, or sitting in a wave with an In-time / Rally line — today the typed Brief alone can raise the breach
   when it is his only line; would a skip lose that? An SC line with a typed in-time (its B box) and no shift start. A
   line with a landing and no take-off as YESTERDAY's last event. A man whose ONLY line today is blank and who has an
   earlier meeting inside his 12 hours.
4. **Siblings — the same kind of fault elsewhere.** Every other rule in the engine that a crewed line with no times
   silences or distorts (leave / downchit against a sortie, the clash rules and their sort, the long day, the 7-day run,
   SANS, the brief and debrief windows, AAR, qualification, the ALL AVAIL crowd, Insights). For each: is it silent on
   purpose (nothing to measure), or is a warning lost that does not depend on the missing time? Give the exact lines.
5. **Orders.** The warning before and after each step, in both orders, on a day not yet published and on a published
   one (the breach is live on its face — D185 — so it must neither make the day pending nor vanish), with Undo, Redo and
   a reload after each.
6. **The five gotcha families**, each with at least two concrete scenarios for THIS change.

Two small owed reads ride with this run (`OUTSTANDING.md` `[R3-OWED-READS]`) — answer each in its own short section:
(a) `raptor-port/src/ui/schedule-tab.ts`: the Tab that keeps the caret in a day's last box looks its day up again when
the redraw replaced it (D597; its test: `raptor-port/src/ui/schedule-tab.test.tsx`, "D597 when the redraw at that Tab
replaces the whole day …") — is that fix sound, and what does it miss? (b) the short lines of **D602, D603 and D604**
(`.claude/rules/decisions/how-we-work.md`, `scheduler.md`) against their full rows in `.claude/decisions-full/` — does
any short line change what its full row means (D138)?

## Report format

1. **Roll-call** — a table: the place · does the fault reach it · what the walker should see once fixed.
2. **Scenarios, ranked** — each: id · setup through the app's own controls (the demo week is Mon 13 – Sun 19 Jul 26;
   admin sign-in `ad`) · action · expected · the observation that would disprove it · which gotcha family.
3. **What a naive fix gets wrong** (item 3) — exact lines, and the exact, step-by-step fix you would specify.
4. **Siblings** (item 4) — each: silent on purpose / a lost warning, with lines.
5. **The two owed reads.**
6. **Explicit negatives** — what you checked and found nothing in.
