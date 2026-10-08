import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDate, setNeed, press, isTouch } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const size = process.argv[2] || 'desk'
const { ctx, page, errors } = await world(browser, size)
// dates with TOTAL still needed 0..6, different splits (so seat-specific colouring would show)
const plan = [['2026-07-27', 0, 0], ['2026-07-28', 1, 0], ['2026-07-29', 0, 2], ['2026-07-30', 2, 1], ['2026-07-31', 1, 3], ['2026-08-03', 0, 5], ['2026-08-04', 3, 3], ['2026-08-05', 6, 0]]
for (const [iso, p, w] of plan) await setNeed(page, size, iso, p, w)
await backToSans(page, size, 2026, 7)
const colour = async iso => page.evaluate(i => { const c = document.querySelector(`[data-icday="${i}"]`); const need = document.querySelector(`[data-testid="sc-need-${i}"]`); return { cls: c.className.replace(/sc-day|is-open|is-picked/g, '').trim(), bg: getComputedStyle(c).backgroundColor, need: need.innerText.replace(/\s+/g, ' '), ncol: getComputedStyle(need).color } }, iso)
const read = async tag => {
  const out = {}
  for (const [iso] of plan) {
    if (iso === '2026-08-03') { await press(size, tid(page, 'sc-next')); await page.waitForTimeout(300) }
    out[iso] = await colour(iso)
  }
  await press(size, tid(page, 'sc-prev')); await page.waitForTimeout(300)
  console.log(tag, JSON.stringify(Object.entries(out).map(([k, v]) => `${k.slice(5)} need=${v.need} ${v.cls || 'none'}`)))
}
// Jul 27..31 are on July; Aug 3..5 on August. read():
async function readAll(tag) {
  const o = []
  await backToSans(page, size, 2026, 7)
  for (const [iso, p, w] of plan.filter(x => x[0] < '2026-08')) o.push([iso, await colour(iso)])
  await press(size, tid(page, 'sc-next')); await page.waitForTimeout(300)
  for (const [iso, p, w] of plan.filter(x => x[0] >= '2026-08')) o.push([iso, await colour(iso)])
  console.log(tag, o.map(([k, v]) => `${k.slice(5)} need=${v.need} -> ${v.cls || 'none'}`).join(' ; '))
  return o
}
await readAll('default 1/3/5')
await backToSans(page, size, 2026, 7); await shot(page, `p404-${size}-default-july`)
// the settings window
const openGear = async () => { await press(size, tid(page, 'sc-gear')); await tid(page, 'win-sansset').waitFor(); await page.waitForTimeout(300) }
const tries = async (label, y, a, r, extra) => {
  await openGear()
  await tid(page, 'sset-yellow').fill(y); await tid(page, 'sset-amber').fill(a); await tid(page, 'sset-red').fill(r)
  if (extra) { await tid(page, 'sset-mode-days').click(); await tid(page, 'sset-lead').fill(extra) }
  await press(size, tid(page, 'sset-save')); await page.waitForTimeout(400)
  const err = await tid(page, 'sset-err').innerText().catch(() => null)
  const open = await tid(page, 'win-sansset').count()
  const vc = await page.evaluate(() => ({ lead: window.VCONF.sansLead, mode: window.VCONF.sansCutMode, tones: JSON.stringify(window.__tones || null) }))
  console.log(label, '| err:', err, '| window open:', open, '| VCONF lead/mode', vc.lead, vc.mode)
  if (err) await shot(page, `p404-${size}-err-${label.replace(/[^a-z0-9]/gi, '')}`)
  if (open) { await press(size, tid(page, 'sset-cancel')); await page.waitForTimeout(250) }
  return { err, open }
}
const legend = () => tid(page, 'sc-legend').innerText().then(t => t.replace(/\s+/g, ' '))
console.log('legend', await legend())
await tries('equal 3/3/5 +lead 11', '3', '3', '5', '11')
await tries('descending 5/3/1 +lead 12', '5', '3', '1', '12')
await tries('zero 0/3/5 +lead 13', '0', '3', '5', '13')
await tries('blank ""/3/5 +lead 14', '', '3', '5', '14')
await tries('nonint 1/2.5/5 +lead 15', '1', '2.5', '5', '15')
await tries('negative 1/3/-5 +lead 16', '1', '3', '-5', '16')
console.log('legend after refusals', await legend())
await readAll('after refusals')
// a valid change: 2/4/6
await tries('valid 2/4/6 +lead 9', '2', '4', '6', '9')
console.log('legend after 2/4/6', await legend())
await readAll('after 2/4/6')
await tries('goodtones 3/5/7 + BAD lead abc', '3', '5', '7', 'abc')
console.log('legend after good-tones+bad-cutoff', await legend())
await tries('goodtones 3/5/7 + BAD lead -3', '3', '5', '7', '-3')
console.log('legend', await legend())
await backToSans(page, size, 2026, 7); await shot(page, `p404-${size}-246-july`)
console.log(size, 'errors', errors.join('|'))
await ctx.close(); await browser.close()
