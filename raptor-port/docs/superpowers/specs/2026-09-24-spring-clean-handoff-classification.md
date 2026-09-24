# Spring clean — `HANDOFF.md` classified, unit by unit (Fable, read-only, 24 Sep 26)

Tier 3: the evidence behind the `HANDOFF.md` moves in `2026-09-24-spring-clean-plan.md` §3 (H4, H5). Written by
Fable 5.1 against `main` at `d0a1bb94`; line numbers are that file's. Saved whole so the reasoning survives the
chat (D68). Legend: **R** resolved story → `HANDOFF-ARCHIVE.md` · **F** open, already filed · **NF** open, not
filed · **D** durable fact/rule/trap · **S** stale.

## 1. §In flight (lines 184–391)

| lines | gist | verdict | destination | evidence |
|---|---|---|---|---|
| 186 | PR #428 merged; "read HANDOFF-NEXT first"; two chats beside it (D153 Tracker check, D154 demo) | **S** (all but the pointer) | keep only "Read `HANDOFF-NEXT.md` first"; rest → archive | Tracker retest merged PR #429 (23 Sep); demo DONE (D135, 24 Sep); `[ALL-AVAIL-WINDOW]`/`[DOCS-GUARD]` archived 24 Sep |
| 187–193 | next session executes the two OIL scenario lists; on `claude/oil-auto-remove-design` | **S / R** | archive | The walk was done: `docs/handpass/2026-09-22-oil-walk.md`; `[OIL-AUTO-REMOVE]` merged 22 Sep (D34; OUTSTANDING.md 634–640). The bug-check-order pointer already lives in `raptor-port/CLAUDE.md` §How to work here + `.claude/rules/bug-check.md`. |
| 195–205 | cross-provider check, ten defects, freeze-boundary root cause, R-1/R-2, O-1 | **R** | archive | D1–D3 in `.claude/rules/decisions/oil.md`; `engine-rules.md` §Weekend/PH work earns OIL (line 1647); fixplan spec exists |
| 207–214 | owner found two by hand; "run the reviews AND drive the app" | **R** (lesson institutionalised) | archive | `bug-check-order.md`, `.claude/rules/bug-check.md`, CLAUDE.md §How to work here, OUTSTANDING `[HUMAN-RETEST]` 607–619 |
| 216–232 | gates after fixes; 29-ruling register; seat list; what shipped; OIL35 SANS clash; schema-5 reset; pointers | **R**, one clause **S** | archive | Seat list "(SC SPARE · AVALON wave · AVALON desk do not)" superseded in part by D24/D35/D43. OIL35 carried: `engine-rules.md` 1771–1781, register OIL35, `leavewar/known-gaps.md` 1085–1093. Schema 5: `data-schema.md:91`. Contracts: `engine-rules.md` §1647, `ui-contracts.md` §7099. |
| 234–242 | `[CMDL-FINISH]` DONE; CMDLF-002 + Import grouping under `[GLOBAL-UNDO]` | **R** | archive | `OUTSTANDING-ARCHIVE.md:298`; OUTSTANDING 437–439 carries both deferrals; `docs/undo-contract.md` |
| 244–254 | ARCH-STACK step 2 + follow-up #1 merged #409; "follow-up #2 latch persist with histPush; steps 3/5 live in OUTSTANDING.md" | **R** + one **NF?** | archive; check follow-up #2 | Step 3 = `[GLOBAL-UNDO]` (built), step 5 = `[DB-STEP]`. "follow-up #2 (latch `persistAll` with `histPush`)" is in neither OUTSTANDING.md nor the archive; it lives only in `specs/2026-09-17-arch-stack-2-followup1-scheduler-routing-plan.md` §7/§8 and `src/state/sched-commit.ts:23-29`. `undo-contract.md:160` suggests the command layer now latches these — confirm before filing. |
| 258–320 | the storage-seam story | **R** with durable facts to move | archive | Carried: `?fresh=1` + what persists → CLAUDE.md §WHAT ACTUALLY PERSISTS + `data-schema.md`; IndexedDB `raptor-docs` → CLAUDE.md §Where things live (Storage row) + `data-schema.md` §Loose spots 6; `doc-`+UUID → `data-schema.md:584`; "Database-stage requirements" → storage-seam spec §315 (pointed to from `data-schema.md:587`); file-is-a-format → CLAUDE.md §Tracker; toolbar → `ui-contracts.md` §The Tracker tab. **NOT carried in any tier-2 doc in its two-tabs form: "two tabs of one browser overwrite each other's whole-record writes"** — move whole into `data-schema.md` §Loose spots or `[DB-STEP]`. "Stages 2–4 still pending" stale. Pre-drawer demo docs → D56, not a finding. |
| 320–328 | merged as PR #377; leftover PRs closed; HOLD BEFORE LIVE | **R** | archive | Hold rule = CLAUDE.md §How to work (2 Sep) + D60 |
| 328–352 | Tracker: Find predictions, ↶↷ on bar, crew-picker redraw, centred landing, ring as second picker | **R** | archive | `ui-contracts.md` §The Tracker tab; `tracker/known-gaps.md:191`. Check: "Find box lists its PREDICTIONS as you type" — if absent from ui-contracts, move that sentence there. |
| 354–372 | PRs #371/#373/#375; device pass + "Saturday OIL credit from an AVALON/BB weekend shift unit-pinned only" | **R**; AVALON/BB claim moot | archive | Since D15/D20/D24 AVALON/BB earn nothing by default; the switched-on case walked 22 Sep (`parts/2026-09-22-oil-seats-rules-sweep.md:49-50`, `parts/2026-09-22-oil-seats-leavewar.md` §1–2). |
| 374–379 | perf residuals recorded, not built | **D** — carried | archive (pointer only) | `performance.md` 104, 201, 230, 303, 332, 291 Dead ends. "two are the owner's call" qualifier not found verbatim — verify. |
| 381–384 | iOS untestable in "this container"; device pass is his | **D**, framing **S** | `performance.md` §The device gate (262) or `ui-contracts.md` "owner's iPhone is the gate" lines (4103, 6299, 6568) | "This container" is legacy (CLAUDE.md ENVIRONMENT note, 17 Sep). |
| 386–389 | observer log; D71: 178 archived, "4 still open" | **S** count | one current line or drop | `log.md` now has 38 OPEN notes |

