# Two small fixes — the push guard's leftovers and the Inputs list's next year (17 Oct 26)

Branch `claude/small-fixes-1017`, cut from `main` after pull request 526. His word: "U can do the small things quick
here first".

## 1. `[PUSH-GUARD-LEFTOVERS]` — the push-and-lock guard's four known gaps

Files: `.claude/hooks/push-guard.mjs`, `.claude/hooks/push-guard.test.mjs`, `raptor-port/scripts/gatelock.mjs`. No app
code. Fixed: (1) a quoted word beginning with `>`/`<` is a word, not a redirect; (2) PowerShell's doubled quotes, and
the suggested command written in single quotes so a `$` never expands; (3) a push to main through a shell variable,
through `xargs`, or after bash's `$'…'` quote; (4) breaking a lock reads its owner before moving it, so it is never set
aside and put back. What the guard now reads: `raptor-port/docs/gates-and-deploy.md` (the guard's paragraph).

**Reads (D790 — a fresh, blind Opus reader; the fix is new code):** round 1 on the first version — one must-fix (a
regression: `npm test 2>"err.log"` and the like were let past the lock check, because a redirect whose file name alone
was quoted counted as a word) and four should-fix (xargs read the whole command line, not its pipeline; PowerShell
variable names ignore case; a lock with no owner line yet could still be set aside; a bash `\$` inside double quotes kept
its backslash in the suggestion) — all fixed. Round 2 on those fixes — all five confirmed; two small gaps (a pipe split
across a line break, bash's `|&`) fixed. One over-cautious refusal left on purpose: a branch-cleanup pipe that only
mentions main (`… --merged origin/main | … | xargs git push origin --delete`) is refused — it errs safe and the refusal
names the way round. Round 2 was the last; its two one-line fixes carry their own tests.

**Tests:** `node --test .claude/hooks/push-guard.test.mjs` 40/40 (was 30); every new test was run against the version
before its fix and failed there. `bg-cwd-guard.test.mjs` 14/14.

## 2. `[INPUTS-LIST-NEXT-YEAR]` — the Inputs list read a next year's input as this year's

Real for new data (not D56): the Leave War saves a leave approved on a next year's period as a bare label and its own
year (`'Jul 20'`, 2027 — `raptor-port/src/leavewar/absences.ts inputRowFor`), a form the schedule, the war and the
Medical tab read right. The desktop list read the label in the loaded week's year: it printed "20 Jul" with no year,
sorted it among this year's dates, and **counted it inside this year's two weeks, as if the person were away now**.
Fixed in `raptor-port/src/ui/InputsPage.tsx` — the sort, the window and the printed dates pass `r.yr`. The phone list
already grouped by the right year.

**Tier: LOOK** — one surface's reading of dates; no saved data, rule, role or shared drawer changed. Test first
(`src/ui/audit-e-window-sort.test.tsx`, a leave built by the war's own `inputRowFor`): failed before the fix on the
window and the year, passes after. Inputs page tests 114/114.

**Walk:** `node scripts/handpass/inputs-list-next-year.mjs` on the built app, phone 390 and desktop 1500, the demo's
15 Feb 2027 input (the same stored shape). Before (`docs/img/handpass/2026-10-17-inputs-list-next-year-before/`): the
desktop table printed "15 Feb" and stood it among this year's rows (2 FAIL); the phone was right. After
(`…/2026-10-17-inputs-list-next-year/`): 8/8. Opened: desktop before and after.

**Found by the walk, filed, not changed:** the remark's "till 15 Feb" on that row has no year either — it comes from the
shared printer every screen uses (`engine/inputs.ts tillOf`), which also feeds the published-day compare (D948); a
change there is its own job with its own check — `[TILL-NEXT-YEAR]`.

Walk: phone 390 and desktop 1500, before and after, 8/8 after, pictures in `docs/img/handpass/2026-10-17-inputs-list-next-year/`.
