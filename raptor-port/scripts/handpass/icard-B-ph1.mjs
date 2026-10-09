// #31, #33, #35, #41, #45 - Ranger (member), phone 390x844 by touch, own inputs, each in a fresh world
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const T = true
const SZ = '390x844 touch', ROLE = 'Ranger (member), own inputs'
async function world() {
  const { ctx, page: p } = await L.open(browser, { width: 390, height: 844 }, 'us', 'us', true)
  await L.watchToasts(p)
  const ran = await L.csId(p, 'Ranger')
  return { ctx, p, ran }
}
const spanOn = p => p.locator(`${L.WIN} #inpEditSpan button[aria-pressed="true"]`).allInnerTexts().then(a => a.join('/'))
const span = r => `${r.date}${r.endDate ? '→' + r.endDate : ''}`
const dayCard = async (p, iso, kind) => {
  await L.openDay(p, iso, T)
  const cs = await L.cardFacts(p, L.DAYWIN, 'idy')
  return cs.filter(c => c.who === 'Ranger' && (!kind || c.kind === kind))
}
const fmt = c => c.map(x => `${x.kind}|${x.when}|title=${x.title}|rmk=${x.rmk}`).join(' ; ')

/* ---------------- 31 ---------------- */
await L.scn(31, SZ, ROLE, async () => {
  const { ctx, p, ran } = await world()
  const pics = [], notes = [], ck = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', from: '09:00', to: '10:00', title: 'AllDay test' })
  const d = await L.rec(p, { person: ran, type: 'Duty' })
  // timed -> all day
  await L.openFromList(p, T, d.iid)
  const c0 = await p.locator('#inpEditAllday').isChecked()
  await L.press(T, p.locator('#inpEditAllday')); await L.saveWin(p, T)
  let r = await L.recId(p, d.iid), c = await dayCard(p, '2026-07-20', 'Duty')
  notes.push(`Duty timed->all day: was ticked ${c0}; saved allday ${r.allday} ${r.s}-${r.e}; card ${fmt(c)}`)
  ck.push(!c0 && r.allday === true && c.some(x => /all day/i.test(x.when || '')))
  pics.push(await L.shot(p, 'B31-1-duty-allday'))
  await L.openFromList(p, T, d.iid)
  const c1 = await p.locator('#inpEditAllday').isChecked()
  await L.press(T, p.locator('#inpEditAllday'))
  await L.setTimes(p, '09:00', '10:00'); await L.saveWin(p, T)
  r = await L.recId(p, d.iid); c = await dayCard(p, '2026-07-20', 'Duty')
  notes.push(`Duty all day->timed: reopened ticked ${c1}; saved allday ${r.allday} ${r.s}-${r.e}; card ${fmt(c)}`)
  ck.push(c1 === true && r.allday === false && r.s === 540 && r.e === 600 && c.some(x => x.when === '09:00–10:00'))
  // LL through all day, AM, PM, custom
  await L.fileInput(p, T, { iso: '2026-07-22', type: 'LL' })
  const ll = await L.rec(p, { person: ran, type: 'LL' })
  for (const [name, want, cust] of [['AM', 'AM'], ['PM', 'PM'], ['Custom', '09:00–11:00', ['09:00', '11:00']], ['All day', 'All day']]) {
    await L.openFromList(p, T, ll.iid)
    const before = await spanOn(p)
    await L.setSpan(p, T, name); if (cust) await L.setTimes(p, cust[0], cust[1])
    await L.saveWin(p, T)
    r = await L.recId(p, ll.iid)
    await L.openFromList(p, T, ll.iid)
    const reopened = await spanOn(p)
    const times = [await p.inputValue('#inpEditStart'), await p.inputValue('#inpEditEnd')]
    await L.closeAll(p)
    c = await dayCard(p, '2026-07-22', 'LL')
    notes.push(`LL -> ${name}: was ${before}; saved half ${r.half} ${r.s}-${r.e}; reopened with "${reopened}" selected (times ${times.join('/')}); card ${fmt(c)}`)
    ck.push(reopened.toLowerCase() === name.toLowerCase() && c.some(x => (x.when || '').toLowerCase() === want.toLowerCase()))
  }
  // the date calendar must not reset the span choice
  await L.openFromList(p, T, ll.iid); await L.setSpan(p, T, 'PM')
  await L.tapDate(p, T, '2026-07-23')
  const afterTap = await spanOn(p)
  notes.push(`PM chosen, then tapped 23 Jul in the calendar: selected span "${afterTap}", read "${await L.calRead(p)}"`)
  pics.push(await L.shot(p, 'B31-2-span-after-date-tap'))
  ck.push(afterTap === 'PM')
  await L.saveWin(p, T)
  r = await L.recId(p, ll.iid); notes.push(`saved ${span(r)} half ${r.half}`)
  ck.push(r.date === 'Jul 23' && r.half === 'pm')
  await L.undo(p); await L.redo(p)
  await ctx.close()
  return { ok: ck.every(Boolean), saw: notes.join(' || ') + ` || checks ${JSON.stringify(ck)}`, pics }
})

