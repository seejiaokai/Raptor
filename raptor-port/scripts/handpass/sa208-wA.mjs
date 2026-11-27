// sa208-wA — walker A of the chat 208 walk (his answers to the SANS warning-lines questions, D2753–D2759), 27 Nov 26: the
// note after a plant, the crew list's words, AM / PM, the column, the plain-user rounds (Fable F1–F13, F29, F32–F39;
// Astra S1, S3–S7, S12–S14). Each scenario a fresh browser world, Saber signed in, the clock started 15 Jul 2026 09:00
// and left running; every set-up through the app's own controls. Brief:
// docs/superpowers/briefs/2026-11-27-sans-answers-walk-brief.md. Run from raptor-port/:
//   SZ=d|p|pc SA208A_RUN=<run> ONLY=<scenario,…> node scripts/handpass/sa208-wA.mjs
import './sa208-wA-env.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
const H = await import('./sa208-wA-lib.mjs')
const { B, Y, L, W5, T, J, sleep, OUT, ID, CS, ISO, clean, NFW, OFFW, HALF, note, LNF, LOFF, LHRS, chk, rec, nw, step, pics,
  nowPic, noteGeom, geomSay, mkLine, mkSim, seat, sim, key, file, reason, pick, plant, rsay, lines, hide, dragIn, finger,
  moveMan, fingerIn, at, sansOnly, oneSans, saveRaw } = H
const SZ = process.env.SZ || 'd'
L.SIZES.d.opts.viewport = { width: 1536, height: 1000 }
/* his PC's display at 125% (Astra S14): a browser STARTED at 125%, never an emulated picture scale (walk-scripts §7) */
L.SIZES.d125 = { name: 'desktop125', eng: L.SIZES.d.eng, launch: { ...L.SIZES.d.launch, args: ['--force-device-scale-factor=1.25'] }, opts: { viewport: { width: 1229, height: 800 } } }
const RUN = process.env.SA208A_RUN || 'run1'
console.log(`VERSION sa208-wA 1 · size ${SZ} · run ${RUN} · only ${process.env.ONLY || 'all'} · ${process.env.W2_URL} · out ${OUT}`)
const DESK = () => SZ === 'd', PC = () => SZ === 'pc', WK = () => SZ === 'p'

/* judge one plant: the note (first SANS note seen) against the words; one SANS, no "Planned on" */
function judgeNote(W, id, what, r, want, extra = '') {
  const s = sansOnly(r.seen)
  const ok = want === null ? !s.length : (r.seen || []).includes(want) && oneSans(want)
  chk(W, id, what, r.placed === false ? false : ok, `notes ${J(r.seen)}${r.g ? ' · first frame ' + geomSay(r.g) : ''} · holds ${J(r.holds)}${extra}`, r.pic || pics(r.first, r.crop))
}
function judgeReason(W, id, what, r, want, letters) {
  const row = r.r
  const ok = want === null ? row && !row.struck && !row.why : row && row.struck && row.why === want && row.title === `${row.cs} — ${want}`
  const lok = letters === undefined || (row && (row.badge === letters || (row.l + (row.h ? ' / ' + row.h : '')) === letters))
  chk(W, id, what, ok && lok, `armed ${r.armed} · ${rsay(row)}${letters !== undefined ? ' · want letters "' + letters + '"' : ''}`, r.pic)
  /* lesson 9 on every picked state: the letters in one column, struck and free alike, nothing cut or past the edge */
  if (r.s && r.s.rows) { const c = B.colJudge(r.s); const cut = r.s.rows.filter(x => x.cut || x.past); chk(W, id + '.col', `${id.split('.')[0]} (lesson 9): with this place picked, the SANS section's letters stand in one column (struck and free), nothing cut or past the edge`, c.ok && !cut.length && !r.s.pageWide, c.why + ' · ' + r.s.rows.filter(x => x.bL != null).map(x => `${x.cs}${x.struck ? '(x)' : ''}@${x.bL}`).join(' ') + (cut.length ? ' · CUT ' + cut.map(x => x.cs).join(',') : '')) }
}
function judgeLine(W, id, what, l, want, o = {}) {
  const t = l.sans.map(x => x.text)
  const ok = want === null ? !t.length : t.includes(want) && (o.hid === undefined || l.sans.find(x => x.text === want).hid === o.hid)
  chk(W, id, what, ok, l.say, l.pic)
}

