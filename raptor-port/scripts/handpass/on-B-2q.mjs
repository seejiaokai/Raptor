// B2: phone 390x844 touch, on the Scheduler Board (the week's populated row cannot be armed by a finger)
import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(FRI, { type: 'Training', people: ['bane', 'harpoon'], from: '09:00', to: '12:00', title: 'Fri brief' })
await makeHoliday(w); await press(tid('odl-later')); await sleep(400); await closeCal(w)
await page.evaluate(() => window.go('editsched')); await sleep(800)
await page.evaluate(() => window.openScheduler(4)); await sleep(900)
const rows = page.locator('#schedBoard .sb-arow')
const el = async () => { const idx = await rows.evaluateAll(els => els.findIndex(e => /fri brief/i.test((e.querySelector('textarea.ain, input.ain') || {}).value || ''))); return rows.nth(idx) }
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#sbUndo'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
const state = () => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return JSON.stringify({ people: (r.people || []).map(p => (window.PEOPLE[p.p] || {}).cs), oil: r.oil || null }) }, iid)
const armInfo = () => page.evaluate(() => ({ rosArm: !!document.querySelector('.ros-arm'), armTxt: (document.querySelector('.ros-arm')?.innerText || '').replace(/\s+/g, ' ').slice(0, 60), rosOpen: document.body.classList.contains('ros-open') || !!document.querySelector('.sb-ros.open, .sb-ros.on') }))
const s0 = { st: await state(), undo: await undoLabel() }
log('before', s0)
const tally = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Tally'))
const tl = page.locator(`#sbRoster .rpuck .puck[data-person="${tally}"]`)
const armPlace = async () => {
  const e = await el(); await e.evaluate(x => x.scrollIntoView({ block: 'center' })); await sleep(400)
  const ab = await e.locator('.addz').first().boundingBox()
  await page.touchscreen.tap(ab.x + ab.width / 2, ab.y + ab.height / 2); await sleep(900)
}
const tapTally = async () => {
  if (!(await armInfo()).rosOpen) { await page.locator('.sb-ros .ros-tab').tap(); await sleep(700) }
  await tl.first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await tl.first().tap(); await sleep(800)
}
await armPlace()
const a0 = await armInfo(); log('after tap + add', a0)
await w.shot('B2-2-board-armed')
await tapTally()
const q = { up: await tid('oilconf').count() }
q.lead = await tid('oilconf-lead').innerText().catch(() => ''); q.cancel = await tid('oilconf-cancel').innerText().catch(() => ''); q.save = await tid('oilconf-save').innerText().catch(() => '')
q.saveDisabled = await tid('oilconf-save').isDisabled().catch(() => null)
q.box = await w.measure('[data-testid="oilconf"] .airpop-box'); q.saveBox = await w.measureT('oilconf-save'); q.cancelBox = await w.measureT('oilconf-cancel')
q.head = (await page.locator('[data-testid="oilconf"] .airpop-head b').innerText().catch(() => ''))
await w.hush(); await w.shot('B2-3-question'); await w.unhush()
rec('B2-question', q)
// ---- Escape
await page.keyboard.press('Escape'); await sleep(600)
const r1 = { q: await tid('oilconf').count(), armed: await armInfo(), bar: await tid('oilbar-text').innerText().catch(() => ''), st: await state(), undoSame: (await undoLabel()) === s0.undo, barBox: await w.measureT('oilbar') }
await w.shot('B2-4-after-escape')
rec('B2-escape', r1)
if (await tid('oilbar-ok').count()) await press(tid('oilbar-ok')); await sleep(300)
log('armed after OK', await armInfo())
// ---- the X
await tapTally()
const xs = page.locator('[data-testid="oilconf"] .airpop-head .airpop-x, [data-testid="oilconf"] .airpop-head button, [data-testid="oilconf"] .airpop-head [aria-label]')
log('x candidates', await xs.count(), (await page.evaluate(() => document.querySelector('[data-testid="oilconf"] .airpop-head')?.innerHTML.slice(0, 300))))
if (await xs.count()) { await xs.first().tap(); await sleep(600) }
const r2 = { q: await tid('oilconf').count(), armed: await armInfo(), bar: await tid('oilbar-text').innerText().catch(() => ''), st: await state(), undoSame: (await undoLabel()) === s0.undo }
await w.shot('B2-5-after-x')
rec('B2-x', r2)
if (await tid('oilbar-ok').count()) await press(tid('oilbar-ok')); await sleep(300)
// ---- No -> Add
await tapTally()
await press(tid('oil-no')); await sleep(200)
const saveLive = !(await tid('oilconf-save').isDisabled())
await press(tid('oilconf-save')); await sleep(900)
const r3 = { saveLive, toast: await w.toast(), armed: await armInfo(), st: await state(), q: await tid('oilconf').count(), bar: await tid('oilbar').count(), undo: await undoLabel() }
await w.shot('B2-6-after-no-add')
rec('B2-no-add', r3)
await press(page.locator('#sbUndo')); await sleep(700)
rec('B2-undo', { st: await state(), same: (await state()) === s0.st })
await done(w); process.exit(0)
