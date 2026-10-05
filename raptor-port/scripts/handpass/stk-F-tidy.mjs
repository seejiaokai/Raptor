/* Walker F — keep in the picture folder only the pictures this walker opened and cites; move the rest (superseded
   runs, probes, unopened repeats) to F/not-cited/ — nothing is deleted. */
import { readdirSync, mkdirSync, renameSync } from 'node:fs'
const DIR = process.env.HP_SHOTS
const cited = new Set([
  ...['a-001-oil-open-desk', 'a-002-oil-range-desk', 'a-003-oil-after-retry-desk', 'a-004-oil-open-phone', 'a-005-oil-range-phone', 'a-006-oil-after-retry-phone'],
  ...['b-001-trk-tools-before', 'b-002-trk-tools-after-fail', 'b-003-trk-tools-after-autoretry'],
  ...['k-001-win-both-open', 'k-002-win-both-placed', 'k-003-win-during-fail', 'k-004-win-reopened', 'k-005-win-default-during-fail'],
  ...['e-001-board-desk', 'e-002-inputs-calendar-desk', 'e-003-medical-view-desk', 'e-004-cover-end-desk', 'e-005-board-phone', 'e-006-inputs-calendar-phone', 'e-007-medical-view-phone', 'e-008-cover-end-phone'],
  ...['h-001-page-viewsched-desk', 'h-002-page-inputs-desk', 'h-003-page-logic-desk', 'h-004-page-tracker-desk', 'h-005-page-viewsched-phone', 'h-006-page-inputs-phone', 'h-007-page-logic-phone', 'h-008-page-tracker-phone',
    'h-009-short-insights-window-desk', 'h-010-short-input-sheet-desk', 'h-011-short-changes-window-desk', 'h-012-short-insights-window-phone', 'h-013-short-drawer-phone', 'h-014-short-input-sheet-phone'],
  ...['g-001-bar-viewsched-1366x800', 'g-005-bar-viewsched-844x390', 'g-007-bar-leavewar-844x390', 's-005-bar-scrolled-390x844'],
  ...['i-001-states-failed-main', 'i-002-states-repeated-main', 'i-003-states-saved-main', 'i-004-states-failed-board', 'i-006-states-saved-board'],
  ...['j-001-x01-week-desk', 'j-002-x01-board-desk', 'k-001-x01-board-phone', 'k-002-x02-week-outoforder', 'k-004-x02-board-outoforder', 'j-009-x04-week-failed', 'j-010-x04-week-reloaded', 'j-011-x04-board-failed'],
  ...['q-001-x03-before', 'q-002-x03-after-answer', 'v-001-x05-failed', 'v-002-x05-saved', 'v-003-x05-reloaded'],
  ...['n-006-x06-viewsched-menu-phone', 'n-007-x06-viewsched-insights-bottom-phone', 'n-012-x06-editsched-menu-p320', 'n-013-x06-editsched-insights-bottom-p320'],
  ...['n-014-x07-scrolled-failed-desk', 'n-015-x07-after-retry-desk', 'n-016-x07-scrolled-failed-phone', 'n-017-x07-after-retry-phone'],
  ...['q-006-x08-wide-scrolled-far', 'q-007-x08-more-menu-at-right-edge', 'q-008-x08-insights-over-board', 'q-009-x08-after-close', 'q-010-x08-phone-layout-back'],
  ...['o-001-x09-insights-final', 'z-001-x10-insights-on-unresolved', 'z-003-x10-insights-answered', 'z-005-x10-insights-off-on-again'],
  ...['w-001-x11-lw-cells-before', 'w-002-x11-lw-cells-after', 'y-001-x12-template-saved', 'y-002-x12-applied-next-week', 'y-003-x12-answer-failed', 'y-004-x12-reloaded'],
  ...['u-001-find1-board-after-TAB', 'u-002-find1-board-after-ENTER', 'u-003-find1-board-clearing-TAB', 'u-004-find1-week-after-TAB', 'u-005-find1-week-after-ENTER'],
].map(n => n + '.png'))
mkdirSync(DIR + '/not-cited', { recursive: true })
let kept = 0, moved = 0, missing = []
const files = readdirSync(DIR).filter(f => f.endsWith('.png'))
for (const f of files) { if (cited.has(f)) kept++; else { renameSync(`${DIR}/${f}`, `${DIR}/not-cited/${f}`); moved++ } }
for (const c of cited) if (!files.includes(c)) missing.push(c)
console.log({ kept, moved, missing })
