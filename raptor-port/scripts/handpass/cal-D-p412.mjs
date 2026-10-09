import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDate, readDayWin, press, isTouch, fileCommit, toMonth } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const size = process.argv[2] || 'desk'
const L = (...a) => console.log(size, ...a)
const HM = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const { ctx, page, errors } = await world(browser, size)
async function holTap(iso) {
  const at = async () => { const [m, y] = (await tid(page, 'holcal-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + HM.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await press(size, tid(page, 'holcal-next-month'))
  for (; d < 0; d++) await press(size, tid(page, 'holcal-prev-month'))
  await press(size, tid(page, `holcal-day-${iso}`))
}
await backToSans(page, size)
await press(size, cell(page, '2026-07-22'), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
await press(size, tid(page, 'sd-days')); await tid(page, 'win-days').waitFor(); await page.waitForTimeout(400)
// classes: night on 20, NF on 21
if (isTouch(size)) { await tid(page, 'days-step-2026-07-20').tap(); await page.waitForTimeout(150); await tid(page, 'days-step-2026-07-21').tap(); await page.waitForTimeout(150); await tid(page, 'days-step-2026-07-21').tap() }
else { await tid(page, 'days-n-2026-07-20').click(); await tid(page, 'days-nf-2026-07-21').click() }
await page.waitForTimeout(300)
// holidays
if (await tid(page, 'days-tabs').count()) await press(size, tid(page, 'days-tab-holidays'))
await press(size, tid(page, 'hol-add')); await tid(page, 'hol-name').fill('Founders Day'); await tid(page, 'hol-short').fill('FD'); await holTap('2026-07-24'); await press(size, tid(page, 'hol-save')); await page.waitForTimeout(400)
L('after PH save: err', await tid(page, 'hol-err').innerText().catch(() => 'none'), '| saved note', await tid(page, 'hol-saved').innerText().catch(() => 'none'))
await press(size, tid(page, 'hol-add')); await press(size, tid(page, 'hol-kind-off')); await tid(page, 'hol-name').fill('Stand Down'); await tid(page, 'hol-short').fill('SD'); await holTap('2026-07-28'); await press(size, tid(page, 'hol-save')); await page.waitForTimeout(400)
L('after Off save: err', await tid(page, 'hol-err').innerText().catch(() => 'none'))
await shot(page, `p412-${size}-calendar-window`)
await press(size, tid(page, 'win-days-x')); await page.waitForTimeout(300)
// a commitment placed and then changed
await press(size, cell(page, '2026-07-22'), { position: { x: 8, y: 8 } }).catch(() => {}); await page.waitForTimeout(300)
if (!(await tid(page, 'win-sansday').count())) { await press(size, cell(page, '2026-07-22'), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor() }
await fileCommit(page, size, 'vinci', { f: true }, { remarks: 'first note' }); await page.click('#inpEditSave'); await page.waitForTimeout(500)
const rowOpen = () => press(size, page.locator('[data-testid="win-sansday"] [data-testid^="sd-row-"]').first().locator('[data-testid="sd-open"]'))
await rowOpen(); await page.waitForSelector('#inpEditSave'); await page.fill('#inpEditRmk', 'edited note'); await page.click('#inpEditSave'); await page.waitForTimeout(500)
L('placement on the opened entry after the edit:', (await readDayWin(page)).list)
await shot(page, `p412-${size}-day22-placed`)
await tid(page, 'win-sansday-x').click().catch(() => {})
// the month: tags, icons, no placement clutter
await page.waitForTimeout(300)
const cellInfo = async iso => page.evaluate(i => {
  const c = document.querySelector(`[data-icday="${i}"]`); const tag = c.querySelector(`[data-testid="sc-tag-${i}"]`)
  const icon = [...c.querySelectorAll('[data-icon]')].map(e => e.getAttribute('data-icon'))
  const t = tag ? getComputedStyle(tag) : null
  return { icon, tag: tag ? tag.innerText.trim() : null, tagBg: t && t.backgroundColor, tagCol: t && t.color, cellText: c.innerText.replace(/\s+/g, ' '), clutter: /Placed|changed|Saber|Zenith|first note|edited/i.test(c.innerText), bg: getComputedStyle(c).backgroundColor, cls: c.className.replace(/sc-day/, '').trim() }
}, iso)
for (const d of ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-28']) L('SANS cell', d.slice(8), JSON.stringify(await cellInfo(d)))
await shot(page, `p412-${size}-month`)
// open each day
for (const d of ['2026-07-20', '2026-07-21', '2026-07-24', '2026-07-28']) {
  if (await tid(page, 'win-sansday').count()) await tid(page, 'win-sansday-x').click()
  await press(size, cell(page, d), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor(); await page.waitForTimeout(300)
  const w = await readDayWin(page); L('DAY', d.slice(8), 'title:', JSON.stringify(w.title), '| work:', w.work.slice(0, 120))
  if (d === '2026-07-24' || d === '2026-07-21') await shot(page, `p412-${size}-day${d.slice(8)}`)
}
await tid(page, 'win-sansday-x').click().catch(() => {})
// the Inputs month
await page.click('#inMemberMode'); await page.waitForTimeout(500); await toMonth(page, size, 2026, 7); await page.waitForTimeout(300)
const inp = await page.evaluate(() => ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-24', '2026-07-28'].map(i => { const c = document.querySelector(`[data-icday="${i}"]`); const head = c.closest('.ib-week, .ic-week') || c.parentElement; const heads = [...document.querySelectorAll(`[data-icdayhead="${i}"], .ib-head[data-icday="${i}"]`)]; return i.slice(8) + ': icons=' + [...c.querySelectorAll('[data-icon]')].map(e => e.getAttribute('data-icon')).join(',') + ' tag=' + [...c.querySelectorAll('[class*=tag], .ib-tag')].map(e => e.innerText.trim()).join('/') + ' text=' + c.innerText.replace(/\s+/g, ' ').slice(0, 50) }))
L('INPUTS month cells:', JSON.stringify(inp))
const leak = await page.evaluate(() => ({ sunmoon: document.querySelectorAll('#inpCal [data-icon="sun"], #inpCal [data-icon="night"], #inpCal [data-icon="moon"], .ic-mon-wrap [data-icon]').length, anyIcons: [...document.querySelectorAll('#inpCal [data-icon]')].map(e => e.getAttribute('data-icon')).slice(0, 5) }))
L('INPUTS month sun/moon icons:', JSON.stringify(leak))
await shot(page, `p412-${size}-inputs-month`)
console.log(errors.join('|'))
await ctx.close(); await browser.close()
