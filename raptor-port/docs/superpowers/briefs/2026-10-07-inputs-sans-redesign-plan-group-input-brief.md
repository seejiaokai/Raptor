# Brief — challenge the second add-on to the build plan: an input filed for a group — one round, independent

Written 7 Oct 26 by the host (Opus 5.5), who wrote the section — you are not its writer (D67, D590). You are ONE of two
readers (Astra, Sol 6.1). Read alone: do not look for, open or rely on the other reader's report
(`2026-10-07-inputs-sans-redesign-plan-group-input-astra.md` / `…-sol.md`), nor either reader's reports on the main plan
or on its first add-on. **Read-only: change no file, run no test, build nothing, start no server.** Your whole output
is your report.

## What you are reading

ONE section of a plan, added after the plan's own challenge: **§3.13** of
`raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md`, with the lines it adds elsewhere — three
rows in §3.8's table, a clause each in §4's steps 1 and 5, the end of §6's roll-call seed, and the last paragraph of
§8. Read the rest of the plan only as far as §3.13 leans on it (§3.6 the Inputs calendar, §3.7 windows, §3.8 who
placed it, §3.9 the two-doors-one-setting shape). Nothing is built. **It changes who may write whose record — read it
as a permissions change first and a feature second.**

Read these whole first (none of it loads for you by itself):

- **His rulings, FULL rows:** `grep -h '^| D65[4-7] \|^| D629 \|^| D641 \|^| D620 ' .claude/decisions-full/*.md` — D654
  (a group; an admin and, for now, a member), D655 (his answers: which kinds, one shared input, who may change it — and
  the six readings he was told), D656 (the picker; three groups), D657 (the design accepted); D629 (who placed it),
  D641 (windows), D620 (where SANS availability is filed). And the rules a member's reach rests on:
  `grep -h '^| D149 \|^| D166 \|^| D200 \|^| D211 \|^| D292 \|^| D148 \|^| D178 \|^| D364 ' .claude/decisions-full/*.md`.
- **The design note's section** "An input filed for a group":
  `raptor-port/docs/superpowers/specs/2026-10-07-inputs-sans-redesign.md`.
- **The area rulings:** `.claude/rules/decisions/people-accounts.md`, `.claude/rules/decisions/scheduler.md`,
  `.claude/rules/decisions/oil.md`, `.claude/rules/decisions/how-we-work.md` (D56 — a problem that lives only in data
  already stored is not a finding).
- **The code §3.13 describes** — check every claim against the live files:
  `raptor-port/src/state/perms.ts` (ALL of it — `PERMS`, the named questions, `COMMAND_OPS`, `cmdAuthorize`,
  `ownershipViolation`); `raptor-port/docs/data-model.md` §11 (the `Input` row and the text under the table);
  `src/ui/inputedit.tsx` (`normalizeInputDraft`, `oilGate`, `commitNewInput`, `commitInputEdit`, `reassignInput`,
  `askOilIfPending`, `setInpField`, `removeInput`, `dropInputRow`, `InputEditor` — its `doSave`, `save`, the Person
  field and the read-only form); `src/ui/InputsPage.tsx` (`filedFor`, `add`, the row's Person cell ~l.985, the row
  buttons ~l.1100, the OIL answers ~l.660–700); `src/ui/InputsCal.tsx` (`openAdd`, the chips, the day popover);
  `src/ui/caldrag.ts`; `src/state/store.ts` (`runInputWrite`, `writeInputsBatch`); `src/state/inputgate-hook.ts` and
  `src/leavewar/inputgate.ts`; `src/leavewar/sync.ts` (`oilAskPlan`, `oilPendingFor`, the absence door);
  `src/state/holderbase.ts`; `src/state/changelines.ts` (`inputLines`); `src/undo/timeline.ts` (`mayReverse`) and
  `src/state/sched-commit.ts` (the restore body); `src/state/people-settings-commit.ts` (`SETTINGS_KEYS`, the
  write-hook); `src/engine/inputs.ts` (`INPUT_META`, `typeGroup`, `oilAsks`, `isSansAvail`); `src/engine/schema.ts`
  (`Input`); and the tests that pin today's rule — `src/state/perms.test.ts`, `perms-scan.test.ts`,
  `accounts.test.ts` (AC7), `src/ui/inputs*.test.tsx`.

