/* H-01 — Monday X lands 22:30; Tuesday X's ONLY line is blank, and X is on a new Ground Programme row "SQN BRIEF" 08:00-09:00.
   Then a take-off 18:00 on the blank line; then X off the flying line. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, X, MON, TUE, chk, whole, txt, clean } = K
const SZ = K.PHONE ? 'phone' : 'desk'
const id = `H01-${SZ}`
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X)
  await K.wave(p, MON, 'ZM', 'BFM', '21:00', '22:30', X)
  const b = await K.addFlyWave(p, TUE)
  const sb = await K.seat(p, TUE, b.gi, 0, 0, 'w', X)
  const g = await K.groundRow(p, TUE, 'SQN BRIEF', '08:00', '09:00', X)
  console.log('ground row:', await K.groundOf(p, TUE, g.ri), 'took', g.took, '| blank line:', await K.lineOf(p, TUE, b.gi, 0))
  const t1 = s => { const t = K.restText(s) || ''; return whole(s) && /his day starts 08:00 \(SQN BRIEF\)/.test(t) && /no take-off yet/.test(t) && /7h30/.test(t) && !/report/i.test(t) && clean(s) }
  const s1 = await chk(p, `${id}.1`, `Monday ZM 21:00-22:30 with ${cs}; Tuesday: ONE blank line with ${cs} in it (took ${sb.took}), and a new Ground Programme row ${await K.groundOf(p, TUE, g.ri)} (${cs} placed: ${g.took})`, t1, { monPic: true })
  await K.reload(p)
  await chk(p, `${id}.1r`, 'reload: the same state read again', t1, { monPic: true })
  await K.ff(p, TUE, b.gi, 0, 'to', '18:00')
  const t2 = s => { const t = K.restText(s) || ''; return whole(s) && /before the 15:40 report/.test(t) && clean(s) }
  const s2 = await chk(p, `${id}.2`, `a take-off 18:00 typed on the blank line (${await K.lineOf(p, TUE, b.gi, 0)})`, t2, { monPic: true })
  await K.takeOff(p, TUE, b.gi, 0)
  const seat3 = await K.seatOf(p, TUE, b.gi, 0)
  await chk(p, `${id}.3`, `${cs} dragged off the flying line (seat now "${seat3}"); he is only on the SQN BRIEF row`, s => !s.breach && !s.ringTue && clean(s), { monPic: true })
  const u = await K.undo(p); await chk(p, `${id}.3u`, `Undo (pressed ${u.pressed}; seat "${await K.seatOf(p, TUE, b.gi, 0)}")`, t2)
  const r = await K.redo(p); await chk(p, `${id}.3r`, `Redo (pressed ${r.pressed}; seat "${await K.seatOf(p, TUE, b.gi, 0)}")`, s => !s.breach && clean(s))
  await K.reload(p)
  await chk(p, `${id}.4`, 'reload with him off the flying line', s => !s.breach && clean(s), { monPic: true })
} catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
await K.wrap('rbl-A-h01', browser, errors, id)
