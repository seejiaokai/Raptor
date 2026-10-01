/* Scenario 16 — a second week replaces every row and title (week chips, the date picker, the board's week step). */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s16-')
const { browser, p, errors } = await B.world()
const wk = () => p.evaluate(() => window.CURWEEK)
async function chip(label) {
  const c = p.locator('[data-wk]:visible', { hasText: label }).first()
  if (!(await c.count())) return 'no chip ' + label
  await c.click(); await S.sleep(900); return 'ok'
}
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  await S.takeOff(p, TUE, '1.1.1.0.p'); await B.toEdit(p)
  await S.publish(p, TUE, 'al')
  const r1 = await S.look(p, 's16-a-week1-al1', { foot: true })
  row('16.a', 'week of 13 Jul: Tuesday published with an AL1', `title "${r1.title}" · ${S.brief(r1).slice(0, 260)} · By day ${S.sec(r1, 'By day').join(' ; ')}`, 'RECORDED', [r1.shot, r1.shot2])

  /* next week through its week chip */
  const c1 = await chip('Jul 20'); const w2 = await wk()
  const dN = await p.evaluate(() => window.DAYS.map(d => d.dt).join(','))
  const r2 = await S.look(p, 's16-b-week2-chip', { foot: true })
  judge('16.b', `week chip "Jul 20" (${c1}; loaded week ${w2}; days ${dN})`, [
    ['the title dates follow the loaded week (Jul 20 – Jul 26)', /Jul 20 – Jul 26/.test(r2.title), r2.title],
    ['figures differ from week 1 (a different week of data)', !S.same(r2, r1), S.delta(r1, r2).slice(0, 200)],
    ['all seven By-day rows are there and none repeats week 1\'s row text', S.sec(r2, 'By day').length === 7 && S.sec(r2, 'By day').every((x, i) => x !== S.sec(r1, 'By day')[i] || /clear|0 sorties/.test(x)), S.sec(r2, 'By day').join(' ; ')],
    ['week 1\'s published Tuesday does not leak: Tuesday row is not week 1\'s', S.byDay(r2, 'Tuesday') !== S.byDay(r1, 'Tuesday'), S.byDay(r2, 'Tuesday')],
  ], [r2.shot, r2.shot2])

  /* a pending-only sanity: week 2 has no published day, so its figures are the working copy */
  const d2 = await p.evaluate(() => window.DAYS.map(d => d.dt + ':' + (d.waves || []).reduce((a, w) => a + (w.formations || []).reduce((b, f) => b + f.aircraft.filter(x => !(x.cx || f.cx)).length, 0), 0)).join(' '))
  row('16.b2', 'the loaded week-2 working copy, counted from the page (sorties per day) for cross-checking', d2 + ` · Insights By day ${S.sec(r2, 'By day').join(' ; ')}`, 'RECORDED', [])

  /* back to week 1 by the chip */
  const c3 = await chip('Jul 13'); const w3 = await wk()
  const r3 = await S.look(p, 's16-c-back-week1')
  judge('16.c', `week chip "Jul 13" again (${c3}; loaded week ${w3})`, [
    ['title back to Jul 13 – Jul 19', /Jul 13 – Jul 19/.test(r3.title), r3.title],
    ['identical to the first reading of week 1, every section', S.same(r3, r1), S.same(r3, r1) ? '' : S.delta(r1, r3).slice(0, 500)],
  ], [r3.shot])

  /* the date picker */
  const cal = p.locator('button[title="Jump to a date"]:visible, #weekCalBtn:visible, [aria-label="Pick a date"]:visible').first()
  let pk = 'no picker button found'
  if (await cal.count()) {
    await cal.click(); await S.sleep(500)
    const day = p.locator('[data-wcal="2026-07-22"]:visible').first()
    if (await day.count()) { await day.click(); await S.sleep(900); pk = 'picked 22 Jul' } else pk = 'picker opened, no 22 Jul cell'
  }
  const w4 = await wk()
  const r4 = await S.look(p, 's16-d-picker-week2')
  judge('16.d', `"Pick a date" → 22 Jul (${pk}; loaded week ${w4})`, [
    ['title Jul 20 – Jul 26', /Jul 20 – Jul 26/.test(r4.title), r4.title],
    ['identical to the chip route into week 2', S.same(r4, r2), S.same(r4, r2) ? '' : S.delta(r2, r4).slice(0, 500)],
  ], [r4.shot])

  /* the board's own week step: open the board on Monday of week 2 then step back a week */
  await S.board(p, 0)
  const bw = p.locator('#schedBoard [data-sbweek]:visible')
  const nW = await bw.count()
  let step = 'no board week-step buttons at this width'
  if (nW) { const prev = p.locator('#schedBoard [data-sbweek="-1"]:visible').first(); if (await prev.count()) { await prev.click(); await S.sleep(1000); step = 'stepped back one week' } else { await bw.first().click(); await S.sleep(1000); step = 'pressed first week-step' } }
  const w5 = await wk()
  await B.toEdit(p)
  const r5 = await S.look(p, 's16-e-board-step')
  judge('16.e', `Scheduler Board week step (${step}); ✓ Done; loaded week ${w5}`, [
    ['the board stepped to week 1', w5 !== w4, `${w4} → ${w5}`],
    ['title and figures are week 1\'s exactly', /Jul 13 – Jul 19/.test(r5.title) && S.same(r5, r1), S.same(r5, r1) ? r5.title : S.delta(r1, r5).slice(0, 500)],
  ], [r5.shot])
} catch (e) { row('16.X', 'the script stopped', String(e && e.stack || e).slice(0, 1500), 'FAIL', [await pic(p, 's16-X-error')]) }
row('16.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s16', { errors })
await browser.close()
