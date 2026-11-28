// sa208-wB — walker B of the SANS answers walk (his D2753–D2759), chat 208, 27 Nov 26: the warning list's sim words
// (F14–F22, S8–S11, S16), kept as built (F27, F28, S15), the ticks (F23–F26, S2), the amber A (F30, F31, F40, S17).
// Each scenario a fresh browser world, Saber signed in, clock started Wed 15 Jul 2026 09:00 and left running.
// Brief: docs/superpowers/briefs/2026-11-27-sans-answers-walk-brief.md. Every filing made on the SANS tab (or the doors
// named), every row and place pressed on the screen; window.* only READ.
// Run from raptor-port/:  SZ=d|p SA208B_RUN=run1 [ONLY=tab,amt] node scripts/handpass/sa208-wB.mjs
import './sa208-wB-env.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
const B = await import('./scc-w1B-lib.mjs')
const { Z, T, L, W5, J, sleep, OUT, path, fileS, editS, setKinds, sansDayRows, arm, unarm, readSec, rowOf, rowSay, secPic, crop, noteWatch, notesSeen, clean, asR, asS } = B
const SZ = process.env.SZ || 'd'
T.L.SIZES.d.opts.viewport = { width: 1536, height: 1000 }
console.log('VERSION sa208-wB 1 · size', SZ, '· run', process.env.SA208B_RUN || 'run1', '· only', process.env.ONLY || 'all')
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const nw = (W, id, what, note) => W.rec(id, what, 'NW', note)
async function step(W, id, fn) { try { await fn() } catch (e) { nw(W, id, 'step stopped by the script', String(e && e.message || e).split('\n')[0].slice(0, 300)) } }
const pics = (...a) => a.filter(Boolean).join(', ')
const NF = 'SANS: no availability filed for today. Planned on '
const ID = { Jester: 'ipman', Marlin: 'cards', Bolt: 'yeti', Otter: 'wrangler', Pixel: 'badger', Kraken: 'krait', Rebel: 'romeo', Zenith: 'vinci', Ranger: 'bane', Hunter: 'prowler' }
const ISO = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
const AWORDS = 'Advisory — on shift and also down for a ground event or programme item; or SANS availability not filed, or planned outside it'
const LEGEND = 'advisory — shift, ground or SANS availability'
const tailOf = x => x ? x.text.replace(/^.*? — (SANS:.*?)\s*[✕↺]?$/, '$1').trim() : 'NO LINE'
const linesOf = (lines, cs) => (lines || []).filter(x => x.text.includes(cs + ' — SANS:'))
/* a man's letters on the SANS day window's line ("Jester[F · O All day …" → "FO"), the separator left out */
const lettersOf = (dayLine, cs) => { const m = new RegExp(cs + '\\[([FOA ·/]+?) (All day|AM|PM|\\d)').exec(dayLine || ''); return m ? m[1].replace(/[^FOA]/g, '') : 'NOT FOUND' }
const say = l =>l.length ? l.map(x => `"${tailOf(x)}"${x.hid ? ' HIDDEN' : ''}${x.gone ? ' FROZEN' : ''}`).join(' | ') : 'no SANS line'

/* one man's SANS lines on a day's list (Edit Schedule '#eWeek' or View-only '#vWeek'), the list pictured */
async function sl(p, W, di, cs, tag, surf = '#eWeek') {
  await L.closeBoard(p, W)
  const l = await Z.readOpen(p, W, surf, di)
  const mine = linesOf(l.lines, cs)
  const pic = tag ? await Z.listPic(p, W, surf, di, tag) : ''
  return { l, mine, tails: mine.map(tailOf), bar: l.bar, n: Z.nIss(l.bar), pic, all: l.lines.filter(x => /SANS/.test(x.text)) }
}
/* a sim box typed ('' clears) on the open board */
const box = (p, W, di, kind, ri, f, v) => Z.setBox(p, W, di, `[data-bfld="sr:${di}.${kind}.${ri}.${f}"]`, v)
const simNow = (p, di, kind, ri) => p.evaluate(([i, k, r]) => { const x = window.DAYS[i].sims[k][r]; return x ? { label: x.label, str: x.str, end: x.end } : null }, [di, kind, ri])
const seatP = (di, kind, ri) => `s:${di}.${kind}.${ri}.p`
const seatW = (di, kind, ri) => `s:${di}.${kind}.${ri}.w`
/* a man tapped into a sim seat; the note */
async function plant(p, W, di, key, id, tag) { const t = await Z.plan(p, W, di, key, id, tag); return t }
/* a man's line hidden (its ✕) or flagged again (↺) on Edit Schedule's list, found by its words */
async function toggle(p, W, di, cs, re, tag) {
  const l = await Z.readOpen(p, W, '#eWeek', di)
  const x = linesOf(l.lines, cs).find(y => re.test(tailOf(y)))
  if (!x) return 'no such line'
  await Z.tapLine(p, W, '#eWeek', di, x.ix, tag)
  return 'pressed'
}

const SC = {}

/* F14 — the seed's OFT EP-4 on Wed (09:00–10:30) with a blank SANS pilot (Jester) put in; no "Sim" in any SANS line */
SC.f14 = async (p, W) => {
  const before = await p.evaluate(() => { const x = window.DAYS[2].sims.oft[0]; return { label: x.label, str: x.str, end: x.end } })
  let t = await Z.place(p, W, 2, '[data-fill="s:2.oft.0.+"]', 'f14', ID.Jester)   /* the seed EP-4 on Wed is a row of places (pax), no cockpit seats (probe4) */
  if (!t.placed && W.isPhone) {
    /* the test browser's WebKit: a finger's tap on a sim row's "+" arms nothing (a known quirk of the test browser, sss-w1B-lib probe4) — armed by the script's click, said so */
    const a = await arm(p, W, 'B', 2, '[data-fill="s:2.oft.0.+"]', { now: true, tag: 'f14-arm' })
    const k = await B.pickMan(p, W, 'B', ID.Jester, 'f14', { now: true, pic: true })
    await unarm(p, W, 'B')
    t = { placed: (await Z.dayHold(p, 2, ID.Jester)).some(h => /oft/.test(h)), toast: k.toast, pic: pics(a.now, k.now, k.tpic) + ` (armed by ${a.via})` }
  }
  rec(W, 'f14.note', 'Jester (SANS, nothing filed) tapped into the seed OFT EP-4 on Wed: the note after the plant (A\'s scenario; recorded)', `row ${J(before)} · placed ${t.placed} · note "${t.toast}"`, t.pic)
  const s = await sl(p, W, 2, 'Jester', 'f14-list')
  const want = `${NF}OFT EP-4 09:00–10:30`
  chk(W, 'f14.line', `F14: Wed's list reads "${want}"`, s.tails.includes(want), say(s.mine), s.pic)
  const allSans = []
  for (let di = 0; di < 7; di++) { const r = await Z.readOpen(p, W, '#eWeek', di); allSans.push(...r.lines.filter(x => /SANS:/.test(x.text)).map(x => `${di}: ${tailOf(x)}`)) }
  chk(W, 'f14.nosim', 'F14: no SANS line on any day of the week says "Sim"', allSans.length && !allSans.some(x => /\bSim\b/.test(x)), allSans.join(' || '))
}

/* F15 + S9 (OFT) — the state table of one OFT row, Jester planted, the row edited on screen */
SC.tab = async (p, W) => {
  const DI = 4
  const s = await W5.addSim(p, W, DI, 'oft', 'EP-9', '10:00', '11:00')
  Z.need(W, 'tab.row', 'an OFT row "EP-9" 10:00–11:00 on Fri 17 (+ on the board, boxes typed)', s.r && s.r.str === '10:00' && s.r.end === '11:00', J(s))
  const t = await plant(p, W, DI, seatP(DI, 'oft', s.ri), ID.Jester, 'tab-plant')
  Z.need(W, 'tab.plant', 'Jester tapped into its front seat', t.placed, `note "${t.toast}"`, t.pic)
  const steps = [
    ['a', 'start 10:00, end 11:00', [], `${NF}OFT EP-9 10:00–11:00`],
    ['b', 'the end cleared', [['end', '']], `${NF}OFT EP-9 10:00–11:30 (end assumed)`],
    ['c', 'the start cleared too', [['str', '']], `${NF}OFT EP-9 (no times yet)`],
    ['d', 'the name cleared, no times', [['label', '']], `${NF}this OFT row (no times yet)`],
    ['e', 'no name, start 09:00 only', [['str', '09:00']], `${NF}this OFT row 09:00–10:30 (end assumed)`],
    ['f', 'no name, start cleared, end 10:30 typed (an end with no start — the host: "(no times yet)", RECORD)', [['str', ''], ['end', '10:30']], `${NF}this OFT row (no times yet)`],
    ['g', 'no name, start 09:00 and end 10:30 typed (the same end as the assumed one)', [['str', '09:00']], `${NF}this OFT row 09:00–10:30`],
    ['s9', 'named EP-9 again, start 09:00 only, then 10:30 typed (Astra S9)', [['label', 'EP-9'], ['end', ''], ['end', '10:30']], `${NF}OFT EP-9 09:00–10:30`],
  ]
  for (const [k, what, edits, want] of steps) await step(W, 'tab.' + k, async () => {
    for (const [f, v] of edits) await box(p, W, DI, 'oft', s.ri, f, v)
    const now = await simNow(p, DI, 'oft', s.ri)
    const r = await sl(p, W, DI, 'Jester', 'tab-' + k)
    const hasSim = r.tails.filter(x => /OFT|this OFT row/.test(x))
    const ok = hasSim.length === 1 && hasSim[0] === want
    chk(W, 'tab.' + k, `F15(${k}) ${what}: the line reads "${want}"`, ok, `row ${J(now)} · ${say(r.mine)}`, r.pic)
    if (k === 'f') rec(W, 'tab.f-words', 'F15(f) / S9 an end with no start: the exact words (RECORD — may go to him)', `"${hasSim.join(' | ')}"`)
  })
  /* the crew list on the armed seat at (a)'s times: the reason (sibling words, lesson 33) */
  await step(W, 'tab.crew', async () => {
    await box(p, W, DI, 'oft', s.ri, 'str', '10:00'); await box(p, W, DI, 'oft', s.ri, 'end', '11:00')
    const a = await arm(p, W, 'B', DI, `[data-fill="s:${DI}.oft.${s.ri}.+"]`, { now: true, tag: 'tab-crew' })
    const sec = await readSec(p, 'B')
    const pic = await secPic(p, W, 'B', 'tab-crew')
    const kr = rowOf(sec, ID.Kraken) || rowOf(sec, ID.Bolt)
    rec(W, 'tab.crew', 'the OFT row\'s extra place armed: the crew list\'s SANS section (a blank SANS man\'s reason — sibling of the line)', `armed ${a.armed} · ${B.secSay(sec)}`, pics(pic, a.now))
    chk(W, 'tab.crew-why', 'a blank SANS man on the crew list reads "SANS — no availability filed for today" (the note\'s words, D2753)', kr && kr.struck && kr.why === 'SANS — no availability filed for today', rowSay(kr))
    await unarm(p, W, 'B')
  })
}

