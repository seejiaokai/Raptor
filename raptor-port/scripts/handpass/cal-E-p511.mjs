// P5-11 — Save, Undo and Redo keep a visible input still (and bring a hidden one into view, clear of the top bar). Month and List.
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, makeInput, closeDay, seedFile, recOf } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const res = {}
const w = await world(b, size); const p = w.page
const N = n => `p511-${size}-${n}`
await toInputs(p)
// a recorder: which class tokens appear on the target (month bar or List row), and when
const arm = sel => p.evaluate(sel => {
  const base = new Set(); document.querySelectorAll(sel).forEach(e => e.className.toString().split(/\s+/).forEach(c => base.add(c)))
  window.__base = [...base]; window.__seen = []; window.__all = []; window.__stop = false
  const t0 = performance.now()
  window.__anim = []
  const tick = () => { document.querySelectorAll(sel).forEach(e => { try { e.getAnimations({ subtree: true }).forEach(a => { const n = (a.animationName || a.constructor.name) + ':' + a.playState; if (!window.__anim.includes(n)) window.__anim.push(n) }) } catch (_) {} }); document.querySelectorAll(sel).forEach(e => e.className.toString().split(/\s+/).forEach(c => { if (c && !window.__all.includes(c)) window.__all.push(c); if (c && !window.__base.includes(c) && !window.__seen.includes(c)) window.__seen.push(c) })); if (performance.now() - t0 < 1500 && !window.__stop) requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
}, sel)
const seen = () => p.evaluate(() => ({ new: window.__seen.slice(), base: window.__base.filter(c => /lift|land|flash|hl/.test(c)), all: window.__all.filter(c => /lift|land|flash|hl/.test(c)), anim: window.__anim.slice() }))
const mon = () => p.locator('#inpCal .ic-mon').innerText()
const topbarBottom = () => p.evaluate(() => { const t = document.querySelector('.topbar, header, #topbar'); return t ? Math.round(t.getBoundingClientRect().bottom) : 0 })
const barTop = iid => p.evaluate(iid => { const e = document.querySelector(`.ib-bar[data-iid="${iid}"]`); return e ? Math.round(e.getBoundingClientRect().top) : null }, iid)
const rowTop = iid => p.evaluate(iid => { const e = document.querySelector(`#inBody tr[data-iid="${iid}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) } }, iid)
const scrollY = () => p.evaluate(() => scrollY)

// ============ MONTH ============
const [t1] = await makeInput(p, size, '2026-10-21', { type: 'Duty', remarks: 'month target' })
await closeDay(p); await p.waitForTimeout(300)
L('M0 month', await mon(), 'target bar top', await barTop(t1))
// open the target's editor via its bar and edit remarks, Save
await press(p, size, bar(p, t1)); await p.waitForSelector('[data-testid="win-inputedit"]'); await p.waitForTimeout(300)
await p.fill('#inpEditRmk', 'month target edited')
const s0 = { mon: await mon(), top: await barTop(t1), sy: await scrollY() }
await arm(`.ib-bar[data-iid="${t1}"]`)
await press(p, size, p.locator('#inpEditSave')); await p.waitForTimeout(250)
const s1 = { mon: await mon(), top: await barTop(t1), sy: await scrollY(), classes: await seen(), editor: await p.locator('[data-testid="win-inputedit"]').count(), dayOpen: await p.locator('[data-testid="win-inputsday"]').count() }
L('M1 Save: before', JSON.stringify(s0), 'after', JSON.stringify(s1)); res.save = { s0, s1 }
await shot(p, N('m1-after-save'))
await closeDay(p)
for (const [name, btn] of [['Undo', '#undoBtn'], ['Redo', '#redoBtn']]) {
  const a0 = { mon: await mon(), top: await barTop(t1), sy: await scrollY() }
  await arm(`.ib-bar[data-iid="${t1}"]`)
  await press(p, size, p.locator(btn)); await p.waitForTimeout(250)
  const a1 = { mon: await mon(), top: await barTop(t1), sy: await scrollY(), classes: await seen(), rmk: (await recOf(p, t1))?.remarks, dayOpen: await p.locator('[data-testid="win-inputsday"]').count() }
  L('M ' + name + ': before', JSON.stringify(a0), 'after', JSON.stringify(a1)); res['m' + name] = { a0, a1 }
  await shot(p, N('m-' + name))
}
// target out of view: go to another month, Undo, see where it lands
await press(p, size, p.locator('#icNext')); await press(p, size, p.locator('#icNext')); await p.waitForTimeout(300)
L('M2 moved away to', await mon())
await arm(`.ib-bar[data-iid="${t1}"]`)
await press(p, size, p.locator('#undoBtn')); await p.waitForTimeout(400)
const o1 = { mon: await mon(), top: await barTop(t1), classes: await seen(), rmk: (await recOf(p, t1))?.remarks, dayOpen: await p.locator('[data-testid="win-inputsday"]').count() }
L('M2 Undo from Dec: ', JSON.stringify(o1)); res.mAway = o1
await shot(p, N('m2-undo-from-away'))

// ============ LIST ============
await closeDay(p)
// 26 inputs in the List's window (8-22 Oct) so the List scrolls: SEEDED background
const ids = await seedFile(p, Array.from({ length: 26 }, (_, i) => ({ who: i % 40, type: ['LL', 'OL', 'Meeting', 'Appointment'][i % 4], from: 'Oct ' + (9 + (i % 12)), remarks: 'bulk ' + i, timed: i % 4 >= 2 ? [600, 660] : undefined })))
await press(p, size, p.locator('#inListBtn')); await p.waitForTimeout(500)
const tgt = ids[12]
const tgtSel = `#inBody tr[data-iid="${tgt}"]`
const rowCount = await p.locator('#inBody tr').count()
// scroll so the target is fully below the top bar, mid-screen
await p.evaluate(sel => { const e = document.querySelector(sel); e.scrollIntoView({ block: 'center' }) }, tgtSel); await p.waitForTimeout(300)
const tb = await topbarBottom()
L('L0 rows', rowCount, 'topbar bottom', tb, 'target', JSON.stringify(await rowTop(tgt)), 'scrollY', await scrollY())
const l0 = { row: await rowTop(tgt), sy: await scrollY() }
await shot(p, N('l0-target-mid-screen'))
// edit inline and save
await press(p, size, p.locator(`${tgtSel} [data-edit]`)); await p.waitForTimeout(300)
await p.locator(`${tgtSel} td[data-fld="Remarks"] input`).first().fill('list target edited')
await arm(tgtSel)
await press(p, size, p.locator(`${tgtSel} .inact span`).first()); await p.waitForTimeout(250)
const l1 = { row: await rowTop(tgt), sy: await scrollY(), classes: await seen(), rmk: (await recOf(p, tgt)).remarks }
L('L1 Save visible target: before', JSON.stringify(l0), 'after', JSON.stringify(l1)); res.listSave = { l0, l1 }
await shot(p, N('l1-after-save'))
for (const [name, btn] of [['Undo', '#undoBtn'], ['Redo', '#redoBtn']]) {
  const a0 = { row: await rowTop(tgt), sy: await scrollY() }
  await arm(tgtSel)
  await press(p, size, p.locator(btn)); await p.waitForTimeout(250)
  const a1 = { row: await rowTop(tgt), sy: await scrollY(), classes: await seen(), rmk: (await recOf(p, tgt)).remarks }
  L('L ' + name + ' (target visible): before', JSON.stringify(a0), 'after', JSON.stringify(a1)); res['l' + name] = { a0, a1 }
  await shot(p, N('l-' + name))
}
// target OUT of view — a row below the fold (the last) edited, then Undo; a row above the fold (the first) edited, then Undo
const editInline = async iid => {
  const sel = `#inBody tr[data-iid="${iid}"]`
  await p.evaluate(sel => document.querySelector(sel).scrollIntoView({ block: 'center' }), sel); await p.waitForTimeout(250)
  await press(p, size, p.locator(`${sel} [data-edit]`)); await p.waitForTimeout(250)
  await p.locator(`${sel} td[data-fld="Remarks"] input`).first().fill('edited far ' + iid.slice(-3))
  await press(p, size, p.locator(`${sel} .inact span`).first()); await p.waitForTimeout(300)
}
const rowsIds = await p.evaluate(() => [...document.querySelectorAll('#inBody tr')].map(r => r.dataset.iid))
const lastId = rowsIds[rowsIds.length - 1], firstId = rowsIds[0]
for (const [label, iid, scrollTo_] of [['BELOW the fold (last row)', lastId, 'top'], ['ABOVE the fold (first row)', firstId, 'bottom']]) {
  const sel = `#inBody tr[data-iid="${iid}"]`
  await editInline(iid)
  await p.evaluate(w => scrollTo(0, w === 'top' ? 0 : 1e6), scrollTo_); await p.waitForTimeout(400)
  const vis = await rowTop(iid), vh = await p.evaluate(() => innerHeight)
  const hidden = !vis || vis.bottom < await topbarBottom() || vis.top > vh
  await arm(sel)
  await press(p, size, p.locator('#undoBtn')); await p.waitForTimeout(900)
  const a1 = { row: await rowTop(iid), sy: await scrollY(), classes: await seen(), vh, tb: await topbarBottom(), rmk: (await recOf(p, iid)).remarks }
  const clear = !!a1.row && a1.row.top >= a1.tb && a1.row.bottom <= vh
  L(`L Undo, target ${label}; was hidden: ${hidden} (row ${JSON.stringify(vis)}) -> after`, JSON.stringify(a1), '| fully in view, clear of the top bar:', clear)
  res['away ' + label] = { hidden, vis, a1, clear }
  await shot(p, N('l-away-' + (scrollTo_)))
}
L('errors', JSON.stringify(w.errors))
saveRows('p511-' + size, [{ log, res, errors: w.errors }])
await b.close()