const SC = {}

/* ---- A1 · Mon 13: F1 (crew-list drag, nothing filed), S3 (OFT EP-9 rear, Marlin), F2 / S3 (hidden, taken off, planted
   again), F13 here too (Undo / Redo of a plant) ---- */
SC.A1 = async (p, W) => {
  const di = 0
  const wi = await mkLine(p, W, di, 'VX', '09:00', '10:00')
  const ri = await mkSim(p, W, di, 'oft', 'EP-9', '10:00', '11:00')
  const VXF = seat(di, wi, 'p'), EPW = sim(di, 'oft', ri, 'w')
  /* F1 — Jester (pilot, nothing filed) onto VX's front seat */
  await step(W, 'F1', async () => {
    const r = await reason(p, W, di, VXF, ID.Jester, 'f1')
    judgeReason(W, 'F1.reason', 'F1: VX 09:00–10:00 front seat picked — Jester struck "SANS — no availability filed for today", his hover the same with his callsign', r, NFW)
    let k
    if (DESK()) {
      k = await dragIn(p, W, di, VXF, ID.Jester, 'f1-drag')
      chk(W, 'F1.hint', 'F1 (desktop): the drag hint while held over the seat reads his struck reason word for word', k.hover && k.hover.why === NFW, J(k.hover), k.hpic)
    } else if (PC()) {
      k = await fingerIn(p, W, di, VXF, ID.Jester, 'f1-finger')
      chk(W, 'F1.hint', 'F1 (phone, a finger drag at an ordinary speed): the drag hint over the seat reads his struck reason', k.hover && k.hover.why === NFW, J(k.hover), pics(k.hpic))
      k.pic = pics(k.hpic, k.first)
    } else { k = await pick(p, W, di, VXF, ID.Jester, 'f1'); k.pic = pics(r.pic, k.first, k.crop) }
    judgeNote(W, 'F1.note', `F1: planted (${DESK() ? 'dropped from the crew list' : PC() ? 'a finger drag' : 'tapped'}) — the note "Jester — SANS — no availability filed for today", one "SANS", no "Planned on"`, k, note('Jester', NFW))
    const l = await lines(p, W, di, 'Jester', 'f1')
    judgeLine(W, 'F1.list', 'F1: the warning list keeps its longer line "Jester — SANS: no availability filed for today. Planned on VX (T/O 09:00)"', l, LNF('Jester', 'VX (T/O 09:00)'))
  })
  /* S3 — Marlin (WSO, nothing filed) onto OFT EP-9 10:00–11:00's rear seat; then F2 / S3: hidden, taken off, planted again */
  let mIx = null
  await step(W, 'S3', async () => {
    const r = await reason(p, W, di, EPW, ID.Marlin, 's3')
    judgeReason(W, 'S3.reason', 'S3: OFT EP-9 10:00–11:00 rear seat picked — Marlin struck "SANS — no availability filed for today"', r, NFW)
    let k
    if (DESK()) { k = await dragIn(p, W, di, EPW, ID.Marlin, 's3-drag'); chk(W, 'S3.hint', 'S3 (desktop): the drag hint over the sim seat — the same words', k.hover && k.hover.why === NFW, J(k.hover), k.hpic) }
    else if (PC()) { k = await fingerIn(p, W, di, EPW, ID.Marlin, 's3-finger'); chk(W, 'S3.hint', 'S3 (phone finger drag): the drag hint — the same words', k.hover && k.hover.why === NFW, J(k.hover), k.hpic); k.pic = pics(k.hpic, k.first) }
    else { k = await pick(p, W, di, EPW, ID.Marlin, 's3'); k.pic = pics(k.first, k.crop) }
    judgeNote(W, 'S3.note', 'S3: planted — the note "Marlin — SANS — no availability filed for today"', k, note('Marlin', NFW))
    const l = await lines(p, W, di, 'Marlin', 's3')
    judgeLine(W, 'S3.list', 'S3: the warning list "Marlin — SANS: no availability filed for today. Planned on OFT EP-9 10:00–11:00" (D2754: OFT, the row\'s name, its times)', l, LNF('Marlin', 'OFT EP-9 10:00–11:00'))
    const m = l.sans.find(x => x.text === LNF('Marlin', 'OFT EP-9 10:00–11:00')); mIx = m ? m.ix : null
  })
  await step(W, 'F2', async () => {
    if (mIx == null) { nw(W, 'F2', 'F2 / S3 hidden-then-planted-again', 'Marlin\'s line was not found to hide'); return }
    await hide(p, W, di, mIx, 'f2-hide')
    const l0 = await lines(p, W, di, 'Marlin', 'f2-hidden')
    judgeLine(W, 'F2.hidden', 'F2 / S3: his line hidden by its ✕ — shown hidden (struck) in the list', l0, LNF('Marlin', 'OFT EP-9 10:00–11:00'), { hid: true })
    /* taken off: his seated puck dragged back to the crew list (desktop mouse; the phone's Chromium finger; WebKit: a mouse
       drag, as probe3 proved it takes him off there too) */
    const off = await moveMan(p, W, di, EPW, 'crew', 'f2-off')
    const left = await at(p, EPW)
    chk(W, 'F2.off', 'F2 / S3: taken off the seat by dragging his puck back to the crew list', !String(left).includes(ID.Marlin), `seat now ${J(left)} · ${J(off.seen)}`, off.first)
    const l1 = await lines(p, W, di, 'Marlin', 'f2-offlist')
    rec(W, 'F2.offlist', 'F2: with him off, his SANS line on Monday (RECORDED)', l1.say, l1.pic)
    const r = await reason(p, W, di, EPW, ID.Marlin, 'f2-again')
    judgeReason(W, 'F2.reason2', 'F2: the seat picked again — his struck reason unchanged', r, NFW)
    const k = await pick(p, W, di, EPW, ID.Marlin, 'f2-again')
    judgeNote(W, 'F2.note2', 'F2 / S3 (D2753, "whether or not his line was hidden"): planted again with his line hidden — the same short note "Marlin — SANS — no availability filed for today"', k, note('Marlin', NFW))
    const l2 = await lines(p, W, di, 'Marlin', 'f2-after')
    rec(W, 'F2.list2', 'F2: his line after the second plant — hidden still, or shown again (RECORDED; hiding keys on the exact words, D469)', l2.say, l2.pic)
  })
  /* F13 — Undo, Redo of that plant: the line goes and returns; whatever note Redo shows is the short words */
  await step(W, 'F13', async () => {
    await B.openB(p, W, di); await Y.noteWatch(p)
    await Y.sbUndo(p, W)
    const u = await Y.notesSeen(p)
    const lu = await lines(p, W, di, 'Marlin', 'f13-undo')
    chk(W, 'F13.undo', 'F13: Undo (the board\'s own) takes the plant back — Marlin off EP-9, no SANS line for him on EP-9', !String(await at(p, EPW)).includes(ID.Marlin) && !lu.sans.some(x => /EP-9/.test(x.text) && !x.hid), `seat ${J(await at(p, EPW))} · notes ${J(u)} · ${lu.say}`, lu.pic)
    await B.openB(p, W, di); await Y.noteWatch(p)
    await Y.sbRedo(p, W)
    const rd = await nowPic(p, W, 'f13-redo')
    const rs = await Y.notesSeen(p)
    const lr = await lines(p, W, di, 'Marlin', 'f13-redo')
    chk(W, 'F13.redo', 'F13: Redo puts him back — his line back; any note Redo shows carries the short words only, never the long line', String(await at(p, EPW)).includes(ID.Marlin) && lr.sans.length >= 1 && !rs.some(n => /Planned on/.test(n)), `seat ${J(await at(p, EPW))} · notes on Redo ${J(rs)} · ${lr.say}`, pics(rd, lr.pic))
  })
}