/* F16 + S9 (AMT) — an AMT row BOX: (a), (b), (d); start only; end only */
SC.amt = async (p, W) => {
  const DI = 4
  const s = await W5.addSim(p, W, DI, 'amt', 'BOX', '13:00', '14:00')
  Z.need(W, 'amt.row', 'an AMT row "BOX" 13:00–14:00 on Fri 17', s.r && s.r.str === '13:00', J(s))
  const t = await plant(p, W, DI, seatP(DI, 'amt', s.ri), ID.Jester, 'amt-plant')
  Z.need(W, 'amt.plant', 'Jester tapped into its front seat', t.placed, `note "${t.toast}"`, t.pic)
  rec(W, 'amt.note', 'the note after the plant (A\'s; recorded)', `"${t.toast}"`)
  const steps = [
    ['a', '13:00–14:00', [], `${NF}AMT BOX 13:00–14:00`],
    ['b', 'the end cleared', [['end', '']], `${NF}AMT BOX 13:00–14:30 (end assumed)`],
    ['d', 'name and start cleared', [['label', ''], ['str', '']], `${NF}this AMT row (no times yet)`],
    ['st', 'named BOX, start 09:00 only (S9)', [['label', 'BOX'], ['str', '09:00']], `${NF}AMT BOX 09:00–10:30 (end assumed)`],
    ['en', 'end 10:30 typed (S9)', [['end', '10:30']], `${NF}AMT BOX 09:00–10:30`],
    ['eo', 'the start cleared, end left (S9: no made-up start)', [['str', '']], `${NF}AMT BOX (no times yet)`],
  ]
  for (const [k, what, edits, want] of steps) await step(W, 'amt.' + k, async () => {
    for (const [f, v] of edits) await box(p, W, DI, 'amt', s.ri, f, v)
    const now = await simNow(p, DI, 'amt', s.ri)
    const r = await sl(p, W, DI, 'Jester', 'amt-' + k)
    const sim = r.tails.filter(x => /AMT/.test(x))
    chk(W, 'amt.' + k, `F16 / S9 AMT (${k}) ${what}: the line reads "${want}"`, sim.length === 1 && sim[0] === want, `row ${J(now)} · ${say(r.mine)}`, r.pic)
  })
}

/* F17 + S10 — odd row names on an OFT row, and the AMT row renamed BRIEF / DEBRIEF */
SC.names = async (p, W) => {
  const DI = 4
  const s = await W5.addSim(p, W, DI, 'oft', 'EP-9', '10:00', '11:00')
  const t = await plant(p, W, DI, seatP(DI, 'oft', s.ri), ID.Jester, 'nm-plant')
  Z.need(W, 'nm.plant', 'Jester on an OFT row 10:00–11:00 on Fri 17', t.placed, `"${t.toast}"`)
  const names = [['Sim', 'this OFT row'], ['sim', 'this OFT row'], ['SIM 2', 'OFT SIM 2'], ['Sim 2', null], ['Simba', 'OFT Simba'], ['OFT 1', 'OFT OFT 1'], ['   ', 'this OFT row'], ['EP-9 & EP-10 (LONG NAME FOR THE REAR)', 'OFT EP-9 & EP-10 (LONG NAME FOR THE REAR)']]
  let n = 0
  for (const [nm, head] of names) await step(W, 'nm.' + n, async () => {
    const tag = 'nm-' + (n++)
    await box(p, W, DI, 'oft', s.ri, 'label', nm)
    const now = await simNow(p, DI, 'oft', s.ri)
    const r = await sl(p, W, DI, 'Jester', tag)
    const sim = r.tails.filter(x => /OFT/.test(x))
    if (head) chk(W, tag, `F17 / S10 the OFT row named "${nm}": the line reads "${NF}${head} 10:00–11:00"`, sim.length === 1 && sim[0] === `${NF}${head} 10:00–11:00`, `label ${J(now.label)} · ${say(r.mine)}`, r.pic)
    else rec(W, tag, `F17 the OFT row named "${nm}" (no EXPECTED: the rule strips a leading "Sim") — RECORD for him`, `label ${J(now.label)} · ${say(r.mine)}`, r.pic)
  })
  /* S10 — the AMT rows: blank label, BOX, then BRIEF / DEBRIEF */
  await step(W, 'nm.amt', async () => {
    const a = await W5.addSim(p, W, DI, 'amt', '', '13:00', '14:00')
    const t2 = await plant(p, W, DI, seatP(DI, 'amt', a.ri), ID.Kraken, 'nm-amt')
    Z.need(W, 'nm.amt-plant', 'Kraken (SANS, nothing filed on Fri) on a new unnamed AMT row 13:00–14:00', t2.placed, `"${t2.toast}"`)
    for (const [k, nm, want] of [['blank', '', `${NF}this AMT row 13:00–14:00`], ['box', 'BOX', `${NF}AMT BOX 13:00–14:00`], ['brief', 'BRIEF', null], ['debrief', 'DEBRIEF', null], ['box2', 'BOX', `${NF}AMT BOX 13:00–14:00`]]) {
      if (k !== 'blank') await box(p, W, DI, 'amt', a.ri, 'label', nm)
      const now = await simNow(p, DI, 'amt', a.ri)
      const r = await sl(p, W, DI, 'Kraken', 'nm-amt-' + k)
      await L.openBoard(p, W, DI)
      const seat = await Z.dayHold(p, DI, ID.Kraken)
      const pic2 = await W.pic(p, 'nm-amt-' + k + '-board')
      if (want) chk(W, 'nm.amt-' + k, `S10 the AMT row named "${nm}": Kraken's line reads "${want}"`, r.tails.length === 1 && r.tails[0] === want, `label ${J(now.label)} · ${say(r.mine)}`, pics(r.pic, pic2))
      else rec(W, 'nm.amt-' + k, `S10 / the host: the AMT row renamed "${nm}" — does Kraken in it still raise a SANS line? (RECORD, an open question for him)`, `label ${J(now.label)} · his places ${J(seat)} · ${say(r.mine)} · every SANS line ${r.all.map(tailOf).join(' | ')}`, pics(r.pic, pic2))
    }
  })
}

/* Re-walk 1 (build2, the fix: a row its scheduler named "SIM" / "Sim" / "sim" keeps its name; only a row with no name reads
   "this OFT row") — F17's table again, then a row named SIM and a blank row at the same times with the same man */
SC.names2 = async (p, W) => {
  const DI = 4
  const bundle = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean).join(' '))
  rec(W, 'rw.bundle', 'the served bundle (re-walk 1 must be index-0HKWKnT7.js)', bundle)
  const s = await W5.addSim(p, W, DI, 'oft', 'EP-9', '10:00', '11:00')
  const t = await plant(p, W, DI, seatP(DI, 'oft', s.ri), ID.Jester, 'rw-plant')
  Z.need(W, 'rw.plant', 'Jester on an OFT row 10:00–11:00 on Fri 17', t.placed, `"${t.toast}"`)
  const names = [['SIM', 'OFT SIM'], ['Sim', 'OFT Sim'], ['sim', 'OFT sim'], ['SIM 2', 'OFT SIM 2'], ['Sim 2', null], ['Simba', 'OFT Simba'], ['OFT 1', 'OFT OFT 1'], ['   ', 'this OFT row'], ['', 'this OFT row']]
  let n = 0
  for (const [nm, head] of names) await step(W, 'rw.' + n, async () => {
    const tag = 'rw-nm-' + (n++)
    await box(p, W, DI, 'oft', s.ri, 'label', nm)
    const now = await simNow(p, DI, 'oft', s.ri)
    const r = await sl(p, W, DI, 'Jester', tag)
    const sim = r.tails.filter(x => /OFT/.test(x))
    if (head) chk(W, tag, `Re-walk 1 / F17: the OFT row named ${J(nm)}: the line reads "${NF}${head} 10:00–11:00"`, sim.length === 1 && sim[0] === `${NF}${head} 10:00–11:00`, `label ${J(now.label)} · ${say(r.mine)}`, r.pic)
    else rec(W, tag, `Re-walk 1 / F17: the OFT row named ${J(nm)} (no EXPECTED given) — RECORD`, `label ${J(now.label)} · ${say(r.mine)}`, r.pic)
  })
  /* a row named SIM and a blank row, both 10:00–11:00, the same man on both: two separate lines */
  await step(W, 'rw.two', async () => {
    await box(p, W, DI, 'oft', s.ri, 'label', 'SIM')
    const b = await W5.addSim(p, W, DI, 'oft', '', '10:00', '11:00')
    const t2 = await plant(p, W, DI, seatP(DI, 'oft', b.ri), ID.Jester, 'rw-two')
    const A1 = `${NF}OFT SIM 10:00–11:00`, A2 = `${NF}this OFT row 10:00–11:00`
    let r = await sl(p, W, DI, 'Jester', 'rw-two')
    chk(W, 'rw.two', `Re-walk 1: Jester on a row named SIM and on a blank row, both 10:00–11:00 — two separate lines "${A1}" and "${A2}"`, t2.placed && r.mine.length === 2 && r.tails.includes(A1) && r.tails.includes(A2), `rows ${J([await simNow(p, DI, 'oft', s.ri), await simNow(p, DI, 'oft', b.ri)])} · note "${t2.toast}" · ${say(r.mine)} · bar "${r.bar}"`, r.pic)
    const n0 = r.n
    await toggle(p, W, DI, 'Jester', /OFT SIM/, 'rw-hide-sim')
    r = await sl(p, W, DI, 'Jester', 'rw-two-hid')
    chk(W, 'rw.two-hide', 'Re-walk 1: the SIM row\'s line hidden — the blank row\'s line stays shown, the count down by one', r.mine.find(x => tailOf(x) === A1 && x.hid) && r.mine.find(x => tailOf(x) === A2 && !x.hid) && r.n === n0 - 1, `${say(r.mine)} · count ${n0} → ${r.n}`, r.pic)
    await toggle(p, W, DI, 'Jester', /OFT SIM/, 'rw-show-sim')
    const b2 = await Z.boardList(p, W, DI)
    const bp = (await W5.clip(p, W, '#schedBoard .sb-warn', 'rw-two-board', 10).catch(() => '')) || ''
    await L.closeBoard(p, W)
    const bl = b2.lines.filter(x => x.text.includes('Jester — SANS:')).map(x => x.text.replace(/^.*? — (SANS:.*?)\s*[✕↺]?$/, '$1').trim())
    chk(W, 'rw.two-board', 'Re-walk 1: the board\'s panel carries the same two lines', bl.includes(A1) && bl.includes(A2), J(bl), bp)
  })
}

