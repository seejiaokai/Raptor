// swl-w1B — walker B of the warning list's SANS lines walk (his D2579, D2584 Q3 / 2a / 3b, D2583), chat 203, 26 Nov 26:
// hiding, publishing, Undo, the marks and the note — F21–F23, F25–F29, F36, F40 (with A1–A4, A22–A27), the print of a day carrying
// the line (lesson 18), Fable's N8, N11, N12, N14, and the plain-user round. Each scenario a fresh browser world, Saber signed in,
// clock started 15 Jul 2026 09:00 and left running. Brief: docs/superpowers/briefs/2026-11-26-sans-warnlines-walk-brief.md
// Run from raptor-port/:  SZ=d|p SWLB_RUN=run1 [ONLY=s21,s25] node scripts/handpass/swl-w1B.mjs
import './swl-w1B-env.mjs'
import { writeFileSync } from 'node:fs'
const B = await import('./swl-w1B-lib.mjs')
const { T, L, A, W5, J, sleep, OUT, path, need, asR, asS, plan, mkLine, places, nIss, liveSans, amberA, pk, pkSay, openList, readList, listSay,
  tapLine, listPic, boardList, boardSay, dayInfo, infoSay, fileFor, unfile, topDoor, boardUndo, dragIn, noteBox, noteWatch, notesSeen, held,
  RANGER, postR, bell, sayB, tapAndRead, remDays, armE, pickE, disarmE, listOf, meSay, setBox, scene, NF, CHECK } = B
const SZ = process.env.SZ || 'd'
console.log('VERSION swl-w1B 1 · size', SZ, '· run', process.env.SWLB_RUN || 'run1', '· only', process.env.ONLY || 'all')
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const DI = 4, ISO = '2026-07-17', TUE = 1
const MARLIN = 'cards', OTTER = 'wrangler', PIXEL = 'badger', BOLT = 'yeti', JESTER = 'ipman'
const CS = { cards: 'Marlin', wrangler: 'Otter', badger: 'Pixel', yeti: 'Bolt', ipman: 'Jester', bane: 'Ranger' }
const TOLD_FILE = /\bfile it\b|\bplease file\b|\bneeds? to file\b|\bfile (his|her|their|your)\b|\bto file\b/i
const lineOf = (lines, cs) => lines.find(x => x.text.includes(cs + ' — SANS:'))
const linesOf = (lines, cs) => lines.filter(x => x.text.includes(cs + ' — SANS:'))
const tailOf = x => x ? x.text.replace(/^.*? — (SANS:.*?)\s*[✕↺]?$/, '$1').trim() : 'NO LINE'
const VLBFM = { cs: 'VL', msn: 'BFM', to: '13:00', ld: '14:00' }
const W1 = `${NF}VL BFM (T/O 13:00)`
/* one man's SANS line on Edit Schedule's list: its index and words */
async function eLine(p, W, cs) { await openList(p, W, '#eWeek', DI); const l = await B.readOpen(p, W, '#eWeek', DI); return { l, x: lineOf(l.lines, cs) } }
/* the note judged by its reader (lesson 33): one note, no telling anyone to file */
const noteOk = (t, box) => !TOLD_FILE.test(t) && (!box || typeof box !== 'object' || box.n === 1)
/* publish Fri 17 from its board (the four sign-offs, then Publish day / Publish AL<n>) — the board opened first */
async function pubDay(p, W) { await L.openBoard(p, W, DI); return L.publish(p, W, DI) }

const SC = {}

/* F21 = A24 — the note after a drop (desktop drag), after tap-to-plan on the board and on Edit Schedule's week; with a mismatch,
   wrong hours and an untimed sim */
SC.s21 = async (p, W) => {
  const l1 = await mkLine(p, W, DI, VLBFM)
  need(W, 's21.l1', 'a flying line VL BFM T/O 13:00 LD 14:00 on Fri 17 (+ Wave, CS / MSN / T/O / LD typed)', l1.wi >= 0 && l1.f.to === '13:00' && l1.f.msn === 'BFM', J(l1.f))
  const want = `Marlin — ${W1}`
  if (!W.isPhone) {
    const d = await dragIn(p, W, DI, l1.rcp, MARLIN, 's21-drag')
    chk(W, 's21.drag', `desktop: Marlin (SANS, nothing filed) dragged from the crew list onto VL BFM's RCP — placed; the note reads "${want}" (the new line's words, F21)`, d.placed && d.toast === want, `placed ${d.placed} · note "${d.toast}" · every note seen ${J(d.seen)} · box ${J(d.box)}`, d.pic)
    chk(W, 's21.drag-reader', 'the note read as its reader: one note, telling nobody to file (lesson 33)', noteOk(d.toast, d.box), `"${d.toast}" · ${J(d.box)}`)
    const u = await boardUndo(p, W, DI, 'undo', 's21-u1')
    need(W, 's21.u1', 'the board\'s Undo takes the drop back', !(await B.seatHas(p, l1.rcp, MARLIN)), `${u.title} → "${u.toast}"`, u.pic)
  }
  await noteWatch(p)
  const t = await plan(p, W, DI, l1.rcp, MARLIN, 's21-tap')
  const tb = await noteBox(p).catch(() => '')
  chk(W, 's21.tap', `board, tap-to-plan: Marlin into VL BFM's RCP — placed; the note reads "${want}"`, t.placed && t.toast === want, `placed ${t.placed} · note "${t.toast}" · seen ${J(await notesSeen(p))}`, t.pic)
  chk(W, 's21.tap-reader', 'the note: one, telling nobody to file; on the phone inside the screen, wrapped not cut (lesson 33, F21 RECORD)', noteOk(t.toast, tb) && (typeof tb !== 'object' || (tb.left >= 0 && tb.right <= tb.vw && !tb.cut)), J(tb))
  /* Edit Schedule's own week: the seat pressed there, his puck in the crew panel tapped */
  const u2 = await boardUndo(p, W, DI, 'undo', 's21-u2')
  await L.closeBoard(p, W)
  const ea = await armE(p, W, B.WK1, l1.rcp, 's21-week', MARLIN)
  const ep = ea.armed ? await pickE(p, W, l1.rcp, 's21-week', MARLIN) : { placed: false, toast: 'not armed' }
  const eb = await noteBox(p).catch(() => '')
  await disarmE(p, W)
  chk(W, 's21.week', `Edit Schedule's week, tap-to-plan (seat pressed on the week, Marlin tapped in the crew panel) after the board's Undo ("${u2.toast}"): the note reads "${want}"`, ep.placed && ep.toast === want, `armed ${ea.armed} · placed ${ep.placed} · note "${ep.toast}" · ${J(eb)}`, [ea.pic, ep.pic].filter(Boolean).join(', '))
  /* a mismatch: Otter filed OFT only; and wrong hours: Pixel filed Fly 08:00–12:00 */
  const fo = await fileFor(p, W, ISO, OTTER, ['oft'], 'all', 's21.fo')
  const l2 = await mkLine(p, W, DI, { cs: 'VL', msn: 'ACM', to: '15:00', ld: '16:00' })
  const t2 = await plan(p, W, DI, l2.rcp, OTTER, 's21-mis')
  const w2 = `Otter — SANS: offered OFT only today. Planned on VL ACM (T/O 15:00)`
  chk(W, 's21.mis', `Otter (filed OFT only) tapped into VL ACM's RCP: the note reads "${w2}" (D2584 2a)`, t2.placed && t2.toast === w2 && noteOk(t2.toast), `filed ${!!fo.iid} · placed ${t2.placed} · note "${t2.toast}"`, t2.pic)
  const fp = await fileFor(p, W, ISO, PIXEL, ['fly'], ['08:00', '12:00'], 's21.fp')
  const l3 = await mkLine(p, W, DI, { cs: 'RU', msn: 'BFM', to: '17:00', ld: '18:00' })
  const t3 = await plan(p, W, DI, l3.rcp, PIXEL, 's21-hrs')
  const w3 = `Pixel — SANS: available 08:00–12:00 only. Planned on RU BFM (T/O 17:00)`
  chk(W, 's21.hrs', `Pixel (filed Fly 08:00–12:00) tapped into RU BFM's RCP: the note reads "${w3}" (the hours line, unchanged)`, t3.placed && t3.toast === w3 && noteOk(t3.toast), `filed ${!!fp.iid} · placed ${t3.placed} · note "${t3.toast}"`, t3.pic)
  /* an untimed OFT named EP-9, Jester (SANS pilot, nothing filed) in its front seat */
  const s = await W5.addSim(p, W, DI, 'oft', 'EP-9', '', '')
  const t4 = await plan(p, W, DI, `s:${DI}.oft.${s.ri}.p`, JESTER, 's21-sim')
  const w4 = `Jester — ${NF}Sim EP-9`
  chk(W, 's21.sim', `Jester tapped into an untimed OFT "EP-9": the note reads "${w4}" (the brief's sim tail)`, t4.placed && t4.toast === w4 && noteOk(t4.toast), `row ${J(s.r)} · placed ${t4.placed} · note "${t4.toast}"`, t4.pic)
  const st = await places(p, W, DI, 's21-all', [MARLIN, OTTER, PIXEL, JESTER])
  rec(W, 's21.list', "the day's list after the four plants, every place (the notes' lines stand in it)", st.say, st.pic)
  chk(W, 's21.list-words', 'the list carries each line the notes named, word for word', [want, w2, w3, w4].every(w => st.e.lines.some(x => x.text.includes(w))), st.e.lines.map(x => x.text).join(' || '))
}