/* ---------------- 33 ---------------- */
await L.scn(33, SZ, ROLE, async () => {
  const { ctx, p, ran } = await world()
  const pics = [], notes = [], ck = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', from: '09:00', to: '10:00', title: 'Taps test' })
  const d = await L.rec(p, { person: ran, type: 'Duty' })
  await L.openFromList(p, T, d.iid)
  notes.push('opens on: ' + await L.calRead(p))
  await L.tapDate(p, T, '2026-07-20'); const r1 = await L.calRead(p)
  await L.tapDate(p, T, '2026-07-22'); const r2 = await L.calRead(p)
  notes.push(`tap saved date 20: "${r1}"; then 22: "${r2}"`)
  pics.push(await L.shot(p, 'B33-1-two-taps'))
  await L.saveWin(p, T)
  let r = await L.recId(p, d.iid); notes.push('saved ' + span(r)); ck.push(r2 === 'Jul 20 → Jul 22' && span(r) === 'Jul 20→Jul 22')
  // reversed sequence: later date first, then an earlier one, then an end after the earlier
  await L.openFromList(p, T, d.iid)
  await L.tapDate(p, T, '2026-07-24'); const a1 = await L.calRead(p)
  await L.tapDate(p, T, '2026-07-21'); const a2 = await L.calRead(p)
  await L.tapDate(p, T, '2026-07-23'); const a3 = await L.calRead(p)
  const sel = await p.locator(`${L.WIN} #inpEdCal [data-cal]`).evaluateAll(els => els.filter(e => /\bs\b|\bsel|\bin\b|\be\b|\brng/.test(e.className)).map(e => e.getAttribute('data-cal') + ':' + e.className))
  notes.push(`later 24: "${a1}"; earlier 21: "${a2}"; end 23: "${a3}"; painted: ${sel.join(' ')}`)
  pics.push(await L.shot(p, 'B33-2-reversed'))
  await L.saveWin(p, T)
  r = await L.recId(p, d.iid); notes.push('saved ' + span(r))
  ck.push(a3 === 'Jul 21 → Jul 23' && span(r) === 'Jul 21→Jul 23' && !/→ Jul 2[01]\b/.test(a1) )
  await L.undo(p); const u = await L.recId(p, d.iid); await L.redo(p)
  notes.push('Undo -> ' + span(u))
  await ctx.close()
  return { ok: ck.every(Boolean) && span(u) === 'Jul 20→Jul 22', saw: notes.join(' || '), pics }
})