/* F18 + F19 + S8 — every reason family on an OFT and an AMT row */
SC.fam = async (p, W) => {
  const DI = 4
  const o = await W5.addSim(p, W, DI, 'oft', 'EP-9', '10:00', '11:00')
  const a = await W5.addSim(p, W, DI, 'amt', 'BOX', '13:00', '14:00')
  Z.need(W, 'fam.rows', 'OFT EP-9 10:00–11:00 and AMT BOX 13:00–14:00 on Fri 17', o.r.str === '10:00' && a.r.str === '13:00', J([o.r, a.r]))
  const t1 = await plant(p, W, DI, seatP(DI, 'oft', o.ri), ID.Jester, 'fam-o')
  const t2 = await plant(p, W, DI, seatP(DI, 'amt', a.ri), ID.Kraken, 'fam-a')
  Z.need(W, 'fam.plant', 'Jester on OFT EP-9, Kraken on AMT BOX (both SANS, nothing filed on Fri)', t1.placed && t2.placed, `"${t1.toast}" / "${t2.toast}"`)
  const readBoth = async (tag) => { const j = await sl(p, W, DI, 'Jester', tag); const k = await sl(p, W, DI, 'Kraken', ''); const b = await Z.boardList(p, W, DI); const bp = (await W5.clip(p, W, '#schedBoard .sb-warn', tag + '-board', 10).catch(() => '')) || ''; await L.closeBoard(p, W); return { j, k, b, pic: pics(j.pic, bp) } }
  const bLine = (b, cs) => b.lines.filter(x => x.text.includes(cs + ' — SANS:')).map(x => x.text.replace(/^.*? — (SANS:.*?)\s*[✕↺]?$/, '$1').trim())
  let r = await readBoth('fam-none')
  chk(W, 'fam.none', 'S8 nothing filed: "SANS: no availability filed for today. Planned on OFT EP-9 10:00–11:00" / "… AMT BOX 13:00–14:00", the same on the board\'s panel', r.j.tails.includes(`${NF}OFT EP-9 10:00–11:00`) && r.k.tails.includes(`${NF}AMT BOX 13:00–14:00`) && bLine(r.b, 'Jester').includes(`${NF}OFT EP-9 10:00–11:00`) && bLine(r.b, 'Kraken').includes(`${NF}AMT BOX 13:00–14:00`), `Jester ${say(r.j.mine)} · Kraken ${say(r.k.mine)} · board J ${J(bLine(r.b, 'Jester'))} K ${J(bLine(r.b, 'Kraken'))}`, r.pic)
  const fj = await fileS(p, W, ISO[DI], ID.Jester, ['fly'], 'all'), fk = await fileS(p, W, ISO[DI], ID.Kraken, ['fly'], 'all')
  Z.need(W, 'fam.fly', 'Jester and Kraken filed Fly only, all day, for Fri on the SANS tab', fj.iid && fk.iid, J([fj.refused, fk.refused]))
  r = await readBoth('fam-fly')
  chk(W, 'fam.fly', 'S8 Fly only: "SANS: offered Fly only today. Planned on OFT EP-9 10:00–11:00" / "… AMT BOX 13:00–14:00" (list and board)', r.j.tails.includes('SANS: offered Fly only today. Planned on OFT EP-9 10:00–11:00') && r.k.tails.includes('SANS: offered Fly only today. Planned on AMT BOX 13:00–14:00') && bLine(r.b, 'Jester').length === 1 && bLine(r.b, 'Kraken').length === 1, `Jester ${say(r.j.mine)} · Kraken ${say(r.k.mine)} · board ${J(bLine(r.b, 'Jester'))} ${J(bLine(r.b, 'Kraken'))}`, r.pic)
  /* F18: the OFT's end cleared — Fly-only man, end assumed */
  await box(p, W, DI, 'oft', o.ri, 'end', '')
  const f18 = await sl(p, W, DI, 'Jester', 'fam-f18')
  chk(W, 'fam.f18', 'F18 Fly-only man on OFT EP-9 10:00 with no end: "SANS: offered Fly only today. Planned on OFT EP-9 10:00–11:30 (end assumed)"', f18.tails.includes('SANS: offered Fly only today. Planned on OFT EP-9 10:00–11:30 (end assumed)'), say(f18.mine), f18.pic)
  await box(p, W, DI, 'oft', o.ri, 'end', '11:00')
  /* S8: each sim offered for 08:00–09:00 only */
  await editS(p, W, ISO[DI], fj.iid, { kinds: ['oft'], span: ['08:00', '09:00'] }); await editS(p, W, ISO[DI], fk.iid, { kinds: ['amt'], span: ['08:00', '09:00'] })
  r = await readBoth('fam-hrs')
  chk(W, 'fam.hrs', 'S8 the sim offered 08:00–09:00 only: "SANS: available 08:00–09:00 only. Planned on OFT EP-9 10:00–11:00" / "… AMT BOX 13:00–14:00"', r.j.tails.includes('SANS: available 08:00–09:00 only. Planned on OFT EP-9 10:00–11:00') && r.k.tails.includes('SANS: available 08:00–09:00 only. Planned on AMT BOX 13:00–14:00'), `Jester ${say(r.j.mine)} · Kraken ${say(r.k.mine)} · board ${J(bLine(r.b, 'Jester'))} ${J(bLine(r.b, 'Kraken'))}`, r.pic)
  /* F19: Kraken AMT 08:00–12:00 typed; BOX 13:00–14:00, then no end, then no times */
  await editS(p, W, ISO[DI], fk.iid, { kinds: ['amt'], span: ['08:00', '12:00'] })
  let k = await sl(p, W, DI, 'Kraken', 'fam-f19a')
  chk(W, 'fam.f19a', 'F19 AMT filed 08:00–12:00, planted on AMT BOX 13:00–14:00: "SANS: available 08:00–12:00 only. Planned on AMT BOX 13:00–14:00"', k.tails.includes('SANS: available 08:00–12:00 only. Planned on AMT BOX 13:00–14:00'), say(k.mine), k.pic)
  await box(p, W, DI, 'amt', a.ri, 'end', '')
  k = await sl(p, W, DI, 'Kraken', 'fam-f19b')
  chk(W, 'fam.f19b', 'F19 BOX\'s end cleared: "… Planned on AMT BOX 13:00–14:30 (end assumed)"', k.tails.includes('SANS: available 08:00–12:00 only. Planned on AMT BOX 13:00–14:30 (end assumed)'), say(k.mine), k.pic)
  await box(p, W, DI, 'amt', a.ri, 'str', '')
  k = await sl(p, W, DI, 'Kraken', 'fam-f19c')
  /* the strike read against a second untimed AMT row (BOX itself holds him: "already on this row", run dev) */
  const a2 = await W5.addSim(p, W, DI, 'amt', 'BOX2', '', '')
  const ar = await arm(p, W, 'B', DI, `[data-fill="s:${DI}.amt.${a2.ri}.+"]`, { now: true, tag: 'fam-f19c' })
  const sec = await readSec(p, 'B'); const spic = await secPic(p, W, 'B', 'fam-f19c-crew')
  await unarm(p, W, 'B')
  chk(W, 'fam.f19c', 'F19 both times cleared: his line goes (nothing to hold his hours against), and his crew-list strike goes too', !k.mine.length && rowOf(sec, ID.Kraken) && !rowOf(sec, ID.Kraken).struck, `${say(k.mine)} · armed ${ar.armed} · crew ${rowSay(rowOf(sec, ID.Kraken))}`, pics(k.pic, spic))
}

/* F20 — a flight with a take-off and no landing keeps the flying words */
SC.fly = async (p, W) => {
  const DI = 4
  const l = await Z.mkLine(p, W, DI, { cs: 'VL', msn: 'BFM', to: '13:00' })
  Z.need(W, 'fly.line', 'a flying line VL BFM T/O 13:00, no landing, on Fri 17', l.wi >= 0 && l.f.to === '13:00', J(l.f))
  const t = await plant(p, W, DI, l.fcp, ID.Jester, 'fly')
  rec(W, 'fly.note', 'the note after the plant (A\'s; recorded)', `placed ${t.placed} · "${t.toast}"`, t.pic)
  const r = await sl(p, W, DI, 'Jester', 'fly')
  chk(W, 'fly.words', 'F20: the flying words as before — "SANS: no availability filed for today. Planned on VL BFM (T/O 13:00)", no "(end assumed)"', r.tails.length === 1 && r.tails[0] === `${NF}VL BFM (T/O 13:00)` && !/end assumed/.test(r.tails[0]), say(r.mine), r.pic)
}

/* F21 + S16 — OFT and AMT apart when hidden; a hidden line whose words change */
SC.hide = async (p, W) => {
  const DI = 6
  const f = await fileS(p, W, ISO[DI], ID.Jester, ['fly'], 'all')
  Z.need(W, 'hide.file', 'Jester filed Fly only, all day, for Sun 19', !!f.iid, f.refused)
  const o = await W5.addSim(p, W, DI, 'oft', 'BOX', '10:00', '11:00')
  const a = await W5.addSim(p, W, DI, 'amt', 'BOX', '10:00', '11:00')
  Z.need(W, 'hide.rows', 'an OFT row and an AMT row both named BOX, 10:00–11:00, on Sun 19', o.r.label === 'BOX' && a.r.label === 'BOX', J([o.r, a.r]))
  const t1 = await plant(p, W, DI, seatP(DI, 'oft', o.ri), ID.Jester, 'hide-o')
  Z.need(W, 'hide.o', 'Jester on the OFT BOX', t1.placed, `"${t1.toast}"`)
  const OL = 'SANS: offered Fly only today. Planned on OFT BOX 10:00–11:00', AL = 'SANS: offered Fly only today. Planned on AMT BOX 10:00–11:00'
  await toggle(p, W, DI, 'Jester', /OFT BOX/, 'hide-o-x')
  let r = await sl(p, W, DI, 'Jester', 'hide-1')
  Z.need(W, 'hide.1', 'his OFT line hidden', r.mine.some(x => x.hid && tailOf(x) === OL), say(r.mine))
  const t2 = await plant(p, W, DI, seatP(DI, 'amt', a.ri), ID.Jester, 'hide-a')
  r = await sl(p, W, DI, 'Jester', 'hide-2')
  const al = r.mine.find(x => tailOf(x) === AL), ol = r.mine.find(x => tailOf(x) === OL)
  chk(W, 'hide.f21a', 'F21: the OFT line hidden, then he is put on the AMT BOX (same name, same times) — the AMT line SHOWS, not hidden; the OFT line stays hidden', t2.placed && al && !al.hid && ol && ol.hid, `placed ${t2.placed} "${t2.toast}" · ${say(r.mine)}`, r.pic)
  const n2 = r.n
  await toggle(p, W, DI, 'Jester', /OFT BOX/, 'hide-o-r'); await toggle(p, W, DI, 'Jester', /AMT BOX/, 'hide-a-x')
  r = await sl(p, W, DI, 'Jester', 'hide-3')
  const al3 = r.mine.find(x => tailOf(x) === AL), ol3 = r.mine.find(x => tailOf(x) === OL)
  chk(W, 'hide.s16', 'S16: the OFT line flagged again and only the AMT one hidden — OFT shown, AMT hidden (each its own line, despite the same man, label and times)', al3 && al3.hid && ol3 && !ol3.hid, say(r.mine), r.pic)
  await toggle(p, W, DI, 'Jester', /AMT BOX/, 'hide-a-r')
  r = await sl(p, W, DI, 'Jester', 'hide-4')
  chk(W, 'hide.both', 'both flagged again: two lines, both shown, each naming its own sim kind', r.mine.length === 2 && r.mine.every(x => !x.hid) && r.tails.includes(OL) && r.tails.includes(AL), `${say(r.mine)} · bar "${r.bar}" (count was ${n2} with one hidden)`, r.pic)
  /* F21's second half: the OFT line hidden, then its row's end cleared, the end typed again, the row renamed, the start changed */
  await toggle(p, W, DI, 'Jester', /OFT BOX/, 'hide-o-x2')
  const edits = [['end-cleared', 'end', ''], ['end-typed', 'end', '11:00'], ['renamed', 'label', 'EP-9'], ['start-moved', 'str', '10:30']]
  for (const [k, fld, v] of edits) await step(W, 'hide.' + k, async () => {
    await box(p, W, DI, 'oft', o.ri, fld, v)
    const q = await sl(p, W, DI, 'Jester', 'hide-' + k)
    const os = q.mine.filter(x => /OFT/.test(tailOf(x)))
    rec(W, 'hide.' + k, `F21 / the host: the OFT line hidden, then the row's ${fld} ${v === '' ? 'cleared' : 'set to ' + v} — does the hidden line stay hidden? (RECORD — hiding keys on the exact words, D469)`, `row ${J(await simNow(p, DI, 'oft', o.ri))} · OFT ${say(os)} · AMT ${say(q.mine.filter(x => /AMT/.test(tailOf(x))))}`, q.pic)
  })
}

