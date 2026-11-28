// swl-w1A — walker A's walk of chat 203's build (the warning list's SANS lines: his D2579, D2584 Q3 / 2a / 3b, D2583), 26 Nov 26.
// Brief: docs/superpowers/briefs/2026-11-26-sans-warnlines-walk-brief.md. Run from raptor-port/, one scenario and size a run:
//   SWLA_RUN=<run> ONLY=<scenario> SZ=d|p node scripts/handpass/swl-w1A.mjs
import './swl-w1A-env.mjs'
const Y = await import('./swl-w1A-lib.mjs')
const { L, W5, X, Z, T, sleep, J, run, need, addLine, addSimRow, simRow, armAt, crewAll, who, say1, place, dragIn, setBox, lineOf,
  commit, editFiling, tryEmpty, formRead, allPlaces, allSay, agree, counted, boardList, dayList, dayInfo, infoClose, readBoard,
  pucksOf, puckSay, clipOf, lit, holdsAt, tellsToFile, sbUndo, sbRedo, noteWatch, notesSeen, nOf, RANGER,
  BOLT, MARLIN, OTTER, PIXEL, ACE, NAME, ISO, NF, CHECK, LEGEND, norm } = Y
const SCN = process.env.ONLY || 'SIM', SZ = process.env.SZ || 'd'
console.log(`VERSION swl-w1A 1 · ${SCN} · ${SZ} · bundle ${process.env.W2_URL} · out ${Y.OUT}`)

const nf = (nm, tail) => `${nm} — ${NF}${tail}`
const off = (nm, ev, tail) => `${nm} — SANS: offered ${ev} only today. Planned on ${tail}`
const hrs = (nm, a, b, tail) => `${nm} — SANS: available ${a}–${b} only. Planned on ${tail}`
const NOTES = []   // every note seen this run, for N7

/* the four places read and judged for one man: exactly `want` (his SANS lines) in each place; the check's name over each;
   the count agreeing with the lines drawn; nothing tells anyone to file. His seated pucks read on the board first. */
async function judgeMan(p, W, di, id, want, rid, what, tag, o = {}) {
  await L.openBoard(p, W, di)
  await W5.boardDrawer(p, W, false)
  const pk = (await pucksOf(p, '#schedBoard', id)).filter(x => x.where !== 'crew list')
  const ppic = o.seat ? await clipOf(p, W, `#schedBoard [data-slot="${o.seat}"], #schedBoard [data-fill="${o.seat}"]`, tag + '-puck', 30) : ''
  const a = await allPlaces(p, W, di, NAME[id], tag)
  const g = agree(a, want), c = counted(a)
  const sigOk = a.sigs.every(s => s === CHECK)
  const words = [a.board, a.es, a.info, a.view].flatMap(r => (r.lines || []).map(x => x.text))
  const tf = words.filter(tellsToFile)
  const chipOk = o.chip === undefined ? true : o.chip === null ? pk.every(x => !x.chips.includes('A')) : pk.some(x => x.chips.includes(o.chip))
  const ok = g.ok && sigOk && c.ok && !tf.length && chipOk
  W.rec(rid, what, o.rec ? 'REC' : ok, `${NAME[id]}'s SANS lines: board ${J(a.his.board)} · ES ${J(a.his.es)} · ⓘ ${J(a.his.info)} · view ${J(a.his.view)}${g.ok ? '' : ' ≠ WANT ' + J(want) + ' ' + J(g.each)} · check names ${J([...new Set(a.sigs)])}${sigOk ? '' : ' ≠ "' + CHECK + '"'} · ${c.say}${c.ok ? '' : ' (DISAGREE)'} · his seated pucks: ${puckSay(pk)}${chipOk ? '' : ' ≠ chip ' + o.chip}${tf.length ? ' · TELLS TO FILE: ' + J(tf) : ''}`, [ppic, ...a.pics].filter(Boolean).join(', '))
  return { a, pk, ok }
}
/* the board's panel only, quick: his SANS lines and the head */
async function quick(p, W, di, id, tag) {
  const b = await boardList(p, W, di)
  const pic = tag ? await clipOf(p, W, '#schedBoard .sb-warn', tag + '-board', 12) : ''
  const his = (b.lines || []).filter(x => x.text.includes(NAME[id]) && /SANS/.test(x.text)).map(x => x.text)
  return { b, his, pic, n: (b.lines || []).filter(x => !x.hid).length, head: b.head }
}
/* place by tap (desktop and phone), the note(s) recorded and judged against `note` (null: no SANS words in any note) */
async function put(p, W, di, key, id, tag, note, rid) {
  const r = await place(p, W, di, key, id, tag)
  NOTES.push(...(r.seen || []))
  const crew = r.c ? say1(r.c, id) : 'not read'
  /* a weekend's OIL note leads where the plant also leaves a row with no usable times (the plant-then-warn rule shows the
     first warning, "+N more" for the rest) — recorded, not judged */
  const oilFirst = (r.seen || []).length && /nobody on (it|them) earns OIL|nobody earns OIL/.test(r.seen[0]) && /\(\+\d+ more\)/.test(r.seen[0])
  const okNote = note === undefined ? 'REC' : note === null ? !(r.seen || []).some(n => /SANS/.test(n)) : (r.seen || []).includes(note) ? true : oilFirst ? 'REC' : false
  if (rid) W.rec(rid, `${NAME[id]} placed by tap on ${key}; the note ${note === null ? 'carries no SANS words' : note ? '"' + note + '"' : 'RECORDED'}`, r.placed ? okNote : 'NW', `armed ${r.armed}${r.retry ? ' (' + r.retry + ')' : ''} · crew list with the place armed: ${crew} · notes ${J(r.seen)} · ${r.fits || ''} · holds ${J(r.holds)}`, r.pic)
  return r
}
async function putDrag(p, W, di, key, id, tag, note, rid) {
  const r = await dragIn(p, W, di, key, id, tag)
  NOTES.push(...(r.seen || []))
  const okNote = note === undefined ? 'REC' : note === null ? !(r.seen || []).some(n => /SANS/.test(n)) : (r.seen || []).includes(note)
  W.rec(rid, `${NAME[id]} dragged from the crew list onto ${key}; the note ${note ? '"' + note + '"' : 'RECORDED'}`, r.placed ? okNote : 'NW', `hover ${Y.hoverSay(((r.stops || [])[0] || {}).hover)} · notes ${J(r.seen)} · holds ${J(r.holds)}`, r.pic)
  return r
}
const fileIt = async (p, W, iso, id, kinds, span, tag) => {
  const f = await commit(p, W, iso, id, kinds, span, tag)
  need(W, 'set.file.' + tag, `Saber files for ${NAME[id]} on ${iso}: ${kinds.join('+')} ${J(span)}`, !!f.iid, J(f.rec), f.pic)
  await W5.closeSansWin(p, W)
  return f
}

const S = {}