/* ---------------- 35 ---------------- */
await L.scn(35, SZ, ROLE, async () => {
  const { ctx, p, ran } = await world()
  const pics = [], notes = [], ck = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', dates: ['2026-07-20', '2026-07-22'], from: '09:00', to: '10:00', title: 'Token test', rmk: 'Travel till 22 Jul Bangkok' })
  const d = await L.rec(p, { person: ran, type: 'Duty' })
  notes.push(`filed ${span(d)} remark "${d.remarks}"`)
  await L.openFromList(p, T, d.iid)
  notes.push('window remark box: "' + await p.inputValue('#inpEditRmk') + '"')
  await L.tapDate(p, T, '2026-07-20'); await L.tapDate(p, T, '2026-07-24')
  notes.push('read: ' + await L.calRead(p) + '; remark box before save: "' + await p.inputValue('#inpEditRmk') + '"')
  await L.saveWin(p, T)
  let r = await L.recId(p, d.iid)
  notes.push(`saved ${span(r)} remark "${r.remarks}"`)
  ck.push(r.remarks === 'Travel till 24 Jul Bangkok' && span(r) === 'Jul 20→Jul 24')
  const cards = await dayCard(p, '2026-07-24', 'Duty'); notes.push('card on 24 Jul: ' + fmt(cards))
  pics.push(await L.shot(p, 'B35-1-day24'))
  await L.closeAll(p)
  // remarks-only edit
  await L.openFromList(p, T, d.iid)
  await p.fill('#inpEditRmk', 'Travel till 24 Jul Bangkok and back, bring ID')
  await L.saveWin(p, T)
  r = await L.recId(p, d.iid); notes.push(`remarks-only edit saved "${r.remarks}" ${span(r)}`)
  ck.push(r.remarks === 'Travel till 24 Jul Bangkok and back, bring ID' && span(r) === 'Jul 20→Jul 24')
  await L.undo(p); const u = await L.recId(p, d.iid); await L.redo(p)
  notes.push(`Undo -> "${u.remarks}"`)
  await ctx.close()
  return { ok: ck.every(Boolean) && u.remarks === 'Travel till 24 Jul Bangkok', saw: notes.join(' || '), pics }
})

/* ---------------- 41 ---------------- */
await L.scn(41, SZ, ROLE, async () => {
  const { ctx, p, ran } = await world()
  const pics = [], notes = [], ck = []
  await L.fileInput(p, T, { iso: '2026-07-13', type: 'ATT C', dates: ['2026-07-13', '2026-07-15'], rmk: 'Boots check', doc: L.DOC })
  const a = await L.rec(p, { person: ran, type: 'ATT C' })
  const rawA = await L.raw(p, a.iid)
  notes.push(`filed ATT C ${span(a)} remark "${a.remarks}" docs ${JSON.stringify(rawA.docIds || rawA.docId)}`)
  await L.openFromList(p, T, a.iid)
  const types = await p.locator('#inpEditType option').allInnerTexts()
  notes.push('Type choices offered: ' + types.join(','))
  await p.selectOption('#inpEditType', 'OML')
  pics.push(await L.shot(p, 'B41-1-retyped'))
  const chips = await p.locator(`${L.WIN} .docchip`).count()
  const rmk = await p.inputValue('#inpEditRmk')
  notes.push(`after choosing OML: ${chips} document chip(s), remark box "${rmk}"`)
  await L.saveWin(p, T)
  const b = await L.recId(p, a.iid), rawB = await L.raw(p, a.iid)
  notes.push(`saved: ${b.type} ${span(b)} remark "${b.remarks}" docs ${JSON.stringify(rawB.docIds || rawB.docId)}`)
  const med = await L.medText(p, T)
  pics.push(await L.shot(p, 'B41-2-medical'))
  const mi = med.split('\n').findIndex(l => /Ranger/.test(l))
  notes.push('Medical view: ' + (mi >= 0 ? med.split('\n').slice(Math.max(0, mi - 1), mi + 6).join(' ') : 'no Ranger line'))
  const sameDoc = JSON.stringify(rawA.docIds || rawA.docId) === JSON.stringify(rawB.docIds || rawB.docId)
  const unrelated = types.filter(t => /^(LL|OL|Duty|Meeting|Training|Appointment|Event|Other|Personal|Fly with|CSE|OD|CL|PL)$/.test(t))
  await L.undo(p); const u = await L.recId(p, a.iid); await L.redo(p)
  notes.push(`Undo -> ${u.type}`)
  await ctx.close()
  return { ok: b.type === 'OML' && sameDoc && b.remarks === a.remarks && unrelated.length === 0 && /OML/.test(mi >= 0 ? med.split('\n').slice(mi - 1, mi + 6).join(' ') : '') && u.type === 'ATT C', saw: notes.join(' || ') + ` || unrelated choices offered: ${JSON.stringify(unrelated)}`, pics }
})