## What to find

1. **A hole in the rule.** A concrete command — who is signed in, the setting, the exact before and after of each
   changed input — that §3.13's commit-gate rule lets a member commit and D655 does not give him (another man's leave
   or medical; another man's OIL answer; a record he did not file; a record moved to a third man; a filing "by"
   someone else; anything once the setting is off). And the reverse: something D655 DOES give that the rule refuses —
   the filer's own Undo and Redo, a man taking himself out, a member changing an input that someone filed for him, an
   edit that goes through a per-record body which writes a field the rule forbids.
2. **`by` as the key.** A door that makes or changes an input and would leave `by` absent, wrong or changed (§3.8's
   table is the list — is it complete for this?), so that a filer loses his right or someone gains one: a hand-over, a
   leave approved or moved on the Leave War, a split or a trim, a posting, an import or seed, an Undo that re-makes a
   record. Say what the plan must add.
3. **The bet — one record per man, "one thing" made on read.** A reader of an input that breaks or misleads when one
   filing is N records: name the surface and the concrete result. And the entry rule ("same `grp` AND same shared
   fields"): a sequence of real presses after which a list shows the wrong thing — a group split when he would expect
   one line, two things merged that are not one, a man twice, a line nobody may edit.
4. **The writer.** A sequence in which a group is half filed or half changed and stays so; or a per-record rule that
   misbehaves when run N times inside one command — a toast N times, the row reveal, the landing on the programme, the
   medical preflight, the OIL sheet, `mod` and the LATE mark, the remark's date token, the absence rules refusing one
   man of six.
5. **The setting.** On, off, on again; an Undo across a flip; a member mid-edit when it flips; the admin's member
   view. Is "his right over what he already filed goes with it" the right reading of "for now", and is it safe?
6. **What is MISSING.** Every place the Inputs page lists or opens an input (and any gate that still asks the old
   one-argument questions) that §3.13 does not name; a surface where "one shared input" should hold and the plan leaves
   it per man without saying so; a ruling of D654–D656 — or one of the readings he was TOLD in their full rows — with
   nothing in §3.13.
7. **The readings in §8's last paragraph.** Each is a default he can change. Say which one is wrong, and why — most of
   all: SANS availability never filed for a group; the schedule showing one row per man; a fourth heading for ground
   crew against his "three groups".
8. **A rule in §3.13 with no test in its test list.**

## What is NOT a finding

- Taste, or another way to build the same thing with no failure shown.
- A claim with no concrete case: a finding needs where · the concrete failure (who, the presses or the command, the
  data, the result) · why · **the exact change to §3.13 that fixes it** (D489).
- A problem that lives only in data already stored (D56). A record with no `by` is covered: it has no filer.
- "The browser check is not security": the plan says so already (`perms.ts` — the browser mirrors, the server will
  enforce). A way the browser's own rule contradicts itself, or §11 would mistranslate for the server, IS a finding.
- A product choice he has ruled (D654–D656) — unless you think §3.13 misreads it; then name the ruling and say why.

## Your report

- First line: **PASS** or **CHANGES REQUIRED**.
- Findings numbered, most serious first; each: where · the concrete failure · why · the exact fix.
- Then, briefly: what you checked and found sound, and what you could not check.
- **Astra only — D138:** read the short lines of D646 to D657 in `.claude/rules/decisions/scheduler.md` against their
  full rows in `.claude/decisions-full/scheduler.md`; say PASS, or name the line that loses or adds a condition.
- Say plainly that you changed nothing, ran nothing, and read no other reader's report.
