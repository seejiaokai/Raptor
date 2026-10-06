/* S08 — SC B without a shift start: Monday as B; Tuesday "+ Wave" -> SC; clear its first shift's start and end; type B 05:00; seat X in its first MAIN seat. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, X, MON, TUE, chk, whole, txt, clean } = K
const id = 'S08'
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X)
  await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
  const sc = await K.addStandby(p, TUE, 'sc')
  const g = sc.gi
  console.log('SC before:', await K.lineOf(p, TUE, g, 0))
  const s0 = await chk(p, `${id}.0`, `Tuesday SC wave added with its own times (${await K.lineOf(p, TUE, g, 0)}), nobody seated`, s => !s.breach, { verdict: undefined })
  await K.ff(p, TUE, g, 0, 'to', ''); await K.ff(p, TUE, g, 0, 'ld', '')
  await K.ff(p, TUE, g, 0, 'br', '05:00')
  console.log('SC after typing:', await K.lineOf(p, TUE, g, 0))
  /* first MAIN seat: aircraft 0, try the back seat then the front */
  let sd = await K.seat(p, TUE, g, 0, 0, 'w', X)
  let where = 'back seat (RCP)'
  if (!sd.took) { sd = await K.seat(p, TUE, g, 0, 0, 'p', X); where = 'front seat (FCP)' }
  const ok = s => whole(s) && /05:00/.test(K.restText(s) || '') && clean(s)
  await chk(p, `${id}.1`, `SC shift 1: start and end cleared, B typed 05:00 (${await K.lineOf(p, TUE, g, 0)}); ${cs} placed in the first MAIN ${where} (took ${sd.took}; toast "${sd.msg}")`, ok, { monPic: true })
  const u = await K.undo(p); const seatU = await K.seatOf(p, TUE, g, 0, 'w') || await K.seatOf(p, TUE, g, 0, 'p'); await chk(p, `${id}.1u`, `Undo (${u.pressed}) — the seat now holds "${seatU}"`, s => (seatU === X ? ok(s) : !s.breach))
  const r = await K.redo(p); await chk(p, `${id}.1r`, `Redo (${r.pressed})`, ok)
  await K.reload(p)
  await chk(p, `${id}.2`, 'reload', ok, { monPic: true })
} catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
await K.wrap('rbl-A-s08', browser, errors, id)