/* ---- A3 · Tue 14: F3 (an armed AMT seat, Fly only), F13 (Undo / Redo), F4 (OFT + AMT offered, a flying seat), S5 / F5
   (seat to seat, the swap, back to a flight), Zulu (all three) clean ---- */
SC.A3 = async (p, W) => {
  const di = 1
  await file(p, W, ISO[di], ID.Bolt, ['fly'], 'all', 'bolt')
  await file(p, W, ISO[di], ID.Zenith, ['fly'], 'all', 'zenith')
  await file(p, W, ISO[di], ID.Jester, ['oft'], 'all', 'jester')
  await file(p, W, ISO[di], ID.Kraken, ['oft', 'amt'], 'all', 'kraken')
  const box = await mkSim(p, W, di, 'amt', 'BOX', '13:00', '14:00')
  const ep = await mkSim(p, W, di, 'oft', 'EP-9', '10:00', '11:00')
  const vy = await mkLine(p, W, di, 'VY', '11:30', '12:30')
  const vz = await mkLine(p, W, di, 'VZ', '16:30', '17:30')
  const BOXP = sim(di, 'amt', box, 'p'), EPP = sim(di, 'oft', ep, 'p'), VYF = seat(di, vy, 'p'), VZF = seat(di, vz, 'p'), VZR = seat(di, vz, 'w')
  /* F10, first case, met here: Bolt (Fly only) on AMT BOX 13:00–14:00 also clashes with his seed MEDICAL APPT 13:30–15:00 —
     the clash leads the note, "(+1 more)", no SANS words (the host's correction to F10); then taken back by Undo */
  await step(W, 'F10a', async () => {
    const k = await plant(p, W, di, BOXP, ID.Bolt, 'f10a')
    judgeReason(W, 'F10a.reason', 'F10 (Bolt, Fly only, on AMT BOX): his struck reason "SANS — offered Fly only, not AMT"', k, OFFW('Fly', 'AMT'))
    const n = (k.seen || [])[0] || ''
    chk(W, 'F10a.note', 'F10: two warnings from one plant (a clash with his MEDICAL APPT and SANS) — the clash leads the note with "(+1 more)", and the note carries no SANS words', /^Bolt — Conflict: /.test(n) && /\(\+1 more\)$/.test(n) && !/SANS/.test(n), `notes ${J(k.seen)}`, pics(k.first, k.crop))
    const l = await lines(p, W, di, 'Bolt', 'f10a')
    judgeLine(W, 'F10a.list', 'F10: the list holds both — his SANS line "Bolt — SANS: offered Fly only today. Planned on AMT BOX 13:00–14:00"', l, LOFF('Bolt', 'Fly', 'AMT BOX 13:00–14:00'))
    await B.openB(p, W, di); await Y.sbUndo(p, W)
    Y.need(W, 'F10a.undo', 'Bolt taken off again by Undo', !String(await at(p, BOXP)).includes(ID.Bolt), J(await at(p, BOXP)))
  })
  await step(W, 'F3', async () => {
    const k = await plant(p, W, di, BOXP, ID.Zenith, 'f3')
    judgeReason(W, 'F3.reason', 'F3 = S1\'s words: AMT BOX 13:00–14:00 front seat picked — Zenith (Fly only, all day) struck "SANS — offered Fly only, not AMT"', k, OFFW('Fly', 'AMT'))
    judgeNote(W, 'F3.note', 'F3: tapped on — the note "Zenith — SANS — offered Fly only, not AMT"', k, note('Zenith', OFFW('Fly', 'AMT')))
    const l = await lines(p, W, di, 'Zenith', 'f3')
    judgeLine(W, 'F3.list', 'F3: the warning list "Zenith — SANS: offered Fly only today. Planned on AMT BOX 13:00–14:00"', l, LOFF('Zenith', 'Fly', 'AMT BOX 13:00–14:00'))
  })
  await step(W, 'F13', async () => {
    await B.openB(p, W, di); await Y.noteWatch(p)
    await Y.sbUndo(p, W)
    const lu = await lines(p, W, di, 'Zenith', 'f13-undo')
    chk(W, 'F13.undo', 'F13 (after F3): Undo — Zenith off the AMT seat, his AMT line gone', !String(await at(p, BOXP)).includes(ID.Zenith) && !lu.sans.length, `seat ${J(await at(p, BOXP))} · notes ${J(await Y.notesSeen(p))} · ${lu.say}`, lu.pic)
    await B.openB(p, W, di); await Y.noteWatch(p)
    await Y.sbRedo(p, W)
    const rd = await nowPic(p, W, 'f13-redo')
    const rs = await Y.notesSeen(p)
    const lr = await lines(p, W, di, 'Zenith', 'f13-redo')
    chk(W, 'F13.redo', 'F13: Redo — the line returns; any note Redo shows is the short words, never the long line', String(await at(p, BOXP)).includes(ID.Zenith) && lr.sans.some(x => x.text === LOFF('Zenith', 'Fly', 'AMT BOX 13:00–14:00')) && !rs.some(n => /Planned on/.test(n)), `notes on Redo ${J(rs)} · ${lr.say}`, pics(rd, lr.pic))
  })
  await step(W, 'F4', async () => {
    const k = await plant(p, W, di, VYF, ID.Kraken, 'f4')
    judgeReason(W, 'F4.reason', 'F4: VY 11:30–12:30 front seat picked — Kraken (OFT + AMT) struck "SANS — offered OFT and AMT only, not Fly" (OFT before AMT)', k, OFFW('OFT and AMT', 'Fly'))
    judgeNote(W, 'F4.note', 'F4: tapped on — "Kraken — SANS — offered OFT and AMT only, not Fly"', k, note('Kraken', OFFW('OFT and AMT', 'Fly')))
    const l = await lines(p, W, di, 'Kraken', 'f4')
    judgeLine(W, 'F4.list', 'F4: the list "Kraken — SANS: offered OFT and AMT only today. Planned on VY (T/O 11:30)"', l, LOFF('Kraken', 'OFT and AMT', 'VY (T/O 11:30)'))
  })
  await step(W, 'F5z', async () => {
    const k = await plant(p, W, di, VZR, ID.Zulu, 'f5z')
    judgeReason(W, 'F5z.reason', 'F5: VZ rear seat picked — Zulu (all three, all day) free, no reason', k, null)
    judgeNote(W, 'F5z.note', 'F5: Zulu planted — no SANS words in any note', k, null)
    const l = await lines(p, W, di, 'Zulu', 'f5z')
    judgeLine(W, 'F5z.list', 'F5: no SANS line for Zulu', l, null)
  })
  if (WK()) { rec(W, 'S5', 'S5 / F5 seat-to-seat and swap drags', 'walked on the desktop and in Chromium\'s phone (a finger drag): WebKit\'s touches drive no drag (walk-scripts §4)'); return }
  /* S5 / F5: Zenith (Fly only) from BOX to VZ's front (a flight, Fly covers), to EP-9 ("not OFT"), on to BOX ("not AMT"); Jester
     (OFT only) tapped on to EP-9, then Zenith (BOX) dragged onto Jester (EP-9): the swap; then Zenith back to VZ (no SANS) */
  const mv = async (from, to, tag, want, wantLine, tail, sid, what) => {
    const m = await moveMan(p, W, di, from, to, tag)
    const ok = want === null ? !sansOnly(m.seen).length : (m.seen || []).includes(want)
    chk(W, sid + '.note', what + (want ? ` — the note "${want}"` : ' — no SANS words in any note'), m.ok && ok, `notes ${J(m.seen)} · hint while held ${J(m.hover)} · first frame ${m.g ? geomSay(m.g) : '-'} · now at the place ${J(await at(p, to))}`, pics(m.hpic, m.first))
    const l = await lines(p, W, di, 'Zenith', tag)
    chk(W, sid + '.list', what + ': Zenith\'s SANS lines — ' + (wantLine ? `"${wantLine}" only` : 'none'), wantLine ? l.sans.length === 1 && l.sans[0].text === wantLine : !l.sans.length, l.say, l.pic)
    return m
  }
  await step(W, 'S5a', () => mv(BOXP, VZF, 's5a', null, null, '', 'S5a', 'S5 / F5: Zenith dragged from AMT BOX to VZ 16:30 front seat (a flight; Fly covers)'))
  await step(W, 'S5b', () => mv(VZF, EPP, 's5b', note('Zenith', OFFW('Fly', 'OFT')), LOFF('Zenith', 'Fly', 'OFT EP-9 10:00–11:00'), '', 'S5b', 'S5 / F5: seat to seat — Zenith dragged from VZ to OFT EP-9 front'))
  await step(W, 'S5c', () => mv(EPP, BOXP, 's5c', note('Zenith', OFFW('Fly', 'AMT')), LOFF('Zenith', 'Fly', 'AMT BOX 13:00–14:00'), '', 'S5c', 'S5: onward — Zenith dragged from EP-9 to AMT BOX front'))
  await step(W, 'S5d', async () => {
    const k = await plant(p, W, di, EPP, ID.Jester, 's5d')
    judgeNote(W, 'S5d.note', 'S5: Jester (OFT only) tapped on to EP-9 front — no SANS words (OFT covers)', k, null)
    const m = await moveMan(p, W, di, BOXP, EPP, 's5e')
    const nowEP = await at(p, EPP), nowBOX = await at(p, BOXP)
    const lb = await lines(p, W, di, 'Zenith', 's5e-bolt'), lj = await lines(p, W, di, 'Jester', 's5e-jester')
    rec(W, 'S5e.swap', 'S5: Zenith (on BOX) dragged onto Jester\'s puck (on EP-9) — where each man is now, every note (RECORDED: the swap rule)', `EP-9 front ${J(nowEP)} · BOX front ${J(nowBOX)} · notes ${J(m.seen)} · hint ${J(m.hover)} · ${lb.say} · ${lj.say}`, pics(m.hpic, m.first, lb.pic, lj.pic))
    const swapped = String(nowEP).includes(ID.Zenith) && String(nowBOX).includes(ID.Jester)
    if (swapped) {
      chk(W, 'S5e.words', 'S5 (swapped): each new SANS line names its own man and place — Zenith "offered Fly only today. Planned on OFT EP-9", Jester "offered OFT only today. Planned on AMT BOX"; the note never gives one man\'s reason to the other', lb.sans.some(x => x.text === LOFF('Zenith', 'Fly', 'OFT EP-9 10:00–11:00')) && lj.sans.some(x => x.text === LOFF('Jester', 'OFT', 'AMT BOX 13:00–14:00')) && !(m.seen || []).some(n => /^Zenith — SANS — offered OFT/.test(n) || /^Jester — SANS — offered Fly/.test(n)), `notes ${J(m.seen)} · ${lb.say} · ${lj.say}`, pics(m.first, lb.pic, lj.pic))
    }
  })
  await step(W, 'S5f', async () => {
    const from = String(await at(p, EPP)).includes(ID.Zenith) ? EPP : BOXP
    await mv(from, VZF, 's5f', null, null, '', 'S5f', 'F5: Zenith dragged back to VZ front (a flight) — his SANS lines gone')
  })
}

const X = { judgeNote, judgeReason, judgeLine, DESK, WK, PC }
;(await import('./sa208-wA-sc2.mjs')).add(SC, H, X)
;(await import('./sa208-wA-sc3.mjs')).add(SC, H, X)
const only = (process.env.ONLY || '').split(',').filter(Boolean)
for (const n of Object.keys(SC)) {
  if (only.length && !only.includes(n)) continue
  console.log('=== SCENARIO', n, SZ)
  await Y.run(n, SZ, async (p, W, ctx) => { W.p = p; await SC[n](p, W, ctx) })
  saveRaw(`results-${RUN}-${SZ}.json`, L.results)
}
writeFileSync(path.join(OUT, `results-${SZ}${only.length ? '-' + only.join('_') : ''}.json`), JSON.stringify(L.results, null, 1))
console.log('DONE', SZ)
process.exit(0)
