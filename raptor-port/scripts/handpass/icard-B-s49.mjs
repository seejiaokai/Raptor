// #49 ALL AVAIL restrictions survive the new window - Saber (admin), phone 390x844 by touch
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const T = true
const { ctx, page: p } = await L.open(browser, { width: 1440 > 0 ? 390 : 390, height: 844 }, 'ad', 'a', true)
await L.watchToasts(p)
const span = r => `${r.date}${r.endDate ? '→' + r.endDate : ''}`
const who = r => r ? (r.person === 'allavail' || r.person === 'all' ? r.person : r.person) : null
const pics = []
async function run(label, find) {
  const notes = [], ck = []
  const r0 = await p.evaluate(find => { const r = window.INPUTS.find(x => (find.title ? x.title === find.title : true) && x.person === find.person); return r ? { iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, s: r.s, e: r.e } : null }, find)
  if (!r0) return { ok: false, saw: `no ${label} input in the demo` }
  notes.push(`${label}: start ${r0.type} person=${r0.person} "${r0.title}" ${r0.date} ${r0.s}-${r0.e}`)
  const types = []
  await L.openFromList(p, T, r0.iid)
  const typeOpts = await p.locator('#inpEditType option').allInnerTexts()
  const personVal = await p.inputValue('#inpEditPerson')
  const hasSeveral = await p.locator(`${L.WIN} [data-testid="pp-several"]`).count()
  notes.push(`window: person select value "${personVal}", Several-people switch present ${hasSeveral}; kinds offered: ${typeOpts.join(',')}`)
  pics.push(await L.shot(p, `B49-${label}-window`))
  // valid changes: title, hours, remark, move to another single day
  await p.fill('#inpEditOwnTitle', 'Changed title'); await p.fill('#inpEditRmk', 'changed remark')
  await L.setTimes(p, '13:00', '15:00')
  await L.tapDate(p, T, '2026-07-27')
  notes.push('read ' + await L.calRead(p))
  await L.saveWin(p, T, 'no')
  let r1 = await L.recId(p, r0.iid)
  notes.push(`saved: person=${r1.person} "${r1.title}" "${r1.remarks}" ${span(r1)} ${r1.s}-${r1.e}`)
  ck.push(r1.person === r0.person && r1.title === 'Changed title' && r1.remarks === 'changed remark' && r1.date === 'Jul 27' && !r1.endDate && r1.s === 780 && r1.e === 900)
  // a date range
  await L.openFromList(p, T, r0.iid)
  await L.tapDate(p, T, '2026-07-27'); await L.tapDate(p, T, '2026-07-29')
  await L.clearToasts(p)
  await L.press(T, p.locator('#inpEditSave')); await p.waitForTimeout(900)
  const tR = await L.toasts(p)
  const sheet = await p.locator('[data-testid="oilconf"], .upconf-box, [data-testid="medclash"]').count()
  const r2 = await L.recId(p, r0.iid)
  notes.push(`range 27-29 Save: toasts ${JSON.stringify(tR)}; sheets ${sheet}; saved ${span(r2)} person=${r2.person}; window open ${await p.locator(L.WIN).count()}`)
  pics.push(await L.shot(p, `B49-${label}-range`))
  ck.push(!r2.endDate && r2.person === r0.person && tR.length > 0 && sheet === 0)
  // a medical / leave kind
  for (const k of ['LL', 'ATT C', 'OML']) {
    if (!typeOpts.includes(k)) { notes.push(`kind ${k}: not offered`); ck.push(true); continue }
    await L.openFromList(p, T, r0.iid)
    await p.selectOption('#inpEditType', k)
    await L.clearToasts(p)
    await L.press(T, p.locator('#inpEditSave')); await p.waitForTimeout(900)
    const tk = await L.toasts(p)
    const sheetK = await p.evaluate(() => { const e = document.querySelector('.upconf-box, [data-testid="oilconf"], [data-testid="medclash"]'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 120) : '' })
    const rk = await L.recId(p, r0.iid)
    notes.push(`kind ${k}: toasts ${JSON.stringify(tk)}; sheet "${sheetK}"; saved type ${rk.type} person=${rk.person}`)
    ck.push(rk.type === r0.type && rk.person === r0.person && !sheetK)
    await L.closeAll(p)
  }
  // several people combination
  await L.openFromList(p, T, r0.iid)
  if (await p.locator(`${L.WIN} [data-testid="pp-several"]`).count()) {
    await L.press(T, p.locator(`${L.WIN} [data-testid="pp-several"]`))
    const pr = await p.locator(`${L.WIN} [data-pp][aria-pressed="true"]`).count()
    await L.clearToasts(p)
    await L.press(T, p.locator('#inpEditSave')); await p.waitForTimeout(900)
    const rs = await L.recId(p, r0.iid); const n = await p.evaluate(t => window.INPUTS.filter(x => x.title === t).length, 'Changed title')
    notes.push(`Several people switched on (${pr} lit), Save: toasts ${JSON.stringify(await L.toasts(p))}; saved person=${rs.person}; records titled so: ${n}`)
    ck.push(rs.person === r0.person && n === 1)
  } else { notes.push('Several-people switch not offered on a saved ALL AVAIL/ALL input'); ck.push(true) }
  await L.closeAll(p)
  // undo/redo the main move
  await L.undo(p); await L.redo(p)
  return { ok: ck.every(Boolean), saw: notes.join(' || ') + ` || checks ${JSON.stringify(ck)}` }
}
await L.scn(49, '390x844 touch', 'Saber (admin)', async () => {
  const a = await run('ALLAVAIL', { person: 'allavail', title: undefined })
  // find ALL AVAIL Duty (Hangar clean-up) explicitly
  return { ok: a.ok, saw: a.saw, pics }
})
await L.toList(p, T)
await L.scn('49b', '390x844 touch', 'Saber (admin)', async () => {
  const a = await run('ALL', { person: 'all', title: undefined })
  return { ok: a.ok, saw: a.saw, pics }
})
L.save('s49')
console.log(L.errs)
await browser.close()
