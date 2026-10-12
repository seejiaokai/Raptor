// B1: 390x568, usual Saturday on the board, TOUCH drag Tally -> Ranger
import { world, done, log, rec, sleep, SAT_DI } from './on-B-lib.mjs'
const w = await world('l390')
const { page, tid, press } = w
const iid = await w.usualSat()
const rowSel = i => `#sbBoard [data-move="mv:g.${SAT_DI}.${i}"]`
const puckSel = i => `#sbBoard [data-slot="g:${SAT_DI}.${i}"] .puck`
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#sbUndo') || document.querySelector('#undoBtn'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
await page.locator(rowSel(0)).evaluate(e => { e.scrollIntoView({ block: 'center' }) })
await sleep(400)
const before = await w.groundNow(), oil0 = await w.oilOf(iid), undo0 = await undoLabel()
log('before', before, oil0, undo0)
const f = await w.centreOf(puckSel(1)), t = await w.centreOf(puckSel(0))
log('from/to', f, t)
await w.touchDrag(f, t)
const sheet = tid('oilconf')
const q = {}
q.up = await sheet.count()
if (q.up) {
  q.lead = (await tid('oilconf-lead').innerText()).trim()
  q.cancel = await tid('oilconf-cancel').innerText(); q.save = await tid('oilconf-save').innerText()
  q.saveDisabled = await tid('oilconf-save').isDisabled()
  q.nothingMoved = JSON.stringify(await w.groundNow()) === JSON.stringify(before)
  q.undoSame = (await undoLabel()) === undo0
  q.inputWin = await page.locator('#inpEditPop:not([hidden])').count()
  q.box = await w.measure('[data-testid="oilconf"] .airpop-box')
  q.boxSave = await w.measureT('oilconf-save'); q.boxCancel = await w.measureT('oilconf-cancel')
  q.scrollable = await page.evaluate(() => { const e = document.querySelector('[data-testid="oilconf"]'); return { sh: e.scrollHeight, ch: e.clientHeight } })
  await w.hush(); await w.shot('B4c-l390-1-question-568')
}
rec('B4c-l390-question', q)
if (!q.up) { await w.shot('B4c-l390-1-noquestion'); await done(w); process.exit(0) }
// Don't swap
await press(tid('oilconf-cancel')); await sleep(120)
const lit = await page.evaluate(sels => sels.map(s => { const p = document.querySelector(s); const h = p && (p.closest('.seat') || p); return !!h && h.classList.contains('lift-land') }), [puckSel(0), puckSel(1)])
await w.unhush()
const b = {}
b.lit = lit
b.text = await tid('oilbar-text').innerText().catch(() => '')
b.answer = await tid('oilbar-answer').innerText().catch(() => ''); b.ok = await tid('oilbar-ok').innerText().catch(() => '')
b.box = await w.measureT('oilbar'); b.boxAnswer = await w.measureT('oilbar-answer'); b.boxOk = await w.measureT('oilbar-ok')
b.sideBySide = await page.evaluate(() => { const a = document.querySelector('[data-testid="oilbar-answer"]').getBoundingClientRect(), o = document.querySelector('[data-testid="oilbar-ok"]').getBoundingClientRect(); return { ay: Math.round(a.top), oy: Math.round(o.top), ax: Math.round(a.left), ox: Math.round(o.left) } })
b.nothingMoved = JSON.stringify(await w.groundNow()) === JSON.stringify(before)
b.oilSame = (await w.oilOf(iid)) === oil0
b.undoSame = (await undoLabel()) === undo0
await w.shot('B4c-l390-2-bar-568')
rec('B4c-l390-bar', b)
// Answer OIL -> Yes -> Swap
await press(tid('oilbar-answer')); await sleep(300)
const a = {}
a.question = await tid('oilconf').count(); a.bar = await tid('oilbar').count()
a.lead = await tid('oilconf-lead').innerText().catch(() => '')
await press(tid('oil-yes'))
a.saveLive = !(await tid('oilconf-save').isDisabled())
a.boxSave = await w.measureT('oilconf-save')
await w.hush(); await w.shot('B4c-l390-3-yes-568'); await w.unhush()
await press(tid('oilconf-save')); await sleep(700)
a.after = await w.groundNow(); a.oil = await w.oilOf(iid); a.toast = await w.toast()
a.leftover = [await tid('oilconf').count(), await tid('oilbar').count()]
await w.shot('B4c-l390-4-after-568')
rec('B4c-l390-answer', a)
// Undo once
await press(page.locator((await page.locator('#sbUndo').isVisible()) ? '#sbUndo' : '#undoBtn')); await sleep(600)
rec('B4c-l390-undo', { ground: await w.groundNow(), oil: await w.oilOf(iid), same: JSON.stringify(await w.groundNow()) === JSON.stringify(before) && (await w.oilOf(iid)) === oil0 })
await done(w)
process.exit(0)
