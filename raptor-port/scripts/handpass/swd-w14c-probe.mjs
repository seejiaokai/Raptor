// swd-w14c-probe — the routes w14c needs, proved once on this build before any scenario uses them (desktop):
// the line ✕ and the sim ✕ (a seat emptied), the posting moved to Mon 20 and back, a filing run across the month's end
// (Fri 31 Jul – Sat 1 Aug), P12 (a door moving a man's squadron: Admin → Users looked at), P11 (the posting sheet at Sun 19
// moving a posting whose date has come, to Tue 21).   W14C_RUN=probe node scripts/handpass/swd-w14c-probe.mjs
import './swd-w14c-env.mjs'
const Z = await import('./swd-w14c-lib.mjs')
const { K, T, L, RANGER, D, J, need, asR, asS, scene, sleep, seatOn, planSim, postAny, lineOff, simOff, moveTo, saveWk2, bell, sayB } = Z
console.log('VERSION swd-w14c-probe 1')
const r = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
await T.run('probe', 'd', scene(async (p, W) => {
  await postAny(p, W, RANGER, D[17], 'p.1')
  await seatOn(p, W, 'p.2', 5)
  await planSim(p, W, 19, 'oft', 'p.3', { label: 'W14C SIM' })
  r(W, 'p.3h', 'what he holds (read)', await T.holds(p, RANGER))
  await lineOff(p, W, 'p.4', 5)
  await simOff(p, W, 'p.5', 6)
  await saveWk2(p, W, 'p.5w')
  await moveTo(p, W, D[17], '2026-07-20', 'p.6')
  await moveTo(p, W, '2026-07-20', D[17], 'p.7')
  /* P12: Admin → Users, the words on the page and on one man's row read for any squadron move */
  await L.usersOpen(p, W)
  const u = await p.evaluate(() => [...document.querySelectorAll('button, select, label, th, h2, h3')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()).filter(t => /squadron|sqn|move|transfer|unit|home/i.test(t)).slice(0, 30))
  r(W, 'p.12', 'P12: Admin → Users — every visible control naming a squadron, unit, home, move or transfer', J(u), await W.pic(p, 'p12-users'))
  await asR(p, W)
  const f = await T.file(p, W, '2026-07-31', null, ['fly'], null, 'p-8', { endIso: '2026-08-01' })
  r(W, 'p.8', 'Ranger files Fly Fri 31 Jul → Sat 1 Aug (the window calendar, last day tapped)', f.iid ? J(f.made) : f.refused, f.pic)
  await T.closeAll(p, W)
  const b = await bell(p, W, 'p-9')
  r(W, 'p.9', 'Ranger\'s bell', sayB(b), b.pic)
  await asS(p, W)
  const t = await T.moveClock(p, W, '2026-07-19T09:00:00')
  r(W, 'p.10', 'clock Sun 19 09:00, reloaded, Saber signed in', t)
  await K.warReady(p)
  const s = await T.sheet(p, W, RANGER, D[17], 'p-11')
  r(W, 'p.11a', 'P11: his Fri 17 cell pressed — which sheet opens', `${s.kind} · "${s.line}"`, s.pic)
  await T.sheetClose(p, W)
  const m = await T.movePo(p, W, RANGER, D[17], '2026-07-21', 'p-11b')
  r(W, 'p.11b', 'P11: the sheet\'s date moved to Tue 21 (Sun 19 today)', J({ ok: m.ok, before: m.before, line: m.line, err: m.err, rec: m.rec }), m.pic)
}))
process.exit(0)