/* ---- SIM: F1 = A6, F2, F3 — untimed OFT / AMT rows, every seat and the extras, nothing filed (Sat 18) ---- */
S.SIM = async (p, W) => {
  const di = 5
  const o = await addSimRow(p, W, di, 'oft', 'EP-9')
  need(W, 'set.oft', 'Sat 18: an OFT row "EP-9" with no times', o.ri >= 0 && o.r && !o.r.str && !o.r.end, J(o.r))
  const kp = `s:5.oft.${o.ri}.p`, kw = `s:5.oft.${o.ri}.w`, kx = `s:5.oft.${o.ri}.+`
  const TAIL = 'Sim EP-9'
  await put(p, W, di, kp, BOLT, 'sim-bolt', nf('Bolt', TAIL), 'F1.note.front')
  await judgeMan(p, W, di, BOLT, [nf('Bolt', TAIL)], 'F1.front', 'F1 = A6 — untimed OFT, front seat, nothing filed: one line "…Planned on Sim EP-9" in every place, check name, count agrees; amber "A" on his puck', 'sim-front', { seat: kp, chip: 'A' })
  await put(p, W, di, kw, OTTER, 'sim-otter', nf('Otter', TAIL), 'F1.note.rear')
  await judgeMan(p, W, di, OTTER, [nf('Otter', TAIL)], 'A6.rear', 'A6 — untimed OFT, rear seat (Otter): his own line', 'sim-rear', { seat: kw, chip: 'A' })
  if (W.isPhone) await put(p, W, di, kx, PIXEL, 'sim-pixel', nf('Pixel', TAIL), 'F1.note.extra')
  else await putDrag(p, W, di, kx, PIXEL, 'sim-pixel', nf('Pixel', TAIL), 'F1.note.extra')
  const ex = await judgeMan(p, W, di, PIXEL, [nf('Pixel', TAIL)], 'F1.extra', 'F1 = A6 — the OFT\'s extra place (Pixel): his own line; Bolt\'s and Otter\'s still there', 'sim-extra', { chip: 'A' })
  W.rec('F1.three', 'three men on one box: three lines, none lost when the next was planted', ex.a.his.board.length === 1 && (ex.a.board.lines || []).filter(x => /SANS/.test(x.text)).length === 3, J((ex.a.board.lines || []).filter(x => /SANS/.test(x.text)).map(x => x.text)), ex.a.pics[0])
  // A6: a newly added extra place (the second one)
  await put(p, W, di, kx, MARLIN, 'sim-marlin', nf('Marlin', TAIL), 'A6.note.extra2')
  const ex2 = await quick(p, W, di, MARLIN, 'sim-extra2')
  W.rec('A6.extra2', 'A6 — a second extra place (Marlin): his own line', ex2.his.length === 1 && ex2.his[0] === nf('Marlin', TAIL), `${J(ex2.his)} · head "${ex2.head}" · ${ex2.n} lines`, ex2.pic)
  // F2: times typed, then the start cleared, then the end cleared
  const counts = []
  for (const [nm, box, v] of [['start 09:00', 'str', '09:00'], ['end 10:30', 'end', '10:30'], ['start cleared', 'str', ''], ['end cleared', 'end', '']]) {
    await noteWatch(p)
    await setBox(p, W, di, `sr:5.oft.${o.ri}.${box}`, v)
    const r = await simRow(p, di, 'oft', o.ri)
    const q = await quick(p, W, di, BOLT, 'f2-' + nm.replace(/\W+/g, ''))
    const seen = await notesSeen(p); NOTES.push(...seen)
    const sl = (q.b.lines || []).filter(x => /SANS/.test(x.text))
    counts.push(sl.length)
    const rowPic = await clipOf(p, W, p.locator(L.B(`[data-bfld="sr:5.oft.${o.ri}.str"]`)).first(), 'f2-row-' + nm.replace(/\W+/g, ''), 120)
    const boxes = await p.evaluate(ri => ['str', 'end'].map(k => { const e = document.querySelector(`#schedBoard [data-bfld="sr:5.oft.${ri}.${k}"]`); return e ? k + '="' + e.value + '" placeholder "' + (e.placeholder || '') + '"' : k + ' none' }), o.ri)
    W.rec('F2.' + nm.replace(/\W+/g, ''), `F2 — the OFT's ${nm} (row ${J({ str: r.str, end: r.end })}): Bolt still ONE line — RECORDED its tail; the count never jumps by 2`, q.his.length === 1 ? 'REC' : false, `${J(q.his)} · boxes as drawn ${J(boxes)} · head "${q.head}" · all lines ${J(q.b.lines.map(x => x.text.slice(0, 70)))} · notes while typing ${J(seen)}`, [q.pic, rowPic].join(', '))
  }
  W.rec('F2.count', 'F2 — the number of SANS lines steady (four) through the four edits', counts.every(n => n === counts[0]) ? true : false, J(counts))
  // F3: an AMT row with no name and no times, Marlin in its rear seat; then Bolt in its front seat; then a name typed
  const m = await addSimRow(p, W, di, 'amt', '')
  need(W, 'set.amt', 'an AMT row with no name, no times', m.ri >= 0 && !(m.r.label || '').trim() && !m.r.str, J(m.r))
  await setBox(p, W, di, `sr:5.amt.${m.ri}.label`, '')
  const mr = await put(p, W, di, `s:5.amt.${m.ri}.w`, MARLIN, 'amt-marlin', undefined, 'F3.note')
  const f3 = await judgeMan(p, W, di, MARLIN, null, 'F3', 'F3 — an AMT with no name and no times (Marlin, rear): RECORDED the tail exactly', 'f3', { rec: true, seat: `s:5.amt.${m.ri}.w` })
  const tail3 = f3.a.his.board.filter(x => !x.includes('EP-9'))
  W.rec('F3.tail', 'F3 — the unnamed AMT\'s tail: no "undefined", no bare "Sim ", no bare "Planned on"', tail3.length === 1 && !/undefined|NaN|Sim\s*$|Planned on\s*$|Planned on Sim\s*$/.test(tail3[0]) ? 'REC' : false, J(tail3) + ' · note ' + J(mr.seen), f3.a.pics[0])
  await put(p, W, di, `s:5.amt.${m.ri}.p`, BOLT, 'amt-bolt', undefined, 'A6.note.amtfront')
  const q6 = await quick(p, W, di, BOLT, 'a6-amt')
  W.rec('A6.amt', 'A6 — the unnamed AMT\'s front seat (Bolt, already on the OFT): RECORDED his lines (one per seat as built)', 'REC', `${J(q6.his)} · head "${q6.head}"`, q6.pic)
  await setBox(p, W, di, `sr:5.amt.${m.ri}.label`, 'AMT-2')
  const q7 = await quick(p, W, di, MARLIN, 'f3-named')
  W.rec('F3.named', 'F3 — the AMT named "AMT-2": Marlin\'s tail follows', q7.his.some(x => x === nf('Marlin', 'Sim AMT-2')), J(q7.his), q7.pic)
  await setBox(p, W, di, `sr:5.amt.${m.ri}.str`, '11:00'); await setBox(p, W, di, `sr:5.amt.${m.ri}.end`, '12:00')
  const q8 = await quick(p, W, di, MARLIN, 'a6-timed')
  W.rec('A6.timed', 'A6 — the AMT given usable times 11:00–12:00: the line stays, the tail updated (RECORDED)', q8.his.length >= 1 ? 'REC' : false, J(q8.his), q8.pic)
  const all = await pucksOf(p, '#schedBoard', BOLT)
  W.rec('A6.chips', 'every seated puck of Bolt wears the amber "A" (no new letter)', all.filter(x => x.where !== 'crew list').every(x => x.chips.join() === 'A'), puckSay(all), await W.pic(p, 'sim-final'))
}

/* ---- FLY: F4, F5 = A7, A29, F15, F14 = A5 — flying lines, nothing filed (Sat 18) ---- */
S.FLY = async (p, W) => {
  const di = 5
  const a = await addLine(p, W, di, {})
  need(W, 'set.blank', 'Sat 18: + Wave → a flying line, no name, no times', a.wi >= 0 && !a.f.cs && !a.f.to, J(a.f))
  const w0 = a.wi, kw = `5.${w0}.0.0.w`
  await put(p, W, di, kw, MARLIN, 'f4-marlin', nf('Marlin', 'this line (no times yet)'), 'F4.note')
  await judgeMan(p, W, di, MARLIN, [nf('Marlin', 'this line (no times yet)')], 'F4', 'F4 = A7 — a flying line with no name and no times (Marlin, rear): "…Planned on this line (no times yet)" in every place, amber "A"', 'f4', { seat: kw, chip: 'A' })
  const steps = [['callsign VL', `ff:5.${w0}.0.cs`, 'VL', null], ['mission BFM', `ff:5.${w0}.0.msn`, 'BFM', nf('Marlin', 'VL BFM (no times yet)')], ['T/O 13:00', `ff:5.${w0}.0.to`, '13:00', nf('Marlin', 'VL BFM (T/O 13:00)')],
    ['landing 14:00', `ff:5.${w0}.0.ld`, '14:00', nf('Marlin', 'VL BFM (T/O 13:00)')], ['T/O cleared (landing only)', `ff:5.${w0}.0.to`, '', null], ['landing cleared', `ff:5.${w0}.0.ld`, '', null]]
  for (const [nm, bf, v, want] of steps) {
    await noteWatch(p)
    await setBox(p, W, di, bf, v)
    const f = await lineOf(p, di, w0)
    const q = await quick(p, W, di, MARLIN, 'f5-' + nm.replace(/\W+/g, ''))
    const seen = await notesSeen(p); NOTES.push(...seen)
    W.rec('F5.' + nm.replace(/\W+/g, ''), `F5 = A7 — ${nm} (line ${J(f)}): one line${want ? ' "' + want + '"' : ', its tail RECORDED'}`, q.his.length === 1 ? (want ? q.his[0] === want : 'REC') : false, `${J(q.his)} · head "${q.head}" · notes ${J(seen)}`, q.pic)
  }
  await setBox(p, W, di, `ff:5.${w0}.0.to`, '13:00'); await setBox(p, W, di, `ff:5.${w0}.0.ld`, '14:00')
  await judgeMan(p, W, di, MARLIN, [nf('Marlin', 'VL BFM (T/O 13:00)')], 'A29.rear', 'A29 — VL BFM T/O 13:00, rear seat (Marlin): exactly one amber line "…Planned on VL BFM (T/O 13:00)", "A", every place', 'a29r', { seat: kw, chip: 'A' })
  // A29 front seat
  const b = await addLine(p, W, di, { cs: 'VX', to: '15:30', ld: '16:30' })
  await setBox(p, W, di, `ff:5.${b.wi}.0.msn`, 'ACM')
  const kb = `5.${b.wi}.0.0.p`
  await put(p, W, di, kb, BOLT, 'a29-bolt', nf('Bolt', 'VX ACM (T/O 15:30)'), 'A29.note')
  await judgeMan(p, W, di, BOLT, [nf('Bolt', 'VX ACM (T/O 15:30)')], 'A29.front', 'A29 — VX ACM T/O 15:30, front seat (Bolt): exactly one amber line, "A", every place', 'a29f', { seat: kb, chip: 'A' })
  // F15: two unfiled SANS men on one jet
  const c = await addLine(p, W, di, { cs: 'VZ', to: '18:00', ld: '19:00' })
  await setBox(p, W, di, `ff:5.${c.wi}.0.msn`, 'DACT')
  const kcp = `5.${c.wi}.0.0.p`, kcw = `5.${c.wi}.0.0.w`
  await put(p, W, di, kcp, BOLT, 'f15-bolt', undefined, 'F15.note.bolt')
  await put(p, W, di, kcw, OTTER, 'f15-otter', undefined, 'F15.note.otter')
  const o15 = await judgeMan(p, W, di, OTTER, [nf('Otter', 'VZ DACT (T/O 18:00)')], 'F15.otter', 'F15 — front and back seat of one jet, both unfiled: Otter\'s own line', 'f15o', { seat: kcw })
  const b15 = await judgeMan(p, W, di, BOLT, [nf('Bolt', 'VX ACM (T/O 15:30)'), nf('Bolt', 'VZ DACT (T/O 18:00)')], 'F14.two', 'F14 = A5 — Bolt on two flights (VX and VZ): RECORDED as built (one line per seat); the count, the ⓘ and the Board agree', 'f14', { seat: kcp })
  W.rec('F15.chips', 'F15 — both men\'s pucks on VZ: RECORDED their chips (a CO-approval pairing may outrank "A")', 'REC', `Bolt ${puckSay(b15.pk)} · Otter ${puckSay(o15.pk)}`, await clipOf(p, W, (await L.openBoard(p, W, di), `#schedBoard [data-slot="${kcp}"]`), 'f15-pucks', 60))
  // F14: VX's line removed by its own ✕ — exactly that seat's line goes
  await L.openBoard(p, W, di)
  const del = p.locator(L.B(`[data-ldel="5.${b.wi}.0.0"]`)).first()
  if (await del.count()) { await W.press(p, del, 'ldel'); await sleep(600) }
  const q = await judgeMan(p, W, di, BOLT, [nf('Bolt', 'VZ DACT (T/O 18:00)')], 'F14.off', 'F14 — the VX line removed (its own ✕): exactly that line\'s warning goes, VZ\'s stays', 'f14off')
  void q
}

