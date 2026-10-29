// The drawing check's part list for the Leave War's M5b screens (D1494, D1495): the Settings window, the Events list,
// holidays by file (the Calendar window's two buttons and an import's preview) and Management on Quals, at his PC's size
// and his iPhone's. Each state names the approved picture it is measured against (the drawing script and the picture's
// name), how the build is brought to the same screen, and its parts — each with the selector that finds it in the drawing
// (`draw`) and in the build (`build`), and what of it is compared. The drawings were drawn on this branch at 9ec918a12
// (main at 7215c5ec3 with the iPhone locked-Balances fix) by docs/mock/lw-overhaul/full-m5b-draw.mjs, its clock
// Thu 8 Jan 26 09:00 (full-lib.mjs CLOCK).
// Record the drawings:
//   cd raptor-port ; LWMOCK_OUT=<scratch> DRAWCHECK_SPEC=scripts/drawcheck/specs/lw-m5b.mjs DRAWCHECK_DIST=<that build's dist> \
//     DRAWCHECK_APPROVED=docs/mock/lw-overhaul/full/m5b DRAWCHECK_DRAWN_ON='claude/leave-war-m5b-iphone-balances-1402b7 at 9ec918a12' \
//     node --import ./scripts/drawcheck/record.mjs docs/mock/lw-overhaul/full-m5b-draw.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/lw-m5b.mjs --dist dist
import { fileURLToPath } from 'node:url'

const q = t => `[data-testid="${t}"]`
const CLOCK = new Date('2026-01-08T09:00:00+08:00')
// the people the Settings drawing has in Management (it ticked them on its own clone of the SXO column): Reaper, Anvil
const MGMT_IDS = ['dice', 'shaft']

