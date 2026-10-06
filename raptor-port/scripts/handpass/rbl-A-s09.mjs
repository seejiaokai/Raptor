/* S09 — landing only yesterday: Monday's only flight has landing 22:30, no take-off, X aboard; Tuesday as B; a wholly blank Monday line before it. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, X, MON, TUE, chk, whole, txt, clean } = K
const id = 'S09'
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X)
  const m = await K.wave(p, MON, 'ZM', 'BFM', null, '22:30', X)
  const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', X, '05:00')
  console.log('Monday line:', await K.lineOf(p, MON, m.gi, 0), '| Tuesday line:', await K.lineOf(p, TUE, t.gi, 0))
  const okRest = s => whole(s) && /22:30/.test(K.restText(s) || '') && /4h30/.test(K.restText(s) || '') && clean(s)
  const s0 = await chk(p, `${id}.0`, `Monday: new wave ZM with ONLY a landing 22:30 (no take-off), ${cs} aboard; Tuesday: ZT 07:00-08:00 Brief 05:00, ${cs} aboard. Monday line: ${await K.lineOf(p, MON, m.gi, 0)}`, okRest, { monPic: true })
  /* a wholly blank Monday wave: nobody in it yet, then dragged BEFORE the landing-only wave */
  const b = await K.addFlyWave(p, MON)
  const s1 = await chk(p, `${id}.1`, `"+ Wave" on Monday: a wholly blank wave, nobody in it, drawn AFTER. Order: ${await K.orderOf(p, MON)}`, okRest, { monPic: true })
  let derr = null
  const o1 = await K.orderOf(p, MON)
  try { await K.dragWave(p, MON, b.gi, m.gi) } catch (e) { derr = String(e.message || e).slice(0, 160) }
  const o2 = await K.orderOf(p, MON)
  const s2 = await chk(p, `${id}.2`, `its grip dragged onto the landing-only wave's grip (${derr || 'dragged'}); order ${o1} → ${o2}`, s => okRest(s) && o1 !== o2, { monPic: true })
  const sd = await K.seat(p, MON, o2.split('  ').findIndex(x => /\(blank\)/.test(x)), 0, 0, 'w', X)
  const s3 = await chk(p, `${id}.3`, `${cs} seated in that blank wave (took ${sd.took}, toast "${sd.msg}"); order ${await K.orderOf(p, MON)}`, okRest, { monPic: true })
  const u = await K.undo(p)
  await chk(p, `${id}.3u`, `Undo (pressed ${u.pressed}); order ${await K.orderOf(p, MON)}`, okRest)
  const r = await K.redo(p)
  await chk(p, `${id}.3r`, `Redo (pressed ${r.pressed}); order ${await K.orderOf(p, MON)}`, okRest)
  await K.reload(p)
  await chk(p, `${id}.4`, `reload; order ${await K.orderOf(p, MON)}; Monday line ${await K.lineOf(p, MON, m.gi, 0).catch(() => '?')}`, okRest, { monPic: true })
} catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
await K.wrap('rbl-A-s09', browser, errors, id)