/* ---- MIS: F6, F7, F8 = A13 (every offer against every other event), F9 = A15, F13; the picker's order ---- */
S.MIS = async (p, W) => {
  // Fri 17 rows (di 4): an untimed flight FU, a timed flight FT 13:00–14:00, an OFT EP-9 09:00–10:30, an untimed AMT AM-1
  const fM = await fileIt(p, W, ISO[17], MARLIN, ['fly'], 'all', 'm17')
  W.rec('PICK.order', 'the Inputs page\'s SANS picker: the order its three events are listed in (RECORDED) — see the form picture', 'REC', J(fM.rec), fM.pic.split(', ')[0])
  await fileIt(p, W, ISO[17], OTTER, ['oft'], 'all', 'o17')
  await fileIt(p, W, ISO[17], PIXEL, ['amt'], 'all', 'x17')
  await fileIt(p, W, ISO[18], MARLIN, ['fly', 'oft'], 'all', 'm18')
  await fileIt(p, W, ISO[18], OTTER, ['fly', 'amt'], 'all', 'o18')
  const fB = await fileIt(p, W, ISO[18], BOLT, ['oft', 'amt'], 'all', 'b18')
  // the order of the boxes on the form, read from a fresh form (no save)
  await W5.sansDay(p, W, ISO[19]); await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add'); await p.waitForSelector('#inpEditPop')
  const form = await formRead(p)
  const fpic = await clipOf(p, W, '#inpEditSans', 'pick-form', 30)
  await p.keyboard.press('Escape'); await sleep(300); const g = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await g.count()) await W.press(p, g, 'discard')
  await W5.closeSansWin(p, W)
  W.rec('PICK.boxes', 'the SANS form\'s event boxes in the order drawn (RECORDED)', 'REC', J(form), fpic)
  const fu = await addLine(p, W, 4, { cs: 'FU' }), ft = await addLine(p, W, 4, { cs: 'FT', to: '13:00', ld: '14:00' })
  const oe = await addSimRow(p, W, 4, 'oft', 'EP-9', '09:00', '10:30'), am = await addSimRow(p, W, 4, 'amt', 'AM-1')
  need(W, 'set.fri', 'Fri 17 rows made', fu.wi >= 0 && ft.wi >= 0 && oe.ri >= 0 && am.ri >= 0, J({ fu: fu.f, ft: ft.f, oe: oe.r, am: am.r }))
  // F6: Otter (OFT only) armed on the untimed flight's rear seat: the crew list; then placed
  const r6 = await put(p, W, 4, `4.${fu.wi}.0.0.w`, OTTER, 'f6', off('Otter', 'OFT', 'FU (no times yet)'), 'F6.note')
  const j6 = await judgeMan(p, W, 4, OTTER, [off('Otter', 'OFT', 'FU (no times yet)')], 'F6', 'F6 — Otter filed OFT only, planted on an untimed flight: "SANS: offered OFT only today. Planned on FU (no times yet)"', 'f6', { seat: `4.${fu.wi}.0.0.w`, chip: 'A' })
  W.rec('F6.side', 'F6 / lesson 32 — the crew list (seat armed) beside the warning list for Otter, one day (RECORDED; the two differ in words by ruling)', 'REC', `crew list: ${r6.c ? say1(r6.c, OTTER) : 'not read'} · warning list: ${J(j6.a.his.board)}`, [r6.pic, j6.a.pics[0]].join(', '))
  /* run MIS-d: with a seat of the box still empty, a press on its "+" arms that empty seat — so both seats are filled
     first (Ace, a pilot with no SANS, in each front seat), and the "+" then arms the extra place */
  await put(p, W, 4, `s:4.amt.${am.ri}.w`, MARLIN, 'f7-m-amt', off('Marlin', 'Fly', 'Sim AM-1'), 'A13.Flyonly.AMT')
  await put(p, W, 4, `s:4.amt.${am.ri}.p`, ACE, 'f7-ace-amt', undefined, 'set.ace.amt')
  await put(p, W, 4, `s:4.amt.${am.ri}.+`, OTTER, 'f7-o-amt', off('Otter', 'OFT', 'Sim AM-1'), 'A13.OFTonly.AMT')
  await put(p, W, 4, `s:4.oft.${oe.ri}.w`, MARLIN, 'f7-m-oft', off('Marlin', 'Fly', 'Sim EP-9 09:00–10:30'), 'A13.Flyonly.OFT')
  await put(p, W, 4, `s:4.oft.${oe.ri}.p`, ACE, 'f7-ace-oft', undefined, 'set.ace.oft')
  await put(p, W, 4, `s:4.oft.${oe.ri}.+`, PIXEL, 'f8-x-oft', off('Pixel', 'AMT', 'Sim EP-9 09:00–10:30'), 'F8.note')
  await put(p, W, 4, `4.${ft.wi}.0.0.w`, PIXEL, 'f7-x-fly', off('Pixel', 'AMT', 'FT (T/O 13:00)'), 'A13.AMTonly.Fly')
  await judgeMan(p, W, 4, MARLIN, [off('Marlin', 'Fly', 'Sim EP-9 09:00–10:30'), off('Marlin', 'Fly', 'Sim AM-1')], 'A13.Flyonly', 'A13 — Marlin "Fly only" on a timed OFT and an untimed AMT: "offered Fly only today" each, every place', 'a13m', { chip: 'A' })
  await judgeMan(p, W, 4, OTTER, [off('Otter', 'OFT', 'FU (no times yet)'), off('Otter', 'OFT', 'Sim AM-1')], 'A13.OFTonly', 'A13 — Otter "OFT only" on an untimed flight and an untimed AMT (extra place)', 'a13o', { chip: 'A' })
  await judgeMan(p, W, 4, PIXEL, [off('Pixel', 'AMT', 'Sim EP-9 09:00–10:30'), off('Pixel', 'AMT', 'FT (T/O 13:00)')], 'F8.A13.AMTonly', 'F8 = A13 — Pixel "AMT only" on a timed OFT (extra place; OFT against AMT is a miss) and a timed flight', 'a13x', { chip: 'A' })
  // Sat 18 (di 5): pairs
  const vl = await addLine(p, W, 5, { cs: 'VL', to: '13:00', ld: '14:00' }); await setBox(p, W, 5, `ff:5.${vl.wi}.0.msn`, 'BFM')
  const vu = await addLine(p, W, 5, { cs: 'VU' })
  const o5 = await addSimRow(p, W, 5, 'oft', 'EP-9', '09:00', '10:30'), a5 = await addSimRow(p, W, 5, 'amt', 'AM-2', '11:00', '12:00')
  await put(p, W, 5, `5.${vl.wi}.0.0.p`, BOLT, 'f7-b-vl', off('Bolt', 'OFT and AMT', 'VL BFM (T/O 13:00)'), 'F7.OFTAMT.note')
  await put(p, W, 5, `5.${vu.wi}.0.0.p`, BOLT, 'f7-b-vu', off('Bolt', 'OFT and AMT', 'VU (no times yet)'), 'A13.OFTAMT.untimed')
  await put(p, W, 5, `s:5.amt.${a5.ri}.w`, MARLIN, 'f7-m-amt2', off('Marlin', 'Fly and OFT', 'Sim AM-2 11:00–12:00'), 'F7.FlyOFT.note')
  await put(p, W, 5, `s:5.oft.${o5.ri}.w`, OTTER, 'f7-o-oft2', off('Otter', 'Fly and AMT', 'Sim EP-9 09:00–10:30'), 'F7.FlyAMT.note')
  const jb = await judgeMan(p, W, 5, BOLT, [off('Bolt', 'OFT and AMT', 'VL BFM (T/O 13:00)'), off('Bolt', 'OFT and AMT', 'VU (no times yet)')], 'F7.OFTAMT', 'F7 — Bolt "OFT and AMT" on a timed flight: exactly "SANS: offered OFT and AMT only today. Planned on VL BFM (T/O 13:00)"; and an untimed one', 'f7b', { chip: 'A', seat: `5.${vl.wi}.0.0.p` })
  await judgeMan(p, W, 5, MARLIN, [off('Marlin', 'Fly and OFT', 'Sim AM-2 11:00–12:00')], 'F7.FlyOFT', 'F7 — Marlin "Fly and OFT" on an AMT: "offered Fly and OFT only today"', 'f7m', { chip: 'A' })
  await judgeMan(p, W, 5, OTTER, [off('Otter', 'Fly and AMT', 'Sim EP-9 09:00–10:30')], 'F7.FlyAMT', 'F7 — Otter "Fly and AMT" on an OFT: "offered Fly and AMT only today"', 'f7o', { chip: 'A' })
  // the two-event line beside the picker's order, in one picture
  const lpic = await (async () => { await L.closeBoard(p, W); await dayList(p, W, '#eWeek', 5); const l = p.locator('#eWeek .day[data-day="5"] .witem', { hasText: 'offered OFT and AMT' }).first(); return clipOf(p, W, l, 'f7-line', 6) })()
  W.rec('PICK.beside', 'the picker\'s order and a two-event line, side by side (composite picture)', 'REC', `form ${J(form.labels)}`, await composite(p, W, [fpic, lpic], 'pick-beside'))
  // his SANS card's letters (SANS calendar, Sat 18)
  const sr = await T.sansRead(p, W, ISO[18], 'f7-card').catch(e => ({ err: e.message }))
  W.rec('F7.card', 'his SANS card\'s letters on the SANS calendar\'s day (F, O, A order) — RECORDED', 'REC', J(sr).slice(0, 900), sr.pic || '')
  await W5.closeSansWin(p, W)
  // F9 = A15: no event ticked
  const e1 = await tryEmpty(p, W, ISO[19], PIXEL, 'f9-new')
  W.rec('F9.new', 'F9 = A15 — a new filing with Fly, OFT and AMT all unticked: RECORDED whether it saves and what it says', e1.made.length ? 'REC' : 'REC', J({ saveGreyed: e1.saveDisabled, stayed: e1.stayed, words: e1.words, toast: e1.toast, made: e1.made, form: e1.form }), e1.pic)
  const pIid = (await p.evaluate(() => (window.INPUTS || []).filter(r => /SANS/i.test(String(r.type)) && JSON.stringify(r.people || r.person || '').includes('badger') && r.date === 'Jul 17').map(r => r.iid)))[0]
  const e2 = pIid ? await editFiling(p, W, ISO[17], pIid, [], null, 'f9-edit') : { why: 'Pixel\'s Fri 17 filing not found' }
  W.rec('F9.edit', 'F9 = A15 — Pixel\'s saved "AMT only" reopened, every box unticked, Save: RECORDED; the saved filing must stay "AMT"', e2.rec ? (e2.rec.sans && e2.rec.sans.a && !e2.rec.sans.f && !e2.rec.sans.o ? 'REC' : false) : 'NW', J(e2).slice(0, 700), e2.pic || '')
  const q9 = await quick(p, W, 4, PIXEL, 'f9-after')
  W.rec('F9.after', 'F9 — Pixel\'s Fri 17 lines after the refused / saved edit (RECORDED)', 'REC', J(q9.his), q9.pic)
  // F13: two filings one day (Bolt, Sun 19): Fly 08:00–12:00, then OFT 13:00–17:00; OFT 14:00–15:00 planted
  const t1 = await commit(p, W, ISO[19], BOLT, ['fly'], ['08:00', '12:00'], 'f13-a'); await W5.closeSansWin(p, W)
  const t2 = await commit(p, W, ISO[19], BOLT, ['oft'], ['13:00', '17:00'], 'f13-b')
  const t2note = await L.toastSaid(p)
  if (!t2.iid && await p.locator('#inpEditCancel:visible').count()) { await W.press(p, '#inpEditCancel:visible', 'cancel'); const g = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await g.count()) await W.press(p, g, 'discard') }
  await W5.closeSansWin(p, W)
  W.rec('F13.files', 'F13 — two filings for Bolt on Sun 19 (Fly AM, OFT PM): RECORDED whether the second is allowed', 'REC', J({ first: t1.iid ? t1.rec : t1, second: t2.iid ? t2.rec : 'not saved', note: t2note }).slice(0, 600), [t1.pic, t2.pic].join(', '))
  const s9 = await addSimRow(p, W, 6, 'oft', 'EP-9', '14:00', '15:00')
  const r13 = await put(p, W, 6, `s:6.oft.${s9.ri}.p`, BOLT, 'f13', undefined, 'F13.note')
  const j13 = await judgeMan(p, W, 6, BOLT, null, 'F13', 'F13 — Bolt on the 14:00–15:00 OFT with two filings: RECORDED what the list says', 'f13', { rec: true, seat: `s:6.oft.${s9.ri}.p` })
  const c13 = await T.sansRead(p, W, ISO[19], 'f13-card').catch(e => ({ err: e.message }))
  W.rec('F13.side', 'F13 — the crew list (armed), the warning list and his SANS card, side by side (RECORDED; must agree)', 'REC', `crew ${r13.c ? say1(r13.c, BOLT) : '?'} · list ${J(j13.a.his.board)} · card ${J(c13).slice(0, 400)}`, [r13.pic, j13.a.pics[0], c13.pic].filter(Boolean).join(', '))
  await W5.closeSansWin(p, W)
  void fB
}

