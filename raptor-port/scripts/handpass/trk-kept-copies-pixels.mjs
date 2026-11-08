/* CHAT 20 — [TRK-KEPT-COPIES] (8 Nov 26): pictures of every Tracker screen that draws the icons and colours the Tracker
   used to keep its own copies of (the pencil, Reorder, the gear, Reset, the list, the magnifier, and its page colours),
   at a desktop (Chromium 1536×864) and a phone (WebKit, 402×874, touch). Run once on the build BEFORE the merge and once
   AFTER it, each into its own folder; trk-kept-copies-compare.mjs then compares the two folders pixel for pixel.
   Every world is fresh (a new browser context, the demo data), the clock set to one start time and left running, carets
   hidden and motion stopped for each picture, so two runs of the SAME build give the same pictures (proved first).
   From raptor-port/:  HP_URL=http://localhost:4362 PIX_OUT=<folder> [ONLY=d01,p03] node scripts/handpass/trk-kept-copies-pixels.mjs
   Version line: kcpix v1. */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
console.log('kcpix v1')
process.env.C9_RESULTS ||= resolve(process.env.PIX_OUT || '.', '..', 'unused-results.json')
const L = await import('./trk-chat9-lib.mjs')
const { mkWorld, closeW, closeAll, geo, land, sleep, PHONE, PC } = L

const OUT = process.env.PIX_OUT
if (!OUT) { console.error('set PIX_OUT to the folder for this run'); process.exit(2) }
mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) if (f.endsWith('.png')) rmSync(resolve(OUT, f))   /* one run, one folder */
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const CLOCK = '2026-11-08T09:00:00+08:00'
const log = []

const press = async (w, sel) => {
  const l = w.page.locator(sel).filter({ visible: true }).first()
  if (w.touch) await l.tap({ timeout: 8000 }); else await l.click({ timeout: 8000 })
  await sleep(600)
}
const shot = async (w, name) => {
  await sleep(400)
  await w.page.screenshot({ path: resolve(OUT, name + '.png'), animations: 'disabled', caret: 'hide' })
  log.push({ name, errors: w.errors.slice() })
  console.log(' pic ' + name + (w.errors.length ? '  errors: ' + w.errors.join(' | ') : ''))
}
const tabTo = async (w, word) => {
  const t = w.page.locator('#viewtabs button').filter({ hasText: new RegExp(word) }).first()
  if (await t.count()) { await t.tap(); await sleep(700) }
}
const openPop = async (w, id = 'ACG-09') => {
  const g = await land(w, id)
  if (w.touch) await w.page.touchscreen.tap(g.ball.x, g.ball.y); else await w.page.mouse.click(g.ball.x, g.ball.y)
  await sleep(1600)
}

/* each state: [name, setup] — the world is fresh for each */
const DESK = [
  ['d01-landing', async () => {}],
  ['d02-course-menu', async w => press(w, '#courseMenuBtn')],
  ['d03-syllabus-menu', async w => press(w, '#sylMenuBtn')],
  ['d04-file-menu', async w => press(w, '#fileMenuBtn')],
  ['d05-find-typed', async w => { await w.page.locator('#hSearch').click(); await L.typeFind(w.page, 'ACG') }],
  ['d06-show-all', async w => press(w, '#showAllBtn')],
  ['d07-show-all-filtered', async w => { await press(w, '#showAllBtn'); await w.page.locator('#saSearch').fill('TR'); await sleep(500) }],
  ['d08-marking-window', async w => openPop(w)],
  ['d09-reorder-courses', async w => { await press(w, '#courseMenuBtn'); await press(w, '#ordCourse') }],
  ['d10-reorder-syllabi', async w => { await press(w, '#sylMenuBtn'); await press(w, '#ordSyl') }],
  ['d11-reorder-crew', async w => press(w, '#ordCrew')],
  ['d12-edit-chart-layout', async w => { await press(w, '#sylMenuBtn'); await press(w, '#arrangeBtn') }],
  ['d13-flex-settings', async w => press(w, '#flexBtn')],
  ['d14-legend', async w => press(w, '#legendBtn')],
  ['d15-details-bubble', async w => {
    await press(w, '#detailsBtn')
    const g = await geo(w.page, 'ACG-09'); await w.page.mouse.move(g.ball.x, g.ball.y); await sleep(700)
  }],
  ['d16-export-window', async w => { await press(w, '#fileMenuBtn'); await press(w, '#exportBtn, #copyBtn, button:has-text("Export")') }],
  ['d17-hover-menu-row', async w => { await press(w, '#courseMenuBtn'); await w.page.locator('#ordCourse').hover(); await sleep(400) }],
]
const PHONEST = [
  ['p01-landing', async () => {}],
  ['p02-course-menu', async w => press(w, '#courseMenuBtn')],
  ['p03-syllabus-menu', async w => press(w, '#sylMenuBtn')],
  ['p04-file-menu', async w => press(w, '#fileMenuBtn')],
  ['p05-find-typed', async w => { await press(w, '#hSearchBtn'); await L.typeFind(w.page, 'ACG') }],
  ['p06-info-tab', async w => tabTo(w, 'Info')],
  ['p07-show-all-tab', async w => tabTo(w, 'Show All')],
  ['p08-marking-window', async w => openPop(w)],
  ['p09-reorder-courses', async w => { await press(w, '#courseMenuBtn'); await press(w, '#ordCourse') }],
  ['p10-reorder-syllabi', async w => { await press(w, '#sylMenuBtn'); await press(w, '#ordSyl') }],
  ['p11-edit-chart-layout', async w => { await press(w, '#sylMenuBtn'); await press(w, '#arrangeBtn') }],
  ['p12-flex-settings', async w => press(w, '#flexBtn')],
  ['p13-legend', async w => press(w, '#legendBtn')],
  ['p14-info-tab-lower', async w => { await tabTo(w, 'Info'); await w.page.evaluate(() => { const s = document.querySelector('.side, #side, .sidepanel'); if (s) s.scrollTop = 99999 }); await sleep(500) }],
]

async function run(list, opts) {
  for (const [name, setup] of list) {
    if (ONLY.length && !ONLY.some(o => name.startsWith(o))) continue
    const w = await mkWorld({ ...opts, clock: CLOCK })
    try { await setup(w); await shot(w, name) } catch (e) { console.log(' NOTRUN ' + name + ': ' + String(e.message).split('\n')[0]); log.push({ name, notrun: String(e.message).split('\n')[0] }) }
    await closeW(w)
  }
}
await run(DESK, { size: PC })
await run(PHONEST, { size: PHONE, touch: true, engine: 'webkit', dpr: 2 })
await closeAll()
writeFileSync(resolve(OUT, 'run-log.json'), JSON.stringify(log, null, 1))
console.log('done: ' + log.filter(x => !x.notrun).length + ' pictures, ' + log.filter(x => x.notrun).length + ' not run')
