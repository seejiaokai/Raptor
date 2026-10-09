import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDate, readDayWin, press, isTouch } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const size = process.argv[2] || 'desk'
const { ctx, page, errors } = await world(browser, size)
const L = (...a) => console.log(size, ...a)
const ISO = '2026-07-22'
await backToSans(page, size)
// ---- admin (Saber): the person control, several, non-SANS
await press(size, cell(page, ISO), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
await press(size, tid(page, 'sd-add')); await page.waitForSelector('#inpEditSave')
const opts = await page.evaluate(() => [...document.querySelectorAll('#inpEditPerson option')].map(o => o.value + ':' + o.textContent.trim()))
L('ADMIN single-person list', opts.length, opts.join(','))
const nonSans = await page.evaluate(() => { const P = window.PEOPLE; return opts => opts }, null)
const allIds = await page.evaluate(() => Object.keys(window.PEOPLE).filter(k => !window.PEOPLE[k].san && !window.PEOPLE[k].archived && !window.PEOPLE[k].deleted).slice(0, 5).map(k => k + ':' + window.PEOPLE[k].cs))
L('some non-SANS people exist:', allIds.join(','), '| any in list?', opts.filter(o => allIds.some(a => a.split(':')[0] === o.split(':')[0])).length)
const sevSw = await page.locator('#inpEditPop [data-testid="pp-several"]').count(); L('several switch present', sevSw)
await page.locator('#inpEditPop [data-testid="pp-several"]').click(); await page.waitForTimeout(250)
L('several groups:', await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-testid^="pp-all-"]')].map(b => b.getAttribute('data-testid')).join(',') + ' | pucks ' + document.querySelectorAll('#inpEditPop [data-pp]').length + ' | headings ' + [...document.querySelectorAll('#inpEditPop .pp-grp, #inpEditPop [class*=pp-h]')].map(e => e.innerText.trim()).join('/')))
await shot(page, `p408-${size}-admin-several`)
await page.click('#inpEditCancel'); await page.waitForTimeout(300)
// ---- a SANS member
await page.evaluate(() => { window.raptorMe('wrangler'); window.raptorRole('member') }); await page.waitForTimeout(500)
await backToSans(page, size)
if (!(await tid(page, 'win-sansday').count())) { await press(size, cell(page, ISO), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor() }
await page.waitForTimeout(300)
L('MEMBER(Otter, SANS): add enabled', !(await tid(page, 'sd-add').isDisabled()), 'gear', await tid(page, 'sc-gear').count(), 'Calendar…', await tid(page, 'sd-days').count())
await press(size, tid(page, 'sd-add')); await page.waitForSelector('#inpEditSave')
L('  person picker', await page.locator('#inpEditPerson').count(), 'fixed', await page.locator('#inpEditPersonFixed').innerText().catch(() => null), 'several switch', await page.locator('#inpEditPop [data-testid="pp-several"]').count())
await shot(page, `p408-${size}-member-editor`)
await page.click('#inpEditCancel'); await page.waitForTimeout(300)
// ---- Saber in the member view (identity Saber, a non-SANS man)
await page.evaluate(() => { window.raptorMe('stiff'); window.raptorRole('member') }); await page.waitForTimeout(500)
await backToSans(page, size)
if (!(await tid(page, 'win-sansday').count())) { await press(size, cell(page, ISO), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor() }
await page.waitForTimeout(300)
L('SABER MEMBER VIEW: add disabled', await tid(page, 'sd-add').isDisabled(), 'why:', await tid(page, 'sd-addwhy').innerText().catch(() => null), '| gear', await tid(page, 'sc-gear').count(), 'Calendar…', await tid(page, 'sd-days').count())
await shot(page, `p408-${size}-sabermember`)
console.log(errors.join('|'))
await ctx.close(); await browser.close()