/* F22 + S8's board — every place the sim line is read; publish, reload, republish; print */
SC.places = async (p, W) => {
  const DI = 4
  const s = await W5.addSim(p, W, DI, 'oft', 'EP-9', '10:00', '')
  Z.need(W, 'pl.row', 'an OFT row EP-9 with a start 10:00 and no end, Fri 17', s.r.str === '10:00' && !s.r.end, J(s.r))
  const t = await plant(p, W, DI, seatP(DI, 'oft', s.ri), ID.Jester, 'pl-plant')
  Z.need(W, 'pl.plant', 'Jester tapped into its front seat', t.placed, `"${t.toast}"`)
  const want = `${NF}OFT EP-9 10:00–11:30 (end assumed)`
  const st = await Z.places(p, W, DI, 'pl-all', [ID.Jester])
  const has = lines => (lines || []).some(x => x.text.includes('Jester — ' + want))
  chk(W, 'pl.all', `F22: the same words "${want}" on Edit Schedule's list, the day's ⓘ popup and the board's panel`, has(st.e.lines) && has(st.i.lines) && has(st.b.lines), st.say, st.pic)
  const seat = (st.bd[ID.Jester] || []).filter(x => x.where === 'sim'), wk = (st.wk[ID.Jester] || []).filter(x => x.where === 'sim' || x.slot)
  chk(W, 'pl.puck', 'F22: his puck on the sim seat wears the amber ring and the "A" (board and week)', seat.length && seat.every(x => x.ring === 'amber' && x.chip === 'A') && Z.amberA(st.wk[ID.Jester]).length, `board ${Z.pkSay(st.bd[ID.Jester])} · week ${Z.pkSay(st.wk[ID.Jester])}`)
  /* a tap on the line's words: what lights */
  await step(W, 'pl.tap', async () => {
    await Z.openList(p, W, '#eWeek', DI)
    const ln = p.locator(`#eWeek .day[data-day="${DI}"] [data-dwbox="${DI}"] .witem`).filter({ hasText: 'Jester — SANS' }).first()
    const tx = ln.locator('.wtx').first()
    await (await tx.count() ? tx : ln).scrollIntoViewIfNeeded()
    if (W.isPhone) await (await tx.count() ? tx : ln).tap(); else await (await tx.count() ? tx : ln).click()
    await sleep(700)
    const lit = await p.evaluate(() => { const ps = [...document.querySelectorAll('.puck')].filter(e => e.getBoundingClientRect().width > 0); return ps.filter(e => /\bwfoc\b|\bjump\b|\bpulse\b|\bhl\b/.test(e.className)).map(e => { const z = e.closest('[data-slot],[data-fill]'); return e.dataset.person + '@' + (z ? (z.dataset.slot || z.dataset.fill) : (e.closest('.rpuck') ? 'crew' : 'card')) }) })
    const pic = await W.pic(p, 'pl-tap')
    rec(W, 'pl.tap', 'F22: a tap on the line\'s words — what lights / where it takes him (RECORD)', `page ${await p.evaluate(() => window.CURPAGE)} · board open ${!!(await p.locator('#schedBoard').count())} · lit ${J(lit)} · scrollY ${await p.evaluate(() => Math.round(scrollY))}`, pic)
    await L.closeBoard(p, W)
  })
  const view = async tag => { const v = await sl(p, W, DI, 'Jester', tag, '#vWeek'); await L.go(p, 'editsched'); return v }
  let v = await view('pl-view0')
  chk(W, 'pl.view0', 'F22: View-only Sched (the working day, not yet published) reads the same line', v.tails.includes(want), say(v.mine), v.pic)
  await L.openBoard(p, W, DI)
  const pb = await L.publish(p, W, DI)
  await L.closeBoard(p, W)
  v = await view('pl-view1')
  chk(W, 'pl.pub', `F22: published ("${pb}"): View-only Sched keeps "(end assumed)"`, v.tails.includes(want), say(v.mine), v.pic)
  await T.reload(p, 'ad', 'a')
  v = await view('pl-view2')
  const e2 = await sl(p, W, DI, 'Jester', 'pl-edit2')
  chk(W, 'pl.reload', 'F22: after a reload and signing in again — "(end assumed)" survives on View-only Sched and Edit Schedule', v.tails.includes(want) && e2.tails.includes(want), `view ${say(v.mine)} · edit ${say(e2.mine)}`, pics(v.pic, e2.pic))
  /* the end typed on the working copy: the published face keeps its words until republished (D179) */
  await box(p, W, DI, 'oft', s.ri, 'end', '11:15')
  await L.closeBoard(p, W)
  const e3 = await sl(p, W, DI, 'Jester', 'pl-edit3')
  v = await view('pl-view3')
  rec(W, 'pl.typed', 'the end 11:15 typed after publishing: Edit Schedule (working copy) and View-only Sched (the issued face, frozen till republished, D179)', `edit ${say(e3.mine)} · view ${say(v.mine)}`, pics(e3.pic, v.pic))
  chk(W, 'pl.typed-edit', 'the working copy reads "… OFT EP-9 10:00–11:15", no "(end assumed)"', e3.mine.some(x => tailOf(x) === `${NF}OFT EP-9 10:00–11:15`), say(e3.mine))
  await L.openBoard(p, W, DI)
  const pb2 = await L.publish(p, W, DI)
  await L.closeBoard(p, W)
  v = await view('pl-view4')
  chk(W, 'pl.repub', `republished ("${pb2}"): View-only Sched reads the new words "… OFT EP-9 10:00–11:15"`, v.mine.some(x => tailOf(x) === `${NF}OFT EP-9 10:00–11:15` && !x.struck), say(v.mine), v.pic)
  /* the member reads the issued face */
  await asR(p, W)
  const m = await sl(p, W, DI, 'Jester', 'pl-ranger', '#vWeek')
  rec(W, 'pl.member', 'as Ranger (a member), View-only Sched of Fri 17 after the republish: the line', `${say(m.mine)} · bar "${m.bar}"`, m.pic)
  await asS(p, W)
  /* print (lesson 18): Export as PDF's page as the print dialog would print it */
  await step(W, 'pl.print', async () => {
    await L.closeBoard(p, W); await L.go(p, 'editsched')
    await p.evaluate(() => { window.__saPrints = 0; window.print = () => { window.__saPrints++ } })
    let b = p.locator('#exportPdf:visible').first()
    if (!(await b.count()) && await p.locator('#burger:visible').count()) { await W.press(p, '#burger:visible', 'burger'); b = p.locator('#exportPdf:visible').first() }
    if (!(await b.count())) { rec(W, 'pl.print', 'Export as PDF', 'no Export as PDF drawn at this size', await W.pic(p, 'pl-noexport')); return }
    await W.press(p, b, 'export-pdf'); await sleep(1500)
    const html = await p.evaluate(() => { const f = [...document.querySelectorAll('iframe')].filter(x => x.contentDocument && x.contentDocument.body && x.contentDocument.body.innerText.length > 50).pop(); return f ? '<!doctype html>' + f.contentDocument.documentElement.outerHTML : '' })
    const text = html.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ')
    const file = path.join(OUT, `${W.scn}-print-${W.sz.name}.html`); writeFileSync(file, html)
    const ps = []
    if (html) { const { chromium, webkit } = await import('@playwright/test'); for (const [eng, nm] of [[chromium, 'chromium'], [webkit, 'webkit']]) { const br = await eng.launch(); const pg = await br.newPage({ viewport: { width: 1100, height: 1400 } }); await pg.setContent(html, { waitUntil: 'load' }); await pg.emulateMedia({ media: 'print' }); await sleep(400); const f1 = path.join(OUT, `${W.scn}-print-${nm}-${W.sz.name}.png`); await pg.screenshot({ path: f1, fullPage: true }); ps.push(path.basename(f1)); await br.close() } }
    const fri = text.indexOf('Friday Jul 17') >= 0 ? text.slice(text.indexOf('Friday Jul 17'), text.indexOf('Friday Jul 17') + 500) : '(no "Friday Jul 17" in the print)'
    rec(W, 'pl.print', 'Export as PDF after the republish (lesson 18): does a SANS line print, and in which words? (RECORD)', `printed ${html ? 'yes' : 'NO PAGE'} · prints ${await p.evaluate(() => window.__saPrints)} · SANS in print: ${/SANS/.test(text)} · OFT EP-9 in print: ${/OFT EP-9/.test(text)} · end assumed in print: ${/end assumed/.test(text)} · Friday: "${fri.slice(0, 300)}"`, ps.join(', '))
  })
}

/* S11 — a sim's extra places */
SC.extra = async (p, W) => {
  const DI = 4
  const s = await W5.addSim(p, W, DI, 'oft', 'EP-9', '', '')
  const t0 = await plant(p, W, DI, seatP(DI, 'oft', s.ri), ID.Rebel, 'ex-0')
  Z.need(W, 'ex.set', 'an untimed OFT row EP-9 on Fri 17 with Rebel (not SANS-filed for Fri) already in its front seat', t0.placed, `"${t0.toast}"`)
  const tryAdd = async (id, tag) => {
    const a = await arm(p, W, 'B', DI, `[data-fill="s:${DI}.oft.${s.ri}.+"]`, { now: true, tag })
    const sec = await readSec(p, 'B'); const spic = await secPic(p, W, 'B', tag + '-crew')
    const r = rowOf(sec, id)
    const k = await B.pickMan(p, W, 'B', id, tag, { now: true, pic: true })
    await unarm(p, W, 'B')
    const held = await Z.dayHold(p, DI, id)
    return { armed: a.armed, why: r ? r.why : 'not in the SANS section', struck: r && r.struck, note: k.toast, held, pic: pics(a.now, spic, k.now, k.tpic) }
  }
  const x1 = await tryAdd(ID.Marlin, 'ex-1')
  const l1 = await sl(p, W, DI, 'Marlin', 'ex-1')
  chk(W, 'ex.1', 'S11 the untimed row\'s extra place armed and Marlin tapped: he lands in the extra place; reason "SANS — no availability filed for today"; note "Marlin — SANS — no availability filed for today"; line "… Planned on OFT EP-9 (no times yet)"', x1.held.some(h => /oft/.test(h)) && x1.why === 'SANS — no availability filed for today' && x1.note === 'Marlin — SANS — no availability filed for today' && l1.tails.includes(`${NF}OFT EP-9 (no times yet)`), `${J(x1)} · ${say(l1.mine)}`, pics(x1.pic, l1.pic))
  const x2 = await tryAdd(ID.Pixel, 'ex-2')
  const l2 = await sl(p, W, DI, 'Pixel', 'ex-2')
  chk(W, 'ex.2', 'S11 a later extra place: Pixel tapped in beside Marlin — the same words', x2.held.some(h => /oft/.test(h)) && x2.note === 'Pixel — SANS — no availability filed for today' && l2.tails.includes(`${NF}OFT EP-9 (no times yet)`), `${J(x2)} · ${say(l2.mine)}`, pics(x2.pic, l2.pic))
  await box(p, W, DI, 'oft', s.ri, 'str', '10:00'); await box(p, W, DI, 'oft', s.ri, 'end', '11:00')
  const l3 = await sl(p, W, DI, 'Marlin', 'ex-3')
  chk(W, 'ex.3', 'S11 with 10:00–11:00 typed: "… Planned on OFT EP-9 10:00–11:00"', l3.tails.includes(`${NF}OFT EP-9 10:00–11:00`), say(l3.mine), l3.pic)
  const f = await fileS(p, W, ISO[DI], ID.Marlin, ['fly'], 'all')
  const l4 = await sl(p, W, DI, 'Marlin', 'ex-4')
  chk(W, 'ex.4', 'S11 Marlin filed Fly only: "SANS: offered Fly only today. Planned on OFT EP-9 10:00–11:00"', f.iid && l4.tails.includes('SANS: offered Fly only today. Planned on OFT EP-9 10:00–11:00'), say(l4.mine), l4.pic)
}

