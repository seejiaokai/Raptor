/* S02 — Sunday forward trace: Baseline B built across Sun 19 Jul / Mon 20 Jul with the week chips; then blank crewed lines on each
   side (before and after the timed wave) on both days. Desktop. */
import * as K from './rbl-B-lib.mjs'
const { B, W, L, R, pic, picEl, sleep } = K
const SUN = 6, MON0 = 0
K.cleanPics(['s02'])
const { browser, p, errors } = await K.fresh()
const hasTrace = d => d.trace.some(x => /Breaks Monday/.test(x.text))
try {
  const cs = await B.csOf(p, K.X)
  /* next week first: Monday 20 Jul, ZT 07:00-08:00, Brief 05:00, X on it */
  const wk1 = await K.weekTo(p, 'Jul 20')
  const t = await K.addFlyWave(p, MON0)
  await K.ff(p, MON0, t.gi, 0, 'cs', 'ZT'); await K.ff(p, MON0, t.gi, 0, 'msn', 'BFM'); await K.ff(p, MON0, t.gi, 0, 'to', '07:00'); await K.ff(p, MON0, t.gi, 0, 'ld', '08:00'); await K.ff(p, MON0, t.gi, 0, 'br', '05:00')
  const st = await K.seat(p, MON0, t.gi, 0, 0, 'w', K.X)
  const wk2 = await K.weekTo(p, 'Jul 13')
  /* Sunday 19 Jul: ZS 20:00-22:30, X on it */
  const m = await K.addFlyWave(p, SUN)
  await K.ff(p, SUN, m.gi, 0, 'cs', 'ZS'); await K.ff(p, SUN, m.gi, 0, 'msn', 'BFM'); await K.ff(p, SUN, m.gi, 0, 'to', '20:00'); await K.ff(p, SUN, m.gi, 0, 'ld', '22:30')
  const ss = await K.seat(p, SUN, m.gi, 0, 0, 'w', K.X)
  const d1 = await K.readDay(p, 's02-1-sunday', SUN)
  R('S02.1', `Monday 20 Jul built first (week chip "Jul 20" → ${wk1}; ZT 07:00-08:00 Brief 05:00, ${cs} took ${st.took}); back on week 13 Jul (${wk2}); Sunday 19 Jul ZS 20:00-22:30, ${cs} took ${ss.took}`,
    `Sunday: ${K.dsays(d1)}`, hasTrace(d1) && K.dottedRing(d1.paint) && !d1.held.some(x => x.code === 'CREW_REST') ? 'PASS' : 'FAIL', d1.pics)
  /* Monday 20 on its own week */
  await K.weekTo(p, 'Jul 20')
  const e1 = await K.readDay(p, 's02-1-monday', MON0)
  R('S02.2', `week chip "Jul 20": Monday 20 Jul as loaded`, `Monday: ${K.dsays(e1)}`, e1.held.some(x => x.code === 'CREW_REST' && !x.off) && K.solidRing(e1.paint) ? 'PASS' : 'FAIL', e1.pics)
  /* blank crewed lines on each side, on Monday 20 (a blank wave BEFORE the timed one cannot be drawn first now; add one after, then one more line before via a new wave then Sort all? — record what the controls allow) */
  const bm = await K.addFlyWave(p, MON0); const sbm = await K.seat(p, MON0, bm.gi, 0, 0, 'w', K.X)
  const e2 = await K.readDay(p, 's02-2-monday', MON0)
  R('S02.3', `Monday 20 Jul: "+ Wave" (blank line) drawn AFTER the timed wave, ${cs} seated (took ${sbm.took})`, `Monday: ${K.dsays(e2)}`,
    e2.held.some(x => x.code === 'CREW_REST' && !x.off) && K.solidRing(e2.paint) ? 'PASS' : 'FAIL', e2.pics)
  /* and the blank wave dragged ABOVE the timed one on Monday 20 */
  let dn = ''
  try {
    await W.boardOn(p, MON0); await sleep(500)
    const gr = p.locator('#schedBoard .wvgrip:visible'); const n = await gr.count()
    const idx = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .wvgrip')].filter(e => e.offsetParent !== null).length)
    if (n >= 2) { await W.drag(p, gr.nth(n - 1), gr.nth(n - 2)); dn = `dragged the last of ${n} wave grips onto the one above it` } else dn = `only ${n} grips`
  } catch (e) { dn = 'drag failed: ' + String(e.message).slice(0, 160) }
  const ordM = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label + ':' + w.formations.map(f => f.cs || '(blank)').join('/')).slice(-3).join('  then  '), MON0)
  await W.boardOff(p)
  const e2b = await K.readDay(p, 's02-2b-monday', MON0)
  R('S02.3b', `Monday 20 Jul: the blank wave dragged above ZT (${dn}); the last waves now run ${ordM}`, `Monday: ${K.dsays(e2b)}`,
    e2b.held.some(x => x.code === 'CREW_REST' && !x.off) && K.solidRing(e2b.paint) ? 'PASS' : 'FAIL', e2b.pics)
  /* Sunday: blank wave AFTER the timed one, then see; then the blank BEFORE it by dragging the wave grip? use the board's own Sort all after changing nothing — record the order */
  await K.weekTo(p, 'Jul 13')
  const bs = await K.addFlyWave(p, SUN); const sbs = await K.seat(p, SUN, bs.gi, 0, 0, 'w', K.X)
  const order = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label + ':' + w.formations.map(f => f.cs || '(blank)').join('/')).slice(-2).join('  then  '), SUN)
  const d2 = await K.readDay(p, 's02-3-sunday', SUN)
  R('S02.4', `week chip "Jul 13": Sunday "+ Wave" (blank line) drawn AFTER ZS, ${cs} seated (took ${sbs.took}); drawn order: ${order}`, `Sunday: ${K.dsays(d2)}`,
    hasTrace(d2) && K.dottedRing(d2.paint) ? 'PASS' : 'FAIL', d2.pics)
  /* the blank wave BEFORE the timed one on Sunday: a real pointer drag of the blank wave's grip onto the timed wave's grip */
  let dragNote = ''
  try {
    await W.boardOn(p, SUN); await sleep(500)
    const grips = p.locator('#schedBoard .wvgrip:visible')
    const n = await grips.count()
    if (n >= 2) { await W.drag(p, grips.nth(n - 1), grips.nth(0)); dragNote = `dragged grip ${n - 1} onto grip 0 (of ${n})` } else dragNote = `only ${n} wave grips on the board`
  } catch (e) { dragNote = 'drag failed: ' + String(e.message).slice(0, 160) }
  const order1 = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label + ':' + w.formations.map(f => f.cs || '(blank)').join('/')).join('  then  '), SUN)
  await W.boardOff(p)
  const d2b = await K.readDay(p, 's02-3b-sunday', SUN)
  R('S02.4b', `Sunday: dragged the blank wave above ZS with the wave grip (${dragNote}); the waves now run ${order1}`, `Sunday: ${K.dsays(d2b)}`, hasTrace(d2b) && K.dottedRing(d2b.paint) ? 'PASS' : 'FAIL', d2b.pics)
  /* Sort all is the app's own reorder: it puts waves in take-off order, a blank wave goes where its (empty) time sorts */
  await W.boardOn(p, SUN); await sleep(300)
  const bt = p.locator('#sbSortAll:visible').first(); let sorted = 'no Sort all button'
  if (await bt.count()) { await bt.click(); await sleep(500); const cf = p.locator('#sortAllConfirm:visible').first(); if (await cf.count()) { await cf.click(); await sleep(800); sorted = 'sorted' } }
  const order2 = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label + ':' + w.formations.map(f => f.cs || '(blank)').join('/')).slice(-3).join('  then  '), SUN)
  const d3 = await K.readDay(p, 's02-4-sunday-sorted', SUN)
  R('S02.5', `Sunday: Sort all (${sorted}); the last waves now run ${order2}`, `Sunday: ${K.dsays(d3)}`, hasTrace(d3) && K.dottedRing(d3.paint) ? 'PASS' : 'FAIL', d3.pics)
  /* back to Monday 20: it must still read the breach after the Sunday edits */
  await K.weekTo(p, 'Jul 20')
  const e3 = await K.readDay(p, 's02-5-monday', MON0)
  R('S02.6', `week chip "Jul 20" again, after the Sunday blank wave and Sort all`, `Monday: ${K.dsays(e3)}`, e3.held.some(x => x.code === 'CREW_REST' && !x.off) && K.solidRing(e3.paint) ? 'PASS' : 'FAIL', e3.pics)
  /* reload on week 13 */
  await B.reloadAs(p, 'a'); await K.weekTo(p, 'Jul 13')
  const d4 = await K.readDay(p, 's02-6-sunday-reload', SUN)
  R('S02.7', `the page reloaded and signed in again, week "Jul 13"`, `Sunday: ${K.dsays(d4)}`, hasTrace(d4) && K.dottedRing(d4.paint) ? 'PASS' : 'FAIL', d4.pics)
} catch (e) { R('S02.X', 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 's02-X')]) }
R('S02.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('s02')