/* F22 = A25 — the note when the plant raises a harder warning as well */
SC.s22 = async (p, W) => {
  const l1 = await mkLine(p, W, DI, VLBFM)
  need(W, 's22.l1', 'VL BFM T/O 13:00 on Fri 17', l1.wi >= 0, J(l1.f))
  /* Bolt (SANS pilot, nothing filed) holds the SDO desk 07:30–17:30 on Fri 17 in the demo: a 13:00 flight overlaps it */
  const t = await plan(p, W, DI, l1.fcp, BOLT, 's22-bolt')
  rec(W, 's22.note', 'Bolt (on the SDO desk 07:30–17:30, nothing filed) tapped into VL BFM\'s FCP: the note (RECORD whether the SANS line is named after the red one)', `placed ${t.placed} · note "${t.toast}"`, t.pic)
  chk(W, 's22.note-red', 'the note leads with the red conflict, tells nobody to file', t.placed && /^Bolt — Conflict/.test(t.toast) && noteOk(t.toast), `"${t.toast}"`)
  const st = await places(p, W, DI, 's22-a', [BOLT])
  const sb = lineOf(st.e.lines, 'Bolt')
  chk(W, 's22.list', `the list keeps Bolt's SANS line beside the red conflict ("${W1}")`, sb && sb.text.includes(W1) && st.e.lines.some(x => x.sev === 'hard' && /Bolt/.test(x.text)), st.say, st.pic)
  const seat = (st.bd[BOLT] || []).filter(x => x.where === 'flying line')
  rec(W, 's22.chip', "Bolt's seat puck: which ring and chip win (RECORD — Fable expects the red one, not \"A\")", pkSay(st.bd[BOLT]) + ' · week ' + pkSay(st.wk[BOLT]))
  chk(W, 's22.chip-red', 'his seat puck wears the red ring, not the amber "A" alone', seat.length && seat.every(x => x.ring === 'red'), pkSay(seat))
  /* Marlin (a WSO) into a front seat */
  const l5 = await mkLine(p, W, DI, { cs: 'RU', msn: 'ACM', to: '20:00', ld: '21:00' })
  const t2 = await plan(p, W, DI, l5.fcp, MARLIN, 's22-wso')
  rec(W, 's22.wso', 'Marlin (WSO, SANS, nothing filed) tapped into RU ACM\'s FCP: placed or refused, and the note (RECORD)', `placed ${t2.placed} · note "${t2.toast}"`, t2.pic)
  const st2 = await places(p, W, DI, 's22-b', [MARLIN])
  rec(W, 's22.wso-list', "the list and Marlin's pucks after it (RECORD)", st2.say, st2.pic)
  if (t2.placed) chk(W, 's22.wso-sans', "Marlin's SANS line stands in the list whatever else the front seat raised", !!lineOf(st2.e.lines, 'Marlin'), st2.e.lines.map(x => x.text).join(' || '))
}

/* F23 = A22 — "A" against TT and DT on one man's puck */
SC.s23 = async (p, W) => {
  const a = await mkLine(p, W, DI, { cs: 'VL', msn: 'BFM', to: '09:00', ld: '10:00' })
  const b = await mkLine(p, W, DI, { cs: 'VL', msn: 'ACM', to: '12:30', ld: '13:30' })
  need(W, 's23.lines', 'VL BFM 09:00–10:00 and VL ACM 12:30–13:30 on Fri 17', a.wi >= 0 && b.wi > a.wi, J([a.f, b.f]))
  const t1 = await plan(p, W, DI, a.fcp, JESTER, 's23-a'), t2 = await plan(p, W, DI, b.fcp, JESTER, 's23-b')
  need(W, 's23.plant', 'Jester (SANS pilot, nothing filed) tapped into both FCPs', t1.placed && t2.placed, `"${t1.toast}" / "${t2.toast}"`)
  const seatChips = st => (st.bd[JESTER] || []).filter(x => x.where === 'flying line')
  let st = await places(p, W, DI, 's23-dt', [JESTER])
  rec(W, 's23.dt', 'two sorties 150 min apart: the list and his pucks (RECORD the double-turn line)', st.say, st.pic)
  chk(W, 's23.dt-A', 'his seat pucks show "A", not "DT", while the SANS lines show (the built chip order, D2583)', seatChips(st).length === 2 && seatChips(st).every(x => x.chip === 'A'), pkSay(seatChips(st)))
  await B.setBox(p, W, DI, `[data-bfld="ff:${DI}.${b.wi}.0.to"]`, '11:00'); await B.setBox(p, W, DI, `[data-bfld="ff:${DI}.${b.wi}.0.ld"]`, '12:00')
  st = await places(p, W, DI, 's23-tt', [JESTER])
  const ttLines = st.e.lines.filter(x => /Tight turn/.test(x.text))
  rec(W, 's23.tt', 'VL ACM retimed 11:00–12:00 (60 min after landing): the list and his pucks', st.say, st.pic)
  chk(W, 's23.tt-A', 'a tight turn stands in the list, and his seat pucks still show "A", not "TT"; one chip a puck', ttLines.length >= 1 && seatChips(st).every(x => x.chip === 'A'), `${ttLines.length} tight-turn line(s) · ${pkSay(seatChips(st))}`)
  /* hide both SANS lines — the remaining chip shows (D475) */
  for (let n = 0; n < 2; n++) { const { l } = await eLine(p, W, 'Jester'); const x = liveSans(l.lines).find(y => /Jester/.test(y.text)); if (x) await tapLine(p, W, '#eWeek', DI, x.ix, 's23-hide' + n) }
  st = await places(p, W, DI, 's23-hid', [JESTER])
  rec(W, 's23.hid', 'both SANS lines hidden (✕): the list and his pucks', st.say, st.pic)
  chk(W, 's23.hid-TT', 'with the SANS lines hidden his pucks show the turn chip ("TT" or "DT"), the turn lines still standing (D475)', seatChips(st).length === 2 && seatChips(st).every(x => /TT|DT/.test(x.chip)) && st.e.lines.some(x => /Tight turn/.test(x.text) && !x.hid), pkSay(seatChips(st)))
  /* flagged again, then covered by a filing, then the filing deleted */
  for (let n = 0; n < 2; n++) { const { l } = await eLine(p, W, 'Jester'); const x = l.lines.find(y => /Jester — SANS/.test(y.text) && y.hid); if (x) await tapLine(p, W, '#eWeek', DI, x.ix, 's23-reset' + n) }
  const f = await fileFor(p, W, ISO, JESTER, ['fly'], 'all', 's23.file')
  st = await places(p, W, DI, 's23-filed', [JESTER])
  chk(W, 's23.filed', 'Fly filed all day: no SANS line; the turn chip shows; the turn lines stay', !linesOf(st.e.lines, 'Jester').length && seatChips(st).every(x => /TT|DT/.test(x.chip)) && st.e.lines.some(x => /Tight turn/.test(x.text)), st.say, st.pic)
  const u = await unfile(p, W, ISO, f.iid, 's23-unfile')
  st = await places(p, W, DI, 's23-unfiled', [JESTER])
  chk(W, 's23.unfiled', 'the filing deleted: both SANS lines back, "A" back on both seat pucks', u.ok && linesOf(st.e.lines, 'Jester').length === 2 && seatChips(st).every(x => x.chip === 'A'), `${u.toast} · ${st.say}`, st.pic)
}

