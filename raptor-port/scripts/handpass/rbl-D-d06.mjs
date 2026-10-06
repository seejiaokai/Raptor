/* D-06 — a landing typed alone still ends the day. Monday: X's only line has a landing 22:30, no take-off. Tuesday as B. Desktop. */
import * as K from './rbl-D-lib.mjs'
const { B, W, R, X, MON, TUE, chk, whole, clean } = K
const ID = 'D-06'
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X)
  const m = await K.wave(p, MON, 'ZM', 'BFM', null, '22:30', X)
  const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', X, '05:00')
  console.log('Mon line:', await K.lineOf(p, MON, m.gi, 0), '| Tue line:', await K.lineOf(p, TUE, t.gi, 0))
  const expect = s => { const x = K.restText(s) || ''; return whole(s) && /Monday landed 22:30, \+2h debrief assumed/.test(x) && /ended 00:30/.test(x) && /told to report 05:00/.test(x) && /only 4h30 rest/.test(x) && clean(s) }
  await K.chk(p, `${ID}.1`, `${cs}: Monday, ONE line with a landing 22:30 typed and no take-off (took ${m.took}); Tuesday ZT 07:00–08:00 with Brief 05:00 (took ${t.took})`, expect, { monPic: true })
  await K.reload(p)
  await K.chk(p, `${ID}.1r`, 'reload: the same state read again', expect, { monPic: true })
} catch (e) { R(`${ID}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${ID}-X`)]) }
await K.wrap('d06', browser, errors, ID)
