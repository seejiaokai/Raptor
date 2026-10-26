// Walker 2 — scenario 22: the drag window's typed words on REFUSE (D1339, D1341). usage: node lw-night-w2-s22.mjs [desk|phone]
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, kinds, place, dayWindow, closeSheet, warRecs, dayWords, dragCells, typeInto, undoPress, redoPress, changeKeys, sleep } = H
const size = process.argv[2] || 'desk'
const tag = `s22-${size === 'phone' ? 'ph' : 'dk'}`
console.log('lw-night-w2-s22 v1', size, tag)
H.clearPics(tag)
const w = await L.newCtx(size)
const P = w.page
await H.signInAs(w, 'admin')
const ids = await H.people(P)
const D1 = '2026-12-01', D2 = '2026-12-02', D3 = '2026-12-03'
const WORDS = 'Family trip to KL'
const who = ids.Drifter
const ID = n => `22${n}`
const shots = []
const snap = async n => { await L.shot(w, `${tag}-${n}`); shots.push(`${tag}-${n}`); return `${tag}-${n}` }
try {
  // ---- fixtures
  await place(w, who, D1, 'LL', { approve: false, remarks: 'Dentist' })
  await place(w, who, D2, 'LL', { approve: false })
  await place(w, who, D3, 'OL', { approve: false, remarks: 'Trip' })
  const fx = {}
  for (const d of [D1, D2, D3]) fx[d] = (await warRecs(P, who, d)).filter(r => r.kind === 'request').map(r => ({ code: r.code, state: r.state, remarks: r.remarks ?? '' }))
  console.log('fixtures', JSON.stringify(fx))
  const fxOk = fx[D1].length === 1 && fx[D1][0].state === 'pending' && fx[D1][0].remarks === 'Dentist' && fx[D2].length === 1 && fx[D2][0].state === 'pending' && !fx[D2][0].remarks && fx[D3].length === 1 && fx[D3][0].code === 'OL' && fx[D3][0].state === 'pending' && fx[D3][0].remarks === 'Trip'
  if (!fxOk) throw new Error('fixtures wrong: ' + JSON.stringify(fx))
  const before = {}
  for (const d of [D1, D2, D3]) before[d] = await dayWords(P, who, d)
  const nCh0 = (await changeKeys(P)).length
  // ---- the drag, the words, Refuse
  if (!(await dragCells(w, [who, D1], [who, D3]))) throw new Error('no drag window over 1–3 Dec')
  const head = await L.txt(P, T('sel-span'))
  const box0 = await P.locator(T('sel-remarks')).inputValue()
  await typeInto(w, T('sel-remarks'), WORDS)
  const box1 = await P.locator(T('sel-remarks')).inputValue()
  const pTyped = await snap('01-typed')
  console.log(`drag window "${head}", box before "${box0}", after typing "${box1}"`)
  if (w.phone) await L.step(w, `${tag}-02-refuse`, T('sel-refuse')); else { await L.press(w, T('sel-refuse')); await sleep(w, 500); await snap('02-refuse') }
  await sleep(w, 400)
  const stillOpen = await L.vis(P, T('select-sheet'))
  const note = await L.txt(P, T('sel-note'))
  const after = {}
  for (const d of [D1, D2, D3]) after[d] = { boxes: await kinds(w, who, d), words: await dayWords(P, who, d) }
  const refused = [D1, D2, D3].every(d => after[d].boxes.length === 1 && after[d].boxes[0].split('|')[2] === 'r')
  const allWords = [D1, D2, D3].every(d => after[d].words.reqs.length === 1 && after[d].words.reqs[0].endsWith(`/refused/"${WORDS}"`))
  const nCh1 = (await changeKeys(P)).length
  rec(ID('a'), size, refused && allWords ? 'PASS' : 'FAIL', `typed "${box1}" over ${head}, Refuse: cells ${JSON.stringify([D1, D2, D3].map(d => after[d].boxes))}; saved words ${JSON.stringify([D1, D2, D3].map(d => after[d].words.reqs))}; the window ${stillOpen ? 'stayed open, note: ' + note : 'closed'}; changes saved by the one press: ${nCh1 - nCh0}`, [`${tag}-01-typed`, `${tag}-02-refuse` + (w.phone ? '-q' : '')])
  if (stillOpen) await closeSheet(w)
  // ---- each one-day window shows the words
  const wins = {}
  for (const [i, d] of [D1, D2, D3].entries()) {
    wins[d] = await dayWindow(w, who, d)
    await snap(`03-window-${d.slice(8)}`)
    await closeSheet(w)
  }
  const winOk = [D1, D2, D3].every(d => wins[d].sheet === 'bid-picker' && wins[d].remarks === WORDS)
  rec(ID('b'), size, winOk ? 'PASS' : 'FAIL', `the one-day windows read: ${JSON.stringify([D1, D2, D3].map(d => ({ d: d.slice(5), sheet: wins[d].sheet, remarks: wins[d].remarks, lit: wins[d].lit })))}`, [D1, D2, D3].map(d => `${tag}-03-window-${d.slice(8)}`))
  // ---- Undo, press by press (the house order elsewhere: the action first, the words next; here RECORD)
  const steps = []
  const state = async () => { const o = {}; for (const d of [D1, D2, D3]) { const r = (await dayWords(P, who, d)).reqs; o[d.slice(8)] = r.join(';') } return o }
  const s0 = await state()
  let back = false
  for (let i = 1; i <= 6; i++) {
    const r = await undoPress(w, `${tag}-04-undo${i}`)
    const st = await state()
    steps.push({ i, title: r.before, st })
    const origBack = [D1, D2, D3].every(d => (st[d.slice(8)] || '') === before[d].reqs.join(';'))
    if (origBack) { back = true; break }
    if (r.disabled) break
  }
  console.log('undo steps', JSON.stringify(steps))
  rec(ID('c'), size, 'RECORD', `Undo after the Refuse with words: ${steps.length} press(es) to bring the three days back to their first state (${back ? 'reached' : 'NOT reached within 6'}). Press by press (the words the button carried; the three days then): ${steps.map(s => `#${s.i} "${s.title}" → ${JSON.stringify(s.st)}`).join(' | ')}`, steps.map(s => `${tag}-04-undo${s.i}` + (w.phone ? '' : '')))
  // ---- Redo back, then a reload keeps it
  let redone = 0
  for (let i = 0; i < steps.length; i++) { await redoPress(w); redone++ }
  const sR = await state()
  const redoOk = [D1, D2, D3].every(d => /refused/.test(sR[d.slice(8)]) && sR[d.slice(8)].endsWith(`"${WORDS}"`))
  console.log('after redo', JSON.stringify(sR))
  await H.reloadAs(w, 'admin')
  const rl = {}
  for (const d of [D1, D2, D3]) { await L.reachCell(w, who, d); rl[d] = await dayWords(P, who, d) }
  const rlOk = [D1, D2, D3].every(d => rl[d].reqs.length === 1 && rl[d].reqs[0].endsWith(`/refused/"${WORDS}"`))
  await L.reachCell(w, who, D2)
  const wr = await dayWindow(w, who, D2)
  await snap('05-after-reload-window-02')
  await closeSheet(w)
  rec(ID('d'), size, redoOk && rlOk && wr.remarks === WORDS ? 'PASS' : 'FAIL', `Redo x${redone} brought back: ${JSON.stringify(sR)}; after a reload (signed in again) the saved words are ${JSON.stringify([D1, D2, D3].map(d => rl[d].reqs))}; 2 Dec's window reads "${wr.remarks}" (${wr.sheet})`, [`${tag}-05-after-reload-window-02`])
  // ---- 22b: the day's list, two entries on one day (Ridge, 4 Dec: a morning LL "Am" and an afternoon OL "Pm") — drag 4-5 Dec, words, Refuse
  const ridge = ids.Ridge, D4 = '2026-12-04', D5 = '2026-12-05'
  let listText = null
  try {
    await place(w, ridge, D4, 'LL', { approve: false, portion: 'am', remarks: 'Am' })
    await L.openCellR(w, ridge, D4)
    const w2 = await sheetOfNow(P)
    if (w2 === 'bid-picker' && await L.vis(P, T('portion-pm'))) {
      await L.press(w, T('portion-pm'))
      await L.press(w, T('bid-remarks')); await P.keyboard.type('Pm'); await sleep(w, 150)
      const okPm = await L.placeLeave(w, 'OL')
      if (!okPm) throw new Error('PM OL not placed')
    } else throw new Error('4 Dec reopened as ' + w2)
    const fx2 = (await warRecs(P, ridge, D4)).filter(r => r.kind === 'request').map(r => `${r.code}/${r.state}/"${r.remarks ?? ''}"`)
    if (fx2.length !== 2) throw new Error('4 Dec holds ' + JSON.stringify(fx2))
    if (!(await dragCells(w, [ridge, D4], [ridge, D5]))) throw new Error('no drag window over 4–5 Dec')
    await typeInto(w, T('sel-remarks'), WORDS)
    await L.press(w, T('sel-refuse')); await sleep(w, 600)
    if (await L.vis(P, T('select-sheet'))) await closeSheet(w)
    await L.openCellR(w, ridge, D4)
    const sh = await sheetOfNow(P)
    listText = sh === 'daylist-sheet' ? (await L.txt(P, T('daylist-sheet'))) + ' || boxes: ' + JSON.stringify(await P.locator(T('daylist-sheet') + ' textarea').evaluateAll(es => es.map(e => e.value))) : `(opened ${sh}) ` + ((await L.sheetDump(P))?.text ?? '')
    await snap('06-daylist')
    await closeSheet(w)
    const after4 = (await warRecs(P, ridge, D4)).filter(r => r.kind === 'request').map(r => `${r.code}/${r.state}/"${r.remarks ?? ''}"`)
    const cnt = (listText.match(new RegExp(WORDS, 'g')) || []).length
    rec(ID('e'), size, sh === 'daylist-sheet' && cnt === 2 && after4.every(x => x.includes('refused') && x.endsWith(`"${WORDS}"`)) ? 'PASS' : 'FAIL', `4 Dec (a morning LL "Am" and an afternoon OL "Pm"), dragged 4–5 Dec, words, Refuse: saved ${JSON.stringify(after4)}; the day's list (${sh}) reads: ${listText.slice(0, 260)}`, [`${tag}-06-daylist`])
  } catch (e) { rec(ID('e'), size, 'NOT DONE', 'the day-list case: ' + String(e).slice(0, 260), []); await L.closeAny(w) }
} catch (e) {
  rec(ID('!'), size, 'NOT DONE', String(e).slice(0, 400), shots)
  await snap('99-error').catch(() => {})
}
rec('22-errors', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
H.saveResults(tag)
await w.ctx.close()
await H.finish()
async function sheetOfNow(P) { return H.sheetOf(P) }
