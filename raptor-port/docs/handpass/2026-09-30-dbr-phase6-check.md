# Evidence sheet — `[DB-READINESS]` group A phase 6, built steps (a), (b), (d): the FULL check (30 Sep 26, D467)

Branch `claude/db-readiness-table-shaping-4094f6`, the walked build frozen at `943e4ea8` (served from a copy, so no rebuild
could swap it mid-walk). **The comparison build:** the app as it stood just before phase 6 (`0d1a5e18`), built from an export
of its code and served beside it. The plan: `docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` (§3 (a), (b),
(d); §5 the checks). Step (c) is not built (D467) and is out of this check.

## The eight questions and the tier (bug-check order §5)

| # | Question | Answer |
|---|---|---|
| 1 | Money / earned leave | **YES** — (a) changes how an OIL refusal about a request is kept when the request changes hands (OIL is earned leave, D25) |
| 2 | The published record | **YES** — (b) stops writing pending marks on published days; (d) a delete on a published day to come reads pending |
| 3 | Saved data | **YES** — all three change what is saved (new fields `Input.hand` / `Input.leftAt`, `oild.pa`, `Person.deletedFrom`; no day written) |
| 4 | A shared drawer | **YES** — the read-time overlay is applied wherever a week's days come into memory (five doors) |
| 5 | A new gesture | NO — no new control |
| 6 | A new surface | NO — no new screen, panel or sheet |
| 7 | Roles | **YES** — the day lock to come (D450): a hand-over, a filing and a delete must write no day row (§11) |
| 8 | The warning list | **YES** — the validator reads the overlaid days (a deleted man's warnings on days to come) |

**Tier: FULL.** The server question (D202) is carried by `perms.test.ts` / `perms-scan.test.ts` — green in the gate run below.

## The rulings in play (a later one wins — D90)

D467 (this check first; (c) after), D465 / D466, D450 (the day lock), D25 / D2 / D142 / D18 / D43 / D48 / D400 (OIL), D44 /
D45 / D103 / D177 / D178 / D179 / D189 / D174 / D176 / D114 / D98 (the published record), D363 / D175 (a version load / a plan
switch), D287 / D290 / D297 / D299 / D304 / D321 / D327 / D229 (a delete; a posting out), D337 (the delete's history lines),
D148 / D350 (undo is your own; a delete and a posting are not undone), D56 / D54 (demo-data harm is not a finding). No clash
between them found.

## The roll-call

Drawn from my own sweep of every reader of a saved or seeded week (`stashGet` / `stashDays` / `weekBundle` / `stashSched`
callers), every reader of `oild`, and every reader of an `inp:` mark — and, independently, from Astra's scenario design
(`docs/superpowers/briefs/2026-09-30-db-readiness-phase6-check-scenarios-astra.md` §1). The two lists agree; neither found a
missing door.

### (i) Where a week's days come into memory — does a deleted man come off from his cutoff?

| Door | Has it / must not, because… / MISSING | Walked |
|---|---|---|
| the loaded week — `state/store.ts applyWeekModel` (a week load, a reload) | **has it** (skipped for a byte-preserved, read-only week — the delete refuses while one holds him: `person-delete.ts stashPreflight`) | D3, D4, P4, P5 |
| the boot's seed path (no stored week) — `initStore` | **has it** | P5 (reload) |
| the week on screen after the delete's command — `applyDelete`'s deferred effect | **has it** (baseline moved on: nobody's change, nothing saved) | D2, D6, P2 |
| a saved week read for anything — `engine/weekstash.ts stashDays` (crew-rest look-ahead, the alias gate, the peek, the row finder, `oilev.ts stashStanding`) | **has it** | D2 (peek), D4 |
| a week never saved — `weekctx.ts bundle`'s seed branch (on a copy), `ui/peek.ts`'s seed fallback | **has it** — **and the build before phase 6 did NOT** (see finding F2) | P4 |
| a whole-day replacement — `engine/drafts.ts liveDay` → `HOOKS.stripDeleted` (`stripDeletedFromDay`, a version loaded, a plan switched in) | **has it** (the belt, now by the request's current holder) | P6 |
| an issued version (`weekctx.ts issuedDayIn`, View-only Sched's issued face, the Leave War's credits `sync.ts stashOilWeek`) | **must not, because an issued version is a record (D299)** — it keeps him | D2 (View-only Sched keeps Hex) |
| the storage layer (`weekrows.ts`, `persist.ts`, `store.ts` row writers) | **must not, because it is the stored copy, not a read of the working day** | D2, D4 (stored rows untouched) |
| `person-delete.ts stashPreflight`, `roster-restore.ts stillNamed`, `quarantine.ts stashProtected` | **must not, because they inspect the raw stored bytes on purpose** (a preserved week's refusal; a belt for removing a record, which a delete never does — D290; a format check) | — |
| the planning calendar | **must not, because it is its own record** — `applyDelete` gaps him there directly | — |
| caches keyed on a week's bytes: the peek (`peekKey`), `stashGroundBySrc`, `weekctx.ts bundleCache` | **has it** — the first two key on `deletedSig()`; the third holds the pure seed and overlays a copy per read | D2 (peek warmed before, cleared after) |

### (ii) Every reader of an OIL per-man decision — does a decision from an earlier holding stop counting?

| Reader | Has it / must not, because… | Walked |
|---|---|---|
| `engine/oilev.ts oilEvidence` → `pruneHandedOverDecisions` (the one door) | **has it** | A, A2 |
| the OIL Earn mode's pucks and switches (`ui/oilmode.ts`, `personDecision` on the evidence copy) | **has it** | A2–A10, A2-2 – A2-7 |
| the pending axis `publish.ts oilDelta`, the publish freeze `d.oilev = oilEvidence(di)`, the sign key, `pendlist.ts` | **has it** | A9, A10, A2-4, A2-5 (the counts and the "What this day earns · changed" line) |
| `publish.ts dayDiscardCount`'s raw compare (`oilDecisionsKey`, which leaves `pa` out) | **must not, because it measures what a load would discard, raw against raw** | — |
| an issued version's frozen `oilev`, the Leave War's credits, the OIL tracker | **must not, because the latest issued version pays until the next (D142)** | — |
| `overlay.ts stripOilSwitches`, `oilmode.ts tidy` | **must not, because they maintain the record, not read it** | — |

### (iii) Every reader of the old `inp:` filing marks — does anything still depend on a mark no longer written?

| Reader | Has it / must not, because… | Walked |
|---|---|---|
| a published day's count, pending list and four sign-offs (`filingDelta` against the issued `fil`) | **has it** — counted from the filing itself | B4–B8 |
| Unpublish (no `inp:` key re-opened) | **has it** — the filing reads pending again from the filing | B7 |
| the Amendments panel's "Clear the marks on days not yet published (n)" (`discardableCount`) | **must not, because the button never undid a filing** — it no longer counts one (finding F1) | B2 |
| a never-published day's head ("N changes") — the changes window | **must not, because it counts history lines, not marks** — unchanged | B2 |
| `engine/drafts.ts`'s old `inp:` guards | **must not, because they only read marks already stored (D56)** | — |

### (iv) The acts — what each may write

| Act | Rows it writes (walked, storage read before and after) | A day row? |
|---|---|---|
| a hand-over of a claim with no row (an overseas duty) | the request, the history line | **none** (the build before phase 6 wrote Saturday's) — A2-4 |
| a hand-over of a request with a landed row | the request, the history line, the row's day (the relink — step (c)'s, not built) | the landed row's day only — A3, A4 |
| a filing under Unavailable (→ Unavail), its Undo, Redo | the request, the history line | **none** (the build before wrote every covered day's book) — B2, B5 |
| a delete (Admin → Users) | his person, account, requests, history lines, the war | **none** (the build before wrote four day rows across two weeks) — D2, D6 |
| a delete run by the posting pass inside a Leave War command | the same, in the war's one command | **none** (the build before wrote three) — P2 |
| the day's holder's next change to a day to come | that one day's row, without him | that day only — D5 |

## The walk — method

Four scripted walks (Playwright, the production bundle, the clock fixed at Wed 15 Jul 26 so the demo week straddles a delete's
cutoff), each step audited by the group driver (every row it wrote named by its change-log batch; a reload gives the state
back and writes nothing). **Each walk ran twice — on this branch and on the build before phase 6 — recording what the screen
said at every step** (the day heads, the Amendments panel, the pending lists, the OIL switches, who sits where, the peek).
`scripts/handpass/p6-compare.mjs` lays the two runs side by side: phase 6 promised that nothing on screen changes (bar the plan's
§8 two), so every difference is either the intended storage change or a finding. Scripts: `scripts/handpass/p6-lib.mjs`,
`p6-walk-a.mjs`, `p6-walk-a2.mjs`, `p6-walk-b.mjs`, `p6-walk-d.mjs`, `p6-walk-p.mjs`; results `docs/handpass/parts/p6check-*`
(`*-facts.json` = what the screen said). Pictures: `docs/img/handpass/2026-09-30-dbr-p6check/` — every step of this branch's
walks (`*-p6`, `phone-*`); of the build before phase 6 only walks B and P (the screens behind F1 and F2 — the others matched,
fact for fact).

| Walk | What it did | Checks passed (this branch / before) | Screen facts the same | Differences |
|---|---|---|---|---|
| **A** — a landed request with an OIL refusal | a meeting on Sat 18 Jul; Bolt refused in OIL Earn; handed to Ridge, back to Bolt; Undo ×2, Redo ×2, reload; a new refusal under the current holding; Saturday published; handed on and back on the published day; reload | 19 / 19 | 33 of 37 | storage only: `pa` beside the refusal; `hand` / `leftAt` on the request; the refusal left inert in the stored day instead of cleared |
| **A2** — a claim with no row (overseas duty) | refused in OIL Earn; Saturday published; A → B → A; Undo ×2 (the refusal back); Redo ×2; reload | 8 / 8 | 29 of 30 | storage only: the hand-over wrote no day (before: Saturday's row) |
| **B** — filing under Unavailable | an "Other" request Thu–Fri (landed, its row taken off, → Unavail) on never-published days; Undo, Redo, reload; Thu and Fri published; a second one filed live, taken off, → Unavail; Undo, Redo, reload; Friday's AL1 published then Unpublished; the card's Undo back out; reload | 13 / 13 | 79 of 86 | storage (no day rows, no `inp:` keys); **F1** — the Amendments panel |
| **D** — Admin → Users → Delete | Thursday published; week 2 saved; Hex deleted; the week, the board, View-only Sched, the peek, week 2, the history lines; reload; the holder's next change to Wednesday; Anvil deleted | 12 / 12 | 40 of 46 | storage (no week rows; week 2's rows untouched); **F1** |
| **P** — the posting pass's delete | Anvil posted out today with "Delete" from the Leave War; Undo (refused — "A later change touches the same thing and can't be undone"); week 2 never saved, opened; reload; Thursday's ORIG loaded back onto the working copy | 11 / 10 | 25 of 28 | storage; **F1**; **F2** — the build before failed "week 2 (never saved): Anvil on none of its days" |

## What the walk found

| # | Found | Disposition |
|---|---|---|
| **F1** | **The Amendments panel (Edit Schedule) no longer counts the marks a filing under Unavailable, or a delete, used to leave on days never published.** Before phase 6, after → Unavail on a never-published day it read "Changes are on unpublished days — publish the day first" with "Clear the marks on days not yet published (2)" offered; pressing it cleared the two marks and left the filing exactly as it was. Now it reads "No pending changes" and the button is greyed. After a delete, its count drops by the days the delete touched (the delete's strip leaves no marks). Every other count — a day head, a pending list, a sign-off — is the same. | **Correct as built, confirmed-new** (compared against the build before phase 6): the plan §1 named `discardableCount` as the marks' only reader, and the button now counts only what it can clear. But it is a visible change the plan's §8 did not list — **§8 amended** (item 3) and **on his look card**. |
| **F2** | **A delete now also takes the man off a week nobody has saved yet.** Before phase 6 the delete rewrote only the weeks already saved; a week still showing the demo seed (week 2, untouched) kept the deleted man on every day he was seeded — the build before phase 6 showed Anvil on Wed 22 and Fri 24 Jul after his delete. Now every week is read without him from his cutoff. | **A defect of the build before, closed by phase 6 (d)** (walk P4: this branch passes, the build before fails). A visible change — **§8 amended** (item 4) and **on his look card**. On a shared database there is no seed, so the old hole would have been any week not yet written. |
| **F3** | A code comment (`state/person-delete.ts`'s head) said the loaded week's strip sat "in the undo records … state/persist.ts DERIVED_DAY_TYPES" — a type list the plan withdrew before the build; the strip is recorded by no command. | **Fixed** (comment only). |
| **F4** | **Four wires of the delete's overlay had no test** (the break tests below): the boot's seed path, the peek's seed read and its cache key, the row finder's memo key — each could be broken with every test green. The walk proved the behaviour for none of them either (the peek showed only next Monday, where the walked man was not). | **Fixed** — three new tests in `state/p6d-deleteonread.test.ts`, each red with its wire broken, green as built. |
| **F5** | Two exported writers that rewrote a saved week in place (`weekstash.ts stashEditDays`, `stashEditWeek`) were left with no caller once phase 6 (a) and (d) removed theirs. | **Removed** (a one-comment pointer left in their place); the typecheck and the gates find no caller. |

Probed and **not** a defect: an Undo (or Redo) of an edit made BEFORE a delete, on a day to come — on the week on screen or
another week — is refused ("A later change touches the same thing and can't be undone"; the Redo: "Hex has been deleted —
that change can't be undone"), so the deleted man never comes back; the same words as the build before (walk P3; unit probes
in `state/p6d-deleteonread.test.ts`, kept as pins).

## Astra's scenarios (rank 1, one reviewer — D353) against what was walked

| Astra # | Walked / pinned / not |
|---|---|
| 1 posting-pass delete | walked (P2) — a desk, a sim seat; the war's own ended state not re-walked (unchanged by phase 6) |
| 2 warm caches, then delete | walked (D1 → D2: the peek read before and after) |
| 3 every seat kind and sign-off | walked for flying seats, desks and a sim seat (D, P); the rest pinned by the roll-call test `state/person-delete.test.ts` (each seat kind by name) and `p6d-deleteonread.test.ts` (sign-offs, a saved plan) |
| 4 a request spanning the cutoff | pinned (`person-delete.test.ts`, Fable's code read 1, 27 Sep 26) — not re-walked |
| 5 a never-saved week | walked (P4) — **F2** |
| 6 the first edit after the delete | walked (D5) |
| 7 Undo / Redo after the delete | walked (P3) and probed in units — refused, never revived |
| 8 plan / version / template after the delete | version load walked (P6); plan switch pinned (`p6d` "a saved plan parked…"); a day template carries no people at all (every person blanked when it is made — `engine/daytpl.ts`), so it has none to bring back; not walked |
| 9 a published OIL refusal, A → B → A, no row | walked (A2) |
| 10 an extra becomes the holder | pinned (`p6a-oilstamp.test.ts`, three extra cases) — not walked (placing an extra on a request row is a board drag the walk did not script) |
| 11 a decision after the hand-over, Undo / Redo | walked in part (A8: a refusal made under the current holding counts); Undo / Redo of the hand-over walked (A6, A7, A2-6) |
| 12 every OIL reader agrees | walked for the OIL Earn switches, the day head, the pending list (A, A2); the ALL AVAIL window's OIL tab and the OIL tracker not walked (they read the same evidence door) |
| 13–17 filings: published multi-day, back to the issued value, D174 / D176, Accept adopting, Unpublish | walked B4–B8 (published multi-day, Undo / Redo, Unpublish, the card's Undo back out); D174 / D176 pinned (`p6b-filingmarks.test.ts`) |
| 18 a version load with a changed filing | pinned (`publish` / `drafts` suites) — not walked |
| 19 two tabs | the reload IS the second client here (the app does not re-read storage while open) — every walk reloads after its acts |
| 20 roles | carried by the gates (`perms.test.ts`, `perms-scan.test.ts`, the ownership test) — no member-side door for any of the three acts |

## Not walked, and why

- An extra on a request row (Astra 10) — unit-pinned; placing an extra is a board drag the walk did not script.
- The ALL AVAIL window's OIL tab and the OIL tracker after a hand-over — they read the same evidence door the OIL Earn mode reads.
- A template after a delete — a template carries no people (Astra 8, above).

## Break tests (bug-check order §8.4) — every wire broken once on purpose

Re-done in this check, thirteen wires, each broken in the source, its named test files run, the file restored byte for byte.
**Four went green on the first pass — no test, by proof** (finding F4); a test was written for each, red with its wire broken:

| Wire broken | Test that goes red |
|---|---|
| the loaded week's overlay (`applyWeekModel`) | `p6d` — 5 (a saved week opened; a reload; a saved plan; a sign-off box; a published day) |
| **the boot's seed-path overlay (`initStore`)** | **was none** → new `p6d` "a reload with NO week ever saved (the boot reads the seed) shows the week without him" |
| a saved week's overlay (`stashDays`) | `p6d` — the cross-week read / peek; the new row-finder test |
| the never-saved week's overlay (`weekctx.ts bundle`) | `p6d` — "a week NEVER saved (the seed)… next Monday for crew rest" |
| **the peek's seed overlay** | **was none** → new `p6d` "the next-week peek of a week NEVER saved, drawn before the delete, is drawn again without him" |
| **the peek's cache key (`deletedSig`)** | **was none** → the same new peek test |
| **the row finder's memo key (`deletedSig`)** | **was none** → new `p6d` "the row finder, read before the delete, reads a saved week again without him" |
| the delete's after-command overlay | `p6d` + `person-delete` — 9 |
| a landed row by its request's CURRENT holder | `overlay.test` + `p6d` — 2 |
| the hand-over prune (`leftAt`) | `p6a` + `oilconfirm` — 5 |
| the hand-over stamping `leftAt` | `p6a` + `oilconfirm` — 5 |
| a decision stamping its holding (`pa`) | `p6a` — the control ("a refusal made under the CURRENT holding still takes his day") |
| a filing writing a mark again | `p6b` — 5 |

## Gates (30 Sep 26, under the PC lock, on `943e4ea8` + the F3 comment)

unit **7359 passed**, 12 skipped (463 files — the 12 skipped are step (c)'s red tests, committed skipped) · build clean · tfin
**728 / 0** · e2e **509 passed, 0 failed**, 49 skipped · smoke **445 / 0** · rulecheck OK (it notes AM39d is now covered and
could leave its baseline — not this change's) · docsize OK, "OVER by 331, deferred (D29)": `OUTSTANDING.md` 78 lines over and
the how-we-work rulings 253 bytes over, both already over at the branch's head before this check — a code change never trims
(D29). After the four new tests: `p6d-deleteonread.test.ts` **14 / 14**.

**perf** (`npm run perf` on the walked build and on the build before phase 6, under the lock): **4 / 0 on both**, board DOM
1024 ≤ 1150, week 5134 ≤ 5450; painted timings level (oneEdit 144.7 against 157.6 ms at 4×, noise). The gate boots with nobody
deleted, so the overlay was also timed apart once two men are deleted: one `validate()` ≈0.90 ms against ≈0.72 ms before phase 6
(≈0.2 ms, under 1% of a painted edit) — recorded in `docs/performance.md` item 26.

**After the fixes (Fable F1, F5, the four new tests) — the full gate set again, under the lock, on the final code:** unit
**7363 passed**, 12 skipped (464 files; the four new tests) · build clean · tfin **728 / 0** · e2e **509 passed, 0 failed**, 49
skipped · smoke **445 / 0** · rulecheck OK · docsize OK, "OVER by 342, deferred (D29)" (`OUTSTANDING.md` 89 lines over after
this check's filings, the how-we-work rulings 253 bytes — both over before it; a code change never trims). The orphaned
writers were removed while that run's unit stage was under way, so every test file that imports the saved-week code was run
again on the final file: **47 files, 685 passed** (12 skipped — step (c)'s).

## The phone width

Walks D, A2 and B re-run at 390 × 844 on the walked build: **12 / 12, 8 / 8, 13 / 13** — every gesture reached (the Admin
Users section, the board's OIL Earn from the day bar, the Personal Inputs fold, → Unavail, the sign-offs, Publish); pictures in
`docs/img/handpass/2026-09-30-dbr-p6check/phone-{d,a2,b}/`, looked at (the published Thursday's "1 pending · Not yet signed"
on the phone board after the delete; the overseas duty's switch off, "Bolt earns nothing from overseas duty").

## The code reads (rank 2 — BOTH, blind, with this sheet)

Brief: `docs/superpowers/briefs/2026-09-30-db-readiness-phase6-check-final-read-brief.md` (the finder wording, the D56
exclusion, step (c) out of scope). Neither reviewer saw the other's report.

**Fable** (`…-phase6-check-final-read-fable.md`): **no high, no medium; two low.** Its explicit negatives cover every door
where a week's days reach memory, the delete writing no day (the command's phase order — the diff at phase 4, the deferred
effect at 8, a rollback discarding it), the posting pass's nested case, the undo guard, D337's lines, the one OIL door (`pa`
kept out of every key, so D98 holds), `commitInputEdit` as the only holder-change door, and no `inp:` reader left but F1's.

| # | Finding | Disposition |
|---|---|---|
| Fable F1 (low, pre-existing in shape) | A delete made while the week ON SCREEN is read-only (a saved book this build cannot edit) went ahead: the overlay took him off the screen, a reload put him back (a read-only week is shown as saved). The same week OFF screen refused the delete. | **Fixed, red first** — one rule: `stashPreflight` now refuses for the loaded read-only week too (the same words); belts: the delete's after-command overlay and `stashDays` skip a read-only week. New test in `p6d-deleteonread.test.ts` (red before, green after); the five touched suites 61 / 61. |
| Fable F2 (low, speed over years) | The overlay walks each day once per deleted man, and looks each landed row's request up by a full search — for every read of a week, inside every keystroke's `validate()`; a deleted man is never erased, so the cost grows with the squadron's history. Measured today: ≈0.2 ms per `validate()` with two deleted. | **Filed** (`OUTSTANDING.md` `[DB-READINESS]`, with group B, where the 30-second check runs the same overlay on a day on screen and must be measured) with Fable's exact fix (the cutoffs filtered once, one request index per call reading `r.iid`, one holder map per day) and the memo of the overlaid seed (`performance.md` item 26). No user impact today. |
| Fable's question | The delete's "seat emptied" history lines cover only the week on screen (the requests', bids' and awards' lines are written whatever week is open — D337). Pre-existing, not phase 6's; Fable recommends leaving it. | **Filed as a question for him** (`OUTSTANDING.md`), not put now — nothing waits on it. |

**Astra** (`…-phase6-check-final-read-astra.md`): **no findings** — "accept the phase-6 (a), (b), and (d) implementation".
Its ranked scenarios (the posting pass's ordering first), its full door / reader / writer roll-call and its explicit negatives
agree with Fable's and with the walk. (The read ran read-only and could not save its report itself; its session was resumed
once to print the report it had prepared — no second review.) **Reconciled:** Astra's negative "an unreadable or preserved
affected stash is refused" did not see the week ON SCREEN — Fable's F1, fixed above; Fable's F2 (the overlay's growth with
the deleted roster) Astra read as no finding at today's measured cost — settled by the measurement: no user impact today,
filed for group B with the fix. Astra's roll-call says a version loaded after a delete "displays 'left out — he has been
deleted'": the walk's picture shows it ("Thursday: Original loaded onto the working copy … · Anvil left out — he has been
deleted", `rewalk-p/P6-1-after.png`) — the walk script's toast recorder, dropped by the reload before that step, had read
nothing; the picture, looked at, shows the words.

## After the reads — the fix, the re-walk, the look card walked

- **Fable F1 fixed** (above); **also removed:** `engine/weekstash.ts stashEditDays` / `stashEditWeek`, the two writers that
  rewrote a SAVED week in place — phase 6 (a) and (d) took their last callers away, and a writer of weeks nobody holds must not
  be left to be called again (D450); found by the documents sweep (finding **F5**, below). Documents put right with F1 (D201):
  `engine-rules.md` (the delete's paragraph still said "the loaded week through the funnel, every stashed week"),
  `feature-impact.md` Flow (the same), the code comments of `person-delete.ts`.
- **Re-walk** of walks D and P on a rebuild with the fix (`docs/img/handpass/2026-09-30-dbr-p6check/rewalk-{d,p}/`,
  `parts/p6check-rewalk-*`): **12 / 12 and 11 / 11; every screen fact the same as the first walk (46 of 46, 28 of 28).**
- **His look card's step 1 walked at the REAL date** (`scripts/handpass/p6-lookcard.mjs`): on the week of 5 Oct, Wednesday's
  board, "+ Item", Bolt put on it; Admin → Users → Delete: gone from Wednesday, still gone after a reload, his July days keep him.

## His look card — five minutes, on his preview

(The real date is 30 Sep 26, so a delete takes a man off days from today on; the demo's July weeks are all before it and
keep him. Step 1 plants him on a day to come first.)

1. **A delete.** On Edit Schedule go to the week of 5 Oct, open Wednesday 7 Oct's board, add a Ground Programme item
   ("+ Item") and put a man on it; then Admin → Users → him → Delete (asked twice). Back on that week he is gone from
   Wednesday — and stays gone after a reload; his July days still show him.
2. **The Amendments panel** (Edit Schedule, the "Amendments" box). File an "Other" request on the Inputs page, take its row
   off the ground programme (✕), and press → Unavail on its card: the panel reads "No pending changes" — it used to offer
   "Clear the marks (2)", which never changed anything. Is the new reading right to you?
3. **OIL, handed on and back.** In OIL Earn on a published weekend, switch a man off on his request, hand the request to
   someone else on the Inputs page, then back to him: he earns again — the day reads "1 pending", as before.
4. **Before "merge live":** export a copy of your Tracker first (D464). Your look at phases 0–5b (the card at the foot of
   `2026-09-30-dbrA-group-walk.md`) is also still to do.

## The closing lines

`Walk: docs/handpass/2026-09-30-dbr-phase6-check.md · 117 pictures · 13 surfaces · 21 orders · MISSING: fixed 3 (F4's four untested wires, Fable F1, F5) / ruled 0 / filed 2 (Fable F2, Fable's question)`

The 13 surfaces: Edit Schedule's week, the scheduler board, View-only Sched, the next-week peek, OIL Earn (a request row and
an Unavailable claim), the Personal Inputs panel, the Amendments panel, the changes window, Admin → Users, the Leave War's
posting sheet, the Inputs page's editor, the plans menu and its version preview. The 21 orders: A — A → B → A, Undo ×2,
Redo ×2, reload, a new refusal, published hand-over and back, reload; A2 — refused, published, A → B → A, Undo ×2, Redo ×2,
reload; B — taken off, → Unavail, Undo, Redo, reload, published, filed live, → Unavail, Undo, Redo, reload, AL1, Unpublish,
back out, reload; D — delete, reload, a saved week opened, the holder's next change, a second delete; P — the posting
pass's delete, Undo, Redo, a never-saved week opened, reload, a version loaded.