/* ---- HRS: F10 = A14, N6, F11 = A12, F12 = A11 ---- */
S.HRS = async (p, W) => {
  // F10 / N6: Otter Thu 16 Fly 08:00–12:00, a flight T/O 13:00
  await fileIt(p, W, ISO[16], OTTER, ['fly'], ['08:00', '12:00'], 'o16')
  const v = await addLine(p, W, 3, { cs: 'VL', to: '13:00', ld: '14:00' }); await setBox(p, W, 3, `ff:3.${v.wi}.0.msn`, 'BFM')
  const kv = `3.${v.wi}.0.0.w`
  await put(p, W, 3, kv, OTTER, 'f10', hrs('Otter', '08:00', '12:00', 'VL BFM (T/O 13:00)'), 'F10.note')
  await judgeMan(p, W, 3, OTTER, [hrs('Otter', '08:00', '12:00', 'VL BFM (T/O 13:00)')], 'F10.N6', 'F10 / N6 — the hours line unchanged: "SANS: available 08:00–12:00 only. Planned on VL BFM (T/O 13:00)"', 'f10', { seat: kv, chip: 'A' })
  await setBox(p, W, 3, `ff:3.${v.wi}.0.to`, ''); await setBox(p, W, 3, `ff:3.${v.wi}.0.ld`, '')
  const q = await quick(p, W, 3, OTTER, 'f10-untimed')
  W.rec('F10.untimed', 'F10 — the line\'s times cleared: Otter offered Fly, so no SANS line at all (D2585)', q.his.length === 0 && /\S/.test(q.head), `${J(q.his)} · head "${q.head}" · line ${J(await lineOf(p, 3, v.wi))}`, q.pic)
  // A14: Marlin Fri 17 Fly only 08:00–12:00, an OFT 13:00–14:00; then OFT added; then hours widened
  const fm = await fileIt(p, W, ISO[17], MARLIN, ['fly'], ['08:00', '12:00'], 'm17')
  const s = await addSimRow(p, W, 4, 'oft', 'EP-9', '13:00', '14:00')
  await put(p, W, 4, `s:4.oft.${s.ri}.w`, MARLIN, 'a14', undefined, 'A14.note')
  let q2 = await quick(p, W, 4, MARLIN, 'a14-1')
  W.rec('A14.1', 'A14 — Fly only 08:00–12:00, on an OFT 13:00–14:00: the event mismatch named (RECORDED whether one or two lines)', q2.his.some(x => x === off('Marlin', 'Fly', 'Sim EP-9 13:00–14:00')) ? 'REC' : false, J(q2.his), q2.pic)
  let e = await editFiling(p, W, ISO[17], fm.iid, ['fly', 'oft'], ['08:00', '12:00'], 'a14-e1')
  q2 = await quick(p, W, 4, MARLIN, 'a14-2')
  W.rec('A14.2', 'A14 — OFT ticked as well (hours unchanged): the hours line "SANS: available 08:00–12:00 only. Planned on Sim EP-9 13:00–14:00"', e.ok && q2.his.length === 1 && q2.his[0] === hrs('Marlin', '08:00', '12:00', 'Sim EP-9 13:00–14:00'), `${J(e.rec)} · ${J(q2.his)}`, [e.pic, q2.pic].join(', '))
  e = await editFiling(p, W, ISO[17], fm.iid, ['fly', 'oft'], ['08:00', '15:00'], 'a14-e2')
  q2 = await quick(p, W, 4, MARLIN, 'a14-3')
  W.rec('A14.3', 'A14 — hours widened to 08:00–15:00: no SANS line', e.ok && q2.his.length === 0, `${J(e.rec)} · ${J(q2.his)} · head "${q2.head}"`, [e.pic, q2.pic].join(', '))
  // F11 / A12: Bolt Thu 16, a flight T/O 13:00 landing 14:00 (R/B defaults), Fly with hours widening step by step
  const fb = await fileIt(p, W, ISO[16], BOLT, ['fly'], ['12:30', '14:30'], 'b16')
  const vb = await addLine(p, W, 3, { cs: 'VB', to: '13:00', ld: '14:00' }); await setBox(p, W, 3, `ff:3.${vb.wi}.0.msn`, 'BFM')
  const fl = await p.evaluate(([i, w]) => { const x = window.DAYS[i].waves[w].formations[0]; return { rl: x.rl || '', br: x.br || '', to: x.to, ld: x.ld } }, [3, vb.wi])
  const shown = await p.evaluate(([i, w]) => [...document.querySelectorAll(`#schedBoard [data-bfld^="ff:${i}.${w}.0."]`)].map(e => e.dataset.bfld.split('.').pop() + '=' + (e.value || e.placeholder || '')), [3, vb.wi])
  const r11 = await put(p, W, 3, `3.${vb.wi}.0.0.p`, BOLT, 'f11', undefined, 'F11.note')
  W.rec('F11.flight', 'F11 = A12 — the flight\'s report / brief / take-off / landing as shown on its row (RECORDED)', 'REC', `${J(fl)} · boxes ${J(shown)} · crew list armed ${r11.c ? say1(r11.c, BOLT) : '?'}`, r11.pic)
  for (const span of [['12:30', '14:30'], ['10:40', '14:30'], ['10:40', '16:00'], ['10:00', '16:00'], ['10:41', '16:00'], ['10:40', '15:59'], ['10:00', '17:00'], ['09:59', '13:59'], ['11:00', '14:00'], ['11:59', '14:00'], ['12:00', '14:00'], ['12:01', '14:00'], ['12:00', '13:59']]) {
    const ed = await editFiling(p, W, ISO[16], fb.iid, ['fly'], span, 'f11-' + span.join('').replace(/:/g, ''))
    const q3 = await quick(p, W, 3, BOLT, 'f11-' + span.join('').replace(/:/g, ''))
    W.rec('F11.' + span.join('-'), `F11 = A12 — Bolt filed Fly ${span.join('–')}: RECORDED his line`, ed.ok ? 'REC' : 'NW', `${J(ed.rec)} · ${J(q3.his)} · head "${q3.head}"`, q3.pic)
  }
  // F12 = A11: Marlin Wed 15 a night flight 23:00 → 01:00, nothing filed; then Wed filed all day; then custom hours
  const vn = await addLine(p, W, 2, { cs: 'VN', to: '23:00', ld: '01:00' }); await setBox(p, W, 2, `ff:2.${vn.wi}.0.msn`, 'NITE')
  await put(p, W, 2, `2.${vn.wi}.0.0.w`, MARLIN, 'f12', undefined, 'F12.note')
  const w1 = await quick(p, W, 2, MARLIN, 'f12-wed'), t1 = await quick(p, W, 3, MARLIN, 'f12-thu')
  W.rec('F12.before', 'F12 = A11 — night flight Wed 23:00 → 01:00, nothing filed: one line on Wed only; Thu RECORDED', w1.his.length === 1 && w1.his[0] === nf('Marlin', 'VN NITE (T/O 23:00)') && t1.his.length === 0 ? true : (w1.his.length === 1 && t1.his.length === 0 ? 'REC' : false), `Wed ${J(w1.his)} · Thu ${J(t1.his)} (head "${t1.head}")`, [w1.pic, t1.pic].join(', '))
  const fw = await fileIt(p, W, ISO[15], MARLIN, ['fly'], 'all', 'm15')
  const w2 = await quick(p, W, 2, MARLIN, 'f12-wed2'), t2 = await quick(p, W, 3, MARLIN, 'f12-thu2')
  W.rec('F12.filed', 'F12 / A11 — Wed filed Fly all day: no line either day (no artificial "00:00–23:59 only")', w2.his.length === 0 && t2.his.length === 0, `Wed ${J(w2.his)} · Thu ${J(t2.his)}`, [w2.pic, t2.pic].join(', '))
  const e3 = await editFiling(p, W, ISO[15], fw.iid, ['fly'], ['20:00', '23:30'], 'a11-e')
  const w3 = await quick(p, W, 2, MARLIN, 'a11-wed')
  W.rec('A11.custom', 'A11 — Wed custom 20:00–23:30 that cannot cover the night sortie: the hours line RECORDED', w3.his.length ? 'REC' : false, `${J(e3.rec)} · ${J(w3.his)}`, w3.pic)
}

