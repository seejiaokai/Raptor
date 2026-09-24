# Spring clean — the backlog classified, the old priority block read, the live order (Fable, read-only, 24 Sep 26)

Tier 3: the evidence behind the `OUTSTANDING.md` moves in `2026-09-24-spring-clean-plan.md` §3 (O1, O2) and the
new priority list. Written by Fable 5.1; line numbers are `OUTSTANDING.md` at `daf74ffd` (branch
`claude/spring-clean`). Saved whole so the reasoning survives the chat (D68). Step 1 of the spring clean had
already been done when this was written (the four worktrees removed, the logs deleted — three empty folder
shells remain, held open by old chats).

## Headline findings

1. **Seven items are finished under headings that still say open.** `[LW-UI-WINDOW]` and `[LW-OIL-DETAIL]` were
   built the day they were filed (PR #422, 21 Sep); `[BUG2]`'s reopen control no longer exists; `[XWEEK-UNDO]`
   shipped inside global undo; `[OIL]`'s "lock earned OIL" lean was overturned on 20 Sep and the item now
   contradicts a live ruling; `[OIL-NEXT-TWO]` is an empty wrapper; `[S4-BUGHUNT-MERGED]`'s one caveat was
   closed by PR #428.
2. **`[CRP-FLAG]` is half built and the record of what is left is gone.** PR #406 merged "Item 2 + 3(a)" on
   16 Sep; the handoff line naming the next chunk was later removed and `docs/session-state.md` was deleted
   (`d92303b`). The only surviving list is the plan's §11 (12 cases). Do not rewrite that item until the code
   is checked against §11.
3. (Step 1 — see the note above.)
4. **Lines 41–43 (model guidance, "Opus 4.8, default") contradict D67** and D139. `raptor-port/CLAUDE.md:225`
   already marks the same 7 Sep text superseded; `OUTSTANDING.md` never was.
5. **`[SYNC-INTEG]` P7 is done in effect:** there is no root `CLAUDE.md`; `raptor-port/CLAUDE.md:730–759` states
   the Leave War persists and marks the 17 Aug "session-only" rule superseded; `HANDOFF.md:618` is marked
   superseded too. P6 (a Quals ✕ confirm) is still open — `QualsPage.tsx:470–471` archives with no question.
6. **`[ARCH-STACK]` leaves three orphan facts** that live only in its body: step 6 (remove the quarantine
   machinery) is not done (`src/engine/quarantine.ts`, `state/quarantine-funnel.test.ts` present) and has no
   item; the ISO-dates split-out (lines 338–339, "promote to its own item") has no item; the PID-R03
   preview-cache nit is unfixed. Its 1A follow-up (b) WAS built in step 4 (`srcType` on the ground row —
   `schema.ts:226`, `events.ts:99`, commit `e904d440`).
7. **`HANDOFF.md` §Open / deferred / queued (lines 392–600) is still a second backlog** of ~20 bullets not in
   `OUTSTANDING.md`. `[DOC-TRIM]` lines 573–575 already order it emptied item by item.

## Task A — every `### [ID]` item (51)

Verdicts: **7 FINISHED · 8 PARTLY-FINISHED · 36 LIVE.** "Home" = an existing doc that already carries the
still-useful facts (the `--homes` candidate).

| ID (line) | Verdict | What is still open | Evidence | Home / pointer needed |
|---|---|---|---|---|
| `[AMEND]` (240) | PARTLY-FINISHED | AM-04 (frozen availability in the canonical content — `publish.ts:269` says "NOT AM-04's freezing"), the publish-entry validation matrix, AM-09 durable write/lease (no code reference found), PSF-001 (filing-only change publishes on stale signatures — owner's call, memory `plans-selector-redesign-locked`). AM-02 migration was SKIPPED by owner 14 Sep (reset, don't migrate). | Core merged as PR #396 (`525b82a5`); phases 1a/1c/2 on `main`; AM-01 `engine/verid.ts`; AM-06 `engine/signbind.test.ts`, `publish.ts:811`; build plan status header `specs/2026-09-12-amendment-core-build-plan.md:1–80`. Heading "CORE BUILDING", lines 256–260 stale. | Keep LIVE; prepend a dated status block. |
| `[EOD]` (267) | LIVE | All of it — no `EOD` in `src`. D44/D45 and memory `oil-truth-latest-published-version` make the EOD version part of the squadron's process; its order is not ruled. | `grep -rln EOD src` empty | — |
| `[OIL]` (288) | FINISHED (superseded) | Nothing — the 11 Sep "lock" lean was overturned 20 Sep (memory `oil-truth-latest-published-version`) and D2 (21 Sep, "only the issued schedule pays, both directions") is built. **The item text still says "locked" — it contradicts a live ruling.** | `engine-rules.md:1867`; `oil.md` D2; `leavewar/oilsync.test.ts` | `raptor-port/docs/engine-rules.md` + `oil.md` D2. **Pointer first:** the 20 Sep ruling exists only in memory — add it to `oil.md` (DECISIONS.md §Before this file existed allows exactly this: an old ruling found stale/superseded). |
| `[BUG2]` (300) | FINISHED (moot) | Nothing — the reopen control was removed in amendment-core Phase 2. | `board.ts:1488` "PUBLISHED DAY … no 'reopen' any more"; build plan Phase 2 | `specs/2026-09-12-amendment-core-build-plan.md` |
| `[ARCH-STACK]` (305) | PARTLY-FINISHED | Step 6 (remove quarantine/legacy) — no item; ISO dates — no item; PID-R03 preview cache; the invariant/property-test layer (status unrecorded). Step 5 = `[DB-STEP]`. | 1A #396, 1B #398–#402, 1C #403, 1b #404 (`42417ce3`), 2 + CMDL-FINISH #412/#415, 3 (18 Sep), 4 #421 (`e904d440`). "STEP 1b — PARTIAL, in review" stale. | `specs/2026-09-13-architecture-rootcause-plan.md`. **Pointer first:** file step 6, ISO dates, PID-R03, then archive. |
| `[SYNC-INTEG]` (387) | PARTLY-FINISHED | P6 only (Quals ✕ confirm; superseded by `[RECALL]`). P7 done in effect. | PR #420 (`9c120eca`); `QualsPage.tsx:470–471` no confirm | `specs/2026-09-19-sync-integ-guardrails-build-plan.md`. **Pointer first:** P6 into `[RECALL]`, close P7, then archive. |
| `[GLOBAL-UNDO]` (424) | LIVE | Seven deferrals: GU-E2E (`e2e/leavewar.spec.ts:4253, 4289` still `test.fixme`), CMDLF-002 (`undo/timeline.ts:285`), GU-C3, GU-MAYREV (owner product question), GU-E5, GU-LWLOCK, GU-COSMETIC. | as cited | — (`[LW-LOCKMARK]`'s publish→undo→publish→undo→redo refusal says it is "the global undo timeline's own item" but is not among the seven — orphan) |
| `[RECALL]` (451) | LIVE | All (future). Should absorb SYNC-INTEG P6. | `leavewar/sync.ts:1384–1386` | — |
| `[XWEEK-UNDO]` (459) | FINISHED | Nothing — built in global undo phase 2; the one gap is GU-E5. | `docs/undo-contract.md:320`, 155 | `raptor-port/docs/undo-contract.md` |
| `[XFER]` (466) | LIVE | All (future, with DB-STEP) | — | — |
| `[TRK-ATTEMPTS]` (474) | LIVE | All | — | — |
| `[TRK-DISK]` (479) | LIVE | All (owned by DB-STEP) | — | — |
| `[S4-BUGHUNT-MERGED]` (488) | FINISHED | Nothing — rules set aside → CURRENT-STATE §5; owner questions → §6; D79/D80/D81 → `oil.md`; "one test pair not certified" → fixed in PR #428. | PR #422 `9abfe8e4` | `raptor-port/docs/superpowers/specs/2026-09-20-CURRENT-STATE.md`. **Pointer first:** one line in CURRENT-STATE §8 that the uncertified pair closed with PR #428. |
| `[DOC-TRIM]` (523) | LIVE | Steps 2–7 of the spring clean. Lines 558–584 are the 21 Sep original block (history). | — | — |
| `[HUMAN-RETEST]` (586) | LIVE | The amendment system (D85/D86), then the other three (order not ruled). Stale inside: "DO THIS AFTER [OIL-AUTO-REMOVE]" (628); the D153/D154/D155/D125 narrative (all now in `DECISIONS-ARCHIVE.md`). | Tracker part PR #429 | — |
| `[OIL-AUTO-REMOVE]` (634) | LIVE (by its own words, 639) | Nothing to build; "stays live" to warn off re-doing the four walk defects and assuming the owner looked. Both warnings now have other homes. Lines 642–669 history. | merged 22 Sep (D34) | His/next session's call whether its own "stays live" still holds. |
| `[LW-COMMIT-MANNING]` (690) | LIVE | All; priority his call | `absences.ts:106–110` | — |
| `[LW-FIGSEL-SLOW]` (721) | LIVE | All | — | — |
| `[LW-FROZEN-BAR-GAP]` (729) | LIVE | All; "after [HUMAN-RETEST]; show him first" | — | — |
| `[OIL-PERSONAL-PLACEHOLDER]` (742) | LIVE | All (FULL tier) | `oilev.ts:406` | — |
| `[CROWD-SIM-BRIEF]` (753) | LIVE | All (WALK tier) | `validate.ts:158` | — |
| `[DEPLOY-DOCS]` (760) | LIVE | All — Pages text at `raptor-port/CLAUDE.md` 186, 204, 220, 255, 436, 482, 532–553, 580, 597, 614–622 and `HANDOFF.md` 629–760. | as cited | Do with DOC-TRIM steps 2–3 |
| `[OIL-WORDS]` (764) | LIVE | All | `oilmode.ts` 17 hits, `oil.ts` 16, `oilev.ts` 47 | — |
| `[OIL-NEXT-TWO]` (771) | FINISHED (wrapper) | Item 1 is `[OIL-EARNED-VS-GRANTED]` (live); item 2 moot — PR #423 merged 21 Sep. | `ed4c791d` | **Pointer first:** copy "do it as its own small change, in a fresh chat" (776–783) into `[OIL-EARNED-VS-GRANTED]`. |
| `[OIL-AWARD-IS-A-GRANT]` (785) | LIVE | All; needs his go | — | — |
| `[OIL-EARNED-VS-GRANTED]` (804) | LIVE | All; his figure — ask first | `oiltracker.ts:256`, `:306`; `counters.ts:330` | — |
| `[POSTOUT-LOST]` (818) | PARTLY-FINISHED | The demo-seed contradiction (`demoworld.ts:45` vs `engine/data.ts:24, 65, 94`); under D54/D56 arguably not a finding. | PR #425 (`bd16c9e5`) | `handpass/2026-09-22-oil-seats.md` §6a |
| `[OIL-READ-LEFTOVERS]` (842) | PARTLY-FINISHED | Items 1, 2, 4. Item 3 CLOSED (D54). | `handpass/2026-09-23-allavail-window.md:105` | Keep LIVE |
| `[REPO-PRIVATE]` (866) | LIVE | The sharing half; SEC-101; the fresh single-commit repo question. Lines 885–901 are a labelled history block. | — | — |
| `[STORE-READER-SWEEP]` (922) | LIVE | All | — | — |
| `[OIL-RELINK-XWEEK]` (940) | LIVE | All | — | — |
| `[LW-SCRUBBER-FLAKY]` (956) | PARTLY-FINISHED | Not certified closed; poll raised in PR #428, D87 applied to two step4 scenarios; D84 stands. | `454c47a3`, `dd2ae9c4`, `5b38ecef` | Keep LIVE |
| `[S4-HUNT-REST]` (974) | LIVE | All seven (owner's order) | — | — |
| `[BACKLOG-ORDER]` (994) | LIVE | All four still open | — | — |
| `[LW-WEEKDAY-WORK]` (1007) | LIVE | All; talk to him first | — | — |
| `[LW-UI-WINDOW]` (1012) | FINISHED | Nothing — all four asks built PR #422 (21 Sep): "Ack" everywhere; four decisions incl. Move in every stage; published = remarks only. | `9abfe8e4`; `BidPicker.tsx:112–120, 293, 304–317`; `DayList.tsx:117–126, 146` | `specs/2026-09-20-one-absence-behaviour-register.md` N15 |
| `[LW-OIL-DETAIL]` (1031) | FINISHED | Nothing — `BidPicker.tsx:105–111` `creditShown`; giver "Weekend/PH"/"Duty input" (`warrecs.ts:53`); auto credits in the OIL tracker (`oiltracker.ts:252–256`); labels fixed PR #432. | PR #422 + #423 | register N11 + `ui-contracts.md:6781` |
| `[LW-LOCKMARK]` (1040) | LIVE | All. Its second paragraph is an orphan (see GLOBAL-UNDO). | — | — |
| `[PUB-UNAVAIL]` (1050) | LIVE | All — `html.ts:1753` still a live read | — | — |
| `[LEAVE-YEAR]` (1055) | LIVE | All | — | — |
| `[DB-STEP]` (1060) | LIVE | All (future) | — | — |
| `[CRP-FLAG]` (1087) | PARTLY-FINISHED | Unknown remainder (finding 2). Built: the two-documents model (`validate.ts:1331`), the official-flags overlay (`html.ts:46, 933`), Item 3(a). | PR #406 `a02f83e0` (16 Sep) | Check plan-v2 §11 against the code before touching; heading "ready to build (15 Sep)" stale |
| `[FLAG-EXPORT]` (1101) | PARTLY-FINISHED | Current-day-only (still the whole loaded week — `printpdf.ts:109–119`), the 1–2 sample PDFs, the next-week peek label. Done: prints the PUBLISHED version with a per-day stamp, white one-layout report. | `printpdf.ts:8–14, 119` | Keep LIVE; add a status line |
| `[OIL-REQ-NAMEBOX]` (1131) | LIVE | All (walk question for him) | `oilev.ts:908–913` | — |
| `[TRK-RETEST-NOTES]` (1154) | LIVE | All | — | — |
| `[TRK-EDIT-SIDEWAYS]` (1183) | LIVE | All; its "after [TRK-PINCH-DRAGS-BALL]" gate has passed | — | — |
| `[TRK-PINCH-ASK]` (1188) | LIVE | His iPhone look | — | — |
| `[TRK-SMOKE-ADD-RACE]` (1195) | LIVE | All | — | — |
| `[TRK-TAP-AFTER-DRAG]` (1207) | LIVE | Ask him | — | — |
| `[TRK-BAKE-STALE]` (1214) | LIVE | All | — | — |
| `[DOCSGUARD-MERGE]` (1220) | LIVE | All — no skip for an item archived at the base. **Relevant to this branch if it merges `main` in.** | `docsize.mjs:224–250` | — |

## Task B — what lines 41–236 carry that the new list must not lose

| Lines | Statement | Still true? | Carried elsewhere? | Verdict |
|---|---|---|---|---|
| 41–43 | Model guidance: Opus 4.8 default… | No — D67, D139 | `how-we-work.md` | drop; pointer "models: D67" |
| 49–54 | owner's rule "fix the architecture first, then individual bugs"; stop interim undo patches + quarantine rounds | rule yes; "no more quarantine rounds" yes until step 6 | memory; item 357–367 | carry: "the stack resumes at `[DB-STEP]`; step 6 has no item yet" |
| 56–67 | stack progress; "NEXT = step 4" | "next = step 4" no | archive; `[GLOBAL-UNDO]` | drop |
| 69–73 | OIL-SEATS-CAN-EARN next | done | archive | drop |
| 75–80 | heuristic; [AMEND] core round-3 on branch | no | — | drop |
| 81–106 | done items; DOC-TRIM after OIL | done | archive | drop |
| 107–113 | top of queue; **"the stack resumes at [DB-STEP]"** | yes | `[BACKLOG-ORDER]` #4 | carry |
| 114–117 | **"Small OIL follow-ups, any time, none blocking"** — the seven named | yes | only here + archive | **carry the group** |
| 118–128 | LW fixes merged; Tracker items filed; step 4 shipped | yes | items; HANDOFF-NEXT | drop |
| 129–131 | open for owner: cheap CLAUDE.md trim first? | answered (the spring clean) | — | drop |
| 133–141 | HUMAN-RETEST; SYNC-INTEG undo half into GLOBAL-UNDO | yes | items | drop |
| 142–143 | EOD after the core lands | **EOD's place is not ruled** | — | carry "EOD — no slot ruled" |
| 144 | [OIL] after AMEND | no (20 Sep) | memory only | drop; record the ruling in `oil.md` |
| 147 | TRK-ATTEMPTS "low urgency" | yes | — | carry "low" |
| 145–179 | the rest | done / carried | — | drop |
| 183–185 | plain-terms format "one line each, no jargon" | format | plain-language rule | **carry the format** |
| 187–190 | [AMEND] "no take-backs" | qualified since 18 Sep (unpublish and correct quietly — memory `undo-of-publish-semantics`) | memory | do not carry as written |
| 194–196 | [OIL] "Lock it once worked" | no | — | do not carry |
| 200–234 | the rest of the plain terms | per Task A | items | drop |

No owner ruling in 41–236 lacks a home; the only ruling-shaped text there without a D-number is the 13 Sep
"architecture first" rule, which is in memory and in the item.

## Task C — the live order, as the owner has set it

**Set by him:** 0. `[DOC-TRIM]` the spring clean (HANDOFF-NEXT 50–52; D138, D139). 1. `[HUMAN-RETEST]` — the
amendment system (D85/D86), then the other three (change-recording, the absence record, the Leave War links) —
**order NOT ruled; propose and ask**. 2. `[S4-HUNT-REST]` — his order 1–7 within it; **its place relative to the
three above is not ruled**. 3. `[BACKLOG-ORDER]` "after the hunt" (21 Sep): `[PUB-UNAVAIL]` → `[LW-LOCKMARK]` →
`[LW-WEEKDAY-WORK]` (talk to him first) → `[DB-STEP]`, then the `[AMEND]` work behind it (`[PUB-UNAVAIL]`'s own
"straight after step 4", 19 Sep, is older — the 21 Sep order wins). 4. Event-gated: before ANY collaborator, take
the runner off the repo — SEC-101.

**Placed by their own lines (agent placements, not rulings):** "any time, none blocking": `[OIL-READ-LEFTOVERS]`
1/2/4, `[STORE-READER-SWEEP]`, `[OIL-REQ-NAMEBOX]`, `[POSTOUT-LOST]`'s seed half, `[OIL-WORDS]`,
`[OIL-PERSONAL-PLACEHOLDER]` (FULL), `[CROWD-SIM-BRIEF]` (WALK), `[OIL-RELINK-XWEEK]`. Leave War polish:
`[LW-FROZEN-BAR-GAP]` (after `[HUMAN-RETEST]`; show him first); `[LW-FIGSEL-SLOW]`, `[LW-SCRUBBER-FLAKY]`
(test-only). Tracker by their Place lines: `[TRK-RETEST-NOTES]`, `[TRK-EDIT-SIDEWAYS]` (now), `[TRK-PINCH-ASK]`
(his next Tracker session), `[TRK-SMOKE-ADD-RACE]`, `[TRK-TAP-AFTER-DRAG]` (ask first), `[TRK-BAKE-STALE]` (low).
Docs: `[DEPLOY-DOCS]` with DOC-TRIM; `[DOCSGUARD-MERGE]` before the next branch that merges `main` in.

**Owner-gated or unplaced — no order exists:** `[OIL-AWARD-IS-A-GRANT]`, `[OIL-EARNED-VS-GRANTED]`,
`[LW-COMMIT-MANNING]`, `[LEAVE-YEAR]`, `[REPO-PRIVATE]` sharing half, GU-MAYREV, `[EOD]`, `[CRP-FLAG]` remainder
then `[FLAG-EXPORT]`, the `[ARCH-STACK]` leftovers, the `[AMEND]` leftovers; DECISIONS.md's carried Q1.

**Future milestones:** `[RECALL]`, `[XFER]`, `[TRK-ATTEMPTS]`, `[TRK-DISK]` (inside `[DB-STEP]`), `[DB-STEP]`.