/* F27 + S15 + F28 — two flights two lines; leave and SANS both */
SC.two = async (p, W) => {
  const DI = 5
  const a = await Z.mkLine(p, W, DI, { cs: 'VX', msn: 'ACM', to: '09:00', ld: '10:00' })
  const b = await Z.mkLine(p, W, DI, { cs: 'VZ', msn: 'DACT', to: '15:00', ld: '16:00' })
  Z.need(W, 'two.lines', 'VX ACM 09:00–10:00 and VZ DACT 15:00–16:00 on Sat 18', a.wi >= 0 && b.wi > a.wi, J([a.f, b.f]))
  const t1 = await plant(p, W, DI, a.fcp, ID.Bolt, 'two-1'), t2 = await plant(p, W, DI, b.fcp, ID.Bolt, 'two-2')
  rec(W, 'two.notes', 'F27: one note per plant (A\'s words; recorded)', `"${t1.toast}" / "${t2.toast}"`, pics(t1.pic, t2.pic))
  const VX = `${NF}VX ACM (T/O 09:00)`, VZ = `${NF}VZ DACT (T/O 15:00)`
  let r = await sl(p, W, DI, 'Bolt', 'two-a')
  const n0 = r.n
  chk(W, 'two.a', `F27 / S15: two SANS lines for Bolt, each naming its flight ("${VX}", "${VZ}")`, r.mine.length === 2 && r.tails.includes(VX) && r.tails.includes(VZ) && r.mine.every(x => !x.hid), `${say(r.mine)} · bar "${r.bar}"`, r.pic)
  await toggle(p, W, DI, 'Bolt', /VX ACM/, 'two-hx')
  r = await sl(p, W, DI, 'Bolt', 'two-b')
  chk(W, 'two.b', 'F27 / S15: VX hidden — VZ stays shown; the count down by one', r.mine.find(x => tailOf(x) === VX && x.hid) && r.mine.find(x => tailOf(x) === VZ && !x.hid) && r.n === n0 - 1, `${say(r.mine)} · count ${n0} → ${r.n}`, r.pic)
  await toggle(p, W, DI, 'Bolt', /VX ACM/, 'two-rx'); await toggle(p, W, DI, 'Bolt', /VZ DACT/, 'two-hz')
  r = await sl(p, W, DI, 'Bolt', 'two-c')
  chk(W, 'two.c', 'S15: VX restored, VZ hidden — VX shown, VZ hidden, the count down by one', r.mine.find(x => tailOf(x) === VX && !x.hid) && r.mine.find(x => tailOf(x) === VZ && x.hid) && r.n === n0 - 1, `${say(r.mine)} · count ${r.n}`, r.pic)
  await toggle(p, W, DI, 'Bolt', /VZ DACT/, 'two-rz')
  /* F28 / S15: Otter on leave (OL) on Sat through the board's Unavailable "+ Add", then planted on RU ACM */
  await step(W, 'two.leave', async () => {
    await L.openBoard(p, W, DI)
    const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
    await W.press(p, L.B(`[data-inpadd="${DI}.u"]`), 'unav-add'); await p.waitForSelector('#inpEditPop', { timeout: 6000 }); await sleep(300)
    await p.selectOption('#inpEditType', 'OL').catch(() => {}); await sleep(200)
    await p.selectOption('#inpEditPerson', ID.Otter).catch(() => {}); await sleep(200)
    const fpic = await W.pic(p, 'two-leave-form')
    await W.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
    for (const nm of ['No document', 'Later']) { const nd = p.getByRole('button', { name: nm }); if (await nd.count() && await nd.first().isVisible().catch(() => false)) { await nd.first().click().catch(() => {}); await sleep(400) } }
    const made = (await p.evaluate(() => (window.INPUTS || []).map(r => ({ iid: r.iid, type: r.type, date: r.date, who: JSON.stringify(r.people || r.person || ''), allday: r.allday })))).filter(x => !before.includes(x.iid))
    Z.need(W, 'two.leave', 'OL filed for Otter on Sat 18 through the board\'s Unavailable "+ Add"', made.some(x => x.who.includes(ID.Otter) && x.type === 'OL'), J(made) + ' toast "' + await L.toastSaid(p) + '"', fpic)
    await B.closeB(p, W)
    const c = await Z.mkLine(p, W, DI, { cs: 'RU', msn: 'ACM', to: '11:00', ld: '12:00' })
    const t3 = await plant(p, W, DI, c.rcp, ID.Otter, 'two-otter')
    const o = await sl(p, W, DI, 'Otter', 'two-otter')
    const all = o.l.lines.filter(x => /Otter/.test(x.text))
    rec(W, 'two.otter-note', 'F28: the note after planting Otter (on leave, nothing filed) — which leads (A\'s words; recorded)', `placed ${t3.placed} · "${t3.toast}"`, t3.pic)
    chk(W, 'two.otter', 'F28 / S15: Otter keeps both — the leave line and the SANS line "… Planned on RU ACM (T/O 11:00)"', all.length >= 2 && o.tails.includes(`${NF}RU ACM (T/O 11:00)`) && all.some(x => !/SANS/.test(x.text)), all.map(x => `[${x.sev}] ${x.text}`).join(' || '), o.pic)
  })
}

