# The builder's brief — [WARN-WORDS-STANDALONE], the night of 16 Nov 26 (chat 83)

You are the ONE builder of tonight's job, an Opus helper inside chat 83's unattended night (the owner is asleep; the
night's chat only coordinates). You build, commit and push; you stop when the job is BUILT, before its walk, and say so
in your final reply — the coordinator then opens the pull request and sends you on to the walk, the reads and the fixes.

**Where:** the checkout `C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd`, branch
`claude/warn-words-standalone` (level with `main`, already switched). Work only there. Never `cd ..` out of it before a
git command (it reaches another checkout) — use `git -C <that path>`. A background command moves into
`<that path>/raptor-port` by its full path first.

**The clock:** the night ends about 12:05 on 16 Nov 26 (read `date`). Aim to have the build pushed by about 05:30. If
it runs long, the LAST piece is left and said so — never a test, never a check. Commit after each piece, so a stop
strands nothing.

## Read first, in this order (open each yourself; nothing here loads by itself in full)

1. `raptor-port/CLAUDE.md` (the project guide) and `.claude/rules/raptor-executor.md` (the builder's policy).
2. The area pages: `.claude/rules/decisions/scheduler.md` (§Warnings and the rules engine above all),
   `.claude/rules/decisions/oil.md`; for the Logic page's new row and note, `.claude/rules/ui-design.md` and
   `.claude/rules/decisions/design.md`.
3. **The proposal, `raptor-port/docs/superpowers/specs/2026-11-15-warn-words-standalone.md` — its §3c to §3g FIRST:
   they overrule its earlier sections.** Then the whole of it; §3a and §3b each REPLACE the earlier lines they name;
   §7 and §3b are the build's notes. In short, what §3c–§3g change (the proposal is the authority, not this list):
   every line the proposal begins "Clash:" begins **"Conflict:"** (D2070), and the check keeps "Conflict" in its short
   name while the other checks' short names follow the new labels; **"Tight turning" keeps its name** wherever the
   proposal writes "Tight crew rest" (D2068); a conflict line between a flight and another item shows the end of the
   flight that causes it — the **step** or the **dekit** time, worked from the Logic page's settings (D2058, §3c's
   table); the crew-rest line keeps his order with "needs 12h" (D2069); the six corrected example rows (§3e), the SC
   line naming both places the same way; the Logic note is ONE sentence, "Published days keep their old settings until
   published again." (D2067, §3f); Insights' heading "Conflicts by type" and "No conflicts flagged for this day" stay.
4. The backlog item: `OUTSTANDING.md`, `### [WARN-WORDS-STANDALONE]` (steps 2, 2a, 2b, 2c, 3).
5. The full rows of the rulings, before acting on any one's detail:
   `grep -h '^| D2045 |' .claude/decisions-full/*.md` — D2045 to D2071, and D1936, D1990, D2001, D2010, D2022, D1045,
   D1065 where the proposal or a row names them (the shell's grep; the Grep tool hides a long row). D2057 is not on
   this branch yet (it is on an open notes pull request): it says the rewording covers EVERY warning and the Logic
   page's note, and the engine changes come after the words are approved — they are (D2071).
6. The cold read's result: `raptor-port/docs/superpowers/briefs/2026-11-15-warn-words-cold-read.md`.
7. The bug-check checklist, `raptor-port/docs/bug-check-checklist.md`, and each section of
   `raptor-port/docs/bug-check-order.md` its steps name, whole, as each step comes. **The tier is FULL** (the warning
   list's words, how a rule is read, OIL's worked times, a new saved setting). In this first stage you do its steps 2,
   4, 6, 8 and 16: confirm the tier in the sheet; lay down the evidence sheet
   (`raptor-port/docs/handpass/2026-11-16-warn-words-standalone.md`, §9's shape, every heading, the roll-call table one
   row per place the app shows a warning's words — §7 of the proposal names several: the warning list, the ALL AVAIL
   window, the previous day's crew-rest mark, the next-week preview, the foot-of-screen note, the pucks' own notes,
   Insights' "Conflicts by type", View-only Sched's list, the Logic page, print and export, the pending list); list the
   rulings that apply; pin each "left as it is today" half with a test BEFORE building the changed half; write tests
   that find rather than confirm, red first. The walk, the reads and the rest come in the second stage.
8. `raptor-port/docs/engine-rules.md` and, for the engine change, the project guide's "rules-engine robustness
   doctrine" (full text `raptor-port/docs/guide-full.md`, searched): his five gotcha families — people not following
   the format, missing input, user errors, deletions and edits from another page, sync between copies — each tested.

## What to build, in this order (commit after each)

**A. The approved words** (nothing of a rule changes in this piece):
- every warning line the engine writes, to the proposal as overruled by §3a–§3g (`raptor-port/src/engine/validate.ts`
  — the `add(` calls and its Says helpers; `reporting.ts` left whole unless the proposal says otherwise);
- the checks' short names (the names table in `validate.ts`; shown on Insights, View-only Sched and the Logic page);
- the Logic page's note under the changed-settings strip — the one sentence (§3f);
- the pending list's new line (D2054, the proposal's §4 as changed by §3a and §3b: inside the man's own row);
- **a conflict's hide is keyed on its two items, not its words** (D2001 — a hidden conflict stays hidden while the
  same man is on the same two items, whatever their times); say in the sheet what happens to hides already stored
  (the store is demo data — D56 — but new hides must work going forward);
- the brief and debrief lines need each hit's own times (today only its name is gathered);
- time ranges never break across lines; each "Conflict:" line still fits two rows on a phone (a measured test);
- the shapes §3c leaves to the build — an item spanning the step and the flight, an assumed landing with a dekit, two
  flights, a request against a flight: settle each in the proposal's own shape, list each in your reply with its
  exact words, so they are shown to him in the morning as built;
- **left exactly as it is, each pinned by a test first:** the double-turn line (D2050); two flights back to back stay
  the amber tight turn (D2060); a standby line has no step or dekit added (D2061–D2065); "Tight turning" (D2068).
- Before changing a word: check whether the original app's 728 tests (`reference/`, read-only) or
  `parity.test.ts` read any of these words, and how the lines already changed are let through; say what you found.

**B. The assumed landing (D2046, D2047, D2053):** a flight with no landing typed (blank or "TBD") is assumed to land a
set flight length after take-off — a NEW Logic setting starting at 60 minutes (a `VCONF` + `RULE_SPEC` setting, never a
fixed number), read by EVERY check that reads the landing — the tight turn, the debrief, crew rest, the long day, OIL,
Insights' hours: find each reader by searching, list each in the sheet with its test. Its words are the proposal's
("landing assumed 13:00", "(T/O + 1h)"). It changes D1990, D2010 and D2022 — fix what those left behind in the
documents (D201). The setting's row on the Logic page is built in the same look as its neighbours, its label written
to the writing guide (`raptor-port/docs/design-practices.md` §1b); it has NOT been drawn for him — give its exact
words in your reply. A published day keeps the settings it was published under (D2005): decide, from D2005's and
D2044's full rows, how the new setting sits with that, and say what you decided and why.

**C. A standby shift with START typed and END blank (D2055):** left out of crew rest until END is typed — never
"ended" at its START; its own "cannot be worked out" warning stays.

## Rules of the road

- **Engine files are verbatim ports:** the diff there is the behaviour change and nothing else — no tidying.
- **Red first:** every changed line of behaviour or wording has a test seen failing before the change. Never weaken a
  failing assertion — understand it. Existing tests that quote an old wording change with it, one by one, on purpose.
- **Nothing he will see is invented:** the words are the approved ones. Where the proposal leaves a wording to the
  build, write it to the writing guide and list it for the morning. A choice that is truly his (a product choice, not a
  technical one) does NOT stop you: build everything else, and give it in your reply as a question in the app's own
  words — the case first (a named person, a day, what was typed), what the app does today, your recommended answer,
  what waits on it. Search the rulings and the backlog before calling anything undecided (D53).
- **The records, in the same commits:** `raptor-port/docs/engine-rules.md`, `data-schema.md` and `data-model.md` (a new
  saved setting), `file-map.md` (a new file), `feature-impact.md`, the Logic page's word-for-word record if it lists
  these lines, `remarks-vocabulary.md` and `word-list.md` where a term changes, the behaviour register;
  `npm run rulecheck` and `npm run docsize` before each commit of records (docsize's one known failure tonight is
  `OUTSTANDING.md` 11 lines over its tripwire, `main`'s own — leave it; it stops once code is on the branch). Do NOT
  edit `HANDOFF.md`, `OUTSTANDING.md`'s other items, any rulings file, `.claude/hooks/`, `.claude/settings*`,
  `.claude/skills/`, the unscoped `.claude/rules/*.md`, `raptor-port/CLAUDE.md`, or the bug-check order.
- **Checks on his PC (the repo is public, D1086):** only the tests of what you change, and `npm run build` (the real
  type check — `tsc --noEmit` is hollow here). No full gate run on his PC; GitHub's run of the pull request is the
  full check. Before a full unit suite, any browser-test run, or anything that builds while another chat could be
  running one, take the checks lock: `node raptor-port/scripts/gatelock.mjs exec "claude/warn-words-standalone — <what>" -- <command>`.
  `npm run lint:changed` before each push: no new finding.
- **Push:** by explicit refspec, alone in its own command — `git push origin HEAD:refs/heads/claude/warn-words-standalone`.
  Never to `main`. No pull request exists yet (the coordinator opens it) so no run can be cancelled in this stage.
- **Helpers (LOW):** one at a time, only where a check needs one. You may ask Astra (Codex, the standing reviewer —
  `raptor-port/docs/codex-guide.md`, the order's §4) for the scenario design once the roll-call exists, so it is ready
  for the walk; nothing else of the second stage starts before you are sent on.
- **This PC's traps:** an edit script in Python opens files with `newline=''`; never `node -e` with a regex or `\n` —
  write the script to a file; no heredoc containing an apostrophe; `s.replace(a, () => b)` in JS edit scripts; a pipe
  hides a failed check — send output to a file and test the command's own exit; no `jq` (use `gh -q`); check a port is
  free before serving on it, and stop a preview by its port, never by a name pattern.

## Your final reply (it is your report — do not write a file called a report)

Conclusions, not file dumps: (1) what is built, piece by piece (A, B, C), and what is not, with why; (2) the commits
and that they are pushed; (3) the tests added and changed, with the count and which were seen red first; (4) what the
original's 728 and the parity test read of these words; (5) every wording the build had to settle, exact words, old
beside new where it replaces one; the new Logic setting's row, exact words; (6) every decision you took and why; (7)
questions truly his, in the shape above; (8) what the walk must cover — the roll-call's rows and the cases that need a
person's eyes; (9) anything found on the way and not fixed.
