/* S06 — typed Brief only: Monday as B; Tuesday's ONLY flight has Brief 05:00 and no take-off or landing; X seated; add/remove another fully blank line. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, X, MON, TUE, chk, whole, txt, clean } = K
const id = 'S06'
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X)
  const m = await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
  const t = await K.wave(p, TUE, 'ZT', 'BFM', null, null, X, '05:00')
  const ok = s => whole(s) && /05:00/.test(K.restText(s) || '') && clean(s)
  await chk(p, `${id}.0`, `Monday ZM 20:00-22:30; Tuesday ZT with ONLY Brief 05:00 (${await K.lineOf(p, TUE, t.gi, 0)}), ${cs} on both`, ok, { monPic: true })
  await K.addLine(p, TUE, t.gi); const fi = (await K.nLines(p, TUE, t.gi)) - 1
  await chk(p, `${id}.1`, `"+ Line" on Tuesday's wave: a fully blank line (${await K.lineOf(p, TUE, t.gi, fi)}), nobody in it`, ok)
  const sd = await K.seat(p, TUE, t.gi, fi, 0, 'w', X)
  await chk(p, `${id}.2`, `${cs} seated on the blank line (took ${sd.took}; toast "${sd.msg}")`, ok, { monPic: true })
  const u = await K.undo(p); await chk(p, `${id}.2u`, `Undo (pressed ${u.pressed}); seat now "${await K.seatOf(p, TUE, t.gi, fi)}"`, ok)
  const r = await K.redo(p); await chk(p, `${id}.2r`, `Redo (pressed ${r.pressed}); seat now "${await K.seatOf(p, TUE, t.gi, fi)}"`, ok)
  /* take him off, then remove the blank line itself with its own ✕ */
  await K.takeOff(p, TUE, t.gi, fi)
  await chk(p, `${id}.3`, `${cs} dragged off the blank line; seat now "${await K.seatOf(p, TUE, t.gi, fi)}"`, ok)
  await K.boardTo(p, TUE)
  const x = p.locator(`#schedBoard [data-ldel="${TUE}.${t.gi}.${fi}.0"]`).first()
  await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await K.sleep(700)
  await chk(p, `${id}.4`, `the blank line's own ✕ pressed; wave now has ${await K.nLines(p, TUE, t.gi)} line(s)`, ok, { monPic: true })
  /* a blank WAVE seated, then reload */
  const w = await K.addFlyWave(p, TUE); const sw = await K.seat(p, TUE, w.gi, 0, 0, 'w', X)
  await chk(p, `${id}.5`, `"+ Wave" on Tuesday, blank, ${cs} seated (took ${sw.took}); Tue waves: ${await K.orderOf(p, TUE)}`, ok)
  await K.reload(p)
  await chk(p, `${id}.6`, 'reload', ok, { monPic: true })
} catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
await K.wrap('rbl-A-s06', browser, errors, id)
