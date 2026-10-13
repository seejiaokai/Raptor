/* builds docs/handpass/parts/2026-10-14-three-builds-w3.md from the key record the walk scripts wrote (keyboard.json) */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')
const F = resolve(ROOT, 'docs/img/handpass/2026-10-14-three-builds/w3/keyboard.json')
let rows = JSON.parse(readFileSync(F, 'utf8'))
/* stale NOT WALKED rows left by the walker's own earlier runs (set-up fixes) - each key was re-run and has its own newer row */
rows = rows.filter(r => r.verdict !== 'NOT WALKED')
writeFileSync(F, JSON.stringify(rows, null, 1))
const size = r => (r.surface.match(/\[(desk|phone)\]/) || [])[1] || ''
const pic = r => {
  const s = r.surface, z = size(r), id = (s.match(/^(X\d+|O\d|B\d|K\d)/) || [])[1]
  const m = {
    X1: `x01-${z}-oil-question`, X2: `x02-${z}-input-window`, X3: `x03-${z}-cancelled-input-window`, X4: `x04-${z}-no-medical-document`, X5: `x05-${z}-upchit-question`,
    X6: `x06-${z}-medical-clash`, X7: `x07-${z}-document-viewer`, X8: `x08-${z}-jump-to-a-date`, X9: `x09-${z}-cancel-reason`, X10: `x10-${z}-sort-all`, X11: `x11-${z}-day-popup`,
    O1: `o01-${z}-two-day-duty-question` + (/picked/.test(r.key) ? `, o01-${z}-all-days-picked` : /calendar/.test(r.key) ? `, o01-${z}-only-some-days-calendar` : ''), O2: `o02-${z}-saved-duty-question`, O3: 'o03-desk-list-chip-question', O4: `o04-${z}-day-list-two-picked`,
    O5: /upchit/.test(s) ? `o05-${z}-upchit-answer-buttons-close-up` : `o05-${z}-clash-answer-buttons-close-up`,
    B1: `b01-${z}-bar-under-top-bar, b01-${z}-whole-screen`, B2: `b02-phone-bar-${(r.key.match(/\d+/) || ['390'])[0]}`, B3: 'b03-desk-keyboard-on-answer-oil', B4: `b04-${z}-question-back-answered, b04-${z}-after-the-move`, B5: 'b05-desk-after-quals-and-back',
  }
  if (/^K1/.test(s)) {
    const k = { 'From': 'from', 'Until': 'until', 'Post in': 'post-in', 'Upchit date (a': 'upchit-date-medical', 'Last Flown': 'last-flown-syllabus', 'Upchit Date': 'tracker-upchit-date', 'End date A': 'end-date-a', 'Done on': 'done-on', 'Failed on': 'failed-on' }
    const hit = Object.keys(k).find(x => s.startsWith('K1 ' + x)); return hit ? `k01-phone-${k[hit]}` : ''
  }
  if (/^K2/.test(s)) return 'k02-desk-from-panel'
  return (m[id] || '') + (id === 'X9' && /T1/.test(r.key) && z === 'desk' ? ', x09-desk-keyboard-on-first-chip' : '')
}
const esc = t => String(t).replace(/\|/g, '\\|').replace(/\n/g, ' ')
const order = r => { const m = r.surface.match(/^(X|T|O|B|K)(\d+)/); const g = { X: 0, O: 2, B: 3, K: 4 }[m ? m[1] : 'X']; return [g, m ? +m[2] : 0, size(r) === 'desk' ? 0 : 1] }
rows.sort((a, b) => { const x = order(a), y = order(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2] })
const cnt = rows.reduce((c, r) => (c[r.verdict] = (c[r.verdict] || 0) + 1, c), {})
const body = rows.map(r => `| ${esc(r.surface)} · ${esc(r.key)} | ${r.verdict} | ${esc(String(r.saw).slice(0, 700))} | ${pic(r) ? pic(r).split(', ').map(f => '`' + f + '.png`').join(' ') : ''} |`).join('\n')
const head = `# W3 walk - the three builds of 14 Oct 26 (share W3: the ✕ in the corner, the question sheets by keyboard, the OIL question's other forms, the bar under the top bar, the calendar card's name)

Walker: Sonnet 5.5 (W3). The app as served at http://localhost:4173 (the one frozen build). Scripts: \`scripts/handpass/tb/w3/\` (run with \`DL_SHOTS=docs/img/handpass/2026-10-14-three-builds/w3\`). Pictures and the raw key record (\`keyboard.json\`): \`docs/img/handpass/2026-10-14-three-builds/w3/\`.
Sizes: phone 390 x 844 with a finger (B2 also 360 and 320 wide), desktop 1440 x 900.

Counts (rows, one per scenario, check and size): ${Object.entries(cnt).map(([k, v]) => `${k} ${v}`).join(' · ')}.

## How each scenario was reached (fixtures, all through the screen's own controls)
- X1: Training "Range brief" for Ranger, Sat 18 Jul 09:00-12:00, filed with the Inputs calendar's day window and its + Input form. X2: that input's own window (tap its row in the day window). X3: that input cancelled with the CX on its Ground Programme row on the Scheduler Board (reason "Range closed"), then its window opened again. X9: that CX dialog. X10: Sort all on the board (on the phone behind the ⋯). X8: the Jump to a date button on Edit Schedule. X11: a day's pop-up from Monday's heading on the Edit Schedule week.
- X4: ATT C 13-15 Jul for Ranger, saved with no document. X5: an Upchit on 14 Jul (with ATT B 17-18 Jul filed first, so the question has an entry "still on file after it" and a Keep / Remove pair). X6: ATT B 14-16 Jul over ATT C 13-15 Jul. X7: a tiny picture attached to an HL entry (27 Jul) and opened from the paperclip in its window.
- O1: a Duty Sat 18 - Sun 19 Jul (09:00-17:00). O2: a one-day weekend Duty 09:00-12:00 answered Yes, its end time then changed to 18:00 (that is the change that raises the question - a half day becoming a full day; see the notes). O3 and O4: two weekdays (21, 22 Jul) each with two inputs, made public holidays through Inputs gear, Calendar, Holidays; on the first the day's list was left with "Later" and the List's "OIL?" chip pressed; on the second the list's Yes was picked on one input and No on another.
- B1-B5: the X1-type input (Training, Sat 18 Jul) dragged from Sat 18 to Sun 19 on the Inputs month with the calendar's own drag - **a real mouse drag worked at both sizes (also in the phone-size context), so the board fallback was not needed.** The left-hand button ("Don't move") was pressed. No bridge was used for any fixture in this share.
- K1: opened from each box on the phone; the name line read off the page. K2: desktop From.

## Verdict rows
Every PASS / FAIL is a judgement of the script against the EXPECTED line; the "saw" cell is what the script read off the page. For X1-X11 the measured numbers are: the head's left-right edge, the ✕'s left-right edge, the gap from the ✕'s right edge to the head's right edge, and where the title's words end.

| Scenario · check | Verdict | What the screen showed (read by the script) | Picture |
|---|---|---|---|
`
const notes = `

## Notes on the judged rows
- **X3 FAIL (both sizes):** the red CX tag and its reason sit at the right of the head, 15 px before the ✕ (desktop: tag 1272.4-1372, ✕ from 1387, the title's words end at 1114.5, so 157.9 px of empty head between the title and the tag; phone: tag 204.4-304, ✕ from 319, title ends 134.5, a 69.9 px gap). The brief expects them beside the TITLE and not beside the ✕. Pictures \`x03-desk-cancelled-input-window.png\`, \`x03-phone-cancelled-input-window.png\` (opened). The ✕ itself is in the corner (8 px / 6 px inside the head's right edge) and nothing in the head overlaps.
- **X9, T1 (desktop) FAIL x 2 - read against the brief's literal words:** (a) the cancel-reason dialog opens with the keyboard in its reason box (inside the sheet), not on the sheet itself; (b) not every stop shows a cyan ring: the chips WX, OPS, LOGS and "Edit" show the browser's own plain focus ring (\`auto 1px rgb(16, 16, 16)\`, drawn white in \`x09-desk-keyboard-on-first-chip.png\`, opened), the reason box shows no outline (the phone picture shows a cyan border round it); the foot button and the ✕ show the cyan 2 px ring. The round itself is right: the ✕ is the last stop before the round returns to the reason box, Shift+Tab from the reason box goes to the ✕, Tab never leaves the sheet.
- X1 (the OIL question): keyboard on its first answer as it opens; Tab order No OIL, Back, ✕, then Yes (Add is disabled until an answer is picked, so it is skipped); Shift+Tab from Yes goes to the ✕. PASS.
- X4, X5, X6, X10: the sheet takes the keyboard (the sheet box), first Tab on its first own control, ✕ the last stop, Shift+Tab from the first control to the ✕, cyan 2 px ring on every stop. PASS (the exact stops are in each row).
- **O2:** the question comes with Back / Save when the end-time change alters the credit (Duty 09:00-12:00 answered HO, end changed to 18:00, so "Does it deserve FO"). On the two-day Duty of O1 (already FO, 09:00-17:00) a change of the end time to 18:00 saved with NO question ("Input updated") - noted, not judged.
- **O3:** desktop only (the brief says desk). Not walked on the phone.
- **O5 (record, no PASS / FAIL):** on both sizes the element wrapping each answer pair (\`.seg\`) is, in the upchit question (Keep / Remove) and the medical-clash question (ATT B replaces / Keep ATT C till Jul 15): background-color \`rgba(20, 24, 29, 0.5)\`, padding \`8px 20px\`, border-bottom \`1px solid rgb(42, 49, 58)\`. In the close-ups (opened) a slightly darker strip shows behind the buttons and a thin line runs under them, in both questions.
- B1: the bar read "Not moved - OIL not answered" with "Answer OIL" and "OK", one line, 0,56 1440x36 (desktop) / 0,48 390x36 (phone), the line under it \`rgba(229, 194, 74, 0.5)\`; the top bar grew from 57 to 93 px (desktop) and 49 to 85 px (phone) and the page below starts at the bar's bottom; the input stayed on 18 Jul.
- B2 letters: 12.5 px at 390, 12.125 px at 360, 10.625 px at 320; one line, nothing cut, no "...", buttons inside the bar.
- B3: the keyboard was on "Answer OIL" as the bar appeared (no ring was drawn on it at that moment - the bar had been raised by a mouse drag, and focus placed by the page after a mouse press shows none; the ring is drawn after Tab / Shift+Tab); Tab to OK; Shift+Tab back to Answer OIL; Escape closed the bar; the input had not moved.
- K1: the card's first line named its box on all nine cards, always the same 324 x 16 line, 11 px under the card's top, above the month's title. (The Tracker's "Upchit Date" and the medical input's "Upchit date" are two different boxes that both read UPCHIT DATE.)

## Seen in passing
- A passing note stays on screen far longer than its usual few seconds: after cancelling the CX on the board, the note "Schedule updated" was still at full opacity (\`#toastEl\` opacity 1) about 25 seconds later, on the Inputs page, and \`window.clearToast()\` did not remove it. On a phone, with the input's window up, it lay across the window's head, hiding the title, the CX tag and the ✕ (first take of the X3 phone picture; I hid the note with a style for the pictures I cite). I cannot say whether this is the headless browser's timers.
- X9: the WX chip's focus ring is white while every other control's is cyan (picture above).
- X3: the title box (\`.win-ttl\`) is wider than its words; on a phone the tag starts 15 px after the title box's end (189.4 to 204.4), so the "beside the ✕" look may come from the title box being a fixed width, not from a missing rule.
- O4 on a phone: the picked No and the picked "Yes · HO" wear the same cyan edge and words; my own fixture's rows appear twice in the list because the two holidays (21 and 22 Jul) merge into one two-day range.
- No window head looked displaced since the ✕ moved, apart from X3 above; no bar or note lay over a control except the stuck note above.

## Not walked
- O3 on a phone (the brief gives desk only). Nothing else: every scenario in X1-X11, T1, O1-O5, B1-B5, K1, K2 was walked at the sizes the brief names.

## Pictures opened and checked
x01-phone, x02-desk, x03-desk, x03-phone, x04-desk, x05-phone, x06-phone, x07-desk, x08-phone, x09-phone, x09-desk-keyboard-on-first-chip, x10-phone, x11-phone, o01-desk-all-days-picked, o03-desk, o04-phone, o05-desk upchit and clash close-ups, b01-desk, b02-phone-320, b03-desk, b04-phone, b05-desk, k01-phone-from, k02-desk. The other pictures cited are the same scripts' pictures taken at the same step at the other size; their names are in the rows.
`
writeFileSync(resolve(ROOT, 'docs/handpass/parts/2026-10-14-three-builds-w3.md'), head + body + notes)
console.log('rows', rows.length, JSON.stringify(cnt))
