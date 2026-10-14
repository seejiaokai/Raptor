/* helper walk S17: nothing to ask — the cancel taken off where no OIL question is due.
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-9.mjs [desk|phone] */
import { L, J, publish, file, mark, board, closeBoard, rowBtn, uncx, makeHoliday, closeWindows, sheet, bar, noteNow, rec, rowOut, part, inputsCal, openAdd, fillForm, SAT, FRI, WED, SAT_ISO, FRI_ISO, WED_ISO } from './ou-h-0.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE, S = `S17 ${T}`
const w = await L.world(SIZE), p = w.page
console.log('ou-h-9 S17 version 1', SIZE)
/** file a Personal input (no OIL question for it) */
async function filePersonal(iso, who, title) {
  await inputsCal(w, iso.slice(0, 8) + '13'); await openAdd(w, iso)
  await fillForm(w, { type: 'Personal', person: who, start: '09:00', end: '10:00', title })
  const before = await p.evaluate(() => window.INPUTS.map(x => String(x.iid)))
  await w.press('#inpEditSave'); await L.sleep(700)
  const asked = !!(await p.locator('[data-testid="oilconf"]').count())
  if (asked) { await w.press('[data-testid="oil-yes"]'); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(600) }
  const id = await p.evaluate(b => { const n = window.INPUTS.find(x => !b.includes(String(x.iid))); return n ? String(n.iid) : null }, before)
  const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().evaluate(e => e.click()); await L.sleep(250)
  return { id, asked }
}
/** the un-cancel on a row, the answer-less way: what the screen did */
async function off(di, id, label) {
  await board(w, di)
  const q0 = await sheet(p)
  await uncx(w, di, id)
  const q = await sheet(p), note = await noteNow(p), b = await bar(p), r = await rec(p, id)
  await L.pic(w, `S17-${label}-${T}`)
  await closeBoard(w)
  return { q, note, b, r }
}
try {
  await part(w, S, 'S17a a Personal input on a non-working Saturday', 'taken off at once: no question, "Restored"', async () => {
    const f = await filePersonal(SAT_ISO, 'bane', 'Dentist')
    await mark(w, SAT, f.id, 'cx')
    const m = await rec(p, f.id)
    const o = await off(SAT, f.id, 'a-personal-sat')
    rowOut(S, 'S17a Personal on Saturday', 'no question, no bar; un-cancelled at once', `asked at filing ${f.asked}; cancelled ${J(m)}; after CX off: question ${J(o.q)}, bar ${J(o.b)}, note "${o.note}", input ${J(o.r)}`, !f.asked && m.cx && !o.q && !o.b && !o.r.cx)
  })
  await part(w, S, 'S17b a Personal input on a holiday', 'taken off at once on a public holiday too', async () => {
    const f = await filePersonal(FRI_ISO, 'bane', 'Dentist Fri')
    await mark(w, FRI, f.id, 'cx')
    const h = await makeHoliday(w, FRI_ISO); await closeWindows(w)
    const m = await rec(p, f.id)
    const o = await off(FRI, f.id, 'b-personal-holiday')
    rowOut(S, 'S17b Personal on a holiday', 'no question, no bar; un-cancelled at once', `holiday's list ${J(h.list && { count: h.list.count, has: h.list.ids.includes(f.id) })}; cancelled ${J(m)}; after CX off: question ${J(o.q)}, bar ${J(o.b)}, note "${o.note}", input ${J(o.r)}`, m.cx && !o.q && !o.b && !o.r.cx)
  })
  await part(w, S, 'S17c a working-day input', 'taken off at once', async () => {
    const f = await file(w, WED_ISO, 'bane', 'Range brief')
    await mark(w, WED, f.id, 'cx')
    const m = await rec(p, f.id)
    const o = await off(WED, f.id, 'c-working-day')
    rowOut(S, 'S17c a working-day input', 'no question, no bar; un-cancelled at once', `filing asked ${f.asked}; cancelled ${J(m)}; after CX off: question ${J(o.q)}, bar ${J(o.b)}, note "${o.note}", input ${J(o.r)}`, m.cx && !o.q && !o.b && !o.r.cx)
  })
  await part(w, S, 'S17d a scheduler\'s own cancelled Ground row on Saturday', 'taken off at once as before (D760 reading 5)', async () => {
    await board(w, SAT)
    const n0 = await p.evaluate(() => window.DAYS[5].ground.length)
    await p.locator('#schedBoard [data-gradd="5"]').first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() }); await L.sleep(600)
    const n1 = await p.evaluate(() => window.DAYS[5].ground.length), idx = n1 - 1
    await p.locator(`#schedBoard [data-grcx="5.${idx}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() }); await L.sleep(400)
    await p.fill('#cxReason', 'WX'); await p.locator('#cxSave').evaluate(e => e.click()); await L.sleep(500)
    const m = await p.evaluate(i => { const g = window.DAYS[5].ground[i]; return { cx: !!g.cx, src: g.src || '' } }, idx)
    await p.locator(`#schedBoard [data-grcx="5.${idx}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() }); await L.sleep(400)
    await p.waitForSelector('#cxPop:not([hidden]) #cxUn'); await p.locator('#cxUn').evaluate(e => e.click()); await L.sleep(500)
    const q = await sheet(p), b = await bar(p), note = await noteNow(p), a = await p.evaluate(i => { const g = window.DAYS[5].ground[i]; return { cx: !!g.cx } }, idx)
    await L.pic(w, `S17d-own-row-${T}`)
    rowOut(S, 'S17d the scheduler\'s own Ground row', 'no question; un-cancelled at once', `rows ${n0} to ${n1}; cancelled ${J(m)}; after CX off: question ${J(q)}, bar ${J(b)}, note "${note}", row ${J(a)}`, m.cx && !m.src && !q && !b && !a.cx)
    await closeBoard(w)
  })
  await part(w, S, 'S17e leave, medical, an overseas duty under Unavailable', 'a leave and a medical input at once; an overseas duty asks (D804)', async () => {
    for (const [type, who, opt] of [['OD', 'pike', { start: '09:00', end: '10:00', title: 'od' }], ['LL', 'bane', { allday: true }]]) {
      await inputsCal(w, '2026-07-13'); await openAdd(w, SAT_ISO)
      await fillForm(w, { type, person: who, ...opt })
      await w.press('#inpEditSave'); await L.sleep(700)
      if (await p.locator('[data-testid="oilconf"]').count()) { await w.press('[data-testid="oil-yes"]'); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(600) }
      const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().evaluate(e => e.click()); await L.sleep(250)
    }
    const r = await (async () => { await board(w, SAT); return p.evaluate(() => { const sec = [...document.querySelectorAll('#schedBoard .sb-sec')].find(s => /UNAVAILABLE/i.test(s.innerText.slice(0, 40))); return sec ? { text: sec.innerText.replace(/\s+/g, ' ').slice(0, 160), buttons: [...sec.querySelectorAll('button')].map(b => (b.innerText || b.title || '').trim().slice(0, 20)), cx: sec.querySelectorAll('[data-grcx]').length } : null }) })()
    L.row(S, 'S17e leave / medical / overseas duty', 'CX off on a leave and a medical input at once; on an overseas duty the question', `NOT WALKED: Saturday's Unavailable section offers no CX or information-only control on any row (its buttons read ${J(r)}), so there is no door to press CX off on a leave, a medical or an overseas-duty input from the board`, 'NOT WALKED')
    await closeBoard(w)
  })
} finally { await L.close(w) }
