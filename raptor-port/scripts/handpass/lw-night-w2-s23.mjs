// Walker 2 — scenario 23: the drag window's typed words on APPROVE, an approved leave inside, a run reaching past the drag. desktop (admin).
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, kinds, place, dayWindow, closeSheet, warRecs, dayWords, dragCells, typeInto, sleep, inputsOf } = H
const size = process.argv[2] || 'desk'
const tag = `s23-${size === 'phone' ? 'ph' : 'dk'}`
console.log('lw-night-w2-s23 v1', size, tag)
H.clearPics(tag)
const w = await L.newCtx(size)
const P = w.page
await H.signInAs(w, 'admin')
const ids = await H.people(P)
const me = ids.Ranger
const dd = n => `2026-12-${String(n).padStart(2, '0')}`
const DAYS = [7, 8, 9, 10, 11, 14, 15]
const WORDS = 'New words'
const shots = []
const snap = async n => { await L.shot(w, `${tag}-${n}`); shots.push(`${tag}-${n}`); return `${tag}-${n}` }
const state = async () => { const o = {}; for (const n of DAYS) o[n] = (await dayWords(P, me, dd(n))).text; return o }
const brief = st => Object.entries(st).map(([d, t]) => `${d}: ${t}`).join(' ; ')
try {
  // fixtures: 7–11 Dec one pending run "Old" by Pick a range; 14 Dec an approved LL "Family"; 15 Dec empty
  await place(w, me, dd(7), 'LL', { approve: false, remarks: 'Old', range: [dd(7), dd(11)] })
  await place(w, me, dd(14), 'LL', { approve: true, remarks: 'Family' })
  const fx = await state()
  console.log('fixtures', brief(fx))
  const fxOk = [7, 8, 9, 10, 11].every(n => fx[n].includes('LL/pending/"Old"')) && fx[14].includes('LL/approved') === false && /Family/.test(fx[14]) && fx[15] === 'req: - | input: -'
  const inFx = (await inputsOf(P, me)).filter(i => i.from >= dd(1))
  console.log('inputs after fixtures', JSON.stringify(inFx))
  if (!fxOk) throw new Error('fixtures wrong: ' + brief(fx))
  const before = await state()
  const beforeInputs = JSON.stringify((await inputsOf(P, me)).filter(i => i.from >= dd(1)).map(i => `${i.type} ${i.from.slice(5)}..${i.to.slice(5)} "${i.remarks}"`))
  // drag Ranger 9–14 Dec, words, Approve
  if (!(await dragCells(w, [me, dd(9)], [me, dd(14)]))) throw new Error('no drag window over 9–14 Dec')
  const head = await L.txt(P, T('sel-span'))
  await typeInto(w, T('sel-remarks'), WORDS)
  const typed = await P.locator(T('sel-remarks')).inputValue()
  await snap('01-typed')
  await L.press(w, T('sel-approve')); await sleep(w, 700)
  const open = await L.vis(P, T('select-sheet')), note = await L.txt(P, T('sel-note'))
  await snap('02-approved')
  const after = await state()
  console.log('after', brief(after))
  const ins = (await inputsOf(P, me)).filter(i => i.from >= dd(1))
  const insTxt = ins.map(i => `${i.type} ${i.from.slice(5)}..${i.to.slice(5)}${i.half ? ' ' + i.half : ''} "${i.remarks}"${i.lw ? '' : ' [inputs]'}`)
  const run = [7, 8, 9, 10, 11].every(n => after[n].includes(`"${WORDS}"`))
  const pend78 = [7, 8].every(n => after[n].includes('LL/pending/"New words"'))
  const e911 = ins.filter(i => i.from === dd(9) || i.from === dd(10) || i.from === dd(11))
  const e14 = ins.filter(i => i.from === dd(14))
  const ok911 = e911.length === 1 && e911[0].from === dd(9) && e911[0].to === dd(11) && e911[0].remarks === WORDS
  const ok14 = e14.length === 1 && e14[0].remarks === WORDS
  const sep = e911.length === 1 && e14.length === 1 && e911[0].iid !== e14[0].iid
  const ok7 = [7, 8].every(n => after[n].includes('pending/"New words"'))
  const un15 = after[15] === 'req: - | input: -'
  const verdict = ok911 && ok14 && sep && ok7 && un15 && run
  rec('23a', size, verdict ? 'PASS' : 'FAIL', `drag "${head}", typed "${typed}", Approve${open ? ' (window stayed open: ' + note + ')' : ''}. Days after: ${brief(after)}. Ranger's entries on the Inputs page from Dec: ${JSON.stringify(insTxt)}; 9–11 one entry: ${ok911}; 14 Dec reads "${e14[0]?.remarks}": ${ok14}; 14 separate from 9–11: ${sep}; 7–8 still pending with the words: ${ok7}; 15 Dec untouched: ${un15}`, [`${tag}-01-typed`, `${tag}-02-approved`])
  // the Inputs page's own rows
  const rows = await H.inputsPageRows(w, 'Ranger', `${tag}-03-inputs-page`)
  rec('23b', size, 'RECORD', `the Inputs page (list, All dates, Ranger) rows from Dec: ${JSON.stringify(rows.filter(r => /Dec/.test(r)).map(r => r.slice(0, 160)))}`, [`${tag}-03-inputs-page`])
  await H.toWar(w, 'admin')
  // Undo press by press (back to the fixture state), Redo back, reload
  const sameAsBefore = st => JSON.stringify(st) === JSON.stringify(before)
  const uw = await H.undoWalk(w, state, sameAsBefore, 8, `${tag}-04`)
  const insU = JSON.stringify((await inputsOf(P, me)).filter(i => i.from >= dd(1)).map(i => `${i.type} ${i.from.slice(5)}..${i.to.slice(5)} "${i.remarks}"`))
  rec('23c', size, 'RECORD', `Undo after Approve with words: ${uw.presses} press(es) to the fixture state (${uw.reached ? 'reached' : 'NOT reached in 8'}); Ranger's Inputs entries then ${insU === beforeInputs ? 'equal the fixture ones' : 'DIFFER from the fixture ones: ' + insU + ' vs ' + beforeInputs}. Press by press: ${H.fmtSteps(uw.steps.map(s => ({ ...s, st: brief(s.st) })))}`, uw.steps.map(s => `${tag}-04-undo${s.i}`))
  await H.redoWalk(w, uw.presses)
  const redone = await state()
  console.log('after redo', brief(redone))
  await H.reloadAs(w, 'admin')
  for (const n of DAYS) await L.reachCell(w, me, dd(n))
  const rl = await state()
  const rlIns = (await inputsOf(P, me)).filter(i => i.from >= dd(1))
  const rlOk = JSON.stringify(rl) === JSON.stringify(after) && JSON.stringify(rlIns.map(i => i.remarks)) === JSON.stringify(ins.map(i => i.remarks))
  rec('23d', size, rlOk ? 'PASS' : 'FAIL', `after Redo x${uw.presses} and a reload: ${brief(rl)}${rlOk ? ' — the same as right after Approve' : ' — DIFFERS from right after Approve: ' + brief(after)}`, [])
  // a window of a day outside the drag: 7 Dec reads the words
  const w7 = await dayWindow(w, me, dd(7)); await snap('05-7dec-window'); await closeSheet(w)
  const w14 = await dayWindow(w, me, dd(14)); await snap('05-14dec-window'); await closeSheet(w)
  rec('23e', size, w7.remarks === WORDS && w14.remarks === WORDS ? 'PASS' : 'FAIL', `7 Dec's window (${w7.sheet}) reads "${w7.remarks}"; 14 Dec's (${w14.sheet}) reads "${w14.remarks}"`, [`${tag}-05-7dec-window`, `${tag}-05-14dec-window`])
} catch (e) {
  rec('23!', size, 'NOT DONE', String(e).slice(0, 500), shots)
  await snap('99-error').catch(() => {})
}
rec('23-errors', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
H.saveResults(tag)
await w.ctx.close()
await H.finish()
