// #30, #34, #36 - Saber (admin), desktop 1440x900, each in a fresh world
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const T = false
const SZ = '1440x900', ROLE = 'Saber (admin)'
async function world() {
  const { ctx, page: p } = await L.open(browser, { width: 1440, height: 900 })
  await L.watchToasts(p)
  const sab = await L.csId(p, 'Saber')
  return { ctx, p, sab }
}
const dayCard = async (p, iso, who = 'Saber') => {
  await L.openDay(p, iso, T)
  const cs = await L.cardFacts(p, L.DAYWIN, 'idy')
  return cs.filter(c => (c.who || '').split(', ').includes(who) || c.who === who)
}
const fmt = c => c.map(x => `${x.who}|${x.kind}|${x.tone}|title=${x.title}|rmk=${x.rmk}|${x.when}`).join(' ; ')

/* ---------------- 30 ---------------- */
await L.scn(30, SZ, ROLE, async () => {
  const { ctx, p, sab } = await world()
  const pics = [], notes = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Safety brief Z' })
  const r0 = await L.rec(p, { person: sab, type: 'Duty' })
  notes.push(`filed Duty title "${r0.title}"`)
  const step = async (type, label) => {
    await L.openFromList(p, T, r0.iid)
    await p.selectOption('#inpEditType', type)
    const hasTitle = await p.locator('#inpEditOwnTitle').count()
    const tv = hasTitle ? await p.inputValue('#inpEditOwnTitle') : null
    await L.saveWin(p, T)
    const r = await L.recId(p, r0.iid)
    const cards = await dayCard(p, '2026-07-20')
    pics.push(await L.shot(p, `B30-${label}`))
    notes.push(`-> ${type}: title field ${hasTitle ? 'present, value "' + tv + '"' : 'absent'}; saved type ${r.type} title ${JSON.stringify(r.title)}; day card: ${fmt(cards)}`)
    await L.closeAll(p)
    return { r, hasTitle, tv, cards }
  }
  const a = await step('Meeting', 'meeting')
  const b = await step('LL', 'll')
  const c = await step('Duty', 'duty-again')
  await L.undo(p); const ru = await L.recId(p, r0.iid); await L.redo(p); const rr = await L.recId(p, r0.iid)
  notes.push(`Undo -> ${ru.type} "${ru.title || ''}"; Redo -> ${rr.type} "${rr.title || ''}"`)
  const ok = a.hasTitle && a.tv === 'Safety brief Z' && a.r.type === 'Meeting' && a.r.title === 'Safety brief Z' && a.cards.some(x => x.kind === 'Meeting' && x.tone === 'amb' && x.title === 'Safety brief Z')
    && !b.hasTitle && b.r.type === 'LL' && !b.r.title && b.cards.some(x => x.kind === 'LL' && x.tone === 'red' && !x.title)
    && c.r.type === 'Duty' && c.r.title !== 'Safety brief Z' && c.tv !== 'Safety brief Z' && c.cards.some(x => x.kind === 'Duty' && x.tone === 'amb' && x.title !== 'Safety brief Z')
    && ru.type === 'LL' && rr.type === 'Duty'
  await ctx.close()
  return { ok, saw: notes.join(' || '), pics }
})

