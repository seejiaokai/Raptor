// builds docs/handpass/parts/cal-C.md and the final cal-C.json from the recorded rows + the window and low-drag tables
import { readFileSync, writeFileSync } from 'node:fs'
const R = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/'
const J = JSON.parse(readFileSync(R + 'cal-C.json', 'utf8'))
const WJ = JSON.parse(readFileSync(R + 'cal-C-windows.json', 'utf8'))
const LJ = JSON.parse(readFileSync(R + 'cal-C-lowdrag.json', 'utf8'))
const row = id => (J.rows[id] || { saw: '(not recorded)', verdict: '?', pics: [] })
const picsOf = (...ids) => [...new Set(ids.flatMap(i => row(i).pics))].map(p => p.replace(/\.png$/, '')).join(', ')
const short = (id, n = 700) => String(row(id).saw).replace(/ \| /g, '; ').slice(0, n)

/* ---- the windows table ---- */
const names = [...new Set(Object.keys(WJ).map(k => k.split('|')[0]))]
const cell = (r) => {
  if (!r) return 'not walked'
  if (r.error) return 'ERROR: ' + r.error.slice(0, 80)
  const h = r.hit, c = r.close || {}
  const centre = `centre: ${h.centreInside ? 'the window' : 'NOT the window (' + h.centreEl + ')'} (${h.centreEl}); buttons covered ${h.buttonsCovered.length}/${h.buttons}`
  const drag = r.drag ? (r.drag.na ? 'drag: n/a, no title bar' : `drag: ${r.drag.followed ? 'yes' : 'NO'} (${JSON.stringify(r.drag.moved)}), page ${r.drag.pageScrolled ? 'SCROLLED' : 'did not move'}`) : 'drag: -'
  const bg = r.bg ? (r.bg.found === false ? 'behind: control not found' : `behind: ${r.bg.what} ${r.bg.reachable ? 'reachable, ' + (r.bg.changed ? 'worked, window stayed' : 'pressed, no visible change') : 'COVERED by ' + (r.bg.hit && r.bg.hit.win)}`) : 'behind: -'
  const esc = `Esc with focus on a page control: ${c.escapeWithFocusOnPage || '-'}${c.escapeWithFocusInWindow ? '; after pressing the title: ' + c.escapeWithFocusInWindow : ''}${c.escapeAfterFocusingTheWindow ? '; focus put in window: ' + c.escapeAfterFocusingTheWindow : ''}; ✕: ${c.cross || (c.escapeWithFocusOnPage === 'closed' ? 'n/a (Esc closed it)' : '-')}`
  return [centre, drag, bg, esc].join('<br>')
}
let wt = '| Window | Desktop 1440x900 | Phone 390x844 |\n|---|---|---|\n'
for (const n of names) wt += `| ${n} | ${cell(WJ[n + '|desk'])} | ${cell(WJ[n + '|phone'])} |\n`

/* ---- the low-drag table ---- */
const lowRows = []
for (const [name, r] of Object.entries(LJ)) {
  for (const [st, v] of Object.entries(r.stages || {})) {
    if (v.gone) { lowRows.push(`| ${name} | ${st} | window gone |  |  |`); continue }
    const a = v.after, c = v.recovery
    lowRows.push(`| ${name} | ${st} | low: title bar on screen ${a.barOnScreen}; ✕ on screen ${a.crossOnScreen}; Save/last field reachable ${a.main && a.main !== 'not found' ? a.main.onScreen : (a.last ? a.last.onScreen : '-')}; window y=${a.win && a.win.y}, h=${a.win && a.win.h} | dragged back up: ${c.ok ? 'everything reachable' : 'NOT everything reachable (window y=' + c.win.y + ', h=' + c.win.h + ', last field on screen ' + (c.last && c.last.onScreen) + ')'} | ${v.pic2 || ''} |`)
  }
}

