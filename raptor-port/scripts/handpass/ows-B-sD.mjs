/* walker B — S31: Monday 20 July declared a public holiday; flight 01:00–02:00 with report Sunday 21:59; weeks moved, reload */
import * as K from './ows-B-lib.mjs'
const { judge, row, savePart, sleep, pic } = K
const errs = []
const MON = '2026-07-20', SUNI = '2026-07-19'
const wd = await K.world(); const { p, browser } = wd
async function declarePH(iso) {
  await K.L.go(p, 'leavewar'); await sleep(900)
  const m = p.locator('[data-testid="month-JUL"]'); if (await m.count()) { await m.first().click(); await sleep(900) }
  const c = p.locator(`[data-testid="event-0-${iso}"]`).first()
  if (!(await c.count())) return { done: false, why: 'no event cell' }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250)
  const before = await p.evaluate(d => ((document.querySelector(`[data-testid="event-0-${d}"]`) || {}).innerText || '').trim(), iso)
  await c.click(); await sleep(500)
  const t = p.locator('[data-testid="event-text"]'); if (!(await t.count())) return { done: false, why: 'event sheet did not open' }
  await t.fill('PH'); await sleep(150)
  await p.locator('[data-testid="event-apply"]').click(); await sleep(700)
  const cell = await p.evaluate(d => ((document.querySelector(`[data-testid="event-0-${d}"]`) || {}).innerText || '').trim(), iso)
  return { done: true, before, cell }
}
try {
  const base = await K.baseline(p, 'split')
  const ph = await declarePH(MON)
  const picPh = await pic(p, 'S31-ph')
  await K.L.go(p, 'editsched'); await sleep(400)
  const chip = p.locator('[data-wk]:visible', { hasText: 'Jul 20' }).first()
  await chip.click(); await sleep(900)
  const day0 = await p.evaluate(() => (document.querySelector('#eWeek .day[data-day="0"] .dh, #eWeek .day[data-day="0"]') || {}).innerText || '')
  const w = await K.flight(p, 0, { cs: 'VIPER', to: '01:00', ld: '02:00', p1: 'split' })
  const add = await K.addLines(p, 0, w.wi, ['IN TIME 21:59'])
  const pre = await pic(p, 'S31-board')
  const pub = await K.publishNew(p, 0); await K.closeBoard(p)
  const o1 = await K.oilOf(p, 'split', MON, 'S31a-mon')
  const sun1 = await K.lwCellOf(p, 'split', SUNI)
  judge('S31.1', 'Mon 20 Jul declared PH (Leave War event row, text "PH"); on the week "Jul 20" a new flying line 01:00–02:00, Vandal, line IN TIME 21:59; published', [
    ['PH declared', ph.done, ph], ['the week opened is Monday 20 Jul', /20/.test(day0), day0.slice(0, 40)], ['line kept', add.lines.length === 1, add.lines], ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
    ['Monday FO', o1.letters === 'FO', o1.cell.text], ['worked 00:00–04:00', /00:00.04:00/.test(o1.row), o1.row.slice(0, 150)], ['balance +1', +o1.bal === +base.bal + 1, { base: base.bal, now: o1.bal }],
    ['Sunday 19 Jul: nothing from it', !/HO|FO/.test((sun1 && sun1.text) || ''), sun1]], [picPh, pre, ...o1.pics])
  /* move between the two weeks, then reload */
  await K.L.go(p, 'editsched'); await sleep(300)
  await p.locator('[data-wk]:visible', { hasText: 'Jul 13' }).first().click(); await sleep(900)
  await p.locator('[data-wk]:visible', { hasText: 'Jul 20' }).first().click(); await sleep(900)
  const o2 = await K.oilOf(p, 'split', MON, 'S31b-weeks')
  await K.reloadAs(p, 'a'); await sleep(700)
  const o3 = await K.oilOf(p, 'split', MON, 'S31c-reload')
  const sun3 = await K.lwCellOf(p, 'split', SUNI)
  await K.L.go(p, 'editsched'); await sleep(400)
  await p.locator('[data-wk]:visible', { hasText: 'Jul 20' }).first().click(); await sleep(900)
  const d3 = await K.dayState(p, 0, 'S31c-day', { list: false })
  judge('S31.2', 'Edit Schedule moved to the week "Jul 13" and back to "Jul 20"; then the page reloaded and signed in again', [
    ['after the week moves: Monday still FO 00:00–04:00', o2.letters === 'FO' && /00:00.04:00/.test(o2.row), { cell: o2.cell.text, row: o2.row.slice(0, 120) }],
    ['after the reload: Monday still FO 00:00–04:00', o3.letters === 'FO' && /00:00.04:00/.test(o3.row), { cell: o3.cell.text, row: o3.row.slice(0, 120) }],
    ['balance still +1', +o3.bal === +base.bal + 1, { base: base.bal, now: o3.bal }], ['Sunday still nothing', !/HO|FO/.test((sun3 && sun3.text) || ''), sun3],
    ['Monday still ORIG, nothing pending', d3.head.tag === 'ORIG' && d3.pend === '0', { tag: d3.head.tag, pending: d3.head.pending }]], [...o2.pics, ...o3.pics, ...d3.pics])
} catch (e) { row('S31', 'script', 'SCRIPT ERROR ' + String(e.stack || e).slice(0, 600), 'NOT WALKED') }
errs.push(...wd.errors)
console.log('ERRORS', JSON.stringify(errs))
savePart('ows-B-sD', { errors: errs })
await browser.close()
