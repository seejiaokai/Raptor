// B4: the one list and the bell's list on a short screen. arg: p568 | l390
import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal, SIZES } from './on-B-lib.mjs'
const SZ = process.argv[2] || 'p568'
const w = await world(SZ)
const { page, tid, press, VW, VH } = w
const BIG = { width: 390, height: 844 }
// SETUP at the phone's full size (Admin -> Users, then the filing): Warden an admin sign-in
await page.setViewportSize({ width: 1440, height: 900 })
await page.evaluate(() => window.go('admin'))
const row = page.locator('.acc-row[data-person="nact"]').first()
await row.locator('.acc-tap').evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
await page.locator('#accGiveName').fill('warden')
await page.selectOption('#accGiveRole', 'admin')
await page.locator('#accGive').evaluate(e => e.click())
await page.waitForTimeout(300)
log('Warden has an admin sign-in', await page.locator('.acc-row[data-person="nact"][data-acct]').count())
await page.setViewportSize(BIG)
const ON_FRI = [
  { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' },
  { type: 'Duty', people: ['harpoon'], title: 'Gate duty' },
  { type: 'Meeting', people: ['mamba'], from: '14:00', to: '15:00', title: 'Safety board' },
  { type: 'Meeting', people: ['nick'], from: '15:30', to: '16:30', title: 'Tally meet' },
]
const ids = []
for (const s of ON_FRI) ids.push(await w.fileIt(FRI, s))
log('filed', ids)
await page.setViewportSize({ width: VW, height: VH }); await sleep(400)
// the holiday, at the short size
const up = await makeHoliday(w)
log('list up', up)
const L = '[data-testid="win-oilday"]'
const R = {}
if (up) {
  R.title = (await page.locator(`${L} .win-ttl`).innerText()).replace(/\s+/g, ' ')
  R.count = (await tid('odl-count').innerText()).trim()
  R.cards = await page.locator(`${L} .icard`).count()
  R.win = await w.measure(L)
  R.later = await w.measureT('odl-later'); R.save = await w.measureT('odl-save'); R.yesall = await w.measureT('odl-yesall'); R.noall = await w.measureT('odl-noall')
  R.lead = await tid('odl-lead').innerText()
  R.scroll = await page.evaluate(L => { const win = document.querySelector(L); const out = []; win.querySelectorAll('*').forEach(e => { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 2) out.push({ cls: e.className.toString().slice(0, 40), sh: e.scrollHeight, ch: e.clientHeight }) }); return out }, L)
  R.pageScroll0 = await page.evaluate(() => [window.scrollY, document.scrollingElement.scrollTop])
  await w.shot(`B4-${SZ}-1-list`)
  // scroll the cards inside it; the last card's Yes reachable
  const sc = await page.evaluate(L => { const win = document.querySelector(L); const e = [...win.querySelectorAll('*')].find(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 2); if (!e) return null; e.scrollTop = e.scrollHeight; return { top: e.scrollTop, sh: e.scrollHeight, ch: e.clientHeight } }, L)
  R.scrolled = sc; await sleep(300)
  await w.shot(`B4-${SZ}-2-list-scrolled`)
  // Yes to all: reachable & tappable
  R.yesallHit = await w.measureT('odl-yesall')
  await press(tid('odl-yesall')); await sleep(300)
  R.afterYesAll = (await tid('odl-count').innerText()).trim()
  R.saveLive = !(await tid('odl-save').isDisabled())
  R.pageScroll1 = await page.evaluate(() => [window.scrollY, document.scrollingElement.scrollTop])
  await w.shot(`B4-${SZ}-3-yesall`)
  R.laterAfter = await w.measureT('odl-later'); R.saveAfter = await w.measureT('odl-save')
  // un-pick: No to all then Later
  await press(tid('odl-noall')); await sleep(200)
  R.afterNoAll = (await tid('odl-count').innerText()).trim()
  await press(tid('odl-later')); await sleep(400)
  R.laterClosed = (await page.locator(L).count()) === 0
  R.nothingWritten = await page.evaluate(ids => ids.every(i => !(window.INPUTS.find(r => r.iid === i) || {}).oil), ids)
}
rec(`B4-${SZ}-list`, R)
// the bell's list (Warden, in place)
await closeCal(w)
await page.evaluate(() => window.raptorMe('nact')); await sleep(500)
const B = {}
B.lit = await page.locator('.bellbtn.on:visible').count()
B.btn = await w.measure('.bellbtn.on')
await press(page.locator('.bellbtn:visible').first()); await sleep(500)
B.listUp = await tid('bell-list').count()
if (B.listUp) {
  B.box = await w.measureT('bell-list')
  B.line = await w.measure('[data-testid="bell-list"] .bl-line')
  B.lineText = (await page.locator('[data-testid="bell-list"] .bl-line').first().innerText()).replace(/\s+/g, ' ')
  await w.shot(`B4-${SZ}-4-bell`)
  await press(page.locator('[data-testid="bell-list"] .bl-line').first()); await sleep(600)
  B.openedList = await page.locator(L).count()
  B.bellGone = await tid('bell-list').count()
  if (B.openedList) { B.winB = await w.measure(L); B.leadAbsent = (await tid('odl-lead').count()) === 0; await w.shot(`B4-${SZ}-5-list-from-bell`) }
}
rec(`B4-${SZ}-bell`, B)
await done(w); process.exit(0)