const md = `# Walker C — the calendar job's walk (Pieces: P3-01 to P3-12, H-01 to H-03) — 8 Oct 26

Server http://localhost:4213/ (frozen build). Sign-in Saber (ad) unless said; member Ranger (us) in P3-11. Real mouse (page.mouse) on a desktop, real touch events (Playwright tap / CDP touch) in a phone context. Sizes: desktop 1440x900 (also 1536x864 for the edge check), phone 390x844, short 390x568, side 844x390, 1280x700. Scripts: scripts/handpass/cal-C-*.mjs. Pictures: docs/img/handpass/2026-10-08-inputs-sans-calendar-check/C/.

## 1. The table

| # | What I did (the controls) | What the screen said | Verdict | Pictures |
|---|---|---|---|---|
| P3-01 | Inputs July 2026: day -> "+ Input" -> typed a remark in the editor window; gear -> Inputs settings window in front; Escape with focus on the settings window itself, on its Cancel button, after pressing its title; then reversed stacking | Every time the settings window was in front, Escape CLOSED THE EDITOR BEHIND IT (typed remark lost) and left the settings window open. Reversed (editor in front): Escape closed the editor, settings stayed. Focus when pressed: the settings window (div, tabindex -1), the Cancel button, the window after a title press. Windows before: day, editor, settings; after: day, settings. | FAIL | desk-p301-2-settings-over-editor, desk-p301-3-after-escape-v1, desk-p301-4-escape-in-textbox-behind, desk-p301-5-editor-in-front, desk-p301-6-after-escape-v5; phone-* same names |
| P3-02 | Calendar -> Holidays: PH where no period exists (2031) -> "Create the 2031 leave period"; cancelled a waiting holiday then created the period (2032); edited a waiting holiday then created (2033, desktop); partial year (2034, Q1 made on Leave War "+ New") -> "Add a leave period for 1 Apr - 31 Dec..." sheet | ${short('P3-02', 900)} (phone: ${row('P3-02-phone').verdict}; 2033 case not walkable on a phone — the open form covers the Holidays list and its Create button) | PASS | ${picsOf('P3-02', 'P3-02-phone')} |
| P3-03 | 2034 (Q1 + Rest periods): run 30 Mar - 2 Apr (crosses two periods); run 30 Dec 2034 - 2 Jan 2035; then changed the 10 Feb holiday to 30 Mar - 2 Apr (after Clear) | ${short('P3-03', 900)} | PASS (phone ${row('P3-03-phone').verdict}) | ${picsOf('P3-03', 'P3-03-phone')} |
| P3-04 | Added "Test Fest"/TF on 22 Sep in Calendar; changed it on the Leave War (cell -> peek "Edit" -> name/short -> Save); read the Calendar list; Delete in Calendar; reverse (added on the Leave War, changed in Calendar, deleted on the Leave War); a holiday form left open while the event was renamed, and while it was deleted, then Save pressed | a: ${row('P3-04a').verdict}; b: ${row('P3-04b').verdict}; c (renamed behind the open form): Save refused, "That holiday is no longer there — it was changed on the Leave War." newer record kept; d (deleted behind it): same refusal, nothing re-created. One line in the list every time, no duplicate, Event row empty after delete. Desktop only. | PARTIAL (desktop PASS; phone not walked) | ${picsOf('P3-04a', 'P3-04b', 'P3-04c', 'P3-04d')} |
| P3-05 | Holidays -> + Add; Save empty; tapped 5 Aug, 7 Aug, 3 Aug, 10 Aug, 12 Aug; Clear; Save | ${short('P3-05', 900)} | PASS (phone ${row('P3-05-phone').verdict}) | ${picsOf('P3-05')} |
| P3-06 | Calendar month July 2026: stepped Tue 14 and Sat 18 through their classes; pressed an active control, then ONE Undo; read PH 22 and Off day 21 | Desktop three buttons (D/N/NF) per date, phone one; weekday day->night->nf->day, weekend none->day->night->nf->none; pressing the lit weekday control wrote nothing (one Undo took back the earlier step); PH/OFF dates show a tag and no controls. | PASS (desk ${row('P3-06-desk').verdict}, phone ${row('P3-06-phone').verdict}) | ${picsOf('P3-06-desk', 'P3-06-phone')} |
| P3-07 | Thursday heading -> "Every Thursday": Night, 16 Jul to 30 Jul, Save; reopened (rule listed); end 23 Jul, Save; Remove | Title "Every Thursday"; sentence "Every Thursday from Thu 16 Jul 2026 to Thu 30 Jul 2026 is a night-flying day..."; Thu 16/23/30 night, other days untouched; same start replaces the rule; Remove returns every Thursday to its prior class. | PASS (desk ${row('P3-07-desk').verdict}, phone ${row('P3-07-phone').verdict}) | ${picsOf('P3-07-desk', 'P3-07-phone')} |
| P3-08 | Every window of the job (table in section 2): measured the element at its centre and at each button, dragged it by its title bar, pressed a control behind, Escape, the cross; extra: dragged window across a repaint, Save acting once | All windows: centre and every button are the window's own (0 covered); all drag with a real mouse/finger and the page does not move; background controls work while the window stays (on a phone the Calendar covers the whole page below the top bar, so no page control is reachable — by design, D664). Dragged place kept across month-arrow and filter-box repaints. Inputs settings Save closed once and one Undo took it back. Escape: see findings 1 and 5. | PARTIAL (Save/Apply acting once walked only for Inputs settings and the holiday Save; Escape behaviour has findings) | ${picsOf('P3-08x')}, desk-w-*, phone-w-* |
| P3-09 | Each window at 390x568: pulled/dragged to the very bottom, rotated to 844x390, resized to 1280x700, back to 390x568; then dragged back up | Title bar always stays grabbable (the top strip shows) and a drag back up always recovers it, but while parked low the title bar is part cut off, the cross is half off screen at 390x568 and Save / the last field are off screen. Finding 3: Calendar at 390x568 grows to 588 px (screen 568) once moved — its last date row is cut off at the foot even after dragging it to the top. Table in section 3. | PARTIAL (finding 3) | lowdrag-* |
| P3-10 | "+ Pucks" picker in an opened day (outside press, Escape); Delete question on a line of the opened day (outside press, Escape); the OIL question on a weekend duty in the editor (background press, Escape); SANS Highlight menu with the SANS day up | ${short('P3-10-desk', 1200)}; Highlight menu: outside press and Escape closed the menu, the SANS day stayed. | PARTIAL (finding 4; medical question, group Delete question and colour pickers not walked) | ${picsOf('P3-10-desk', 'P3-08x')} |
| P3-11 | Doors to "Calendar": Leave War gear (grid taken to August), Inputs gear (Inputs on September), Logic row -> settings -> Calendar..., SANS gear (SANS on November), SANS day (25 Nov); admin member view with Calendar and SANS settings open; member Ranger | Every door line reads "Calendar…" and the window is titled "Calendar". Desktop: Leave War door opened on August (the month the grid was on), Inputs gear on September 2026, Logic row on September, SANS gear on November, SANS day on November. Phone: Leave War door opened on January (grid not moved). Switching the admin to member view with Calendar open closed it; no gear anywhere; member Ranger has no Inputs gear, SANS gear, "Calendar…" on the SANS day, Leave War gear or Logic doors. | PARTIAL (guest and SANS-member roles not walked) | ${picsOf('P3-11-desk', 'P3-11-phone')} |
| P3-12 | Added Deepavali/DV on 9 Nov with "Save and add another"; read the next form; then an Off day on 12 Nov with name and short form blank | ${short('P3-12', 800)} | PASS (desktop; phone ran the P3-12a variant: ${row('P3-12a-phone').verdict}) | ${picsOf('P3-12', 'P3-12a')} |
| H-01 | Added PH "National Day"/ND on Wed 5 Aug and Off day "Stand Down"/SD on Wed 12 Aug in Calendar -> Holidays; read the tag on the Calendar window Month, the Inputs month, the SANS month and the Leave War Event row; opened the dates on Inputs and SANS | Leave War Event row ND / SD (column tints); Inputs month ND green / SD grey; SANS month ND green / SD grey; opened days read "Public holiday · National Day" / "Off day · Stand Down". THE CALENDAR WINDOW'S OWN MONTH PRINTS "PH" (green) AND "OFF" (grey) for the same two dates. Same on the phone. | FAIL | ${picsOf('H-01', 'H-01-phone')} |
| H-02 | Table in section 2; the new-period sheet over Calendar on a phone | Every window found at the centre and at every button; the OIL tracker open under the Calendar: Calendar in front. On a phone the Leave War's New-period sheet (from the Holidays list) is drawn in front of both Calendar and the holiday form (picture phone-p302-7). | PASS | phone-p302-7-period-sheet-over-calendar, desk-w-Calendar_with_OIL_tracker_open_Leave_War_-1-open |
| H-03 | Read every visible text and every title/aria-label for the word Days on the Leave War gear sheet, the window (Month, Holidays, holiday form, Every Thursday), both calendars' gear windows, SANS day, both "How this works", the Logic page | No place names that window "Days" or "Days…": every line reads "Calendar…", the window "Calendar". (Other uses of the word — "Days before the week starts", "Max days worked in a row", "Scroll days left" — are not that window.) | PASS (desktop and phone) | ${picsOf('H-03-desk', 'H-03-phone')} |

## 2. P3-08 and H-02 — one table, a row per window

(centre = what document.elementFromPoint found at the window's centre; "buttons covered" = visible buttons/inputs of the window whose centre is under something else; "behind" = a page control pressed while the window was up; Esc = Escape with the keyboard focus where said.)

${wt}
Not window-shell windows (no title bar, so "drag: n/a"): the Leave War's typing box / number pad and its working box; both close when a press lands on the page behind.

## 3. P3-09 — windows dragged low (390x568, 844x390, 1280x700, back to 390x568)

| Window | Stage | Parked low | Dragged back up | Picture |
|---|---|---|---|---|
${lowRows.join('\n')}

## Findings

1. **P3-01 — Escape closes the editor behind, not the front window.** Steps: Inputs, July 2026 -> open the 15th (click its corner) -> "+ Input" -> click the Remarks box and type "my unsaved remark" -> gear -> the Inputs settings window opens in front -> do not touch a text box: leave focus on the window (or focus its Cancel button, or press its title) -> press Escape. Expected: settings closes, editor and its remark remain. Seen: the editor closed (remark gone), settings stayed open. Windows before: day, editor, settings; after: day, settings. Same with focus on the Cancel button and after pressing the title. With focus in the editor's own Remarks box the same: editor closed, settings stayed. Reversed (editor in front): Escape closed the editor. Pictures: desk-p301-2-settings-over-editor, desk-p301-3-after-escape-v1 (opened). Phone-emulated run shows the same (keyboard Escape on a phone context).
2. **H-01 — the Calendar window's Month prints "PH" / "OFF"** where every other calendar and the Leave War print the Event row's short form ("ND" / "SD"). Steps: Calendar -> Holidays -> + Add -> Public holiday, name "National Day", On grid "ND", 5 Aug 26 -> Save and add another -> Off day "Stand Down", "SD", 12 Aug -> Month tab, August 2026. Expected (H-01): ND / SD on all three months and the Leave War. Seen: PH green on the 5th, OFF grey on the 12th. Pictures: desk-h01-4-calendar-month (opened), desk-h01-6-inputs-month, desk-h01-8-sans-month, desk-h01-5-leavewar-row. (ui-contracts.md "Days — the month" itself says PH / OFF for this window — the host decides which reading is right.)
3. **P3-09 — Calendar window at 390x568 is taller than the screen once it has been placed.** Steps: 390x568 phone, Leave War -> gear -> Calendar... (opens at y=54, 508 tall — fits) -> drag its title bar down, then back to the very top. Seen: top 3, height 588, bottom 591 on a 568 screen: the last date row (26 to 31 Jan) is cut off with nothing to scroll. Also at that size every window can be parked so low that only the top strip of its title bar shows, with the cross half off the screen and Save off the screen; dragging the strip back up always recovers it (the Input editor, 544 tall, fits only with its top within 24 px of the top). Pictures: lowdrag-Calendar-390x568-recovered (opened), lowdrag-Input_editor-390x568 (opened).
4. **P3-10 — Escape after a press on the page closes the whole day window, not just its Delete question.** Steps: Inputs, 15 July -> focus the first line and press Delete -> "Delete this input?" shows -> press on a quiet place of the page behind (the question stays, nothing deleted) -> press Escape. Expected: the question (only) is cancelled. Seen: the question and the whole day window closed (Escape with focus on the question's button DOES cancel only the question). Picture: desk-p310-3-question-after-outside-press.
5. **Escape needs the keyboard inside the window (P3-08).** After using the page behind a window (a month arrow pressed), or after pressing the window's title bar, focus stays on the page control and Escape does nothing — the window stays. It closes only when focus is inside it (or nowhere). Seen on Inputs day, Inputs/SANS settings, all three Calendar doors, SANS day, Every Thursday after a page press.
6. (observation, outside this job's list) The Leave War's own Event sheet and its peek box ("Edit") open BEHIND the Calendar window: with the window up and a filled event cell pressed, the peek's Edit button sat under the window's tab bar (elementFromPoint found the window); the Event sheet's Save/"This day" were under the window too. Dragging the window away fixes it. Pictures: desk-p304-2-event-sheet-changed, probe-cell-click (opened).
7. (observation) A window left open stays when the page is changed: Inputs settings was still up on the Logic page after pressing the Logic tab.
8. (observation, belongs to Piece 6) Filing one input for "Several people" from the editor (two chips picked, message "Input added for 3 people") shows TWO rows on the List ("Anvil +2" and "Ace +2"), where one shared row was expected. Picture: probe-list-group (opened). Not investigated further.
9. (observation) On a desktop the Inputs and SANS months run flush to the right edge: the gear button's right edge and the legend end exactly at the screen edge (1440 and 1536 wide). Pictures: desk-edge-inputs-month, desk-edge-sans-month, wide-edge-*.

## Errors seen

None: no console error, page error, native dialog or 4xx on any world of any script (the error list is empty in cal-C.json).

## What I did NOT walk, and why

- P3-04 on a phone (the Leave War's Event sheet and peek from a phone's grid; the window covers the grid) — NOT WALKED.
- P3-02's 2033 case (edit a waiting holiday, then create the period) on a phone — the open form covers the Holidays list on a phone, so it cannot be done there; desktop walked.
- P3-10: the medical question, the group "Delete this input for all N people?" question and colour pickers — not walked; the Delete question was walked on the opened day's line, the OIL question and the "+ Pucks" and Highlight pickers were.
- P3-11: guest and a signed-in person without access, and a SANS member — no such account was made (creating accounts is not mine to do); the member view and member Ranger were.
- P3-08: Save / Apply "acts once" for each window — walked for Inputs settings and the holiday forms only. P3-09: a real rotation on a real phone (only viewport changes were driven).
- H-02 on a phone: "OIL tracker open under Calendar" — the OIL button is behind the Calendar window there, so it cannot be pressed (hit test: Calendar in front).

## Pictures

305 files saved in docs/img/handpass/2026-10-08-inputs-sans-calendar-check/C/ (12 of them are working probes, not evidence); 32 opened.
`
writeFileSync(R + 'cal-C.md', md)
const out = { ...J, finals: { 'P3-01': 'FAIL', 'P3-02': 'PASS', 'P3-03': 'PASS', 'P3-04': 'PARTIAL', 'P3-05': 'PASS', 'P3-06': 'PASS', 'P3-07': 'PASS', 'P3-08': 'PARTIAL', 'P3-09': 'PARTIAL', 'P3-10': 'PARTIAL', 'P3-11': 'PARTIAL', 'P3-12': 'PASS', 'H-01': 'FAIL', 'H-02': 'PASS', 'H-03': 'PASS' }, windows: WJ, lowdrag: LJ }
delete out.rows['P3-04c-data']
writeFileSync(R + 'cal-C.json', JSON.stringify(out, null, 1))
console.log('written', md.length)
