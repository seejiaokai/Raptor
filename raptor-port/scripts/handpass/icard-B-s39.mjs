// #39 Leave onto other leave - Ranger (member), phone 390x844, own inputs, by touch
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const { ctx, page: p } = await L.open(browser, { width: 390, height: 844 }, 'us', 'us', true)
await L.watchToasts(p)
const T = true
const ran = await L.csId(p, 'Ranger')
const snap = async () => (await L.recs(p, { person: ran })).filter(r => /^(LL|OL|CL|PL)$/.test(r.type)).map(r => `${r.type} ${r.date}${r.endDate ? '→' + r.endDate : ''} ${r.half || (r.s + '-' + r.e)}`).sort().join(' ; ')
const pics = []
await L.scn(39, '390x844 touch', 'Ranger (member), own inputs', async () => {
  const notes = []
  // first leave: LL 21 Jul custom 09:00-11:00
  await L.openDay(p, '2026-07-21', T); await L.press(T, p.locator('#icPopAdd')); await p.locator(L.WIN).waitFor()
  await p.selectOption('#inpEditType', 'LL')
  await L.setSpan(p, T, 'Custom'); await L.setTimes(p, '09:00', '11:00')
  await L.saveWin(p, T)
  // second leave: LL 22 Jul all day
  await L.fileInput(p, T, { iso: '2026-07-22', type: 'LL' })
  const base = await snap(); notes.push('setup: ' + base)
  const second = (await L.recs(p, { person: ran })).find(r => r.type === 'LL' && r.date === 'Jul 22')
  await L.openFromList(p, T, second.iid)
  await L.tapDate(p, T, '2026-07-21')
  await L.setSpan(p, T, 'Custom'); await L.setTimes(p, '10:00', '12:00')
  notes.push('read: ' + await L.calRead(p))
  await L.clearToasts(p)
  await L.press(T, p.locator('#inpEditSave')); await p.waitForTimeout(900)
  const tA = await L.toasts(p)
  const winStill = await p.locator(L.WIN).count()
  const after = await snap()
  pics.push(await L.shot(p, 'B39-1-refused'))
  const inWin = winStill ? (await p.locator(L.WIN).innerText()).replace(/\s+/g, ' ').slice(-300) : ''
  const draftTimes = winStill ? [await p.inputValue('#inpEditStart'), await p.inputValue('#inpEditEnd')] : null
  notes.push(`after Save at 10:00-12:00: toasts ${JSON.stringify(tA)}; window still open ${winStill}; draft times ${JSON.stringify(draftTimes)}; saved: ${after}`)
  // retry 11:00-12:00
  if (!winStill) { await L.openFromList(p, T, second.iid); await L.tapDate(p, T, '2026-07-21'); await L.setSpan(p, T, 'Custom') }
  await L.setTimes(p, '11:00', '12:00')
  await L.clearToasts(p)
  await L.saveWin(p, T)
  const tB = await L.toasts(p)
  const after2 = await snap()
  pics.push(await L.shot(p, 'B39-2-retry'))
  notes.push(`after retry 11:00-12:00: toasts ${JSON.stringify(tB)}; saved: ${after2}`)
  await L.undo(p); const u = await snap(); await L.redo(p); const r = await snap()
  notes.push(`Undo: ${u}; Redo: ${r}`)
  const refused = after === base && winStill === 1 && tA.some(t => /LL|leave|clash|overlap|already/i.test(t))
  const ok = refused && /^LL Jul 21 /.test(after2.split(' ; ').sort()[0] || '') && after2.split(' ; ').length === 2 && u === base && r === after2 && /11:00/.test('') === false
  return { ok, saw: notes.join(' || '), pics }
})
L.save('s39')
console.log(L.errs)
await browser.close()
