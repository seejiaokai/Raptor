# [DB-READINESS] group A phase 7 — the small OIL follow-ups: the FULL bug check (1 Oct 26)

Branch `claude/db-readiness-p7-oil-followups`. Plan `docs/superpowers/plans/2026-10-01-db-readiness-phase7-plan.md`.
Method `docs/bug-check-order.md`. OIL is earned leave — time off banked, never pay (D25).

## 1. The eight questions — tier FULL
| # | Question | Answer |
|---|---|---|
| 1 | earned leave | YES — the OIL evidence block is edited (who stands behind a placeholder); the credit must not move |
| 2 | the published record | YES — the crowd frozen at publication gains an entry; the issued face reads the record's own sim windows |
| 3 | saved data | YES — a sim row's saved seat list; four readers of stored records |
| 4 | a shared drawer | YES — the count chip (board, edit week, View-only Sched); the ALL AVAIL window's flags |
| 5 | a new gesture | no |
| 6 | a new surface | no (one new line in the counter form; one new reason on an inert puck) |
| 7 | roles | no |
| 8 | the warning list | YES — two of its sentences moved into one shared body; the window reads its rule |

## 2. The rulings walked (the rules sweep)
*(filled from the walk — §6)*

## 3. What was built, each red first
| Item | What changed | The test that was red before it |
|---|---|---|
| `[OIL-PERSONAL-PLACEHOLDER]` | ALL / ALL AVAIL on a Personal request's row is written down as a crowd (the count, the window, frozen at publication); nobody earns from it; the men behind it and the requester read "a personal request earns no OIL" in OIL Earn | `engine/oilpersonalcrowd.test.ts` (8 of 17 red), `ui/oilpersonalcrowd.test.tsx` |
| `[CROWD-SIM-BRIEF]` | the ALL AVAIL window flags an event inside a crowd man's own sim brief or debrief, in the warning list's own two sentences; the issued face reads the record's own sim windows | `engine/crowdsim.test.ts` (6 of 10 red), `ui/availwin.test.tsx` |
| `[OIL-READ-LEFTOVERS]` 2 | a drop on the second spare sim seat pads the saved list — no hole, no `null` | `ui/simspare.test.tsx` (2 red) |
| `[STORE-READER-SWEEP]` F2 | the Leave War's counters: one limit (60) for the reader and the writer; the form says the list is full | `leavewar/state/store.test.ts`, `leavewar/ui/counterform.test.tsx` |
| `[STORE-READER-SWEEP]` F3 | a list emptied on purpose — stores, cancel reasons, LoX columns — stays empty after a reload | `engine/stores.test.ts`, `cxreasons.test.ts`, `qualcols.test.ts` (1 red each) |
| `[STORE-READER-SWEEP]` F4 | a remark carried back onto a request is stored at the length the reader keeps (200) | `leavewar/inputgate.test.ts` |

## 4. `[STORE-READER-SWEEP]` — every stored record's reader against its writers
A read-only sweep (an Opus helper), every finding then verified by the host in the code and reproduced by a test.
**Headline: no reader is narrower than its writer on official dates, OIL / earned leave, or publish state.**

| Finding | What the app could lose | Disposition |
|---|---|---|
| F1 hidden warnings | a hide is saved with its day, but a sign-in clears the hidden list and the boot does not read the saved ones back for the week on screen — while a week opened later does | **a question for him** — `OUTSTANDING.md` `[WARN-HIDE-KEPT]` (how long a hide lasts, and for whom, is his; it decides whether the day's table keeps it) |
| F2 counters | the 61st counter saved; the reload then replaced every counter with the built-in set | **fixed, red first** |
| F3 emptied lists | every store / cancel reason / LoX column removed → the standard set back after a reload | **fixed, red first** (a qualcols test had pinned `[]` as "unusable" — it pinned the defect; changed with its reason) |
| F4 carried remark | approve → take back → approve → take back grew a 200-letter remark past the reader's cut | **fixed, red first** |

**Pairs checked and found matching** (the sweep's table, verified by sampling): the war row, each record, the ledger, the
openings, the posting profile and every stint shape, the keep rule, the OIL policy, the event definitions, groups, colours
and orders; the request, person and planning rows; the week / day / issued-version / withdrawal rows (every field but
F1's); the store stamp; the rules; lookahead; the duty, wave and day templates; the section and wave defaults; accounts,
access requests, seen marks; the change history (all 20 fields); documents; the Tracker's student, course, chart and
ball-detail rows, its marks and catalogue. **Not walked by the sweep:** the Tracker's file Export → Import pair (a format,
not a store — its checker refuses by name rather than dropping); whether every writer runs inside a command (a different
way to lose data, covered by group A's own walk). **Stale lines it noticed, corrected in this change:** `data-schema.md`
(`mod` no longer writes `'now'`; document ids are random), the project guide's "what persists" line and its full text
(the change history has been kept since D338).

## 5. Closed without code
- `[OIL-READ-LEFTOVERS]` 1 — already fixed by `[ALL-AVAIL-WINDOW]` (one body, `ui/oilmode.ts oilFromWords`; pinned for a
  parked plan by `ui/availwin.test.tsx`). Walked: §6.
- `[OIL-READ-LEFTOVERS]` 4 — D56, once the walk shows every door refuses a placeholder in a cockpit (§6).

## 6. The walk
*(filled from the three walkers' reports and the host's reproductions)*