/* F25 = A4 (+ N12) — hiding the line, and what brings it back */
SC.s25 = async (p, W) => {
  const l1 = await mkLine(p, W, DI, VLBFM), l2 = await mkLine(p, W, DI, { cs: 'VL', msn: 'ACM', to: '16:00', ld: '17:00' })
  const t1 = await plan(p, W, DI, l1.rcp, MARLIN, 's25-m'), t2 = await plan(p, W, DI, l2.rcp, OTTER, 's25-o')
  need(W, 's25.set', 'Marlin on VL BFM 13:00 RCP and Otter on VL ACM 16:00 RCP, nothing filed for either', t1.placed && t2.placed, `"${t1.toast}" / "${t2.toast}"`)
  const st0 = await places(p, W, DI, 's25-0', [MARLIN, OTTER])
  const n0 = nIss(st0.e.bar)
  chk(W, 's25.start', `both lines shown; Marlin's puck amber with "A" on the week and the board (line "${W1}")`, lineOf(st0.e.lines, 'Marlin') && lineOf(st0.e.lines, 'Otter') && amberA(st0.wk[MARLIN]).length && amberA(st0.bd[MARLIN]).length, st0.say, st0.pic)
  /* (a) ✕ on Marlin's line */
  let x = lineOf(st0.e.lines, 'Marlin')
  await openList(p, W, '#eWeek', DI)
  await tapLine(p, W, '#eWeek', DI, x.ix, 's25-a')
  const a = await places(p, W, DI, 's25-a', [MARLIN, OTTER])
  const ma = lineOf(a.e.lines, 'Marlin'), oa = lineOf(a.e.lines, 'Otter'), mb = lineOf(a.b.lines, 'Marlin'), mi = lineOf(a.i.lines, 'Marlin')
  chk(W, 's25.a-list', '(a) Edit Schedule: his line struck in place with the drawn Reset arrow, the count down by one; Otter\'s line untouched (N12)', ma && ma.hid && ma.struck && /^\[drawn icon/.test(ma.btn) && nIss(a.e.bar) === n0 - 1 && oa && !oa.hid, `count ${n0} → ${nIss(a.e.bar)} · ${listSay(a.e)}`, a.pic)
  chk(W, 's25.a-pucks', '(a) his ring and "A" gone from every copy (week and board), Otter\'s kept (D469, D475)', !(a.wk[MARLIN].some(y => y.ring === 'amber' || y.chip.includes('A'))) && !(a.bd[MARLIN].some(y => y.ring === 'amber' || y.chip.includes('A'))) && amberA(a.bd[OTTER]).length, `Marlin week[${pkSay(a.wk[MARLIN])}] board[${pkSay(a.bd[MARLIN])}] · Otter board[${pkSay(a.bd[OTTER])}]`)
  chk(W, 's25.a-board', '(a) the board\'s panel and the ⓘ popup agree: his line struck, the same count', mb && mb.hid && mi && mi.hid && nIss(a.b.head) === nIss(a.e.bar), `board ${boardSay(a.b)} · ⓘ ${infoSay(a.i)}`)
  /* N12: Marlin's own line on Tue 14 (the demo) is not hidden */
  await openList(p, W, '#eWeek', TUE)
  const tue = await readList(p, '#eWeek', TUE)
  const mt = lineOf(tue.lines, 'Marlin')
  chk(W, 's25.n12', "N12: Marlin's line on Tue 14 (the demo's) still shows — a hide is tied to that day's warning", mt && !mt.hid, listSay(tue), await listPic(p, W, '#eWeek', TUE, 's25-n12-tue'))
  /* (b) ↺ */
  ;({ x } = await eLine(p, W, 'Marlin'))
  await tapLine(p, W, '#eWeek', DI, x.ix, 's25-b')
  const b = await places(p, W, DI, 's25-b', [MARLIN])
  const mb2 = lineOf(b.e.lines, 'Marlin')
  chk(W, 's25.b', '(b) flagged again: the line back unstruck with its ✕, the count back, his ring and "A" back', mb2 && !mb2.hid && mb2.btn === '✕' && nIss(b.e.bar) === n0 && amberA(b.bd[MARLIN]).length, b.say, b.pic)
  /* (c) hidden again, the flight retimed 13:00 → 14:00 */
  ;({ x } = await eLine(p, W, 'Marlin'))
  await tapLine(p, W, '#eWeek', DI, x.ix, 's25-c')
  await B.setBox(p, W, DI, `[data-bfld="ff:${DI}.${l1.wi}.0.ld"]`, '15:00'); await B.setBox(p, W, DI, `[data-bfld="ff:${DI}.${l1.wi}.0.to"]`, '14:00')
  const c = await places(p, W, DI, 's25-c', [MARLIN])
  const mc = lineOf(c.e.lines, 'Marlin')
  rec(W, 's25.c', '(c) hidden, then VL BFM retimed T/O 14:00 LD 15:00: does the line come back unhidden? (RECORD)', `Marlin's line: ${mc ? (mc.hid ? 'STILL HIDDEN' : 'SHOWN') + ' "' + tailOf(mc) + '"' : 'NONE'} · ${c.say}`, c.pic)
  /* (e) — desktop: taken off by a drag back to the crew list, put back by tap-to-plan */
  if (!W.isPhone) try {
    ;({ x } = await eLine(p, W, 'Marlin'))
    if (x && !x.hid) await tapLine(p, W, '#eWeek', DI, x.ix, 's25-e0')
    await L.openBoard(p, W, DI)
    const src = p.locator(`#schedBoard [data-slot="${l1.rcp}"] .puck`).first(), ros = p.locator('#schedBoard .rpuck[data-person="dj"]:visible').first()   /* the drop: onto the crew list, at Ace's puck */
    await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
    const sa = await src.boundingBox(), rb = await ros.boundingBox()
    if (!sa || !rb) throw new Error(`(e) the seat puck or the crew list not drawn: ${J({ sa, rb })}`)
    await p.mouse.move(sa.x + sa.width / 2, sa.y + sa.height / 2); await p.mouse.down(); await p.mouse.move(sa.x + sa.width / 2 + 8, sa.y + sa.height / 2 + 8, { steps: 3 })
    await p.mouse.move(rb.x + rb.width / 2, rb.y + rb.height / 2, { steps: 14 }); await sleep(150); await p.mouse.up(); await sleep(700)
    const off = !(await B.seatHas(p, l1.rcp, MARLIN))
    const pe = await W.pic(p, 's25-e-off')
    const back = await plan(p, W, DI, l1.rcp, MARLIN, 's25-e-back')
    const e = await places(p, W, DI, 's25-e', [MARLIN])
    const me = lineOf(e.e.lines, 'Marlin')
    chk(W, 's25.e-note', `(e) the note when he is put back: never the crew list's old words "SANS — no availability filed for today" (the brief: the note repeats the new line, "Marlin — ${NF}VL BFM (T/O 14:00)")`, back.placed && !/SANS — no availability filed/.test(back.toast), `note "${back.toast}"`, back.pic)
    rec(W, 's25.e', '(e) hidden, then taken off (dragged back to the crew list) and put back (tap-to-plan): does the line come back unhidden? (RECORD)', `off ${off} · back ${back.placed} "${back.toast}" · Marlin's line: ${me ? (me.hid ? 'STILL HIDDEN' : 'SHOWN') : 'NONE'} · ${e.say}`, [pe, back.pic, e.pic].join(', '))
  } catch (err) { W.rec('s25.e', '(e) take off and put back', 'NW', 'its gesture could not be made: ' + String(err.message).slice(0, 200), await W.pic(p, 's25-e-NW')) }
  /* (d) hidden, then he files OFT only — the fact changed: the new line must show */
  ;({ x } = await eLine(p, W, 'Marlin'))
  if (x && !x.hid) await tapLine(p, W, '#eWeek', DI, x.ix, 's25-d0')
  const h = await eLine(p, W, 'Marlin')
  need(W, 's25.d0', "Marlin's line hidden before the filing", h.x && h.x.hid, listSay(h.l))
  const f = await fileFor(p, W, ISO, MARLIN, ['oft'], 'all', 's25.d-file')
  const d = await places(p, W, DI, 's25-d', [MARLIN])
  const md = lineOf(d.e.lines, 'Marlin')
  chk(W, 's25.d', '(d) Marlin filed OFT only: "SANS: offered OFT only today. Planned on VL BFM (T/O …)" SHOWN, not hidden; his ring and "A" back (the situation changed, D469)', md && !md.hid && /^SANS: offered OFT only today\. Planned on VL BFM \(T\/O 1[34]:00\)$/.test(tailOf(md)) && amberA(d.bd[MARLIN]).length, d.say, d.pic)
  /* the filing deleted again: "no availability filed" — shown or still hidden from (d)? */
  const u = await unfile(p, W, ISO, f.iid, 's25-d2')
  const d2 = await places(p, W, DI, 's25-d2', [MARLIN])
  const md2 = lineOf(d2.e.lines, 'Marlin')
  rec(W, 's25.d2', 'the OFT filing deleted again: the line (RECORD shown / hidden and its words)', `${u.ok ? 'deleted' : 'NOT deleted'} · ${md2 ? (md2.hid ? 'HIDDEN' : 'SHOWN') + ' "' + tailOf(md2) + '"' : 'NONE'} · ${d2.say}`, d2.pic)
}

/* A4 — a hidden "no availability" on a timed OFT, then Fly only, then OFT with short hours, then OFT all day (each a different fact) */
SC.a4 = async (p, W) => {
  const s = await W5.addSim(p, W, DI, 'oft', 'EP-9', '15:00', '16:00')
  const t = await plan(p, W, DI, `s:${DI}.oft.${s.ri}.p`, JESTER, 'a4-plant')
  const w0 = `Jester — ${NF}Sim EP-9 15:00–16:00`
  chk(W, 'a4.plant', `Jester into an OFT "EP-9" 15:00–16:00: the note "${w0}"`, t.placed && t.toast === w0, `row ${J(s.r)} · "${t.toast}"`, t.pic)
  let { x } = await eLine(p, W, 'Jester')
  await tapLine(p, W, '#eWeek', DI, x.ix, 'a4-hide')
  const h = await eLine(p, W, 'Jester')
  need(W, 'a4.hid', 'his line hidden', h.x && h.x.hid, listSay(h.l))
  const steps = [
    [['fly'], 'all', /^SANS: offered Fly only today\. Planned on Sim EP-9 15:00–16:00$/, 'Fly only, all day → "offered Fly only today"'],
    [['oft'], ['08:00', '12:00'], /^SANS: available 08:00–12:00 only\. Planned on Sim EP-9 15:00–16:00$/, 'OFT 08:00–12:00 → "available 08:00–12:00 only"'],
  ]
  let n = 0
  for (const [kinds, span, re, label] of steps) {
    const f = await fileFor(p, W, ISO, JESTER, kinds, span, `a4.f${n}`)
    const st = await places(p, W, DI, `a4-f${n}`, [JESTER])
    const j = lineOf(st.e.lines, 'Jester')
    chk(W, `a4.f${n}`, `${label}: SHOWN, not hidden (a different fact, D469)`, j && !j.hid && re.test(tailOf(j)), `"${j ? tailOf(j) : 'NONE'}"${j && j.hid ? ' HIDDEN' : ''} · ${st.say}`, st.pic)
    await unfile(p, W, ISO, f.iid, `a4-u${n}`)
    n++
  }
  const f = await fileFor(p, W, ISO, JESTER, ['oft'], 'all', 'a4.f2')
  let st = await places(p, W, DI, 'a4-f2', [JESTER])
  chk(W, 'a4.f2', 'OFT all day: no SANS line for him, no ring', !linesOf(st.e.lines, 'Jester').length && !amberA(st.bd[JESTER]).length, st.say, st.pic)
  await T.reload(p, 'ad', 'a')
  st = await places(p, W, DI, 'a4-reload', [JESTER])
  chk(W, 'a4.reload', 'after a reload and a fresh sign-in: still no SANS line for him', !linesOf(st.e.lines, 'Jester').length, st.say, st.pic)
  const u = await unfile(p, W, ISO, f.iid, 'a4-u2')
  st = await places(p, W, DI, 'a4-none', [JESTER])
  const j = lineOf(st.e.lines, 'Jester')
  rec(W, 'a4.none', 'the filing deleted: "no availability filed" again — shown, or hidden by the first ✕? (RECORD)', `${u.ok ? 'deleted' : 'NOT deleted'} · ${j ? (j.hid ? 'HIDDEN' : 'SHOWN') + ' "' + tailOf(j) + '"' : 'NONE'}`, st.pic)
}

/* F26 = A26 (+ F40, N14) — the bar's colour, every issue hidden, hidden for everyone */
SC.s26 = async (p, W) => {
  const l1 = await mkLine(p, W, DI, VLBFM)
  const t = await plan(p, W, DI, l1.rcp, MARLIN, 's26-m')
  need(W, 's26.m', 'Marlin on VL BFM 13:00 RCP, nothing filed', t.placed, `"${t.toast}"`)
  let st = await places(p, W, DI, 's26-1', [MARLIN])
  chk(W, 's26.f40a', 'F40: the only issue is his SANS line — the bar amber, "1 issue" (in every place)', /\badv\b/.test(st.e.barCls) && nIss(st.e.bar) === 1 && nIss(st.b.head) === 1 && st.e.lines.length === 1, `bar "${st.e.bar}" [${st.e.barCls}] ${st.e.barColor} · board "${st.b.head}" · ⓘ ${st.i.stat} ${st.i.sev}`, st.pic)
  /* a red issue added: Bolt (on the SDO desk 07:30–17:30) into the same jet's front seat */
  const t2 = await plan(p, W, DI, l1.fcp, BOLT, 's26-bolt')
  st = await places(p, W, DI, 's26-2', [MARLIN, BOLT])
  chk(W, 's26.f40b', 'a red conflict added (Bolt over his SDO desk): the bar turns red', /\bhard\b/.test(st.e.barCls) && st.e.lines.some(x => x.sev === 'hard'), `"${t2.toast}" · bar "${st.e.bar}" [${st.e.barCls}] · ${listSay(st.e)}`, st.pic)
  /* hide the red one first: the bar amber (A26) */
  const red = st.e.lines.filter(x => x.sev === 'hard')
  for (const r of red) { const l = await B.readOpen(p, W, '#eWeek', DI); const y = l.lines.find(z => z.text === r.text && !z.hid); if (y) await tapLine(p, W, '#eWeek', DI, y.ix, 's26-red') }
  st = await places(p, W, DI, 's26-3', [MARLIN, BOLT])
  chk(W, 's26.a26-amber', 'A26: the red line(s) hidden, the SANS lines still showing — the bar amber', /\badv\b/.test(st.e.barCls) && liveSans(st.e.lines).length === 2, `bar "${st.e.bar}" [${st.e.barCls}] · ${listSay(st.e)}`, st.pic)
  /* every issue hidden: the quiet bar still opens the list */
  for (let n = 0; n < 8; n++) { const l = await B.readOpen(p, W, '#eWeek', DI); const y = l.lines.find(z => !z.hid && !z.gone); if (!y) break; await tapLine(p, W, '#eWeek', DI, y.ix, 's26-all' + n) }
  st = await places(p, W, DI, 's26-4', [MARLIN, BOLT])
  chk(W, 's26.none', 'every issue hidden: a quiet "✓ No issues" bar, the lines struck under it; the board "No conflicts flagged ✓" with the struck lines; no ring or "A" on Marlin (D471, D472)', /No issues/.test(st.e.bar) && st.e.lines.length >= 3 && st.e.lines.every(x => x.hid && x.struck) && /No conflicts flagged/.test(st.b.head + ' ' + st.b.other.join(' ')) && st.b.lines.filter(x => x.hid).length >= 3 && !st.bd[MARLIN].some(y => y.ring === 'amber' || y.chip.includes('A')), st.say, st.pic)
  /* the quiet bar opens and shuts the list */
  await openList(p, W, '#eWeek', DI)
  const open1 = await p.evaluate(i => document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`).classList.contains('open'), DI)
  await B.closeList(p, W, '#eWeek', DI)
  const shut = await p.evaluate(i => !document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`).classList.contains('open'), DI)
  const sp = await listPic(p, W, '#eWeek', DI, 's26-shut')
  await openList(p, W, '#eWeek', DI)
  chk(W, 's26.bar-opens', 'the "✓ No issues" bar, pressed, opens the list and shuts it again', open1 && shut, `open ${open1} · shut ${shut}`, sp)
  /* hidden across a reload and a fresh sign-in */
  await T.reload(p, 'ad', 'a')
  st = await places(p, W, DI, 's26-5', [MARLIN])
  chk(W, 's26.reload', 'after a reload and signing in again: still every line hidden, the quiet bar', /No issues/.test(st.e.bar) && st.e.lines.every(x => x.hid), st.say, st.pic)
  /* Ranger (a member): View-only Sched — hidden for him too; struck, no Reset arrow, no ✕ (N14) */
  await asR(p, W)
  await openList(p, W, '#vWeek', DI)
  const v = await readList(p, '#vWeek', DI)
  const vp = await listPic(p, W, '#vWeek', DI, 's26-ranger')
  chk(W, 's26.member', "as Ranger, View-only Sched: the day's lines struck, the bar quiet; no ✕ and no Reset arrow on any line (D469, D471, N14)", /No issues/.test(v.bar) && v.lines.length >= 3 && v.lines.every(x => x.struck && !x.btn), listSay(v), vp)
  const vi = await dayInfo(p, W, '#vWeek', DI, 's26-ranger')
  rec(W, 's26.member-info', 'as Ranger, the ⓘ popup on View-only Sched (RECORD)', infoSay(vi) + ' · closed ' + vi.closed, vi.pic)
  await asS(p, W)
  /* flag Marlin's again: back for everyone */
  const { x } = await eLine(p, W, 'Marlin')
  if (x) await tapLine(p, W, '#eWeek', DI, x.ix, 's26-reset')
  st = await places(p, W, DI, 's26-6', [MARLIN])
  const mx = lineOf(st.e.lines, 'Marlin')
  chk(W, 's26.reset', "Marlin's line flagged again: shown, the bar amber, his ring and \"A\" back", mx && !mx.hid && /\badv\b/.test(st.e.barCls) && amberA(st.bd[MARLIN]).length, st.say, st.pic)
  await asR(p, W)
  await openList(p, W, '#vWeek', DI)
  const v2 = await readList(p, '#vWeek', DI)
  chk(W, 's26.member2', 'as Ranger again: his line shown on View-only Sched', lineOf(v2.lines, 'Marlin') && !lineOf(v2.lines, 'Marlin').struck, listSay(v2), await listPic(p, W, '#vWeek', DI, 's26-ranger2'))
}