async function signIn(page, origin) {
  await page.clock.setFixedTime(CLOCK)
  await page.goto(origin + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
}
async function toWar(page) {
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector(q('row-slipway')); await page.waitForTimeout(800)
  await page.evaluate(() => window.scrollTo(0, 0))
}
/* MANAGEMENT AS THE DRAWING HAS IT, by real presses (D608): Quals → ✎ Edit → Reaper's and Anvil's Management ticks →
   Done; then the Leave War's ⚙ → "+ Management" (whose palette opens with the add — Escape takes the palette alone) */
async function management(page) {
  await page.evaluate(() => window.go('quals')); await page.waitForSelector('#qtbl'); await page.waitForTimeout(500)
  await page.click('#qEdit'); await page.waitForTimeout(300)
  for (const id of MGMT_IDS) {
    const cell = page.locator(`#qtbl td[data-q="${id}|mgmt"]`)
    if (!(await cell.count())) return `staging: no Management cell on Quals for ${id}`
    await cell.click(); await page.waitForTimeout(150)
  }
  await page.click('#qSave'); await page.waitForTimeout(300)
  await toWar(page)
  await page.click(q('settings-open')); await page.waitForTimeout(500)
  const add = page.locator(q('gadd-q:mgmt'))
  if (!(await add.count())) return 'staging: no "+ Management" chip in Settings'
  await add.click(); await page.waitForTimeout(300)
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  if (!(await page.locator(q('settings-sheet')).isVisible())) return 'staging: Escape closed Settings, not only the palette'
}
async function holidays(page, phone) {
  await page.click(q('settings-open')); await page.waitForTimeout(500)
  await page.click(q('settings-days')); await page.waitForTimeout(900)
  if (phone) {
    const tab = page.locator('[role=tab], button').filter({ hasText: /^Holidays$/ }).first()
    if (!(await tab.count())) return 'no Holidays tab in the Calendar window on the phone'
    await tab.click(); await page.waitForTimeout(500)
  }
}
// the drawing's own sample sheet (full-m5b-draw.mjs SHEET), as a file: four holidays the year has, seven more, and one
// row whose date cannot be read
const SHEET = [
  'From,To,Name,Kind,On grid',
  '2026-01-01,2026-01-01,New Year’s Day,PH,', '2026-02-17,2026-02-18,Chinese New Year,PH,', '2026-03-21,2026-03-21,Hari Raya Puasa,PH,',
  '2026-04-03,2026-04-03,Good Friday,PH,', '2026-05-01,2026-05-01,Labour Day,PH,', '2026-05-27,2026-05-27,Hari Raya Haji,PH,',
  '2026-06-01,2026-06-01,Vesak Day (in lieu),PH,', '2026-08-09,2026-08-09,National Day,PH,', '2026-08-10,2026-08-10,National Day (in lieu),PH,',
  '8/11,,Deepavali,PH,', '2026-11-09,2026-11-09,Deepavali (in lieu),PH,', '2026-12-25,2026-12-25,Christmas Day,PH,',
].join('\r\n')
async function preview(page) {
  await page.setInputFiles(q('hol-import-file'), { name: 'holidays-2026.csv', mimeType: 'text/csv', buffer: Buffer.from(SHEET, 'utf8') })
  await page.waitForSelector(q('hol-preview')); await page.waitForTimeout(300)
}
async function holidaysInView(page) {
  await page.evaluate(() => document.querySelector('[data-testid="days-part-holidays"]')?.scrollIntoView({ block: 'start' }))
  await page.mouse.move(2, 2)
}

// ---------------------------------------------------------------- the parts
const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const LOOK = ['fill', 'edge', 'corners', 'shadow']
const S = q('settings-sheet'), G = q('group-chosen')
const settingsTop = [
  P('window', 'the Settings window', S, S, ['place', 'width', ...LOOK]),
  P('title', 'its title "SETTINGS"', `${S} .bidsheet-hd .who`, `${S} .bidsheet-hd .who`, ['place', 'words-x'], { rel: 'window' }),
  P('rows', 'the Year / Manning / Order rows', `${S} .zz-rows`, `${S} .set-rows`, ['place', 'size'], { rel: 'window' }),
  P('year-label', 'the label "Year"', `${S} .zz-rows .bidsheet-row:nth-child(1) .lab`, `${S} .set-rows .bidsheet-row:nth-child(1) .lab`, ['place', 'colour', 'words-x'], { rel: 'rows' }),
  P('calendar', 'Calendar…', q('settings-days'), q('settings-days'), ['place', 'size', ...LOOK], { rel: 'rows' }),
  P('events', 'Events…', `${S} .zz-rows .bidsheet-row:nth-child(1) button:nth-of-type(2)`, q('settings-events'), ['place', 'size', ...LOOK], { rel: 'rows' }),
  P('counter', '＋ Counter', q('counter-add'), q('counter-add'), ['place', 'size'], { rel: 'rows' }),
  P('rearrange', 'Rearrange the grid', q('settings-rearrange'), q('settings-rearrange'), ['place', 'size'], { rel: 'rows' }),
  P('reset', 'Reset order', q('roster-reset-order'), q('roster-reset-order'), ['place', 'size'], { rel: 'rows' }),
  P('groups-head', 'the heading "Groups"', `${S} .gs-sec`, `${S} .gs-sec`, ['place', 'words-x'], { rel: 'window' }),
  P('mgmt-row', 'the Management row, first', `${G} .set-grow:first-child`, q('grow-q:mgmt'), ['place', 'size'], { rel: 'window' }),
  P('mgmt-swatch', "Management's colour square", `${G} .set-grow:first-child .set-sw`, q('gcolor-q:mgmt'), ['place', 'size', 'fill'], { rel: 'mgmt-row' }),
  P('mgmt-name', "Management's name", `${G} .set-grow:first-child .set-gname`, `${q('grow-q:mgmt')} .set-gname`, ['place', 'words-x'], { rel: 'mgmt-row' }),
  P('mgmt-count', "Management's count", `${G} .set-grow:first-child .set-gct`, `${q('grow-q:mgmt')} .set-gct`, ['place', 'words-place'], { rel: 'mgmt-row' }),
  P('mgmt-x', "Management's ✕", `${G} .set-grow:first-child .set-gdel`, q('gdrop-q:mgmt'), ['place', 'size'], { rel: 'mgmt-row' }),
  P('sxo-row', 'the SXO row', q('grow-SXO'), q('grow-SXO'), ['place', 'size'], { rel: 'window' }),
  P('other-row', 'the Everyone else row, last', `${G} .set-grow:last-child`, q('grow-OTHER'), ['place', 'size'], { rel: 'window' }),
  P('other-swatch', "Everyone else's dashed square", `${G} .set-grow:last-child .set-sw`, `${q('grow-OTHER')} .set-sw`, ['place', 'size', 'edge'], { rel: 'other-row' }),
  P('other-name', "Everyone else's grey name", `${G} .set-grow:last-child .set-gname`, `${q('grow-OTHER')} .set-gname`, ['place', 'colour', 'words-x'], { rel: 'other-row' }),
  P('other-count', "Everyone else's count", `${G} .set-grow:last-child .set-gct`, `${q('grow-OTHER')} .set-gct`, ['place', 'words-place'], { rel: 'other-row' }),
  P('who-wins', 'Who wins when someone fits two', q('who-wins-toggle'), q('who-wins-toggle'), ['place', 'size'], { rel: 'window' }),
]
const settingsParts = [
  ...settingsTop,
  P('sans-chip', '"+ SANS", the first chip', `${q('group-offer')} .tchip:first-child`, q('gadd-SANS'), ['place', 'size', ...LOOK, 'words-x'], { rel: 'window' }),
]
const settingsSansParts = [
  ...settingsTop,
  P('sans-row', 'the SANS row at the foot', q('grow-SANS'), q('grow-SANS'), ['place', 'size', ...LOOK], { rel: 'window' }),
]
const H = q('days-part-holidays')
const fileParts = [
  P('part', 'the Holidays part', H, H, ['place', 'width']),
  P('list', 'the Holidays list', q('hol-list'), q('hol-list'), ['place', 'size'], { rel: 'part' }),
  P('file-row', 'Export sheet · Import sheet', `${H} .zz-filerow`, q('hol-filerow'), ['place', 'size'], { rel: 'part' }),
  P('export', 'Export sheet', `${H} .zz-filerow .docbtn:nth-child(1)`, q('hol-export'), ['place', 'size', ...LOOK, 'words-x'], { rel: 'file-row' }),
  P('import', 'Import sheet', `${H} .zz-filerow .docbtn:nth-child(2)`, q('hol-import'), ['place', 'size', ...LOOK, 'words-x'], { rel: 'file-row' }),
]
const previewParts = [
  P('part', 'the Holidays part', H, H, ['place', 'width']),
  P('preview', "the import's preview", `${H} .zz-pvbox`, q('hol-preview'), ['place', 'size'], { rel: 'part' }),
  P('head', 'the file name and counts', `${H} .zz-pvhead`, `${H} .hol-pvhead`, ['place', 'size', 'words-x'], { rel: 'preview' }),
  P('had', 'the first line already here (greyed)', `${H} .zz-pv .zz-pv-had`, `${H} .hol-pvlist .pv-had`, ['place', 'size', 'fill'], { rel: 'preview' }),
  P('new', 'the first new line', `${H} .zz-pv .zz-pv-new`, `${H} .hol-pvlist .pv-new`, ['place', 'size'], { rel: 'preview' }),
  P('new-tag', 'its "new" in cyan', `${H} .zz-pv .zz-pv-new .zz-st`, `${H} .hol-pvlist .pv-new .hol-pvst`, ['words-place', 'colour'], { rel: 'new' }),
  P('bad', 'the line not read', `${H} .zz-pv .zz-pv-bad`, `${H} .hol-pvlist .pv-bad`, ['place', 'size'], { rel: 'preview' }),
  P('bad-why', 'its reason, in red', `${H} .zz-pv .zz-pv-bad .zz-why`, `${H} .hol-pvlist .pv-bad .hol-pvwhy`, ['place', 'colour', 'words-x'], { rel: 'bad' }),
  P('cancel', 'Cancel', `${H} .zz-pvfoot .abtn:not(.primary)`, q('hol-pv-cancel'), ['place', 'size', ...LOOK], { rel: 'preview' }),
  P('add', 'Add 7 holidays', `${H} .zz-pvfoot .abtn.primary`, q('hol-pv-add'), ['place', 'size', ...LOOK], { rel: 'preview' }),
]
const qualsParts = [
  P('sxo-head', 'the SXO heading', '#qtbl thead th[data-sort="sxo"]', '#qtbl thead th[data-sort="sxo"]', ['place', 'size']),
  // its look without 'shadow': the drawing marked the new heading with its own pink ring (an inset shadow — full-m5b-draw.mjs
  // part 4), the drawing's pointer at the change, not part of the design
  P('mgmt-head', 'the MANAGEMENT heading, beside SXO', '#qtbl thead th[data-sort="sxo"] + th', '#qtbl thead th[data-sort="mgmt"]', ['place', 'size', 'fill', 'edge', 'corners'], { rel: 'sxo-head' }),
  P('mgmt-anvil', "Anvil's Management tick", '#qtbl td[data-q="shaft|sxo"] + td', '#qtbl td[data-q="shaft|mgmt"]', ['place', 'size', 'words-place'], { rel: 'mgmt-head' }),
]

const D = 'docs/mock/lw-overhaul/full-m5b-draw.mjs'
export default {
  name: 'Leave War M5b',
  slug: 'lw-m5b',
  records: fileURLToPath(new URL('../../../docs/mock/lw-overhaul/drawcheck/m5b/', import.meta.url)),
  states: [
    { id: 'settings-desk', title: 'Settings, desktop, admin', drawing: { script: D, shot: 'm5b-d1-settings-desk' },
      async reach(page, { origin }) { await signIn(page, origin); return management(page) }, parts: settingsParts },
    { id: 'settings-phone', title: 'Settings, iPhone, admin', phone: true, drawing: { script: D, shot: 'm5b-d1-settings-phone' },
      async reach(page, { origin }) { await signIn(page, origin); return management(page) }, parts: settingsParts },
    { id: 'settings-desk-sans', title: 'Settings with SANS added, desktop, admin', drawing: { script: D, shot: 'm5b-d1-settings-desk-sans' },
      async reach(page, { origin }) {
        await signIn(page, origin)
        const why = await management(page); if (why) return why
        await page.click(q('gadd-SANS')); await page.waitForTimeout(500)
      }, parts: settingsSansParts },
    // (the Events list's two states left on 29 Oct 26: D1516's redraw superseded their round-1 drawing; the list is measured
    //  against the redraw by lw-m5b-events.mjs — their old records stay in the records folder, unread)
    { id: 'holidays-buttons-desk', title: 'Export sheet and Import sheet, desktop, admin', drawing: { script: D, shot: 'm5b-d3-holidays-buttons-desk' },
      async reach(page, { origin }) { await signIn(page, origin); await toWar(page); const w = await holidays(page, false); if (w) return w; await holidaysInView(page) }, parts: fileParts },
    { id: 'holidays-buttons-phone', title: 'Export sheet and Import sheet, iPhone, admin', phone: true, drawing: { script: D, shot: 'm5b-d3-holidays-buttons-phone' },
      async reach(page, { origin }) { await signIn(page, origin); await toWar(page); const w = await holidays(page, true); if (w) return w; await holidaysInView(page) }, parts: fileParts },
    { id: 'holidays-preview-desk', title: "An import's preview, desktop, admin", drawing: { script: D, shot: 'm5b-d3-holidays-preview-desk' },
      async reach(page, { origin }) { await signIn(page, origin); await toWar(page); const w = await holidays(page, false); if (w) return w; await preview(page); await holidaysInView(page) }, parts: previewParts },
    { id: 'holidays-preview-phone', title: "An import's preview, iPhone, admin", phone: true, drawing: { script: D, shot: 'm5b-d3-holidays-preview-phone' },
      async reach(page, { origin }) { await signIn(page, origin); await toWar(page); const w = await holidays(page, true); if (w) return w; await preview(page); await holidaysInView(page) }, parts: previewParts },
    { id: 'quals-desk', title: 'Management on Quals, desktop, admin', drawing: { script: D, shot: 'm5b-d4-quals-desk' },
      async reach(page, { origin }) {
        await signIn(page, origin)
        await page.evaluate(() => window.go('quals')); await page.waitForSelector('#qtbl'); await page.waitForTimeout(500)
        await page.click('#qEdit'); await page.waitForTimeout(300)
        for (const id of MGMT_IDS) { await page.click(`#qtbl td[data-q="${id}|mgmt"]`); await page.waitForTimeout(150) }
        await page.click('#qSave'); await page.waitForTimeout(800)
      }, parts: qualsParts },
  ],
  // the differences he has ruled to keep as built — none yet
  accepted: [],
}
