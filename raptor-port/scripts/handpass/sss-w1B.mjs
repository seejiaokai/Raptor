// sss-w1B — walker B of the standby / untimed-sim walk (his D2584 Q4/Q5, D2585, D2586, D2587), chat 182, 25 Nov 26:
// F5/A10 (+F4's bell part), F6/A1, F7/A2, F8/A3, F9/A4, F10/A5/A6 (+N9), F15/A18, F18/A8 (+N11), F19/A7, A20 (+N6, N1),
// N5/N7, N8, N10 (read in every note and warning list) and the plain-user round (F23). Each scenario a fresh browser world,
// Saber signed in, clock started 15 Jul 2026 09:00 and left running. Brief: docs/superpowers/briefs/2026-11-25-sans-standby-sim-walk-brief.md
// Run from raptor-port/:  SZ=d|p SSSB_RUN=run1 [ONLY=f5,f6] node scripts/handpass/sss-w1B.mjs
import './sss-w1B-env.mjs'
import { writeFileSync } from 'node:fs'
const Z = await import('./sss-w1B-lib.mjs')
const { Y, K, X, T, L, W5, A, RANGER, IPMAN, MARLIN, D, WK1, WK2, J, sleep, need, asR, asS, bell, sayB, tapAndRead, OUT, path,
  postR, listOf, meSay, blank, fileFor, armE, disarmE, seatHas, disarm, R17N, TODAYW, remDays, armAt, look, pickNow, place, dayHold,
  seated, seatSay, ambered, sansWords, noSans, printed, struckW, sayRJ, setBox, formOf, flies, rBell, rings, idOf, lineDel, simDel, boardUndo } = Z
const SZ = process.env.SZ || 'd'
console.log('VERSION sss-w1B 1 · size', SZ, '· run', process.env.SSSB_RUN || 'run1', '· only', process.env.ONLY || 'all')
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const TOLD = /told on his bell/i
const slot = k => `[data-slot="${k}"]`
const fill = k => `[data-fill="${k}"]`
/* the warning list and the seated pucks of a day, read together (lesson 32: the three surfaces side by side) */
async function state(p, W, di, tag, ids = [RANGER]) {
  const w = await A.warns(p, W, di, tag)
  await L.openBoard(p, W, di)
  const s = {}
  for (const id of ids) s[id] = await seated(p, id)
  return { w, s, say: `${A.warnSay(w)} · seated: ${ids.map(id => (id === RANGER ? 'Ranger ' : id === IPMAN ? 'Jester ' : id + ' ') + seatSay(s[id])).join(' / ')}` }
}
const told = st => TOLD.test(st.w.rows.join(' '))

const SC = {}

/* F5 = A10 (+ F4's bell part, N12) — an untimed OFT and AMT strike a SANS man with nothing filed at every place; the warning
   list stays quiet; his bell counts the day */
SC.f5 = async (p, W) => {
  await postR(p, W, 'f5.post')
  const o = await W5.addSim(p, W, 5, 'oft', 'B OFT', '', '')
  const m = await W5.addSim(p, W, 6, 'amt', 'B AMT', '', '')
  need(W, 'f5.rows', 'an OFT row on Sat 18 and an AMT row on Sun 19 through "+", no times typed (read back)', !o.r.str && !o.r.end && !m.r.str && !m.r.end, `OFT ${J(o.r)} · AMT ${J(m.r)}`)
  for (const [di, kind, ri] of [[5, 'oft', o.ri], [6, 'amt', m.ri]]) {
    for (const pl of ['p', 'w', '+']) {
      const k = `s:${di}.${kind}.${ri}.${pl}`
      const r = await look(p, W, di, pl === '+' ? fill(k) : slot(k), `f5-${kind}-${pl === '+' ? 'x' : pl}`)
      const nm = { p: 'front seat', w: 'rear seat', '+': 'extra place ("+ add")' }[pl]
      chk(W, `f5.${kind}-${pl}`, `untimed ${kind.toUpperCase()} ${nm} armed: Ranger struck "${R17N}" (D2584 Q5, D2586, D2587); Jester struck "${TODAYW}" (letter for letter a flight's, N12)`, r.armed && struckW(r.ls[RANGER], R17N) && struckW(r.ls[IPMAN], TODAYW), sayRJ(r), r.pic)
    }
  }
  /* Edit Schedule's crew panel with the week's sim rows picked (the week draws each as one "+ add") */
  for (const [kind, ri] of [['oft', o.ri], ['amt', m.ri]]) {
    const di = kind === 'oft' ? 5 : 6
    const e = await Z.armEAt(p, W, WK1, fill(`s:${di}.${kind}.${ri}.+`), `f5-e-${kind}`)
    chk(W, `f5.e-${kind}`, `Edit Schedule, the week's untimed ${kind.toUpperCase()} row picked: Ranger struck "${R17N}", Jester "${TODAYW}"`, e.armed && struckW(e.ls[RANGER], R17N) && struckW(e.ls[IPMAN], TODAYW), `armed ${e.armed} · ${e.day} · ${sayRJ(e)}`, e.pic)
  }
  /* F4: the extra place proper — both seats taken first, so "+ add" lands in the row's extras */
  const ace = await idOf(p, 'Ace'), bas = await idOf(p, 'Basher')
  const s1 = await place(p, W, 6, slot(`s:6.amt.${m.ri}.p`), 'f5-amt-acep', ace), s2 = await place(p, W, 6, slot(`s:6.amt.${m.ri}.w`), 'f5-amt-basw', bas)
  need(W, 'f5.amtfull', 'the AMT row\'s two seats taken (Ace front, Basher rear)', s1.placed && s2.placed, `"${s1.toast}" / "${s2.toast}"`)
  /* with both seats taken the row draws its extra places, "Instructor / observer — tap or drop a puck to fill" (probe3) */
  const rx = await look(p, W, 6, slot(`s:6.amt.${m.ri}.x0`), 'f5-amt-xfull')
  chk(W, 'f5.amt-xfull', `both seats taken, the AMT's first extra place ("+", instructor / observer) armed: Ranger struck "${R17N}", Jester "${TODAYW}" (D2586)`, rx.armed && struckW(rx.ls[RANGER], R17N) && struckW(rx.ls[IPMAN], TODAYW), sayRJ(rx), rx.pic)
  /* dropped in all the same (tap-to-plan) */
  const k1 = await place(p, W, 5, slot(`s:5.oft.${o.ri}.p`), 'f5-drop-oft')
  rec(W, 'f5.note', 'Ranger tapped into the untimed OFT front seat: the note after the drop (RECORD)', `placed ${k1.placed} · note "${k1.toast}"`, k1.pic)
  chk(W, 'f5.note-told', 'the note never says "SANS — told on his bell" (N10)', !TOLD.test(k1.toast), `"${k1.toast}"`)
  const st = await state(p, W, 5, 'f5-oft')
  chk(W, 'f5.warn', 'the warning list has no amber SANS line for him (nothing filed raises none — D2579 not built) and no "told on his bell"', k1.placed && !st.w.sans.length && !told(st), st.say, st.w.pic)
  chk(W, 'f5.puck', 'his seated puck on the untimed OFT wears no amber mark', k1.placed && !ambered(st.s[RANGER]).length, seatSay(st.s[RANGER]), await W.pic(p, 'f5-oft-seated'))
  const k2 = await place(p, W, 6, slot(`s:6.amt.${m.ri}.x0`), 'f5-drop-amtx')
  need(W, 'f5.amtx', 'Ranger tapped into the untimed AMT\'s extra place (Sun 19)', k2.placed, `note "${k2.toast}" · holds ${J(k2.after)}`, k2.pic)
  rec(W, 'f5.amtx-note', 'the note after the drop into the AMT extra place (RECORD)', `"${k2.toast}"`)
  await L.closeBoard(p, W)
  const b = await rBell(p, W, 'f5-bell')
  chk(W, 'f5.bell', 'his bell names Sat 18 and Sun 19 — an untimed sim with nothing filed counts, the extra place included (D2568, F4)', remDays(b.rem) === 'Sat 18, Sun 19 Jul', sayB(b), b.pic)
}

