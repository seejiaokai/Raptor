// Walker 2 — scenario 25: the drag window's box edges (a)–(h). usage: node lw-night-w2-s25.mjs [desk|phone] [a,b,c,...]
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, kinds, place, dayWindow, closeSheet, warRecs, dayWords, dragCells, typeInto, sleep, inputsOf, inputsOn } = H
const size = process.argv[2] || 'desk'
const ONLY = process.argv[3] ? new Set(process.argv[3].split(',')) : null
const tag = `s25-${size === 'phone' ? 'ph' : 'dk'}`
console.log('lw-night-w2-s25 v1', size, tag, ONLY ? [...ONLY].join(',') : 'all')
if (!ONLY) H.clearPics(tag)
const w = await L.newCtx(size)
const P = w.page
await H.signInAs(w, 'admin')
const ids = await H.people(P)
const dd = n => `2026-12-${String(n).padStart(2, '0')}`
const shots = []
const snap = async n => { await L.shot(w, `${tag}-${n}`); shots.push(`${tag}-${n}`); return `${tag}-${n}` }
const words = async (who, days) => { const o = {}; for (const n of days) o[n] = (await dayWords(P, ids[who], dd(n))).text; return o }
const fmt = o => Object.entries(o).map(([d, t]) => `${d} Dec: ${t}`).join(' ; ')
const sc = async (id, fn) => { if (ONLY && !ONLY.has(id)) return; console.log(`-- ${id} [${size}]`); try { await fn() } catch (e) { rec(`25${id}`, size, 'NOT DONE', String(e).slice(0, 400), []); await snap(`${id}-error`).catch(() => {}); await P.keyboard.press('Escape').catch(() => {}); await L.closeAny(w); if (await L.vis(P, '#inpEditCancel')) await P.click('#inpEditCancel').catch(() => {}); await H.toWar(w, 'admin').catch(() => {}) } }
/* press Approve in the open drag window (a phone gets its quick picture) */
const approve = async id => { if (w.phone) await L.step(w, `${tag}-${id}-approve`, T('sel-approve')); else { await L.press(w, T('sel-approve')); await sleep(w, 600); await snap(`${id}-approve`) } await sleep(w, 400) }
const twoPending = async (who, a, b, wa, wb, ta = 'LL', tb = 'OL') => {
  await place(w, ids[who], dd(a), ta, { approve: false, remarks: wa })
  await place(w, ids[who], dd(b), tb, { approve: false, remarks: wb })
  const x = await words(who, [a, b]); console.log('fixture', who, fmt(x))
  if (!x[a].includes(`${ta}/pending/"${wa}"`) || !x[b].includes(`${tb}/pending/"${wb}"`)) throw new Error(`${who} fixture: ${fmt(x)}`)
  return x
}