/* the SANS form's boxes read in the order drawn, and the Save button */
const formRead = p => p.evaluate(() => {
  const t = x => (x ? x.textContent || '' : '').replace(/\s+/g, ' ').trim()
  const s = document.querySelector('#inpEditSans')
  const labs = s ? [...s.querySelectorAll('label')].filter(e => e.getBoundingClientRect().width > 0) : []
  const sv = document.querySelector('#inpEditSave')
  return { labels: labs.map(e => t(e)), ticked: labs.filter(e => e.querySelector('input').checked).map(e => t(e)), lefts: labs.map(e => Math.round(e.getBoundingClientRect().left)), tops: labs.map(e => Math.round(e.getBoundingClientRect().top)),
    save: sv ? (sv.disabled ? 'greyed' : 'live') + (sv.title ? ' "' + sv.title + '"' : '') : 'no Save', type: (document.querySelector('#inpEditType') || {}).value || '', person: (document.querySelector('#inpEditPerson') || {}).value || t(document.querySelector('#inpEditPersonFixed')) }
})
/* every box unticked, Save pressed; the words the window or a note gave */
async function emptySave(p, W, tag) {
  await setKinds(p, W, [])
  const f = await formRead(p)
  const pic0 = await crop(p, W, ['#inpEditPop'], tag + '-empty', 6)
  const dis = await p.locator('#inpEditSave').first().isDisabled().catch(() => null)
  if (!dis) { await W.press(p, '#inpEditSave:visible', 'save'); await sleep(700) }
  const stayed = !!(await p.locator('#inpEditPop:visible').count())
  const words = stayed ? clean(await p.evaluate(() => { const w = document.querySelector('#inpEditPop'); return [...w.querySelectorAll('[role="alert"], .inped-err, .inped-bad, .note.warn, .err, .why, [class*="err"], [class*="refus"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent).join(' | ') })) : ''
  const toast = await L.toastSaid(p)
  const pic = await W.pic(p, tag + '-refused')
  return { form: f, saveGreyed: dis, stayed, words, toast, pic: pics(pic0, pic), all: `${words} ${toast} ${f.save}` }
}
async function closeForm(p, W) {
  for (let i = 0; i < 2; i++) {
    const x = p.locator('[data-testid="win-inputedit-x"]:visible, #inpEditCancel:visible').first(); if (await x.count()) await W.press(p, x, 'x')
    const g = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await g.count()) await W.press(p, g, 'discard')
    await sleep(300)
    if (!(await p.locator('#inpEditPop:visible').count())) break
  }
  await T.closeAll(p, W)
}
const REF = 'Tick at least one of Fly / OFT / AMT'
const orderOk = f => J(f.labels) === J(['Fly', 'OFT', 'AMT']) && f.lefts[0] < f.lefts[1] && f.lefts[1] < f.lefts[2]

/* F23 + F24 + S2 — "+ Commitment": the order, the refusal, Tab order; each tick saves what it says; every combination */
SC.ticks = async (p, W) => {
  const DI = 3, iso = ISO[DI]
  await W5.sansDay(p, W, iso)
  await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add'); await p.waitForSelector('#inpEditPop', { timeout: 6000 }); await sleep(300)
  await p.selectOption('#inpEditPerson', ID.Jester).catch(() => {}); await sleep(200)
  const f0 = await formRead(p)
  const fp = await crop(p, W, ['#inpEditSans'], 'tk-boxes', 16)
  chk(W, 'tk.order', 'F23 / S2: the boxes left to right Fly · OFT · AMT', orderOk(f0), J(f0), fp)
  rec(W, 'tk.opens', '"+ Commitment" opens with these ticked (RECORD)', J(f0.ticked))
  if (!W.isPhone) await step(W, 'tk.tab', async () => {
    await p.locator('#inpEditSans input').first().focus(); const seen = []
    for (let i = 0; i < 3; i++) { seen.push(await p.evaluate(() => { const a = document.activeElement; const l = a && a.closest('label'); return l ? l.textContent.trim() : (a ? a.tagName + '#' + a.id : 'none') })); await p.keyboard.press('Tab') }
    chk(W, 'tk.tab', 'F23: Tab through the boxes — focus Fly, then OFT, then AMT', J(seen) === J(['Fly', 'OFT', 'AMT']), J(seen))
  })
  /* lesson 4: with the form open, the calendar day behind it pressed (Fri 17) — what lights, what the form then says */
  await step(W, 'tk.behind', async () => {
    const r0 = clean(await p.locator('#inpEditPop .rc-read').first().textContent().catch(() => ''))
    const c = await p.evaluate(iso => { const e = document.querySelector(`[data-testid="sc-day-${iso}"]`); if (!e) return null; const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const h = document.elementFromPoint(x, y); return { x, y, w: b.width, top: h ? (h.closest(`[data-testid="sc-day-${iso}"]`) ? 'the day itself' : (h.id || h.className || h.tagName).toString().slice(0, 60)) : 'nothing' } }, ISO[4])
    if (!c || !c.w) { rec(W, 'tk.behind', 'lesson 4: the SANS calendar behind the open form', 'the calendar day is not drawn behind the form at this size', await W.pic(p, 'tk-behind-none')); return }
    if (W.isPhone) await p.touchscreen.tap(c.x, c.y); else await p.mouse.click(c.x, c.y)
    await sleep(600)
    const after = { form: await p.locator('#inpEditPop:visible').count(), read: clean(await p.locator('#inpEditPop .rc-read').first().textContent().catch(() => '')), day: clean(await p.locator('[data-testid="win-sansday"] h3, [data-testid="win-sansday"] .wtitle, [data-testid="win-sansday"] header').first().textContent().catch(() => '')), lit: await p.evaluate(() => [...document.querySelectorAll('[data-testid^="sc-day-"]')].filter(e => /\b(on|sel|picked|active|is-sel)\b/.test(e.className)).map(e => e.dataset.testid)) }
    rec(W, 'tk.behind', 'lesson 4: the form open, Fri 17 pressed on the calendar behind it — what lights and what the form says (RECORD)', `before "${r0}" · under the press: ${c.top} · after ${J(after)}`, await W.pic(p, 'tk-behind'))
    if (!(await p.locator('#inpEditPop:visible').count())) { await W5.sansDay(p, W, iso); await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add'); await p.waitForSelector('#inpEditPop'); await p.selectOption('#inpEditPerson', ID.Jester).catch(() => {}) }
  })
  const e = await emptySave(p, W, 'tk')
  chk(W, 'tk.refuse', `F23 / S2: every box unticked, Save — refused "${REF}"`, e.all.includes(REF) && (e.stayed || e.saveGreyed), J({ words: e.words, toast: e.toast, save: e.form.save, stayed: e.stayed }), e.pic)
  await closeForm(p, W)
  /* F24: only the middle box — OFT */
  const fo = await fileS(p, W, iso, ID.Jester, ['oft'], 'all')
  Z.need(W, 'tk.oft', 'Jester filed with only the middle box (OFT) ticked, all day, Thu 16', !!fo.iid, fo.refused)
  chk(W, 'tk.oft-saved', 'F24: the middle box saved OFT (the record carries O only)', fo.made && J(Object.keys(fo.made.sans || {}).filter(k => fo.made.sans[k])) === J(['o']), J(fo.made && fo.made.sans))
  const day = await sansDayRows(p, W, iso)
  rec(W, 'tk.oft-day', 'F24: the SANS calendar\'s Thu 16 window — Jester\'s line', day)
  const ln = await Z.mkLine(p, W, DI, { cs: 'VX', msn: 'BFM', to: '19:00', ld: '20:00' })
  const ar = await arm(p, W, 'B', DI, `[data-slot="${ln.fcp}"]`, { now: true, tag: 'tk-oft' })
  let sec = await readSec(p, 'B'); let spic = await secPic(p, W, 'B', 'tk-oft-crew')
  let j = rowOf(sec, ID.Jester)
  chk(W, 'tk.oft-crew', 'F24: armed on a flying seat, Jester\'s letter "O", struck "SANS — offered OFT only, not Fly"', j && j.struck && j.why === 'SANS — offered OFT only, not Fly' && /^O\b/.test(j.badge), `armed ${ar.armed} · ${rowSay(j)}`, pics(spic, ar.now))
  await unarm(p, W, 'B')
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const card = await p.evaluate(([i, id]) => { const c = [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] .sanscard`)].find(e => e.querySelector(`.puck[data-person="${id}"]`)); return c ? (c.textContent || '').replace(/\s+/g, ' ').trim() : 'no card' }, [DI, ID.Jester])
  rec(W, 'tk.oft-card', 'F24: his SANS card on Edit Schedule\'s Thu 16', card)
  /* reopen: the same box ticked */
  const reopen = async (iid, tag) => { await W5.sansDay(p, W, iso); await W.press(p, `[data-testid="win-sansday"] [data-popiid="${iid}"] [data-testid="sd-open"]`, 'sd-open'); await p.waitForSelector('#inpEditPop', { timeout: 6000 }); await sleep(300); const f = await formRead(p); const pc = await crop(p, W, ['#inpEditSans'], tag, 16); return { f, pc } }
  let ro = await reopen(fo.iid, 'tk-oft-reopen')
  chk(W, 'tk.oft-reopen', 'F24: reopened — only OFT ticked, boxes Fly · OFT · AMT', J(ro.f.ticked) === J(['OFT']) && orderOk(ro.f), J(ro.f), ro.pc)
  await closeForm(p, W)
  /* F24 the third box only — AMT — for Kraken */
  const fa = await fileS(p, W, iso, ID.Kraken, ['amt'], 'all')
  chk(W, 'tk.amt-saved', 'F24: only the third box (AMT) saved A for Kraken', fa.made && J(Object.keys(fa.made.sans || {}).filter(k => fa.made.sans[k])) === J(['a']), J(fa.made && fa.made.sans))
  await arm(p, W, 'B', DI, `[data-slot="${ln.fcp}"]`)
  sec = await readSec(p, 'B'); spic = await secPic(p, W, 'B', 'tk-amt-crew')
  const k = rowOf(sec, ID.Kraken)
  chk(W, 'tk.amt-crew', 'F24: Kraken\'s letter "A", struck "SANS — offered AMT only, not Fly"', k && k.struck && k.why === 'SANS — offered AMT only, not Fly' && /^A\b/.test(k.badge), rowSay(k), spic)
  await unarm(p, W, 'B')
  ro = await reopen(fa.iid, 'tk-amt-reopen')
  chk(W, 'tk.amt-reopen', 'F24: reopened — only AMT ticked', J(ro.f.ticked) === J(['AMT']), J(ro.f), ro.pc)
  await closeForm(p, W)
  /* S2: every combination on Jester's filing */
  const combos = [[['amt'], ['AMT'], 'A'], [['fly', 'oft'], ['Fly', 'OFT'], 'F/O'], [['fly', 'amt'], ['Fly', 'AMT'], 'F/A'], [['oft', 'amt'], ['OFT', 'AMT'], 'O/A'], [['fly', 'oft', 'amt'], ['Fly', 'OFT', 'AMT'], 'F/O/A']]
  for (const [kinds, ticks, letters] of combos) await step(W, 's2.' + letters, async () => {
    const r = await editS(p, W, iso, fo.iid, { kinds })
    const o = await reopen(fo.iid, 's2-' + letters.replace(/\//g, ''))
    await closeForm(p, W)
    const dayL = await sansDayRows(p, W, iso)
    chk(W, 's2.' + letters, `S2: changed to ${ticks.join(' + ')} — saved, reopened with exactly those ticked; letters "${letters}"`, J(o.f.ticked) === J(ticks) && lettersOf(dayL, 'Jester') === letters.split('/').join(''), `now ${J(r.now && r.now.sans)} · reopened ${J(o.f.ticked)} · day ${dayL}`, o.pc)
  })
  await step(W, 's2.cancel', async () => {
    await W5.sansDay(p, W, iso); await W.press(p, `[data-testid="win-sansday"] [data-popiid="${fo.iid}"] [data-testid="sd-open"]`, 'sd-open'); await p.waitForSelector('#inpEditPop'); await sleep(300)
    await setKinds(p, W, ['oft'])
    /* lesson 19: the form over the day window closed by its own ✕ — the form gone, the day window still there */
    const x = p.locator('[data-testid="win-inputedit-x"]:visible').first()
    if (await x.count()) await W.press(p, x, 'x')
    const g = p.locator('[data-testid="inped-escask-go"]:visible').first(); const asked = await g.count()
    if (asked) await W.press(p, g, 'discard')
    await sleep(400)
    const st = { form: await p.locator('#inpEditPop:visible').count(), day: await p.locator('[data-testid="win-sansday"]:visible').count(), asked }
    chk(W, 's2.close', 'lesson 19: the edit form (over the SANS day window) closed by its ✕ (the discard question answered) — the form gone, the day window under it still there', !st.form && st.day, J(st), await W.pic(p, 's2-closed'))
    await closeForm(p, W)
    const o = await reopen(fo.iid, 's2-cancel')
    await closeForm(p, W)
    chk(W, 's2.cancel', 'S2: an edit to OFT only cancelled (✕, discard) — reopened, the previous offer (all three) kept', J(o.f.ticked) === J(['Fly', 'OFT', 'AMT']), J(o.f.ticked), o.pc)
  })
}

/* F25 + S2 — every door to the form: the order and the refusal in each */
SC.doors = async (p, W) => {
  const DI = 3, iso = ISO[DI]
  const fo = await fileS(p, W, iso, ID.Jester, ['oft'], 'all')
  Z.need(W, 'dr.file', 'Jester filed OFT, all day, Thu 16 (a record for the edit doors)', !!fo.iid, fo.refused)
  const doors = [
    ['commit', '"+ Commitment" on the SANS day window', async () => { await W5.sansDay(p, W, iso); await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add') }],
    ['dayline', 'his line on the SANS day window (edit)', async () => { await W5.sansDay(p, W, iso); await W.press(p, `[data-testid="win-sansday"] [data-popiid="${fo.iid}"] [data-testid="sd-open"]`, 'sd-open') }],
    ['boardadd', 'the board\'s SANS panel "+ Add"', async () => { await L.openBoard(p, W, DI); await W.press(p, L.B(`[data-inpadd="${DI}.s"]`), 'sans-add') }],
    ['boardcard', 'his SANS card on the board (edit)', async () => { await L.openBoard(p, W, DI); await W.press(p, p.locator(`#schedBoard .sanscard[data-inpedit]:visible`).filter({ has: p.locator(`.puck[data-person="${ID.Jester}"]`) }).first(), 'bcard') }],
    ['weekcard', 'his SANS card on Edit Schedule\'s week (edit)', async () => { await L.closeBoard(p, W); await L.go(p, 'editsched'); const c = p.locator(`#eWeek .day[data-day="${DI}"] .sanscard[data-inpedit]`).filter({ has: p.locator(`.puck[data-person="${ID.Jester}"]`) }).first(); await c.scrollIntoViewIfNeeded(); await W.press(p, c, 'wcard') }],
  ]
  for (const [k, what, open] of doors) await step(W, 'dr.' + k, async () => {
    await T.closeAll(p, W)
    await open()
    await p.waitForSelector('#inpEditPop', { timeout: 6000 }); await sleep(400)
    if (k === 'commit' || k === 'boardadd') await p.selectOption('#inpEditPerson', ID.Kraken).catch(() => {})
    const f = await formRead(p)
    const fp = await crop(p, W, ['#inpEditSans'], 'dr-' + k, 16)
    const e = await emptySave(p, W, 'dr-' + k)
    chk(W, 'dr.' + k, `F25 / S2 door: ${what} — boxes Fly · OFT · AMT, and every box unticked is refused "${REF}"`, orderOk(f) && e.all.includes(REF), `opened ticked ${J(f.ticked)} · type ${f.type} · refusal ${J({ words: e.words, toast: e.toast, save: e.form.save })}`, pics(fp, e.pic))
    await closeForm(p, W)
    const still = await T.inp(p, fo.iid)
    if (/card|line/.test(k)) chk(W, 'dr.' + k + '-kept', 'the refused edit changed nothing: his filing still OFT', still && J(still.sans) === J({ o: true }), J(still && still.sans))
  })
  /* the Inputs page's List (SANS) — a row's edit */
  await step(W, 'dr.list', async () => {
    await T.closeAll(p, W); await L.go(p, 'inputs')
    /* the SANS mode has no List (dev2's picture): the List is the Inputs mode's, which lists every input */
    if (await p.locator('#inMemberMode:visible').count()) await W.press(p, '#inMemberMode:visible', 'inputs-mode')
    if (await p.locator('#inListBtn:visible').count()) await W.press(p, '#inListBtn:visible', 'list')
    await sleep(800)
    const row = p.locator(`#page-inputs [data-iid="${fo.iid}"]`).first()
    if (await row.count()) await row.scrollIntoViewIfNeeded().catch(() => {})
    const pic0 = await W.pic(p, 'dr-list')
    if (!(await row.count())) { rec(W, 'dr.list', 'F25 door: the Inputs page\'s list row (SANS) — not found', 'no row for Jester\'s filing drawn on the List', pic0); return }
    const b = row.locator('button').first()
    await W.press(p, (await b.count()) ? b : row, 'list-row'); await sleep(600)
    if (!(await p.locator('#inpEditPop:visible').count())) { rec(W, 'dr.list', 'F25 door: the Inputs list row pressed', 'the form did not open', await W.pic(p, 'dr-list-press')); return }
    const f = await formRead(p)
    const e = await emptySave(p, W, 'dr-list')
    chk(W, 'dr.list', `F25 door: the Inputs page's list row (edit) — boxes Fly · OFT · AMT, refusal "${REF}"`, orderOk(f) && e.all.includes(REF), `ticked ${J(f.ticked)} · ${J({ words: e.words, toast: e.toast })}`, pics(pic0, e.pic))
    await closeForm(p, W)
  })
  /* a tap on a SANS calendar day — what opens (the day window) */
  await step(W, 'dr.daytap', async () => {
    await T.closeAll(p, W)
    await W5.sansTab(p, W, iso)
    await W.press(p, `[data-testid="sc-day-${ISO[4]}"]`, 'sc-day')
    await sleep(700)
    const open = { day: await p.locator('[data-testid="win-sansday"]:visible').count(), form: await p.locator('#inpEditPop:visible').count() }
    rec(W, 'dr.daytap', 'F25 door: a tap on a SANS calendar day (Fri 17) — what opens (RECORD: the day window, whose "+ Commitment" is the first door)', J(open), await W.pic(p, 'dr-daytap'))
    await T.closeAll(p, W)
  })
  /* the member's own filing: Ranger (SANS from Fri 17) files for himself */
  await step(W, 'dr.member', async () => {
    /* Ranger is SANS only once posted (dev2: his + Commitment greyed) — posted SANS from Fri 17 by the Leave War's own controls */
    const po = await B.postR(p, W, 'dr.post')
    rec(W, 'dr.post', 'Ranger posted SANS from Fri 17 (the Leave War\'s posting controls)', J(po).slice(0, 300))
    await asR(p, W)
    await W5.sansDay(p, W, ISO[4])
    const add = p.locator('[data-testid="win-sansday"] [data-testid="sd-add"]').first()
    if (await add.isDisabled().catch(() => true)) { rec(W, 'dr.member', 'Ranger\'s own "+ Commitment" on Fri 17', 'greyed: ' + clean(await p.locator('[data-testid="sd-addwhy"]').first().textContent().catch(() => '')), await W.pic(p, 'dr-member-grey')); await asS(p, W); return }
    await W.press(p, add, 'sd-add'); await p.waitForSelector('#inpEditPop'); await sleep(400)
    const f = await formRead(p)
    const fp = await crop(p, W, ['#inpEditSans'], 'dr-member', 16)
    const e = await emptySave(p, W, 'dr-member')
    chk(W, 'dr.member', `F25 / S2 door: Ranger (member) filing his own — boxes Fly · OFT · AMT, refusal "${REF}"`, orderOk(f) && e.all.includes(REF), `person ${f.person} · ticked ${J(f.ticked)} · ${J({ words: e.words, toast: e.toast, save: e.form.save })}`, pics(fp, e.pic))
    await closeForm(p, W)
    const mf = await fileS(p, W, ISO[4], null, ['oft'], 'all')
    rec(W, 'dr.member-save', 'Ranger saves OFT for himself, then edits it to OFT + AMT', `made ${J(mf.made && mf.made.sans)} ${mf.refused || ''}`)
    if (mf.iid) { const ed = await editS(p, W, ISO[4], mf.iid, { kinds: ['oft', 'amt'] }); const dl = await sansDayRows(p, W, ISO[4]); chk(W, 'dr.member-edit', 'S2 member: his own edit saved as OFT + AMT, letters "O/A"', ed.now && J(ed.now.sans) === J({ o: true, a: true }) && lettersOf(dl, 'Ranger') === 'OA', `${J(ed.now && ed.now.sans)} · ${dl}`) }
    await asS(p, W)
  })
}

/* F26 — the phone form: the three boxes in a row, nothing covered by Cancel / Add; Remarks tapped (phone only) */
SC.form = async (p, W) => {
  if (!W.isPhone) { rec(W, 'fm.skip', 'F26 is a phone scenario', 'desktop: not walked here'); return }
  await W5.sansDay(p, W, ISO[3])
  await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add'); await p.waitForSelector('#inpEditPop'); await sleep(500)
  const geo = () => p.evaluate(() => {
    const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), b: Math.round(b.bottom) } }
    const vis = e => e && e.getBoundingClientRect().width > 0
    const labs = [...document.querySelectorAll('#inpEditSans label')].map(r)
    const btns = [...document.querySelectorAll('#inpEditPop button')].filter(e => vis(e) && /^(Cancel|Add|Save|Done)/.test(e.textContent.trim())).map(e => ({ t: e.textContent.trim(), ...r(e) }))
    const rmk = r(document.querySelector('#inpEditRmk'))
    const hit = labs.map(l => { const e = document.elementFromPoint((l.l + l.r) / 2, (l.t + l.b) / 2); return e ? (e.closest('#inpEditSans') ? 'box' : e.tagName + '.' + String(e.className).slice(0, 30)) : 'none' })
    const over = (a, b) => a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b
    return { labs, btns, rmk, hit, oneRow: new Set(labs.map(l => l.t)).size === 1, rmkCovered: btns.filter(b => over(b, rmk)).map(b => b.t), boxCovered: labs.filter(l => btns.some(b => over(b, l))).length, vh: innerHeight, vw: innerWidth }
  })
  await p.locator('#inpEditSans').scrollIntoViewIfNeeded()
  const g1 = await geo()
  const pic1 = await W.pic(p, 'fm-open')
  chk(W, 'fm.row', 'F26: on the phone the three boxes Fly · OFT · AMT in one row (or a clean wrap), each box the topmost thing at its middle, none under Cancel / Add', g1.labs.length === 3 && g1.hit.every(h => h === 'box') && !g1.boxCovered, J(g1), pic1)
  await setKinds(p, W, ['oft', 'amt'])
  const now = await B.nowPic(p, W, 'fm-ticked')
  const f = await formRead(p)
  chk(W, 'fm.ticks', 'F26: tapped OFT and AMT (Fly off) — ticked as tapped', J(f.ticked) === J(['OFT', 'AMT']), J(f), now)
  const rm = p.locator('#inpEditRmk').first()
  if (await rm.count()) {
    await rm.tap(); const n2 = await B.nowPic(p, W, 'fm-rmk'); await sleep(500)
    const g2 = await geo()
    chk(W, 'fm.rmk', 'F26: Remarks tapped — the box in the screen and not under Cancel / Add (the test browser raises no keyboard: the iPhone\'s keys are his look, lesson 5)', g2.rmk && g2.rmk.t >= 0 && g2.rmk.b <= g2.vh && !g2.rmkCovered.length, J({ rmk: g2.rmk, covered: g2.rmkCovered, btns: g2.btns, vh: g2.vh }), pics(n2, await W.pic(p, 'fm-rmk')))
    await rm.fill('walk B remark')
  }
  await p.selectOption('#inpEditPerson', ID.Jester).catch(() => {})
  await W.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
  const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) await nd.first().click().catch(() => {})
  const day = await sansDayRows(p, W, ISO[3])
  chk(W, 'fm.saved', 'F26: saved from the phone — the SANS day reads Jester "O/A"', lettersOf(day, 'Jester') === 'OA', day, await W.pic(p, 'fm-saved'))
}

/* F30 + F31 + F40 + S17 — the amber A's words on every copy; the Logic page; the Legend; the member; nothing from ground,
   duty or standby */
SC.amber = async (p, W) => {
  const DI = 4
  const titles = (p, scope, id) => p.evaluate(([s, who]) => [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => { const c = [...e.querySelectorAll('.lchip')].find(x => x.textContent.trim() === 'A'); const z = e.closest('[data-slot],[data-fill]'); return { where: e.closest('.rpuck, .sb-ros') ? 'crew list' : e.closest('.sanscard') ? 'SANS card' : z ? (z.dataset.slot || z.dataset.fill) : 'other', chip: c ? c.getAttribute('title') : null, puck: e.getAttribute('title') || '' } }), [scope, id])
  const tSay = ts => ts.map(x => `${x.where}: chip ${x.chip == null ? 'none' : '"' + x.chip + '"'} · puck "${x.puck}"`).join(' || ')
  const aOk = ts => ts.length && ts.every(x => x.chip === AWORDS && x.puck.includes(' · SANS · ' + AWORDS))
  /* (a) Marlin, nothing filed, on an OFT EP-9 10:00–11:00 rear seat (S17's case) */
  const s = await W5.addSim(p, W, DI, 'oft', 'EP-9', '10:00', '11:00')
  const t = await plant(p, W, DI, seatW(DI, 'oft', s.ri), ID.Marlin, 'am-a')
  Z.need(W, 'am.a', 'Marlin (SANS WSO, nothing filed) in OFT EP-9 10:00–11:00\'s rear seat', t.placed, `"${t.toast}"`)
  /* (b) Pixel filed Fly 08:00–12:00, on a flight at 15:00 */
  const fp = await fileS(p, W, ISO[DI], ID.Pixel, ['fly'], ['08:00', '12:00'])
  const l1 = await Z.mkLine(p, W, DI, { cs: 'VL', msn: 'BFM', to: '15:00', ld: '16:00' })
  const t2 = await plant(p, W, DI, l1.rcp, ID.Pixel, 'am-b')
  Z.need(W, 'am.b', 'Pixel (filed Fly 08:00–12:00) on VL BFM T/O 15:00 rear seat', fp.iid && t2.placed, `"${t2.toast}"`)
  /* (c) Hunter (not SANS, an IP; Nomad sits on overseas duty all week — run dev3; Ryder, a C, is a qual fault in the SC front seat — run1 phone) on an SC standby seat (AM 07:00–13:00) and a ground row 09:00–10:00 */
  await L.openBoard(p, W, DI)
  await W.press(p, L.B(`[data-wvadd="${DI}"]`), 'wvadd'); await W.press(p, '.wm.sa[data-wmkind="sc"]:visible', 'sc'); await sleep(700)
  const scw = await p.evaluate(i => window.DAYS[i].waves.findIndex(w => w.kind === 'sc'), DI)
  const t3 = await plant(p, W, DI, `${DI}.${scw}.0.0.p`, ID.Hunter, 'am-c-sc')
  await L.openBoard(p, W, DI)
  const g = await L.groundRow(p, W, DI, 'SA208 GROUND', '09:00', '10:00', ID.Hunter)
  Z.need(W, 'am.c', 'Hunter (not SANS) on the SC AM standby seat and on a ground row SA208 GROUND 09:00–10:00', t3.placed && g.row && JSON.stringify(g.row.who || '').includes(ID.Hunter), `"${t3.toast}" · ${J(g.row)}`)
  /* the words on every copy: board, week, the crew list, the sim seat, the SANS card */
  await L.openBoard(p, W, DI); await W5.boardDrawer(p, W, true)
  const bA = await titles(p, '#schedBoard', ID.Marlin), bB = await titles(p, '#schedBoard', ID.Pixel), bC = await titles(p, '#schedBoard', ID.Hunter)
  const bpic = await W.pic(p, 'am-board')
  await W5.boardDrawer(p, W, false); await L.closeBoard(p, W); await L.go(p, 'editsched')
  const wk = id => p.evaluate(([i, who]) => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] .puck[data-person="${who}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => { const c = [...e.querySelectorAll('.lchip')].find(x => x.textContent.trim() === 'A'); const z = e.closest('[data-slot],[data-fill]'); return { where: e.closest('.sanscard') ? 'SANS card' : z ? (z.dataset.slot || z.dataset.fill) : 'other', chip: c ? c.getAttribute('title') : null, puck: e.getAttribute('title') || '' } }), [DI, id])
  const wA = await wk(ID.Marlin), wB = await wk(ID.Pixel), wC = await wk(ID.Hunter)
  const withA = ts => ts.filter(x => x.chip != null)
  chk(W, 'am.f30a', `F30(a) / S17: Marlin's A (nothing filed) — the chip's hover and the puck's hover after "· SANS ·" read "${AWORDS}", on every copy that wears it (board seat, crew list, week)`, aOk(withA([...bA, ...wA])) && withA(bA).some(x => x.where === 'crew list') && withA(bA).some(x => /oft/.test(x.where)), tSay([...bA, ...wA]), bpic)
  chk(W, 'am.f30b', 'F30(b): Pixel\'s A (planned outside his hours) — the same words, every copy (seat, crew list, week, his SANS card)', aOk(withA([...bB, ...wB])) && withA([...bB, ...wB]).length >= 2, tSay([...bB, ...wB]))
  const cA = withA([...bC, ...wC])
  chk(W, 'am.f30c', 'F30(c): Hunter\'s A (not SANS, on shift and down for a ground event) — the chip reads the same words; his puck\'s hover has no "· SANS ·" but the same A words', cA.length && cA.every(x => x.chip === AWORDS && x.puck.includes(AWORDS) && !x.puck.includes(' · SANS · ')), tSay([...bC, ...wC]))
  /* a desktop hover over the chip: the hover words are the chip's own title (the browser's tooltip is not pictured) */
  if (!W.isPhone) await step(W, 'am.hover', async () => {
    const chip = p.locator(`#eWeek .day[data-day="${DI}"] .puck[data-person="${ID.Marlin}"] .lchip`).first()
    await chip.scrollIntoViewIfNeeded(); await chip.hover(); await sleep(600)
    const h = await p.evaluate(() => { const e = document.querySelector(':hover:not(html):not(body)'); const all = [...document.querySelectorAll(':hover')].pop(); return all ? (all.getAttribute('title') || all.closest('[title]') && all.closest('[title]').getAttribute('title')) : '' })
    chk(W, 'am.hover', 'F30: the mouse over Marlin\'s small A on the week — the element under it carries the new words', h === AWORDS, `"${h}"`, await crop(p, W, [`#eWeek .day[data-day="${DI}"] .puck[data-person="${ID.Marlin}"]`], 'am-hover', 30))
  })
  /* the Legend, unchanged */
  await step(W, 'am.legend', async () => {
    await L.go(p, 'editsched'); await p.evaluate(() => scrollTo(0, 0))
    const lg = p.locator('summary.legend-sum:visible').first()
    if (!(await lg.count())) { rec(W, 'am.legend', 'the Legend', 'no Legend fold drawn at this size', await W.pic(p, 'am-nolegend')); return }
    await W.press(p, lg, 'legend'); await sleep(500)
    const words = await p.evaluate(() => [...document.querySelectorAll('.qk')].filter(e => e.textContent.trim() === 'A' && e.getBoundingClientRect().width > 0).map(e => (e.parentElement.textContent || '').replace(/\s+/g, ' ').trim()))
    /* the Legend's own "A" key (another .qk reads "A" too — run dev3 read "AA": the "A" level chip's key; only the advisory line is judged) */
    const adv = words.filter(w => /advisory/i.test(w))
    chk(W, 'am.legend', `F30 / S17: the week's Legend keeps "A ${LEGEND}"`, adv.length && adv.every(w => w === 'A' + LEGEND), J(words), await crop(p, W, ['details[open]'], 'am-legend', 8) || await W.pic(p, 'am-legend'))
    await W.press(p, lg, 'legend-shut')
  })
  /* F31: the Logic page's flag row */
  await step(W, 'am.logic', async () => {
    await L.go(p, 'logic'); await sleep(500)
    const r = await p.evaluate(() => { const a = [...document.querySelectorAll('.lgc')].find(e => /^A/.test(e.textContent.trim())); if (!a) return null; a.scrollIntoView({ block: 'center' }); const b = a.getBoundingClientRect(); return { t: a.textContent.replace(/\s+/g, ' ').trim(), w: Math.round(b.width), shown: b.width > 0, inScreen: b.left >= 0 && b.right <= innerWidth } })
    let pic = ''
    if (r && !r.shown) { /* folded: open the row's own fold ("Several problems on one puck") */
      const f = p.locator('text=Several problems on one puck').first(); if (await f.count()) { await f.scrollIntoViewIfNeeded(); await W.press(p, f, 'logic-puck'); await sleep(400) }
    }
    const r2 = await p.evaluate(() => { const a = [...document.querySelectorAll('.lgc')].find(e => /^A/.test(e.textContent.trim())); if (!a) return null; a.scrollIntoView({ block: 'center' }); const b = a.getBoundingClientRect(); return { t: a.textContent.replace(/\s+/g, ' ').trim(), w: Math.round(b.width), shown: b.width > 0, inScreen: b.left >= -0.5 && b.right <= innerWidth + 0.5 } })
    await sleep(300); pic = await crop(p, W, ['.lgchips'], 'am-logic', 10) || await W.pic(p, 'am-logic')
    chk(W, 'am.logic', `F31: Admin → Logic, the flag row — A carries the new words "${AWORDS}"`, r2 && r2.t === 'A' + AWORDS && r2.shown, J(r2), pic)
    await L.go(p, 'editsched')
  })
  /* F31 phone: a tap on the small A — what shows (no hover on a phone) */
  if (W.isPhone) await step(W, 'am.phonetap', async () => {
    await L.go(p, 'editsched')
    const chip = p.locator(`#eWeek .day[data-day="${DI}"] .puck[data-person="${ID.Marlin}"]`).first()
    await chip.scrollIntoViewIfNeeded()
    const c0 = await p.evaluate(() => window.CURPAGE)
    await chip.tap(); const n = await B.nowPic(p, W, 'am-tapA'); await sleep(700)
    const after = { page: await p.evaluate(() => window.CURPAGE), board: !!(await p.locator('#schedBoard').count()), toast: await L.toastSaid(p), pop: await p.evaluate(() => [...document.querySelectorAll('.popover, .tip, [role="tooltip"], .pkpop, #pkPop')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 200))) }
    rec(W, 'am.phonetap', 'F31 phone: no hover — a tap on Marlin\'s puck on the week: where, if anywhere, the A\'s words show (RECORD)', `from ${c0} · ${J(after)}`, pics(n, await W.pic(p, 'am-tapA')))
    await L.closeBoard(p, W)
  })
  /* F40: a member on the published day — no scheduler note; the A's words, where drawn, the new ones */
  await step(W, 'am.member', async () => {
    await L.openBoard(p, W, DI); await L.publish(p, W, DI); await L.closeBoard(p, W)
    await asR(p, W)
    await L.go(p, 'viewsched')
    const n0 = await L.toastSaid(p)
    const v = await p.evaluate(i => [...document.querySelectorAll(`#vWeek .day[data-day="${i}"] .puck`)].filter(e => e.getBoundingClientRect().width > 0 && e.querySelector('.lchip')).map(e => ({ who: e.dataset.person, chip: [...e.querySelectorAll('.lchip')].map(c => c.textContent.trim() + '=' + c.getAttribute('title')).join(','), puck: e.getAttribute('title') })), DI)
    const vA = v.filter(x => /^A=/.test(x.chip))
    const pic = await Z.listPic(p, W, '#vWeek', DI, 'am-member')
    chk(W, 'am.f40', 'F40: as Ranger (member) on the published Fri 17 — no note shown to him; every A drawn carries the new words', !/SANS — /.test(n0) && vA.every(x => x.chip === 'A=' + AWORDS), `note "${n0}" · A pucks ${J(vA.map(x => x.who + ': ' + x.chip.slice(0, 40) + '… / ' + x.puck))} · all chips ${J(v.map(x => x.who + ':' + x.chip.slice(0, 3)))}`, pic)
    rec(W, 'am.f40-shown', 'F40: which A chips a member sees on View-only Sched (RECORD)', vA.length ? vA.map(x => x.who).join(', ') : 'none drawn for him', pic)
    await asS(p, W)
  })
  /* S17: covering OFT filed for Marlin — his A goes */
  await step(W, 'am.s17-cover', async () => {
    const f = await fileS(p, W, ISO[DI], ID.Marlin, ['oft'], 'all')
    await L.openBoard(p, W, DI)
    const ts = await titles(p, '#schedBoard', ID.Marlin)
    const r = await sl(p, W, DI, 'Marlin', 'am-s17-cover')
    chk(W, 'am.s17-cover', 'S17: OFT filed all day for Marlin — his SANS line and his A gone', f.iid && !r.mine.length && !ts.some(x => x.chip != null), `${say(r.mine)} · ${tSay(ts)}`, r.pic)
  })
}

/* S17 — ground, duty and standby alone raise nothing for a SANS man */
SC.quiet = async (p, W) => {
  const DI = 4
  await L.openBoard(p, W, DI)
  const g = await L.groundRow(p, W, DI, 'SA208 GROUND', '14:00', '15:00', ID.Marlin)
  const duty = await p.evaluate(i => { const e = [...document.querySelectorAll(`#schedBoard [data-fill^="d:${i}."]`)].find(x => x.getBoundingClientRect().width > 0); return e ? e.dataset.fill : null }, DI)
  const dp = duty ? await Z.place(p, W, DI, `[data-fill="${duty}"]`, 'qt-duty', ID.Marlin) : { placed: false, toast: 'no duty desk place drawn' }
  await L.openBoard(p, W, DI)
  const made = {}
  for (const k of ['sc', 'avalon', 'bb']) {
    await W.press(p, L.B(`[data-wvadd="${DI}"]`), 'wvadd'); await W.press(p, `.wm.sa[data-wmkind="${k}"]:visible`, k); await sleep(700)
    made[k] = await p.evaluate(([i, kk]) => window.DAYS[i].waves.map((w, n) => w.kind === kk ? n : -1).filter(n => n >= 0).pop(), [DI, k])
  }
  const tries = [['SC MAIN', `${DI}.${made.sc}.0.0.w`], ['SC SPARE', `${DI}.${made.sc}.0.2.w`], ['AVALON', `${DI}.${made.avalon}.0.0.w`], ['BB', `${DI}.${made.bb}.0.0.w`]]
  const res = []
  for (const [nm, key] of tries) { const t = await plant(p, W, DI, key, ID.Marlin, 'qt-' + nm.replace(/\s/g, '')); res.push(`${nm} (${key}): placed ${t.placed} note "${t.toast}"`) }
  rec(W, 'qt.plants', 'S17: Marlin (SANS, nothing filed) on a ground row 14:00–15:00, a duty desk and SC MAIN / SC SPARE / AVALON / BB', `ground ${J(g.row)} · duty ${duty} placed ${dp.placed} "${dp.toast}" · ${res.join(' · ')}`)
  const r = await sl(p, W, DI, 'Marlin', 'qt-list')
  await L.openBoard(p, W, DI)
  const chips = await p.evaluate(id => [...document.querySelectorAll(`#schedBoard .puck[data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0 && !e.closest('.rpuck')).map(e => [...e.querySelectorAll('.lchip')].map(c => c.textContent.trim()).join('')), ID.Marlin)
  chk(W, 'qt.none', 'S17: ground, duty and standby alone — no SANS line for Marlin, and no "A" chip on his pucks', !r.mine.length && !chips.some(c => c.includes('A')), `${say(r.mine)} · his chips ${J(chips)} · every line of his ${J(r.l.lines.filter(x => /Marlin/.test(x.text)).map(x => x.text))}`, pics(r.pic, await W.pic(p, 'qt-board')))
}

const ALL = ['f14', 'tab', 'amt', 'names', 'names2', 'fam', 'fly', 'hide', 'places', 'extra', 'two', 'ticks', 'doors', 'form', 'amber', 'quiet']
const only = (process.env.ONLY || '').split(',').filter(Boolean)
for (const n of ALL.filter(n => !only.length || only.includes(n))) {
  console.log('=== SCENARIO', n, SZ)
  await T.run(n, SZ, Z.scene(SC[n]))
}
mkdirSync(OUT, { recursive: true })
writeFileSync(path.join(OUT, `results-all-${SZ}${only.length ? '-' + only.join('_') : ''}.json`), JSON.stringify(L.results, null, 1))
console.log('DONE', SZ)
process.exit(0)
