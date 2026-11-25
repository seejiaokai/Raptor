# Re-read brief — round 5: rounds 4 and 5's fixes to the new SANS words — 24 Nov 26, chat 169

**For:** each reader of this round, alone and blind to the others: Astra (the standing reviewer), a fresh, blind Opus
reader, and the security reader (D1411 — `state/perms.ts` changed: the read record is written only by its owner), who
reads §3 item 3 first. You did not write this code. **Do not read `HANDOFF.md`'s chat blocks, any evidence sheet or walk
table, or any brief of this round other than this one** (Codex: read `AGENTS.md`'s rule files if you must, but skip
`HANDOFF.md` — it carries earlier rounds' summaries).

**The copy:** `D:/raptor-work/c169-read5`, an export of branch `claude/allavail-sans-postout-141` at `82a7c78a2`, a git
folder whose packages are linked in (the walk pictures left out). At its root: `FIX.diff` (rounds 4 and 5:
`git diff 0e59ea5f3 82a7c78a2 -- raptor-port/src`), `ROUND.diff` (the whole job), `FIXES-CLAIMED.md` (the builder's
claims), and `READS/round4-*.md` (round 4's three reports, for each finding's concrete case). Read the whole files the fix
touches as well as the diff. Run tests from `raptor-port/` with `npx vitest run <file>`; if the copy refuses the app's own
config, write your own small vitest config beside your test.

## 1. What the job must do
The rules: `raptor-port/docs/superpowers/briefs/2026-11-24-sans-words-read-brief.md` §1 (in the copy), and the full rows:
`grep -h '^| D2388 \|^| D2390 \|^| D2391 \|^| D2394 \|^| D2420 \|^| D2421 \|^| D2423 \|^| D2437 \|^| D2560 \|^| D2561 \|^| D2564 \|^| D2565 \|^| D2340 \|^| D2341 ' .claude/decisions-full/*.md`.
**New since round 4 — the owner's D2564 (24 Nov 26):** the SANS reminder counts a day as planned ONLY where he is in a
flying seat or a sim (OFT, AMT) with nothing filed — never a ground programme row, a duty desk or all hands; the same
scope the crew list greys and the warning list reads. D2565: his own deleted filing relighting his reminder is left as
built. **What "planned" covers is his ruling now — judge the code against D2564's words, not against any older test or
comment.** Two readings of the builder's own, NOT yet ruled by him, to judge as readings (say whether each follows D2564's
words; a case that would surprise him is a question with the case, not a finding): (R1) a flying seat or sim box with no
times typed yet counts; (R2) a cancelled line or box never counts, though the crew list still strikes a SANS man armed onto
a cancelled line.

## 2. Not findings (D56, D785)
A problem living only in data already stored (demo data) is not a finding unless new data would be hurt too. A scheduler
is always an admin. The wording is the owner's. Older behaviour the change does not touch or worsen is not a finding; say
if you see one, marked "older". Filed, not findings: a store write during a command's delivery or a start-of-command hook
saved unjudged; the projection door putting any bell line on anyone's bell (SEC-R4-2); the posting's take-back trusting
this device's read state; the read record only growing and merging across devices at the database step; on a phone a
passing note covering the SANS day window's date and ✕; the SANS info line for ground work (D2566, a later job).

## 3. What to look for, in this order
1. **Does each fix close its finding?** Round 4: SEC-R4-1 (the projection door rewrote another man's read record),
   R4-O1 (next-week preview kept a moved man's request), Astra's round-4 F1 (a change of week re-read every held week).
   CLOSED, NOT CLOSED (a failing test) or CLOSED ONLY IN PART.
2. **D2564 built as ruled:** the reminder and the scheduler's checks (crew list strike, armed seat, warning list) answer
   "is he planned on a flying seat or a sim" from one definition — can they disagree anywhere (a spare seat, a whole
   AVALON/BB wave, a sim pax, an extra under a row, a standby, a cancelled formation or jet, a seat on a day before his
   SANS date, another squadron's week)? Does any ground row, duty desk or all-hands still reach the reminder? Does the
   week-change speed fix keep the reminder right after Undo/Redo, a home move, a New Year week, a week first worked on
   while on screen, and a seat placed in the week on screen before it is saved?
3. **The permission gate (the security reader starts here):** only a man's own `notices.seen` writes `noticeseen:<pid>`,
   whoever runs the command — the projection door, an admin's command of any type, a restore, a Redo, a hand-built
   envelope; are the honest paths (a tap, "Mark all read", `forgetRead` after Undo post out, sign-in boot, another
   device's change, the seed) all still let through? Anything newly open?
4. **Saved data:** every write through the command layer and saved; nothing removed but what the fix names.
5. **Speed:** the reminder on a week with 40 held weeks; the preview key.

## 4. What to give back — write it to the file your brief names, then reply with its path only
Each finding: **where**, **the concrete case** (named demo people, days, presses), **what goes wrong** for the person,
**the cause**, **the fix** as exact steps. A finding without a concrete failure is a question, labelled so. Failing tests
under `raptor-port/src/r5-<you>/` only. Then the per-item verdicts of §3.1 as a table; then your judgement of R1 and R2;
then a tidiness note (D489, filed, never fixed). Last line: how many findings, and which to fix first.
