// #40 Leave onto medical - Saber (admin), desktop 1440x900
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const { ctx, page: p } = await L.open(browser, { width: 1440, height: 900 })
await L.watchToasts(p)
const T = false
const sab = await L.csId(p, 'Saber')
const snap = async () => (await L.recs(p, { person: sab })).filter(r => /^(LL|ATT C)$/.test(r.type)).map(r => `${r.type} ${r.date}${r.endDate ? '→' + r.endDate : ''} ${r.half || (r.s + '-' + r.e)}`).sort().join(' ; ')
const pics = []
await L.scn(40, '1440x900', 'Saber (admin)', async () => {
  const notes = []
  await L.openDay(p, '2026-07-21', T); await L.press(T, p.locator('#icPopAdd')); await p.locator(L.WIN).waitFor()
  await p.selectOption('#inpEditType', 'ATT C'); await L.setSpan(p, T, 'Custom'); await L.setTimes(p, '09:00', '11:00')
  await L.attachDoc(p, L.DOC)
  await L.saveWin(p, T)
  await L.fileInput(p, T, { iso: '2026-07-22', type: 'LL' })
  const base = await snap(); notes.push('setup: ' + base)
  const ll = (await L.recs(p, { person: sab })).find(r => r.type === 'LL' && r.date === 'Jul 22')
  await L.openFromList(p, T, ll.iid)
  await L.tapDate(p, T, '2026-07-21'); await L.setSpan(p, T, 'Custom'); await L.setTimes(p, '10:00', '12:00')
  await L.clearToasts(p)
  await p.click('#inpEditSave'); await p.waitForTimeout(900)
  const tA = await L.toasts(p)
  const winStill = await p.locator(L.WIN).count()
  const after = await snap()
  pics.push(await L.shot(p, 'B40-1-refused'))
  notes.push(`overlapping 10:00-12:00: toasts ${JSON.stringify(tA)}; window open ${winStill}; saved: ${after}`)
  if (!winStill) { await L.openFromList(p, T, ll.iid); await L.tapDate(p, T, '2026-07-21'); await L.setSpan(p, T, 'Custom') }
  await L.setTimes(p, '11:00', '12:00')
  await L.clearToasts(p)
  await L.saveWin(p, T)
  const tB = await L.toasts(p); const after2 = await snap()
  pics.push(await L.shot(p, 'B40-2-retry'))
  notes.push(`non-overlapping 11:00-12:00: toasts ${JSON.stringify(tB)}; saved: ${after2}`)
  await L.undo(p); const u = await snap(); await L.redo(p); const r = await snap()
  notes.push(`Undo: ${u}; Redo: ${r}`)
  const refused = after === base && tA.some(t => /ATT C/i.test(t))
  const ok = refused && /LL Jul 21 660-720/.test(after2) && /ATT C Jul 21 540-660/.test(after2) && u === base && r === after2
  return { ok, saw: notes.join(' || '), pics }
})
L.save('s40')
console.log(L.errs)
await browser.close()
