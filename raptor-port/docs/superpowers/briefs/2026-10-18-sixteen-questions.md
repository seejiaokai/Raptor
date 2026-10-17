# His sixteen questions, researched (18 Oct 26)

He asked for them on 18 Oct 26 ("Can u put a recommendation for each and explain clearly. If scenario is needed explain
it too") — D994's wait ended. Each was checked against every rulings file and the archive by three read-only helpers;
the host merged their reports. Put to him the same day in plain words; **his answers are not in yet**. The next chat puts
any still open in rounds of four WITH PICTURES (D921, D853), records each answer as a ruling, and closes the three already
answered. "Next agent" lines name the item, the rulings and the files.

## Already answered — to close, not to ask

- **12. The load note** — `[LOAD-MSG-SHORT]`: answered and built by D863 (15 Oct 26, live in pull request 506): "Thursday is
  back to the Original. Viewers still see the Original. Det prep is on Friday again too. 1 input needs an OIL answer."
  Archive it (`backlog-archive.mjs LOAD-MSG-SHORT --homes raptor-port/src/ui/interactions.ts`) and drop its priority line.
- **14. The Calendar window's swipe** — `[CAL-PHONE-SWIPE-FIT]`: his look given, D889 (15 Oct 26 — "I'm happy with the built
  calander look", the card's six steps). Archive with homes D786, D795, D800, D889; fix the stale lines near its priority entry.
- **16. The Tracker pinch** — `[TRK-PINCH-ASK]`: D134 settled the two feel questions; on 18 Oct 26 on his iPhone in Safari,
  "Yes this feels good" (D992). Archive on that; `[TRK-PINCH-OLD-EDGES]` stays open.
- **6. The delete list's notes** — `[DELETE-LIST-CAL-NOTES]`: ruled D710 (9 Oct 26, "yes as recommended"): one line per note he
  was taken off, a small later job, with readable note lines in the changes window. Not a question — a build
  (`state/changelines.ts`, `state/person-delete.ts`; D337).

## Still his to answer — with the recommendation

1. **ANSWERED 18 Oct 26 — D998, "No leave it for 1 for now": the manning stays as built.** **Leave War manning and commitments** `[LW-COMMIT-MANNING]` — his words of 21 Sep 26 (register N17, no D-number): "The
   manning should only reduce if they are like planned by things like leave, duty & commitments." Today only leave, medical,
   a course and overseas duty reach the war. Example: a Saturday needs six, six are free, Ranger has an accepted all-day
   Training — the war reads six. **Recommended: an all-day or half-day commitment lowers the manning for the half or day it
   covers; a timed one of a few hours does not; never counted twice with leave.** The SANS calendar follows (D617).
   Files: `leavewar/absences.ts`, `leavewar/engine/dayview.ts`, `leavewar/sync.ts`, `state/flyplan.ts`.
2. **Members seeing others' OIL entries** `[LEDGER-READ-ASK]` — today every member sees every man's OIL tracker, figures and
   grant reasons; the database's access table (§11) says own only. His 17 Aug 26 words: "everyone should be able to click on
   that person's name and see these logics"; D402 shows every award on the grid. **Recommended: everyone sees everyone's (as
   today), and the access table is widened to match.** Files: `docs/data-model.md` §11, `state/perms.ts`.
3. **Insights' empty line** `[INSIGHTS-EMPTY-LINE-COUNT]` — an uncrewed flying line counts as a sortie, as the day header's
   count does. **Recommended: keep it** — one count everywhere (D754); Insights reads published days (D478), where an empty
   line is rare. Files: `engine/insights.ts`.
4. **ANSWERED 18 Oct 26 — D999, "Ok" to A: the downchit grows back, shown on the save sheet; to build.** **An upchit moved later** `[UPCHIT-MOVE-NO-REGROW]` — Ranger ATT C Mon–Fri, upchit Wed cuts it to Tue; the upchit moved to
   Thu leaves Wed reading fit. **Recommended: the downchit grows back to the day before the new date (never past its
   original end), shown on the save sheet as the trim already is; the calendar drag the same.** Files: `engine/medical.ts`,
   `ui/UpchitConfirm.tsx`, `ui/inputedit.tsx`, `ui/caldrag.ts`; D178 (a regrown published day reads pending).
5. **The next-week preview** `[PEEK-ISSUED]` — on View-only Sched the preview shows next week's working copy, so an unissued
   swap (Tally for Ranger) shows to members. **Recommended: on View-only Sched the preview shows the published version of a
   published day; Edit Schedule keeps the working copy** (D178, D179, D478). Files: `ui/peek.ts`, `ui/ViewWeek.tsx`.
7. **ANSWERED 18 Oct 26 — D1001, "leave it I intend to have an option to sort according to flight": kept; the sort filed as [LW-SORT-BY-FLIGHT].** **The Leave War label** `[LW-LABEL-NO-DOOR]` — a per-man label is stored, filled from his flight, seen and set nowhere.
   **Recommended: drop it before the database tables are settled** (D461: one place changes a man's details). Files:
   `leavewar/state/store.ts`, `raptorRoster.ts`, `rows.ts`, `docs/data-model.md`.
8. **Escape in a board time box** `[BOARD-TIME-ESCAPE]` — the board's take-off, landing, brief and duty-start boxes keep a
   typed time on Escape; every other box puts the old one back (D544, D550 "Escape restores"). **Recommended: put the old time
   back, as everywhere.** Files: `ui/textedit.ts`. Picture: `img/handpass/2026-10-05-codex-stack/D/001-P4c-11-board-time-after-escape.png`.
9. **Escape in a calendar's month/year list** `[CAL-ESC-LISTS]` — in the OIL question's "Only some days…" and an input's
   window, Escape with the lists open closes the whole form (a waiting swap is then not made). **Recommended: Escape closes
   only the lists; a second Escape the form** (the design guide §2). Files: `ui/DateCal.tsx` and the two forms' Escape.
   Pictures: `img/handpass/2026-10-17-oil-confirm-daygrid/rewalk/18-S7-desk-lists.png`, `20-S7-phone-lists.png`.
10. **Crew-rest rings on a man's other pucks** `[CREW-REST-MARK-COPIES]` — Ranger's flight breaks Tuesday's rest: his cockpit
   puck is dotted, but his SANS card, Unavailable and Personal Inputs rows show solid red (reads as a breach today); an open
   issues list hides the dotted and dashed rings. **Recommended: every copy wears the seat's ring, and the open list lights
   without hiding it — drawn for him first** (D94, D876). Files: `ui/html.ts`, `ui/board-html.ts`, `ui/palette-html.ts`.
   Pictures: `img/handpass/2026-10-06-rest-blank-line/C/dk-06…dk-26`.
11. **ANSWERED 18 Oct 26 — D1000, "Shorter version": the two-line top up to about 700 wide; pictures first.** **The Leave War top on in-between screens** `[LW-HEAD-BIG-PHONE]` — 431–700 wide (the biggest iPhones) gets the tallest
   top; the grid starts 354px down. **Recommended: the phone's two lines up to about 700 wide, the top only — drawn at 440 and
   600 first** (D678, D679). Files: `leavewar/ui/phone.ts`.
13. **The Tracker import's refusal words** `[TRK-IMPORT-REFUSAL-WORDS]` — today, for a current file that does not match: "These
   student marks were saved by an older version and can't be brought in safely. Import the charts, then re-enter marks — or
   export a fresh backup from the current app and import that." (wrong reason). **Recommended wording (A): "These student
   marks are for a chart that isn't in this file or in your Tracker, so they weren't brought in. Bring in that chart first,
   then import this file again."** (the fix line to be tested); B (shorter): "Student marks not brought in: they belong to a
   chart this file doesn't carry. Export a fresh backup that includes its charts, and import that." The older-file words stay
   for real older files. Files: `tracker/app/fileTransfer.js` (STUDENT_GUARD_MSG), `tracker/app/core.js`.
15. **The Tracker's date box in Safari** `[TRK-DATEBOX-SAFARI-ZOOM]` — between 621 and 1050 wide the side panel is drawn at
   80%; Safari may place the calendar away from its box. His iPhone turned sideways is in that range. **His look:** Tracker
   in Safari → a student → phone sideways → tap "Upchit Date": the calendar should open just under the box. Fix if not:
   `ui/DateBox.tsx` divides the box's position by the zoom.
