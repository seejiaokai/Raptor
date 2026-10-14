/* THE RE-WALK OF WHAT THE FIXES TOUCHED — the small OIL job, after the fresh read of the finished code (F1–F4, 14 Oct 26).
   Assertions of the RIGHT behaviour on the rebuilt app, with pictures; fixtures by the app's own controls.
     R1 (F1, F3) an input of two days, Thu 16 – Fri 17 Jul; Thursday published; Friday made a public holiday, its list
        left for later; the input taken off; Thursday's Original loaded back: the note counts it, and the one list opens
        for FRIDAY — the day that needs the answer — headed as the holiday, its foot promising the schedulers' bells
        (they were told of this holiday)
     R2 (F2) Friday made a holiday with NO name of its own; an input taken off and loaded back: the list is headed
        "Public holiday" alone — never "Public holiday · PH"
     R3 (F4) two inputs on Saturday, the later row cancelled and unanswered; "Don’t un-cancel"; the other row taken off
        (the cancelled one moves up); "Answer OIL", "Don’t un-cancel": the flash is on the cancelled input's own button
   usage: DL_BASE=http://localhost:4174 DL_SHOTS=docs/img/handpass/2026-10-14-oil-uncancel-load node scripts/handpass/ou-walk-3.mjs [phone|desk] */
import { L, rowOut, part, inputsCal, openAdd, fillForm, SAT, FRI, FRI_ISO, noteNow, rec, board, closeBoard, rowBtn, sheet, bar, list, file, fixture, uncx, closeWindows, loadVersion } from './ou-lib.mjs'
import { publish } from './lib.mjs'

const SIZE = process.argv[2] === 'desk' ? 'desk' : 'phone', T = SIZE, THU = 3, THU_ISO = '2026-07-16'
const J = x => JSON.stringify(x)
const foot = p => p.evaluate(() => (document.querySelector('[data-testid="odl-left"]')?.textContent || '').trim())
/* a holiday through Inputs ⚙ → Calendar → Holidays, with the name given ('' = none of its own) */
async function holiday(w, iso, name) {
  const p = w.page, tid = t => p.locator(`[data-testid="${t}"]`)
  await L.go(w, 'inputs')
  await w.press('#inGear'); await L.sleep(350)
  await w.press('[data-testid="iset-days"]'); await L.sleep(600)
  if (await tid('days-tab-holidays').count()) { await w.press('[data-testid="days-tab-holidays"]'); await L.sleep(300) }
  await w.press('[data-testid="hol-add"]'); await L.sleep(450)
  await w.press('[data-testid="hol-kind-ph"]')
  await tid('hol-name').fill(name)
  const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  for (let i = 0; i < 36 && !(await tid(`holcal-day-${iso}`).count()); i++) {
    const [m, y] = (await tid('holcal-month').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MON.findIndex(x => m.startsWith(x)), want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
    await w.press(`[data-testid="holcal-${at < want ? 'next' : 'prev'}-month"]`)
  }
  await w.press(`[data-testid="holcal-day-${iso}"]`); await L.sleep(200)
  await w.press('[data-testid="hol-save"]'); await L.sleep(900)
  const l = await list(p)
  if (l) { await w.press('[data-testid="odl-later"]'); await L.sleep(300) }
  await closeWindows(w)
  return l
}

{ /* ───── R1: an input of two days ───── */
  const w = await L.world(SIZE), p = w.page, S = `R ${T}`
  try {
    await part(w, S, 'R1 an input Thu–Fri put back by a load of Thursday; Friday a holiday with no answer', 'the note ends "· 1 input needs an OIL answer"; the one list opens for Fri 17 Jul, headed as the holiday, with the input on it; its foot promises the schedulers’ bells', async () => {
      /* filed on Thursday for two days, through the form's own calendar */
      await inputsCal(w, '2026-07-13'); await openAdd(w, THU_ISO)
      await fillForm(w, { type: 'Meeting', person: 'bane', allday: true, title: 'Det prep' })
      await w.press('#inpEditPop #inpEdCal [data-cal="2026-07-17"]'); await L.sleep(250)
      const before = await p.evaluate(() => window.INPUTS.map(x => String(x.iid)))
      await w.press('#inpEditSave'); await L.sleep(800)
      const askedAtSave = !!(await p.locator('[data-testid="oilconf"]').count())
      const id = await p.evaluate(b => { const n = window.INPUTS.find(x => !b.includes(String(x.iid))); return n ? String(n.iid) : null }, before)
      const filed = await p.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === id); return r ? { date: r.date, endDate: r.endDate || '', acc: r.acc, oil: r.oil || null } : null }, id)
      await closeWindows(w)
      if (!filed || filed.date !== 'Jul 16' || filed.endDate !== 'Jul 17') { rowOut(S, 'R1 an input Thu–Fri put back by a load of Thursday; Friday a holiday with no answer', 'filed Thu 16 – Fri 17 Jul through the form', `the form did not file a two-day input: ${J(filed)}; asked at the save: ${askedAtSave}`, false); return }
      const di = await p.evaluate(id => window.DAYS.findIndex(d => (d.ground || []).some(g => String(g.src) === id)), id)
      await board(w, THU)
      const pub = await publish(p, THU); await L.sleep(600)
      await closeBoard(w)
      const hl = await holiday(w, FRI_ISO, 'Walk holiday')
      await board(w, THU)
      await rowBtn(w, THU, id, 'grdel'); await L.sleep(350)
      const off = await rec(p, id)
      const where = w.phone ? 'board' : 'week'
      if (!w.phone) await closeBoard(w)
      const r = await loadVersion(w, THU, where)
      const ft = await foot(p)
      await L.pic(w, `R1-two-day-loaded-${T}`)
      const on = await rec(p, id)
      rowOut(S, 'R1 an input Thu–Fri put back by a load of Thursday; Friday a holiday with no answer', 'the note ends "· 1 input needs an OIL answer"; the one list opens for Fri 17 Jul, headed as the holiday, with the input on it; its foot promises the schedulers’ bells',
        `filed ${J(filed)} (its row on day ${di}); asked at the save: ${askedAtSave}; publish ${J(pub)}; the holiday's own list ${J(hl)}; taken off ${J(off)}; note "${r.note}"; the list ${J(r.list)}; its foot "${ft}"; after ${J(on)}`,
        !askedAtSave && di === THU && pub.published && off.acc !== 'g' && / · 1 input needs an OIL answer$/.test(r.note) && !!r.list && /OIL — Fri 17 Jul/.test(r.list.head) && /Public holiday · Walk holiday/.test(r.list.head) && r.list.ids.includes(id) && r.list.reach === true && ft === 'What is left goes to the schedulers’ bells' && on.acc === 'g')
    })
  } finally { await L.close(w) }
}

