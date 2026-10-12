// B3: armed tap swap — usual Saturday, phone 390x844; board or week. Literal order first (puck, then drawer man), then the order that works.
import { world, done, log, rec, sleep, SAT_DI } from './on-B-lib.mjs'
const MODE = process.argv[2] || 'board'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.usualSat()
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#sbUndo'); const v = b && b.getBoundingClientRect().width ? b : document.querySelector('#undoBtn'); return v ? `${v.disabled ? 'off' : 'on'}|${v.title}` : '' })
const drawerOpen = () => page.evaluate(() => { const r = document.querySelector('#sbRoster, #eRoster'); const rs = [...document.querySelectorAll('#sbRoster, #eRoster')].map(e => e.getBoundingClientRect()); return rs.some(b => b.width > 0 && b.left < innerWidth - 20 && b.right > 0) })
const sel = () => page.evaluate(() => ({ selected: [...document.querySelectorAll('.puck.sel, .puck.selected, .seat.sel, .puck.picked')].length, oktake: document.querySelectorAll('.oktake, .oktake-f').length, rosArm: !!document.querySelector('.ros-arm') }))
const hex = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Hex'))
let rangerPuck, drawerPuck, openTab
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
const scrollR = async () => { await rangerPuck.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400) }
const closeDrawer = async () => { if (await drawerOpen()) { await openTab.tap(); await sleep(800) } }
await scrollR()
const s0 = { st: await state(), undo: await undoLabel(), oil: await w.oilOf(iid) }
log('before', s0)
// (1) the literal order
await rangerPuck.tap(); await sleep(800)
log('literal 1: tapped Ranger puck', await sel())
await openTab.tap(); await sleep(800)
const p = drawerPuck(); await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await p.tap(); await sleep(900)
const lit = { questionUp: await tid('oilconf').count(), sel: await sel(), st: (await state()) === s0.st }
rec(`B3-${MODE}-literal-order`, lit)
await w.shot(`B3-1-${MODE}-literal-order`)
// (2) the order that works: the man chosen (he is selected now), the drawer put away, a tap on Ranger's puck
await closeDrawer(); await scrollR()
await w.shot(`B3-2-${MODE}-hex-selected`)
await rangerPuck.tap(); await sleep(900)
const q = { up: await tid('oilconf').count(), lead: await tid('oilconf-lead').innerText().catch(() => ''), cancel: await tid('oilconf-cancel').innerText().catch(() => ''), save: await tid('oilconf-save').innerText().catch(() => ''), saveDisabled: await tid('oilconf-save').isDisabled().catch(() => null), box: await w.measure('[data-testid="oilconf"] .airpop-box'), saveBox: await w.measureT('oilconf-save'), nothing: (await state()) === s0.st, undoSame: (await undoLabel()) === s0.undo }
await w.hush(); await w.shot(`B3-3-${MODE}-question`); await w.unhush()
rec(`B3-${MODE}-question`, q)
await page.keyboard.press('Escape'); await sleep(700)
const r1 = { q: await tid('oilconf').count(), sel: await sel(), drawer: await drawerOpen(), bar: await tid('oilbar-text').innerText().catch(() => ''), st: (await state()) === s0.st, undoSame: (await undoLabel()) === s0.undo, oilSame: (await w.oilOf(iid)) === s0.oil, barBox: await w.measureT('oilbar') }
await w.shot(`B3-4-${MODE}-cancelled`)
rec(`B3-${MODE}-cancel`, r1)
let viaBar = false
if (await tid('oilbar-answer').count()) { await press(tid('oilbar-answer')); await sleep(600); viaBar = (await tid('oilconf').count()) === 1 }
log('question back via the bar', viaBar, await tid('oilconf-lead').innerText().catch(() => ''))
await press(tid('oil-yes')); await sleep(200)
await press(tid('oilconf-save')); await sleep(900)
const r3 = { toast: await w.toast(), sel: await sel(), drawer: await drawerOpen(), st: await state(), oil: await w.oilOf(iid), q: await tid('oilconf').count(), bar: await tid('oilbar').count(), undo: await undoLabel() }
await w.shot(`B3-5-${MODE}-after`)
rec(`B3-${MODE}-answered`, r3)
rec(`B3-${MODE}-ranger-elsewhere`, await page.evaluate(() => { const hits = []; const walk = (o, path) => { if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], path + '.' + k); else if (o === 'bane') hits.push(path) }; walk(window.DAYS[5], 'd'); return hits }))
const ub = (await page.locator('#sbUndo').isVisible().catch(() => false)) ? page.locator('#sbUndo') : page.locator('#undoBtn')
await ub.tap(); await sleep(700)
rec(`B3-${MODE}-undo`, { st: await state(), same: (await state()) === s0.st && (await w.oilOf(iid)) === s0.oil })
await done(w); process.exit(0)
