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
| The OIL live readers (`engine/oilev.ts landedRow` / `landedHasSentinel` / `landedExtras`, `ui/oilmode.ts oilItemLabel`) | MISSING — raw find by id | **NOT A DEFECT, by construction:** a dead kept row sits only on a day its request cannot stand on (not covered, not an activity, or under Unavailable), so no day ever holds both a dead row and the request's live row; these helpers read ONE day, and every money caller asks only for a request that covers that day (`projectOilInputs`); on an issued face they must read the document raw (Astra agrees, §4). Walked: O4 (Bolt earns on Sunday beside a dead cancelled Saturday row), and round 3's Astra 1 test pins it |

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
| R | an AL1 withdrawn then the member's edit; the history's lines; a request handed on, then its first holder deleted | (below) | (below) |

## What the walk found

| # | Found | Disposition |
|---|---|---|
| W1 | **A request filed later landed ABOVE earlier landed rows** (U1: the row's place differed from the build before; confirmed with two all-day requests). A time-less row moved down a line when someone else filed — the board's "nothing re-orders itself" (10 Aug 26). | **FIXED**, red first: the landing reads the request list oldest first (`overlay.ts landRequests`). Re-walked: U's facts now equal the build before's. |
| W2 | **On a published day a member's new request wore a pending outline on every box and a hollow AL1 tag on the puck** (P1; pictures `p6c/probe-grnd-p6c.png` vs `base/probe-grnd-base.png`) — the same row accepted by the scheduler marks its item only. | **FIXED**, red first (`holderbase.ts requestAddMarks`): the add on its item, as Accept; a box the scheduler set apart keeps its mark. |
| W3 | **The issued request's time moved: the mark now sits on the START box, not the item box** (P0b; `p6c/probe3-grnd-p6c.png` vs `base/…`). The count is the same (1 pending); the old build marked the item because its re-link re-made the row. | **Intended** — the mark sits on what changed (D93: times keep their marks). Added to §8 as item 15; on his look card. |
| W4 | **A request moved to another day leaves the scheduler's second man behind** (X2: Bolt stays with Thursday's stored row and comes back if the request returns — X5, X6b); the build before carried him to Friday. Under the day lock a member's move cannot write Friday, and carrying him from Thursday's row would last only until Thursday's holder next saved it. | **Kept as built, put to him** — §8 item 14 and his look card; filed `[REQ-MOVE-EXTRAS]` for his answer. |
| W5 | **(The build before (c) — closed by (c).)** A member's out-of-date tab filing a request **unpublished Friday** (T4/T5: the day row his tab wrote back carried its old, unpublished state), and his later delete **wiped the scheduler's Thursday note** (T6). This build: neither — his command writes his request only. | Closed by (c); pinned by walk T. |
| W6 | **(The build before (c).)** A weekend request moved back onto Sunday after a version load never reached Sunday, so Bolt earned nothing there (O4). | Closed by (c) (round 3's Astra 1). |

Every other difference between the two builds is one the plan's §8 lists: item 5 (the Amendments panel's "Clear the marks
on days not yet published (N)" counts no mark a member's act used to leave), items 6–7 (the next-week preview; no "Moved
outside…"), item 9 (a load keeps a member's filing on the programme — and so its confirm reads "Discard 1 edit" where it
read 2, and its message "1 member input change stays pending"), item 10 (Undo of a delete puts the exact row back), item 12
(retyped back to an activity: on at once), and the storage itself (no day row from a request's command). One more, not in
§8, now item 16: the pending list names the member who deleted his own issued request as the one who made that change
("Ranger", where the old build said "Saber" — the holder whose day the old delete wrote).

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

*(filled after the run)*

## The code reads (rank 2 — BOTH, blind, with this sheet)

*(filled after the reads)*

## His look card

*(filled at the end)*
