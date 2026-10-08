// The short screens and the owner's own screen: the Inputs month, an opened day, the editor window and the settings window at 390x568, 844x390 and 1536x864.
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, seedFile, big } from './cal-E-lib.mjs'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const res = {}
for (const size of ['short', 'side', 'wide']) {
  const w = await world(b, size); const p = w.page
  const N = n => `sizes-${size}-${n}`
  await toInputs(p); await toMonth(p, 2026, 10)
  const sid = await p.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
  const ids = await seedFile(p, [
    { pid: sid, type: 'LL', from: 'Oct 13', to: 'Oct 15' }, { who: 3, type: 'Meeting', from: 'Oct 14', timed: [600, 660] }, { who: 4, type: 'Duty', from: 'Oct 14', timed: [480, 1020] },
    { who: 5, type: 'OL', from: 'Oct 14' }, { who: 6, type: 'Appointment', from: 'Oct 14', timed: [900, 960] }, { who: 7, type: 'LL', from: 'Oct 14' }, { who: 8, type: 'Meeting', from: 'Oct 14', timed: [700, 760] },
    { who: 9, type: 'LL', from: 'Oct 21', to: 'Oct 23' },
  ])
  await p.waitForTimeout(500)
  const m = await p.evaluate(() => ({ vw: innerWidth, vh: innerHeight, pageW: document.documentElement.scrollWidth, pageH: document.documentElement.scrollHeight, grid: (() => { const g = document.querySelector('[data-testid="ib-grid"]'); const r = g.getBoundingClientRect(); const cs = getComputedStyle(g); return { top: Math.round(r.top), bottom: Math.round(r.bottom), own: g.scrollHeight - g.clientHeight, ovY: cs.overflowY } })(), bars: document.querySelectorAll('.ib-bar').length, more: [...document.querySelectorAll('[data-icmore]')].map(e => e.textContent) }))
  L(size, 'month:', JSON.stringify(m), '| sideways scroll:', m.pageW > m.vw)
  res[size] = { month: m }
  await shot(p, N('1-month'))
  if (size !== 'wide') { await shot(p, N('1b-month-full'), true) }
  // an opened day
  await press(p, size, cell(p, '2026-10-14'), { position: { x: 8, y: 8 } }); await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(500)
  const dayW = await p.evaluate(() => { const r = document.querySelector('[data-testid="win-inputsday"]').getBoundingClientRect(); const x = document.querySelector('[data-testid="win-inputsday-x"]').getBoundingClientRect(); const hit = document.elementFromPoint(x.left + x.width / 2, x.top + x.height / 2); const add = document.querySelector('#icPopAdd').getBoundingClientRect(); const hit2 = document.elementFromPoint(add.left + add.width / 2, add.top + add.height / 2); return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth, vh: innerHeight, closeLands: !!hit && (hit.closest('[data-testid="win-inputsday-x"]') != null), addLands: !!hit2 && (hit2.id === 'icPopAdd' || hit2.closest('#icPopAdd') != null) } })
  L(size, 'opened day window:', JSON.stringify(dayW)); res[size].day = dayW
  await shot(p, N('2-day'))
  // the editor, from "+ Input"
  await press(p, size, p.locator('#icPopAdd')); await p.waitForSelector('#inpEditPop'); await p.waitForTimeout(500)
  const ed = await p.evaluate(() => { const r = document.querySelector('[data-testid="win-inputedit"]').getBoundingClientRect(); const out = {}; for (const id of ['inpEditSave', 'inpEditCancel']) { const b = document.getElementById(id); const q = b.getBoundingClientRect(); const hit = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); out[id] = { inView: q.bottom <= innerHeight && q.top >= 0, lands: !!hit && (hit === b || b.contains(hit)) } } return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, btns: out, bodyScrolls: (() => { const bd = document.querySelector('[data-testid="win-inputedit"] .win-body'); return bd ? bd.scrollHeight - bd.clientHeight : null })() } })
  L(size, 'editor window:', JSON.stringify(ed)); res[size].editor = ed
  await shot(p, N('3-editor'))
  await press(p, size, p.locator('[data-testid="win-inputedit-x"]')); await p.waitForTimeout(300)
  const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.click().catch(() => {})
  await p.waitForTimeout(300)
  // the gear window
  await press(p, size, p.locator('[data-testid="in-gear"]')); await p.waitForSelector('[data-testid="win-inputsset"]'); await p.waitForTimeout(500)
  const gs = await p.evaluate(() => { const r = document.querySelector('[data-testid="win-inputsset"]').getBoundingClientRect(); const out = {}; for (const id of ['iset-save', 'iset-cancel', 'win-inputsset-x']) { const b = document.querySelector(`[data-testid="${id}"]`); const q = b.getBoundingClientRect(); const hit = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); out[id] = { inView: q.bottom <= innerHeight && q.top >= 0, lands: !!hit && (hit === b || b.contains(hit)) } } return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, btns: out } })
  L(size, 'settings window:', JSON.stringify(gs)); res[size].settings = gs
  await shot(p, N('4-settings'))
  L(size, 'errors', JSON.stringify(w.errors)); res[size].errors = w.errors
  await w.ctx.close()
}
saveRows('sizes', [{ log, res }])
await b.close()
