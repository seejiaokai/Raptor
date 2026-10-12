// B3: (a) tap Ranger's puck, then tap Tally's puck (armed-tap swap); (b) crew-list man by touch drag onto Ranger's puck. Phone 390x844, board.
import { world, done, log, rec, sleep, SAT_DI } from './on-B-lib.mjs'
const PART = process.argv[2] || 'a'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.usualSat()
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#sbUndo'); const v = b && b.getBoundingClientRect().width ? b : document.querySelector('#undoBtn'); return v ? `${v.disabled ? 'off' : 'on'}|${v.title}` : '' })
const drawerOpen = () => page.evaluate(() => [...document.querySelectorAll('#sbRoster')].some(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.left < innerWidth - 20 && b.right > 0 }))
const sel = () => page.evaluate(() => ({ selected: [...document.querySelectorAll('#sbBoard .puck')].filter(p => getComputedStyle(p).backgroundColor.replace(/\s/g, '') === 'rgb(10,132,255)' || /\bsel/.test(p.className)).map(p => p.textContent.trim().slice(0, 8)), oktake: document.querySelectorAll('#sbBoard .oktake, #sbBoard .oktake-f').length }))
const state = () => page.evaluate(() => JSON.stringify((window.DAYS[5].ground || []).map(r => `${r.prog}: ${[r.who, ...(r.more || [])].filter(Boolean).map(x => (window.PEOPLE[x] || {}).cs || x).join('+')}`)))
const rangerPuck = page.locator(`#sbBoard [data-slot="g:${SAT_DI}.0"] .puck`).first()
const tallyPuck = page.locator(`#sbBoard [data-slot="g:${SAT_DI}.1"] .puck`).first()
await rangerPuck.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
const s0 = { st: await state(), undo: await undoLabel(), oil: await w.oilOf(iid) }
log('before', s0)
let q
if (PART === 'a') {
  await rangerPuck.tap(); await sleep(700)
  log('tapped Ranger', await sel()); await w.shot('B3a-1-ranger-selected')
  await tallyPuck.tap(); await sleep(900)
} else {
  const hex = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Hex'))
  await page.locator('.sb-ros .ros-tab').tap(); await sleep(800)
  const hp = page.locator(`#sbRoster .rpuck .puck[data-person="${hex}"]`).first()
  await hp.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  const from = await w.centreOf(`#sbRoster .rpuck .puck[data-person="${hex}"]`)
  // the drawer covers the right of the screen: Ranger's puck stays at the left
  const to = await w.centreOf(`#sbBoard [data-slot="g:${SAT_DI}.0"] .puck`)
  log('drag from', from, 'to', to)
  await w.touchDrag(from, to)
}
q = { up: await tid('oilconf').count(), lead: await tid('oilconf-lead').innerText().catch(() => ''), cancel: await tid('oilconf-cancel').innerText().catch(() => ''), save: await tid('oilconf-save').innerText().catch(() => ''), saveDisabled: await tid('oilconf-save').isDisabled().catch(() => null), box: await w.measure('[data-testid="oilconf"] .airpop-box'), saveBox: await w.measureT('oilconf-save'), nothing: (await state()) === s0.st, undoSame: (await undoLabel()) === s0.undo }
await w.hush(); await w.shot(`B3${PART}-2-question`); await w.unhush()
rec(`B3${PART}-question`, q)
if (!q.up) { await done(w); process.exit(0) }
await page.keyboard.press('Escape'); await sleep(700)
const r1 = { q: await tid('oilconf').count(), sel: await sel(), drawer: await drawerOpen(), bar: await tid('oilbar-text').innerText().catch(() => ''), st: (await state()) === s0.st, undoSame: (await undoLabel()) === s0.undo, oilSame: (await w.oilOf(iid)) === s0.oil, barBox: await w.measureT('oilbar') }
await w.shot(`B3${PART}-3-cancelled`)
rec(`B3${PART}-cancel`, r1)
let viaBar = false
if (await tid('oilbar-answer').count()) { await press(tid('oilbar-answer')); await sleep(600); viaBar = (await tid('oilconf').count()) === 1 }
log('question back via the bar', viaBar, await tid('oilconf-lead').innerText().catch(() => ''))
await press(tid('oil-yes')); await sleep(200)
await press(tid('oilconf-save')); await sleep(900)
const r3 = { toast: await w.toast(), sel: await sel(), drawer: await drawerOpen(), st: await state(), oil: await w.oilOf(iid), q: await tid('oilconf').count(), bar: await tid('oilbar').count(), undo: await undoLabel() }
await w.shot(`B3${PART}-4-after`)
rec(`B3${PART}-answered`, r3)
rec(`B3${PART}-ranger-elsewhere`, await page.evaluate(() => { const hits = []; const walk = (o, path) => { if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], path + '.' + k); else if (o === 'bane') hits.push(path) }; walk(window.DAYS[5], 'd'); return hits }))
const ub = (await page.locator('#sbUndo').isVisible().catch(() => false)) ? page.locator('#sbUndo') : page.locator('#undoBtn')
await ub.tap(); await sleep(700)
rec(`B3${PART}-undo`, { st: await state(), same: (await state()) === s0.st && (await w.oilOf(iid)) === s0.oil })
await done(w); process.exit(0)
