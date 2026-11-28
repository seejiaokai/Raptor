// swd-w14a-probe — the routes w14a needs, proved on this build before any scenario uses them (plan §2: P1, P2, P3, P4, P5,
// P7, P8, P14). Desktop, one fresh world. Run from raptor-port/:  W14A_RUN=probe node scripts/handpass/swd-w14a-probe.mjs
import './swd-w14a-env.mjs'
const Z = await import('./swd-w14a-lib.mjs')
const { T, L, RANGER, post, bell, sayB, asR, asS, sleep, J, addLine, waveMenu, armSeat, armZone, crewSay, warns, warnSay, cx, planSim } = Z
console.log('VERSION swd-w14a-probe 3 · bundle served on', process.env.W2_URL)
const ok = (W, id, what, c, note, pic) => W.rec(id, what, c ? true : false, note, pic)

await T.run('probe', 'd', async (p, W) => {
  await post(p, W, RANGER, Z.D[17], 'p.post')
  const menu = await waveMenu(p, W, 5)
  W.rec('P8.menu', 'the + Wave menu on Sat 18: its choices', 'REC', menu.join(' | '), await W.pic(p, 'p8-menu'))
  await p.keyboard.press('Escape'); await sleep(300)
  // P7: a flying line with NO times, Ranger seated
  const a = await addLine(p, W, 5, { cs: 'W14A' })
  ok(W, 'P7.line', 'Sat 18: + Wave → Flying wave, callsign typed, NO times', a.wi >= 0, J(a))
  const s = await armSeat(p, W, `5.${a.wi}.0.0.p`, 'p7')
  ok(W, 'P7.seat', 'its FCP seat armed (no times) and Ranger picked', s.armed && s.placed, `armed ${s.armed} · placed ${s.placed} · his puck while armed: ${crewSay(s.c)} · note "${s.toast}"`, s.pic)
  const w0 = await warns(p, W, 5, 'p14a')
  W.rec('P14.a', 'the board\'s warning list for Sat 18 (no times on his line)', 'REC', warnSay(w0), w0.pic)
  await asR(p, W)
  let b = await bell(p, W, 'p7-bell')
  W.rec('P7.bell', 'Ranger\'s bell after the no-times seat', 'REC', sayB(b), b.pic)
  await asS(p, W)
  // P1: times typed; a second aircraft's seat armed (strike read)
  const tm = await Z.lineTimes(p, W, 5, a.wi, '21:00', '22:00')
  ok(W, 'P1.times', 'times typed T/O 21:00 land 22:00', tm.to && tm.ld, J(tm))
  const a2 = await addLine(p, W, 5, { cs: 'W14B', to: '20:00', ld: '21:30' })
  const s2 = await armSeat(p, W, `5.${a2.wi}.0.0.p`, 'p1-arm2', false)
  W.rec('P1.arm', 'a second aircraft\'s FCP armed on the timed line: Ranger\'s puck', s2.armed ? 'REC' : false, `armed ${s2.armed} · ${crewSay(s2.c)}`, s2.pic)
  const w1 = await warns(p, W, 5, 'p14b')
  W.rec('P14.b', 'the warning list for Sat 18 (timed line)', 'REC', warnSay(w1), w1.pic)
  // P5: cancel and un-cancel the line
  const c1 = await cx(p, W, 5, `[data-lcx="5.${a.wi}.0.0"]`, true, 'p5')
  const cxd = await p.evaluate(w => JSON.stringify(window.DAYS[5].waves[w].formations[0].aircraft[0]).slice(0, 200), a.wi)
  ok(W, 'P5.cx', 'the line cancelled by its CX → Cancel line', c1.ok, `${c1.why || ''} · aircraft now ${cxd}`, c1.pic)
  const s3 = await armSeat(p, W, `5.${a2.wi}.0.0.p`, 'p5-arm', false)
  W.rec('P5.arm', 'armed on the cancelled line\'s second aircraft: Ranger\'s puck', 'REC', `armed ${s3.armed} · ${crewSay(s3.c)}`, s3.pic)
  const c2 = await cx(p, W, 5, `[data-lcx="5.${a.wi}.0.0"]`, false, 'p5')
  const ucx = await p.evaluate(w => JSON.stringify(window.DAYS[5].waves[w].formations[0].aircraft[0]).slice(0, 200), a.wi)
  ok(W, 'P5.uncx', 'un-cancelled (CX → Un-cancel)', c2.ok, `${c2.why || ''} · aircraft now ${ucx}`, c2.pic)
  // P2: OFT and AMT boxes on Sun 19
  const o = await planSim(p, W, 19, 'oft', 'P2.oft')
  const am = await planSim(p, W, 19, 'amt', 'P2.amt')
  const ri = await p.evaluate(() => window.DAYS[6].sims.oft.length - 1)
  const c3 = await cx(p, W, 6, `[data-srcx="6.oft.${ri}"]`, true, 'p5sim')
  const scx = await p.evaluate(r => JSON.stringify(window.DAYS[6].sims.oft[r]).slice(0, 200), ri)
  ok(W, 'P5.simcx', 'the OFT box cancelled by its CX', c3.ok, `${c3.why || ''} · box now ${scx}`, c3.pic)
  const c4 = await cx(p, W, 6, `[data-srcx="6.oft.${ri}"]`, false, 'p5sim')
  ok(W, 'P5.simuncx', 'the OFT box un-cancelled', c4.ok, (c4.why || '') + ' · ' + await p.evaluate(r => JSON.stringify(window.DAYS[6].sims.oft[r]).slice(0, 120), ri), c4.pic)
  // P3: a duty desk row on Sat 18
  await L.openBoard(p, W, 5)
  const dz0 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-dradd]')].map(e => e.dataset.dradd + ':' + (e.textContent || '').trim()).join(' | '))
  W.rec('P3.doors', 'Sat 18: the duty desk add buttons', 'REC', dz0, await W.pic(p, 'p3-doors'))
  const before = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-fill], #schedBoard [data-slot]')].map(e => e.dataset.fill || e.dataset.slot))
  const dradd = p.locator(L.B('[data-dradd="5.0"]')).first()
  if (await dradd.count()) {
    await W.press(p, dradd, 'dradd'); await sleep(600)
    const after = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-fill], #schedBoard [data-slot]')].map(e => e.dataset.fill || e.dataset.slot))
    const fresh = after.filter(k => !before.includes(k))
    W.rec('P3.zones', 'the new duty row\'s zones', 'REC', fresh.join(' '))
    const z = fresh.find(k => /^d:5\.0\./.test(k))
    if (z) {
      const r = await armZone(p, W, `[data-fill="${z}"], [data-slot="${z}"]`, 'p3-arm')
      W.rec('P3.arm', 'the duty row armed: Ranger\'s puck', 'REC', `armed ${r.armed} · ${crewSay(r.c)}`, r.pic)
      await L.armAndPick(p, W, `[data-fill="${z}"], [data-slot="${z}"]`, RANGER, 'duty')
      const dr = await T.holds(p, RANGER)
      W.rec('P3.placed', 'Ranger on the duty row (what he holds this week, read)', 'REC', dr, await W.pic(p, 'p3-placed'))
    }
  } else W.rec('P3.doors2', 'no [data-dradd="5.0"]', false, '')
  // P8: SC, AVALON and BB lines on Sun 19 — their records and seats
  for (const k of ['SC', 'AVALON', 'BB']) {
    const l = await addLine(p, W, 6, { kind: k })
    const slots = await p.evaluate(wi => [...document.querySelectorAll(`#schedBoard [data-slot^="6.${wi}."]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.slot).join(' '), l.wi)
    const wv = await p.evaluate(wi => { const w = window.DAYS[6].waves[wi]; return w ? JSON.stringify({ label: w.label, kind: w.kind, sa: w.standalone, f: w.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, n: f.aircraft.length, a0: Object.keys(f.aircraft[0] || {}).join(',') })) }).slice(0, 700) : 'none' }, l.wi)
    const bfld = await p.evaluate(wi => [...document.querySelectorAll(`#schedBoard [data-bfld*=":6.${wi}."]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.bfld + '=' + (e.value || e.textContent || '').trim()).join(' '), l.wi)
    W.rec('P8.' + k, `Sun 19: + Wave → ${k}: its record, seats and boxes`, 'REC', `wi ${l.wi} · ${wv} · seats: ${slots} · boxes: ${bfld}`, await W.pic(p, 'p8-' + k))
  }
  // P4: all hands on Fri 17 naming Ranger
  await L.openBoard(p, W, 4)
  const ah = await L.progRow(p, W, 4, 'W14A ALLHANDS', '21:00', '21:30', RANGER)
  ok(W, 'P4', 'Fri 17: a Common Programme row 21:00–21:30 naming Ranger', J(ah.row || '').includes('bane'), J(ah.row))
  await L.closeBoard(p, W)
  await asR(p, W)
  b = await bell(p, W, 'p-bell-end')
  W.rec('P.bell', 'Ranger\'s bell at the end of the probe', 'REC', sayB(b), b.pic)
})
const c = k => L.results.filter(r => r.ok === k).length
console.log(`DONE probe: ${L.results.length} rows · PASS ${c(true)} · FAIL ${c(false)} · RECORDED ${c('REC')}`)
process.exit(0)