## 2. §Open / deferred / queued (lines 392–601)

| lines | gist | verdict | destination | evidence |
|---|---|---|---|---|
| 394–395 | "Not a backlog" note | goes with the section | — | [DOCS-GUARD] F7 |
| 397–457 | Stage-2 stable ids; rid foundation/rewrite; course/syllabus ids; Attempt history; rename control; known edges | mostly **R**; (2) **S**; (3) **F** `[TRK-ATTEMPTS]` | archive | (1) CLAUDE.md §slot-key grammar. (2) DONE — `[TRK-CSID]` archived. Edges: course-rename ones **S**; held-course card carried `tracker/known-gaps.md:113-119`; re-mint rids → D56. 444–445 "browser gates cannot launch on win32" **S** (fixed 17 Sep). **Side:** `data-schema.md` §Loose spots items 3 (564–574) and 9 (596–597) stale, contradicting `data-schema.md:420`. |
| 458–466 | amendment-model review: AL numbering week-wide; two bugs | numbering **S** (ruled AND built); bugs **F** | archive | Per-day numbering built + merged PR #405 (15 Sep); `src/engine/publish.ts:27-35`, 925–926. BUG 2 = `[BUG2]`. BUG 1 dissolved by supersede-never-retract (`unpublishAL` gone) — one scenario for the `[HUMAN-RETEST]` amendment walk. **Side:** `[AMEND]`'s own status line ("CORE BUILDING") is stale. |
| 467–475 | area/area-time strip vs restore keys — "FOUND, NOT FIXED" | **S — FIXED** | archive | `src/engine/restore.ts:78-85`; commit 989c3739, 11 Sep 26 |
| 476–483 | Tracker goes back out standalone; degrade without the bridge | **D** — carried | archive | CLAUDE.md §Architecture → Tracker paragraph |
| 484–489 | OWNER'S DEVICE PASS (7 Sep LW + Tracker); BUG-TESTING rows; dark-palette question | **S** pointer; leftovers **NF** | archive text; two leftovers | BUG-TESTING.md retired (D72). Tracker half superseded by its `[HUMAN-RETEST]` + his look + `[TRK-PINCH-ASK]`. Leave War half (figures drawer, bulk balance, 6 Sep phone fixes on his iPhone): fold into `[HUMAN-RETEST]` scope. **Dark palette** (Tracker's own or Raptor's) recorded nowhere else → an ask item. |
| 490–493 | no "Reset order" control since Auto-sort went; offered, build only if he asks | **NF** (his call) | `[LW-RESET-ORDER]` | `store.ts:1885 autoSortRoster` |
| 494–496 | desktop LW grid opens at zoom 1; one line if he wants it out | **NF** (his call) | `[LW-DESKTOP-ZOOM]` | `Matrix.tsx:1576-1577` |
| 497–517 | PARKED DIRECTION: Power Apps code app, M365 sign-in, access table, GUEST, Teams nudge, licensing, tenant questions; Manfred designs tables; ONE adapter | **D** — partly carried | `[DB-STEP]` or `architecture-direction.md` | Carried: `handover-dataverse.md`, `data-model.md` §6. **NOT carried:** hosting shape (play URL / go.gov.sg), the admin access table (email → puck + role), GUEST view, Teams upchit nudge, "licensing confirmed", the two tenant-admin questions — move whole. |
| 518–525 | QUEUED: multiple documents per medical input | **S — BUILT 1 Sep 26** | archive | commit 9835a889; `src/state/docs.ts:116-132`; `ui-contracts.md:4752-4770`; `data-schema.md:138` |
| 526–531 | QUEUED: Admin "Display" area (per-section fold defaults) — do NOT build without his confirmation | **NF** | `[ADMIN-DISPLAY]` | 0 hits elsewhere; the wave half already left Admin (30 Aug) |
| 532–536 | notional TODAY pinned in `weeknav.ts`; point at the device date when real data arrives | **D** — half carried | `[DB-STEP]` | `weeknav.ts:56-62` carries "one literal"; the instruction is not in `[DB-STEP]` |
| 537–543 | PDF plain on purpose; search boxes keep stale text; Admin page is the seam | PDF **F** `[FLAG-EXPORT]`; others **D** carried | archive | `ui-contracts.md:2642`, `:4514` |
| 544–548 | USER GUIDE wanted; remarks-vocabulary is the seed | **NF** | `[USER-GUIDE]` | 0 hits elsewhere |
| 549–591 | Unverified on a real iPhone — seven caveats | **D** — five carried at the named `ui-contracts.md` sections; several "next theory" sentences are not | move the paragraph whole to `ui-contracts.md` (a device-caveats section) | (a) focus-zoom fix + its unbuilt fallback: not in ui-contracts; (b) board page lock's iOS sentence sits in the drawer section; (c) drawer "next theory: position:fixed body lock" missing; (d) eye "next theory: `tr[data-mrow] td.bal`" missing; (e) manning grip WebKit sentence missing; (f) `--who-w` WebKit sentence missing; (g) figures drawer carried. |
| 592–599 | open questions: ATT B beyond SC MAIN; member Quals-editing scope | ATT B **D** carried (`engine-rules.md:399-400`); Quals **NF** | `[QUALS-MEMBER-SCOPE]` | recorded nowhere else; D121 may show his direction — ask once |

