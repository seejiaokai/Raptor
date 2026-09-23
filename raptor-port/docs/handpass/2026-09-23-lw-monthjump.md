# [LW-MONTHJUMP-PHONE] — three Leave War browser tests on a slow machine (23 Sep 26)

Branch `claude/lw-monthjump-phone`, base `65129783`. Built by Opus 5.5. The owner's ask: make the three
tests robust on a slow machine by waiting on what each needs, not a fixed time (**D87**); prove each fails
before and passes after; the rest of the suite unchanged; **test-only**.
Pictures: `docs/img/handpass/2026-09-23-lw-monthjump/`.

## 1. The eight questions → NONE for the app

Money, the published record, saved data, a shared drawer, a new gesture, a new surface, roles, the warning
list — all **NO**: no file under `src/` changes; the diff is `e2e/app.ts`, `e2e/step4-leavewar.spec.ts` and
the records. What a test-only change CAN get wrong is the test itself — teaching it to look away (order §10,
anti-pattern 14) — so the checks are: red before / green after under the same slow conditions, nothing else
in the suite changing, and an independent read of the diff (§7).

## 2. How "a slow machine" was reproduced

`E2E_CPU_THROTTLE=<n>` (new, `e2e/app.ts`, off unless set) slows everything the page does n times over
through Chromium's own CPU throttling. For scale: the "leave is cut" test takes 10s on this desktop; on
GitHub it took 23.1s on a green run (about 2.3x) and needed more than 30s on 23 Sep (3x or more). All
runs below: the SAME built bundle, served on port 4190, one test at a time unless a row says otherwise.

## 3. Red before, green after — the two desktop scenarios (3 runs at each speed)

| Browser speed | "LL 14–18 Jul … undo restores" BEFORE | AFTER | "a reload (not ?fresh) …" BEFORE | AFTER |
|---|---|---|---|---|
| normal | 10.1 · 10.3 · 10.4s | 8.0 · 8.1 · 8.2s | 19.5 · 19.7 · 19.8s | 9.9 · 10.0 · 10.6s |
| 2x slower | 15.2 · 15.6 · 15.7s | 13.6 · 13.7 · 13.9s | 29.6 · 29.7s · **timed out** | 16.8 · 18.0 · 18.5s |
| 3x slower | 21.4 · 22.5 · 23.1s | 20.7 · 21.1 · 21.1s | **timed out ×3** | 29.0 · 29.0 · 29.0s |
| 4x slower | 29.8s · **timed out ×2** | 27.8 · 27.9 · 28.7s | **timed out ×3** | **timed out ×3** |

**What changed, and why each one.** Every fixed pause in the file's shared steps became a wait on the thing
the next step needs: a month jump waits for the month to be drawn and for its header to stop moving on
screen (0.7s before); a tap waits for its sheet (0.25s); closing a sheet, reading figures and closing the tap
list wait for the sheet to be gone (0.1–0.6s); undo/redo wait for the other button to light (0.35s); filing
on the Inputs page waits for its actual outcome — the no-document question, a filing, or a refusal (0.4s,
and the old 0.15s look for the question could MISS it on a slow machine, so the medical was never filed).
The reload scenario also read each person's three figures from three separate openings of their sheet; it
now reads all three from one (same sheet, same moment, same numbers — a third of the work), and it waits for
every cell it compares to be drawn, because an undrawn cell reads "undefined" on both sides of the reload and
compared equal without comparing anything.

**Where it still breaks:** the reload scenario at 4x — two full Leave War loads, four month jumps and ten
figure sheets are real work, and at 3x it now sits at 29s of the 30s limit (with four tests at once: passed
at 28.3s in one run, timed out at 34.4s in another). The remaining lever is a longer limit for that one test
— the remedy D87 did not pick.

## 4. The rest of the suite

| Run | Before | After |
|---|---|---|
| Whole browser suite, normal speed | 461 passed · 45 skipped · 0 failed (3.6m) | 461 passed · 45 skipped · 0 failed (3.4m) — **every test the same outcome** |
| `step4-leavewar.spec.ts`, both widths, 4 at a time, normal | 24 passed | 24 passed, every one faster (reload 20.8 → 11.1s) |
| the same at 3x slower | 23 passed · reload timed out | 24 passed |
| Type errors in the three e2e files (not part of the build) | 15 | the same 15 |

## 5. The phone test — an APP bug, left unchanged on purpose

`e2e/leavewar.spec.ts` "a month button works from wherever the grid already is" (lw-phone). **Not changed.**

