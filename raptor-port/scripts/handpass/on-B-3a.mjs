// B3: armed tap swap — usual Saturday, phone 390x844, on the board (arg 'board') or the week (arg 'week')
import { world, done, log, rec, sleep, SAT_DI } from './on-B-lib.mjs'
const MODE = process.argv[2] || 'board'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.usualSat()
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#sbUndo') || document.querySelector('#undoBtn'); const v = b && b.getBoundingClientRect().width ? b : document.querySelector('#undoBtn'); return v ? `${v.disabled ? 'off' : 'on'}|${v.title}` : '' })
const armInfo = () => page.evaluate(() => ({ rosArm: !!document.querySelector('.ros-arm'), armTxt: (document.querySelector('.ros-arm')?.innerText || '').replace(/\s+/g, ' ').slice(0, 60), rosOpen: !!document.querySelector('.sb-ros.open, .sb-ros.on') || document.body.classList.contains('ros-open') }))
const hex = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Hex'))
let rangerPuck, drawerPuck, closeDrawerTab, openTab
if (MODE === 'week') {
  await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await sleep(300)
  await page.evaluate(() => window.go('editsched')); await sleep(800)
  const day = page.locator('#page-editsched .day:not(.peek)').nth(SAT_DI)
  rangerPuck = day.locator('.pl-row').filter({ has: page.locator('.nm .ntx', { hasText: /range brief/i }) }).locator('.puck[data-person="bane"]').first()
  drawerPuck = () => page.locator(`#eRoster .rpuck .puck[data-person="${hex}"]`).first()
  openTab = page.locator('#rosTab')
} else {
  rangerPuck = page.locator(`#sbBoard [data-slot="g:${SAT_DI}.0"] .puck`).first()
  drawerPuck = () => page.locator(`#sbRoster .rpuck .puck[data-person="${hex}"]`).first()
  openTab = page.locator('.sb-ros .ros-tab')
}
const state = () => page.evaluate(() => JSON.stringify((window.DAYS[5].ground || []).map(r => `${r.prog}: ${[r.who, ...(r.more || [])].filter(Boolean).map(x => (window.PEOPLE[x] || {}).cs || x).join('+')}`)))
await rangerPuck.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
const s0 = { st: await state(), undo: await undoLabel(), oil: await w.oilOf(iid) }
log('before', s0)
await rangerPuck.tap(); await sleep(900)
const a0 = await armInfo(); log('after tapping Ranger puck', a0)
await w.shot(`B3-1-${MODE}-armed`)
const tapHex = async () => {
  if (!(await armInfo()).rosOpen) { await openTab.tap(); await sleep(800) }
  const p = drawerPuck(); await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await p.tap(); await sleep(900)
}
await tapHex()
const q = { up: await tid('oilconf').count(), lead: await tid('oilconf-lead').innerText().catch(() => ''), cancel: await tid('oilconf-cancel').innerText().catch(() => ''), save: await tid('oilconf-save').innerText().catch(() => ''), box: await w.measure('[data-testid="oilconf"] .airpop-box'), saveBox: await w.measureT('oilconf-save'), nothing: (await state()) === s0.st }
await w.hush(); await w.shot(`B3-2-${MODE}-question`); await w.unhush()
rec(`B3-${MODE}-question`, q)
await page.keyboard.press('Escape'); await sleep(600)
const r1 = { q: await tid('oilconf').count(), armed: await armInfo(), bar: await tid('oilbar-text').innerText().catch(() => ''), st: await state(), undoSame: (await undoLabel()) === s0.undo, oilSame: (await w.oilOf(iid)) === s0.oil, barBox: await w.measureT('oilbar') }
await w.shot(`B3-3-${MODE}-cancelled`)
rec(`B3-${MODE}-cancel`, r1)
// Answer OIL: the question comes back with the same swap
let viaBar = false
if (await tid('oilbar-answer').count()) { await press(tid('oilbar-answer')); await sleep(500); viaBar = (await tid('oilconf').count()) === 1 }
if (!viaBar) { if (await tid('oilbar-ok').count()) await press(tid('oilbar-ok')); await tapHex() }
log('question back via the bar', viaBar, await tid('oilconf-lead').innerText().catch(() => ''))
await press(tid('oil-yes')); await sleep(200)
await press(tid('oilconf-save')); await sleep(900)
const r3 = { toast: await w.toast(), armed: await armInfo(), st: await state(), oil: await w.oilOf(iid), q: await tid('oilconf').count(), bar: await tid('oilbar').count(), undo: await undoLabel() }
await w.shot(`B3-4-${MODE}-after`)
rec(`B3-${MODE}-answered`, r3)
// Ranger off the schedule that day?
rec(`B3-${MODE}-ranger-elsewhere`, await page.evaluate(() => { const hits = []; const d = window.DAYS[5]; const walk = (o, path) => { if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], path + '.' + k); else if (o === 'bane') hits.push(path) }; walk(d, 'd'); return hits }))
await (await page.locator('#sbUndo').isVisible().catch(() => false) ? page.locator('#sbUndo') : page.locator('#undoBtn')).tap(); await sleep(700)
rec(`B3-${MODE}-undo`, { st: await state(), same: (await state()) === s0.st && (await w.oilOf(iid)) === s0.oil })
await done(w); process.exit(0)