/* ---------------- 34 ---------------- */
await L.scn(34, SZ, ROLE, async () => {
  const { ctx, p, sab } = await world()
  const pics = [], notes = []
  await L.fileInput(p, T, { iso: '2026-07-29', type: 'Duty', who: sab, dates: ['2026-07-29', '2026-07-31'], from: '09:00', to: '10:00', title: 'Range test' })
  const r0 = await L.rec(p, { person: sab, type: 'Duty' })
  const span = r => `${r.date}${r.endDate ? '→' + r.endDate : ''}`
  notes.push(`filed ${span(r0)}`)
  const covers = async iso => (await dayCard(p, iso)).filter(c => c.title === 'Range test').length
  await L.openFromList(p, T, r0.iid)
  notes.push('window opens on: ' + await L.calRead(p))
  await L.calMonth(p, T, 2026, 8)
  await L.tapDate(p, T, '2026-08-02'); await L.tapDate(p, T, '2026-08-04')
  notes.push('after two taps: ' + await L.calRead(p))
  pics.push(await L.shot(p, 'B34-1-range-picked'))
  const asked = await L.saveWin(p, T, 'no')
  const r1 = await L.recId(p, r0.iid)
  notes.push(`saved ${span(r1)} (OIL question asked ${asked})`)
  const cov = {}
  for (const d of ['2026-07-29', '2026-07-30', '2026-07-31', '2026-08-02', '2026-08-03', '2026-08-04']) cov[d] = await covers(d)
  notes.push('Range-test cards per day: ' + JSON.stringify(cov))
  pics.push(await L.shot(p, 'B34-2-aug4-card'))
  await L.toList(p, T)
  const listRow = await p.evaluate(iid => { const tr = document.querySelector(`#inBody tr[data-iid="${iid}"]`); return tr ? tr.innerText.replace(/\s+/g, ' ').slice(0, 120) : null }, r0.iid)
  const nRows = await p.locator('#inBody tr').filter({ hasText: 'Range test' }).count()
  notes.push(`list rows for it: ${nRows} — "${listRow}"`)
  pics.push(await L.shot(p, 'B34-3-list'))
  await L.undo(p); const u1 = await L.recId(p, r0.iid); await L.redo(p); const re1 = await L.recId(p, r0.iid)
  notes.push(`Undo -> ${span(u1)}; Redo -> ${span(re1)}`)
  // shorten to one day by ONE tap
  await L.openFromList(p, T, r0.iid)
  await L.calMonth(p, T, 2026, 8)
  await L.tapDate(p, T, '2026-08-03')
  notes.push('after one tap: ' + await L.calRead(p))
  const asked2 = await L.saveWin(p, T, 'no')
  const r2 = await L.recId(p, r0.iid)
  notes.push(`shortened -> ${span(r2)} (OIL asked ${asked2})`)
  const cov2 = {}
  for (const d of ['2026-08-02', '2026-08-03', '2026-08-04']) cov2[d] = await covers(d)
  notes.push('cards per day: ' + JSON.stringify(cov2))
  await L.undo(p); const u2 = await L.recId(p, r0.iid); await L.redo(p); const re2 = await L.recId(p, r0.iid)
  notes.push(`Undo -> ${span(u2)}; Redo -> ${span(re2)}`)
  const ok = span(r0) === 'Jul 29→Jul 31' && span(r1) === 'Aug 2→Aug 4' && cov['2026-07-29'] === 0 && cov['2026-07-30'] === 0 && cov['2026-07-31'] === 0 && cov['2026-08-02'] === 1 && cov['2026-08-03'] === 1 && cov['2026-08-04'] === 1 && nRows === 1
    && span(u1) === 'Jul 29→Jul 31' && span(re1) === 'Aug 2→Aug 4' && span(r2) === 'Aug 3' && cov2['2026-08-02'] === 0 && cov2['2026-08-04'] === 0 && cov2['2026-08-03'] === 1 && span(u2) === 'Aug 2→Aug 4' && span(re2) === 'Aug 3'
  await ctx.close()
  return { ok, saw: notes.join(' || '), pics }
})

/* ---------------- 36 ---------------- */
await L.scn(36, SZ, ROLE, async () => {
  const { ctx, p, sab } = await world()
  const pics = [], notes = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Rmk one', rmk: 'Bring boots and water' })
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', who: sab, from: '11:00', to: '12:00', title: 'Rmk two' })
  const a = await L.rec(p, { person: sab, type: 'Duty', title: 'Rmk one' }), b = await L.rec(p, { person: sab, type: 'Duty', title: 'Rmk two' })
  notes.push(`filed: one has remark "${a.remarks}", two has remark "${b.remarks}"`)
  const out = []
  for (const [r, want] of [[a, 'Bring boots and water'], [b, '']]) {
    // merely opening and cancelling
    await L.openFromList(p, T, r.iid)
    const open = await p.inputValue('#inpEditRmk')
    await p.click('#inpEditCancel'); await p.waitForTimeout(300)
    const afterCancel = (await L.recId(p, r.iid)).remarks || ''
    // move the dates 20 -> 21..22
    await L.openFromList(p, T, r.iid)
    await L.tapDate(p, T, '2026-07-21'); await L.tapDate(p, T, '2026-07-22')
    const read = await L.calRead(p)
    const inWin = await p.inputValue('#inpEditRmk')
    pics.push(await L.shot(p, `B36-${r.title.replace(/ /g, '')}-picked`))
    await L.saveWin(p, T, 'no')
    const now = await L.recId(p, r.iid)
    const cards = (await dayCard(p, '2026-07-22')).filter(c => c.title === r.title)
    await L.closeAll(p)
    notes.push(`${r.title}: opened remark "${open}"; after Cancel "${afterCancel}"; read "${read}"; remark box before save "${inWin}"; saved ${now.date}→${now.endDate} remark "${now.remarks || ''}"; card on 22 Jul: ${fmt(cards)}`)
    out.push(open === want && afterCancel === want && inWin === want && (now.remarks || '') === want && now.date === 'Jul 21' && now.endDate === 'Jul 22' && cards.length === 1)
  }
  await L.undo(p); const u = await L.recId(p, b.iid); await L.redo(p)
  notes.push(`Undo -> ${u.date}${u.endDate ? '→' + u.endDate : ''}`)
  await ctx.close()
  return { ok: out.every(Boolean) && u.date === 'Jul 20' && !u.endDate, saw: notes.join(' || '), pics }
})
L.save('desk1')
console.log(L.errs)
await browser.close()
