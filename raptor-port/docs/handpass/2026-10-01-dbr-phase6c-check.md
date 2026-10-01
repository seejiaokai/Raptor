# Evidence sheet — `[DB-READINESS]` group A phase 6 step (c) v3, the holder base: the FULL check (1 Oct 26, D467)

Branch `claude/db-readiness-p6c-holder-base`, built on `claude/db-readiness-table-shaping-4094f6` (phase 6 (a), (b), (d),
FULL-checked 30 Sep 26 — `2026-09-30-dbr-phase6-check.md`). **The comparison build:** that branch's head just before (c),
`9191910b`, built from an export of its code and served beside this one (port 4202; this build on 4203). The plan:
`docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` §3 (c) v3, §8 items 5–14, §9. Astra's scenario design:
`docs/superpowers/briefs/2026-10-01-db-readiness-phase6c-check-scenarios-astra.md`.

## The eight questions and the tier (bug-check order §5)

| # | Question | Answer |
|---|---|---|
| 1 | Money / earned leave | **YES** — a request's row on a weekend earns OIL (D18, D25); a dead kept row must never be read as the live one |
| 2 | The published record | **YES** — a request's change on a published day reads pending from the view (16 Sep 26, D114, D174–D178, D98, D363) |
| 3 | Saved data | **YES** — a request's command no longer writes a day; new row fields `srcv`, `kept`; the load writes nothing |
| 4 | A shared drawer | **YES** — one view body at every door where a week comes into memory (the week on screen, a saved week, a never-saved week, the next-week preview, the load's count) |
| 5 | A new gesture | NO — no new control |
| 6 | A new surface | NO — no new screen, panel or sheet |
| 7 | Roles | **YES** — §11: a member's command may carry no schedule record at all (`perms.ts ownershipViolation`) |
| 8 | The warning list | **YES** — the checks read the worked-out days (a landed row's clash; a cross-week week read) |

**Tier: FULL.** The server question (D202) is carried by `perms.test.ts` / `perms-scan.test.ts` — green in the gate run below;
the §11 row changed (member → no schedule record), `data-model.md` §11 says the same (the ownership test pins it).

## The rulings in play (a later one wins — D90)

D467 (this check, on its own branch), D465 / D466, D450 (the day lock), D353 (reviewers), D148 / D350 (undo is your own),
D56 / D54 (demo-data harm is not a finding); D44 / D45 / D103 / D177 / D178 / D179 / D174 / D176 / D114 / D98 / D363 / D175 /
D271 / D170 / D172 / D91 / D338 and the 16 Sep 26 live-filing rule (the published record, a request's row); D25 / D2 / D18 /
D142 / D400 (OIL); D297 / D299 / D149 / D166 (people, a member edits his own); the board's "nothing re-orders itself"
(10 Aug 26). No clash between them found. **Rulings this session: none** (D468–D469 unused).

## The roll-call — "the request's row"

Astra's roll-call (her report §1, 60 places) is the table of record; every cell is filled there. Its MISSING lines and what
became of them:

| Place (file, function) | Astra | Disposition |
|---|---|---|
| The changes window's jump (`ui/ChangesWindow.tsx jumpOf`) | MISSING — a dead kept row was a target | **FIXED**, red first (`ui/dpfixes.test.tsx` "a dead kept row on Monday…"); walked (K2) |
| The load's filing restore (`engine/publish.ts filingRestorePlan`) | MISSING — a dead kept row read as "landed" | **FIXED**, red first (`state/p6c-requestonread.test.ts` "a dead kept row never decides the load's filing"); walked (K3b) |
| The retype message (`state/holderbase.ts rederive`) | MISSING — a dead kept row silenced it | **FIXED**, red first ("a dead kept row does not silence the retype message"); walked (K5) |
| The landing order (`engine/overlay.ts landRequests`) | E — new filings landed above older ones | **FIXED**, red first ("a landed row keeps its line…") — found by the walk too (U1) |
| A published day's marks of a request's new row (`state/holderbase.ts`, after `rebaseDayPending`) | F — every box marked | **FIXED**, red first ("…is marked as its Accept marks it") — found by the walk too (P1, the probe pictures) |
| The OIL live readers (`engine/oilev.ts landedRow` / `landedHasSentinel` / `landedExtras`, `ui/oilmode.ts oilItemLabel`) | MISSING — raw find by id | **FIXED after the final reads** (Astra's final #1), red first ("Astra final #1 — OIL…"); walked (K2). *This row first read "not a defect, by construction": a dead kept row, I argued, sits only on a day its request cannot stand on because it no longer covers it. Wrong — a request filed under Unavailable covers its day and still cannot stand there, so a plan brought back puts its row there dead; Bolt on that row was paid (the test's premise checked: he earns on the live row). The argument missed one of the three ways a row is dead.* |

The doors (Astra §4, and the plan's own roll-call): the week on screen (`store.ts workOutLoadedWeek`, after every command
`sched-commit.ts afterCommandPass`), a saved week (`weekstash.ts stashDays`), a week never saved (`weekctx.ts bundle`,
`ui/peek.ts`), the load's count (`drafts.ts dayAsLoadLeaves`) — **no missing door** (Astra's negative, and the walk: X4).

## The walk — method

The production build of each branch served locally, driven by a scripted real browser (bug-check order §7.2) at a fixed
clock (Wed 15 Jul 26, 09:00); every step judged three ways by the group driver (`scripts/handpass/dbrA-lib.mjs`): the rows it
wrote, each named by its change-log batch; a reload gives back exactly what was there; the reload writes nothing. Each
walk ran on THIS build and on the build before (c); `scripts/handpass/p6-compare.mjs` laid the screen facts side by side.
Scripts: `scripts/handpass/p6c-walk-{u,p,x,o,t,k,r}.mjs` (+ `p6c-lib.mjs`); runs in `docs/handpass/parts/p6c/`; pictures in
`docs/img/handpass/2026-10-01-dbr-phase6c/` — `p6c/` the first walk (the defects), `p6c-2/` after the fixes, `base/` the
build before, `p6c-phone/` and `base-phone/` at 390×844.

| Walk | What | This build | Build before |
|---|---|---|---|
| U | a day not published: file, hand-set time + a second man, member delete → Undo (the exact row back) → Redo, member's own filing, edits (words, time), re-date to Friday and Undo, the scheduler's save of the day | 42/42 (desktop), 42/42 (phone) | 34/35 (its re-make changed the row's id) |
| P | a published day: the issued request re-timed and back (D98), a live filing (pending, sign-offs fall, View-only keeps the issued face), A → B → A, delete → Undo → Redo, the issued request deleted (D114) → Undo, the scheduler signs in, load the issued version (D363, §8 item 9), ✕ (D174), Accept | 43/43 after the fixes | 33/37 |
| X | re-date within the week and across weeks (no refusal, no "Moved outside…"), the next-week preview, week 2 opened and back, retype to a leave and back, taken off then retyped (§8 item 12), hand-over to an extra (D271) | 42/42 | 32/33 |
| O | OIL: a weekend Training row cancelled on a published Saturday, moved away, the issue loaded back (a dead kept row), moved to Sunday — Bolt earns on Sunday, after a reload and when Sunday is published | 13/13 | 10/13 (the request never reached Sunday) |
| T | two people at once — two tabs over one store, neither re-reading it: a member's filing never touches a day the scheduler holds | 10/10 | 5/8 — **see finding W5** |
| K | a dead kept row beside the real one (Astra's §2 items 2, 3, 10): the changes-window jump, the load's filing (D98), the retype message | 15/15 after the fixes | — (no kept rows before (c)) |
| K2 | a dead kept row on a day its request COVERS (Astra's final read 1, 2): an "Other" request with Bolt on its row, "+ Alt Plan", ✕, → Unavail, the first plan brought back — Bolt earns nothing from the dead row; Saturday published so, the card taken out of Unavailable and Accepted, "Load onto working copy" — back to "Unavailable" with the dead row, nothing pending (D98) | 12/12 after the fixes (first run: the load's button said "Saturday is already at Original" — the count missed the filing it puts back: fixed) | — |
| R | an AL1 withdrawn then the member's edit (the working copy follows; View-only keeps the issued face; two pending, the four fallen); the change history tells his edit as ONE request line ("Meeting 16 Jul · times 10:00–11:00 → 10:30–11:00"), no line per re-made cell; a request handed from Bolt to Ridge, then Bolt deleted — Ridge's row stays | 12/12 | 11/11 (the same screen; its edit wrote Thursday's day row) |
| — | §8 item 6, pictured: a request filed for Tue 21 Jul from week 1 shows on the next-week preview (`p6c-2/X4b-peek-tuesday-p6c.png`; the build before: not there) | shown | not shown |

## What the walk found

| # | Found | Disposition |
|---|---|---|
| W1 | **A request filed later landed ABOVE earlier landed rows** (U1: the row's place differed from the build before; confirmed with two all-day requests). A time-less row moved down a line when someone else filed — the board's "nothing re-orders itself" (10 Aug 26). | **FIXED**, red first: the landing reads the request list oldest first (`overlay.ts landRequests`). Re-walked: U's facts now equal the build before's. |
| W2 | **On a published day a member's new request wore a pending outline on every box and a hollow AL1 tag on the puck** (P1; pictures `p6c/probe-grnd-p6c.png` vs `base/probe-grnd-base.png`) — the same row accepted by the scheduler marks its item only. | **FIXED**, red first (`holderbase.ts requestAddMarks`): the add on its item, as Accept; a box the scheduler set apart keeps its mark. |
| W3 | **The issued request's time moved: the mark now sits on the START box, not the item box** (P0b; `p6c/probe3-grnd-p6c.png` vs `base/…`). The count is the same (1 pending); the old build marked the item because its re-link re-made the row. | **Intended** — the mark sits on what changed (D93: times keep their marks). Added to §8 as item 15; on his look card. |
| W4 | **A request moved to another day leaves the scheduler's second man behind** (X2: Bolt stays with Thursday's stored row and comes back if the request returns — X5, X6b); the build before carried him to Friday. Under the day lock a member's move cannot write Friday, and carrying him from Thursday's row would last only until Thursday's holder next saved it. | **Kept as built — RULED 1 Oct 26 (D468): leave it**; §8 item 14. |
| W5 | **(The build before (c) — closed by (c).)** A member's out-of-date tab filing a request **unpublished Friday** (T4/T5: the day row his tab wrote back carried its old, unpublished state), and his later delete **wiped the scheduler's Thursday note** (T6). This build: neither — his command writes his request only. | Closed by (c); pinned by walk T. |
| W6 | **(The build before (c).)** A weekend request moved back onto Sunday after a version load never reached Sunday, so Bolt earned nothing there (O4). | Closed by (c) (round 3's Astra 1). |

Every other difference between the two builds is one the plan's §8 lists: item 5 (the Amendments panel's "Clear the marks
on days not yet published (N)" counts no mark a member's act used to leave), items 6–7 (the next-week preview; no "Moved
outside…"), item 9 (a load keeps a member's filing on the programme — and so its confirm reads "Discard 1 edit" where it
read 2, and its message "1 member input change stays pending"), item 10 (Undo of a delete puts the exact row back), item 12
(retyped back to an activity: on at once), and the storage itself (no day row from a request's command). One more, not in
§8 for a moment (item 16, withdrawn): the pending list named the member who deleted his own issued request as the one who
made that change — gone after Fable's F2 fix (the baseline always follows the pass); the re-walk reads as the build before.

## Astra's scenarios against what was walked

Walked in the app: 1 (O), 2 and 3 and 10 (K), 5 (U), 6 (P), 7 (U, P, X — every field but end date), 8 (U, P), 9 (R), 11
(X), 14 (R), 15 (U, P, K), 20 (R). Pinned by unit tests instead (the state is built through the same doors, a reload is a
second boot): 4 (`p6c-requestonread` "the base is what is stored…", "Astra 3 — kept's exit"), 12 ("Fable F2 — a two-day
request shortened…"), 13 (plan switch and template: `drafts`, `daytpl` suites; the version load: P6, K3b), 16 (the holder's
own row edits: every board suite), 17 (the checks: "Fable F4 — the checks see the landed row straight after the filing";
crew busy and the card's words read the same standing predicate — `interact`, `slots` suites), 18 (roles: §11 test; a
guest has no editing door — `perms.test.ts`), 19 (the renderers draw `DAYS`; the issued face is frozen — P1's View-only
picture; exports read `INPUTS` or the published face and are unchanged by (c)).

## Not walked, and why

- **A guest's session** (Astra 18): no guest is seeded for sign-in; a guest has no editing door (D213, `perms.test.ts`), and
  (c) changes no guest path.
- **A second device on the real database:** there is none yet; two tabs over one store with reloads is the stand-in (walk T).
  The 30-second check that brings another person's change in without a reload is group B's.
- **Exports** (Astra 19): they read the stored requests or the published face, which (c) does not change.

## Break tests (bug-check order §8.4)

Each fix of this check was red before it went in (the tests named above). The build's own wires were each broken on
purpose during the build (plan §9): the view at each door, the holder base's absorb, the landing on a published day, the
standing predicate at each lookup, §11 — each turned a named test red.

## Gates

**The final code (1 Oct 26, after both reads' fixes, under the PC lock):** unit **7401 / 7401** (463 files) · build clean ·
tfin **728 / 0** · e2e **509 passed, 0 failed**, 49 skipped · smoke **445 / 0** · rulecheck OK · docsize OK (OVER by 367,
deferred — D29) · perf **4 / 0** (week DOM 5134 ≤ 5450, board 1024 ≤ 1150; an edit 172 ms, a no-op edit 64 ms, the board
269 ms, a board no-op 86 ms — in absolute terms level with the build before (c) below; the reference ran faster this time,
so the ratios read a few points higher).

**The first run (on `37d8e9b7` — the walked build with the walk's five fixes):**

unit **7395 / 7395** (463 files) · build clean · tfin **728 / 0** · e2e **509 passed, 0 failed**, 49 skipped · smoke **445 / 0** ·
rulecheck OK (it notes `AM39d` is now covered — from `[UNDO-ROSTER-SETTINGS]`, before this branch; left for its own tidy) ·
perf **4 / 0** (week DOM 5134 ≤ 5450, board 1024 ≤ 1150). **Timing, this build against the build before (c), same machine,
same minute:** an edit 176 vs 169 ms (1.37× the reference both), the board 272 vs 266 ms (1.30× / 1.31×); an edit that
changes NOTHING 69 vs 65 ms and on the board 92 vs 83 ms — the after-command pass (the base compared day by day, the view
worked out over a copy) costs some 5–9 ms a command. Not gated (timings never are); filed with the overlay's cost for group B
(`[DB-READINESS]`, Fable F2 of 30 Sep 26).

## The code reads (rank 2 — BOTH, blind, with this sheet)

Briefs `…/briefs/2026-10-01-db-readiness-phase6c-check-final-read-brief.md`; reports `…-final-read-astra.md` (Codex,
REVISE, four findings) and `…-final-read-fable.md` (Fable 5.1, REVISE, two medium and one low). Neither read the other's.

| Finding | Disposition |
|---|---|
| Astra #1 (high) — live OIL paid from a dead kept row of a request filed under Unavailable | **FIXED**, red first (premise checked); walked K2. The rule: a row carrying `kept` is never the request's row (`oilev.ts landedRow`, `oilmode.ts oilItemLabel`) — exact both on screen and in an issued version |
| Astra #2 (high) — a version issued with a dead row and "Unavailable" could not be loaded back | **FIXED**, red first: the load plans the version's filings against its rows as they went out and marks `kept` after (`drafts.ts loadVersionToWorkingCopy` / `leaveOut`, `publish.ts filingRestorePlan`); the walk (K2) then found the confirm count missed it — **FIXED**, red first (`publish.ts dayDiscardCount`) |
| Astra #3 (medium) — an issued dead row read as the request's placement | **FIXED** for the landing, red first (`overlay.ts landRequests`); **its Accept half declined**: Accept keeps reusing the issued row's id, because the published face shows that very row and a landing restores it under the same id — a new id would read "removed + added" for a row that looks unchanged (comment at `slots.ts acceptInput`) |
| Astra #4 (low) — another request's change cleared a dead row's own marks | **FIXED**, red first (`holderbase.ts requestAddMarks`: its standing new row only) |
| Fable F1 (medium) — a landing took an id the old day's stored row still held; the holder's next save re-minted it and its marks went | **FIXED**, red first (`overlay.ts viewOfWeek` / `landedRid`: every id the days carry as handed in is held) |
| Fable F2 (medium) — a delete's book change (a sign-off) left the command layer's baseline stale | **FIXED**, red first (`sched-commit.ts afterCommandPass`: the resync is unconditional; `holderbase.ts rederive` counts a book change) |
| Fable F3 (low) — the view's cost on every read | **Measured** (§Gates: 5–9 ms a command on a no-op edit, the rest level); **filed** for group B (`[DB-READINESS]` (iii)) |
| Fable's two questions | (1) an undone delete after the holder saved the day waits for Accept — kept as built (the plan's stated limit), one line on his card; (2) a member's remarks edit resets a hand-set time — pre-existing (the old re-link did the same), left |
| Astra's two questions | (1) Load restores a version's `r` filing and its row exactly — yes, as built (D98); (2) a live request with no standing row: its OIL window reads "not found" rather than a dead row's — as built |

**The re-walk** (bug-check order §5): all eight walks run again on the final build, pictures in
`docs/img/handpass/2026-10-01-dbr-phase6c/p6c-3/` — U 42/42, P 43/43, X 42/42, O 13/13, T 10/10, K 15/15, R 12/12, K2 12/12;
compared with the build before, every difference is one §8 lists (items 5–7, 9–10, 12, 14–15), a defect of the build before
closed (W5, W6), or the storage itself. The unit suite after every fix: **7401 / 7401**.

## His look card — five minutes, on his preview

1. **Inputs page, a day not yet published:** file a meeting for Ranger on Thursday. It is on Thursday's Ground Programme at
   once. Delete it, then press Undo — it comes back in the same place, with anything you set on its row (a time you typed, a
   second man). Its new rows go BELOW the ones already there.
2. **A published day:** sign in as Ranger (`us` / `us`) and file a meeting on it. Signed back in as Saber, the day reads
   "1 pending" and the four sign-offs have fallen; on the working copy only the new row's ITEM box is outlined, as when you
   press Accept; View-only Sched still shows the day as published.
3. **Move a request to next week** on the Inputs page: no "Load the week of …", no "Moved outside the programmed week"; it
   shows on next week's preview at the right of Edit Schedule, and on that week when you open it.
4. **Answered (D468, 1 Oct 26 — leave it):** a request moved to another day arrives as filed; a second man you put on its
   row stays with the old day. Check it once: move a request with a second man on it — he is not on the new day.
5. **Known, as designed:** if a member deletes his request on a published day, you then save that day, and he presses Undo —
   his request comes back under Personal Inputs, and Accept puts its row back.
6. **Before "merge live":** export a copy of your Tracker first (D464).