/* ---- NEG: N1 (standby rows), N2 (ground, duty, all hands, a personal input), N3 = A30 (covered offers), N9 (red above amber) ---- */
S.NEG = async (p, W) => {
  const di = 5
  const sc = await addLine(p, W, di, { kind: 'SC' }), av = await addLine(p, W, di, { kind: 'AVALON' }), bb = await addLine(p, W, di, { kind: 'BB' })
  need(W, 'set.stby', 'Sat 18: SC, AVALON and BB rows', sc.wi >= 0 && av.wi >= 0 && bb.wi >= 0, J({ sc: sc.f, av: av.f, bb: bb.f }))
  const places = [['SC PM MAIN', `5.${sc.wi}.1.0.p`, BOLT], ['SC PM SPARE', `5.${sc.wi}.1.2.w`, OTTER], ['AVALON MAIN', `5.${av.wi}.0.0.w`, PIXEL], ['BB MAIN', `5.${bb.wi}.0.0.w`, MARLIN]]
  for (const [nm, key, id] of places) await put(p, W, di, key, id, 'n1-' + nm.replace(/\W+/g, ''), null, 'N1.note.' + nm.replace(/\W+/g, ''))
  // AVALON flying: its FLIES ticked
  await L.openBoard(p, W, di)
  const fb = p.locator(L.B(`[data-safly="5.${av.wi}.0.0"]`)).first()
  let flies = 'no FLIES button'
  if (await fb.count()) { if ((await fb.getAttribute('aria-pressed')) !== 'true') { await W.press(p, fb, 'flies'); await sleep(500) } flies = await fb.getAttribute('aria-pressed') }
  for (const [nm, , id] of places) {
    await judgeMan(p, W, di, id, [], 'N1.' + nm.replace(/\W+/g, ''), `N1 — ${NAME[id]} on ${nm}${nm.startsWith('AVALON') ? ' (FLIES ' + flies + ')' : ''}: no SANS line, no "A"`, 'n1-' + id, { chip: null })
  }
  // N2: ground row, duty desk, all hands (Fri 17, di 4 — Pixel, Otter, Marlin free there)
  await L.openBoard(p, W, 4)
  const gr = await L.groundRow(p, W, 4, 'GND TRG', '09:00', '10:00', PIXEL)
  await W.press(p, L.B('[data-dradd="4.0"]'), 'dradd'); await sleep(400)
  const dn = await p.evaluate(() => window.DAYS[4].dutywaves[0].rows.length - 1)
  await put(p, W, 4, `d:4.0.${dn}.+`, OTTER, 'n2-duty', null, 'N2.note.duty')
  const pr = await L.progRow(p, W, 4, 'MASS BRIEF', '08:00', '08:30', MARLIN)
  W.rec('N2.set', 'ground row (Pixel), duty desk (Otter), all hands (Marlin) on Fri 17', 'REC', J({ gr: gr.row, duty: await p.evaluate(n => window.DAYS[4].dutywaves[0].rows[n], dn), pr: pr.row }))
  // a personal input for Bolt on Sat 18 (the Inputs page's own form)
  let inp = { why: 'not tried' }
  try {
    const M = await import('./swd-w14d-lib.mjs')
    await M.inDay(p, W, ISO[18])
    await W.press(p, '#icPopAdd', 'icadd'); await p.locator('#inpEditPop #inpEditType').waitFor()
    const types = await p.locator('#inpEditPop #inpEditType option').evaluateAll(os => os.map(o => o.value + ':' + o.textContent.trim()))
    await p.keyboard.press('Escape'); await sleep(300); const g = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await g.count()) await W.press(p, g, 'discard')
    const ty = (types.find(x => /appoint|commit|personal|course/i.test(x)) || types[0] || '').split(':')[0]
    inp = await M.fileIn(p, W, ISO[18], { type: ty, who: BOLT, span: 'custom', from: '09:00', to: '10:00', title: 'DENTAL' }, 'n2-inp')
    inp.types = types; inp.ty = ty
  } catch (e) { inp = { why: String(e.message).slice(0, 200) } }
  W.rec('N2.input', 'N2 — a personal input for Bolt on Sat 18 through the Inputs page (RECORDED what was made)', 'REC', J({ iid: inp.iid, rec: inp.rec, ty: inp.ty, why: inp.why }).slice(0, 400), inp.pic || '')
  for (const [id, nm] of [[PIXEL, 'ground row'], [OTTER, 'duty desk'], [MARLIN, 'all hands']]) await judgeMan(p, W, 4, id, [], 'N2.' + nm.replace(/\W+/g, ''), `N2 — ${NAME[id]} on a ${nm}, nothing filed: no SANS line, no "A"`, 'n2-' + id, { chip: null })
  await judgeMan(p, W, 5, BOLT, [], 'N2.input2', 'N2 — Bolt with a personal input on Sat 18 (and on SC PM MAIN): no SANS line', 'n2-bolt', { chip: null })
  // N3 / A30 on Sun 19 (di 6): covered offers, all three events, an ordinary man
  await fileIt(p, W, ISO[19], PIXEL, ['fly'], 'all', 'x19')
  await fileIt(p, W, ISO[19], OTTER, ['oft'], ['09:00', '11:00'], 'o19')
  await fileIt(p, W, ISO[19], MARLIN, ['fly', 'oft', 'amt'], 'all', 'm19')
  await fileIt(p, W, ISO[19], BOLT, ['oft'], ['09:00', '11:00'], 'b19')
  const f6 = await addLine(p, W, 6, { cs: 'VS', to: '13:00', ld: '14:00' }), f6u = await addLine(p, W, 6, { cs: 'VSU' })
  const o6 = await addSimRow(p, W, 6, 'oft', 'EP-9', '09:30', '10:30'), m6 = await addSimRow(p, W, 6, 'amt', 'AM-3'), u6 = await addSimRow(p, W, 6, 'oft', 'OU')
  await put(p, W, 6, `6.${f6.wi}.0.0.w`, PIXEL, 'n3-x', null, 'N3.note.fly')
  await put(p, W, 6, `s:6.oft.${o6.ri}.w`, OTTER, 'n3-o', null, 'N3.note.oft')
  await put(p, W, 6, `6.${f6u.wi}.0.0.w`, MARLIN, 'a30-m-fu', null, 'A30.note.untimedfly')
  await put(p, W, 6, `s:6.oft.${o6.ri}.p`, ACE, 'a30-ace-oft', null, 'set.ace.oft')   // the front seat filled first, so the "+" arms the extras (run NEG-d)
  await put(p, W, 6, `s:6.oft.${o6.ri}.+`, MARLIN, 'a30-m-oft', null, 'A30.note.oft')
  await put(p, W, 6, `s:6.amt.${m6.ri}.w`, MARLIN, 'a30-m-amt', null, 'A30.note.amt')
  await put(p, W, 6, `s:6.oft.${u6.ri}.p`, BOLT, 'a30-b-ou', null, 'A30.note.hoursuntimed')
  await put(p, W, 6, `6.${f6.wi}.0.0.p`, ACE, 'a30-ace', null, 'A30.note.ace')
  for (const [id, what] of [[PIXEL, 'N3 — Pixel Fly all day on a timed flight'], [OTTER, 'N3 — Otter OFT 09:00–11:00 on an OFT 09:30–10:30'], [MARLIN, 'A30 — Marlin all three events all day on an untimed flight, a timed OFT and an untimed AMT'], [BOLT, 'A30 — Bolt OFT with custom hours 09:00–11:00, on an OFT with no times: no hours line'], [ACE, 'A30 / N4 — Ace (not SANS) on a timed flight']]) {
    await judgeMan(p, W, 6, id, [], 'N3.' + NAME[id], what + ': no SANS line, no "A"', 'n3-' + id, { chip: null })
  }
  // N9: Fri 17, Bolt (SDO all day) on a timed flight: the red conflict line above the amber lines; his chip the red one
  const f9 = await addLine(p, W, 4, { cs: 'VR', to: '13:00', ld: '14:00' })
  await put(p, W, 4, `4.${f9.wi}.0.0.p`, BOLT, 'n9', undefined, 'N9.note')
  const b = await boardList(p, W, 4)
  const sev = (b.lines || []).map(x => x.sev)
  const firstAdv = sev.indexOf('adv'), lastHard = sev.lastIndexOf('hard')
  const pk = (await pucksOf(p, '#schedBoard', BOLT)).filter(x => x.where !== 'crew list')
  W.rec('N9', 'N9 — a day with a red conflict and a SANS line: every red line above every amber one; Bolt\'s SANS line present; his chip the red one (RECORDED)', lastHard < firstAdv && b.lines.some(x => /Bolt — SANS/.test(x.text)), `order ${J(b.lines.map(x => x.sev + ':' + x.text.slice(0, 50)))} · puck ${puckSay(pk)}`, await clipOf(p, W, '#schedBoard .sb-warn', 'n9-board', 12))
}