/* ---------------- 45 ---------------- */
await L.scn(45, SZ, ROLE, async () => {
  const { ctx, p, ran } = await world()
  const pics = [], notes = []
  await L.fileInput(p, T, { iso: '2026-07-13', type: 'ATT C', dates: ['2026-07-13', '2026-07-22'], doc: L.DOC })
  await L.openDay(p, '2026-07-20', T); await L.press(T, p.locator('#icPopAdd')); await p.locator(L.WIN).waitFor()
  await p.selectOption('#inpEditType', 'Upchit'); await L.attachDoc(p, L.DOC)
  await L.press(T, p.locator('#inpEditSave'))
  const sheet = p.locator('[data-testid="upconf"]')
  await sheet.waitFor({ timeout: 4000 })
  await L.press(T, sheet.locator('[data-testid="upconf-save"]')); await p.waitForTimeout(600)
  const snap = async () => (await L.recs(p, { person: ran })).filter(r => /^(ATT C|Upchit)$/.test(r.type)).map(r => `${r.type} ${span(r)}`).sort().join(' ; ')
  const base = await snap(); notes.push('setup: ' + base)
  const up = (await L.recs(p, { person: ran })).find(r => r.type === 'Upchit')
  await L.openFromList(p, T, up.iid)
  await L.tapDate(p, T, '2026-07-17'); await L.tapDate(p, T, '2026-07-18')
  const rd = await L.calRead(p)
  await L.clearToasts(p)
  await L.press(T, p.locator('#inpEditSave')); await p.waitForTimeout(900)
  const t1 = await L.toasts(p), after1 = await snap(), sheetUp = await sheet.count()
  pics.push(await L.shot(p, 'B45-1-range-refused'))
  notes.push(`two dates picked: read "${rd}"; Save -> toasts ${JSON.stringify(t1)}; summary up ${sheetUp}; saved: ${after1 === base ? 'unchanged' : after1}; window open ${await p.locator(L.WIN).count()}`)
  // one valid date
  if (!(await p.locator(L.WIN).count())) { await L.openFromList(p, T, up.iid) }
  await L.tapDate(p, T, '2026-07-17')
  const rd2 = await L.calRead(p)
  await L.clearToasts(p)
  await L.press(T, p.locator('#inpEditSave'))
  const up2 = await sheet.waitFor({ timeout: 4000 }).then(() => true, () => false)
  const stxt = up2 ? (await sheet.innerText()).replace(/\s+/g, ' ') : ''
  pics.push(await L.shot(p, 'B45-2-summary'))
  notes.push(`one date 17 Jul: read "${rd2}"; summary: "${stxt}"`)
  if (up2) { await L.press(T, sheet.locator('[data-testid="upconf-save"]')); await p.waitForTimeout(700) }
  const after2 = await snap()
  notes.push(`after confirming: ${after2}; toasts ${JSON.stringify(await L.toasts(p))}`)
  await L.undo(p); const u = await snap(); await L.redo(p)
  notes.push(`Undo -> ${u}`)
  await ctx.close()
  const ok = after1 === base && !sheetUp && t1.length > 0 && !/Input updated|Saved|added/i.test(t1.join(' ')) && up2 && /ends Jul 16/.test(stxt) && /Upchit Jul 17$/.test(after2) && u === base
  return { ok, saw: notes.join(' || '), pics }
})
L.save('ph1')
console.log(L.errs)
await browser.close()