/* F27 = A2 + A3 (+ N11) — publishing a day carrying the line, then changes */
SC.s27 = async (p, W) => {
  const l1 = await mkLine(p, W, DI, VLBFM)
  const t = await plan(p, W, DI, l1.rcp, MARLIN, 's27-m')
  need(W, 's27.m', 'Marlin on VL BFM 13:00 RCP, nothing filed', t.placed, `"${t.toast}"`)
  const pub = await pubDay(p, W)
  await L.closeBoard(p, W)
  const head = async () => p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); const tx = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; return d ? `tag "${tx(d.querySelector('.verchip'))}" · "${tx(d.querySelector('[data-pendlist]'))}"` : 'no day' }, DI)
  const vo = async (tag) => { await openList(p, W, '#vWeek', DI); const v = await readList(p, '#vWeek', DI); return { v, pic: await listPic(p, W, '#vWeek', DI, tag) } }
  let st = await places(p, W, DI, 's27-a', [MARLIN])
  let v = await vo('s27-a-view')
  await L.go(p, 'editsched')
  chk(W, 's27.a', `(a) published ("${pub}"): the line shows as published — Edit Schedule, ⓘ, the board, View-only Sched; his ring and "A"`, lineOf(st.e.lines, 'Marlin') && lineOf(st.i.lines, 'Marlin') && lineOf(st.b.lines, 'Marlin') && lineOf(v.v.lines, 'Marlin') && amberA(st.wk[MARLIN]).length, `${await head()} · ${st.say} ·· VIEW ${listSay(v.v)}`, [st.pic, v.pic].join(', '))
  /* N11: nothing changed — a reload rewrites nothing on the published face */
  await T.reload(p, 'ad', 'a')
  const v1 = await vo('s27-n11')
  chk(W, 'n11', 'N11: a reload with no change — the published face is word for word the same', J(v1.v.lines.map(x => x.text)) === J(v.v.lines.map(x => x.text)) && v1.v.bar === v.v.bar, `before "${v.v.bar}" ${v.v.lines.length} · after "${v1.v.bar}" ${v1.v.lines.length}`, v1.pic)
  /* (b) matching availability filed */
  const f = await fileFor(p, W, ISO, MARLIN, ['fly'], 'all', 's27.b-file')
  await L.go(p, 'editsched')
  st = await places(p, W, DI, 's27-b', [MARLIN])
  v = await vo('s27-b-view')
  await L.go(p, 'editsched')
  const fb = st.e.lines.find(x => /Marlin/.test(x.text))
  rec(W, 's27.b', '(b) Fly filed all day after publishing: what each face shows, what reads pending (RECORD)', `${await head()} · ${st.say} ·· VIEW ${listSay(v.v)}`, [st.pic, v.pic].join(', '))
  chk(W, 's27.b-frozen', '(b) the published face (View-only Sched) keeps his line frozen (D179, D2005); the working copy no longer carries it as a live line', lineOf(v.v.lines, 'Marlin') && !liveSans(st.e.lines).some(x => /Marlin/.test(x.text)), `working: ${fb ? fb.text + (fb.gone ? ' [FROZEN]' : '') : 'none'} · view: ${lineOf(v.v.lines, 'Marlin') ? 'kept' : 'GONE'}`)
  /* (c) deleted again */
  const u = await unfile(p, W, ISO, f.iid, 's27-c')
  await L.go(p, 'editsched')
  st = await places(p, W, DI, 's27-c', [MARLIN])
  v = await vo('s27-c-view')
  await L.go(p, 'editsched')
  rec(W, 's27.c', '(c) the filing deleted again: each face, the pending count (RECORD)', `${u.ok ? 'deleted' : 'NOT deleted'} · ${await head()} · ${st.say} ·· VIEW ${listSay(v.v)}`, [st.pic, v.pic].join(', '))
  chk(W, 's27.c-live', '(c) his line live again on the working copy; still on the published face', lineOf(st.e.lines, 'Marlin') && !lineOf(st.e.lines, 'Marlin').gone && lineOf(v.v.lines, 'Marlin'), `${listSay(st.e)} ·· VIEW ${listSay(v.v)}`)
  /* (d) a second unfiled SANS man planted on the published day */
  const l2 = await mkLine(p, W, DI, { cs: 'VL', msn: 'ACM', to: '16:00', ld: '17:00' })
  const t2 = await plan(p, W, DI, l2.rcp, PIXEL, 's27-d')
  await L.closeBoard(p, W)
  st = await places(p, W, DI, 's27-d', [PIXEL])
  v = await vo('s27-d-view')
  await L.go(p, 'editsched')
  rec(W, 's27.d', '(d) Pixel planted on a new line of the published day: the note, each face, pending (RECORD)', `note "${t2.toast}" · ${await head()} · ${st.say} ·· VIEW ${listSay(v.v)}`, [t2.pic, st.pic, v.pic].join(', '))
  chk(W, 's27.d-working', "(d) the working copy shows Pixel's new line with his ring and \"A\"; the published face does not have it yet", lineOf(st.e.lines, 'Pixel') && amberA(st.bd[PIXEL]).length && !lineOf(v.v.lines, 'Pixel') && t2.toast === `Pixel — ${NF}VL ACM (T/O 16:00)`, `note "${t2.toast}" · working ${lineOf(st.e.lines, 'Pixel') ? 'has' : 'NO'} · view ${lineOf(v.v.lines, 'Pixel') ? 'HAS' : 'no'}`)
  /* A3: Marlin's line hidden on the published day — pending? the issued face? */
  const { x } = await eLine(p, W, 'Marlin')
  await tapLine(p, W, '#eWeek', DI, x.ix, 's27-a3')
  st = await places(p, W, DI, 's27-a3', [MARLIN])
  v = await vo('s27-a3-view')
  await L.go(p, 'editsched')
  rec(W, 'a3.hide', 'A3: Marlin\'s line hidden on the working copy of the published day: what reads pending, the issued face (RECORD)', `${await head()} · ${st.say} ·· VIEW ${listSay(v.v)}`, [st.pic, v.pic].join(', '))
  /* the amendment published; Ranger reads the issued face */
  const pub2 = await pubDay(p, W)
  await L.closeBoard(p, W)
  rec(W, 'a3.pub', 'the amendment published', `"${pub2}" · ${await head()}`, await W.pic(p, 's27-a3-pub'))
  await asR(p, W)
  v = await vo('s27-a3-ranger')
  const vm = lineOf(v.v.lines, 'Marlin'), vp = lineOf(v.v.lines, 'Pixel')
  chk(W, 'a3.ranger', "A3: as Ranger after the amendment — Marlin's line struck, no Reset arrow, not counted; Pixel's line shown", vm && vm.struck && !vm.btn && vp && !vp.struck, listSay(v.v), v.pic)
  await asS(p, W)
  /* flagged again, published again */
  const y = (await eLine(p, W, 'Marlin')).x
  if (y) await tapLine(p, W, '#eWeek', DI, y.ix, 's27-a3-reset')
  st = await places(p, W, DI, 's27-a3r', [MARLIN])
  v = await vo('s27-a3r-view')
  await L.go(p, 'editsched')
  rec(W, 'a3.reset', 'flagged again on the working copy: pending? the issued face before the next amendment (RECORD)', `${await head()} · ${listSay(st.e)} ·· VIEW ${listSay(v.v)}`, [st.pic, v.pic].join(', '))
  const pub3 = await pubDay(p, W)
  await L.closeBoard(p, W)
  v = await vo('s27-a3r-pub')
  const vm3 = lineOf(v.v.lines, 'Marlin')
  chk(W, 'a3.reset-pub', 'published again: Marlin\'s line shown on the issued face', vm3 && !vm3.struck, `"${pub3}" · ${listSay(v.v)}`, v.pic)
}