/* F6 = A1 — standby lines that FLY (B, then R; both SC shifts; AVALON overnight; BB) never ask a SANS man */
SC.f6 = async (p, W) => {
  await postR(p, W, 'f6.post')
  const sc = (await A.addLine(p, W, 5, { kind: 'SC' })).wi, av = (await A.addLine(p, W, 5, { kind: 'AVALON' })).wi, bb = (await A.addLine(p, W, 5, { kind: 'BB' })).wi
  need(W, 'f6.waves', '+ Wave → SC, AVALON, BB on Sat 18', sc >= 0 && av > sc && bb > av, J({ sc, av, bb }))
  const seats = (wi, fi) => [['MAIN-p', `5.${wi}.${fi}.0.p`], ['MAIN-w', `5.${wi}.${fi}.0.w`], ['SPARE-p', `5.${wi}.${fi}.2.p`], ['SPARE-w', `5.${wi}.${fi}.2.w`]]
  const readAll = async (label, wi, fi, tag, which = null) => {
    for (const [nm, k] of seats(wi, fi).filter(x => !which || which.includes(x[0]))) {
      const r = await look(p, W, 5, slot(k), `f6-${tag}-${nm}`)
      chk(W, `f6.${tag}-${nm}`, `${label}: ${nm.replace('-p', ' FCP').replace('-w', ' RCP')} armed — no SANS reason for Ranger or Jester (D2584 Q4)`, r.armed && noSans(r.ls[RANGER]) && noSans(r.ls[IPMAN]), sayRJ(r), r.pic)
    }
  }
  await readAll('SC AM standing by (nothing typed)', sc, 0, 'sc0', ['MAIN-p', 'SPARE-w'])
  rec(W, 'f6.b', 'B 06:30 typed on SC AM', `box "${await setBox(p, W, 5, `[data-bfld="ff:5.${sc}.0.br"]`, '06:30')}" · ${J((await formOf(p, 5, sc))[0])}`, await W.pic(p, 'f6-b-typed'))
  await readAll('SC AM flying by a typed B', sc, 0, 'scB')
  await setBox(p, W, 5, `[data-bfld="ff:5.${sc}.0.br"]`, '')
  rec(W, 'f6.r', 'B cleared, R 06:00 typed on SC AM', `box "${await setBox(p, W, 5, `[data-bfld="ff:5.${sc}.0.rl"]`, '06:00')}" · ${J((await formOf(p, 5, sc))[0])}`, await W.pic(p, 'f6-r-typed'))
  await readAll('SC AM flying by a typed R', sc, 0, 'scR', ['MAIN-p', 'SPARE-p'])
  rec(W, 'f6.pm', 'B 12:30 typed on SC PM', `box "${await setBox(p, W, 5, `[data-bfld="ff:5.${sc}.1.br"]`, '12:30')}"`)
  await readAll('SC PM flying by a typed B', sc, 1, 'scPM', ['MAIN-p', 'SPARE-w'])
  rec(W, 'f6.av', 'B 18:30 typed on AVALON (19:00–07:00, overnight)', `box "${await setBox(p, W, 5, `[data-bfld="ff:5.${av}.0.br"]`, '18:30')}" · ${J((await formOf(p, 5, av))[0])}`)
  await readAll('AVALON flying (overnight)', av, 0, 'av', ['MAIN-p', 'SPARE-w'])
  rec(W, 'f6.bb', 'B 07:00 typed on BB (no START / END)', `box "${await setBox(p, W, 5, `[data-bfld="ff:5.${bb}.0.br"]`, '07:00')}" · ${J((await formOf(p, 5, bb))[0])}`)
  await readAll('BB flying, no times', bb, 0, 'bb', ['MAIN-p', 'SPARE-p'])
  /* Edit Schedule's crew panel on one flying standby seat */
  const e = await armE(p, W, WK1, `5.${sc}.0.0.p`, 'f6-e-scB')
  chk(W, 'f6.e', "Edit Schedule's crew panel, SC AM MAIN FCP (flying by R) picked: no SANS reason for Ranger", e.armed && noSans(e.l), `armed ${e.armed} · ${meSay(e.l)} · "${e.l && e.l.head}"`, e.pic)
  await disarmE(p, W)
  /* the rings, nothing armed, before he is placed anywhere */
  const g = await rings(p, W, 5, [`5.${sc}.0.1.p`, `5.${sc}.0.3.p`, `5.${av}.0.1.p`, `5.${bb}.0.1.p`], 'f6')
  chk(W, 'f6.rings', 'Ranger picked on the crew list: the flying SC MAIN / SPARE, AVALON and BB seats are lit green (not held back for SANS)', g.selected && g.r.every(x => /GREEN/.test(x)), `selected ${g.selected} · ${g.r.join(' ')} · ${g.other} lit`, g.pic)
  /* dropped in */
  const k1 = await place(p, W, 5, slot(`5.${sc}.0.0.p`), 'f6-drop-sc')
  chk(W, 'f6.drop-sc', 'Ranger tapped onto the flying SC AM MAIN FCP: placed, the note carries no SANS words', k1.placed && !/SANS/.test(k1.toast), `note "${k1.toast}"`, k1.pic)
  const k2 = await place(p, W, 5, slot(`5.${av}.0.0.p`), 'f6-drop-av', IPMAN)
  chk(W, 'f6.drop-av', 'Jester tapped onto the flying AVALON MAIN FCP: placed, no SANS words', k2.placed && !/SANS/.test(k2.toast), `note "${k2.toast}"`, k2.pic)
  const st = await state(p, W, 5, 'f6', [RANGER, IPMAN])
  chk(W, 'f6.warn', 'the warning list: no SANS line for either, no "told on his bell" (N10)', !st.w.sans.length && !told(st), st.say, st.w.pic)
  chk(W, 'f6.pucks', 'their seated pucks: no amber mark', !ambered(st.s[RANGER]).length && !ambered(st.s[IPMAN]).length, st.say, await W.pic(p, 'f6-seated'))
  await L.closeBoard(p, W)
  const b = await rBell(p, W, 'f6-bell')
  chk(W, 'f6.bell', 'his bell: no SANS reminder naming Sat 18 (flying standby never counts — D2584 Q4)', !b.rem || !/Sat 18/.test(b.rem.body), sayB(b), b.pic)
}

/* F7 = A2 — the Flies tick on one row only */
SC.f7 = async (p, W) => {
  await postR(p, W, 'f7.post')
  const ace = await idOf(p, 'Ace')
  const sc = (await A.addLine(p, W, 5, { kind: 'SC' })).wi, av = (await A.addLine(p, W, 5, { kind: 'AVALON' })).wi, bb = (await A.addLine(p, W, 5, { kind: 'BB' })).wi
  need(W, 'f7.waves', '+ Wave → SC, AVALON, BB on Sat 18 (times as made)', sc >= 0 && av > sc && bb > av, J({ sc, av, bb }))
  for (const [nm, key, nb] of [['SC AM MAIN', `5.${sc}.0.0`, `5.${sc}.0.1`], ['SC AM SPARE', `5.${sc}.0.2`, `5.${sc}.0.3`], ['AVALON MAIN', `5.${av}.0.0`, `5.${av}.0.1`], ['BB MAIN (START / END blank)', `5.${bb}.0.0`, `5.${bb}.0.1`]]) {
    const f = await flies(p, W, 5, key, true)
    need(W, `f7.tick-${key}`, `${nm}: FLIES ticked on row ${key} only`, f.ok, `aria-pressed ${f.now}`, f.pic)
    for (const [which, k] of [['ticked', key], ['unticked neighbour', nb]]) {
      const r = await look(p, W, 5, slot(k + '.p'), `f7-${k.replace(/\./g, '')}`)
      chk(W, `f7.${k}`, `${nm}, the ${which} row's FCP armed: no SANS reason for Ranger or Jester (D2584 Q4)`, r.armed && noSans(r.ls[RANGER]) && noSans(r.ls[IPMAN]), sayRJ(r), r.pic)
    }
  }
  /* Ranger seated on the ticked row, moved to the unticked one, its tick on, off, on */
  const st0 = async (tag, label) => {
    const r = await look(p, W, 5, slot(`5.${sc}.0.1.w`), `f7-${tag}-rcp`)
    const st = await state(p, W, 5, `f7-${tag}`)
    chk(W, `f7.${tag}`, `${label}: no SANS reason on the list (his row's RCP armed), no SANS line, no amber mark on his puck`, noSans(r.ls[RANGER]) && !st.w.sans.length && !told(st) && !ambered(st.s[RANGER]).length, `${meSay(r.ls[RANGER])} · ${st.say}`, [r.pic, st.w.pic].join(', '))
  }
  const k1 = await place(p, W, 5, slot(`5.${sc}.0.0.p`), 'f7-seat-ticked')
  chk(W, 'f7.s1', 'Ranger tapped onto the ticked SC AM row 1 FCP: placed, no SANS words in the note', k1.placed && !/SANS/.test(k1.toast), `note "${k1.toast}"`, k1.pic)
  await st0('s1', 'seated on the ticked row')
  /* moved: the board's Undo takes back his drop on row 1 (an occupied seat's box press lands on his puck, try3), then he
     is tapped onto row 2 */
  const k3 = await boardUndo(p, W, 5, 'undo', 'f7-move-undo')
  const k2 = await place(p, W, 5, slot(`5.${sc}.0.1.p`), 'f7-seat-unticked')
  const hold = await dayHold(p, 5, RANGER)
  need(W, 'f7.move', "moved: the board's Undo takes him off row 1, then he is tapped onto row 2 (unticked)", hold.length === 1 && /aircraft\[1\]\.p/.test(hold[0]), `Undo "${k3.title}" → "${k3.toast}" · note "${k2.toast}" · Ranger holds ${J(hold)}`, k2.pic)
  await st0('s2', 'moved to the unticked row')
  let f = await flies(p, W, 5, `5.${sc}.0.1`, true); rec(W, 'f7.t3', 'his row ticked FLIES while he sits there', `aria-pressed ${f.now}`, f.pic)
  await st0('s3', 'his row ticked')
  f = await flies(p, W, 5, `5.${sc}.0.1`, false); rec(W, 'f7.t4', 'his row unticked', `aria-pressed ${f.now}`, f.pic)
  await st0('s4', 'his row unticked')
  f = await flies(p, W, 5, `5.${sc}.0.1`, true); rec(W, 'f7.t5', 'his row ticked again', `aria-pressed ${f.now}`, f.pic)
  await st0('s5', 'his row ticked again')
  await L.closeBoard(p, W)
  const b = await rBell(p, W, 'f7-bell')
  chk(W, 'f7.bell', 'his bell: no reminder naming Sat 18', !b.rem || !/Sat 18/.test(b.rem.body), sayB(b), b.pic)
}

