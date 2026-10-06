/* S13 — same-day tight turn: Wednesday X on 09:00-10:00 and 10:30-11:30; a blank crewed line between them in displayed order; moved before / after both; Auto sort. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, X, WED, chk } = K
const SZ = K.PHONE ? 'phone' : 'desk'
const id = `S13-${SZ}`
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X)
  const w = await K.addFlyWave(p, WED); const g = w.gi
  await K.ff(p, WED, g, 0, 'cs', 'ZA'); await K.ff(p, WED, g, 0, 'to', '09:00'); await K.ff(p, WED, g, 0, 'ld', '10:00')
  const a = await K.seat(p, WED, g, 0, 0, 'w', X)
  await K.addLine(p, WED, g)
  const bl = await K.seat(p, WED, g, 1, 0, 'w', X)
  await K.addLine(p, WED, g)
  await K.ff(p, WED, g, 2, 'cs', 'ZC'); await K.ff(p, WED, g, 2, 'to', '10:30'); await K.ff(p, WED, g, 2, 'ld', '11:30')
  const c = await K.seat(p, WED, g, 2, 0, 'w', X)
  const opts = { tue: WED, mon: null, pics: true }
  const fmt = s => `tight-turn warning held: ${s.tight ? 'YES' : 'NO'} · his lines on Wednesday's list: ${JSON.stringify(s.listAll.filter(t => t.includes(cs)))} · bar "${s.listBar}"`
  const tt = s => s.tight && s.listMine.some(t => /Tight turn/i.test(t))
  const go = async (label, did) => {
    const s = await K.see(p, `${id}-${label}`, opts)
    K.R(`${id}.${label}`, did, fmt(s), tt(s) ? 'PASS' : 'FAIL', s.shots)
    return s
  }
  await go('1', `Wednesday new wave, three lines in this displayed order: ${await K.waveOrder(p, WED, g)} — ${cs} seated in all (took ${a.took}, ${bl.took}, ${c.took})`)
  const keyOf = fi => `${WED}.${g}.${fi}.0`
  const ord0 = await K.waveOrder(p, WED, g)
  await K.dragLine(p, WED, keyOf(1), keyOf(0))
  await go('2', `the blank line dragged by its grip onto the first line's grip (to the top): ${ord0} → ${await K.waveOrder(p, WED, g)}`)
  let u = await K.undo(p); await go('2u', `Undo (pressed ${u.pressed}): ${await K.waveOrder(p, WED, g)}`)
  let r = await K.redo(p); await go('2r', `Redo (pressed ${r.pressed}): ${await K.waveOrder(p, WED, g)}`)
  const ord1 = await K.waveOrder(p, WED, g)
  await K.dragLine(p, WED, keyOf(0), keyOf(2))
  await go('3', `the blank line (now first) dragged onto the last line's grip (to the bottom): ${ord1} → ${await K.waveOrder(p, WED, g)}`)
  u = await K.undo(p); await go('3u', `Undo (pressed ${u.pressed}): ${await K.waveOrder(p, WED, g)}`)
  r = await K.redo(p); await go('3r', `Redo (pressed ${r.pressed}): ${await K.waveOrder(p, WED, g)}`)
  const ord2 = await K.waveOrder(p, WED, g)
  await K.sortWave(p, WED, g)
  await go('4', `the wave's own "Auto sort" pressed: ${ord2} → ${await K.waveOrder(p, WED, g)}`)
  u = await K.undo(p); await go('4u', `Undo (pressed ${u.pressed}): ${await K.waveOrder(p, WED, g)}`)
  r = await K.redo(p); await go('4r', `Redo (pressed ${r.pressed}): ${await K.waveOrder(p, WED, g)}`)
  await K.reload(p)
  await go('5', `reload: ${await K.waveOrder(p, WED, g)}`)
} catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
await K.wrap('rbl-A-s13', browser, errors, id)
