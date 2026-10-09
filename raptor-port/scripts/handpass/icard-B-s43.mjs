// #43 Medical cuts leave through the new date door - Ranger (member), phone 390x844 by touch
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const { ctx, page: p } = await L.open(browser, { width: 390, height: 844 }, 'us', 'us', true)
await L.watchToasts(p)
const T = true
const ran = await L.csId(p, 'Ranger')
const snap = async () => (await L.recs(p, { person: ran })).filter(r => /^(LL|ATT C)$/.test(r.type)).map(r => `${r.type} ${r.date}${r.endDate ? '→' + r.endDate : ''} ${r.half || (r.s + '-' + r.e)}`).sort().join(' ; ')
const pics = []
await L.scn(43, '390x844 touch', 'Ranger (member), own inputs', async () => {
  const notes = []
  await L.fileInput(p, T, { iso: '2026-07-23', type: 'LL' })
  await L.fileInput(p, T, { iso: '2026-07-27', type: 'ATT C', doc: L.DOC })
  const base = await snap(); notes.push('setup: ' + base)
  const att = (await L.recs(p, { person: ran })).find(r => r.type === 'ATT C')
  await L.openFromList(p, T, att.iid)
  await L.tapDate(p, T, '2026-07-23'); await L.setSpan(p, T, 'AM')
  notes.push('read: ' + await L.calRead(p))
  await L.clearToasts(p)
  await L.press(T, p.locator('#inpEditSave')); await p.waitForTimeout(900)
  pics.push(await L.shot(p, 'B43-1-after-save-press'))
  const afterSave = await snap()
  notes.push(`after Save: toasts ${JSON.stringify(await L.toasts(p))}; saved: ${afterSave}`)
  await L.openDay(p, '2026-07-23', T)
  const cards = await L.card(p, L.DAYWIN, 'idy').evaluateAll(els => els.map(e => e.innerText.replace(/\s+/g, ' ')))
  pics.push(await L.shot(p, 'B43-2-day23-cards'))
  notes.push('day 23 cards: ' + cards.filter(t => /Ranger/.test(t)).join(' || '))
  await L.closeAll(p)
  await L.undo(p); const u = await snap(); await L.redo(p); const r = await snap()
  notes.push(`Undo: ${u}; Redo: ${r}`)
  const ok = afterSave === 'ATT C Jul 23 am ; LL Jul 23 pm' && u === base && r === afterSave
  return { ok, saw: notes.join(' || ') + ' || (the leave balance itself is not readable: the demo carries no counter on the Leave War; the stored LL became PM, i.e. the morning is returned)', pics }
})
L.save('s43')
console.log(L.errs)
await browser.close()