await sc('a', async () => {
  await twoPending('Reaper', 1, 2, 'Aaa', 'Bbb')
  if (!(await dragCells(w, [ids.Reaper, dd(1)], [ids.Reaper, dd(2)]))) throw new Error('no drag window')
  const box = await P.locator(T('sel-remarks')).inputValue()
  await snap('a-before')
  await approve('a')
  const x = await words('Reaper', [1, 2])
  const ok = /input: LL 12-01\/"Aaa"/.test(x[1]) && /input: OL 12-02\/"Bbb"/.test(x[2])
  rec('25a', size, ok ? 'PASS' : 'FAIL', `empty box (it held "${box}"), Approve over 1–2 Dec (LL "Aaa", OL "Bbb"): ${fmt(x)}`, [`${tag}-a-before`, `${tag}-a-approve` + (w.phone ? '-q' : '')])
  if (await L.vis(P, T('select-sheet'))) await closeSheet(w)
})
await sc('b', async () => {
  await twoPending('Anvil', 1, 2, 'Ccc', 'Ddd')
  if (!(await dragCells(w, [ids.Anvil, dd(1)], [ids.Anvil, dd(2)]))) throw new Error('no drag window')
  await typeInto(w, T('sel-remarks'), '   ')
  const box = await P.locator(T('sel-remarks')).inputValue()
  await snap('b-before')
  await approve('b')
  const x = await words('Anvil', [1, 2])
  const ok = /input: LL 12-01\/"Ccc"/.test(x[1]) && /input: OL 12-02\/"Ddd"/.test(x[2])
  rec('25b', size, ok ? 'PASS' : 'FAIL', `spaces only (the box held ${JSON.stringify(box)}), Approve over 1–2 Dec (LL "Ccc", OL "Ddd"): ${fmt(x)}`, [`${tag}-b-before`, `${tag}-b-approve` + (w.phone ? '-q' : '')])
  if (await L.vis(P, T('select-sheet'))) await closeSheet(w)
})
await sc('c', async () => {
  await place(w, ids.Cinch, dd(1), 'LL', { approve: false, remarks: 'Eee' })
  await place(w, ids.Piston, dd(2), 'LL', { approve: false, remarks: 'Fff' })
  if (!(await dragCells(w, [ids.Cinch, dd(1)], [ids.Piston, dd(2)]))) throw new Error('no drag window over two men')
  const head = await L.txt(P, T('sel-span')), who = await L.txt(P, T('sel-who'))
  const row = await L.vis(P, T('sel-rmk-row')), box = await P.locator(T('sel-remarks')).count()
  await snap('c-before')
  await approve('c')
  const x1 = await words('Cinch', [1]), x2 = await words('Piston', [2])
  const ok = !row && box === 0 && /input: LL 12-01\/"Eee"/.test(x1[1]) && /input: LL 12-02\/"Fff"/.test(x2[2])
  rec('25c', size, ok ? 'PASS' : 'FAIL', `two men dragged ("${who}", ${head}): Remarks row ${row ? 'PRESENT' : 'absent'} (boxes ${box}); Approve: Cinch ${fmt(x1)} ; Piston ${fmt(x2)}`, [`${tag}-c-before`, `${tag}-c-approve` + (w.phone ? '-q' : '')])
  if (await L.vis(P, T('select-sheet'))) await closeSheet(w)
})
await sc('d', async () => {
  await twoPending('Sidewinder', 1, 2, 'Same', 'Other')
  if (!(await dragCells(w, [ids.Sidewinder, dd(1)], [ids.Sidewinder, dd(2)]))) throw new Error('no drag window')
  await typeInto(w, T('sel-remarks'), 'Same')
  await snap('d-before')
  await approve('d')
  const x = await words('Sidewinder', [1, 2])
  const ok = /input: LL 12-01\/"Same"/.test(x[1]) && /input: OL 12-02\/"Same"/.test(x[2])
  rec('25d', size, ok ? 'PASS' : 'FAIL', `words equal to day 1's own ("Same"), day 2 held "Other", Approve: ${fmt(x)}`, [`${tag}-d-before`, `${tag}-d-approve` + (w.phone ? '-q' : '')])
  if (await L.vis(P, T('select-sheet'))) await closeSheet(w)
})
await sc('e', async () => {
  /* a fill through the drag window: the half, the words, the leave (the one-day window's Remarks box speaks for the entry already on a day, so a second entry's words are typed here) */
  const dragFill = async (who, a, z, portion, wordsTyped, type) => {
    if (!(await dragCells(w, [who, dd(a)], [who, dd(z)]))) throw new Error('no drag window for the fill')
    await L.press(w, T(`sel-portion-${portion}`))
    await typeInto(w, T('sel-remarks'), wordsTyped)
    await L.press(w, T(`sel-${type}`)); await sleep(w, 600)
    if (await L.vis(P, T('select-sheet'))) { await L.press(w, T(`sel-${type}`)); await sleep(w, 600) }
    if (await L.vis(P, T('select-sheet'))) { const n = await L.txt(P, T('sel-note')); await closeSheet(w); throw new Error('the fill left the drag window open: ' + n) }
  }
  /* e1: a war-approved morning LL and a war-approved afternoon OL on 3–4 Dec (Warden) */
  await dragFill(ids.Warden, 3, 4, 'am', 'Am1', 'LL')
  await dragFill(ids.Warden, 3, 4, 'pm', 'Pm1', 'OL')
  const f = await words('Warden', [3, 4]); console.log('fixture e1', fmt(f))
  if (![3, 4].every(n => /LL-am[^;]*"Am1"/.test(f[n]) && /OL-pm[^;]*"Pm1"/.test(f[n]))) throw new Error('fixture e1: ' + fmt(f))
  await place(w, ids.Warden, dd(5), 'LL', { approve: false, remarks: 'Pend5' })
  if (!(await dragCells(w, [ids.Warden, dd(3)], [ids.Warden, dd(5)]))) throw new Error('no drag window')
  const box0 = await P.locator(T('sel-remarks')).inputValue()
  await typeInto(w, T('sel-remarks'), 'Both')
  await snap('e1-before')
  await approve('e1')
  const x = await words('Warden', [3, 4, 5])
  const ok = [3, 4].every(n => /LL-am[^;]*"Both"/.test(x[n]) && /OL-pm[^;]*"Both"/.test(x[n])) && /"Both"/.test(x[5])
  rec('25e1', size, ok ? 'PASS' : 'FAIL', `two days (3–4 Dec) each holding a war-approved morning LL "Am1" and a war-approved afternoon OL "Pm1" (the drag window's box opened holding "${box0}"), with a pending LL "Pend5" on 5 Dec so Approve is offered, dragged 3–5 Dec, typed "Both", Approve: ${fmt(x)}`, [`${tag}-e1-before`, `${tag}-e1-approve` + (w.phone ? '-q' : '')])
  if (await L.vis(P, T('select-sheet'))) await closeSheet(w)
  /* e2: a war-approved morning and an Inputs-filed afternoon (Drifter) */
  await place(w, ids.Drifter, dd(3), 'LL', { approve: true, portion: 'am', remarks: 'Am2' })
  await H.fileInputLeave(w, 'Drifter', 'OL', dd(3), null, { span: 'PM', remarks: 'Pm2' })
  await H.toWar(w, 'admin'); await L.reachCell(w, ids.Drifter, dd(3))
  const f2 = await words('Drifter', [3]); console.log('fixture e2', fmt(f2))
  if (!/LL-am[^;]*"Am2"/.test(f2[3]) || !/OL-pm\[inputs\][^;]*"Pm2"/.test(f2[3])) throw new Error('fixture e2: ' + fmt(f2))
  if (!(await dragCells(w, [ids.Drifter, dd(3)], [ids.Drifter, dd(4)]))) throw new Error('no drag window (e2)')
  await typeInto(w, T('sel-remarks'), 'Both')
  const approveOffered = await L.vis(P, T('sel-approve'))
  await snap('e2-before')
  if (w.phone) await L.step(w, `${tag}-e2-close`, T('sel-cancel')); else { await L.press(w, T('sel-cancel')); await sleep(w, 600) }
  const y = await words('Drifter', [3])
  const ok2 = /LL-am[^;]*"Both"/.test(y[3]) && /OL-pm\[inputs\][^;]*"Both"/.test(y[3])
  rec('25e2', size, ok2 ? 'PASS' : 'FAIL', `a day (3 Dec) holding a war-approved morning LL "Am2" and an Inputs-filed afternoon OL "Pm2", dragged 3–4 Dec, typed "Both" (Approve is ${approveOffered ? 'offered' : 'NOT offered — nothing there is a bid to decide'}), closed with ✕: ${fmt(y)}`, [`${tag}-e2-before`, `${tag}-e2-close` + (w.phone ? '-q' : '')])
  if (await L.vis(P, T('select-sheet'))) await closeSheet(w)
})
async function setSw(on) { await H.setSwitch(w, on) }
await sc('f', async () => {
  await H.fileInputLeave(w, 'Basher', 'LL', dd(4), null, { remarks: 'From inputs' })
  await H.toWar(w, 'admin')
  await place(w, ids.Basher, dd(3), 'LL', { approve: false, remarks: 'Pend' })
  await L.reachCell(w, ids.Basher, dd(4))
  const f = await words('Basher', [3, 4]); console.log('fixture f', fmt(f))
  if (!/LL\/pending\/"Pend"/.test(f[3]) || !/LL\[inputs\][^;]*"From inputs"/.test(f[4])) throw new Error('fixture f: ' + fmt(f))
  if (!(await dragCells(w, [ids.Basher, dd(3)], [ids.Basher, dd(4)]))) throw new Error('no drag window')
  await typeInto(w, T('sel-remarks'), 'Typed')
  await snap('f-before')
  await approve('f')
  const x = await words('Basher', [3, 4])
  const changed = /LL\[inputs\][^;]*"Typed"/.test(x[4])
  rec('25f', size, 'RECORD', `an Inputs-filed approved LL on 4 Dec ("From inputs") with a pending LL on 3 Dec ("Pend"), dragged 3–4 Dec, typed "Typed", Approve: the Inputs-filed entry's words ${changed ? 'CHANGED to "Typed"' : 'did NOT change'}. ${fmt(x)}`, [`${tag}-f-before`, `${tag}-f-approve` + (w.phone ? '-q' : '')])
  if (await L.vis(P, T('select-sheet'))) await closeSheet(w)
  const wd = await dayWindow(w, ids.Basher, dd(4)); await snap('f-window-4dec'); await closeSheet(w)
  rec('25f2', size, 'RECORD', `Basher's Inputs-filed 4 Dec leave, its window after: ${wd.sheet} reading "${wd.remarks}"`, [`${tag}-f-window-4dec`])
})
await sc('g', async () => {
  await H.fileInputLeave(w, null, 'LL', dd(7), null, { remarks: 'Shared', several: [ids.Ranger, ids.Ridge] })
  await H.toWar(w, 'admin'); await L.reachCell(w, ids.Ranger, dd(7))
  const before = (await inputsOn(P, ids.Ranger, dd(7))).map(i => `${i.type} ${i.from.slice(5)}..${i.to.slice(5)} [${i.people.join(',')}] "${i.remarks}"`)
  const beforeR = (await inputsOn(P, ids.Ridge, dd(7))).map(i => `${i.type} [${i.people.join(',')}] "${i.remarks}"`)
  console.log('fixture g', JSON.stringify(before), JSON.stringify(beforeR))
  if (before.length !== 1 || !/bane/.test(before[0]) || !/razer/.test(before[0])) throw new Error('fixture g: ' + JSON.stringify(before))
  await place(w, ids.Ranger, dd(8), 'LL', { approve: false, remarks: 'Pending8' })
  if (!(await dragCells(w, [ids.Ranger, dd(7)], [ids.Ranger, dd(8)]))) throw new Error('no drag window')
  await typeInto(w, T('sel-remarks'), 'Mine only')
  await snap('g-before')
  await approve('g')
  const rg = (await inputsOf(P, ids.Ranger)).filter(i => i.from >= dd(1)).map(i => `${i.type} ${i.from.slice(5)}..${i.to.slice(5)} [${i.people.join(',')}] "${i.remarks}"${i.lw ? ' (war)' : ''}`)
  const ri = (await inputsOf(P, ids.Ridge)).filter(i => i.from >= dd(1)).map(i => `${i.type} ${i.from.slice(5)}..${i.to.slice(5)} [${i.people.join(',')}] "${i.remarks}"`)
  const okR = ri.length === 1 && /"Shared"/.test(ri[0])
  const okM = rg.some(t => /"Mine only"/.test(t))
  rec('25g', size, okR && okM ? 'PASS' : 'FAIL', `one LL on 7 Dec shared by Ranger and Ridge ("Shared") on one entry, Ranger's 7 Dec dragged with his pending 8 Dec bid, typed "Mine only", Approve. After — Ranger's entries: ${JSON.stringify(rg)}; Ridge's: ${JSON.stringify(ri)}. Ridge's words unchanged: ${okR}; Ranger's part changed: ${okM}; Ranger ${rg.some(t => /\[bane\]/.test(t) && /Mine only/.test(t)) ? 'split off onto an entry of his own' : 'not on an entry of his own'}`, [`${tag}-g-before`, `${tag}-g-approve` + (w.phone ? '-q' : '')])
  if (await L.vis(P, T('select-sheet'))) await closeSheet(w)
  // who is told: the admin's own bell now
  await L.press(w, '#bellBtn, [data-testid="bell"], #bell').catch(() => {}); await sleep(w, 500)
  const bell = await P.evaluate(() => { const b = document.querySelector('#bellPop, .bellpop, [data-testid="bell-pop"], #notifPop'); return b ? b.innerText.replace(/\s+/g, ' ').slice(0, 400) : null })
  await snap('g-bell')
  rec('25g-bell', size, 'RECORD', `the admin's bell after that save: ${bell ?? 'no panel found by the usual ids'}`, [`${tag}-g-bell`])
  await P.keyboard.press('Escape').catch(() => {})
})
await sc('h', async () => {
  const E = ids.Echo
  await L.openCellR(w, E, dd(1)); await P.waitForSelector(T('bid-picker')); await L.press(w, T('bid-remarks')); await P.keyboard.type('OD words'); await L.press(w, T('bid-file-OD')); await sleep(w, 700)
  await L.openCellR(w, E, dd(2)); await P.waitForSelector(T('bid-picker')); await L.press(w, T('bid-remarks')); await P.keyboard.type('CSE words'); await L.press(w, T('bid-file-CSE')); await sleep(w, 700)
  await L.openCellR(w, E, dd(3)); await P.waitForSelector(T('bid-picker')); await L.press(w, T('bid-remarks')); await P.keyboard.type('UNA words'); await L.press(w, T('bid-una')); await sleep(w, 700)
  const view = async () => {
    const ins = (await inputsOf(P, E)).filter(i => i.from >= dd(1)).map(i => `${i.type} ${i.from.slice(5)}..${i.to.slice(5)} "${i.remarks}"`)
    const una = (await warRecs(P, E, dd(3))).filter(r => r.kind === 'una').map(r => `UNA "${r.remarks ?? ''}"`)
    const cells = []; for (const n of [1, 2, 3]) cells.push(`${n}: ${(await kinds(w, E, dd(n))).join('+')}`)
    return { ins, una, cells }
  }
  const f = await view(); console.log('fixture h', JSON.stringify(f))
  if (f.ins.length < 2 || !f.una.length) throw new Error('fixture h: ' + JSON.stringify(f))
  await place(w, E, dd(4), 'LL', { approve: false, remarks: 'Pend4' })
  if (!(await dragCells(w, [E, dd(1)], [E, dd(4)]))) throw new Error('no drag window')
  await typeInto(w, T('sel-remarks'), 'New')
  await snap('h-before')
  await approve('h')
  const x = await view()
  rec('25h', size, 'RECORD', `Echo's 1 Dec OD ("OD words"), 2 Dec CSE ("CSE words"), 3 Dec UNA ("UNA words"), with a pending LL "Pend4" on 4 Dec so Approve is offered, dragged 1–4 Dec, typed "New", Approve. Before: ${JSON.stringify(f)}. After: ${JSON.stringify(x)}`, [`${tag}-h-before`, `${tag}-h-approve` + (w.phone ? '-q' : '')])
  if (await L.vis(P, T('select-sheet'))) await closeSheet(w)
  /* and the other way out: the words typed over the three filings alone and the window closed with ✕ */
  if (!(await dragCells(w, [E, dd(1)], [E, dd(3)]))) throw new Error('no drag window (h2)')
  await typeInto(w, T('sel-remarks'), 'New2')
  await L.press(w, T('sel-cancel')); await sleep(w, 600)
  const y = await view()
  rec('25h2', size, 'RECORD', `the same three filings dragged 1–3 Dec, typed "New2", closed with ✕: ${JSON.stringify(y)}`, [])
})
rec('25-errors', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
H.saveResults(tag + (ONLY ? '-' + [...ONLY].join('') : ''))
await w.ctx.close()
await H.finish()
