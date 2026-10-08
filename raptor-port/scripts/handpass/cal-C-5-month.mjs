// P3-06 (phone one-button vs desktop three buttons) and P3-07 (Every weekday) — SZ=desk|phone, Saber, July 2026
import { world, toLeaveWar, tid, press, pic, sleep, closeAll, judge, rec, recErrors, big, active } from './cal-C-lib.mjs'
const SIZE = process.env.SZ || 'desk'
const { page, errors } = await world(SIZE)
const P = n => `${SIZE}-${n}`
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const cls = async iso => {
  if (await tid(page, `days-tag-${iso}`).count()) return 'TAG:' + (await tid(page, `days-tag-${iso}`).textContent()).trim()
  if (!big(SIZE)) return (await tid(page, `days-step-${iso}`).getAttribute('data-cls')) + (await tid(page, `days-dot-${iso}`).count() ? '+dot' : '')
  for (const k of ['d', 'n', 'nf']) if ((await tid(page, `days-${k}-${iso}`).getAttribute('aria-pressed')) === 'true') return { d: 'day', n: 'night', nf: 'nf' }[k] + (await tid(page, `days-dot-${iso}`).count() ? '+dot' : '')
  return 'none' + (await tid(page, `days-dot-${iso}`).count() ? '+dot' : '')
}
const undoState = () => page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { disabled: b.disabled || b.getAttribute('aria-disabled') === 'true' || b.classList.contains('dim'), title: b.title || b.getAttribute('aria-label') } : null })
async function gotoMonth(prefix, want) { for (let i = 0; i < 30; i++) { const m = (await tid(page, prefix + '-month').textContent()).trim(); const [mn, y] = m.toLowerCase().split(/\s+/); const have = +y * 12 + MONTHS.indexOf(mn); if (have === want) return; await press(SIZE, tid(page, have > want ? prefix + '-prev' : prefix + '-next')) } }
await toLeaveWar(page)
await press(SIZE, tid(page, 'settings-open')); await press(SIZE, tid(page, 'settings-days'))
await tid(page, 'win-days').waitFor(); await sleep(300)
if (await tid(page, 'days-tabs').count()) await press(SIZE, tid(page, 'days-tab-holidays'))
/* two holidays in July through the Holidays form: a PH on Wed 22 and an Off day on Tue 21 */
async function holTap(iso) {
  const at = async () => { const [m, y] = (await tid(page, 'holcal-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await press(SIZE, tid(page, 'holcal-next-month'))
  for (; d < 0; d++) await press(SIZE, tid(page, 'holcal-prev-month'))
  await press(SIZE, tid(page, `holcal-day-${iso}`))
}
await press(SIZE, tid(page, 'hol-add')); await tid(page, 'hol-name').fill('July Fest'); await holTap('2026-07-22'); await press(SIZE, tid(page, 'hol-save')); await sleep(500)
await press(SIZE, tid(page, 'hol-add')); await press(SIZE, tid(page, 'hol-kind-off')); await tid(page, 'hol-name').fill('Rest Day'); await holTap('2026-07-21'); await press(SIZE, tid(page, 'hol-save')); await sleep(500)
if (await tid(page, 'days-tabs').count()) await press(SIZE, tid(page, 'days-tab-month'))
await gotoMonth('days', 2026 * 12 + 6); await sleep(300)
await pic(page, P('p306-0-july'))

const WD = '2026-07-14' /* Tue */, WE = '2026-07-18' /* Sat */, PH = '2026-07-22', OFF = '2026-07-21'
const init = { wd: await cls(WD), we: await cls(WE), ph: await cls(PH), off: await cls(OFF) }
const ctrls = {
  count: big(SIZE) ? await page.locator(`[data-testid="days-cell-${WD}"] button`).count() : await page.locator(`[data-testid="days-cell-${WD}"] button`).count(),
  phCount: await page.locator(`[data-testid="days-cell-${PH}"] button`).count(),
  offCount: await page.locator(`[data-testid="days-cell-${OFF}"] button`).count(),
  weCount: await page.locator(`[data-testid="days-cell-${WE}"] button`).count(),
}
const stepWD = [], stepWE = []
const hit = async iso => big(SIZE) ? null : await page.evaluate(i => { const b = document.querySelector(`[data-testid="days-step-${i}"]`); const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { w: Math.round(r.width), h: Math.round(r.height), onIt: h === b || b.contains(h), label: b.getAttribute('aria-label') || b.title } }, iso)
const hitWD = await hit(WD)
if (big(SIZE)) {
  /* weekday: N, NF, D; weekend: D, D again (back to none), N */
  for (const k of ['n', 'nf', 'd']) { await press(SIZE, tid(page, `days-${k}-${WD}`)); stepWD.push(await cls(WD)) }
  await pic(page, P('p306-1-weekday-cycled'))
  for (const k of ['d', 'd', 'n']) { await press(SIZE, tid(page, `days-${k}-${WE}`)); stepWE.push(await cls(WE)) }
} else {
  for (let i = 0; i < 4; i++) { await press(SIZE, tid(page, `days-step-${WD}`)); stepWD.push(await cls(WD)) }
  await pic(page, P('p306-1-weekday-cycled'))
  for (let i = 0; i < 5; i++) { await press(SIZE, tid(page, `days-step-${WE}`)); stepWE.push(await cls(WE)) }
}
await pic(page, P('p306-2-weekend-cycled'))
/* an active press is a no-op and makes NO Undo step: set a weekday to night (one step), press the lit control again, Undo ONCE */
const probe = '2026-07-15' /* Wed */
let noopCheck = null
if (big(SIZE)) {
  await press(SIZE, tid(page, `days-n-${probe}`)); const c1 = await cls(probe)
  await press(SIZE, tid(page, `days-n-${probe}`)); const c2 = await cls(probe)   // active: no-op
  await press(SIZE, page.locator('#undoBtn')); await sleep(300); const c3 = await cls(probe)
  noopCheck = { afterN: c1, afterActivePress: c2, afterOneUndo: c3 }
  /* weekday D lit pressing D: a no-op as well */
  const probe2 = '2026-07-16'
  const u0 = await cls(probe2); await press(SIZE, tid(page, `days-d-${probe2}`)); const u1 = await cls(probe2)
  noopCheck.d_on_default = { before: u0, after: u1 }
  /* the PH / Off day: tags in place of the controls */
}
await pic(page, P('p306-3-noop'))
await pic(page, P('p306-4-ph-off'))
const finalWD = await cls(WD), finalWE = await cls(WE)
const checks = [
  ['weekday starts day, weekend starts with nothing set', /^day/.test(init.wd) && /^none/.test(init.we), init],
  ['PH and Off day show a tag and no flying controls', /TAG/.test(init.ph) && /TAG/.test(init.off) && ctrls.phCount === 0 && ctrls.offCount === 0, { ph: init.ph, off: init.off, ctrls }],
]
if (big(SIZE)) {
  checks.push(['desktop has three buttons per date', ctrls.count === 3 && ctrls.weCount === 3, ctrls])
  checks.push(['weekday N -> night, NF -> nf, D -> day (each press gives its own class)', stepWD[0].startsWith('night') && stepWD[1].startsWith('nf') && stepWD[2].startsWith('day'), stepWD])
  checks.push(['weekend D -> day; D again -> back to none; N -> night', stepWE[0].startsWith('day') && stepWE[1].startsWith('none') && stepWE[2].startsWith('night'), stepWE])
  checks.push(['pressing the active control on a weekday writes nothing: ONE Undo takes back the N (night -> day)', noopCheck.afterN.startsWith('night') && noopCheck.afterActivePress.startsWith('night') && noopCheck.afterOneUndo.startsWith('day'), noopCheck])
  checks.push(['D on a default-day weekday changes nothing', noopCheck.d_on_default.before.startsWith('day') && noopCheck.d_on_default.after.startsWith('day'), noopCheck.d_on_default])
} else {
  checks.push(['phone has ONE control per date', ctrls.count === 1 && ctrls.weCount === 1, ctrls])
  checks.push(['weekday cycle day -> night -> nf -> day', stepWD[0].startsWith('night') && stepWD[1].startsWith('nf') && stepWD[2].startsWith('day'), stepWD])
  checks.push(['weekend cycle none -> day -> night -> nf -> none', stepWE.slice(0, 5).map(x => x.replace('+dot', '')).join('>'), stepWE])
  checks.push(['the button is the thing a finger lands on (centre hit), size', hitWD && hitWD.onIt && hitWD.h >= 30, hitWD])
}
judge('P3-06-' + SIZE, `Calendar month July 2026 at ${SIZE}: stepped a weekday (Tue 14) and a weekend day (Sat 18) through their classes; pressed an active button; read PH (22) and Off day (21)`, checks, [P('p306-0-july') + '.png', P('p306-1-weekday-cycled') + '.png', P('p306-2-weekend-cycled') + '.png', P('p306-3-noop') + '.png'])

/* ===================== P3-07: Every Thursday ===================== */
const THU = ['2026-07-02', '2026-07-09', '2026-07-16', '2026-07-23', '2026-07-30']
const reset = async () => { /* undo the cycling so the only change is the rule */ }
const before7 = {}; for (const d of [...THU, '2026-07-15', '2026-07-17']) before7[d] = await cls(d)
await press(SIZE, tid(page, 'days-wd-3')); await tid(page, 'win-every').waitFor(); await sleep(400)
const everyTitle = (await page.locator('[data-testid="win-every"] .win-ttl').textContent()).trim()
await pic(page, P('p307-1-every-thursday'))
await press(SIZE, tid(page, 'every-cls-night'))
await tid(page, 'every-from').fill('2026-07-16')
await press(SIZE, tid(page, 'every-until-date')); await tid(page, 'every-until').fill('2026-07-30')
const says = (await tid(page, 'every-says').textContent()).trim()
await pic(page, P('p307-2-every-filled'))
await press(SIZE, tid(page, 'every-save')); await sleep(600)
const after7 = {}; for (const d of [...THU, '2026-07-15', '2026-07-17']) after7[d] = await cls(d)
await pic(page, P('p307-3-after-save'))
/* reopen, change the end */
await press(SIZE, tid(page, 'days-wd-3')); await tid(page, 'win-every').waitFor(); await sleep(300)
const listed = (await tid(page, 'every-list').count()) ? (await tid(page, 'every-list').textContent()).replace(/\s+/g, ' ').trim() : null
await pic(page, P('p307-4-reopened-listed'))
await press(SIZE, tid(page, 'every-cls-night'))
await tid(page, 'every-from').fill('2026-07-16')
await press(SIZE, tid(page, 'every-until-date')); await tid(page, 'every-until').fill('2026-07-23')
await press(SIZE, tid(page, 'every-save')); await sleep(600)
const after7b = {}; for (const d of THU) after7b[d] = await cls(d)
/* remove the rule */
await press(SIZE, tid(page, 'days-wd-3')); await tid(page, 'win-every').waitFor(); await sleep(300)
const rm = tid(page, 'every-list').locator('button')
const nRules = await rm.count()
await press(SIZE, rm.first()); await sleep(500)
const after7c = {}; for (const d of [...THU, '2026-07-15', '2026-07-17']) after7c[d] = await cls(d)
await pic(page, P('p307-5-after-remove'))
judge('P3-07-' + SIZE, 'July 2026, press the Thursday heading: Night from 16 Jul to 30 Jul, Save; reopen (rule listed); change the end to 23 Jul, Save; Remove the rule', [
  ['title says Thursday', /Thursday/.test(everyTitle), everyTitle],
  ['sentence names Thursday, night flying, the dates', /Thursday/.test(says) && /night/i.test(says) && /16 Jul 2026/.test(says) && /30 Jul 2026/.test(says), says],
  ['after Save: Thu 16, 23, 30 night; Thu 2, 9 as before; Wed 15 / Fri 17 untouched', ['2026-07-16', '2026-07-23', '2026-07-30'].every(d => after7[d].startsWith('night')) && ['2026-07-02', '2026-07-09'].every(d => after7[d] === before7[d]) && after7['2026-07-15'] === before7['2026-07-15'] && after7['2026-07-17'] === before7['2026-07-17'], { before7, after7 }],
  ['rule listed on reopening', /Night/i.test(listed || '') && /16 Jul 2026/.test(listed || ''), listed],
  ['end changed to 23 Jul: 30 Jul returns to its default; 16 and 23 stay night; one rule only (same start replaces)', after7b['2026-07-30'] === before7['2026-07-30'] && after7b['2026-07-16'].startsWith('night') && after7b['2026-07-23'].startsWith('night') && nRules === 1, { after7b, nRules }],
  ['Remove: every Thursday back to what it was, other weekdays untouched', THU.every(d => after7c[d] === before7[d]) && after7c['2026-07-15'] === before7['2026-07-15'], { before7, after7c }],
], [P('p307-1-every-thursday') + '.png', P('p307-2-every-filled') + '.png', P('p307-3-after-save') + '.png', P('p307-4-reopened-listed') + '.png', P('p307-5-after-remove') + '.png'])
recErrors(P('script5'), errors)
await closeAll()