/* ---- PLC: F33 / F34 = A28, F35 (pressing a line), F38 = A31's Legend — one day with three kinds of line (Sat 18) ---- */
S.PLC = async (p, W) => {
  const di = 5
  await fileIt(p, W, ISO[18], OTTER, ['oft'], 'all', 'o18')
  await fileIt(p, W, ISO[18], MARLIN, ['fly'], ['08:00', '10:00'], 'm18')
  const a = await addLine(p, W, di, { cs: 'VL', to: '13:00', ld: '14:00' }); await setBox(p, W, di, `ff:5.${a.wi}.0.msn`, 'BFM')
  const b = await addLine(p, W, di, { cs: 'VIPER21', to: '15:00', ld: '16:00' }); await setBox(p, W, di, `ff:5.${b.wi}.0.msn`, 'LOW LEVEL NAVIGATION AND SURFACE ATTACK TACTICS')
  const c = await addLine(p, W, di, { cs: 'VZ', to: '13:30', ld: '14:30' }); await setBox(p, W, di, `ff:5.${c.wi}.0.msn`, 'ACM')
  const t = await addLine(p, W, di, { cs: 'VT', to: '14:30', ld: '15:30' }); await setBox(p, W, di, `ff:5.${t.wi}.0.msn`, 'BFM')
  await put(p, W, di, `5.${a.wi}.0.0.p`, BOLT, 'plc-bolt', nf('Bolt', 'VL BFM (T/O 13:00)'), 'F33.note.nf')
  const bn = (await lineOf(p, di, b.wi))
  await put(p, W, di, `5.${b.wi}.0.0.w`, OTTER, 'plc-otter', off('Otter', 'OFT', `${bn.cs} ${bn.msn} (T/O 15:00)`), 'F33.note.off')
  await put(p, W, di, `5.${c.wi}.0.0.w`, MARLIN, 'plc-marlin', hrs('Marlin', '08:00', '10:00', 'VZ ACM (T/O 13:30)'), 'F33.note.hrs')
  await put(p, W, di, `5.${t.wi}.0.0.p`, BOLT, 'plc-bolt2', undefined, 'F35.note.second')
  const want = { [BOLT]: [nf('Bolt', 'VL BFM (T/O 13:00)'), nf('Bolt', 'VT BFM (T/O 14:30)')], [OTTER]: [off('Otter', 'OFT', `${bn.cs} ${bn.msn} (T/O 15:00)`)], [MARLIN]: [hrs('Marlin', '08:00', '10:00', 'VZ ACM (T/O 13:30)')] }
  const ja = await judgeMan(p, W, di, BOLT, want[BOLT], 'F33.bolt', `F33${W.isPhone ? '/F34' : ''} = A28 — "no availability filed", word for word in every place under the check's name; the count the same`, 'plc-b', { chip: 'A', seat: `5.${a.wi}.0.0.p` })
  await judgeMan(p, W, di, OTTER, want[OTTER], 'F33.otter', 'F33 = A28 — the mismatch line (long mission name), word for word in every place', 'plc-o', { chip: 'A' })
  await judgeMan(p, W, di, MARLIN, want[MARLIN], 'F33.marlin', 'F33 = A28 — the hours line, word for word in every place', 'plc-m', { chip: 'A' })
  // F34: every SANS line wrapped (never cut), inside the screen, its ✕ the topmost thing at its own middle
  const all = [...ja.a.board.lines, ...ja.a.es.lines, ...ja.a.view.lines].filter(x => /SANS/.test(x.text))
  const bad = all.filter(x => x.inScreen === false || x.cut || (x.btn && x.btnTop !== true))
  W.rec('F34.fit', `F34 = A28 — at ${W.isPhone ? 402 : 1536}: every SANS line inside the screen, not cut, its ✕ reachable (View-only has none)`, all.length >= 4 && !bad.length, `${all.length} lines read · ${bad.length ? 'BAD ' + J(bad.map(x => ({ t: x.text.slice(0, 40), inScreen: x.inScreen, cut: x.cut, btnTop: x.btnTop }))) : 'all fit'} · wraps ${J(all.map(x => x.wraps))}`, ja.a.pics.join(', '))
  W.rec('F34.viewbtn', 'View-only Sched as an admin: RECORDED whether its lines carry a ✕', 'REC', J(ja.a.view.lines.map(x => x.btn || 'none')))
  // F35: what a press of each line lights, on the board and on Edit Schedule, beside a non-SANS line for the same man
  const press = async (where, re, tag) => {
    if (where === 'board') {
      const r = await boardList(p, W, di)
      const l = r.lines.find(x => re.test(x.text)); if (!l) return { none: 'no such line ' + re }
      const el = p.locator(`#schedBoard .wln[data-wix="${l.ix}"] .wln-t`).first()
      await el.scrollIntoViewIfNeeded(); if (W.isPhone) await el.tap(); else await el.click(); await sleep(600)
      const out = { line: l.text, ...(await lit(p)), pic: await W.pic(p, tag) }
      const cf = p.locator('#schedBoard .wln.ok, #schedBoard button:has-text("Clear focus")').first(); if (await cf.count()) await cf.click().catch(() => {})
      await sleep(300)
      return out
    }
    const r = await dayList(p, W, '#eWeek', di)
    const l = r.lines.find(x => re.test(x.text)); if (!l) return { none: 'no such line ' + re }
    const el = p.locator(`#eWeek .day[data-day="${di}"] .witem[data-wix="${l.ix}"] .wtx`).first()
    await el.scrollIntoViewIfNeeded(); if (W.isPhone) await el.tap(); else await el.click(); await sleep(700)
    const out = { line: l.text, page: await p.evaluate(() => window.CURPAGE), ...(await lit(p)), pic: await W.pic(p, tag) }
    const cf = p.getByRole('button', { name: /Clear focus/ }).first(); if (await cf.count() && await cf.isVisible()) await W.press(p, cf, 'clear-focus')
    return out
  }
  const bl = await boardList(p, W, di)
  const other = (bl.lines.find(x => /Bolt/.test(x.text) && !/SANS/.test(x.text)) || {}).text || ''
  const otherRe = other ? new RegExp(other.slice(0, 25).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) : /CO approval|Conflict|turn/
  for (const where of ['board', 'es']) {
    const s1 = await press(where, /Bolt — SANS: no availability filed for today\. Planned on VL/, `f35-${where}-sans`)
    const s2 = await press(where, otherRe, `f35-${where}-other`)
    const s3 = await press(where, /Otter — SANS/, `f35-${where}-otter`)
    W.rec(`F35.${where}`, `F35 — ${where === 'board' ? 'the Board' : 'Edit Schedule'}: a press of Bolt's SANS line lights his pucks as a press of his other line ("${other.slice(0, 50)}") does; Otter's lights Otter`, s1.focused && s2.focused && s1.focused.some(x => x.startsWith(BOLT + '@')) && s3.focused && s3.focused.some(x => x.startsWith(OTTER + '@')) ? (J(s1.focused.filter(x => x.startsWith(BOLT))) === J((s2.focused || []).filter(x => x.startsWith(BOLT))) ? true : 'REC') : false,
      `SANS: ${J(s1)} · other: ${J(s2)} · Otter: ${J(s3)}`.slice(0, 1600), [s1.pic, s2.pic, s3.pic].filter(Boolean).join(', '))
  }
  // F38 / A31: the Legend
  if (await p.locator('#schedBoard').count()) await L.closeBoard(p, W)
  await L.go(p, 'editsched')
  let lg = p.locator('.legkey:visible').first(), how = 'the Legend chip'
  if (!(await lg.count())) { lg = p.locator('button:visible, summary:visible, [role="button"]:visible', { hasText: /Legend/i }).first(); how = 'the "Legend — colours & flags" fold' }
  if (!(await lg.count())) {
    const more = p.locator('button:visible', { hasText: /^(…|⋯|More)$/ }).first()
    if (await more.count()) { await W.press(p, more, 'more'); how = 'the … menu, then Legend'; lg = p.locator('button:visible, [role="menuitem"]:visible', { hasText: /Legend/ }).first() }
  }
  if (!(await lg.count())) { W.rec('F38', 'F38 = A31 — the Legend', 'NW', 'no Legend door found on Edit Schedule at this size', await W.pic(p, 'f38-nolegend')); return }
  await W.press(p, lg, 'legend'); await sleep(500)
  const lr = await p.evaluate(() => {
    const t = x => (x ? x.textContent || '' : '').replace(/\s+/g, ' ').trim()
    const rows = [...document.querySelectorAll('*')].filter(e => e.children.length <= 3 && /advisory —/.test(t(e)) && t(e).length < 90 && e.getBoundingClientRect().width > 0)
    const r = rows[rows.length - 1]
    const box = r ? r.getBoundingClientRect() : null
    return { row: t(r), rows: rows.map(t).slice(0, 4), box: box && [Math.round(box.left), Math.round(box.right), Math.round(box.top), Math.round(box.height)], vw: innerWidth }
  })
  const lpic = await W.pic(p, 'f38-legend')
  W.rec('F38', `F38 = A31 — the Legend (${how}): the amber "A" line reads "A ${LEGEND}" and fits`, /advisory — shift, ground or SANS availability$/.test(lr.row) && !/advisory — shift, ground or SANS availability\S/.test(lr.row) && lr.box && lr.box[1] <= lr.vw, J(lr), lpic)
  await p.keyboard.press('Escape'); await sleep(300)
  const x = p.locator('button:visible', { hasText: /^(✕|×|Close|Done)$/ }).first(); if (await p.locator('.legkey:visible').count() === 0 && await x.count()) await W.press(p, x, 'legend-close')
  W.rec('F38.closed', 'the Legend closed', 'REC', '', await W.pic(p, 'f38-closed'))
}

