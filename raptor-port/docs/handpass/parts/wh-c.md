# Walker C — kept for everyone, and the edges — `[WARN-HIDE-KEPT]` walk, 1 Oct 26

Served build `http://localhost:4213` (the frozen `dist-wh`), a scripted real browser, desktop 1440×900 and phone 390×844.
Every write went through the app's own controls; the probe bridge only got to a place and read state (`raptorRole` was
never used — the second scheduler is Hex, made an admin on Admin → Users through his own row's Role box and Save).
**187 steps PASS · 2 FAIL (one finding, at both widths) · 8 recorded / not walked.** No console error, page error, 4xx or
native dialog in any run. Results: `docs/handpass/parts/wh-c.json`; pictures: `docs/img/handpass/2026-10-01-warn-hide/c/`
(`dk-…` desktop, `ph-…` phone); scripts: `scripts/handpass/wh-c-*.mjs`. Every picture was opened (the key ones at full
size, the rest on contact sheets).

## The table

| # | What I did (the controls) | What the screen said | Verdict | Pictures |
|---|---|---|---|---|
| **28** | Edit Schedule, Tuesday: ✕ on Static's "Long work day" (draft). Then: reload · Logout and sign in again · Logout, sign in as the member (View-only Sched) · back as admin, type a new Tuesday day note · reload · open the board | Every time: "3 issues" (was 4), the line still 4th, struck, ↺ on top; Static's pucks plain. Member: struck, no button, no Edit Schedule tab. The note and the hide both survived the edit and the reload. Board: 3 issues, struck, ↺ | **PASS** both widths | `dk/ph-01…08-28-*` |
| **rows** | Saved rows read before and after one hide, a flag-again, a second hide | Each wrote Tuesday's own row, one history line, one change batch — no other day, request, person or Leave War row. (The very first save of a never-saved week also writes that week's empty header row.) | **PASS** | `dk-01/02-rows-*` |
| **27** | The same hide at three states — draft; hidden then published; published then hidden — seen as: scheduler (Edit Schedule, board, his View-only Sched), admin in his member view (name badge), member, guest (guest switch on → unknown sign-in → Request access → View the schedule); then a reload as scheduler and as member | Scheduler's working copy: struck, ↺, 3 issues, in all three. Read-only faces: struck with **no** button when draft or issued; when the hide is still waiting they keep the line plain, 4 issues and Static's flag ("1 pending", "Publish AL1", "Not yet signed", four sign-offs empty on the working copy). Guest: no issues bar and no button at all; Static's puck plain / flagged to match the member's face. A member's tap on the line changes nothing | **PASS** both widths (54 steps) | `dk/ph-01…09-27draft-*`, `-27issued-*`, `-27pending-*` |
| **31** | ✕, then top-bar Undo, Redo, reload; ↺, Undo, reload; ↺, Undo, Redo, reload; then the same on the board with its own Undo / Redo, ✓ Done, reload | Undo reads "Undo — hiding a warning" / "… flagging a warning again"; the app says "Undid: …" / "Redid: …". List, count and puck move together each time; a reload keeps exactly the last state | **PASS** both widths | `dk/ph-01…12-31-*` |
| **32** | Two schedulers in two tabs. (a) A hides Tuesday's "Long work day"; B reloads, hides Tuesday's "No time for the flight brief"; A presses Undo. (b) fresh world, B hides on **Wednesday** instead; A presses Undo | (a) "Undid: hiding a warning" — no refusal, Hex not named; after reloads **both** hides are gone, B's included. (b) A's Undo works, Tuesday flagged again, B's Wednesday hide kept | **(a) FAIL · (b) PASS** both widths | `dk/ph-01…03-32-*` (a), `-04…06-32-*` (b), `dk-01/02-32b-*` |
| **30** | A hides; B reloads; B presses ↺; A reloads; B reloads again; A opens the changes window (All changes, by Item and by Who) | B sees A's hide; A sees B's flag-again; nothing comes back. History: two lines under "Tue · The day" — "Warning · Static — … flagged → hidden · Saber" and "… hidden → flagged again · Hex" | **PASS** both widths (a tab learns at its next reload — recorded) | `dk/ph-01…08-30-*` |
| **29** | Week of 13 Jul: hide Tuesday's long day. Week of 20 Jul: hide Monday's "CO approval required". Back and forth by the week chips (calendar on a phone), a reload in each week, then the member. All seven days of both weeks read each time | 13 Jul: only Tuesday's line struck. 20 Jul: only Monday's. No leak by day number or by kind (20 Jul's Wednesday has its own long-day line — untouched). Exactly two stored day rows carry a hide. Member sees the same, no buttons | **PASS** both widths | `dk/ph-01…08-29-*` |
| **6** | Board, Sunday 19 Jul: + Row, Ranger from the crew list, 15:00–23:00. Monday 20 Jul (draft): ✕ on its Crew rest line; back to Sunday; reload (20 Jul never opened); ↺; reload; then two unrelated hides | Sunday: Ranger's puck dotted with the R chip and a "Breaks Monday" line → all three gone after the hide (Edit Schedule and View-only Sched, either direction of travel) → back after ↺. Unrelated hides change nothing | **PASS** both widths | `dk/ph-01…09-06-*` |
| **7** | The same with Monday 20 Jul published: ✕ → reload as Hex → sign-offs, Publish AL1 → reload as Saber → ↺ → reload as Hex → Publish AL2 → reload | Sunday's mark **stays** while the hide waits, goes only after AL1, **stays gone** while the flag-again waits, returns only after AL2 — on both pages, across each reload and sign-in | **PASS** both widths | `dk/ph-01…22-07-*` |
| **4** | Monday 20 Jul (draft): landing typed equal to take-off on RU BFM. Week of 13 Jul: the preview right of Sunday. ✕ → reload → ↺ plus an unrelated ✕ → reload | Preview: both time boxes outlined → both gone after the hide (and after a reload) → both back after ↺; the unrelated hide took nothing | **PASS** desktop · phone NOT WALKED (no preview on a phone) | `dk-01…15-04-*` |
| **5** | The same with that Monday published; hide, reload, Publish AL1, ↺, reload, Publish AL2 | Preview keeps both boxes while the hide waits, drops them only after AL1, stays clear while the flag-again waits, shows them again only after AL2 | **PASS** desktop · phone NOT WALKED | `dk-01…15-05-*` |
| **44** | Sunday 19 Jul published (a weekend duty earns). Read Logic, the PDF button's print page, the CSV button's file, Leave War, OIL tracker, the Leave War's saved rows. Hide all four of Tuesday's, three of Monday's and Saturday's OIL reminder; reload; flag all again. Also a weekend no leave period covers (27 Dec 2025): hide / flag again its "No OIL — no Leave War period" reminder | Logic unchanged throughout: "16 fired", long work day still "fired 2× · Mon, Tue" with every Tuesday line hidden. Print page and CSV identical to the letter (the print's time stamp set aside), no warning mark or wording in either, before or after. Leave War page, every OIL tracker figure and the Leave War's saved rows identical | **PASS** both widths | `dk/ph-01…13-44-*`, `dk/ph-01…05-44b-*` |

## Findings

**F1 — scenario 32, same day: Undo did not refuse, and it wiped the other scheduler's hide** (`dk-01/02/03-32-*`, `ph-…`).
Steps: Admin → Users, Hex's row → Role "Admin" → Save. Tab A (Saber) and tab B (Hex) on Edit Schedule. A: ✕ on
Tuesday's "Long work day". B: reload, sign in, ✕ on Tuesday's "No time for the flight brief" (B reads 2 issues, both
struck). A, tab not reloaded: top-bar Undo. Expected (D148, WH11, the plan's "Undo is at the day's grain"): Undo refuses
and names Hex. Happened: "Undid: hiding a warning"; after both reload, Tuesday reads 4 issues with nothing struck — B's
hide was silently lost. What is behind it, as seen on screen: A's tab never learns of B's change (30: only a reload
brings it), so it has nothing to refuse on, and its Undo saves its own stale Tuesday over B's. It is not special to
Undo or to hides: a plain day-note edit from the stale tab wiped B's hide the same way (`dk-01-32b-a-…`, recorded). And
the other road is closed too: in one tab, a Logout empties the Undo list, so A's Undo is greyed after B's turn
(`dk-02-32b-b-…`; both hides kept). **So the refusal could not be reached through the app's controls in this build** —
its only evidence is the unit model. For the main agent to weigh: a limit of the no-server build, or a gap to state on
the look card.

## Observations (not judged as defects)

- **No live sharing between two open tabs** — B saw A's hide only after a reload, even with the 1-second sync on.
- **The "red" time boxes are painted amber** (the advisory colour) on the week and in the preview.
- **Changes window:** the old value runs straight onto the warning's words — "…debrief assumed)hidden → flagged again"
  (`ph-07-30-4-A-changes-window.png`).
- **Sunday's "Breaks Monday" line is not counted** in Sunday's "N issues" (two lines under "1 issue") — as before this
  build; it follows Monday's hide correctly.
- The print page is a plain table with no pucks at all, so it has no flag to drop.

## Errors seen

None.

## Not walked, and why

- **4 and 5 on a phone** — the next-week preview is not drawn there.
- **32's refusal itself** — unreachable (F1).
- **Saving the PDF / CSV as files** — I read what each button built instead: the print frame's own page (the app then
  says "Print dialog opened — choose Save as PDF") and the CSV text (offered as `142-schedule.csv`: a heading line and the week's flying lines, 33 lines in all).
- A second admin made by "Add person" — not needed; Hex's own Role box did it.
- Leftover pictures named `…-X-error.png` and `…probe…` come from my own script slips and probes, not from the app.