| Pacing of the two taps (4 runs each, unless noted) | March lands a day short |
|---|---|
| as the test does it (SEP right after opening, MAR as soon as September is drawn) | 4 of 4 (and 10 of 10 alone) |
| grid settled before SEP / before MAR / both | 4 of 4 / 4 of 4 / 1 of 4 |
| like a person: 1s, SEP, 1.5s, MAR | 2 of 4; 3 of 4 in a second batch |
| inside a busy full-suite run (a slower machine) | passes |

![March lands on the 1st](../img/handpass/2026-09-23-lw-monthjump/phone-mar-lands-on-the-1st.png)
![March lands a day short](../img/handpass/2026-09-23-lw-monthjump/phone-mar-lands-a-day-short.png)

First picture: tapping MAR lands on "Sun 01". Second: the same taps land on "Mon 02" — 1 March is under
the frozen name column (it fails alone on a quiet desktop; in a busy full run, and on GitHub, it passes). **Measured cause:** February's width (591px on screen) is remembered while a posted-out man's
row (ignite) is showing; by September his row is hidden; back at March the grid regrows February within
160ms of the jump, treats the remembered width as exact and, on a touch screen, skips the re-anchor "in
motion" — February draws 571px, March slides 20px left. Filed with its fix direction as
`[LW-MONTHJUMP-PHONE]` in `OUTSTANDING.md`. Pacing the test would only hide it.

## 6. What was not done

