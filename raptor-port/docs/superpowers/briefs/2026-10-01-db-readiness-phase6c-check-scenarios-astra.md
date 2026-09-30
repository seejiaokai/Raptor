# Astra — scenario design for the FULL check of phase 6 (c) v3 (1 Oct 26)

*(Saved verbatim from Astra's final message — `codex exec -m gpt-5.6-sol -c model_reasoning_effort=high -s read-only`, the code at commit bb74d60a; brief `2026-10-01-db-readiness-phase6c-check-scenarios-brief.md`. One designer only (D353). Its findings A–F are dispositioned in the evidence sheet, `docs/handpass/2026-10-01-dbr-phase6c-check.md`.)*

# Phase 6(c) v3 FULL-walk scenario report — Astra

Scope: committed step-(c) code at `bb74d60a`, compared with `9191910b`, as the brief specifies. This report does not assess uncommitted working-tree changes. No tests, build, or application were run.

Storage notation below uses logical records: `inputs/<iid>`, `days/<week>#<di>`, `sched.book/<week>#<di>`, `sched.issuance/<week>:<version>`, and `weekstash/<week>`. The Browser backend may group these beneath `raptor:inputs/...` and `raptor:weeks/...`.

For every walk:

- Capture DOM/screenshots and decoded storage before and after every gesture.
- Repeat on desktop 1440×900 and phone 390×844 unless a surface is explicitly desktop-only.
- Run the current build and `9191910b` side by side. Differences are defects unless they are plan §8 items 5–13.
- In two-tab scenarios, an already-open second tab is expected to remain stale; its reload is the second-client proof.

## 1. Roll-call of “the request’s row”

### Drawn

| Surface and visible sign | File and function | Classification | Reason |
|---|---|---|---|
| View-only Sched, working day: Ground Programme row and request card | `ui/html.ts`: `dayHTML`, `viewDayHTML`, `accCtl` | *goes through the view or standsOn* | It renders installed `DAYS`, worked out by `viewOfWeek`; card filing location uses `acceptedDay`/standing lookup. |
| View-only Sched, issued face/version preview | `ui/html.ts`: `dayIssuedHTML`, `dayPreviewHTML` | *must not, because…* | D177–D179 require the issued face to remain the frozen document; applying today’s request would rewrite history. |
| Scheduler board, desktop | `ui/board.ts`: `boardHTML`; `ui/board-html.ts`: `sbGroundPanel`, `sbInputsGroupPanel`, `sbUnavailPanel` | *goes through the view or standsOn* | The working board renders installed `DAYS`; request cards use the filing controls’ standing lookup. |
| Scheduler board, phone | Same board functions, responsive phone layout | *goes through the view or standsOn* | It is the same model and renderer under phone CSS, not a separate data route. |
| Scheduler board showing a parked plan or historical preview | `ui/board.ts`: `boardHTML`; `ui/board-html.ts`: `sbGroundPanel` | *must not, because…* | The chosen plan/version is a holder-owned document. On switching it into the working copy, `viewOfWeek` then applies. |
| Next-week peek, saved week | `ui/peek.ts`: `peekWeekHTML`, `peekDayHTML`; `engine/weekstash.ts`: `stashDays` | *goes through the view or standsOn* | `stashDays` parses a copy and applies `viewOfWeek`. |
| Next-week peek, never-saved week | `ui/peek.ts`: `peekWeekHTML`; `engine/weekctx.ts`: `bundle` | *goes through the view or standsOn* | The seeded bundle is worked out before rendering. This is desktop-only UI, but the model must match phone after opening that week. |
| Day `~`/pending panel | `ui/pendlist.ts`: `pendListHTML`, request-row branches | *goes through the view or standsOn* | Live additions use the viewed day; moved-to wording uses `standsOn`. Issued removals deliberately name the frozen issued row. |
| Pending-list filing-only line for a deleted request | `ui/pendlist.ts`: `itemWords`, `bySrc` fallback | *must not, because…* | It may need the dead kept or issued row solely to name a request that no longer exists. It does not act on that row. |
| Changes window request-line destination | `ui/ChangesWindow.tsx`: `jumpOf` | **MISSING** | It collects every raw `src`, including a dead `kept` row, as a navigation target. |
| Amendments panel and pending marks | `engine/publish.ts`: `dayPendingItems`, `requestRow`, `requestRowUnit`; renderers in `ui/html.ts` | *goes through the view or standsOn* | Live canonical diff reads the worked-out day. Positional access into the frozen issued and live documents is deliberate diff pairing, not a request-row finder. |
| History lines and gold dots | `state/changelines.ts`: `inputLines`, `changeLinesFor`; history rendering in `ui/html.ts` | *must not, because…* | Request history belongs to the input record and its date span, not to a derived day row. A re-make or landing must create no separate row-history line. |
| OIL Earn request-item label/window | `ui/oilmode.ts`: `oilItemLabel` | **MISSING** | It raw-finds the first same-`src` row on the day and can describe a dead kept row as the live request item. |
| Schedule CSV/PDF | `ui/export.ts`: `publishedDays`, `schedRows`; `ui/printpdf.ts`: `printSchedPDF` | *must not, because…* | The schedule report exports flying lines from the frozen published face; Ground Programme/request rows are not part of this report. |
| Inputs CSV | `ui/export.ts`: `inputRows` | *must not, because…* | This is explicitly one row per stored input, including its whole span, not an export of derived Ground Programme rows. |

### Acted on

| Gesture | File and function | Classification | Reason |
|---|---|---|---|
| Request-card `Accept` | `ui/interactions.ts`; `engine/slots.ts`: `acceptInput` | *goes through the view or standsOn* | It finds an existing standing row with `standsOn`, never a dead kept row; it is an explicit scheduler placement and writes the day. |
| Request-card `✕` | `ui/interactions.ts`; `engine/slots.ts`: `unacceptInput` | *goes through the view or standsOn* | It removes the standing row and changes the filing; it must not remove a dead kept row elsewhere. |
| `✕` on the Ground Programme row | `ui/board.ts`: board click handler | *goes through the view or standsOn* | A row that is the current standing request row invokes request unaccept; a dead kept row is treated as a physical holder row and deleted normally. |
| `→ Unavail` | `ui/interactions.ts`; `engine/slots.ts`: `acceptInput` with unavailable destination | *goes through the view or standsOn* | Filing becomes unavailable and the standing row disappears through the view. |
| Ground `+ Inputs` | `ui/inputedit.tsx`: `commitNewInput`; `engine/slots.ts`: `acceptInput` | *goes through the view or standsOn* | This is the scheduler’s explicit create-and-place door, so the request and day are both written. |
| Inputs-page/Add-dialog filing | `ui/inputedit.tsx`: `commitNewInput`; `ui/InputsPage.tsx` | *goes through the view or standsOn* | It writes the request only; the row is landed by the after-command view. |
| Request-card or Inputs-page edit | `ui/inputedit.tsx`: `commitInputEdit` | *goes through the view or standsOn* | It writes the request only; the six request-owned row fields are re-made by the view. |
| In-place row time/remarks edit | `ui/board.ts`: `boardChange`; `state/store.ts`: `writeText` | *must not, because…* | This acts on the exact physical row selected by the holder, including a visible dead kept row, and writes that day. |
| Drag a person onto the row as an extra | `ui/board.ts`: fill/drop handlers; `state/store.ts`: `writeFill` | *must not, because…* | It edits the selected holder row and must not redirect to another row sharing `src`. |
| Cancel, information-only, or red flag on the row | `ui/board.ts`: `askCx`, `cxCommit`, board click handlers | *must not, because…* | These are holder decisions on the exact visible row. The request-row readers must later ignore them if that row becomes dead kept. |
| OIL Earn item/person switch | `ui/oilmode.ts`: `toggleOilItem`, `toggleOilPerson`; `engine/oilev.ts` | **MISSING** | The primary claim standing uses `standsOn`, but live sentinel/extra and label helpers still raw-find by `src`. Frozen issued evidence must remain raw, so the live and issued paths need separating. |
| Load version onto working copy | `engine/drafts.ts`: `loadVersionToWorkingCopy`; `engine/publish.ts`: `rowsLeftOut`, `filingRestorePlan` | **MISSING** | `rowsLeftOut` uses `standsOn`, but `filingRestorePlan` treats any raw same-`src` row—including dead kept—as a landing. |
| Switch a saved plan into the working copy | `ui/board.ts`: `switchDraft`; `engine/drafts.ts` | *goes through the view or standsOn* | The incoming document is holder-owned, marked `kept` where required, then reconciled through the after-command view. |
| Apply a day template | `ui/board.ts`: `pickDayTpl`; `engine/daytpl.ts` | *must not, because…* | A template is a physical whole-day replacement. It deliberately strips `src`, `srcv`, and `kept` so copied rows cannot masquerade as request rows. |
| Sort all / row drag / phone arrows | `ui/board.ts`: `sortAllCommit`, `boardMbtn`; `engine/reorder.ts` | *must not, because…* | These change the holder’s physical row order and save the day. Dead kept rows remain sortable artifacts. |
| Delete request | `ui/inputedit.tsx`: `removeInput` | *goes through the view or standsOn* | It writes only the request deletion; the standing row is removed on read. |
| Global Undo/Redo of a request act | `undo/timeline.ts`: `globalUndo`, `globalRedo`; `state/sched-commit.ts`: `schedWriteRecords`, `afterCommandPass` | *goes through the view or standsOn* | Restored request records are followed by the shared phase-8 pass; no derived day write belongs in a member’s inverse. |

### Read by downstream consumers

| Reader | File and function | Classification | Reason |
|---|---|---|---|
| Holder-base filing state (`acc`) | `state/holderbase.ts`: `rederive` | *goes through the view or standsOn* | It tests rows with the canonical `standingRow` predicate before deriving `acc`. |
| Holder-base retype-removal message | `state/holderbase.ts`: `rederive` live-message block | **MISSING** | Its raw “any row still on screen” check lets a dead kept row suppress the required message when the real row was removed. |
| Loaded-week validator | `engine/events.ts`: `buildDay`, `collectEvents`; `engine/validate.ts` | *goes through the view or standsOn* | Validation runs after the phase-8 view and reads installed `DAYS`. |
| Cross-week validator | `engine/weekctx.ts`: `bundle`, `workedSet`, window readers | *goes through the view or standsOn* | Saved and never-saved weeks are worked out before event construction. |
| OIL request standing | `engine/oilev.ts`: `landedStanding`, `projectOilInputs`; `engine/weekstash.ts`: `standingRowIn` | *goes through the view or standsOn* | Loaded days use `standsOn`; off-screen saved weeks use the equivalent standing predicate. |
| OIL live sentinel and extra readers | `engine/oilev.ts`: `landedRow`, `landedHasSentinel`, `landedExtras` | **MISSING** | These raw-find same-`src` rows. That is correct for frozen issued evidence but incorrect for live evidence containing a dead kept row. |
| Leave War’s published OIL pass | `leavewar/sync.ts` and `engine/oilev.ts`: issued evidence readers | *must not, because…* | D2/D142 require credit to follow the frozen issued schedule and its frozen OIL evidence, not today’s request. |
| ALL AVAIL crowd for a request row | `engine/oilev.ts`: `oilEvidence`, `landedHasSentinel` | **MISSING** | The day itself is a viewed working day, but the helper can still select a dead kept same-`src` row as the request’s live row. |
| Crew-picker busy check | `engine/events.ts`: `scSeatHit`, `avSeatHit`, `buildDay` | *goes through the view or standsOn* | It consumes events built from viewed loaded/cross-week days. |
| Pending count and sign-off binding | `engine/publish.ts`; `state/holderbase.ts`: mark rebase | *goes through the view or standsOn* | Counts compare the worked-out working day against the frozen issued face. The current build nevertheless has a mark-shape defect described below. |
| Load’s `Discard N edits` | `engine/drafts.ts`: `dayAsLoadLeaves`; `engine/publish.ts`: `dayDiscardCount` | **MISSING** | The candidate day is passed through `viewOfWeek`, but the associated filing restore plan still raw-counts dead kept rows as landings. |
| Card’s “On Sun 19 Jul” wording | `engine/slots.ts`: `acceptedDay`; `engine/weekstash.ts`: `rowElsewhere`; `ui/html.ts`: `accCtl` | *goes through the view or standsOn* | Loaded and saved-week locations use standing-row predicates and ignore dead kept rows. |
| Saved-week reader | `engine/weekstash.ts`: `stashDays` | *goes through the view or standsOn* | It overlays a parsed copy and never mutates storage. |
| Load/boot reader | `state/store.ts`: `applyWeekModel`, `workOutLoadedWeek`, `initStore`, `loadWeek` | *goes through the view or standsOn* | IDs are minted first, holder base reset from stored content, then the shared view is derived. |
| Week-leave stash writer | `state/store.ts`: `weekStashSnap` | *must not, because…* | It must write the holder base, not derived request-only changes that the day holder never committed. |

## 2. Ranked walk scenarios

### 1. Dead-kept weekend row versus OIL, extras, and ALL AVAIL

**Start:** Admin creates a Saturday–Sunday Training request, places it, adds an extra person and an ALL AVAIL placeholder, answers the member OIL question, publishes Saturday, moves the request away, then uses `Load onto working copy` to restore Saturday’s row as dead `kept`. Move the request back as a Saturday–Sunday span but land its real row on Sunday. Cancel only the dead Saturday row.

**Gestures:** Open Saturday and Sunday → `OIL Earn` → open the request item → toggle its item and each person → publish Sunday → open Leave War. `[2T]`

**Expected:** Right after, the cancelled dead Saturday row must not suppress the requester’s live claim, label the item, supply its crowd, preserve an override, or credit its extra. Sunday’s standing row controls the live item; D18 extras earn only from the row/day where they actually stand. After Tab B reload, OIL mode and Leave War must agree with Tab A’s published evidence; the issued Saturday face remains frozen.

**Storage:** Member hand-over/date edits change only `inputs/<iid>`. Adding extras, CX, OIL switches and publication change the named day/book/issuance rows. Reading OIL or Leave War changes nothing. Wrong if any member edit writes a day, the dead row decides the live switch/label/crowd, or issued credit changes without publication.

### 2. D98 load with a dead-kept row elsewhere

**Start:** Publish a Monday request; move it to Tuesday; load Monday’s issued version so Monday holds a dead kept row and Tuesday the standing row. On Tuesday click `✕`, publish Tuesday with filing `r` and no row, then choose `→ Unavail` so current filing is `u`.

**Gestures:** Tuesday Amendments → select the just-issued version → `Load onto working copy`. `[2T]`

**Expected:** Right after, D98 restores filing `r`, Tuesday remains without a standing row, and dead Monday remains a holder artifact. Pending count becomes zero if the rest matches the issued document. After reload, the same filing and rows return.

**Storage:** The load may write Tuesday’s day/book and the request filing because it is an admin action; it must not alter Monday. Wrong if filing remains `u` because Monday’s dead row was mistaken for a landing, or the count says the load discarded a change it actually restored.

### 3. Changes-window jump with one dead and one standing row

**Start:** Produce dead kept Monday plus standing Tuesday for one request. Edit its remarks or re-date it so the change line names both old and new dates.

**Gestures:** Open the gold-dot/Changes window from Monday → tap the request change. Repeat from Tuesday and on phone.

**Expected:** Right after, the app navigates to Tuesday’s standing row first, with the request card also focusable. It must never focus Monday’s dead kept row as “the request’s row.” Opening and jumping write nothing. After reload, the same destination is chosen.

**Storage:** Only the setup edit changed `inputs/<iid>`; window opening and navigation change no records. Wrong if focus/ring lands on the kept row, the wrong day opens, or the line becomes an inert button despite a standing row.

### 4. Holder-base ordering: request change → holder edit → request Undo

**Start:** An unpublished landed row has a stable `rid`, fixed index, request time 10:00, and a scheduler-added extra.

**Gestures:** Member edits request remarks → admin changes the row time to 08:00 and an unrelated day note → member uses global `Undo`; leave the week, return, then `Redo` and `Undo` again. `[2T]`

**Expected:** The request edit re-makes its six request-owned fields while retaining `rid`, position, extra, flag/CX/info. The later holder edit advances that day’s base. Undo restores the prior request and re-makes its request-owned fields from that request; unrelated holder content remains. Week leave/return and reload must give the same result.

**Storage:** Member edit and its Undo/Redo: input row only. Admin time/note: named day only. Wrong if the member inverse contains a day record, loses the extra/identity, resurrects a pre-holder day image, or right-after differs from reload.

### 5. New filing must not reorder earlier derived landings

**Start:** Empty unpublished Ground Programme. File all-day Meeting A, note its index and `rid`.

**Gestures:** File Meeting B through Inputs, then C; Undo C; Redo C; reload after each stage.

**Expected:** A never moves when B or C lands; each later filing appears below earlier derived landings. Undo removes only C; Redo restores C consistently. This should match the pre-(c) visible order.

**Storage:** Each member filing changes its input record and input order only; no day/book/weekstash record. Wrong if a later filing appears above A, A’s index changes, or reload produces a different order.

### 6. Published-day mark shape for a member filing

**Start:** Publish a day with no request row.

**Gestures:** Member files a timed Meeting onto it; inspect the row outlines, OG/add tag, day count, Amendments item and sign-offs. Reload, then admin `✕` and `Accept` the same request for comparison. `[2T]`

**Expected:** Exactly one D114 pending item. The member-derived landing has the same structural-add mark shape as explicit `Accept`: the item/add marker, not false independent changes on start, end, holder and remarks. Four sign-offs react as one pending content change. After reload marks are identical.

**Storage:** Member filing: input only, no day or book. Admin `✕`/`Accept`: input plus day/book. Wrong if the filing outlines every derived field, differs from Accept for identical content, counts above one, or reload changes marks.

### 7. Complete member field/Undo/Redo matrix

**Start:** One unpublished clone and one published clone of the same request.

**Gestures:** As Ranger, edit separately: start date, end date, start time, end time, remarks, activity type, person hand-over. After each: inspect immediately → Undo → reload → Redo → reload. Repeat delete as scenario 8. `[2T]`

**Expected:** Every act immediately re-makes/removes/lands the row, and the reloaded second client sees the same. `rid` and position survive a re-make; extras, flag, CX and info survive; the six request fields follow the request. Published clone has one D114 item with correct marks; unpublished clone has no amendment marks. Hand-over changes holder and D271 removes one duplicate holder from extras.

**Storage:** Each forward/Undo/Redo changes only `inputs/<iid>` for a member. Wrong if any `days`, `sched.*` or `weekstash` row changes, an edit is refused with “Load the week…”, a duplicate row appears, or right-after differs from reload.

### 8. Delete → Undo → Redo with exact holder row

**Start:** A row has holder-set time, extras, `rid`, position, flag, CX/info. Run once unpublished and once published.

**Gestures:** Member `Delete` → Undo → Redo → Undo; reload after every edge. `[2T]`

**Expected:** Delete removes the standing row immediately; Undo restores the exact holder-base row—same `rid`, index, holder-set fields and extras; Redo removes it again. Published day moves 0→1→0→1→0 pending with no hollow residue; unpublished day has no marks from the member act.

**Storage:** Member delete and inverse change input only. Wrong if Undo creates a new end-of-list row, loses holder details, leaves pending marks after return to as-issued, or changes a day row.

### 9. Hand-over, D271, then old-holder deletion

**Start:** A request belongs to person A; A is also present once among extras. Run on current week and an unopened next week.

**Gestures:** Member/admin permitted edit hands request A→B → inspect D271 toast → delete person A from Admin → Users → reload second tab and open the other week. `[2T]`

**Expected:** The standing row is re-made for B, with B removed once from extras if duplicated there. Deleting A does not delete B’s request row. Saved and never-saved weeks agree after reload.

**Storage:** Hand-over changes input only. Person deletion changes the person record and its own authorised records, not unrelated day rows. Wrong if A’s row remains live, B’s row disappears with A, D271 fires twice/at load, or a member hand-over writes a day.

### 10. Retype activity → leave → activity, including a dead-kept sibling

**Start:** A standing Meeting row plus a dead kept same-`src` row on another day.

**Gestures:** Edit type to LL/leave → wait for toast → edit back to Meeting → Undo → Redo; reload after each.

**Expected:** Retype to leave removes only the standing request row and says exactly once: “LL does not go on the Ground Programme — its row has been removed.” The dead holder row may remain visible but must not suppress that message. Retype back lands immediately; “Moved outside the programmed week” is never said; no message appears merely on load.

**Storage:** Member edits and inverses: input only. Wrong if no removal toast, a load repeats it, the dead kept row is removed as though live, the activity waits until week load, or a day record changes.

### 11. Cross-week edit and never-opened-week preview/checks

**Start:** Request in week 1. Week 2 has never been opened or saved.

**Gestures:** Re-date request into week 2 → inspect next-week peek and cross-week warnings → reload Tab B → open week 2 → move back to week 1 → reload again. `[2T]`

**Expected:** Current build immediately shows the request in week-2 peek and cross-week validator and never says “Moved outside the programmed week.” Opening week 2 shows one row on its start day; moving back removes it there and restores it in week 1. Before-(c) differences here are intended plan items 6–7.

**Storage:** Member edits change input only; neither week’s day nor stash row changes until a holder actually edits that week. Wrong if peek/checks disagree with opening the week, a stale row survives, a duplicate spans both weeks, or the second client differs after reload.

### 12. Two-day request shortened onto a published covered day

**Start:** Wednesday–Thursday request standing Wednesday; publish both days.

**Gestures:** Edit it to Thursday only → Undo → Redo; inspect both day heads and rows after every step and reload.

**Expected:** The standing row moves Wednesday→Thursday, Wednesday shows one removal and Thursday one addition/change as applicable, never two standing rows. Undo returns to exact Wednesday holder row. Counts and marks survive reload.

**Storage:** Member edit/inverses: input only. Wrong if Thursday fails to land because Wednesday’s issued/dead row is seen first, either day counts the request twice, or reload changes the chosen row.

### 13. Whole-day replacement order: version, plan, template

**Start:** Request standing Tuesday; Monday contains a dead kept sibling. Publish Tuesday, create a saved plan both with and without Tuesday’s request row, and prepare a day template copied from a day containing a request row.

**Gestures:** `Load onto working copy` older version → switch plan out/in → apply day template → Undo/Redo each scheduler action.

**Expected:** Version/plan keeps at most one standing row, re-makes it from the current request, and keeps genuinely dead imported rows as `kept`. Load count equals the actual discarded items. Template-copy rows have no `src/srcv/kept` and are ordinary holder rows. No request filing is silently changed by a plan switch unless the documented load plan permits it.

**Storage:** Each scheduler replacement writes the selected day/book; request rows change only where the door explicitly restores filing. Wrong if duplicate same-request rows appear, a template row remains linked, or load confirmation and actual result disagree.

### 14. Older version while newer is current; four sign-offs; Unpublish then edit

**Start:** Publish Original, amend and publish AL1, then create a working request change. Record all four sign-offs and issued faces.

**Gestures:** Load Original, inspect pending → return/load AL1 → `Unpublish` → member edits request → reload and view Original, AL1 and working copy. `[2T]`

**Expected:** D177/D178 issued faces stay frozen; working copy follows the live request. Loading older version gives correct one-item request deltas and clears/retains sign-offs according to content. Unpublish requires re-signing where ruled. Editing after Unpublish affects only working view, never either issued face.

**Storage:** Member edit after Unpublish: input only. Load/unpublish/sign actions change day/book/issuance/retraction as their doors specify. Wrong if an issued face tracks today’s request, four sign-offs survive a disqualifying change, or a member edit mutates issuance.

### 15. Scheduler placements versus member filing authority

**Start:** Same own request available under Personal Inputs.

**Gestures:** Compare four doors: ordinary member filing; board Ground `+ Inputs`; card `Accept`; card/row `✕`; `→ Unavail`. Repeat with dead kept same-`src` elsewhere.

**Expected:** Member filing derives a row but writes no schedule record. Each scheduler placement/removal/unavailable act writes the input filing plus the explicitly held day. `Accept` and `✕` act on the standing row, never the dead row. After reload each result is identical.

**Storage:** Assert exact record set per door. Wrong if member action contains any day/book record, scheduler placement fails to save its day, or `✕` removes the dead kept row instead of the standing row.

### 16. Physical holder operations on a linked and a dead-kept row

**Start:** One standing request row and one dead kept sibling.

**Gestures:** On each visible physical row edit time and remarks, drag an extra, toggle CX/info/red flag, sort all, drag row/phone arrows, then edit the request.

**Expected:** Physical gestures affect exactly the selected row and persist after reload. Editing the request re-makes only its standing row; the dead kept row retains holder content. Standing row keeps `rid`, position, extras, flag, CX and info while request-owned fields follow the request.

**Storage:** Physical gestures write only the touched day/book. Request edit writes only input. Wrong if a physical edit redirects across days by `src`, the request edit changes the dead row, or a member edit absorbs the day change into its command.

### 17. Validator, ALL AVAIL, crew busy, and card-location agreement

**Start:** Timed request spanning a cross-week boundary, with standing row on Sunday, an ALL AVAIL placeholder/extra on that row, and a dead same-`src` row elsewhere.

**Gestures:** Inspect live checks, crew picker availability, OIL crowd, card “On Sun 19 Jul” words, next-week peek, then edit times/person/date and reload.

**Expected:** Every live consumer identifies the Sunday standing row and current request window; none treats the dead row as busy work or the request location. Issued snapshots remain frozen. The validator must update in the same repaint as the edit.

**Storage:** All inspection is read-only; member edit is input-only. Wrong if the card names the dead row’s day, crew busy/checks lag until another gesture, ALL AVAIL resolves from the dead row, or inspection writes storage.

### 18. Member, admin, guest, and “Undo your own changes”

**Start:** Tab A Ranger, Tab B Saber, Tab C guest/read-only over one storage.

**Gestures:** Ranger files/edits → Saber reloads and makes a row edit → Ranger reloads and invokes Undo → guest attempts every visible editing door. `[2T]`

**Expected:** Ranger can undo only Ranger’s request step, not Saber’s later holder edit; the re-derived row incorporates the restored request over the current holder base. Guest has no working edit control and writes nothing. The already-open tabs remain stale until reload.

**Storage:** Ranger inverse changes input only; Saber edit changes day; guest changes nothing. Wrong if Ranger undoes Saber’s day record, the member inverse restores an old whole day, or guest writes any record.

### 19. Every renderer, including issued face and exports

**Start:** Live request differs from its issued row in dates, holder and remarks; a dead kept row also exists.

**Gestures:** Inspect working View-only Sched, issued View-only face, desktop board, phone board, next-week peek, `~` panel, Amendments, Changes, history; export Inputs CSV, schedule CSV and PDF.

**Expected:** Working renderers show the standing current row; issued face shows the frozen row. Inputs CSV shows the current stored request and full span. Schedule CSV/PDF remains the published flying report and does not accidentally add Ground Programme content. Right-after and reload render identically.

**Storage:** Rendering/exporting writes nothing. Wrong if any working renderer chooses the dead row, issued output tracks the live request, a read mutates a day, or print/export unexpectedly invents a third interpretation.

### 20. Change history and derived-row silence

**Start:** Published request row with zero pending changes.

**Gestures:** Member edits, hands over, re-dates, deletes, Undo/Redo; open History and gold dots after each.

**Expected:** Each user act has one request-level history story on the correct affected dates. No independent “ground cell changed,” landing, or re-make lines appear. Pending list still names where the request now stands. Undo/Redo lines belong to the actor’s restored request change.

**Storage:** History records may change through their normal log mechanism; no derived day write or row-history entry. Wrong if a single member edit produces request plus six cell lines, gold dots point only to a dead kept row, or a reload changes the story.

## 3. Confirmed missing or incorrect lines at `bb74d60a`

### A. OIL live readers can use a dead kept row

Files/functions:

- `ui/oilmode.ts`: `oilItemLabel`
- `engine/oilev.ts`: `landedRow`, `landedHasSentinel`, `landedExtras`

Exact repair:

1. Import/use `standsOn` for `oilItemLabel`, because it reads installed working `DAYS`.
2. Split the engine’s raw document-row lookup from its live standing-row lookup.
3. Make live `oilEvidence`, live sentinel membership, override pruning and live extras use the standing lookup.
4. Keep a separate raw lookup only for frozen issued-day evidence; do not infer “issued” from `kept`.
5. Pass the live/frozen mode explicitly into the extra/sentinel calculation so future callers cannot select accidentally.
6. Add a test with a dead kept row carrying CX/extra/ALL AVAIL and a standing row on another covered weekend day; assert label, crowd, switches and credit use only the standing row.
7. Add the complementary issued test: after the request changes, the already-issued evidence still uses its frozen document.

### B. Version-load filing restoration counts dead kept as landed

File/function: `engine/publish.ts`, `filingRestorePlan`.

Exact repair:

1. Replace its local raw `has(d)` same-`src` scan with `!!standsOn(d, id, inp)`.
2. Use that predicate both in the all-loaded-days `landed` calculation and for `dayAfter`.
3. Preserve the existing “another loaded covered day” and protected-input guards.
4. Add the scenario-2 test: dead kept Monday, no standing row, Tuesday issued filing `r`, current filing `u`; load Tuesday and require `r`.
5. Assert `dayDiscardCount` predicts the same result as the actual load.

### C. Changes navigation targets dead kept rows

File/function: `ui/ChangesWindow.tsx`, `jumpOf`.

Exact repair:

1. Import `standsOn`.
2. For each day, resolve `const row = standsOn(d, l.iid, inp)`.
3. Add a `g:<di>.<ri>` key only for that object’s actual index.
4. Build the `on` day set from that standing row or `inputCoversDate`, not raw same-`src`.
5. Retain the `iu:<iid>` card key.
6. Add a dead-Monday/standing-Tuesday navigation test and assert Monday’s ground key is absent.

### D. Retype-removal toast is suppressed by a dead kept sibling

File/function: `state/holderbase.ts`, `rederive` live-message block.

Exact repair:

1. Stop deciding removal from “no raw same-`src` row remains anywhere.”
2. Consume `ViewDayInfo.gone`, selecting entries whose `why === 'type'`.
3. De-duplicate by `src`.
4. Resolve the current request and queue the required toast once per request.
5. Leave load/boot silent by retaining the `opts.live` gate.
6. Add a test with dead kept Monday plus standing Tuesday; retype to LL and require exactly one toast while Monday remains visible.

### E. Derived rows land in request-list order, not stable filing order

File/function: `engine/overlay.ts`, `landRequests`.

Exact repair:

1. Establish oldest-to-newest request order before landing. Because new filings are inserted at the front, either iterate `INPUTS` in reverse or sort by stable `ord`.
2. Continue appending only missing landings; never reorder rows already present in the holder base.
3. Keep deterministic collision-safe `rid` minting.
4. Test A then B then C immediately, after Undo/Redo, after week leave/return and after reload.
5. Assert A’s index never changes and later filings appear below it.

### F. Member landing on a published day receives false field-level marks

File/function: `state/holderbase.ts`, `rederive` after `rebaseDayPending`.

Exact repair:

1. After rebasing a published day, identify a request-derived live row whose `rid` is absent from the issued day.
2. Compute the row’s canonical request fields using `requestRowFields`.
3. Keep the one structural `.prog` add/pending marker required by D114.
4. Remove pending marks for request-derived `str`, `end`, `rmks` and holder fields where the live value is exactly the canonical request value.
5. Retain marks for any value the scheduler has deliberately set apart from the request, including holder-set time/remarks and extras.
6. Do not change the one-item pending count or `SCHED.added` identity.
7. Compare the mark set with `✕` then `Accept`, immediately and after reload.

## 4. Explicit negatives

- I found no missing view door in loaded-week boot/load, saved-week `stashDays`, never-saved `weekctx.bundle`, or next-week `peek`.
- I found no request-side day write remaining in the normal file/edit/delete doors. The member command guard also rejects schedule records.
- The removed “Load the week of …” edit/delete refusals are not required and must not return.
- The old relink, delete-row drop, filing-time auto-landing, boot/load landing passes and `sched.load` application door must stay retired.
- Raw reads of an issued snapshot are not findings: issued View-only faces, published export, frozen OIL evidence and canonical issued/live diff pairing must not use today’s `standsOn`.
- Direct physical row operations—time/remarks, extras, CX/info/flag, sort, row drag, template application—must not be redirected through `standsOn`; the holder selected that exact row.
- A dead `kept` row remaining visible is not itself a defect under D363. Treating it as the live request’s row is the defect.
- Template stripping of `src`, `srcv` and `kept` is correct; copied rows must become ordinary holder rows.
- Input CSV reading `INPUTS` rather than the Ground Programme is correct. Schedule CSV/PDF omitting Ground Programme rows is existing report scope, not a missing overlay.
- History deriving request dates from the input record is correct; a derived landing/re-make must not receive its own history line.
- No migration, legacy-record or corrupt-old-store issue is reported. D56 excludes those, and the walk should build every state through current production controls.
- Group B lock screens/30-second checking, phase 7, and intended plan §8 differences are outside this report.
- The source inspection found no reason to expect an open second tab to update without reload; that is why the marked two-tab scenarios explicitly reload the second client.

## 5. Owner questions and recommendations

1. **May a dead kept row remain physically editable?**  
   Recommendation: yes. It is the holder’s visible artifact and may be edited, sorted or deleted directly, but request-card actions, request navigation, OIL and filing restoration must never select it as the request’s row.

2. **What is the intended mark shape for a member-derived landing on a published day?**  
   Recommendation: make it identical to explicit `Accept` for identical content—one structural add/OG marker and one D114 item, with field marks only for genuine scheduler-authored differences.

3. **Must later filings retain the pre-(c) append order across a clean reload?**  
   Recommendation: yes. “Nothing re-orders itself” should mean stable earlier row indices, with new derived landings appended oldest-to-newest.

4. **When a dead kept row remains visible after retyping the request to leave, should the mandated toast still say “its row has been removed”?**  
   Recommendation: yes. The sentence refers to the standing request row. Keep the exact ruled wording and do not let the holder artifact suppress it.

5. **Should a Changes-window request line ever navigate to a dead kept row for historical context?**  
   Recommendation: no. Navigate to the standing row/request card. Historical kept content already has issued-version and pending-list routes; presenting it as the request’s current destination breaks the single-standing-row rule.

6. **Should OIL’s live item window describe a standing row on another covered day, or describe the request directly when no standing row exists on the selected day?**  
   Recommendation: use the standing row for live standing state, but use the request’s own frozen/projected window for the requester’s multi-day claim. Never substitute a dead local row merely because its `src` matches.

