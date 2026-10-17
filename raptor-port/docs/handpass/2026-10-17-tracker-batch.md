# The Tracker batch (D495) — D980, D981, D982 and the faults riding with them — the bug check (FULL)

**Where it stands:** _(written at the close)_

`Walk:` _(written at the close)_

Branch `claude/tracker-batch-d495-affb5f`, cut from `main` at pull request 529. His word (17 Oct 26): build the Tracker
batch — D980, D981, D982 and the faults that ride with it (the triage, `docs/superpowers/plans/2026-10-17-tracker-batch-triage.md`),
one FULL check for the batch, each visible change shown before and after; not the progress graph (D774).

## 1. The eight questions — tier FULL

1 money / OIL — NO: the Tracker touches no OIL and no pay. 2 the published record — NO: no schedule, publish or
amendment is touched. **3 saved data — YES:** D981 rewrites a deleted man's place on stored student lists, on every
course; the undo fix changes which records an undo stores or removes; the save-failure fix reads Raptor's saver.
4 a shared drawer — YES, small: the chart's one drawing routine (`renderBoard`) now also paints the keyboard's ring, and
every landing of the chart goes through one body (`landChart`, `scrollToEvent`). 5 a new gesture or mode — YES: the
chart by keyboard (D980). 6 a new surface — NO (the ring is a mark, the pop-up exists). 7 roles — NO: the Tracker reads
no role (D121); a delete is the admin's, unchanged. 8 the warning list — NO.
**3 → FULL.** One check for the batch (D485), sized by its riskiest change.

## 2. The rules sweep — every ruling this batch must keep

| Ruling | What it asks here | Checked by |
|---|---|---|
| D980 | one Tab in; → ← ↑ ↓ along the lines; Enter opens marking with the keyboard inside; Escape back to the same event; the plain blue ring (D876), no glow (D887); not a Tab stop per event | walk K; `trk-batch-ui.test.tsx` |
| D981, D299, D290 | a deleted man leaves every course still running for him (an event neither done nor N.A.); stays, his record kept, where all are; never erased | walk P; `trk-batch-store.test.ts` |
| D982 | dark words on green, amber, red bars; white on grey; colours and words unchanged | walk B; `trk-batch-ui.test.tsx` |
| D132 | an import never deletes marks — D981 keeps his marks the same way, out of sight | `trk-batch-store.test.ts` (break 10) |
| D350 | a delete is not undone — D981 plans no way back | read |
| D372 | a pace, end date or lull change is an undo step — the undo fix keeps every stored record put back | `trk-batch-store.test.ts`, `leftovers.test.tsx` D372 block |
| D376, D377 | each person reopens on his own course and student; the landing as a pick makes it | walk L |
| D899 | a drag carried to the edge pans; the pan stops at the chart's start — the drop now stops there too | walk E |
| D876, D887 | one look for a mark: the plain blue ring, no glow | walk K pictures |
| D587 | the failed-save warning is Raptor's band; the Tracker's corner no longer contradicts it | walk S |
| D121 | everyone in the Tracker does everything — nothing here is gated | read |
| D129 | logging out with unsaved chart edits asks first — the logout of walk L has none | walk L |
| D56 | stored-only harm is not a finding — in every reader's brief | the briefs |

## 3. What was built

_(filled below the roll-call: files and the one-line why of each)_

## 4. The roll-call — every place each change shows or acts

_(the table)_

## 5. The door check

_(a new gesture — the chart's keys — and where else a key could reach the chart)_

## 6. Sizing the walk (D607)

_(the five lines)_

## 7. The walk — scenarios, orders, results

## 8. Carried by a test, not walked

## 9. The break tests

## 10. Errors seen

## 11. Not walked, and why

## 12. The reads

## 13. The gates

## 14. Before and after — for him