/* ---- PU: the plain-user round ---- */
S.PU = async (p, W) => {
  await Z.post(p, W, RANGER, Y.D[17], 'set.post')
  await L.go(p, 'editsched')
  W.rec('PU.1', 'Saber on Edit Schedule', 'REC', '', await W.pic(p, 'pu-01-editsched'))
  const di = 5
  const a = await addLine(p, W, di, { cs: 'PU', to: '13:00', ld: '14:00' })
  W.rec('PU.2', 'Sat 18: + Wave → Flying wave, PU 13:00–14:00', a.wi >= 0, J(a.f), await W.pic(p, 'pu-02-line'))
  const o = await addSimRow(p, W, di, 'oft', 'PU OFT', '09:00', '10:00')
  W.rec('PU.3', 'an OFT row PU OFT 09:00–10:00', o.ri >= 0, J(o.r), await W.pic(p, 'pu-03-oft'))
  const k1 = `5.${a.wi}.0.0.p`, k2 = `s:5.oft.${o.ri}.w`
  let r = await put(p, W, di, k1, BOLT, 'pu-04', nf('Bolt', 'PU (T/O 13:00)'), 'PU.4')
  r = await put(p, W, di, k2, OTTER, 'pu-05', nf('Otter', 'Sim PU OFT 09:00–10:00'), 'PU.5')
  let w = await dayList(p, W, '#eWeek', di)
  W.rec('PU.6', 'the day\'s warning list opened on Edit Schedule: both lines', Y.sansOf(w.lines).length === 2, Y.listSay(w), await clipOf(p, W, `#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, 'pu-06-list', 12))
  const ix = (w.lines.find(x => /Bolt — SANS/.test(x.text)) || {}).ix, n0 = nOf(w.bar)
  await Y.dayLineBtn(p, W, '#eWeek', di, ix, 'hide')
  w = await Y.readDay(p, '#eWeek', di)
  const hl = w.lines.find(x => /Bolt — SANS/.test(x.text))
  W.rec('PU.7', 'his line hidden (✕): struck in place, the count down by one, the button now ↺', !!hl && hl.struck && nOf(w.bar) === n0 - 1, Y.listSay(w), await clipOf(p, W, `#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, 'pu-07-hidden', 12))
  const pk1 = (await pucksOf(p, '#eWeek', BOLT)).filter(x => x.where === k1)
  W.rec('PU.7b', 'his puck after the hide: no "A" (RECORDED)', 'REC', puckSay(pk1))
  await Y.dayLineBtn(p, W, '#eWeek', di, ix, 'flag-again')
  w = await Y.readDay(p, '#eWeek', di)
  W.rec('PU.8', 'flagged again (↺): back, the count as before', nOf(w.bar) === n0 && !w.lines.find(x => /Bolt — SANS/.test(x.text)).struck, Y.listSay(w), await clipOf(p, W, `#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, 'pu-08-back', 12))
  await L.openBoard(p, W, di)
  /* run PU-d2: the hide and the flag-again are steps on the Undo list too — so Undo is pressed, its title read first, until
     Otter is off the OFT (at most four), each step recorded; then Redo the same number of times */
  let steps = 0, u = '', qu = null
  for (; steps < 4; steps++) {
    const title = await p.locator('#sbUndo:visible').first().getAttribute('title').catch(() => '')
    await sbUndo(p, W); u = await holdsAt(p, k2); qu = await quick(p, W, di, OTTER, `pu-09-undo${steps + 1}`)
    const bq = await quick(p, W, di, BOLT, '')
    W.rec(`PU.9.${steps + 1}`, `Undo press ${steps + 1} (its title "${title}")`, 'REC', `OFT rear holds ${J(u)} · Otter ${J(qu.his)} · Bolt's lines ${J(bq.b.lines.filter(x => /Bolt — SANS/.test(x.text)).map(x => x.text + (x.hid ? ' (hidden)' : '')))} · head "${qu.head}"`, qu.pic)
    if (!String(u).includes(OTTER)) break
  }
  W.rec('PU.9', 'Undo the drop (Otter off the OFT): his line goes', !String(u).includes(OTTER) && qu.his.length === 0, `after ${steps + 1} Undo press(es) · holds ${J(u)} · ${J(qu.his)} · head "${qu.head}"`, qu.pic)
  for (let i = 0; i <= steps; i++) await sbRedo(p, W)
  const rd = await holdsAt(p, k2); const qr = await quick(p, W, di, OTTER, 'pu-10-redo')
  W.rec('PU.10', `Redo pressed ${steps + 1} time(s): he is back and so is his line`, String(rd).includes(OTTER) && qr.his.length === 1, `holds ${J(rd)} · ${J(qr.his)} · head "${qr.head}"`, qr.pic)
  await L.closeBoard(p, W)
  W.rec('PU.11', 'the board closed with ✓ Done', !(await p.locator('#schedBoard:visible').count()), '', await W.pic(p, 'pu-11-done'))
  if (W.isPhone) {
    const cp = await X.A.S.crewPanelTo(p, W, 'sat').catch(e => 'ERR ' + e.message)
    W.rec('PU.12', 'Edit Schedule\'s crew panel opened (phone)', 'REC', J(cp), await W.pic(p, 'pu-12-crew'))
    await X.A.S.crewPanelClose(p, W).catch(() => {})
    W.rec('PU.13', 'and closed', 'REC', '', await W.pic(p, 'pu-13-crew-closed'))
  } else W.rec('PU.12', 'Edit Schedule\'s crew panel: always shown on the desktop (no open / close)', 'REC', '', '')
  // Legend opened and closed
  /* run PU-p: on the phone a "Legend" chip counts as visible but takes no tap (timed out) — the phone's own door is the
     "Legend — colours & flags" fold, pressed first there */
  let lg = W.isPhone ? p.locator('button:visible, summary:visible, [role="button"]:visible', { hasText: /colours/i }).first() : p.locator('.legkey:visible').first()
  if (!(await lg.count())) lg =p.locator('button:visible, summary:visible, [role="button"]:visible', { hasText: /Legend/i }).first()
  if (await lg.count()) { await W.press(p, lg, 'legend'); W.rec('PU.14', 'the Legend opened', 'REC', '', await W.pic(p, 'pu-14-legend')); if (W.isPhone) await W.press(p, lg, 'legend-close'); else await p.keyboard.press('Escape'); await sleep(300); W.rec('PU.15', `and closed (${W.isPhone ? 'its fold tapped again' : 'Escape'})`, 'REC', '', await W.pic(p, 'pu-15-legend-closed')) } else W.rec('PU.14', 'the Legend', 'NW', 'no Legend chip visible at this size', await W.pic(p, 'pu-14-nolegend'))
  const bd = await boardList(p, W, di)
  W.rec('PU.16', 'the Scheduler Board for the day, its issues panel open', Y.sansOf(bd.lines).length === 2, Y.listSay(bd), await W.pic(p, 'pu-16-board'))
  await L.closeBoard(p, W)
  W.rec('PU.17', 'closed with ✓ Done', !(await p.locator('#schedBoard:visible').count()), '', await W.pic(p, 'pu-17-done'))
  const inf = await dayInfo(p, W, '#eWeek', di)
  W.rec('PU.18', 'the ⓘ popup opened: both SANS lines', Y.sansOf(inf.lines || []).length === 2, J(inf.lines && inf.lines.map(x => x.text)), await W.pic(p, 'pu-18-info'))
  W.rec('PU.19', 'and closed', await infoClose(p, W), '', await W.pic(p, 'pu-19-info-closed'))
  // Ranger, once SANS: a seat on Sat 18 so his day carries the line
  await put(p, W, di, `5.${a.wi}.0.0.w`, RANGER, 'pu-20', undefined, 'PU.20')
  await L.closeBoard(p, W)
  await Z.asR(p, W)
  const v = await dayList(p, W, '#vWeek', di)
  W.rec('PU.21', 'Ranger: View-only Sched, Sat 18\'s warning list (RECORDED; no ✕ for a member)', v.lines && v.lines.every(x => !x.btn) ? 'REC' : false, Y.listSay(v), await W.pic(p, 'pu-21-view'))
  const b = await Z.bell(p, W, 'pu-22-bell')
  W.rec('PU.22', 'Ranger opens the bell: his SANS reminder (RECORDED)', !!b.rem ? 'REC' : false, Z.sayB(b), b.pic)
  if (b.rem) {
    const tp = await Z.X.bellTap(p, W, b.rem.id, 'pu-23')
    W.rec('PU.23', 'tap the reminder: the SANS calendar opens on its day', tp.page === 'inputs', J(tp), tp.pic)
    await T.closeAll(p, W)
    W.rec('PU.24', 'what it opened, closed', !(await p.locator('[data-testid="win-sansday"]:visible').count()), '', await W.pic(p, 'pu-24-closed'))
  }
}

/* two pictures side by side in one (a blank page of the same browser, the pictures as data) */
async function composite(p, W, files, tag) {
  const fs = await import('node:fs'), path = await import('node:path')
  const imgs = files.filter(Boolean).map(f => 'data:image/png;base64,' + fs.readFileSync(path.join(Y.OUT, f)).toString('base64'))
  if (imgs.length < 2) return ''
  const q = await p.context().newPage()
  await q.setContent(`<body style="margin:0;background:#111;display:flex;gap:12px;align-items:flex-start;padding:8px">${imgs.map(s => `<img src="${s}" style="max-width:48vw">`).join('')}</body>`)
  await sleep(300)
  const f = `${W.scn}-${tag}-${W.sz.name}.png`
  await q.screenshot({ path: path.join(Y.OUT, f), fullPage: true })
  await q.close()
  return f
}

const fn = S[SCN]
if (!fn) { console.log('no such scenario', SCN); process.exit(1) }
await run(SCN, SZ, async (p, W) => {
  const bundle = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean))
  W.rec('bundle', 'the page serves index-ZgGJLqIy.js', bundle.some(s => /index-ZgGJLqIy\.js$/.test(s)), J(bundle))
  await fn(p, W)
  W.rec('N7', 'N7 / lesson 33 — no note this run told anyone to file', !NOTES.some(tellsToFile), `${NOTES.length} notes read`)
})
Y.saveRaw(`${SCN}-${SZ}-${process.env.SWLA_RUN || 'run1'}`)
const c = k => L.results.filter(r => r.ok === k).length
console.log(`DONE ${SCN} ${SZ}: ${L.results.length} rows · PASS ${c(true)} · FAIL ${c(false)} · RECORDED ${c('REC')} · NOT WALKED ${c('NW')}`)
process.exit(0)