/* F8 = A3 — a filing that misses a standby line asks nothing of it; the timed flight beside it still does (N2) */
const F8 = {
  oft: { r: ['oft'], j: ['amt'], rs: 'all', js: 'all', ctl: () => 'SANS — not offering Fly' },
  win: { r: ['fly'], j: ['fly'], rs: ['08:00', '10:00'], js: ['08:00', '09:00'], ctl: who => who === RANGER ? 'SANS — available 08:00–10:00 only' : 'SANS — available 08:00–09:00 only' },
}
for (const [k, c] of Object.entries(F8)) SC['f8' + k] = async (p, W) => {
  const s = 'f8' + k
  await postR(p, W, s + '.post')
  await fileFor(p, W, D[18], RANGER, c.r, c.rs, s + '.fileR')
  await fileFor(p, W, D[18], IPMAN, c.j, c.js, s + '.fileJ')
  const sc = (await A.addLine(p, W, 5, { kind: 'SC' })).wi, av = (await A.addLine(p, W, 5, { kind: 'AVALON' })).wi, bb = (await A.addLine(p, W, 5, { kind: 'BB' })).wi
  const fl = await blank(p, W, 5, s + '.flight', { cs: 'T13', to: '13:00', ld: '14:00' })
  const seats = [['SC AM MAIN', `5.${sc}.0.0.p`], ['SC AM SPARE', `5.${sc}.0.2.p`], ['AVALON MAIN', `5.${av}.0.0.p`], ['BB MAIN', `5.${bb}.0.0.p`]]
  const readAll = async phase => {
    for (const [nm, key] of seats) {
      const r = await look(p, W, 5, slot(key), `${s}-${phase}-${nm.replace(/\W+/g, '')}`)
      chk(W, `${s}.${phase}-${nm.replace(/\W+/g, '')}`, `${phase === 'sb' ? 'standing by' : 'flying (B typed)'} — ${nm} FCP armed: no "not offering" / "available … only" / any SANS reason for Ranger (${c.r.join('+')} ${J(c.rs)}) or Jester (${c.j.join('+')} ${J(c.js)}) (D2584 Q4)`, r.armed && noSans(r.ls[RANGER]) && noSans(r.ls[IPMAN]), sayRJ(r), r.pic)
    }
  }
  await readAll('sb')
  for (const [wi, v] of [[sc, '06:30'], [av, '18:30'], [bb, '07:00']]) await setBox(p, W, 5, `[data-bfld="ff:5.${wi}.0.br"]`, v)
  rec(W, `${s}.b`, 'B typed on SC AM 06:30, AVALON 18:30, BB 07:00', J([await formOf(p, 5, sc), await formOf(p, 5, av), await formOf(p, 5, bb)].map(x => x[0].br)))
  await readAll('fly')
  const ctl = await look(p, W, 5, slot(fl.fcp), `${s}-ctl`)
  chk(W, `${s}.ctl`, `control (N2): the timed 13:00–14:00 flight's FCP — Ranger struck "${c.ctl(RANGER)}", Jester "${c.ctl(IPMAN)}"`, struckW(ctl.ls[RANGER], c.ctl(RANGER)) && struckW(ctl.ls[IPMAN], c.ctl(IPMAN)), sayRJ(ctl), ctl.pic)
  const k1 = await place(p, W, 5, slot(`5.${sc}.0.0.p`), `${s}-drop-sc`)
  const k2 = await place(p, W, 5, slot(`5.${av}.0.0.p`), `${s}-drop-av`, IPMAN)
  chk(W, `${s}.drop`, 'Ranger onto the flying SC MAIN, Jester onto the flying AVALON MAIN: placed, no SANS words in either note', k1.placed && k2.placed && !/SANS/.test(k1.toast + k2.toast), `"${k1.toast}" / "${k2.toast}"`, k1.pic + ', ' + k2.pic)
  const st = await state(p, W, 5, s, [RANGER, IPMAN])
  chk(W, `${s}.warn`, 'the warning list: no SANS line (no "not offering", no "available … only"); no amber mark on their standby pucks', !st.w.sans.length && !told(st) && !ambered(st.s[RANGER]).length && !ambered(st.s[IPMAN]).length, st.say, st.w.pic + ', ' + await W.pic(p, s + '-seated'))
}

/* F9 = A4 — standby lines with blank, partial and overnight times, standing by and activated */
SC.f9 = async (p, W) => {
  await postR(p, W, 'f9.post')
  const sc = (await A.addLine(p, W, 5, { kind: 'SC' })).wi, av = (await A.addLine(p, W, 5, { kind: 'AVALON' })).wi, bb = (await A.addLine(p, W, 5, { kind: 'BB' })).wi
  await setBox(p, W, 5, `[data-bfld="ff:5.${sc}.0.ld"]`, '')
  await setBox(p, W, 5, `[data-bfld="ff:5.${sc}.1.to"]`, '')
  const shape = { sc: await formOf(p, 5, sc), av: await formOf(p, 5, av), bb: await formOf(p, 5, bb) }
  need(W, 'f9.times', 'SC AM START only (07:00, END cleared), SC PM END only (START cleared), AVALON 19:00–07:00, BB blank', shape.sc[0].to && !shape.sc[0].ld && !shape.sc[1].to && shape.sc[1].ld && !shape.bb[0].to && !shape.bb[0].ld, J({ sc: shape.sc.map(f => f.to + '–' + f.ld), av: shape.av[0].to + '–' + shape.av[0].ld, bb: shape.bb[0].to + '–' + shape.bb[0].ld }))
  const cases = [['SC AM (START only) MAIN FCP', `5.${sc}.0.0.p`], ['SC AM SPARE RCP', `5.${sc}.0.2.w`], ['SC PM (END only) MAIN FCP', `5.${sc}.1.0.p`], ['AVALON 19:00–07:00 MAIN FCP', `5.${av}.0.0.p`], ['AVALON SPARE RCP', `5.${av}.0.2.w`], ['BB (blank) MAIN FCP', `5.${bb}.0.0.p`], ['BB SPARE RCP', `5.${bb}.0.2.w`]]
  const readAll = async (phase, list) => {
    for (const [nm, key] of list) {
      const r = await look(p, W, 5, slot(key), `f9-${phase}-${key.replace(/\./g, '')}`)
      chk(W, `f9.${phase}-${key}`, `${phase}: ${nm} armed — no SANS reason for Ranger or Jester, nothing filed (D2584 Q4)`, r.armed && noSans(r.ls[RANGER]) && noSans(r.ls[IPMAN]), sayRJ(r), r.pic)
    }
  }
  await readAll('standing by', cases)
  for (const key of [`5.${sc}.0.0`, `5.${sc}.1.0`, `5.${av}.0.0`, `5.${bb}.0.0`]) { const f = await flies(p, W, 5, key, true); rec(W, `f9.tick-${key}`, `FLIES ticked on ${key}`, `aria-pressed ${f.now}`, f.pic) }
  await readAll('FLIES ticked', cases.filter(c => /MAIN/.test(c[0])))
  await setBox(p, W, 5, `[data-bfld="ff:5.${bb}.0.br"]`, '07:00')
  await readAll('BB activated by a typed B', [['BB MAIN FCP', `5.${bb}.0.1.p`]])
  for (const [wi, fi] of [[sc, 0], [sc, 1], [av, 0]]) for (const f of ['to', 'ld', 'br']) await setBox(p, W, 5, `[data-bfld="ff:5.${wi}.${fi}.${f}"]`, '')
  rec(W, 'f9.cleared', 'every SC and AVALON time cleared', J({ sc: (await formOf(p, 5, sc)).map(f => f.to + '–' + f.ld), av: (await formOf(p, 5, av))[0] }))
  await readAll('all times cleared', [['SC AM MAIN FCP (row 2, unticked)', `5.${sc}.0.1.p`], ['SC AM MAIN FCP (row 1, ticked)', `5.${sc}.0.0.p`], ['AVALON MAIN FCP (row 2)', `5.${av}.0.1.p`]])
  const e = await armE(p, W, WK1, `5.${bb}.0.0.p`, 'f9-e-bb')
  chk(W, 'f9.e', "Edit Schedule's crew panel, BB MAIN FCP picked: no SANS reason for Ranger", e.armed && noSans(e.l), `armed ${e.armed} · ${meSay(e.l)}`, e.pic)
  await disarmE(p, W)
}

