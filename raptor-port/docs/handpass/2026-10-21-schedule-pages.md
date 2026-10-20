# Bug check — the schedule pages (the night of 21 Oct 26, job 1): [RULES-TAG-OFF] (D1098), [INNERHTML-REPAINT-SWEEP]

Branch `claude/schedule-pages-1021`, pull request 555. Built on the overnight run (D867); nothing merges without his
"merge live".

## 1. The eight answers and the tier

1. Money / OIL — NO: no count, no OIL; the tag only showed that a setting differed.
2. The published record — NO: nothing published, signed or amended is read or written.
3. Saved data — NO: the Traffic fix changes when the window's markup is redrawn, not what is saved (the same
   handlers write the same list).
4. A shared drawer — YES (lightly): the tag was drawn on two pages (View-only Sched, Edit Schedule) by one banner.
5. A new gesture or mode — NO; a REMOVED mark (the order's §6 row for a removal applies).
6. A new surface — NO.
7. Roles — NO (admin and member saw the same tag; the Traffic window's member view is read-only and unchanged).
8. The warning list — NO: the tag was never a warning; the checks read the settings exactly as before.

**Tier: WALK.**

## 2. The roll-call

| Place | Before | After (must) | Seen / operated |
|---|---|---|---|
| View-only Sched, a setting changed (desktop, phone) | yellow RULES MODIFIED above the Legend | no tag; the Legend where the banner stood | ✔ A3, A7 (both sizes) |
| Edit Schedule, a setting changed (desktop, phone) | the same tag above the amendments box | no tag | ✔ A4 |
| Scheduler Board | never drew it ("the board draws no .schedbanner") | still none | ✔ A5 |
| The next-week peek, the PDF, the print | never drew it (searched: no other writer of the words) | still none | read (the reader searched the whole tree) |
| The Logic page's strip ("N settings changed from the squadron standard") | shown | MUST stay — D1098 keeps it | ✔ A2, A6 |
| What stood below the banner (the Legend fold, the amendments box) | 8px lower while a setting was changed | where it stands with no setting changed | ✔ measured: no gap (A3/A4) |
| The banner as a blank-click target (it cleared the selection) | a tap on it cleared | gone with it; the Legend row and the day head still clear | the day head's test stands (`interact.test.tsx`); the banner's own test went with it |
| The Traffic window (admin, Edit Schedule / board): a line being typed in | a repaint threw the box and caret away | box, caret and typing kept | ✔ B1–B5 (both sizes) |
| The Traffic window: Add row, ✕ a row, an Undo behind it, another formation's window, the member's read-only view | redrawn | still redrawn | ✔ C1–C6, D1; another formation's window: the read (case by case) |
| The nine other screens of the sweep (ALPanel, AvailWindow, ChangesWindow, InputsCal, MedicalView, Modals' day panel and Insights, PeoplePick, SansCal, SansDay, Shell's legend and dots) | their markup set again on a repaint | unchanged — none holds a box to type in (read 21 Oct 26), so none can lose a caret | read, not walked (nothing changed there) |

## 3. The five sizing lines (D607)

1. **Type:** E (a mark removed from two pages) and C (a window's typing kept through a repaint).
2. **What only a walk could find:** the tag gone at both widths with the Legend not left with a gap; the Logic strip
   still there; the Traffic window's typing surviving a REAL repaint, and its add, delete, undo and save still working.
3. **The ledger:** E walks (10, 6 finds, 4 real) found layout left behind; C walks found the most per walk (31 finds,
   27 real) — orders of action.
4. **The walk chosen:** one Sonnet 5.5 walker (D787), on the built app, desktop 1400×900 and phone 390×844: the two
   pages with crew rest changed on the Logic page, the Board, the Logic strip; the Traffic window — type, a repaint from
   a second tab's change (or, if the app does not carry another tab's change across, a repaint through the developer
   bridge, said so), blur and reopen, Add row, ✕, Undo. The nine read-only screens are carried by the reading above.
5. **After:** a row in `docs/walk-ledger.md`.

## 4. The walk (one Sonnet 5.5 walker, 21 Oct 26, ~02:45–02:55; the build of `claude/schedule-pages-1021` at its tag-and-Traffic commits, served on 4291; desktop 1400×900, phone 390×844)

Every scenario PASSED at both sizes. Errors: none (no console error, page error or 4xx in any run). Pictures:
`docs/img/handpass/2026-10-21-schedule-pages/` (dk = desktop, ph = phone); the scripts beside them in `scripts/`.

| Scenario | Size | Result | What the screen showed | Pictures |
|---|---|---|---|---|
| A — the Logic strip | both | PASS | Edit, crew rest 12h → 10h typed through the box: the amber strip "1 setting changed from the squadron standard…"; it stays after Done; the row shows "Standard 12h · Reset" | A2, A2b |
| A — View-only Sched, a setting changed | both | PASS | no "RULES MODIFIED" anywhere; the Legend fold sits right under the filter row, no gap (104/104 desktop, 90/90 phone) | A3 |
| A — Edit Schedule, changed | both | PASS | no tag; the Legend under the Amendments panel, no empty band | A4 |
| A — Scheduler Board, changed | both | PASS | no tag | A5 |
| A — Reset to standard ("Reset all" on a phone) | both | PASS | strip gone, crew rest back | A6 |
| A — standard against changed | both | PASS | View-only Sched's top identical in layout and counts (A3 against A7); a first visit at standard (A1) has no tag | A1, A3, A7 |
| B — typing kept through a repaint | both | PASS | Traffic window from the wave's "Traffic" button (Edit Schedule); typed " ABC" at the end of the row; after a repaint: the same box, still focused, text kept, caret 53/53; typing "XYZ" went on (56/56) | B1–B5 |
| C — blur saves, Done, reopen | both | PASS | the line kept " ABC" after Done and reopen | C1, C2 |
| C — Add row, ✕ | both | PASS | a new row "1 X … / … / … / …"; ✕ took it away | C3, C4 |
| C — Undo with the window open, and after Done | both | PASS | the deleted row came back inside the open window at once; redo too; "Undid: a change to the schedule"; Done → top-bar Undo → reopen correct | C5b, C6 |
| D — a member (`us`) | both | PASS | the Traffic window from a wave on View-only Sched shows the lines as plain text — no boxes, ✕, Add row or Done; "<090 inbound" shows whole; it stays open through a repaint | D1 |

**The repaint in B, and how it was made:** a second tab does not carry a change across into an open tab (it asked for its own sign-in and its change did not reach the first tab), so a person cannot make one that way in this build. The repaint was made through the developer bridge (`renderEditWeek()` → the store's notify), with a positive control: a setting changed through the bridge (crew rest 24h + `ruleApply()`) changed the week (issue counts 17/4/7/6 → 17/13/10/12) while the Traffic window kept the same box, the caret and the typing. In the database (shared, every 30 seconds — D356) other people's changes will repaint an open page; that is the route this fix is for.

**Odd, noted by the walker, none from this change:**
1. With the Traffic window open the top bar's Undo cannot be pressed — the window's backdrop covers it (a real click timed out at both sizes); Ctrl+Z inside the window does nothing. Undo was driven through the bridge with the window open, and by Done → Undo → reopen. Older behaviour of the window.
2. The Logic page's passing note "Editing rules — the schedule rechecks as you type" was still fading out after the move to View-only Sched / Edit Schedule (in A3/A4). Its own timer.
3. A first visit to View-only Sched on a desktop starts the week 20px from the left edge; later visits flush. The same with the setting changed or not.
4. A typed, not-yet-blurred line in the Traffic window has no undo step until the box is left (the top-bar Undo greyed) — a save-on-blur box.
5. The member's window has an empty, invisible footer; Monday shows an amber "2 new" after the admin added a line — expected.
6. Phone page switches were made with the bridge's `go()`, not the drawer; sign-out on the phone through the menu.

## 5. Carried by a test

- `src/ui/logic.test.tsx` "D1098: a changed rule puts no RULES MODIFIED tag on View-only Sched or Edit Schedule" — with
  crew rest changed, neither page draws the banner or sets the mark; the Logic strip still shows. Works through the
  app's pages (rendered App, nav clicks); the setting is changed directly.
- `src/ui/editlog-writers.test.tsx` "[INNERHTML-REPAINT-SWEEP] a repaint while a traffic line is typed in…" — the same
  box, still focused, its typing kept; Add row still redraws. **Red on the old code** (run 21 Oct 26).

## 6. Break tests

- The Traffic window's guard removed (the old code put back) → the new test red (21 Oct 26). ✔

## 7. The code read (one fresh, blind Opus reader, 21 Oct 26, ~03:00 — D790, D903; read through git, the branch's three commits)

**Verdict: the code change is sound; no defect in the app.** Findings, each with its fix (dispositions in §11):

- **F1 (low) — the IT flow guide still teaches the tag; its picture script would break at the next re-shoot.** `scripts/itflow/j/settings.mjs:32` (and its header, lines 1–2) frames `#vBanner` and marks `#vBanner.rules-off`, which no longer exist; `scripts/itflow/content.mjs:712` has the step `see('"Rules modified" on the schedule')` and `:718` the check line "After a change every week shows 'Rules modified' until 'Reset to standard'"; the deck still shows the tag. Fix: the shot of the Logic strip (`#lgOff`) instead; the step and check lines reworded; the deck's picture added to [ITFLOW-OIL-RESHOOT] (a re-shoot on his word, D403).
- **F2 (low) — two comments still describe the tag (D201).** `src/ui/LogicPage.tsx:7` "The RULES MODIFIED stamp is as it was."; `src/ui/logic.test.tsx:511` "never light the RULES MODIFIED stamp or the … strip". Fix: reword both. (The stale line in `ui-contracts.md` is fixed on `claude/night-records-1021`.)
- **F3 (low) — the new Traffic test does not pin the redraw path.** A later simplification comparing only the row count would leave old text after a change behind the window that keeps the count. Fix: before Add row, change `w.traffic[1]` behind the window, notify, and expect the box to show it. Also: the D1098 test's `textContent` check proves nothing (the tag was CSS, never text) — the banner-absent and body-mark checks carry it.
- **F4 (process) — the evidence sheet on the branch is unfinished** (walk, read, gates, findings, `Walk:` line).
- **Lesson 14:** the core matches his words; "everyday pages" (wider than the two pages he named) and "a mark earns a place on an everyday page only where it changes what a person does there" (a general rule he never stated) are the agent's reading and must be marked so, as Lesson 13 does, or narrowed.

**Absences checked and clean:** the original-app check (`reference/tfin.js`) loads only the reference app, so its banner checks are unaffected; nothing in `e2e/`, `probes/`, `src/probe-bridge.ts`, `scripts/rulecheck.mjs` reads the banner, its class or the body mark; `.schedbanner` in `interactions.ts` is in comments only; no style or code finds the Legend or the amendments box through the banner; the two memoised parts of Shell read no rules count, so dropping it from their lists is correct; the Traffic window, case by case — another wave's window, admin ↔ member, a row added or deleted, an undo or sync behind it, closed and reopened, two equal rows, an empty list, `<` `&` `"` — all redraw or keep correctly, and the edit log's snapshot and `airEdit` are untouched; the nine screens' markup builders emit no `<input`, `<textarea`, `<select` or `contenteditable`; the test changes move assertions, none weakened, and the new Traffic test is red on the old code.

## 8. Errors seen

None in any walk run (console, page errors, 4xx).

## 9. Not walked, and why

- A second tab carrying a change into an open Traffic window: this build does not carry another tab's change across (the walker tried it), so the repaint was made through the developer bridge, with a positive control (§4).
- The nine screens with no box to type in: nothing changed there; read (§2, §7).
- The IT guide's re-shot picture (settings-4 now frames the Logic strip): the script is corrected and syntax-checked; the guide's pictures are re-shot only on his word (D403) — added to [ITFLOW-OIL-RESHOOT].

## 10. Gates

- On his PC: the touched files — `logic.test.tsx`, `app.test.tsx`, `editweek.test.tsx`, `interact.test.tsx` (120 / 120), then `logic.test.tsx` + `editlog-writers.test.tsx` after the read's fixes (54 / 54); `npm run build` clean (typecheck included).
- GitHub's full run (D1086, the repo public) on `759e5e949`: green — the checks and the documents guard. The read's fixes are pushed after it; their run is read before the morning report.

## 11. Findings and dispositions

| Finding | Disposition |
|---|---|
| F1 — the IT guide's picture script and words still teach the tag | fixed: the shot frames the Logic strip; the step and check lines reworded; the deck's re-shoot added to [ITFLOW-OIL-RESHOOT] (his word, D403) |
| F2 — two comments describe the tag | fixed (`LogicPage.tsx`, `logic.test.tsx`) |
| F3 — the Traffic test does not pin the redraw path | fixed: a change behind the window that keeps the count reaches the boxes; the empty `textContent` check removed (it proved nothing) |
| F4 — the sheet unfinished | this section |
| Lesson 14 says more than his words | fixed: narrowed to the two pages he named; the wider reading marked as the agent's |
| The walker's odd 1 — the top bar's Undo cannot be pressed while the Traffic window is open | older; filed as [TRAFFIC-WIN-COVERS-UNDO] |
| The walker's odd 2–6 | as built / not faults (§4) |

**Re-walk:** the read's fixes touch a test, two comments, the IT guide's script and a document — nothing the app draws or does — so there is nothing on screen to walk again; the tests are the proof.

**Questions waiting for him:** none.

`Walk: docs/handpass/2026-10-21-schedule-pages.md · 47 pictures · 6 surfaces · 11 orders · MISSING: none (3 low read findings fixed, 1 older filed)`