## 3. §Standing constraints (602–628)

| lines | gist | verdict | note |
|---|---|---|---|
| 604–605 | all one missing piece: the backend | keep | true |
| 607–609 | no shared data; "touches `engine/hooks.ts:storeBackend`" | keep, pointer **S** | the seam is `src/storage/` now |
| 610–614 | prototype auth; "the deployed site is public" | keep, clause **S** | false since D59; same stale sentence in `engine-rules.md:2698` and CLAUDE.md §Security (`[DEPLOY-DOCS]` scope) |
| 615–617 | one dataset; "every week shows the same data" | keep, slightly **S** | an edited week persists now |
| 618–627 | SUPERSEDED 19 Aug persistence rule + the 17 Sep truth | **R** + **D** carried | truth is CLAUDE.md §WHAT ACTUALLY PERSISTS + `data-schema.md` persistence table |

## 4. Lines 1–183 — stale

| lines | what | made stale by |
|---|---|---|
| 6–7, 18–19 | "kept SHORT"; archive "frozen as of 4 Sep 26" | 984 lines; the plan moves stories to the archive — amend the "never append" lines |
| 39–43 | reference rows: DESKTOP-HANDOFF ("task #1 next"), OVERNIGHT report, rid RED-TEAM "must-fix before tasks 2–7", amendment decisions "open owner calls" | all overtaken (merged #389, #405; decisions resolved 12 Sep) |
| 53–81 | baselines (#420; 22 Sep branch; "#373 above") | main has since taken #422–#432; latest watched counts: unit 5819/5819 (358 files), tfin 728/0, e2e 469 passed / 48 skipped, smoke 442/0, rulecheck OK (`handpass/2026-09-24-oil-credit-tags.md:128-130`); the default CI is ONE `pc` job (D89) |
| 83–92 | per-gate counts; job names | counts stale; **line 92 ("a docs-only push on a PR cancels its running job and starts no new one") is CONTRADICTED by D151** |
| 94–103 | two e2e specs fail deterministically on Windows | fixed test-side 17 Sep (c44bc7b0) |
| 105–181 | durable gate traps | stale inside: 131 "~30% slower than this container"; **142 a broken sentence fragment**; 144–146 "fourth CI gate, 86 checks" |

## 5. Side findings
- Spent branches still present: `claude/oil-auto-remove-design`, `claude/cmdl-finish-p4`, `claude/amendment-engine-core`, `claude/storage-seam` (remote).
- `raptor-port/docs/session-state.md` exists though CLAUDE.md says "absent = nothing pending".
- HANDOFF.md line 831 (file map) also carries the two-tabs text.
- Suggested new backlog items: `[ADMIN-DISPLAY]`, `[USER-GUIDE]`, `[LW-RESET-ORDER]`, `[LW-DESKTOP-ZOOM]`, `[QUALS-MEMBER-SCOPE]`, `[TRK-PALETTE-ASK]`, possibly `[CMDL-LATCH-PERSIST]`.