/* F28 = A1 — a clean published day, then the filing deleted */
SC.s28 = async (p, W) => {
  const f = await fileFor(p, W, ISO, OTTER, ['fly'], 'all', 's28.file')
  const l1 = await mkLine(p, W, DI, VLBFM)
  const t = await plan(p, W, DI, l1.rcp, OTTER, 's28-o')
  need(W, 's28.o', 'Otter (filed Fly all day) on VL BFM 13:00 RCP: no SANS line', t.placed && !/SANS/.test(t.toast), `"${t.toast}"`)
  const pub = await pubDay(p, W)
  await L.closeBoard(p, W)
  const vo = async (tag) => { await openList(p, W, '#vWeek', DI); const v = await readList(p, '#vWeek', DI); return { v, pic: await listPic(p, W, '#vWeek', DI, tag) } }
  let v = await vo('s28-0')
  rec(W, 's28.pub', `published ("${pub}") clean: the issued face`, listSay(v.v), v.pic)
  const u = await unfile(p, W, ISO, f.iid, 's28-del')
  await L.go(p, 'editsched')
  const st = await places(p, W, DI, 's28-1', [OTTER])
  v = await vo('s28-1-view')
  await L.go(p, 'editsched')
  const pend = await p.evaluate(i => { const e = document.querySelector(`#eWeek [data-pendlist="${i}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : 'none' }, DI)
  rec(W, 's28.del', 'A1: his filing deleted after publishing — the working copy, the issued face, the pending count (RECORD)', `${u.ok ? 'deleted' : 'NOT deleted'} "${u.toast}" · pending "${pend}" · ${st.say} ·· VIEW ${listSay(v.v)}`, [st.pic, v.pic].join(', '))
  chk(W, 's28.faces', 'the working copy gains Otter\'s "no availability filed" line; the issued face stays without it, its count and list agreeing', lineOf(st.e.lines, 'Otter') && !lineOf(v.v.lines, 'Otter') && (nIss(v.v.bar) || 0) === v.v.lines.filter(x => !x.hid).length, `working ${lineOf(st.e.lines, 'Otter') ? 'has' : 'NO'} · view "${v.v.bar}" ${v.v.lines.length} line(s)`)
  const pub2 = await pubDay(p, W)
  await L.closeBoard(p, W)
  v = await vo('s28-2')
  chk(W, 's28.amend', `the amendment published ("${pub2}"): the issued face gains Otter's line`, lineOf(v.v.lines, 'Otter'), listSay(v.v), v.pic)
}

/* F29 — Undo and Redo: a plant, and a filing deleted on the Inputs page */
SC.s29 = async (p, W) => {
  const l1 = await mkLine(p, W, DI, VLBFM)
  const t = await plan(p, W, DI, l1.rcp, MARLIN, 's29-m')
  let st = await places(p, W, DI, 's29-1', [MARLIN])
  const n1 = nIss(st.e.bar)
  chk(W, 's29.plant', 'Marlin planted: his line, ring and "A"', t.placed && lineOf(st.e.lines, 'Marlin') && amberA(st.bd[MARLIN]).length, st.say, st.pic)
  const u = await boardUndo(p, W, DI, 'undo', 's29-undo')
  st = await places(p, W, DI, 's29-2', [MARLIN])
  chk(W, 's29.undo', 'the board\'s Undo: the line gone in every place, the count down by one, no ring left on any copy', !lineOf(st.e.lines, 'Marlin') && !lineOf(st.b.lines, 'Marlin') && !lineOf(st.i.lines, 'Marlin') && (nIss(st.e.bar) || 0) === n1 - 1 && !st.bd[MARLIN].some(x => x.ring === 'amber' || x.chip.includes('A')), `"${u.title}" → "${u.toast}" · ${st.say}`, st.pic)
  const r = await boardUndo(p, W, DI, 'redo', 's29-redo')
  st = await places(p, W, DI, 's29-3', [MARLIN])
  chk(W, 's29.redo', 'Redo: the line, ring, "A" and count back, exactly one line for him', linesOf(st.e.lines, 'Marlin').length === 1 && nIss(st.e.bar) === n1 && amberA(st.bd[MARLIN]).length, `"${r.title}" → "${r.toast}" · ${st.say}`, st.pic)
  /* a filing deleted on the Inputs page, then Undo there */
  const f = await fileFor(p, W, ISO, OTTER, ['fly'], 'all', 's29.file')
  const l2 = await mkLine(p, W, DI, { cs: 'VL', msn: 'ACM', to: '16:00', ld: '17:00' })
  const t2 = await plan(p, W, DI, l2.rcp, OTTER, 's29-o')
  need(W, 's29.o', 'Otter (filed) on VL ACM 16:00: no SANS line', t2.placed && !/SANS/.test(t2.toast), `"${t2.toast}"`)
  const d = await unfile(p, W, ISO, f.iid, 's29-del')
  const ud = await topDoor(p, W, 'undo', 's29-inp')
  const back = await p.evaluate(i => (window.INPUTS || []).some(r => r.iid === i), f.iid)
  st = await places(p, W, DI, 's29-4', [OTTER])
  chk(W, 's29.inp-undo', 'the filing deleted on the Inputs page, then the top bar\'s Undo there: the filing back, no SANS line for Otter, no ring', d.ok && back && !lineOf(st.e.lines, 'Otter') && !amberA(st.bd[OTTER]).length, `delete "${d.toast}" · Undo "${ud.title}" → "${ud.toast}" · filing back ${back} · ${st.say}`, [d.pic, ud.pic, st.pic].join(', '))
  await L.go(p, 'inputs')
  const rd = await topDoor(p, W, 'redo', 's29-inp')
  st = await places(p, W, DI, 's29-5', [OTTER])
  chk(W, 's29.inp-redo', 'Redo there: the filing gone again, Otter\'s line and ring back', lineOf(st.e.lines, 'Otter') && amberA(st.bd[OTTER]).length, `Redo "${rd.title}" → "${rd.toast}" · ${st.say}`, [rd.pic, st.pic].join(', '))
}

/* F36 = A23 + A27 (+ N8, D2420) — every copy of the puck; hiding one of two sources of an "A" */
SC.s36 = async (p, W) => {
  const l1 = await mkLine(p, W, DI, VLBFM)
  const t = await plan(p, W, DI, l1.rcp, MARLIN, 's36-m')
  need(W, 's36.m', 'Marlin on VL BFM 13:00 RCP, nothing filed', t.placed, `"${t.toast}"`)
  /* a ground row he also sits on, clear of the flight (16:00–17:00) */
  await L.openBoard(p, W, DI)
  const g = await L.groundRow(p, W, DI, 'SWL GROUND', '16:00', '17:00', null)
  const gp = await B.place(p, W, DI, `[data-fill="g:${DI}.${g.ri}.+"]`, 's36-g', MARLIN)
  need(W, 's36.g', 'a Ground Programme row "SWL GROUND" 16:00–17:00 holding Marlin', gp.placed, `row ${J(g.row)} · "${gp.toast}"`)
  let st = await places(p, W, DI, 's36-1', [MARLIN])
  const all = [...st.wk[MARLIN], ...st.bd[MARLIN]]
  rec(W, 's36.copies', 'every copy of his puck that day, week and board (RECORD each)', `week[${pkSay(st.wk[MARLIN])}] · board[${pkSay(st.bd[MARLIN])}]`, st.pic)
  chk(W, 's36.copies-A', 'each drawn copy wears the amber ring and "A" — no other letter (N8, D2583)', all.length >= 3 && all.every(x => x.ring === 'amber' && x.chip === 'A'), pkSay(all))
  chk(W, 's36.one-line', 'one SANS line for him (the ground row raises none, D2564)', linesOf(st.e.lines, 'Marlin').length === 1, listSay(st.e))
  /* the crew list with no seat armed: no reason line under him (D2420) */
  await L.openBoard(p, W, DI); await B.disarm(p, W); await W5.boardDrawer(p, W, true)
  const cl = await listOf(p, '#schedBoard', MARLIN)
  const cpic = (await W5.clip(p, W, p.locator(`#schedBoard .rpuck[data-person="${MARLIN}"]:visible`).first(), 's36-crew')) || ''
  const cpk = await pk(p, '#schedBoard .sb-ros', MARLIN)
  await W5.boardDrawer(p, W, false)
  chk(W, 's36.crew', 'the board\'s crew list, nothing armed: his puck carries the amber ring and "A", and no reason line under it (D2420)', cl.me && cl.me.length && cl.me.every(x => !x.printed) && cpk.length && cpk.every(x => x.ring === 'amber' && x.chip === 'A'), `${meSay(cl)} · painted ${pkSay(cpk)}`, cpic)
  /* A27: a second advisory that also gives "A" — a ground row inside his brief (10:40–13:00) */
  const g2 = await L.groundRow(p, W, DI, 'SWL BRIEF CLASH', '11:00', '12:00', null)
  const gp2 = await B.place(p, W, DI, `[data-fill="g:${DI}.${g2.ri}.+"]`, 's36-g2', MARLIN)
  st = await places(p, W, DI, 's36-2', [MARLIN])
  const other = st.e.lines.find(x => /Marlin/.test(x.text) && !/SANS/.test(x.text) && x.sev === 'adv')
  rec(W, 's36.a27', 'A27: a ground row 11:00–12:00 inside his brief: the list and his pucks (RECORD)', `"${gp2.toast}" · ${st.say}`, st.pic)
  if (!other) { rec(W, 's36.a27-nw', 'A27 not walked: no second advisory for Marlin appeared', listSay(st.e)); return }
  const seatA = s => (s.bd[MARLIN] || []).filter(x => x.where === 'flying line')
  const hideBy = async (re, tag) => { const l = await B.readOpen(p, W, '#eWeek', DI); const y = l.lines.find(z => re.test(z.text) && /Marlin/.test(z.text)); if (y) { await openList(p, W, '#eWeek', DI); await tapLine(p, W, '#eWeek', DI, y.ix, tag) } return !!y }
  /* the second advisory here is "Misses flight brief", whose chip letter is read, not assumed (try3: "B") */
  const both = seatA(st).map(x => x.chip).join(',')
  const n2 = nIss(st.e.bar)
  rec(W, 's36.a27-both', 'both advisories showing: the chip his seat puck wears (RECORD — which letter wins)', `${pkSay(seatA(st))} · count ${n2}`)
  const otherRe = /Misses flight brief|Misses VL BFM brief/
  await hideBy(/— SANS:/, 's36-h1')
  st = await places(p, W, DI, 's36-3', [MARLIN])
  const oChip = seatA(st).map(x => x.chip)
  chk(W, 's36.a27-1', 'only the SANS line hidden: his seat puck keeps an amber ring with the other advisory\'s own letter (the flag of the one still showing, D475); the count down by one', seatA(st).length && seatA(st).every(x => x.ring === 'amber' && x.chip && x.chip !== 'A') && nIss(st.e.bar) === n2 - 1, `${pkSay(seatA(st))} · count ${nIss(st.e.bar)}`, st.pic)
  await hideBy(/— SANS:/, 's36-r1')
  await hideBy(otherRe, 's36-h2')
  st = await places(p, W, DI, 's36-4', [MARLIN])
  chk(W, 's36.a27-2', 'SANS flagged again, only the other advisory hidden: "A" on his seat puck, amber ring', seatA(st).length && seatA(st).every(x => x.chip === 'A' && x.ring === 'amber') && liveSans(st.e.lines).some(x => /Marlin/.test(x.text)) && nIss(st.e.bar) === n2 - 1, `${pkSay(seatA(st))} · count ${nIss(st.e.bar)}`, st.pic)
  await hideBy(/— SANS:/, 's36-h3')
  st = await places(p, W, DI, 's36-5', [MARLIN])
  chk(W, 's36.a27-3', 'both hidden: no chip and no amber ring on his seat puck; the count down by both', seatA(st).length && seatA(st).every(x => !x.chip && x.ring !== 'amber') && (nIss(st.e.bar) || 0) === n2 - 2, `${pkSay(seatA(st))} · bar "${st.e.bar}"`, st.pic)
  await hideBy(/— SANS:/, 's36-r3')
  st = await places(p, W, DI, 's36-6', [MARLIN])
  const hidOther = st.e.lines.find(x => otherRe.test(x.text) && /Marlin/.test(x.text))
  chk(W, 's36.a27-4', 'SANS flagged again alone: its line and "A" back; the other stays hidden (one reset revives one)', liveSans(st.e.lines).some(x => /Marlin/.test(x.text)) && hidOther && hidOther.hid && seatA(st).every(x => x.chip === 'A'), `${pkSay(seatA(st))} · ${listSay(st.e)}`, st.pic)
  rec(W, 's36.a27-letters', 'the letters seen (RECORD)', `both showing "${both}" · SANS hidden "${oChip.join(',')}"`)
}

/* The print of a day carrying the line (lesson 18): Export as PDF, its page pictured as the print dialog would print it — Chromium
   (print media + a PDF) and WebKit (print media) */
SC.print = async (p, W) => {
  const l1 = await mkLine(p, W, DI, VLBFM)
  const t = await plan(p, W, DI, l1.rcp, MARLIN, 'pr-m')
  need(W, 'pr.m', 'Marlin on VL BFM 13:00 RCP, nothing filed: his line on Fri 17', t.placed, `"${t.toast}"`)
  const doExport = async (tag, page) => {
    await L.closeBoard(p, W); await L.go(p, page)
    await p.evaluate(() => { window.__swlPrints = 0; window.print = () => { window.__swlPrints++ } })
    const b = p.locator('#exportPdf:visible').first()
    if (await b.count()) await W.press(p, b, 'export-pdf')
    else if (await p.locator('#burger:visible').count()) { await W.press(p, '#burger:visible', 'burger'); if (!(await p.locator('#exportPdf:visible').count())) return { none: 'no Export as PDF in the ☰ menu', pic: await W.pic(p, tag + '-no-export') }; await W.press(p, '#exportPdf:visible', 'export-pdf') }
    else return { none: `no Export as PDF drawn on ${page} at this size`, pic: await W.pic(p, tag + '-no-export') }
    await sleep(1500)
    const html = await p.evaluate(() => { const f = [...document.querySelectorAll('iframe')].filter(x => x.contentDocument && x.contentDocument.body && x.contentDocument.body.innerText.length > 50).pop(); return f ? '<!doctype html>' + f.contentDocument.documentElement.outerHTML : '' })
    const file = path.join(OUT, `${W.scn}-${tag}-print-${W.sz.name}.html`)
    writeFileSync(file, html)
    const text = html.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ')
    const fri = text.slice(text.indexOf('Friday Jul 17'), text.indexOf('Friday Jul 17') + 400)
    await W.pic(p, tag + '-after-export')
    return { html, text, fri, file }
  }
  const draw = async (html, tag) => {
    const { chromium, webkit } = await import('@playwright/test')
    const pics = []
    for (const [eng, nm] of [[chromium, 'chromium'], [webkit, 'webkit']]) {
      const br = await eng.launch()
      const pg = await br.newPage({ viewport: { width: 1100, height: 1400 } })
      await pg.setContent(html, { waitUntil: 'load' }); await pg.emulateMedia({ media: 'print' }); await sleep(400)
      /* the day's block cut out: the heading "Friday Jul 17" to the next day */
      const box = await pg.evaluate(() => { const h = [...document.querySelectorAll('*')].find(e => e.children.length < 4 && /Friday Jul 17/.test(e.textContent || '') && e.getBoundingClientRect().height < 80); if (!h) return null; h.scrollIntoView(); const r = h.getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top + scrollY - 10), width: 1100, height: 330 } })
      const f1 = path.join(OUT, `${W.scn}-${tag}-print-${nm}-${W.sz.name}.png`)
      if (box) await pg.screenshot({ path: f1, clip: box, fullPage: true }); else await pg.screenshot({ path: f1, fullPage: true })
      pics.push(path.basename(f1))
      if (nm === 'chromium') { const f2 = path.join(OUT, `${W.scn}-${tag}-print-${W.sz.name}.pdf`); await pg.pdf({ path: f2 }); pics.push(path.basename(f2)) }
      await br.close()
    }
    return pics
  }
  const has = s => ({ sans: /SANS/.test(s), check: s.includes(CHECK), nf: s.includes('no availability filed'), issue: /\bissues?\b|warning/i.test(s) })
  for (const [tag, pg] of [['draft-edit', 'editsched'], ['draft-view', 'viewsched']]) {
    const e = await doExport(tag, pg)
    if (e.none) { rec(W, 'pr.' + tag, `Export as PDF from ${pg} (RECORD)`, e.none, e.pic); continue }
    const pics = e.html ? await draw(e.html, tag) : []
    rec(W, 'pr.' + tag, `Export as PDF from ${pg} on a day carrying his line (draft): does the warning show in what prints? (RECORD, Chromium and WebKit print media)`, `printed page ${e.html ? 'made' : 'NOT MADE'} · prints ${await p.evaluate(() => window.__swlPrints)} · Friday: "${e.fri}" · ${J(has(e.text))}`, pics.join(', '))
  }
  const pub = await pubDay(p, W)
  const e = await doExport('pub', 'editsched')
  if (e.none) { rec(W, 'pr.pub', 'Export as PDF after publishing (RECORD)', e.none, e.pic); return }
  const pics = e.html ? await draw(e.html, 'pub') : []
  rec(W, 'pr.pub', `Fri 17 published ("${pub}"): Export as PDF — does the warning show in print? (RECORD)`, `Friday: "${e.fri}" · ${J(has(e.text))}`, pics.join(', '))
}

/* The plain-user round (both sizes) */
SC.plain = async (p, W) => {
  await postR(p, W, 'pl.post')
  const l1 = await mkLine(p, W, DI, VLBFM)
  const s = await W5.addSim(p, W, DI, 'oft', 'EP-9', '15:00', '16:00')
  rec(W, 'pl.1', 'the board of Fri 17: + Wave → VL BFM 13:00–14:00, an OFT row "EP-9" 15:00–16:00', J({ l1: l1.f, oft: s.r }), await W.pic(p, 'pl-1-built'))
  const d1 = await plan(p, W, DI, l1.rcp, MARLIN, 'pl-2'), d2 = await plan(p, W, DI, `s:${DI}.oft.${s.ri}.p`, JESTER, 'pl-3')
  chk(W, 'pl.2', 'Marlin dropped onto the line, Jester onto the OFT (tap-to-plan): each note the new line', d1.placed && d2.placed && d1.toast === `Marlin — ${W1}` && d2.toast === `Jester — ${NF}Sim EP-9 15:00–16:00`, `"${d1.toast}" / "${d2.toast}"`, [d1.pic, d2.pic].join(', '))
  /* Undo and Redo of the last drop (Jester onto the OFT), on the board, before any hide (a hide is itself an Undo step) */
  const u = await boardUndo(p, W, DI, 'undo', 'pl-6')
  const gone = !(await B.dayHold(p, DI, JESTER)).some(x => x.includes('oft'))
  const ul = await boardList(p, W, DI)
  const r = await boardUndo(p, W, DI, 'redo', 'pl-7')
  const back = (await B.dayHold(p, DI, JESTER)).some(x => x.includes('oft'))
  const rl = await boardList(p, W, DI)
  chk(W, 'pl.5', "the board: Undo takes Jester's drop back (his line gone from the panel), Redo puts it back (his line back)", gone && back && !lineOf(ul.lines, 'Jester') && lineOf(rl.lines, 'Jester'), `Undo "${u.title}" → "${u.toast}" · panel ${boardSay(ul)} · Redo → "${r.toast}" · panel ${boardSay(rl)}`, [u.pic, r.pic].join(', '))
  await L.closeBoard(p, W)
  await openList(p, W, '#eWeek', DI)
  let l = await B.readOpen(p, W, '#eWeek', DI)
  chk(W, 'pl.3', "Edit Schedule: the day's list opened by its bar — both lines", lineOf(l.lines, 'Marlin') && lineOf(l.lines, 'Jester'), listSay(l), await listPic(p, W, '#eWeek', DI, 'pl-3'))
  await tapLine(p, W, '#eWeek', DI, lineOf(l.lines, 'Marlin').ix, 'pl-4')
  l = await B.readOpen(p, W, '#eWeek', DI)
  const lp1 = await listPic(p, W, '#eWeek', DI, 'pl-4-hidden')
  await tapLine(p, W, '#eWeek', DI, lineOf(l.lines, 'Marlin').ix, 'pl-5')
  const l2 = await B.readOpen(p, W, '#eWeek', DI)
  chk(W, 'pl.4', "his line hidden (✕), then flagged again (↺)", lineOf(l.lines, 'Marlin').hid && !lineOf(l2.lines, 'Marlin').hid, `${listSay(l)} → ${listSay(l2)}`, [lp1, await listPic(p, W, '#eWeek', DI, 'pl-5-back')].join(', '))
  const ut = await topDoor(p, W, 'undo', 'pl-5u')
  rec(W, 'pl.4u', 'the top bar\'s Undo right after the flag-again: what it names (RECORD — a hide and a flag-again are Undo steps)', `"${ut.title}" → "${ut.toast}"`, ut.pic)
  await topDoor(p, W, 'redo', 'pl-5r')
  const e = await B.Y.listE(p, W, B.WK1, 'fri', 'pl-8', MARLIN)
  rec(W, 'pl.6', "Edit Schedule's crew panel opened on Fri 17 (nothing picked) and closed", `${e.day} · Marlin ${meSay(e.l)}`, e.pic)
  /* the Legend */
  await L.go(p, 'editsched')
  /* the fold "▸ LEGEND — COLOURS & FLAGS" above the week (seen in the pictures) */
  /* probe10: a <summary class="legend-sum"> "Legend — colours & flags"; one copy per page, the shown one pressed */
  let lgn = p.locator('summary.legend-sum:visible').first()
  if (!(await lgn.count()) && W.isPhone && await p.locator('#burger:visible').count()) { await W.press(p, '#burger:visible', 'burger'); lgn = p.locator('button:visible, a:visible').filter({ hasText: /Legend/i }).first() }
  if (await lgn.count()) {
    await W.press(p, lgn, 'legend'); await sleep(500)
    const words = await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /advisory — /.test(e.textContent || '') && e.getBoundingClientRect().width > 0).map(e => (e.parentElement.innerText || '').replace(/\s+/g, ' ').trim()).slice(0, 3))
    const lp = await W.pic(p, 'pl-9-legend')
    rec(W, 'pl.7', 'the Legend opened (its amber "A" line read)', J(words), lp)
    /* a fold shuts by its own heading, pressed again */
    await W.press(p, lgn, 'legend-shut')
    await sleep(400)
    const still = await p.evaluate(() => [...document.querySelectorAll('*')].some(e => e.children.length === 0 && /advisory — shift/.test(e.textContent || '') && e.getBoundingClientRect().width > 0))
    chk(W, 'pl.8', 'the Legend closed by its own close', !still, `Legend words still drawn: ${still}`, await W.pic(p, 'pl-10-legend-closed'))
  } else rec(W, 'pl.7', 'the Legend: no door found on this page at this size (RECORD)', 'no Legend button drawn', await W.pic(p, 'pl-9-nolegend'))
  if (W.isPhone) { await p.keyboard.press('Escape').catch(() => {}) }
  /* the board, its issues panel, ✓ Done */
  const bl = await boardList(p, W, DI)
  rec(W, 'pl.9', 'the Scheduler Board of Fri 17 and its issues panel', boardSay(bl), await W.pic(p, 'pl-11-board'))
  await L.closeBoard(p, W)
  chk(W, 'pl.10', 'the board closed with ✓ Done', !(await p.locator('#schedBoard:visible').count()), `page ${await p.evaluate(() => window.CURPAGE)}`, await W.pic(p, 'pl-12-done'))
  const i = await dayInfo(p, W, '#eWeek', DI, 'pl-13')
  chk(W, 'pl.11', 'the ⓘ popup opened (both lines in it) and closed', lineOf(i.lines, 'Marlin') && i.closed, infoSay(i), i.pic)
  /* Ranger (posted SANS from Fri 17) planned on the OFT's rear seat, nothing filed */
  const dr = await plan(p, W, DI, `s:${DI}.oft.${s.ri}.w`, RANGER, 'pl-14')
  rec(W, 'pl.12', 'Ranger (SANS from Fri 17, nothing filed) into the OFT\'s rear seat', `placed ${dr.placed} · "${dr.toast}"`, dr.pic)
  await L.closeBoard(p, W)
  await asR(p, W)
  await openList(p, W, '#vWeek', DI)
  const v = await readList(p, '#vWeek', DI)
  chk(W, 'pl.13', "as Ranger: View-only Sched's Fri 17 list opened — his own line among them, words telling nobody to file", lineOf(v.lines, 'Ranger') && !v.lines.some(x => TOLD_FILE.test(x.text)), listSay(v), await listPic(p, W, '#vWeek', DI, 'pl-15-view'))
  const b = await bell(p, W, 'pl-16-bell')
  rec(W, 'pl.14', 'as Ranger: the bell', sayB(b), b.pic)
  if (b.rem) {
    const ta = await tapAndRead(p, W, b.rem.id, 'pl-17')
    rec(W, 'pl.15', 'the SANS reminder tapped', ta.ok ? `page "${ta.page}" · month "${ta.month}" · window "${ta.win}"` : ta.why, ta.pic)
    const x = p.locator('[data-testid="win-sansday-x"]:visible').first()
    if (await x.count()) await W.press(p, x, 'sansday-x')
    await sleep(400)
    chk(W, 'pl.16', 'what the reminder opened, closed by its ✕', !(await p.locator('[data-testid="win-sansday"]:visible').count()), 'day window gone', await W.pic(p, 'pl-18-closed'))
  } else rec(W, 'pl.15', 'no SANS reminder on his bell to tap', sayB(b))
}

const ALL = ['s21', 's22', 's23', 's25', 'a4', 's26', 's27', 's28', 's29', 's36', 'print', 'plain']
const only = (process.env.ONLY || '').split(',').filter(Boolean)
for (const n of ALL.filter(n => !only.length || only.includes(n))) {
  console.log('=== SCENARIO', n, SZ)
  await T.run(n, SZ, scene(SC[n]))
}
writeFileSync(path.join(OUT, `results-all-${SZ}${only.length ? '-' + only.join('_') : ''}.json`), JSON.stringify(L.results, null, 1))