{ /* ───── R2: a holiday with no name of its own ───── */
  const w = await L.world(SIZE), p = w.page, S = `R ${T}`
  try {
    await part(w, S, 'R2 a load on a holiday with no name of its own', 'the list is headed "Public holiday" alone — never "Public holiday · PH"', async () => {
      const A = await file(w, FRI_ISO, 'bane', 'Range brief')
      await board(w, FRI)
      const pub = await publish(p, FRI); await L.sleep(600)
      await closeBoard(w)
      const hl = await holiday(w, FRI_ISO, '')
      await board(w, FRI)
      await rowBtn(w, FRI, A.id, 'grdel'); await L.sleep(350)
      const where = w.phone ? 'board' : 'week'
      if (!w.phone) await closeBoard(w)
      const r = await loadVersion(w, FRI, where)
      await L.pic(w, `R2-unnamed-holiday-${T}`)
      rowOut(S, 'R2 a load on a holiday with no name of its own', 'the list is headed "Public holiday" alone — never "Public holiday · PH"',
        `publish ${J(pub)}; the holiday's own list ${J(hl)}; note "${r.note}"; the list ${J(r.list)}`,
        pub.published && /OIL answer$/.test(r.note) && !!r.list && /Public holiday/.test(r.list.head) && !/Public holiday ·/.test(r.list.head) && r.list.ids.includes(A.id))
    })
  } finally { await L.close(w) }
}

{ /* ───── R3: the flash follows the input ───── */
  const w = await L.world(SIZE), p = w.page, S = `R ${T}`
  /* which element of the board is wearing the landing flash right now */
  const flashing = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard .lift-land, #schedBoard [data-grcx].lift-land')].map(e => e.getAttribute('data-grcx') || e.className).join(' | '))
  try {
    await part(w, S, 'R3 the flash after "Don’t un-cancel", a row taken off above it meanwhile', 'the cancelled input’s own CX button flashes — at the place its row has now', async () => {
      const X = await fixture(w, 'bane', 'Range brief'), Y = await fixture(w, 'pike', 'Hangar brief')
      /* Y's cancel is taken off for good with an answer, so there is a live row beside X's cancelled one */
      await board(w, SAT)
      await uncx(w, SAT, Y.id); await w.press('[data-testid="oil-yes"]'); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(500)
      const ri = id => p.evaluate(id => window.DAYS[5].ground.findIndex(g => String(g.src) === id), id)
      const x0 = await ri(X.id), y0 = await ri(Y.id)
      /* the wait is put on whichever of the two stands LOWER, the other is the one taken off */
      const low = x0 > y0 ? X : Y, high = low === X ? Y : X
      if (low === Y) { await rowBtn(w, SAT, Y.id, 'grcx'); await p.fill('#cxReason', 'WX'); await p.locator('#cxSave').evaluate(e => e.click()); await L.sleep(500); await uncx(w, SAT, X.id); await w.press('[data-testid="oil-yes"]'); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(500) }
      const was = await ri(low.id)
      await uncx(w, SAT, low.id); const q1 = await sheet(p)
      await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(350)
      await rowBtn(w, SAT, high.id, 'grdel'); await L.sleep(500)
      const now = await ri(low.id), b1 = await bar(p)
      if (!b1) { rowOut(S, 'R3 the flash after "Don’t un-cancel", a row taken off above it meanwhile', 'the bar outlives another row taken off', `the bar went when the other row was taken off (rows ${was} → ${now})`, false); return }
      await w.press('[data-testid="oilbar-answer"]'); await L.sleep(450); const q2 = await sheet(p)
      await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(120)
      const fl = await flashing()
      await L.pic(w, `R3-flash-${T}`)
      const cx = await rec(p, low.id)
      rowOut(S, 'R3 the flash after "Don’t un-cancel", a row taken off above it meanwhile', 'the cancelled input’s own CX button flashes — at the place its row has now',
        `its row was ${was}, is ${now}; asked "${q1 && q1.lead}", then again "${q2 && q2.lead}"; flashing: "${fl}"; the input ${J(cx)}`,
        now < was && !!q1 && !!q2 && fl === `5.${now}` && cx.cx && !cx.oil)
    })
  } finally { await L.close(w) }
}
