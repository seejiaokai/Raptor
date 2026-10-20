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
| View-only Sched, a setting changed (desktop, phone) | yellow RULES MODIFIED above the Legend | no tag; the Legend where the banner stood | |
| Edit Schedule, a setting changed (desktop, phone) | the same tag above the amendments box | no tag | |
| Scheduler Board | never drew it ("the board draws no .schedbanner") | still none | |
| The next-week peek, the PDF, the print | never drew it (searched: no other writer of the words) | still none | |
| The Logic page's strip ("N settings changed from the squadron standard") | shown | MUST stay — D1098 keeps it | |
| What stood below the banner (the Legend fold, the amendments box) | 8px lower while a setting was changed | where it stands with no setting changed | |
| The banner as a blank-click target (it cleared the selection) | a tap on it cleared | gone with it; the Legend row and the day head still clear | |
| The Traffic window (admin, Edit Schedule / board): a line being typed in | a repaint threw the box and caret away | box, caret and typing kept | |
| The Traffic window: Add row, ✕ a row, an Undo behind it, another formation's window, the member's read-only view | redrawn | still redrawn | |
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

## 4. The walk

## 5. Carried by a test

- `src/ui/logic.test.tsx` "D1098: a changed rule puts no RULES MODIFIED tag on View-only Sched or Edit Schedule" — with
  crew rest changed, neither page draws the banner or sets the mark; the Logic strip still shows. Works through the
  app's pages (rendered App, nav clicks); the setting is changed directly.
- `src/ui/editlog-writers.test.tsx` "[INNERHTML-REPAINT-SWEEP] a repaint while a traffic line is typed in…" — the same
  box, still focused, its typing kept; Add row still redraws. **Red on the old code** (run 21 Oct 26).

## 6. Break tests

- The Traffic window's guard removed (the old code put back) → the new test red (21 Oct 26). ✔

## 7. The code read

## 8. Errors seen

## 9. Not walked, and why

## 10. Gates

## 11. Findings and dispositions
