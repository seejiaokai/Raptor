// sns-w1B — walker B of the D2573 walk (chat 179, 25 Nov 26): F3, F6, F7, F8, F12, F13, F14, F15, A-S09, A-S14, A-S17, A-S19
// and the plain-user round. Each scenario a fresh browser world, Saber signed in, clock 15 Jul 2026 09:00.
// Run from raptor-port/, one size a process:  SZ=d|p SNSB_RUN=run1 [ONLY=f3,f7] node scripts/handpass/sns-w1B.mjs
// Brief: D:/raptor-work/c179-walk/BRIEF.md. Routes proved by sns-w1B-probe2.mjs (pictures B/probe2/).
import './sns-w1B-env.mjs'
import { writeFileSync } from 'node:fs'
const Y = await import('./sns-w1B-lib.mjs')
const { K, X, T, L, W5, A, RANGER, IPMAN, D, WK1, WK2, J, sleep, need, asR, asS, scene, bell, say, sayB, tapAndRead, moveTo, OUT, path,
  R17, TODAYW, DOWS, postR, listOf, meSay, listSay, struckWith, plainIn, freeN, armB, pickB, seatHas, disarm, armE, pickE, disarmE, listE, blank, times, fileFor } = Y
const SZ = process.env.SZ || 'd'
console.log('VERSION sns-w1B 1 · size', SZ, '· run', process.env.SNSB_RUN || 'run1', '· only', process.env.ONLY || 'all')
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const MARLIN = 'cards' // a SANS WSO (RCP) by tick, nothing filed
const remWords = days => ({ title: "You're SANS from Fri 17 Jul.", body: `You're planned on ${days} with nothing filed. Tap to file for availability.` })
const remDays = l => l ? ((/You're planned on (.*) with nothing filed/.exec(l.body) || [])[1] || '') : ''
const NOFILE = /no availability filed/
const printedOf = l => (l && l.me && l.me[0] && l.me[0].printed) || ''
const titleOf = l => (l && l.me && l.me[0] && l.me[0].title) || ''

/* Ranger's bell read in the same tab (Saber signed out, Ranger in), then back to Saber */
async function rBell(p, W, tag) {
  await asR(p, W)
  const b = await bell(p, W, tag)
  await T.closeAll(p, W)
  await asS(p, W)
  return b
}
/* the man's crew puck tapped with nothing armed (the "where can he go" rings), each seat's ring read, then cleared */
async function rings(p, W, di, keys, tag, id = RANGER) {
  await L.openBoard(p, W, di)
  await disarm(p, W)
  await W5.boardDrawer(p, W, true)
  /* a press on his crew puck TOGGLES the selection (probe3): clear a selection left over first, select, read, then toggle off */
  const selNow = () => p.evaluate(id => !!document.querySelector(`#schedBoard .puck.sel[data-person="${id}"]`), id)
  if (await selNow()) { await W.press(p, `#schedBoard .rpuck[data-person="${id}"]:visible`, 'unsel-' + id); await sleep(400) }
  await W.press(p, `#schedBoard .rpuck[data-person="${id}"]:visible`, 'sel-' + id); await sleep(500)
  const selected = await selNow()
  await W5.boardDrawer(p, W, false)
  const r = await p.evaluate(ks => ks.map(k => { const e = [...document.querySelectorAll(`#schedBoard [data-slot="${k}"]`)].find(x => x.getBoundingClientRect().width > 0); return e ? `${k}:${/oktake/.test(e.className) ? 'GREEN RING' : 'no ring'}` : `${k}:not drawn` }), keys)
  const other = await p.evaluate(() => document.querySelectorAll('#schedBoard .oktake, #schedBoard .oktake-f').length)
  const pic = await W.pic(p, tag + '-rings')
  await W5.boardDrawer(p, W, true)
  if (await selNow()) { await W.press(p, `#schedBoard .rpuck[data-person="${id}"]:visible`, 'unsel-' + id); await sleep(400) }
  await W5.boardDrawer(p, W, false)
  return { r, other, pic, selected }
}
/* a blank line on day di with Ranger seated in its FCP (seat tapped, his name tapped) */
async function seatR(p, W, s, di, o = {}) {
  const a = await blank(p, W, di, s + '.line', o)
  const b = await armB(p, W, di, a.fcp, `${s}-seat${di}w${a.wi}`)
  const k = await pickB(p, W, a.fcp, `${s}-seat${di}w${a.wi}`)
  need(W, s + '.seat', `Ranger tapped into the FCP of the new ${DOWS[di]} line (seat tapped, then his name)`, k.placed, `armed ${b.armed} · note "${k.toast}"`, k.pic)
  await disarm(p, W)
  return { ...a, note: k.toast }
}

const SC = {}

/* F3 = A-S11 — his reminder and the crew list agree, with seats on Sat 18 and Mon 20 and no times anywhere */
SC.f3 = async (p, W) => {
  await postR(p, W, 'f3.post')
  const s18 = await seatR(p, W, 'f3', 5)
  await T.gotoWeek(p, W, WK2)
  const s20 = await seatR(p, W, 'f3', 0)
  await L.closeBoard(p, W)
  const wk = await T.gotoWeek(p, W, WK1)
  rec(W, 'f3.0', 'Saber leaves the schedule on another week (Mon 20 not shown) before Ranger signs in', `Edit Schedule on week ${wk}`)
  await asR(p, W)
  const b = await bell(p, W, 'f3-bell')
  const want = remWords('Sat 18, Mon 20 Jul')
  chk(W, 'f3.1', `Ranger's bell: "${want.title}" "${want.body}" (D2568: seats with no times count; each date once)`, b.rem && b.rem.title === want.title && b.rem.body === want.body, sayB(b), b.pic)
  if (b.rem) {
    const t = await tapAndRead(p, W, b.rem.id, 'f3-tap')
    chk(W, 'f3.2', 'the reminder tapped opens the SANS calendar on Sat 18 with its day window (D2340)', t.page === 'inputs' && /Sat\w*\s*18/i.test(t.win || ''), (t.ok ? `page "${t.page}" · month "${t.month}" · window "${t.win}" · list ${t.listOpen ? 'open' : 'closed'}` : t.why), t.pic)
  }
  await asS(p, W)
  const r = await armB(p, W, 5, s18.rcp, 'f3-rcp')
  chk(W, 'f3.3', "Saber picks the RCP of the same Sat 18 flight: Ranger struck on the crew list (the two surfaces agree)", struckWith(r.l), `armed ${r.armed} · ${meSay(r.l)}`, r.pic)
  await disarm(p, W)
  const e = await armE(p, W, WK1, s18.rcp, 'f3-ercp')
  chk(W, 'f3.4', "the same on Edit Schedule's crew panel", struckWith(e.l), `armed ${e.armed} · ${meSay(e.l)}`, e.pic)
  await disarmE(p, W)
}
/* A-S11's second half — the seats made BEFORE his SANS posting is saved */
SC.f3b = async (p, W) => {
  const s18 = await seatR(p, W, 'f3b', 5)
  await T.gotoWeek(p, W, WK2)
  await seatR(p, W, 'f3b', 0)
  await L.closeBoard(p, W)
  await T.gotoWeek(p, W, WK1)
  await postR(p, W, 'f3b.post')
  const b = await rBell(p, W, 'f3b-bell')
  const want = remWords('Sat 18, Mon 20 Jul')
  chk(W, 'f3b.1', `seats first, posting after: Ranger's bell still "${want.body}" (the same as posting first)`, b.rem && b.rem.title === want.title && b.rem.body === want.body, sayB(b), b.pic)
  const r = await armB(p, W, 5, s18.rcp, 'f3b-rcp')
  chk(W, 'f3b.2', 'Saber picks the other seat of the Sat 18 flight: Ranger struck', struckWith(r.l), meSay(r.l), r.pic)
  await disarm(p, W)
}

/* F6 = A-S08 — a man who has filed something is unchanged on a blank flight; once timed, the existing checks */
const F6 = {
  all: { kinds: ['fly'], spanR: 'all', spanI: 'all', timed: () => null },
  win: { kinds: ['fly'], spanR: ['08:00', '10:00'], spanI: ['08:00', '12:00'], timed: who => who === RANGER ? 'SANS — available 08:00–10:00 only' : 'SANS — available 08:00–12:00 only' },
  oft: { kinds: ['oft'], spanR: 'all', spanI: 'all', timed: () => 'SANS — not offering Fly' },
  amt: { kinds: ['amt'], spanR: 'all', spanI: 'all', timed: () => 'SANS — not offering Fly' },
}
for (const [k, c] of Object.entries(F6)) SC['f6' + k] = async (p, W) => {
  const s = 'f6' + k
  await postR(p, W, s + '.post')
  await fileFor(p, W, D[18], RANGER, c.kinds, c.spanR, s + '.fileR')
  await fileFor(p, W, D[18], IPMAN, c.kinds, c.spanI, s + '.fileI')
  const a = await blank(p, W, 5, s + '.line')
  await L.closeBoard(p, W)
  for (const [phase, tag] of [['blank', 'b'], ['timed', 't']]) {
    if (phase === 'timed') { const tt = await times(p, W, 5, a.wi, '13:00', '14:00'); rec(W, `${s}.tt`, 'take-off 13:00 and landing 14:00 typed on the line', J(tt)); await L.closeBoard(p, W) }
    const e = await armE(p, W, WK1, a.fcp, `${s}-${tag}`)
    const lj = await listOf(p, '.ros-body', IPMAN)
    for (const [who, l, nm] of [[RANGER, e.l, 'Ranger'], [IPMAN, lj, 'Jester']]) {
      const want = phase === 'blank' ? null : c.timed(who)
      if (want == null) chk(W, `${s}.${tag}-${nm}`, `${phase === 'blank' ? 'blank flight' : 'timed 13:00–14:00'}: ${nm} (filed ${c.kinds.join('+')} ${J(who === RANGER ? c.spanR : c.spanI)}) plain, no reason, not "no availability filed"`, plainIn(l) && !NOFILE.test(printedOf(l) + titleOf(l)), `${meSay(l)} · ${listSay(l).slice(0, 60)}`, e.pic)
      else chk(W, `${s}.${tag}-${nm}`, `timed 13:00–14:00: ${nm} struck "${want}" (as main)`, struckWith(l, want), meSay(l), e.pic)
    }
    rec(W, `${s}.${tag}-n`, `"SANS Avail · N free" with the ${phase} FCP picked`, `${e.l && e.l.head}`)
    await disarmE(p, W)
  }
}

/* F7 = A-S13 — standby lines strike nobody for nothing filed when their times are blank */
SC.f7 = async (p, W) => {
  await postR(p, W, 'f7.post')
  const waves = {}
  for (const kind of ['SC', 'AVALON', 'BB']) {
    const a = await A.addLine(p, W, 5, { kind })
    need(W, `f7.${kind}`, `+ Wave → ${kind} on Sat 18`, a.wi >= 0, J(a.f))
    waves[kind] = a.wi
  }
  const shape = await p.evaluate(([i, ws]) => Object.fromEntries(Object.entries(ws).map(([k, w]) => [k, window.DAYS[i].waves[w].formations.map(f => ({ to: f.to, ld: f.ld, ac: f.aircraft.map(x => !!x.spare) }))])), [5, waves])
  rec(W, 'f7.shape', 'the three standby lines as made (times; each aircraft spare?)', J(shape))
  /* every formation's times cleared */
  for (const [kind, wi] of Object.entries(waves)) for (let fi = 0; fi < shape[kind].length; fi++) {
    if (!shape[kind][fi].to && !shape[kind][fi].ld) continue
    await L.openBoard(p, W, 5)
    for (const f of ['to', 'ld']) {
      const sel = `[data-bfld="ff:5.${wi}.${fi}.${f}"]`
      if (await p.locator(L.B(sel)).count()) { const el = p.locator(L.B(sel)).first(); await el.scrollIntoViewIfNeeded(); if (W.isPhone) await el.tap(); else await el.click(); await sleep(120); await el.fill(''); await p.keyboard.press('Enter').catch(() => {}); await el.evaluate(e => e.blur()); await sleep(300) }
    }
  }
  const cleared = await p.evaluate(([i, ws]) => Object.fromEntries(Object.entries(ws).map(([k, w]) => [k, window.DAYS[i].waves[w].formations.map(f => `${f.to || '-'}/${f.ld || '-'}`).join(' ')])), [5, waves])
  need(W, 'f7.clear', 'every standby formation\'s times cleared (read back)', Object.values(cleared).every(v => !/\d/.test(v)), J(cleared))
  const seatsOf = kind => { const out = []; const fs = shape[kind]; for (let fi = 0; fi < fs.length; fi++) { const m = fs[fi].ac.indexOf(false), sp = fs[fi].ac.indexOf(true); if (m >= 0 && !out.some(x => x.tag === 'MAIN')) out.push({ tag: 'MAIN', key: `5.${waves[kind]}.${fi}.${m}` }); if (sp >= 0 && !out.some(x => x.tag === 'SPARE')) out.push({ tag: 'SPARE', key: `5.${waves[kind]}.${fi}.${sp}` }) } return out }
  const readAt = async (kind, st, suffix) => {
    for (const seat of ['p', 'w']) {
      const key = `${st.key}.${seat}`
      const r = await armB(p, W, 5, key, `f7-${kind}-${st.tag}-${seat}${suffix}`)
      const lj = await listOf(p, '#schedBoard', IPMAN)
      const lm = await listOf(p, '#schedBoard', MARLIN)
      const said = [r.l, lj, lm].map(l => printedOf(l) + ' ' + titleOf(l)).join(' | ')
      chk(W, `f7.${kind}-${st.tag}-${seat}${suffix}`, `${kind} ${st.tag} ${seat === 'p' ? 'FCP' : 'RCP'} armed, no times${suffix ? ' (FLIES ticked)' : ''}: no "no availability filed" for Ranger, Jester or Marlin`, r.armed && !NOFILE.test(said), `armed ${r.armed} · Ranger ${meSay(r.l)} · Jester ${meSay(lj)} · Marlin ${meSay(lm)}`, r.pic)
      await disarm(p, W)
    }
  }
  for (const kind of ['SC', 'AVALON', 'BB']) for (const st of seatsOf(kind)) await readAt(kind, st, '')
  /* AVALON and BB ticked FLIES, times still blank */
  for (const kind of ['AVALON', 'BB']) {
    await L.openBoard(p, W, 5)
    const fl = p.locator(`#schedBoard [data-safly^="5.${waves[kind]}."]:visible`).first()
    if (!(await fl.count())) { rec(W, `f7.${kind}-flies`, `${kind}: a FLIES button to tick`, 'none drawn on this line', await W.pic(p, `f7-${kind}-noflies`)); continue }
    const key = await fl.getAttribute('data-safly')
    await W.press(p, fl, 'flies-' + kind); await sleep(500)
    const on = await p.locator(`#schedBoard [data-safly="${key}"]:visible`).first().getAttribute('aria-pressed').catch(() => '?')
    rec(W, `f7.${kind}-flies`, `${kind}: its row ${key} ticked FLIES`, `aria-pressed ${on}`, await W5.clip(p, W, `#schedBoard [data-safly="${key}"]:visible`, `f7-${kind}-flies`, 30))
    const parts = key.split('.')
    await readAt(kind, { tag: 'FLIES', key: parts.slice(0, 4).join('.') }, '-flies')
  }
  /* control run (RECORDED, not this job's finding): SC MAIN with its AM times back */
  const sc0 = `5.${waves.SC}.0`
  await L.openBoard(p, W, 5)
  await L.typeBox(p, W, `[data-bfld="ff:${sc0}.to"]`, '07:00'); await L.typeBox(p, W, `[data-bfld="ff:${sc0}.ld"]`, '13:00')
  const m = seatsOf('SC').find(x => x.tag === 'MAIN')
  const r = await armB(p, W, 5, `${m.key}.p`, 'f7-SC-MAIN-timed')
  rec(W, 'f7.ctl', 'control: SC MAIN FCP with 07:00–13:00 typed — Ranger and Jester (the known timed strike, D2576–D2578 not built: not a finding)', `Ranger ${meSay(r.l)} · Jester ${meSay(await listOf(p, '#schedBoard', IPMAN))}`, r.pic)
  await disarm(p, W)
}

/* F8 = A-S10 — before, on and after his SANS date (and across midnight with the page open) */
SC.f8 = async (p, W) => {
  await postR(p, W, 'f8.post')
  const ln = {}
  for (const di of [3, 4, 5]) ln[di] = await blank(p, W, di, `f8.line${di}`)
  const tl = await blank(p, W, 5, 'f8.timed', { cs: 'TIMED', to: '13:00', ld: '14:00' })
  await L.closeBoard(p, W)
  const pass = async (tag, label) => {
    const ctl = await armB(p, W, 5, tl.fcp, `f8-${tag}-timed`); await disarm(p, W)
    const ctlWords = printedOf(ctl.l)
    rec(W, `f8.${tag}-ctl`, `${label}: control — the TIMED Sat 18 line's FCP: Ranger`, meSay(ctl.l), ctl.pic)
    const out = {}
    for (const di of [3, 4, 5]) {
      const r = await armB(p, W, di, ln[di].fcp, `f8-${tag}-${DOWS[di]}`)
      out[di] = r
      if (di === 3) chk(W, `f8.${tag}-Thu`, `${label}: Thu 16 blank FCP — Ranger an ordinary man, in his own column, plain`, plainIn(r.l) && r.l.me.every(x => x.where !== 'SANS Avail'), meSay(r.l), r.pic)
      else chk(W, `f8.${tag}-${DOWS[di]}`, `${label}: ${DOWS[di]} ${di + 13} blank FCP — Ranger struck with the timed seat's words ("${ctlWords}")`, struckWith(r.l) && printedOf(r.l) === ctlWords && !!ctlWords, meSay(r.l), r.pic)
      await disarm(p, W)
    }
    return { ctlWords, out }
  }
  const p1 = await pass('wed', 'Wed 15, 09:00')
  chk(W, 'f8.wed-words', `Wed 15: the words before his date are "${R17}"`, p1.ctlWords === R17, p1.ctlWords)
  const wk = await listE(p, W, WK1, 'fri', 'f8-wed-unpicked')
  chk(W, 'f8.wed-unpicked', 'Edit Schedule crew list, Fri 17, NOTHING picked: Ranger struck, no reason line printed (D2420)', wk.l.me.some(x => x.struck) && !printedOf(wk.l), `${wk.day} · ${meSay(wk.l)}`, wk.pic)
  /* across midnight, the page left open */
  await L.closeBoard(p, W)
  await p.clock.setSystemTime(new Date('2026-07-16T23:59:50'))
  await p.clock.runFor(20000).catch(() => {})
  await sleep(500)
  rec(W, 'f8.mid', "the page left open across midnight: the app's today now", await L.today(p))
  const p2 = await pass('mid', 'just after midnight into Fri 17, page never reloaded')
  rec(W, 'f8.mid-words', 'after midnight, page open: the timed seat\'s words and the blank seats\' (RECORD)', `timed "${p2.ctlWords}" · Fri "${printedOf(p2.out[4].l)}" · Sat "${printedOf(p2.out[5].l)}"`)
  /* reopened on Fri 17 */
  const now = await T.moveClock(p, W, '2026-07-17T09:00:00')
  rec(W, 'f8.fri', 'clock Fri 17 09:00, page reloaded, Saber signed in', now)
  const p3 = await pass('fri', 'Fri 17, reopened')
  chk(W, 'f8.fri-words', `Fri 17: the words are now the ordinary "${TODAYW}" (the timed seat's), not the future-start sentence`, p3.ctlWords === TODAYW && printedOf(p3.out[5].l) === TODAYW, `timed "${p3.ctlWords}" · Sat "${printedOf(p3.out[5].l)}"`)
}

/* F12 = A-S12 — a cancelled flight with no times */
SC.f12 = async (p, W) => {
  await postR(p, W, 'f12.post')
  const l1 = await seatR(p, W, 'f12', 5)
  const l3 = await blank(p, W, 5, 'f12.empty-blank')
  const l4 = await blank(p, W, 5, 'f12.empty-timed', { cs: 'TIMED', to: '13:00', ld: '14:00' })
  await L.closeBoard(p, W)
  let b = await rBell(p, W, 'f12-bell0')
  chk(W, 'f12.1', 'Ranger on the uncancelled blank flight: his bell names Sat 18', remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  const c1 = await A.cx(p, W, 5, `[data-lcx="5.${l1.wi}.0.0"]`, true, 'f12-l1')
  need(W, 'f12.cx1', "Saber cancels Ranger's blank line (CX, reason WX, Cancel line)", c1.ok && await p.evaluate(([i, w]) => !!window.DAYS[i].waves[w].formations[0].aircraft[0].cx, [5, l1.wi]), c1.why || '', c1.pic)
  await L.closeBoard(p, W)
  b = await rBell(p, W, 'f12-bell1')
  chk(W, 'f12.2', 'his only Sat 18 flight cancelled: the bell no longer names Sat 18 (D2568)', !b.rem || !/Sat 18/.test(b.rem.body), sayB(b), b.pic)
  /* the crew list on a cancelled blank seat and a cancelled timed seat */
  for (const [l, nm] of [[l3, 'blank'], [l4, 'timed']]) {
    const c = await A.cx(p, W, 5, `[data-lcx="5.${l.wi}.0.0"]`, true, `f12-${nm}`)
    need(W, `f12.cx-${nm}`, `Saber cancels the empty ${nm} line`, c.ok, c.why || '', c.pic)
  }
  const rb = await armB(p, W, 5, l3.fcp, 'f12-cxblank'); await disarm(p, W)
  const rt = await armB(p, W, 5, l4.fcp, 'f12-cxtimed'); await disarm(p, W)
  rec(W, 'f12.3a', 'the cancelled BLANK line\'s FCP armed: Ranger', `armed ${rb.armed} · ${meSay(rb.l)}`, rb.pic)
  rec(W, 'f12.3b', 'the cancelled TIMED line\'s FCP armed: Ranger', `armed ${rt.armed} · ${meSay(rt.l)}`, rt.pic)
  chk(W, 'f12.3', 'a cancelled blank line behaves as a cancelled timed one on the crew list (D2568 "as built": both strike, same words)', !!rb.armed === !!rt.armed && struckWith(rb.l) === struckWith(rt.l) && printedOf(rb.l) === printedOf(rt.l), `blank: ${meSay(rb.l)} · timed: ${meSay(rt.l)}`)
  const u = await A.cx(p, W, 5, `[data-lcx="5.${l1.wi}.0.0"]`, false, 'f12-l1')
  need(W, 'f12.uncx', "Saber un-cancels Ranger's line", u.ok && await p.evaluate(([i, w]) => !window.DAYS[i].waves[w].formations[0].aircraft[0].cx, [5, l1.wi]), u.why || '', u.pic)
  await L.closeBoard(p, W)
  b = await rBell(p, W, 'f12-bell2')
  chk(W, 'f12.4', 'un-cancelled: the bell names Sat 18 again', remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  /* a second uncancelled flight that day keeps the date when the first is cancelled again */
  await seatR(p, W, 'f12b', 5)
  const c2 = await A.cx(p, W, 5, `[data-lcx="5.${l1.wi}.0.0"]`, true, 'f12-l1again')
  need(W, 'f12.cx2', "Saber cancels Ranger's first line again (his second blank line stays)", c2.ok, c2.why || '', c2.pic)
  await L.closeBoard(p, W)
  b = await rBell(p, W, 'f12-bell3')
  chk(W, 'f12.5', 'one of his two Sat 18 flights cancelled: the bell still names Sat 18', remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
}

/* F13 = A-S22 — the strike lifts when he stops being SANS, follows a moved posting, and goes with Undo */
SC.f13 = async (p, W) => {
  await postR(p, W, 'f13.post')
  const a = await blank(p, W, 5, 'f13.line')
  /* (c) planted, then Undo, then Redo */
  const r0 = await armB(p, W, 5, a.fcp, 'f13-c0')
  const k = await pickB(p, W, a.fcp, 'f13-c')
  need(W, 'f13.c0', 'Ranger tapped into the blank FCP', k.placed, `note "${k.toast}"`, k.pic)
  await disarm(p, W)
  await L.hideToast(p)
  const ut = await p.locator('#sbUndo').first().getAttribute('title').catch(() => '')
  await W.press(p, '#sbUndo:visible', 'sbundo'); await sleep(700)
  const toastU = await L.toastSaid(p)
  const emptied = !(await seatHas(p, a.fcp, RANGER))
  const pu = await W.pic(p, 'f13-c-undone')
  chk(W, 'f13.c1', "the board's Undo empties the seat", emptied, `Undo title "${ut}" · note "${toastU}"`, pu)
  const r1 = await armB(p, W, 5, a.fcp, 'f13-c1')
  chk(W, 'f13.c2', 'after Undo, the seat picked again: the list as before (Ranger struck, same words, same count) and no stale note', struckWith(r1.l, printedOf(r0.l)) && r1.l.head === r0.l.head && !/planned|Ranger —/.test(await L.toastSaid(p)), `before: ${meSay(r0.l)} "${r0.l.head}" · after: ${meSay(r1.l)} "${r1.l.head}" · note now "${await L.toastSaid(p)}"`, r1.pic)
  await disarm(p, W)
  await W.press(p, '#sbRedo:visible', 'sbredo'); await sleep(700)
  chk(W, 'f13.c3', "the board's Redo puts him back", await seatHas(p, a.fcp, RANGER), `note "${await L.toastSaid(p)}"`, await W.pic(p, 'f13-c-redone'))
  await W.press(p, '#sbUndo:visible', 'sbundo2'); await sleep(700)
  await L.closeBoard(p, W)
  /* (a) Jester unticked on Quals */
  const j0 = await armB(p, W, 5, a.fcp, 'f13-a0', IPMAN)
  chk(W, 'f13.a0', `Jester (SANS by tick) struck "${TODAYW}" on the blank FCP`, struckWith(j0.l, TODAYW), meSay(j0.l), j0.pic)
  await disarm(p, W); await L.closeBoard(p, W)
  const q = await L.qualsTick(p, W, IPMAN, 'f13-a')
  need(W, 'f13.a-tick', 'Quals → Edit → Jester\'s SANS unticked → Done', q.st && q.st.san === false, J(q.st), q.pic)
  const j1 = await armB(p, W, 5, a.fcp, 'f13-a1', IPMAN)
  chk(W, 'f13.a1', 'Jester no longer SANS: in his seat column, plain', plainIn(j1.l) && j1.l.me.every(x => x.where !== 'SANS Avail'), meSay(j1.l), j1.pic)
  await disarm(p, W); await L.closeBoard(p, W)
  /* A-S22: a pilot ticked SANS by hand, no posting */
  const pid = await p.evaluate(() => Object.entries(window.PEOPLE).filter(([k, q]) => q.seat === 'FCP' && !q.san && !q.archived && k !== 'bane' && !q.ph).map(([k]) => k)[0])
  const cs = await p.evaluate(id => window.PEOPLE[id].cs, pid)
  const q2 = await L.qualsTick(p, W, pid, 'f13-t')
  need(W, 'f13.t-tick', `Quals → Edit → ${cs}'s SANS ticked (no posting) → Done`, q2.st && q2.st.san === true, J(q2.st), q2.pic)
  const t1 = await armB(p, W, 5, a.fcp, 'f13-t1', pid)
  chk(W, 'f13.t1', `${cs}, ticked SANS by hand with nothing filed: struck "${TODAYW}" on the blank FCP`, struckWith(t1.l, TODAYW), meSay(t1.l), t1.pic)
  await disarm(p, W); await L.closeBoard(p, W)
  /* (b) Ranger's posting moved to Sun 19, back to Fri 17, then taken back */
  await moveTo(p, W, D[17], D[19], 'f13.m19')
  const m1 = await armB(p, W, 5, a.fcp, 'f13-m19')
  chk(W, 'f13.b1', 'posting moved to Sun 19: on Sat 18 Ranger is ordinary (his column, plain)', plainIn(m1.l) && m1.l.me.every(x => x.where !== 'SANS Avail'), meSay(m1.l), m1.pic)
  await disarm(p, W); await L.closeBoard(p, W)
  await moveTo(p, W, D[19], D[17], 'f13.m17')
  const m2 = await armB(p, W, 5, a.fcp, 'f13-m17')
  chk(W, 'f13.b2', 'moved back to Fri 17: Sat 18 strikes him again with the future-start words', struckWith(m2.l, R17), meSay(m2.l), m2.pic)
  await disarm(p, W); await L.closeBoard(p, W)
  await K.undoPost(p, W, D[17], 'f13.undo')
  const m3 = await armB(p, W, 5, a.fcp, 'f13-undone')
  chk(W, 'f13.b3', 'posting taken back (Undo post out): Ranger in his column, plain', plainIn(m3.l) && m3.l.me.every(x => x.where !== 'SANS Avail'), meSay(m3.l), m3.pic)
  await disarm(p, W)
}

/* F14 — next week: Mon 20, picked-seat words = the unpicked list's hover words */
SC.f14 = async (p, W) => {
  await postR(p, W, 'f14.post')
  await T.gotoWeek(p, W, WK2)
  const a = await blank(p, W, 0, 'f14.line')
  await L.closeBoard(p, W)
  const u = await listE(p, W, WK2, 'mon', 'f14-unpicked')
  const hover = titleOf(u.l).replace(/^Ranger — /, '')
  rec(W, 'f14.0', 'Edit Schedule crew list, Mon 20, nothing picked: Ranger', `${u.day} · ${meSay(u.l)}`, u.pic)
  const e = await armE(p, W, WK2, a.fcp, 'f14')
  chk(W, 'f14.1', `Mon 20 blank FCP picked: Ranger struck with the unpicked hover's sentence ("${hover}")`, struckWith(e.l, hover), meSay(e.l), e.pic)
  await disarmE(p, W)
  const b = await armB(p, W, 0, a.fcp, 'f14-board')
  chk(W, 'f14.2', 'the same on the Scheduler Board', struckWith(b.l, hover), meSay(b.l), b.pic)
  await disarm(p, W)
}

/* F15 — a part-week filing: Sat 18 filed by Ranger himself, Sun 19 not */
SC.f15 = async (p, W) => {
  await postR(p, W, 'f15.post')
  await asR(p, W)
  await K.file(p, W, D[18], D[18], 'f15.file')
  await asS(p, W)
  const a18 = await blank(p, W, 5, 'f15.l18')
  const a19 = await blank(p, W, 6, 'f15.l19')
  await L.closeBoard(p, W)
  const e18 = await armE(p, W, WK1, a18.fcp, 'f15-18'); await disarmE(p, W)
  const e19 = await armE(p, W, WK1, a19.fcp, 'f15-19'); await disarmE(p, W)
  chk(W, 'f15.1', 'Sat 18 (filed Fly all day): Ranger plain', plainIn(e18.l), meSay(e18.l), e18.pic)
  chk(W, 'f15.2', `Sun 19 (nothing filed): Ranger struck "${R17}"`, struckWith(e19.l, R17), meSay(e19.l), e19.pic)
  let b = await rBell(p, W, 'f15-bell0')
  rec(W, 'f15.3', 'his bell before he is seated anywhere Sat 18 – Sun 19', sayB(b), b.pic)
  for (const [a, di] of [[a18, 5], [a19, 6]]) {
    await armB(p, W, di, a.fcp, `f15-seat${di}`)
    const k = await pickB(p, W, a.fcp, `f15-seat${di}`)
    need(W, `f15.seat${di}`, `Ranger tapped into the ${DOWS[di]} blank FCP`, k.placed, `note "${k.toast}"`, k.pic)
    await disarm(p, W)
  }
  await L.closeBoard(p, W)
  b = await rBell(p, W, 'f15-bell1')
  chk(W, 'f15.4', 'seated on both: his bell names Sun 19 only', remDays(b.rem) === 'Sun 19 Jul', sayB(b), b.pic)
}

/* A-S09 — filing changes while the schedule is hidden: filed, deleted, Undo, Redo, moved to Sun 19 */
SC.as09 = async (p, W) => {
  await postR(p, W, 'as09.post')
  const a18 = await blank(p, W, 5, 'as09.l18')
  const a19 = await blank(p, W, 6, 'as09.l19')
  await L.closeBoard(p, W)
  const look = async (tag, label, want) => {
    const r = await armB(p, W, 5, a18.fcp, `as09-${tag}`)
    await disarm(p, W)
    const g = await rings(p, W, 5, [a18.fcp], `as09-${tag}`)
    const ok = want === 'plain' ? plainIn(r.l) : struckWith(r.l, R17)
    /* calibrated: the selection must be on and some other place lit, or the ring read proves nothing (walk-scripts §4) */
    const ringOk = g.selected && g.other > 0 && (want === 'plain' ? /GREEN/.test(g.r[0]) : /no ring/.test(g.r[0]))
    chk(W, `as09.${tag}`, `${label}: Sat 18 blank FCP — Ranger ${want === 'plain' ? 'plain' : 'struck "' + R17 + '"'}; his rings ${want === 'plain' ? 'light' : 'do not light'} that seat`, ok && ringOk, `${meSay(r.l)} · "${r.l && r.l.head}" · Ranger selected ${g.selected} · rings ${g.r.join(' ')} (${g.other} lit on the board)`, [r.pic, g.pic].join(', '))
    await L.closeBoard(p, W)
  }
  await look('0', 'nothing filed', 'struck')
  const f = await fileFor(p, W, D[18], RANGER, ['fly'], 'all', 'as09.file')
  await look('1', 'Fly all day filed for Sat 18 (Inputs → SANS), back to the schedule', 'plain')
  const del = await W5.uncommit(p, W, D[18], f.iid, 'as09-del')
  need(W, 'as09.del', 'the filing opened from its SANS day and deleted', del.ok, del.why || '', del.pic)
  await T.closeAll(p, W)
  await look('2', 'the filing deleted', 'struck')
  await L.go(p, 'inputs')
  const u = await Y.Z.topBar(p, W, 'undo', RANGER, 'as09-undo')
  const back = await p.evaluate(i => (window.INPUTS || []).some(r => r.iid === i), f.iid)
  rec(W, 'as09.u', 'the top bar Undo on the Inputs page', `${u.pressed ? 'pressed' : 'NOT pressed'} "${u.title}" · note "${u.toast}" · filing back ${back}`, u.pic)
  await look('3', 'the deletion undone', back ? 'plain' : 'struck')
  await L.go(p, 'inputs')
  const rd = await Y.Z.topBar(p, W, 'redo', RANGER, 'as09-redo')
  const gone = !(await p.evaluate(i => (window.INPUTS || []).some(r => r.iid === i), f.iid))
  rec(W, 'as09.r', 'the top bar Redo on the Inputs page', `${rd.pressed ? 'pressed' : 'NOT pressed'} "${rd.title}" · note "${rd.toast}" · filing gone ${gone}`, rd.pic)
  await look('4', 'the deletion redone', gone ? 'struck' : 'plain')
  /* moved from Sat 18 to Sun 19 */
  const f2 = await fileFor(p, W, D[18], RANGER, ['fly'], 'all', 'as09.file2')
  /* a saved filing's window says "To change its dates, delete it and add it again on the SANS calendar." (run1's picture
     as09-as09-move-form): the move is that door — delete Sat 18's, add Sun 19's */
  const d2 = await W5.uncommit(p, W, D[18], f2.iid, 'as09-move-del')
  need(W, 'as09.mdel', 'the Sat 18 filing deleted (its window: "delete it and add it again")', d2.ok, d2.why || '', d2.pic)
  await T.closeAll(p, W)
  const f3 = await fileFor(p, W, D[19], RANGER, ['fly'], 'all', 'as09.file19')
  const recd = await p.evaluate(i => { const r = (window.INPUTS || []).find(x => x.iid === i); return r ? { date: r.date, end: r.endDate || null } : null }, f3.iid)
  rec(W, 'as09.m', 'the filing moved to Sun 19 by delete and add again', `record now ${J(recd)}`)
  if (recd && recd.date === 'Jul 19' && !recd.end) {
    await look('5', 'the filing moved to Sun 19', 'struck')
    const r19 = await armB(p, W, 6, a19.fcp, 'as09-5-sun'); await disarm(p, W)
    chk(W, 'as09.5s', 'Sun 19 blank FCP after the move: Ranger plain', plainIn(r19.l), meSay(r19.l), r19.pic)
  } else rec(W, 'as09.5', 'the move check', 'NOT WALKED: the filing did not land on Sun 19 alone (' + J(recd) + ')')
}

/* A-S14 — sims with no times: RECORD the crew list; the reminder counts them (D2568) */
SC.as14 = async (p, W) => {
  await postR(p, W, 'as14.post')
  const o = await W5.addSim(p, W, 5, 'oft', 'B SIM', '', '')
  const m = await W5.addSim(p, W, 6, 'amt', 'B AMT', '', '')
  need(W, 'as14.rows', 'an OFT row on Sat 18 and an AMT row on Sun 19, no times typed (read back)', !o.r.str && !o.r.end && !m.r.str && !m.r.end, `OFT ${J(o.r)} · AMT ${J(m.r)}`)
  const zones = async (di, kind, ri) => { await L.openBoard(p, W, di); return p.evaluate(([di, kind, ri]) => [...new Set([...document.querySelectorAll(`#schedBoard [data-slot^="s:${di}.${kind}.${ri}."], #schedBoard [data-fill^="s:${di}.${kind}.${ri}."]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.slot ? `[data-slot="${e.dataset.slot}"]` : `[data-fill="${e.dataset.fill}"]`))], [di, kind, ri]) }
  const readZones = async (di, kind, ri, suffix) => {
    for (const z of await zones(di, kind, ri)) {
      const r = await A.armZone(p, W, z, `as14-${kind}-${z.replace(/\W+/g, '')}${suffix}`)
      await L.openBoard(p, W, di)
      // armZone disarms after reading; read Jester by re-arming once more
      rec(W, `as14.${kind}${suffix}-${z.replace(/\W+/g, '')}`, `${kind.toUpperCase()} ${suffix ? '13:00–14:00' : 'no times'} — ${z} armed: Ranger (RECORD; D2573's flight-only boundary, the owner's open question)`, `armed ${r.armed} · ${A.crewSay(r.c)}`, r.pic)
    }
  }
  await readZones(5, 'oft', o.ri, '')
  await readZones(6, 'amt', m.ri, '')
  /* Ranger placed in both (front seat / a passenger place) */
  await L.openBoard(p, W, 5)
  const zo = (await zones(5, 'oft', o.ri))[0]
  await L.armAndPick(p, W, zo, RANGER, 'oft')
  await L.openBoard(p, W, 6)
  const za = (await zones(6, 'amt', m.ri))[0]
  await L.armAndPick(p, W, za, RANGER, 'amt')
  const held = await T.holds(p, RANGER)
  need(W, 'as14.placed', 'Ranger placed in the untimed OFT (Sat 18) and AMT (Sun 19)', /Jul 18: .*sims\.oft/.test(held) && /Jul 19: .*sims\.amt/.test(held), held)
  await L.closeBoard(p, W)
  const b = await rBell(p, W, 'as14-bell')
  chk(W, 'as14.bell', 'his bell names Sat 18 and Sun 19 — an uncancelled sim with no times counts (D2568)', remDays(b.rem) === 'Sat 18, Sun 19 Jul', sayB(b), b.pic)
  /* times typed, then read again (RECORD) */
  await L.openBoard(p, W, 5)
  await L.typeBox(p, W, `[data-bfld="sr:5.oft.${o.ri}.str"]`, '13:00'); await L.typeBox(p, W, `[data-bfld="sr:5.oft.${o.ri}.end"]`, '14:00')
  await L.openBoard(p, W, 6)
  await L.typeBox(p, W, `[data-bfld="sr:6.amt.${m.ri}.str"]`, '13:00'); await L.typeBox(p, W, `[data-bfld="sr:6.amt.${m.ri}.end"]`, '14:00')
  const o2 = await W5.addSim(p, W, 5, 'oft', 'B SIM2', '13:00', '14:00')
  await readZones(5, 'oft', o2.ri, '-timed')
  const m2 = await W5.addSim(p, W, 6, 'amt', 'B AMT2', '13:00', '14:00')
  await readZones(6, 'amt', m2.ri, '-timed')
}

/* A-S17 — new data survives leaving and reloading */
SC.as17 = async (p, W) => {
  await postR(p, W, 'as17.post')
  const l1 = await seatR(p, W, 'as17', 5)
  const l2 = await blank(p, W, 5, 'as17.l2')
  await L.closeBoard(p, W)
  await T.gotoWeek(p, W, WK2); await T.gotoWeek(p, W, WK1)
  const r0 = await armB(p, W, 5, l2.fcp, 'as17-0'); await disarm(p, W); await L.closeBoard(p, W)
  chk(W, 'as17.0', 'weeks changed and back: the second blank line\'s FCP — Ranger struck', struckWith(r0.l, R17), meSay(r0.l), r0.pic)
  await T.reload(p, 'ad', 'a')
  const kept = await p.evaluate(([i, a, b]) => { const d = window.DAYS[i]; const f1 = d.waves[a] && d.waves[a].formations[0], f2 = d.waves[b] && d.waves[b].formations[0]; return { l1: f1 ? { to: f1.to, ld: f1.ld, p: f1.aircraft[0].p } : null, l2: f2 ? { to: f2.to, ld: f2.ld, p: f2.aircraft[0].p } : null } }, [5, l1.wi, l2.wi])
  chk(W, 'as17.1', 'reloaded, signed in: both blank lines kept (no times), Ranger still in the first', kept.l1 && kept.l1.p === RANGER && !kept.l1.to && !kept.l1.ld && kept.l2 && !kept.l2.p && !kept.l2.to, J(kept), await W.pic(p, 'as17-reloaded'))
  const r1 = await armB(p, W, 5, l2.fcp, 'as17-1'); await disarm(p, W); await L.closeBoard(p, W)
  chk(W, 'as17.2', 'after the reload, the seat re-picked: Ranger struck with the same words', struckWith(r1.l, R17), meSay(r1.l), r1.pic)
  const f = await fileFor(p, W, D[18], RANGER, ['fly'], 'all', 'as17.file')
  await T.reload(p, 'ad', 'a')
  const fk = await p.evaluate(i => (window.INPUTS || []).some(r => r.iid === i), f.iid)
  const r2 = await armB(p, W, 5, l2.fcp, 'as17-2'); await disarm(p, W); await L.closeBoard(p, W)
  chk(W, 'as17.3', 'filing saved, reloaded: the filing kept and Ranger plain on the re-picked seat', fk && plainIn(r2.l), `filing kept ${fk} · ${meSay(r2.l)}`, r2.pic)
  const b = await rBell(p, W, 'as17-bell')
  chk(W, 'as17.4', 'his bell after the filing: Sat 18 not named', !b.rem || !/Sat 18/.test(b.rem.body), sayB(b), b.pic)
}

/* A-S19 — a shared filing is still one filing */
SC.as19 = async (p, W) => {
  await postR(p, W, 'as19.post')
  const a = await blank(p, W, 5, 'as19.line')
  await L.closeBoard(p, W)
  const f = await fileFor(p, W, D[18], [RANGER, MARLIN], ['fly'], 'all', 'as19.file')
  const read = async (tag, label, wantR, wantM) => {
    const r = await armB(p, W, 5, a.fcp, `as19-${tag}-fcp`); await disarm(p, W)
    const m = await armB(p, W, 5, a.rcp, `as19-${tag}-rcp`, MARLIN); await disarm(p, W)
    await L.closeBoard(p, W)
    chk(W, `as19.${tag}r`, `${label}: FCP — Ranger ${wantR === 'plain' ? 'plain' : 'struck "' + R17 + '"'}`, wantR === 'plain' ? plainIn(r.l) : struckWith(r.l, R17), meSay(r.l), r.pic)
    chk(W, `as19.${tag}m`, `${label}: RCP — Marlin (SANS WSO) plain`, plainIn(m.l), meSay(m.l), m.pic)
  }
  await read('1', 'one filing naming Ranger and Marlin', 'plain')
  await T.closeAll(p, W); await X.openSans(p, W)   // X.openLine reads the SANS month: the SANS tab first (run1's ERR)
  const o = await X.openLine(p, W, D[18], f.iid, 'as19-open')
  need(W, 'as19.open', 'the shared filing opened from its SANS day', o.ok, J(o.r), o.pic)
  const w = await X.setWho(p, W, [MARLIN])
  const s = await X.saveInp(p, W, 'as19-out')
  const after = await p.evaluate(i => { const r = (window.INPUTS || []).find(x => x.iid === i); return r ? (r.people || [r.person]).map(x => x && (x.p || x)).join('+') : null }, f.iid)
  need(W, 'as19.out', 'Saber takes only Ranger out of it (Save)', after === MARLIN, `${w} · note "${s.said}" · people now ${after}`, s.pic)
  await T.closeAll(p, W)
  await read('2', 'Ranger taken out of the shared filing', 'struck')
  await fileFor(p, W, D[19], RANGER, ['fly'], 'all', 'as19.file19')
  await read('3', 'plus a Sun 19-only filing for Ranger', 'struck')
  await armB(p, W, 5, a.fcp, 'as19-seat')
  const k = await pickB(p, W, a.fcp, 'as19-seat')
  need(W, 'as19.seat', 'Ranger tapped into the Sat 18 blank FCP', k.placed, `note "${k.toast}"`, k.pic)
  await disarm(p, W); await L.closeBoard(p, W)
  const b = await rBell(p, W, 'as19-bell')
  chk(W, 'as19.4', "Ranger's bell names Sat 18 (Marlin's filing and his own Sun 19 one never clear him)", remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
}

/* the plain-user round */
SC.plain = async (p, W) => {
  await postR(p, W, 'pl.post')
  await L.go(p, 'editsched')
  rec(W, 'pl.0', 'Saber opens Edit Schedule', `page ${await p.evaluate(() => window.CURPAGE)}`, await W.pic(p, 'pl-0-editsched'))
  const a = await blank(p, W, 5, 'pl.line')
  rec(W, 'pl.1', 'the Scheduler Board of Sat 18 → + Wave → Flying wave: a new line, no times', J(a.f), await W.pic(p, 'pl-1-line'))
  const r = await armB(p, W, 5, a.fcp, 'pl-2')
  rec(W, 'pl.2', 'the seat tapped: the crew list reads (Ranger)', `armed ${r.armed} · ${meSay(r.l)} · "${r.l && r.l.head}"`, r.pic)
  const k = await pickB(p, W, a.fcp, 'pl-3')
  rec(W, 'pl.3', 'his name tapped: placed; the note at the foot', `placed ${k.placed} · note "${k.toast}"`, k.pic)
  await disarm(p, W)
  const tt = await times(p, W, 5, a.wi, '13:00', '14:00')
  chk(W, 'pl.4', 'take-off 13:00 and landing 14:00 typed', tt.to === '13:00' && tt.ld === '14:00', J(tt), await W.pic(p, 'pl-4-times'))
  await W.press(p, '#sbUndo:visible', 'sbundo'); await sleep(700)
  const u = await p.evaluate(([i, w]) => { const x = window.DAYS[i].waves[w].formations[0]; return { to: x.to, ld: x.ld } }, [5, a.wi])
  chk(W, 'pl.5', "the board's Undo takes back the last change (the landing)", u.ld !== '14:00', `${J(u)} · note "${await L.toastSaid(p)}"`, await W.pic(p, 'pl-5-undo'))
  await W.press(p, '#sbRedo:visible', 'sbredo'); await sleep(700)
  const rd = await p.evaluate(([i, w]) => { const x = window.DAYS[i].waves[w].formations[0]; return { to: x.to, ld: x.ld } }, [5, a.wi])
  chk(W, 'pl.6', "the board's Redo puts it back", rd.ld === '14:00', `${J(rd)} · note "${await L.toastSaid(p)}"`, await W.pic(p, 'pl-6-redo'))
  await L.closeBoard(p, W)
  rec(W, 'pl.7', 'the board closed by ✓ Done', `board open ${await p.locator('#schedBoard').count()} · page ${await p.evaluate(() => window.CURPAGE)}`, await W.pic(p, 'pl-7-done'))
  await L.openBoard(p, W, 5)
  rec(W, 'pl.8', 'the Scheduler Board of Sat 18 opened again', `SBDAY ${await p.evaluate(() => window.SBDAY)}`, await W.pic(p, 'pl-8-board'))
  const w = await A.warns(p, W, 5, 'pl-9')
  chk(W, 'pl.9', 'the day\'s warning list opened: no line for nothing filed (unchanged)', !w.sans.some(x => NOFILE.test(x)), A.warnSay(w), w.pic)
  await L.closeBoard(p, W)
  await asR(p, W)
  const b = await bell(p, W, 'pl-10-bell')
  chk(W, 'pl.10', "as Ranger: the bell opened — his SANS reminder names Sat 18", remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  if (b.rem) {
    const t = await tapAndRead(p, W, b.rem.id, 'pl-11')
    chk(W, 'pl.11', 'the reminder tapped: the SANS calendar on Sat 18 with its day window', t.page === 'inputs' && /Sat\w*\s*18/i.test(t.win || ''), t.ok ? `page "${t.page}" · month "${t.month}" · window "${t.win}"` : t.why, t.pic)
    const x = p.locator('[data-testid="win-sansday-x"]:visible').first()
    if (await x.count()) await W.press(p, x, 'sansday-x')
    await sleep(400)
    const still = await p.locator('[data-testid="win-sansday"]:visible').count()
    chk(W, 'pl.12', "what the tap opened closed by its ✕", !still, `day window shown after ✕: ${still}`, await W.pic(p, 'pl-12-closed'))
  }
}

const ALL = SZ === 'd' ? ['f3', 'f3b', 'f6all', 'f6win', 'f6oft', 'f6amt', 'f7', 'f8', 'f12', 'f13', 'f14', 'f15', 'as09', 'as14', 'as17', 'as19', 'plain']
  : ['f3', 'f3b', 'f6all', 'f6win', 'f6oft', 'f6amt', 'f7', 'f8', 'f12', 'f13', 'as09', 'as14', 'as17', 'as19', 'plain']
const only = (process.env.ONLY || '').split(',').filter(Boolean)
for (const n of ALL.filter(n => !only.length || only.includes(n))) {
  console.log('=== SCENARIO', n, SZ)
  await T.run(n, SZ, scene(SC[n]))
}
writeFileSync(path.join(OUT, `results-all-${SZ}${only.length ? '-' + only.join('_') : ''}.json`), JSON.stringify(L.results, null, 1))
