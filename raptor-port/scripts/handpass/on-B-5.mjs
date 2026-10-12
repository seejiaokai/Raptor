// B5: 390x844 phone — Later, then Warden's bell, the line, the list over the page, one Yes + Save, the line counts one fewer
import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press, VW, VH } = w
await page.setViewportSize({ width: 1440, height: 900 })
await page.evaluate(() => window.go('admin'))
const row = page.locator('.acc-row[data-person="nact"]').first()
await row.locator('.acc-tap').evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
await page.locator('#accGiveName').fill('warden')
await page.selectOption('#accGiveRole', 'admin')
await page.locator('#accGive').evaluate(e => e.click())
await page.waitForTimeout(300)
log('Warden admin sign-in', await page.locator('.acc-row[data-person="nact"][data-acct]').count())
await page.setViewportSize({ width: VW, height: VH })
const ON_FRI = [
  { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' },
  { type: 'Duty', people: ['harpoon'], title: 'Gate duty' },
  { type: 'Meeting', people: ['mamba'], from: '14:00', to: '15:00', title: 'Safety board' },
]
const ids = []
for (const s of ON_FRI) ids.push(await w.fileIt(FRI, s))
const up = await makeHoliday(w); log('list up', up)
const L = '[data-testid="win-oilday"]'
const R = {}
R.listCount = (await tid('odl-count').innerText()).trim()
await w.shot('B5-1-list-saber')
await press(tid('odl-later')); await sleep(400)
R.laterWritten = await page.evaluate(ids => ids.map(i => (window.INPUTS.find(r => r.iid === i) || {}).oil || null), ids)
await closeCal(w)
// Saber's own bell (before changing person)
R.saberBellLit = await page.locator('.bellbtn.on:visible').count()
await page.evaluate(() => window.raptorMe('nact')); await sleep(500)
R.wardenBellLit = await page.locator('.bellbtn.on:visible').count()
R.bellBtn = await w.measure('.bellbtn.on')
await w.shot('B5-2-warden-bell-lit')
await press(page.locator('.bellbtn:visible').first()); await sleep(500)
R.listUp = await tid('bell-list').count()
R.line = (await page.locator('[data-testid="bell-list"] .bl-line').first().innerText()).replace(/\s+/g, ' ')
R.lineCount = await page.locator('[data-testid="bell-list"] .bl-line').count()
R.lineBox = await w.measure('[data-testid="bell-list"] .bl-line'); R.bellBox = await w.measureT('bell-list')
await w.shot('B5-3-bell-open')
await press(page.locator('[data-testid="bell-list"] .bl-line').first()); await sleep(600)
R.listOpen = await page.locator(L).count(); R.bellClosed = (await tid('bell-list').count()) === 0
R.leadAbsent = (await tid('odl-lead').count()) === 0
R.winBox = await w.measure(L)
R.count0 = (await tid('odl-count').innerText()).trim()
R.title = (await page.locator(`${L} .win-ttl`).innerText()).replace(/\s+/g, ' ')
await w.shot('B5-4-list-over-page')
await press(tid(`odl-yes-${ids[0]}`)); await sleep(250)
R.count1 = (await tid('odl-count').innerText()).trim()
R.saveLive = !(await tid('odl-save').isDisabled())
await w.hush(); await w.shot('B5-5-yes-picked'); await w.unhush()
await press(tid('odl-save')); await sleep(600)
R.closed = (await page.locator(L).count()) === 0
R.written = await page.evaluate(ids => ids.map(i => (window.INPUTS.find(r => r.iid === i) || {}).oil || null), ids)
R.bellLitAfter = await page.locator('.bellbtn.on:visible').count()
await press(page.locator('.bellbtn:visible').first()); await sleep(500)
R.line2 = (await page.locator('[data-testid="bell-list"] .bl-line').first().innerText().catch(() => '')).replace(/\s+/g, ' ')
await w.hush(); await w.shot('B5-6-bell-after'); await w.unhush()
// Undo button of Warden
R.undo = await page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
rec('B5', R)
await done(w); process.exit(0)