- No app change (the owner's "test-only"). The phone fix is filed, not built.
- The shared `login()` / `go()` pauses in `e2e/app.ts` (0.35–0.4s) were left alone: every browser test in
  the suite leans on them, so changing them is its own job with a suite-wide re-run.
- The other step4 scenarios were not rewritten; they only inherit the new shared steps (and got faster).
- One fixed pause is left in the file on purpose: `dragSelect`'s 0.4s back-off before it RETRIES a drag
  that did not register — a failure path only, and neither of the two scenarios drags.

## 7. Checks and the independent read

Gates on the final tree: `npm test` 5760/5760 · build OK · `tfin.js` 728/0 · `test:e2e` 461 passed / 45
skipped / 0 failed · `smoke:tracker` 425/0 · rulecheck OK · docsize OK.

**Astra (Codex CLI, default model, high effort), blind, on commit `5b38ecef` — verdict REVISE, no defect in
the diff.** Its explicit negatives: the combined figure reads keep every prior assertion; the cell waits close
the undefined-equals-undefined false pass; every caller of the changed steps walked on BOTH projects with no
problem in the scrim waits, the no-document handling or the filing callers; the `login()`/`go()` pauses are
not load-bearing on these paths; the throttle switch is inert unset and survives the reload. Its two findings
are decisions for the owner, not fixes: **001** — the reload test is still at the 30s edge at 3x with other
tests running; the remaining lever is a longer limit for that one test, which needs his word because D87 chose
waits. **002** — the phone test needs the APP fix (spec folded into `[LW-MONTHJUMP-PHONE]`). **That read
covers `5b38ecef` only.** Everything after it — the checks moved to his PC (`deploy.yml`, the e2e port in
`playwright.config.ts`), the scrubber test's wait, the notes — goes to a SECOND, fresh Astra read.

**GitHub (PR #428), all 12 checks green — with one retry.** On GitHub's own machine the "LL 14–18 Jul" test
passed first time at 27.8s (it failed twice on 23 Sep); the reload test timed out once (31.5s) and passed on
the automatic retry (12.5s). Why GitHub is this slow: the repo went PRIVATE on 22 Sep ~17:40 UTC, and GitHub
gives a private repo a 2-core machine where a public one gets 4 (GitHub's runner reference). Every
parallel check doubled at that moment (desktop browser leg 5–6 → 10–11 min, scheduler unit tests 5–9 → 13–20
min) while the one single-threaded check (Tracker) did not move — and CI still runs 3 browser tests at once,
a setting chosen for 4 cores. Filed as `[CI-TWO-CORES]`.

**Then on his own PC (D89, the self-hosted runner "JK"), three trial runs of the whole set:** run 1 failed two
unit files — Git for Windows' CRLF default on the runner's fresh clone (fixed: that clone keeps the repo's
line endings); run 2 failed the Leave War scrubber test (the app's 250ms drag window; the test now waits it
out, `[LW-HBAR-RESYNC]` filed); run 3: everything passed except the phone month test — the app bug above,
which shows on a fast machine. Time on the PC: ~14 min for a green run (unit tests 4.7 min, browser tests
3.7 min, Tracker smoke ~4.5 min). Until the phone fix (D150), the checks run on GitHub (`CI_ON_GITHUB=true`).

**Astra's second read (Codex CLI, high effort), blind, on `416751d4` — everything after `5b38ecef`: REVISE,
seven findings, all accepted and fixed in the next commit.** SEC-001: the PC job had no guard on WHO could run
code there — now only his own changes in a private repo, everything else to GitHub (the exact complement, so
no run is left without a gate); SEC-002: the runner must never run as Administrator (handoff step 4); SEC-003:
least-privilege token, Pages rights on `deploy` only, no persisted checkout credential; CI-001: `PORT_URL` /
`APP_URL` pinned so a leftover machine setting cannot point a gate at another checkout; CI-002: the
line-ending step stops on any error; CI-003: the Pages way-back note completed; DOC-001: the D150 numbering
note corrected. Its negatives: the switch covers every value of `CI_ON_GITHUB` with no gateless green; ports
4273/4279 clash with nothing; the scrubber wait cannot be shortened by scheduling and the product defect stays
filed, not hidden. **These fixes are not yet re-inspected** — the next chat's read covers them.

**GitHub again, on `416751d4` (private repo, 2-core machine, 3 tests at once) — RED, and it matters.** The
"LL 14–18 Jul" scenario timed out twice (34.7s, 35.1s); the reload scenario timed out once (30.7s — inside
`gridAtRest`) and passed on retry; an untouched test, "the box whose number changed flashes, once", failed
twice. The first GitHub run of the same step4 code had passed the LL scenario at 27.8s: that machine varies
widely, and under three concurrent tests it is harsher than the local 3x throttle. So: **robust on his PC
(every trial passed them) and on a reproducible 3x-slower browser; NOT yet robust on GitHub's private
machine.** Likely lever for the next chat: `gridAtRest` watches the landed header to the pixel, and the
desktop's background fill can nudge it by ≤1px (the anchor corrects only >1px), so on a very slow machine
the wait can last the whole year's fill — a ±1px tolerance is the candidate fix. D84's one re-run was not
spent: no merge is pending (D152).

---

# PART TWO — the app fixes (23 Sep 26, afternoon; D150, D152)

Same branch. The owner's ask: fix `[LW-MONTHJUMP-PHONE]` and `[LW-HBAR-RESYNC]` by the bug-check order,
then move the checks back to his PC. **Mid-session he filmed a third fault** (a phone video of his
desktop): *"the frozen bar scrolling rapidly horizontally when they scroll the page down. Looks untidy
too"* — a Leave War bug, so fixed here too (announced to him; no objection).

## 8. The eight questions → WALK

Money, the published record, saved data, a new gesture, a new surface, roles, the warning list — **NO**
(the fixes move where a month is drawn and where two bars sit; nothing is stored, paid or ruled on; the
width cache is memory for one visit). **A shared drawer — YES:** the column-window engine decides what
every row, the dates header, the manning rows, the event rows and the frozen header copy draw, and the
frozen-bar fault sat in a placement pattern three bars share. → **WALK**.

## 9. The roll-calls

**9.1 What can change a day column's width** — the inputs `widthGen` must follow (a width measured
under other inputs is no longer exact):

| Input | Changes a column's width? | Covered by |
|---|---|---|
| Which people's rows show (row window: posted in/out) | YES — a hidden row's chips stop widening its columns | `visWindow` |
| A folded category | YES — its rows leave the table | `folded` |
| The manning rows (collapsed / forced open in Rearrange) | YES — they are rows of the same table | `countsOpen`, `arranging` |
| The manning **Archive** opened / closed (admin, Rearrange) | YES — its rows are cells of the same table. **MISSING from the first fix; found by Astra (LW-101)** — it is CountRows' own state and never reaches a render | `onArchiveChange` (the block tells the grid) |
| Cell contents: bids, events, OIL, the roster, SANS | YES | the store's `version` |
| The zoom step | YES, every width | the cache's own key |
| A different war | YES, different months | the cache's own key |
| The figures drawer | MUST NOT — an overlay drawn over the days, not cells in the table | — |
| Rearrange's wider name column | MUST NOT for day columns (frozen column only) — covered anyway via `arranging` | — |

**9.2 Every bar that appears and is then placed to follow a sideways scroller** (the frozen-bar fault):

| Bar | Had the one-frame-late placement? | Now |
|---|---|---|
| Leave War frozen date bar (phone + desktop) | YES — filmed by the owner | fixed: placed before paint, animation held |
| Leave War bottom scrollbar (desktop) | YES — the thumb flashed at January | fixed: placed before paint |
| Quals page frozen header (phone; desktop when it overflows) | YES — flashed its first columns | fixed: placed before paint |
| Raptor's week scrollbar (desktop) | MUST NOT, because it is one standing element shown and placed in the same call (`pan.ts hsSync`) | — |
| Leave War frozen name column (phone) | MUST NOT, because it never follows sideways; it is hidden until its top is measured | — |
| The Tracker's flow board | no such bar | — |

**9.3 Every way the grid moves while the bottom scrollbar's thumb must follow:** the month strip, the
under-manned jump, a war switch, a zoom step, a wheel or trackpad, the bar itself. All of them reach the
thumb through the grid's own scroll handler, so the one catch-up covers every one of them.

## 10. Red before, green after (the fixes set aside, then put back; same tests, same machine)

| Test | Old code | Fixed code |
|---|---|---|
| a month button works from wherever the grid already is — **phone** | **FAILED 3/3** (1 March 20px under the frozen column) | passed 3/3 |
| the same — desktop (never had the bug) | passed 3/3 | passed 3/3 |
| the bottom scrollbar … the bar then slides it (pressed inside the drag's hold) | **FAILED 5/5** (thumb left at 0.21) | passed 5/5 |
| the frozen bar is in step with the grid the moment it appears — phone + desktop | **FAILED 6/6** (4,482–5,531px off) | passed 6/6 |
| the bottom scrollbar shows the grid's place the moment it appears | **FAILED 2/3** (timing-dependent, like the fault) | passed 3/3 |
| phone: the Quals frozen header is in step the moment it appears | **FAILED 3/3** (400px off) | passed 3/3 |

**Two honest detours, both caught by the red-first rule.** (1) The first frozen-bar fix (a layout effect)
was NOT enough: a freshly created scroll-driven animation is not applied on its first frame, so the bar
still painted the year's start once; measured frame by frame, then held by hand. That hold then exposed
a second fault — the animation's implicit start borrowed the held value and blended, a one-frame 1,819px
jump — fixed by stating the keyframe's start. After both: 534 frames with the bar showing across two
scripted scroll runs, **zero** out of step by more than 2px. (2) The scrollbar test first passed on the OLD
code: its jump also hid a posted-out man's row, and that row change re-measured the grid late enough to
carry the thumb along. It now parks past January first (the only month whose rows differ), where
nothing but the catch-up can move the thumb.

## 11. The walk — the built bundle, iPhone-13 emulation (touch) and a 1440×900 desktop

Scripted (D17), on the same production build the checks ran; every number read from inside the page.
Pictures: `docs/img/handpass/2026-09-23-lw-monthjump/fixed-*.png`.

| Surface · order | Result |
|---|---|
| Phone · SEP → MAR at once (the reported order) | 1 March −0.1px from the frozen edge — **on it** (was −20px, a day short) · `fixed-phone-sep-then-mar-lands-on-the-1st.png` |
| Phone · MAR → SEP (the reverse) | −0.3px |
| Phone · paced like a person (JAN, 1s, SEP, 1.5s, MAR), ×3 | −0.1px each time (was short 2–3 times in 4) |
| Phone · → DEC, then DEC → FEB (January drawn to the left of it) | −0.2px, +0.8px · `fixed-phone-dec-then-feb.png` |
| Phone · a finger flick back from September | the grid moved to August, months drew, no error (no momentum in a scripted touch — see §12) |
| Phone · the frozen bar appearing, ×3 | 40 frames each, worst **0px** off · `fixed-phone-frozen-bar-in-step.png` |
| Desktop · SEP → MAR | +0.1px · `fixed-desktop-sep-then-mar.png` |
| Desktop · the frozen bar appearing, parked in August, ×3 | 36–37 frames each, worst 1.2px (a constant sub-2px offset, present before this change and inside the existing test's 2px) · `fixed-desktop-frozen-bar-in-step.png` |
| Desktop · the painted frames themselves (Chrome's screencast) | the bar's FIRST frame shows AUG 01 in place — no January, no slide · `fixed-desktop-frozen-bar-first-frames.png` |
| Desktop · drag the bottom bar, press SEP inside the hold | thumb 0.21 inside the hold → **0.774** after it (September); grid on SEP 01 · `fixed-desktop-drag-then-sep.png` |
| Desktop · the bottom bar appearing (page back up from its foot) | thumb 0.774 = grid 0.774 on its first frame |
| Quals · phone, table scrolled 400px, page down | the frozen header's first frame at 400 = the table's 400 · `fixed-quals-phone-frozen-header-in-step.png` |
| Quals · desktop | the table fits the screen — nothing to follow sideways |
| Errors in the browser, whole walk | **none** |

**One more thing the frame-by-frame pictures showed — filed, not fixed.** When the page scrolls the
dates header away, the frozen copy arrives ONE frame late, so that frame shows no dates header at all
(frame 1 of `fixed-desktop-frozen-bar-first-frames.png`). It was there before this change too; it is a
blink, not the sideways slide the owner filmed. Filed as `[LW-FROZEN-BAR-GAP]` with a fix direction.

## 12. What was NOT walked, and why

- **The iPhone itself (WebKit).** Walked in Chromium's iPhone emulation only. Whether iOS takes the
  scroll-linked path or the older one, both are now placed before the first paint; the owner's own look
  on his phone is the check that covers WebKit.
- **A real finger fling with momentum.** A scripted touch has none, so "no hop mid-fling" rests on the
  rule the fix enforces (a left draw over a width measured under other rows waits for rest), not a walk.
- **The under-manned jump and a war switch.** Both go through the same jump function and the same fill
  engine as the month strip; not driven separately. The demo has one war.
- **The bottom scrollbar's thumb in a picture** — headless Chromium does not paint that scrollbar, so
  its proof is the numbers above and the test that failed 5/5 before.
- **A slow machine.** Not re-run under the CPU-throttle switch; the phone fault lives on a FAST machine.

## 13. Gates on the final tree (before the two reads)

`npm test` 5759/5760 — **one timeout under load**: `figselect.test.tsx` "an undo, a stage change and the
drawer toggle all drop it" (20s limit) during the full run, with the Tracker chat's worktree active; alone
it passes 12/12 three times, and that test takes 5.1/4.8s on the old code and 5.1/4.9s on the new —
same speed, so not this change. · build OK · `tfin.js` 728/0 · `test:e2e` **465 passed / 46 skipped / 0
failed** (was 461/45: the four new tests and one phone skip) · `smoke:tracker` 425/0 · rulecheck OK ·
docsize `OVER by 4, deferred (D29)` (OUTSTANDING, inside a code change).

## 14. The two independent reads, and what each finding became

Brief: `docs/superpowers/briefs/2026-09-23-lw-fixes-inspection.md` (the order's finder wording and the
D56 exclusion, verbatim). **Astra** (Codex CLI, `gpt-6-astra`, high effort, read-only, the runner's
`inspect` mode on everything since `416751d4` including the round-2 CI fixes never re-read) and **Fable 5.1**
(Claude CLI, safe mode, Read/Glob/Grep only) — launched together, blind to each other, on commit `8ddb32b4`.
Both: REVISE.

| Finding | Who | What it said | Disposition |
|---|---|---|---|
| LW-101 · the Archive is a width input `widthGen` did not see | Astra (Fable's explicit negative said nothing was missing — the order's cheapest pointer) | CountRows' own `archiveOpen` shows rows that can widen a day column without changing any Matrix input | **Confirmed, FIXED**: the block calls `onArchiveChange` after its rows go in/out (a layout effect); the grid replaces its width token and re-measures, still without re-rendering. Tests: `counts.test.tsx` (the block's call, once per open/close, after the DOM changed) and `archivewire.test.tsx` (Matrix passes it) — both **red on `8ddb32b4`, green now** |
| LW-102 · geometry not refreshed on a content change | Astra | the frozen bar's pinned column widths, `--lwx-max`, the strip cache and the bottom bar were re-measured only on zoom/resize/scroll/war/window changes | **Confirmed (pre-existing on `main`), FIXED**: the re-measure and a value-checked frozen-bar re-pin run on every `widthGen` change. Test "a column that widens while the dates are frozen re-measures the frozen bar": **red 3/3 on `8ddb32b4` (24 March 8.8px off after a `*OIL` chip widened 17 March), green 3/3 now**; frame-by-frame re-check: 266 frames with the bar, 0 out of step |
| TEST-001 · `gridAtRest` can spin to the time limit | Fable | no bound, NaN never equals NaN, and the ≤1px desktop-fill nudge counted as motion | **FIXED**: named errors (not drawn in 5s / never still in 15s); ≤1px counts as still — a real slide (20px) still does not |
| CI-PATHS-001 · `.gitattributes` skipped the gates | Fable | it changes the bytes every job checks out | **FIXED**: removed from both `paths-ignore` lists |
| CI-REQ-001 · a skipped required check reads as Success | Fable | deleting `CI_ON_GITHUB` could let a red PC run merge if the split names are required | **Not reachable today — checked**: `main` has no protection and no required checks (the API: "Upgrade to GitHub Pro"); the rule for the day they exist is written into `deploy.yml` |
| SEC-101 · the PC guard lives in YAML a PR can change | Astra | a collaborator's PR runs its own workflow, so it could aim a job at his PC | **Not reachable today** (no collaborator can push). Written into `deploy.yml` and `[REPO-PRIVATE]`: **before any collaborator is added, remove the runner from this repo (or move it to an owner-only CI repo)** |
| SEC-102 · any local account can modify the runner's files | Astra | `Authenticated Users: Modify` inherited from `C:\` onto `C:\actions-runner` | **Confirmed** — and sharper than stated: this PC has two Codex-sandbox accounts besides the owner's. A security setting, so **his to run** (the agent may not): four `icacls`/service lines, handed to him with the reason |

## 15. Gates on the final tree (after the review fixes)

`npm test` **5762/5762** · build OK · `tfin.js` 728/0 · `test:e2e` **466 passed / 47 skipped / 0 failed** ·
`smoke:tracker` 425/0 · rulecheck OK · docsize `OVER by 36 (OUTSTANDING) and 1 (DECISIONS), deferred (D29)`.
One unit test needed its FAKE LAYOUT corrected, not its expectation: `monthstrip.test.tsx` stubbed each
month's on-screen position as a fixed number — right only while the grid measured once, at rest, before
the scroll. The grid now re-measures after any change that can widen a column, so a re-measure after the
simulated scroll read every month 1800px off (FEB for AUG). The stubs now move with `scrollLeft`, as a
browser's rectangles do; every expected month is unchanged, and the file's other ten tests pass as before.

## 16. Astra's re-read of the review fixes (fresh `inspect` session on `8ddb32b4`..`6ce79d20`)

REVISE, three items. **LW-103 (medium, pre-existing):** the Archive's change did not re-measure the green
open-bidding outline, which is placed off the header — the Archive's rows sit ABOVE the dates, so the outline
kept its old top across the header. **FIXED:** `onArchiveChange` also runs the outline's own (value-checked)
measure. Test "the open-bidding outline moves with the rows when the manning Archive opens". **TEST-002
(low):** the new frozen-bar test measured a missing date as 0 (`Math.abs(null)`); **FIXED** — a missing date now
fails by name. **SEC-102 (high):** still open — his four `icacls` lines, held until the PC run ends (the first
line stops the runner). Its negatives: no new `scrollLeft` write in the refresh path, no refresh loop, the
`monthstrip.test.tsx` stub change models a browser honestly, `.gitattributes` out of both ignore lists.

## 17. The first run on his PC as a SERVICE — found stuck, and why

`CI_ON_GITHUB` deleted, pushed `6ce79d20`: the routing worked (`all gates (your PC)` ran; the four GitHub
jobs skipped themselves), and install, build, the original-app suite, **all unit tests** and the browser
install passed on the PC under NETWORK SERVICE. Then the browser gate sat **30 minutes with no browser
started and nothing listening on its port**. Read off the PC's process table (read-only): two seconds after
the step began, the runner's own `git` was sitting in **Git Credential Manager**. Cause: under CI, Playwright
gathers git facts for its HTML report and, for a pull request, runs `git fetch origin <base>` — the
checkout keeps no token (`persist-credentials: false`, Astra SEC-003) and a Windows service has no screen,
so the sign-in prompt could never appear. The trial runs passed because they ran in his own logged-in
session, before SEC-003. **Fix:** `captureGitInfo: { commit: false, diff: false }` in
`playwright.config.ts` (we never read that data — the run now needs no network), and `GIT_TERMINAL_PROMPT=0`,
`GCM_INTERACTIVE=never` in the `pc` job so any future prompt FAILS at once. The stuck run was cancelled.

**LW-103's test, red first:** "the open-bidding outline moves with the rows when the manning Archive opens"
— without the fix the outline sat **22px** off the header after the Archive opened (3/3); with it, on it.