/* F10 = A5 + A6 (+ N9) — the same day on standby AND a real seat; then a filing that misses the real seat */
SC.f10 = async (p, W) => {
  await postR(p, W, 'f10.post')
  const sc = (await A.addLine(p, W, 5, { kind: 'SC' })).wi
  const fl = await blank(p, W, 5, 'f10.flight', { cs: 'T17', to: '17:00', ld: '18:00' })
  const sc2 = (await A.addLine(p, W, 6, { kind: 'SC' })).wi
  const a = await place(p, W, 5, slot(`5.${sc}.0.0.p`), 'f10-sc18'), b2 = await place(p, W, 5, slot(fl.fcp), 'f10-fl18'), c = await place(p, W, 6, slot(`6.${sc2}.0.0.p`), 'f10-sc19')
  need(W, 'f10.seats', 'Ranger on SC AM MAIN (07:00–13:00) and the T17 flight (17:00–18:00) on Sat 18; on SC AM MAIN only on Sun 19', a.placed && b2.placed && c.placed, `notes "${a.toast}" / "${b2.toast}" / "${c.toast}"`)
  rec(W, 'f10.notes', 'the notes of the three taps (RECORD; the SC ones must carry no SANS words)', `SC Sat "${a.toast}" · flight "${b2.toast}" · SC Sun "${c.toast}"`, [a.pic, b2.pic, c.pic].join(', '))
  chk(W, 'f10.sc-notes', 'neither SC tap\'s note carries SANS words', !/SANS/.test(a.toast + c.toast), `"${a.toast}" / "${c.toast}"`)
  let st = await state(p, W, 5, 'f10-0')
  rec(W, 'f10.st0', 'Sat 18 nothing filed: warning list and his pucks', st.say, st.w.pic)
  await L.closeBoard(p, W)
  let b = await rBell(p, W, 'f10-bell1')
  chk(W, 'f10.bell1', 'his bell names Sat 18 once, never Sun 19 (standby only) — D2568, D2584 Q4', remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  /* A5 */
  const d1 = await lineDel(p, W, 5, `5.${fl.wi}.0.0`, 'f10-offflight')
  need(W, 'f10.off', 'the T17 flight line removed by its ✕ (Ranger left on SC only that day)', d1.ok && !(await dayHold(p, 5, RANGER)).some(x => x.startsWith(`.waves[${fl.wi}]`)), `note "${d1.toast}"`, d1.pic)
  await L.closeBoard(p, W)
  b = await rBell(p, W, 'f10-bell2')
  chk(W, 'f10.bell2', 'standby alone: the bell no longer names Sat 18 (A5)', !b.rem || !/Sat 18/.test(b.rem.body), sayB(b), b.pic)
  /* restored: the board's Undo is greyed once Saber has signed out and in (the list clears at sign-out, D148 — try3's
     picture), so the flight is put back as a scheduler would: a new line, Ranger tapped in */
  const fr = await blank(p, W, 5, 'f10.flight2', { cs: 'T17', to: '17:00', ld: '18:00' })
  const kr = await place(p, W, 5, slot(fr.fcp), 'f10-fl18b')
  need(W, 'f10.restore', 'the flight put back: a new line T17 17:00–18:00, Ranger tapped into its FCP', kr.placed, `note "${kr.toast}"`, kr.pic)
  fl.wi = fr.wi; fl.fcp = fr.fcp
  await L.closeBoard(p, W)
  b = await rBell(p, W, 'f10-bell3')
  chk(W, 'f10.bell3', 'flight back: Sat 18 named again', remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  const d2 = await lineDel(p, W, 5, `5.${sc}.0.0`, 'f10-offsc')
  need(W, 'f10.offsc', 'his SC AM MAIN line removed by its ✕ (the flight left)', d2.ok && !(await dayHold(p, 5, RANGER)).some(x => x.startsWith(`.waves[${sc}]`)), `note "${d2.toast}"`, d2.pic)
  await L.closeBoard(p, W)
  b = await rBell(p, W, 'f10-bell4')
  chk(W, 'f10.bell4', 'standby removed, flight left: Sat 18 still named', remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  /* A6 / F10's second half: OFT only filed; back on SC; an AMT 17:00–18:00 too */
  await fileFor(p, W, D[18], RANGER, ['oft'], 'all', 'f10.oft')
  const a2 = await place(p, W, 5, slot(`5.${sc}.0.0.p`), 'f10-sc-again')
  const am = await W5.addSim(p, W, 5, 'amt', 'B AMT', '20:00', '21:00')
  const a3 = await place(p, W, 5, slot(`s:5.amt.${am.ri}.p`), 'f10-amt')
  need(W, 'f10.a6', 'OFT only filed; Ranger back on SC AM MAIN; a timed AMT 20:00–21:00 with Ranger in front', a2.placed && a3.placed, `notes "${a2.toast}" / "${a3.toast}"`)
  rec(W, 'f10.a6-notes', 'the notes (RECORD): SC, then AMT', `"${a2.toast}" / "${a3.toast}"`, a2.pic + ', ' + a3.pic)
  st = await state(p, W, 5, 'f10-a6')
  const scK = `5.${sc}.0.0.p`
  chk(W, 'f10.a6-warn', 'warning list: SANS lines name the T17 flight and the AMT, never the SC line (F10, A6)', st.w.sans.some(x => /T17/.test(x)) && st.w.sans.some(x => /AMT/.test(x)) && !st.w.sans.some(x => /\bSC\b/.test(x)), st.say, st.w.pic)
  chk(W, 'f10.a6-pucks', 'amber "A" on his flight and AMT pucks (N9), none on his SC puck', ambered(st.s[RANGER]).some(x => x.at === fl.fcp) && ambered(st.s[RANGER]).some(x => /amt/.test(x.at)) && !ambered(st.s[RANGER]).some(x => x.at === scK), seatSay(st.s[RANGER]), await W.pic(p, 'f10-a6-seated'))
  const d3 = await lineDel(p, W, 5, `5.${fl.wi}.0.0`, 'f10-offflight2')
  const d4 = await simDel(p, W, 5, 'amt', am.ri, 'f10-offamt')
  st = await state(p, W, 5, 'f10-a6b')
  chk(W, 'f10.a6-clear', 'flight and AMT removed, SC left: no SANS line left; his SC puck no amber (N9: it clears when he is moved off)', d3.ok && d4.ok && !st.w.sans.length && !ambered(st.s[RANGER]).length, `notes "${d3.toast}" / "${d4.toast}" · ${st.say}`, st.w.pic + ', ' + await W.pic(p, 'f10-a6b-seated'))
}

/* N9 (+ A6, re-walked) — the amber "A" for SANS on an ordinary flight and a timed sim, beside a standby seat, with no other
   rule's letter in the way (run1's f10 day ran 07:00–21:00, so a long day's "R" stood on every puck instead) */
SC.n9 = async (p, W) => {
  await postR(p, W, 'n9.post')
  /* Sat 18 (SC AM 07:00–13:00 + flight 15:30–16:30, 07:00–18:30 in all, under 12h) and Sun 19 (a timed AMT): try 1 on
     Fri 17 met the demo's Thursday flight landing 18:10, a crew-rest "R" on his SC puck */
  const F = 5, S = 6
  await fileFor(p, W, D[18], RANGER, ['oft'], 'all', 'n9.file18')
  await fileFor(p, W, D[19], RANGER, ['oft'], 'all', 'n9.file19')
  const sc = (await A.addLine(p, W, F, { kind: 'SC' })).wi
  const fl = await blank(p, W, F, 'n9.flight', { cs: 'T1530', to: '15:30', ld: '16:30' })
  const am = await W5.addSim(p, W, S, 'amt', 'B AMT', '10:00', '11:00')
  const k1 = await place(p, W, F, slot(`${F}.${sc}.0.0.p`), 'n9-sc'), k2 = await place(p, W, F, slot(fl.fcp), 'n9-fl'), k3 = await place(p, W, S, slot(`s:${S}.amt.${am.ri}.p`), 'n9-amt')
  need(W, 'n9.set', 'OFT only filed for Sat 18 and Sun 19; Sat 18: Ranger on SC AM MAIN (07:00–13:00) and flight T1530 (15:30–16:30); Sun 19: Ranger in a timed AMT 10:00–11:00', k1.placed && k2.placed && k3.placed, `notes "${k1.toast}" / "${k2.toast}" / "${k3.toast}"`)
  rec(W, 'n9.notes', 'the notes of the three taps (RECORD)', `SC "${k1.toast}" · flight "${k2.toast}" · AMT "${k3.toast}"`, [k1.pic, k2.pic, k3.pic].join(', '))
  const scK = `${F}.${sc}.0.0.p`
  let st = await state(p, W, F, 'n9-sat')
  chk(W, 'n9.sat-warn', 'Sat 18 warning list: a SANS line names the T1530 flight ("not offering Fly"), none names the SC line (A6)', st.w.sans.some(x => /T1530/.test(x) && /not offering Fly/.test(x)) && !st.w.sans.some(x => /\bSC\b/.test(x)), st.say, st.w.pic)
  chk(W, 'n9.sat-pucks', 'his flight puck wears the amber "A"; his SC puck does not (N9, A6)', ambered(st.s[RANGER]).some(x => x.at === fl.fcp) && !ambered(st.s[RANGER]).some(x => x.at === scK), seatSay(st.s[RANGER]), await W.pic(p, 'n9-sat-seated'))
  st = await state(p, W, S, 'n9-sun')
  chk(W, 'n9.sun', 'Sun 19: a SANS line names the AMT ("not offering AMT"); his AMT puck wears the amber "A" (N9, timed sim)', st.w.sans.some(x => /not offering AMT/.test(x)) && ambered(st.s[RANGER]).some(x => /amt/.test(x.at)), st.say, st.w.pic + ', ' + await W.pic(p, 'n9-sun-seated'))
  const d1 = await lineDel(p, W, F, `${F}.${fl.wi}.0.0`, 'n9-offfl')
  st = await state(p, W, F, 'n9-sat2')
  chk(W, 'n9.sat-clear', 'the flight removed (SC left): no SANS line on Sat 18, no amber "A" on his SC puck — it clears (N9, A6)', d1.ok && !st.w.sans.length && !ambered(st.s[RANGER]).length && st.s[RANGER].some(x => x.at === scK), `note "${d1.toast}" · ${st.say}`, st.w.pic + ', ' + await W.pic(p, 'n9-sat2-seated'))
  const d2 = await simDel(p, W, S, 'amt', am.ri, 'n9-offamt')
  st = await state(p, W, S, 'n9-sun2')
  chk(W, 'n9.sun-clear', 'the AMT removed: no SANS line on Sun 19', d2.ok && !st.w.sans.length, `note "${d2.toast}" · ${st.say}`, st.w.pic)
}

/* F15 = A18 — filing and un-filing while the crew list is used; the member files from his reminder */
SC.f15 = async (p, W) => {
  await postR(p, W, 'f15.post')
  const o = await W5.addSim(p, W, 5, 'oft', 'B OFT', '', '')
  const sc2 = (await A.addLine(p, W, 6, { kind: 'SC' })).wi
  const seat = slot(`s:5.oft.${o.ri}.p`)
  const lk = async (tag, label, want) => {
    const r = await look(p, W, 5, seat, `f15-${tag}`, [RANGER])
    const ok = want === 'struck' ? struckW(r.ls[RANGER], R17N) : (r.ls[RANGER] && r.ls[RANGER].me.length && !sansWords(r.ls[RANGER]).length)
    chk(W, `f15.${tag}`, `${label}: untimed OFT front seat armed — Ranger ${want === 'struck' ? 'struck "' + R17N + '"' : 'with no SANS reason'}`, r.armed && ok, sayRJ(r), r.pic)
    await L.closeBoard(p, W)
  }
  await lk('0', 'nothing filed', 'struck')
  const f = await fileFor(p, W, D[18], RANGER, ['oft'], 'all', 'f15.file')
  await lk('1', 'OFT all day filed (Inputs → SANS), back on the board, no reload', 'plain')
  const del = await W5.uncommit(p, W, D[18], f.iid, 'f15-del')
  need(W, 'f15.del', 'the filing opened from its SANS day and deleted', del.ok, del.why || '', del.pic)
  await T.closeAll(p, W)
  await lk('2', 'the filing deleted', 'struck')
  await L.go(p, 'inputs')
  const u = await Y.Z.topBar(p, W, 'undo', RANGER, 'f15-undo')
  const back = await p.evaluate(i => (window.INPUTS || []).some(r => r.iid === i), f.iid)
  rec(W, 'f15.u', 'the top bar Undo on the Inputs page', `${u.pressed ? 'pressed' : 'NOT pressed'} "${u.title}" · note "${u.toast}" · filing back ${back}`, u.pic)
  await lk('3', 'the delete undone', back ? 'plain' : 'struck')
  /* A18: delete it again; seat him on the untimed OFT (Sat 18) and SC only (Sun 19) */
  const del2 = await W5.uncommit(p, W, D[18], f.iid, 'f15-del2')
  need(W, 'f15.del2', 'the filing deleted again (nothing filed)', del2.ok, '', del2.pic)
  await T.closeAll(p, W)
  const k1 = await place(p, W, 5, seat, 'f15-seat-oft'), k2 = await place(p, W, 6, slot(`6.${sc2}.0.0.p`), 'f15-seat-sc')
  need(W, 'f15.seats', 'Ranger on the untimed OFT (Sat 18) and on SC AM MAIN only (Sun 19)', k1.placed && k2.placed, `"${k1.toast}" / "${k2.toast}"`)
  await L.closeBoard(p, W)
  await asR(p, W)
  let b = await bell(p, W, 'f15-bell1')
  chk(W, 'f15.bell1', 'as Ranger: his reminder names Sat 18 only (never the standby-only Sun 19)', remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  if (b.rem) {
    const t = await tapAndRead(p, W, b.rem.id, 'f15-tap')
    chk(W, 'f15.tap', 'the reminder tapped opens the SANS calendar on Sat 18 with its day window', t.page === 'inputs' && /Sat\w*\s*18/i.test(t.win || ''), t.ok ? `page "${t.page}" · month "${t.month}" · window "${t.win}"` : t.why, t.pic)
  }
  const mf = await T.file(p, W, D[18], null, ['oft'], 'all', 'f15-rfile')
  need(W, 'f15.rfile', 'Ranger files OFT, all day, for Sat 18 himself (+ Commitment)', !!mf.iid, mf.iid ? J(mf.made) : mf.refused, mf.pic)
  await T.closeAll(p, W)
  b = await bell(p, W, 'f15-bell2')
  chk(W, 'f15.bell2', 'filed: the reminder no longer names Sat 18 (and never Sun 19)', !b.rem || (!/Sat 18/.test(b.rem.body) && !/Sun 19/.test(b.rem.body)), sayB(b), b.pic)
  await asS(p, W)
  const rx = await look(p, W, 5, slot(`s:5.oft.${o.ri}.w`), 'f15-filed-x', [RANGER])
  rec(W, 'f15.filed-x', 'Saber, the board: the untimed OFT\'s rear seat armed with his filing in (RECORD — he sits in the front seat)', sayRJ(rx), rx.pic)
  const ex = await Z.armEAt(p, W, WK1, fill(`s:5.oft.${o.ri}.+`), 'f15-e-filed', [RANGER])
  rec(W, 'f15.e-filed', "Saber, Edit Schedule's crew panel: the week's OFT row picked (RECORD)", `armed ${ex.armed} · ${sayRJ(ex)}`, ex.pic)
  /* Ranger deletes his filing; the app reopened */
  await asR(p, W)
  const rd = await W5.uncommit(p, W, D[18], mf.iid, 'f15-rdel')
  need(W, 'f15.rdel', 'Ranger deletes his own filing', rd.ok, '', rd.pic)
  await T.reload(p, 'us', 'us')
  b = await bell(p, W, 'f15-bell3')
  rec(W, 'f15.bell3', 'Ranger, app reopened after deleting his filing: the bell (RECORD the renewed reminder)', sayB(b), b.pic)
  chk(W, 'f15.bell3c', 'the reminder names Sat 18 again, never Sun 19', remDays(b.rem) === 'Sat 18 Jul', sayB(b))
  await T.closeAll(p, W)
  await asS(p, W)
  await T.reload(p, 'ad', 'a')
  const r9 = await look(p, W, 5, slot(`s:5.oft.${o.ri}.w`), 'f15-final', [RANGER])
  rec(W, 'f15.final', 'Saber after the reload: the OFT rear seat armed (RECORD)', sayRJ(r9), r9.pic)
}

/* F18 = A8 (+ N11) — his bell over a week of every kind of place */
SC.f18 = async (p, W) => {
  await postR(p, W, 'f18.post')
  /* week 1: A Fri 17 SC SPARE (standing by), B Sat 18 AVALON MAIN ticked FLIES, C Sun 19 BB MAIN */
  const scA = (await A.addLine(p, W, 4, { kind: 'SC' })).wi
  const kA = await place(p, W, 4, slot(`4.${scA}.0.2.p`), 'f18-A')
  const avB = (await A.addLine(p, W, 5, { kind: 'AVALON' })).wi
  const fB = await flies(p, W, 5, `5.${avB}.0.0`, true)
  const kB = await place(p, W, 5, slot(`5.${avB}.0.0.p`), 'f18-B')
  const bbC = (await A.addLine(p, W, 6, { kind: 'BB' })).wi
  const kC = await place(p, W, 6, slot(`6.${bbC}.0.0.p`), 'f18-C')
  need(W, 'f18.wk1', 'A Fri 17 SC SPARE · B Sat 18 AVALON MAIN (FLIES ticked) · C Sun 19 BB MAIN — Ranger on each', kA.placed && kB.placed && kC.placed && fB.ok, `"${kA.toast}" / "${kB.toast}" / "${kC.toast}"`)
  await L.closeBoard(p, W)
  /* week 2: D Tue 21 untimed AMT rear seat, E Wed 22 timed flight, F Fri 24 cancelled untimed OFT, G Sat 25 duty desk */
  await T.gotoWeek(p, W, WK2)
  const amD = await W5.addSim(p, W, 1, 'amt', 'B AMT', '', '')
  const kD = await place(p, W, 1, slot(`s:1.amt.${amD.ri}.w`), 'f18-D')
  const flE = await blank(p, W, 2, 'f18.E', { cs: 'T13', to: '13:00', ld: '14:00' })
  const kE = await place(p, W, 2, slot(flE.fcp), 'f18-E')
  const oF = await W5.addSim(p, W, 4, 'oft', 'B OFT', '', '')
  const kF = await place(p, W, 4, slot(`s:4.oft.${oF.ri}.p`), 'f18-F')
  const cF = await A.cx(p, W, 4, `[data-srcx="4.oft.${oF.ri}"]`, true, 'f18-F')
  await L.openBoard(p, W, 5)
  await W.press(p, L.B('[data-dradd="5.0"]'), 'dradd'); await sleep(500)
  const nG = await p.evaluate(() => window.DAYS[5].dutywaves[0].rows.length - 1)
  const kG = await place(p, W, 5, fill(`d:5.0.${nG}.+`), 'f18-G')
  const cxF = await p.evaluate(ri => !!window.DAYS[4].sims.oft[ri].cx, oF.ri)
  need(W, 'f18.wk2', 'D Tue 21 untimed AMT rear seat · E Wed 22 T13 13:00–14:00 FCP · F Fri 24 untimed OFT front seat then cancelled · G Sat 25 a new duty desk row — Ranger on each', kD.placed && kE.placed && kF.placed && cF.ok && cxF && kG.placed, `"${kD.toast}" / "${kE.toast}" / "${kF.toast}" / cancelled ${cxF} / "${kG.toast}"`)
  await L.closeBoard(p, W)
  const mon = await p.evaluate(() => window.DAYS[0].waves.filter(w => w.formations.some(f => f.aircraft.some(a => a.p === 'bane' || a.w === 'bane'))).map(w => w.label + ' ' + w.formations.map(f => f.to + '–' + f.ld).join(',')))
  rec(W, 'f18.mon', 'the demo week 2 already holds Ranger on Mon 20 (flying lines) — a saved week counts them', J(mon) + ' · ' + await T.holds(p, RANGER))
  /* leave the standby week open */
  rec(W, 'f18.wk', 'Edit Schedule left on week 1 (the standby week)', await T.gotoWeek(p, W, WK1))
  await asR(p, W)
  let b = await bell(p, W, 'f18-bell1')
  chk(W, 'f18.bell1', 'his reminder names D and E (Tue 21, Wed 22) and the demo Mon 20 flight — never A, B, C (standby), F (cancelled) or G (duty desk)', remDays(b.rem) === 'Mon 20, Tue 21, Wed 22 Jul', sayB(b), b.pic)
  if (b.rem) {
    const t = await tapAndRead(p, W, b.rem.id, 'f18-tap')
    rec(W, 'f18.tap', 'the reminder tapped: what it opened (D2340: the first listed day)', t.ok ? `page "${t.page}" · month "${t.month}" · window "${t.win}"` : t.why, t.pic)
  }
  /* N11: another member, then the admin */
  await T.as(p, W, 'hex', 'x')
  const bh = await bell(p, W, 'f18-hex')
  chk(W, 'f18.hex', "N11: Hex (another member) signed in — no reminder about Ranger's days", !bh.lines.some(l => /Tue 21|Wed 22/.test(l.body)), sayB(bh), bh.pic)
  await T.closeAll(p, W)
  await asS(p, W)
  const bs = await bell(p, W, 'f18-saber')
  chk(W, 'f18.saber', "N11: Saber's bell carries no SANS reminder of Ranger's", !bs.lines.some(l => l.id.startsWith('sansdue') || /Tue 21, Wed 22/.test(l.body)), sayB(bs), bs.pic)
  await T.closeAll(p, W)
  /* D taken off */
  await T.gotoWeek(p, W, WK2)
  const sd = await simDel(p, W, 1, 'amt', amD.ri, 'f18-offD')
  need(W, 'f18.offD', 'Saber removes the Tue 21 AMT row (D)', sd.ok, `note "${sd.toast}"`, sd.pic)
  await L.closeBoard(p, W)
  await T.gotoWeek(p, W, WK1)
  b = await rBell(p, W, 'f18-bell2')
  chk(W, 'f18.bell2', 'D off: the reminder drops Tue 21 (Mon 20, Wed 22 Jul)', remDays(b.rem) === 'Mon 20, Wed 22 Jul', sayB(b), b.pic)
}

/* F19 = A7 — cancelled rows */
SC.f19 = async (p, W) => {
  await postR(p, W, 'f19.post')
  const sc = (await A.addLine(p, W, 5, { kind: 'SC' })).wi
  const o = await W5.addSim(p, W, 5, 'oft', 'B OFT', '', '')
  const k0 = await place(p, W, 5, slot(`5.${sc}.0.0.p`), 'f19-sc'), k1 = await place(p, W, 5, slot(`s:5.oft.${o.ri}.p`), 'f19-oft')
  need(W, 'f19.seats', 'Sat 18: Ranger on SC AM MAIN (standing by) and the untimed OFT front seat', k0.placed && k1.placed, `"${k0.toast}" / "${k1.toast}"`)
  await L.closeBoard(p, W)
  let b = await rBell(p, W, 'f19-bell0')
  chk(W, 'f19.bell0', 'his bell names Sat 18 (the untimed OFT)', remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  const c1 = await A.cx(p, W, 5, `[data-lcx="5.${sc}.0.0"]`, true, 'f19-cxsc')
  let st = await state(p, W, 5, 'f19-cxsc')
  chk(W, 'f19.cxsc', 'his standby row cancelled (CX, WX): nothing SANS on the warning list', c1.ok && !st.w.sans.length && !told(st), st.say, [c1.pic, st.w.pic].join(', '))
  const c2 = await A.cx(p, W, 5, `[data-srcx="5.oft.${o.ri}"]`, true, 'f19-cxoft')
  st = await state(p, W, 5, 'f19-cxoft')
  chk(W, 'f19.cxoft', 'his untimed OFT cancelled too: nothing SANS on the warning list', c2.ok && !st.w.sans.length, st.say, [c2.pic, st.w.pic].join(', '))
  await L.closeBoard(p, W)
  b = await rBell(p, W, 'f19-bell1')
  chk(W, 'f19.bell1', 'both cancelled: the bell no longer names Sat 18 (a cancelled line never counts — D2568)', !b.rem || !/Sat 18/.test(b.rem.body), sayB(b), b.pic)
  /* a flying SC shift: one aircraft row cancelled */
  await setBox(p, W, 5, `[data-bfld="ff:5.${sc}.0.br"]`, '06:30')
  const k2 = await place(p, W, 5, slot(`5.${sc}.0.1.p`), 'f19-scfly')
  const c3 = await A.cx(p, W, 5, `[data-lcx="5.${sc}.0.1"]`, true, 'f19-cxscfly')
  st = await state(p, W, 5, 'f19-cxscfly')
  chk(W, 'f19.cxscfly', 'flying SC AM (B 06:30): Ranger on row 2, that row cancelled — nothing SANS on the warning list', k2.placed && c3.ok && !st.w.sans.length, `"${k2.toast}" · ${st.say}`, st.w.pic)
  await L.closeBoard(p, W)
  b = await rBell(p, W, 'f19-bell2')
  chk(W, 'f19.bell2', 'still no Sat 18 in his bell', !b.rem || !/Sat 18/.test(b.rem.body), sayB(b), b.pic)
  /* A7 on Sun 19: two timed flights + SC */
  const f1 = await blank(p, W, 6, 'f19.f1', { cs: 'ONE', to: '13:00', ld: '14:00' }), f2 = await blank(p, W, 6, 'f19.f2', { cs: 'TWO', to: '15:00', ld: '16:00' })
  const sc2 = (await A.addLine(p, W, 6, { kind: 'SC' })).wi
  const q1 = await place(p, W, 6, slot(f1.fcp), 'f19-q1'), q2 = await place(p, W, 6, slot(f2.fcp), 'f19-q2'), q3 = await place(p, W, 6, slot(`6.${sc2}.0.0.p`), 'f19-q3')
  need(W, 'f19.a7', 'Sun 19: Ranger on flights ONE (13:00) and TWO (15:00) and SC AM MAIN', q1.placed && q2.placed && q3.placed, '')
  const bl = async (tag, label, want) => { await L.closeBoard(p, W); const bb = await rBell(p, W, 'f19-' + tag); chk(W, 'f19.' + tag, label, want ? /Sun 19/.test(remDays(bb.rem)) : !/Sun 19/.test(remDays(bb.rem)), sayB(bb), bb.pic) }
  await A.cx(p, W, 6, `[data-lcx="6.${f1.wi}.0.0"]`, true, 'f19-cx1')
  await bl('a7-1', 'ONE cancelled, TWO left: Sun 19 still named', true)
  await A.cx(p, W, 6, `[data-lcx="6.${f2.wi}.0.0"]`, true, 'f19-cx2')
  await bl('a7-2', 'both cancelled (SC left): Sun 19 not named', false)
  await A.cx(p, W, 6, `[data-lcx="6.${f2.wi}.0.0"]`, false, 'f19-uncx2')
  await bl('a7-3', 'TWO un-cancelled: Sun 19 named again', true)
  /* the board's Undo list clears when Saber signs out to read Ranger's bell (D148), so the removal is undone at once,
     before any bell is read, and the "removed" bell is read after a second removal */
  const ld = await lineDel(p, W, 6, `6.${f2.wi}.0.0`, 'f19-del2')
  const gone = !(await dayHold(p, 6, RANGER)).some(x => x.startsWith(`.waves[${f2.wi}]`))
  const u = await boardUndo(p, W, 6, 'undo', 'f19-undo')
  const back = await seatHas(p, f2.fcp, RANGER)
  chk(W, 'f19.undo', "TWO removed by its ✕ (its occupant with it), then the board's Undo brings it back with Ranger", ld.ok && gone && back, `note "${ld.toast}" · Undo "${u.title}" → "${u.toast}" · back ${back}`, [ld.pic, u.pic].join(', '))
  await bl('a7-5', 'removal undone: Sun 19 named again', true)
  const ld2 = await lineDel(p, W, 6, `6.${f2.wi}.0.0`, 'f19-del3')
  rec(W, 'f19.del3', 'TWO removed again by its ✕', `note "${ld2.toast}"`, ld2.pic)
  await bl('a7-4', 'TWO removed (ONE cancelled, SC left): Sun 19 not named', false)
  rec(W, 'f19.formation', 'A7 "cancel a whole formation": the board draws a CX per line only (no formation or wave CX found in probe2) — the one-line flight IS its formation, walked above', 'per-line CX only')
}

/* A20 (+ N6, N1) — ground, duty, all hands and a standby-created duty desk ask nothing; a regular man is never asked */
SC.a20 = async (p, W) => {
  await postR(p, W, 'a20.post')
  const ace = await idOf(p, 'Ace')
  await L.openBoard(p, W, 4)
  const g = await L.groundRow(p, W, 4, 'B GROUND', '10:00', '11:00', RANGER)
  await L.openBoard(p, W, 5)
  await W.press(p, L.B('[data-dradd="5.0"]'), 'dradd'); await sleep(500)
  const nG = await p.evaluate(() => window.DAYS[5].dutywaves[0].rows.length - 1)
  const rd = await armAt(p, W, 5, fill(`d:5.0.${nG}.+`), 'a20-duty')
  chk(W, 'a20.duty-list', 'N6: the new duty desk row armed — no SANS reason for Ranger or Jester', rd.armed && noSans(rd.ls[RANGER]) && noSans(rd.ls[IPMAN]), sayRJ(rd), rd.pic)
  await disarm(p, W)
  const kd = await place(p, W, 5, fill(`d:5.0.${nG}.+`), 'a20-dutyin')
  await L.openBoard(p, W, 6)
  const a = await L.progRow(p, W, 6, 'B ALLHANDS', '10:00', '11:00', RANGER)
  need(W, 'a20.rows', 'Ranger on a ground row (Fri 17), a duty desk row (Sat 18), all hands (Sun 19)', JSON.stringify(g.row).includes(RANGER) && kd.placed && JSON.stringify(a.row).includes(RANGER), `${J(g.row)} · "${kd.toast}" · ${J(a.row)}`)
  /* + Block on Sun 19: what it offers */
  await L.openBoard(p, W, 6)
  const n0 = await p.evaluate(() => window.DAYS[6].dutywaves.length)
  await W.press(p, L.B('[data-dwadd="6"]'), 'dwadd'); await sleep(500)
  const offers = await p.evaluate(() => [...document.querySelectorAll('button, [role="menuitem"]')].filter(e => e.getBoundingClientRect().width > 0 && /SC|AVALON|BB|Block|Duty|desk/i.test(e.textContent || '') && (e.textContent || '').trim().length < 40).map(e => (e.textContent || '').trim()))
  rec(W, 'a20.block', '"+ Block" pressed on Sun 19: what it offers', J(offers), await W.pic(p, 'a20-block'))
  const avb = p.getByRole('button', { name: /AVALON/ }).first()
  if (await avb.isVisible().catch(() => false)) { await W.press(p, avb, 'avalon-block'); await sleep(600) } else await p.keyboard.press('Escape')
  const blk = await p.evaluate(n => { const d = window.DAYS[6].dutywaves; return d.length > n ? { label: d[n].label, rows: d[n].rows.length } : null }, n0)
  rec(W, 'a20.block2', 'the block made (an AVALON desk where offered)', J(blk) + ' · ' + J(await p.evaluate(() => window.DAYS[6].dutywaves.map(d => d.label))))
  if (blk) {
    const kb = await place(p, W, 6, fill(`d:6.${n0}.0.+`), 'a20-blockin')
    rec(W, 'a20.blockin', 'Ranger tapped onto the new block\'s first desk', `placed ${kb.placed} · "${kb.toast}"`, kb.pic)
  }
  await L.closeBoard(p, W)
  let b = await rBell(p, W, 'a20-bell1')
  chk(W, 'a20.bell1', 'his bell: no SANS reminder (ground, duty desk, all hands, a standby desk never count — D2564)', !b.rem, sayB(b), b.pic)
  /* the standby wave activated (an SC on Sun 19 flying by B, nobody on it) */
  const sc = (await A.addLine(p, W, 6, { kind: 'SC' })).wi
  await setBox(p, W, 6, `[data-bfld="ff:6.${sc}.0.br"]`, '06:30')
  await L.closeBoard(p, W)
  b = await rBell(p, W, 'a20-bell2')
  chk(W, 'a20.bell2', 'an SC wave added on Sun 19 and made to fly: still no reminder', !b.rem, sayB(b), b.pic)
  /* N1: a regular pilot (Ace) on an untimed flight, an untimed OFT, an SC MAIN */
  if (ace) {
    const fl = await blank(p, W, 6, 'a20.fl')
    const o = await W5.addSim(p, W, 6, 'oft', 'B OFT', '', '')
    for (const [nm, sel] of [['untimed flight FCP', slot(fl.fcp)], ['untimed OFT front', slot(`s:6.oft.${o.ri}.p`)], ['flying SC MAIN FCP', slot(`6.${sc}.0.0.p`)]]) {
      const r = await look(p, W, 6, sel, `a20-ace-${nm.replace(/\W+/g, '')}`, [ace, RANGER])
      chk(W, `a20.ace-${nm.replace(/\W+/g, '')}`, `N1: ${nm} armed — Ace (not SANS) has no SANS reason`, r.armed && noSans(r.ls[ace]), `Ace ${meSay(r.ls[ace])} · Ranger ${meSay(r.ls[RANGER])} · "${r.head}"`, r.pic)
    }
  } else rec(W, 'a20.ace', 'N1', 'NOT WALKED: no man called Ace')
  /* N6: the ground row's and the all-hands row's places armed */
  for (const [di, sel, nm] of [[4, fill(`g:4.${g.ri}.+`), 'ground row'], [6, fill(`a:6.${a.ri}.+`), 'all hands row']]) {
    const r = await look(p, W, di, sel, `a20-${nm.replace(/\W+/g, '')}`)
    chk(W, `a20.${nm.replace(/\W+/g, '')}`, `N6: the ${nm}'s "+ add" armed — no SANS reason for Ranger or Jester`, r.armed && noSans(r.ls[RANGER]) && noSans(r.ls[IPMAN]), sayRJ(r), r.pic)
  }
}

/* N5 + N7 — a SANS man's other reasons on a standby seat, and the standby row's other warnings, still show */
SC.n57 = async (p, W) => {
  await postR(p, W, 'n57.post')
  const ace = await idOf(p, 'Ace')
  const early = await blank(p, W, 5, 'n57.early', { cs: 'EARLY', to: '08:00', ld: '09:00' })
  const ke = await place(p, W, 5, slot(early.fcp), 'n57-early')
  const ka = ace ? await place(p, W, 5, slot(early.rcp), 'n57-early-ace', ace) : { placed: false }
  const sc = (await A.addLine(p, W, 5, { kind: 'SC' })).wi
  need(W, 'n57.set', 'Sat 18: Ranger on the EARLY flight 08:00–09:00 FCP (Ace in its RCP); an SC wave', ke.placed, `"${ke.toast}" / "${ka.toast}"`)
  const r0 = await look(p, W, 5, slot(`5.${sc}.0.1.p`), 'n57-sb', [RANGER, IPMAN, ace].filter(Boolean))
  rec(W, 'n57.sb', 'N5: SC AM MAIN FCP (07:00–13:00, standing by) armed — Ranger already busy 08:00–09:00: the reason shown (RECORD)', `${sayRJ(r0)}${ace ? ' · Ace ' + meSay(r0.ls[ace]) : ''}`, r0.pic)
  chk(W, 'n57.sb-c', 'N5: Ranger carries no SANS words there; his other reason (busy) still shows', noSans(r0.ls[RANGER]) && r0.ls[RANGER].me.some(x => x.struck || x.printed || / — /.test(x.title)), meSay(r0.ls[RANGER]))
  await setBox(p, W, 5, `[data-bfld="ff:5.${sc}.0.br"]`, '06:30')
  const r1 = await look(p, W, 5, slot(`5.${sc}.0.1.p`), 'n57-fly', [RANGER, IPMAN, ace].filter(Boolean))
  rec(W, 'n57.fly', 'N5: the same seat with SC AM flying (B 06:30) — reasons (RECORD)', `${sayRJ(r1)}${ace ? ' · Ace ' + meSay(r1.ls[ace]) : ''}`, r1.pic)
  chk(W, 'n57.fly-c', 'N5: no SANS words; his busy reason still shows', noSans(r1.ls[RANGER]) && r1.ls[RANGER].me.some(x => x.struck || x.printed || / — /.test(x.title)), meSay(r1.ls[RANGER]))
  const k1 = await place(p, W, 5, slot(`5.${sc}.0.1.p`), 'n57-in')
  const k2 = ace ? await place(p, W, 5, slot(`5.${sc}.0.2.p`), 'n57-ace-in', ace) : { placed: false, toast: '' }
  rec(W, 'n57.in', 'Ranger and Ace tapped onto flying SC AM rows (each also on EARLY 08:00–09:00): the notes', `"${k1.toast}" / "${k2.toast}"`, k1.pic + ', ' + k2.pic)
  const st = await state(p, W, 5, 'n57', [RANGER, ace].filter(Boolean))
  const rr = st.w.rows.filter(x => /Ranger/.test(x)), ar = st.w.rows.filter(x => /Ace/.test(x))
  rec(W, 'n57.warn', 'N7: the warning list with both double-booked on a flying SC row (RECORD every row)', st.say + ' · Ace rows: ' + (ar.join(' | ') || 'none'), st.w.pic)
  chk(W, 'n57.warn-c', 'N7: Ranger gets the same kind of non-SANS lines as the regular Ace, and no SANS line', rr.length >= 1 && ar.length >= 1 && !st.w.sans.length, `Ranger: ${rr.join(' | ')} · Ace: ${ar.join(' | ')}`)
}

/* N8 — filed "all day, Fly + OFT + AMT": plain everywhere, his bell silent */
SC.n8 = async (p, W) => {
  await postR(p, W, 'n8.post')
  await fileFor(p, W, D[18], RANGER, ['fly', 'oft', 'amt'], 'all', 'n8.file')
  const t = await blank(p, W, 5, 'n8.t', { cs: 'TIMED', to: '13:00', ld: '14:00' }), u = await blank(p, W, 5, 'n8.u')
  const o = await W5.addSim(p, W, 5, 'oft', 'B OFT', '', ''), m = await W5.addSim(p, W, 5, 'amt', 'B AMT', '15:00', '16:00')
  const sc = (await A.addLine(p, W, 5, { kind: 'SC' })).wi
  for (const [nm, sel] of [['timed flight FCP', slot(t.fcp)], ['untimed flight FCP', slot(u.fcp)], ['untimed OFT front', slot(`s:5.oft.${o.ri}.p`)], ['untimed OFT extra place', fill(`s:5.oft.${o.ri}.+`)], ['timed AMT front', slot(`s:5.amt.${m.ri}.p`)], ['SC MAIN FCP', slot(`5.${sc}.0.0.p`)]]) {
    const r = await look(p, W, 5, sel, `n8-${nm.replace(/\W+/g, '')}`, [RANGER])
    chk(W, `n8.${nm.replace(/\W+/g, '')}`, `${nm} armed: Ranger (filed all day Fly+OFT+AMT) with no SANS reason`, r.armed && noSans(r.ls[RANGER]), sayRJ(r), r.pic)
  }
  const k1 = await place(p, W, 5, slot(`s:5.oft.${o.ri}.p`), 'n8-oft'), k2 = await place(p, W, 5, slot(u.fcp), 'n8-u')
  const st = await state(p, W, 5, 'n8')
  chk(W, 'n8.warn', 'seated on the untimed OFT and the untimed flight: no SANS line, no amber', k1.placed && k2.placed && !st.w.sans.length && !ambered(st.s[RANGER]).length, `"${k1.toast}" / "${k2.toast}" · ${st.say}`, st.w.pic)
  await L.closeBoard(p, W)
  const b = await rBell(p, W, 'n8-bell')
  chk(W, 'n8.bell', 'his bell: no SANS reminder', !b.rem, sayB(b), b.pic)
}

/* F23 — the plain-user round */
SC.plain = async (p, W) => {
  await postR(p, W, 'pl.post')
  const ace = await idOf(p, 'Ace')
  await L.go(p, 'editsched')
  rec(W, 'pl.0', 'Saber opens Edit Schedule', `page ${await p.evaluate(() => window.CURPAGE)}`, await W.pic(p, 'pl-0-editsched'))
  const fl = await blank(p, W, 5, 'pl.line', { cs: 'PLAIN', to: '13:00', ld: '14:00' })
  const sc = (await A.addLine(p, W, 5, { kind: 'SC' })).wi
  const o = await W5.addSim(p, W, 5, 'oft', 'PL OFT', '', ''), m = await W5.addSim(p, W, 5, 'amt', 'PL AMT', '', '')
  rec(W, 'pl.1', 'the board of Sat 18: + Wave → flying line PLAIN 13:00–14:00, + Wave → SC, an OFT row and an AMT row (no times)', J({ fl: fl.f, sc, oft: o.r, amt: m.r }), await W.pic(p, 'pl-1-built'))
  const d1 = ace ? await place(p, W, 5, slot(fl.fcp), 'pl-2-ace', ace) : { placed: false, toast: 'no Ace' }
  const d2 = await place(p, W, 5, slot(`s:5.oft.${o.ri}.p`), 'pl-3-jester', IPMAN)
  const d3 = await place(p, W, 5, slot(`5.${sc}.0.0.p`), 'pl-4-ranger')
  chk(W, 'pl.2', 'crew dropped in: Ace on PLAIN, Jester (SANS, nothing filed) on the untimed OFT, Ranger on SC MAIN — the SC note carries no SANS words', d1.placed && d2.placed && d3.placed && !/SANS/.test(d3.toast), `"${d1.toast}" / "${d2.toast}" / "${d3.toast}"`, [d2.pic, d3.pic].join(', '))
  rec(W, 'pl.2n', "the note when Jester dropped on the untimed OFT (RECORD)", `"${d2.toast}"`)
  const tt = await setBox(p, W, 5, `[data-bfld="sr:5.amt.${m.ri}.str"]`, '10:00')
  rec(W, 'pl.3', 'a time typed: the AMT row\'s start 10:00', `box "${tt}" · row ${J(await p.evaluate(ri => window.DAYS[5].sims.amt[ri], m.ri))}`, await W.pic(p, 'pl-3-time'))
  await setBox(p, W, 5, `[data-bfld="sr:5.amt.${m.ri}.str"]`, '')
  const c1 = await A.cx(p, W, 5, `[data-lcx="5.${fl.wi}.0.0"]`, true, 'pl-4')
  const cx1 = await p.evaluate(w => !!window.DAYS[5].waves[w].formations[0].aircraft[0].cx, fl.wi)
  const c2 = await A.cx(p, W, 5, `[data-lcx="5.${fl.wi}.0.0"]`, false, 'pl-5')
  const cx2 = await p.evaluate(w => !!window.DAYS[5].waves[w].formations[0].aircraft[0].cx, fl.wi)
  chk(W, 'pl.4', 'the PLAIN line cancelled (CX, WX) and restored (Un-cancel)', c1.ok && cx1 && c2.ok && !cx2, `cancelled ${cx1} → ${cx2}`, [c1.pic, c2.pic].join(', '))
  /* Undo / Redo across a drop onto an SC seat and onto an untimed sim */
  const ud = async (sel, key, id, tag, label) => {
    const k = await place(p, W, 5, sel, tag, id)
    const u = await boardUndo(p, W, 5, 'undo', tag)
    const gone = !(await dayHold(p, 5, id)).some(x => x.includes(key))
    const r = await boardUndo(p, W, 5, 'redo', tag)
    const back = (await dayHold(p, 5, id)).some(x => x.includes(key))
    chk(W, 'pl.' + tag, `${label}: dropped, the board's Undo takes it back exactly, Redo puts it back`, k.placed && gone && back, `note "${k.toast}" · Undo "${u.title}" → "${u.toast}" · Redo → "${r.toast}"`, [u.pic, r.pic].join(', '))
  }
  await ud(slot(`5.${sc}.0.1.w`), `waves[${sc}].formations[0].aircraft[1].w`, MARLIN, 'ud-sc', 'Marlin (SANS WSO) onto SC AM MAIN row 2 RCP')
  await ud(slot(`s:5.amt.${m.ri}.p`), `sims.amt[${m.ri}].p`, RANGER, 'ud-amt', 'Ranger onto the untimed AMT front seat')
  const st = await state(p, W, 5, 'pl-6', [RANGER, IPMAN])
  rec(W, 'pl.6', "the day's warning list (RECORD)", st.say, st.w.pic)
  chk(W, 'pl.6c', 'nothing SANS on a standby row anywhere (no SANS line naming SC; Ranger\'s SC puck plain)', !st.w.sans.some(x => /\bSC\b/.test(x)) && !ambered(st.s[RANGER]).some(x => x.at === `5.${sc}.0.0.p`), st.say)
  await L.closeBoard(p, W)
  rec(W, 'pl.7', 'the board closed by ✓ Done', `page ${await p.evaluate(() => window.CURPAGE)} · board shown ${await p.locator('#schedBoard:visible').count()}`, await W.pic(p, 'pl-7-done'))
  const e = await Y.listE(p, W, WK1, 'sat', 'pl-8')
  rec(W, 'pl.8', "Edit Schedule's crew panel opened on Sat 18 (nothing picked) and closed", `${e.day} · Ranger ${meSay(e.l)}`, e.pic)
  await L.openBoard(p, W, 5)
  rec(W, 'pl.9', 'the Scheduler Board of Sat 18 opened again', `SBDAY ${await p.evaluate(() => window.SBDAY)}`, await W.pic(p, 'pl-9-board'))
  await L.closeBoard(p, W)
  await asR(p, W)
  const b = await bell(p, W, 'pl-10-bell')
  chk(W, 'pl.10', 'as Ranger: the bell — his SANS reminder names Sat 18 (the untimed AMT)', remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  if (b.rem) {
    const t = await tapAndRead(p, W, b.rem.id, 'pl-11')
    chk(W, 'pl.11', 'the reminder tapped: the SANS calendar on Sat 18 with its day window', t.page === 'inputs' && /Sat\w*\s*18/i.test(t.win || ''), t.ok ? `page "${t.page}" · month "${t.month}" · window "${t.win}"` : t.why, t.pic)
    await W5.sansDay(p, W, D[18])
    const x = p.locator('[data-testid="win-sansday-x"]:visible').first()
    if (await x.count()) await W.press(p, x, 'sansday-x')
    await sleep(400)
    const still = await p.locator('[data-testid="win-sansday"]:visible').count()
    chk(W, 'pl.12', 'the day window closed by its ✕', !still, `day window shown after ✕: ${still}`, await W.pic(p, 'pl-12-closed'))
  }
}

const ALL = ['f5', 'f6', 'f7', 'f8oft', 'f8win', 'f9', 'f10', 'n9', 'f15', 'f18', 'f19', 'a20', 'n57', 'n8', 'plain']
const only = (process.env.ONLY || '').split(',').filter(Boolean)
for (const n of ALL.filter(n => !only.length || only.includes(n))) {
  console.log('=== SCENARIO', n, SZ)
  await T.run(n, SZ, Y.scene(SC[n]))
}
writeFileSync(path.join(OUT, `results-all-${SZ}${only.length ? '-' + only.join('_') : ''}.json`), JSON.stringify(L.results, null, 1))
