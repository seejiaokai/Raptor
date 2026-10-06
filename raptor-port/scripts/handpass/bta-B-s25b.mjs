/* S25 part B — the Inputs page's CALENDAR VIEW: day popup → a row opens the schedule's input editor (span, type, remarks, Delete);
   "+ Input" files a new one. X sits on blank seats Tue (flying line + duty row) and Wed (flying line). */
import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, W2, ID, CSN, sleep, R, pic } = T
const t = T.mk('s25b')
const TU = 1, WE = 2
const fl = r => r.away.filter(x => /On leave|Medically|Downchit/i.test(x))
const sum = (rt, rw) => `${Q.shortDay(TU, rt)} || ${Q.shortDay(WE, rw)}`

async function calEdit(p, iso, iid, fn, label) {
  if (!(await W2.calDayOpen(p, iso))) return 'the day did not open'
  const row = p.locator(`[data-popiid="${iid}"]`)
  if (!(await row.count())) { await W2.calDayClose(p); return 'no such row in the day popup' }
  await row.click(); await sleep(700)
  await fn()
  await pic(p, `s25b-${label}-editor`)
  return 'editor ready'
}
async function saveEditor(p) {
  await p.locator('#inpEditSave').click(); await sleep(800)
  const asked = []
  for (let i = 0; i < 3; i++) { const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { asked.push('certificate'); await nodoc.click(); await sleep(500); continue }; break }
  await W2.calDayClose(p)
  return `saved${asked.length ? ' (asked ' + asked.join(',') + ')' : ''}`
}
const { browser, p, errors } = await K.fresh()
try {
  await Q.seatDays(p, [TU, WE]); await T.blankRow(p, 'duty', TU)
  const f = await T.file(p, { type: 'LL', di: TU, allday: true, remarks: 'Cal one' })
  const b1t = await Q.readDay(p, TU, 'b1', { noPics: false }), b1w = await Q.readDay(p, WE, 'b1')
  t.add('S25b.1', `LL, All day, Tue 14 filed on the Inputs form (stored: ${await T.rec(p, f.iid)})`, sum(b1t, b1w), fl(b1t).length === 2 ? 'PASS' : 'FAIL', b1t.s.pics)

  const e1 = await calEdit(p, '2026-07-14', f.iid, async () => { await p.locator('#inpEditSpan [data-span="am"]').click() }, 'am')
  const s1 = await saveEditor(p)
  const b2t = await Q.readDay(p, TU, 'b2', { noPics: false }), b2w = await Q.readDay(p, WE, 'b2')
  t.add('S25b.2', `calendar view → 14 Jul → the row → the editor: span set to AM (${e1}; ${s1}); stored: ${await T.rec(p, f.iid)}`, sum(b2t, b2w), fl(b2t).length === 0 ? 'PASS' : 'FAIL', b2t.s.pics)

  const e2 = await calEdit(p, '2026-07-14', f.iid, async () => { await p.locator('#inpEditSpan [data-span="all"]').click(); await p.locator('#inpEditRmk').fill('Cal two') }, 'all')
  const s2 = await saveEditor(p)
  const b3t = await Q.readDay(p, TU, 'b3'), b3w = await Q.readDay(p, WE, 'b3')
  t.add('S25b.3', `the editor again: span back to All day, remarks "Cal two" (${e2}; ${s2}); stored: ${await T.rec(p, f.iid)}`, sum(b3t, b3w), fl(b3t).length === 2 && fl(b3t).every(x => /Cal two/.test(x)) ? 'PASS' : 'FAIL')

  const e3 = await calEdit(p, '2026-07-14', f.iid, async () => { await p.locator('#inpEditType').selectOption('ATT B') }, 'attb')
  const s3 = await saveEditor(p)
  const b4t = await Q.readDay(p, TU, 'b4'), b4w = await Q.readDay(p, WE, 'b4')
  t.add('S25b.4', `the editor: the type changed from LL to ATT B (${e3}; ${s3}); stored: ${await T.rec(p, f.iid)}`, sum(b4t, b4w), b4t.away.some(x => /Downchit but planned to fly this line/.test(x)) && !b4t.away.some(x => /this row/.test(x)) ? 'PASS' : 'FAIL', b4t.s.pics)

  /* + Input on Wed from the calendar */
  let addTxt = 'not tried'
  if (await W2.calDayOpen(p, '2026-07-15')) {
    await p.locator('#icPopAdd').click(); await sleep(700)
    addTxt = await p.evaluate(() => { const e = [...document.querySelectorAll('.airpop, [role=dialog]')].filter(x => x.offsetParent !== null).pop(); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 300) : 'nothing opened' })
    if (await p.locator('#inpEditSave').count()) {
      await p.locator('#inpEditPerson').selectOption(ID).catch(() => {})
      await p.locator('#inpEditType').selectOption('LL').catch(() => {})
      await p.locator('#inpEditRmk').fill('Cal add').catch(() => {})
      await pic(p, 's25b-add-editor')
      addTxt += ' | ' + await saveEditor(p)
    } else await W2.calDayClose(p)
  }
  const b5t = await Q.readDay(p, TU, 'b5'), b5w = await Q.readDay(p, WE, 'b5', { noPics: false })
  t.add('S25b.5', `calendar view → 15 Jul → "+ Input": the form read "${addTxt}"; ${CSN} set, type LL, remarks "Cal add"; all his inputs now ${JSON.stringify(await T.recAll(p))}`, sum(b5t, b5w), fl(b5w).length === 1 ? 'PASS' : 'FAIL', b5w.s.pics)

  const iidW = await p.evaluate(who => { const x = window.INPUTS.filter(r => r.person === who && r.date === 'Jul 15')[0]; return x ? x.iid : null }, ID)
  let delTxt = 'no input found on Wed'
  if (iidW) {
    const e5 = await calEdit(p, '2026-07-15', iidW, async () => {}, 'del')
    await p.locator('#inpEditDel').click(); await sleep(700)
    const conf = await p.evaluate(() => { const e = [...document.querySelectorAll('.airpop, [role=dialog]')].filter(x => x.offsetParent !== null).pop(); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 200) : '' })
    delTxt = `${e5}; after Delete the screen said "${conf}"`
    const yes = p.locator('button:visible').filter({ hasText: /^(Delete|Yes|Confirm|Remove)/ }).last()
    if (await p.locator('#inpEditSave:visible').count() === 0 && await yes.count()) { await yes.click().catch(() => {}); await sleep(600) }
    await W2.calDayClose(p)
  }
  const b6t = await Q.readDay(p, TU, 'b6'), b6w = await Q.readDay(p, WE, 'b6', { noPics: false })
  t.add('S25b.6', `calendar view → 15 Jul → the row → Delete (${delTxt}); his inputs now ${JSON.stringify(await T.recAll(p))}`, sum(b6t, b6w), fl(b6w).length === 0 ? 'PASS' : 'FAIL', b6w.s.pics)
} catch (e) { R('S25b.X', 'script', String(e.stack || e).slice(0, 900), 'FAIL', [await pic(p, 's25b-X')]) }
R('S25b.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
T.done('bta-B-s25b')
