import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDate, readDayWin, press, isTouch, fileCommit, toMonth } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const size = process.argv[2] || 'desk'
const L = (...a) => console.log(size, ...a)
const { ctx, page, errors } = await world(browser, size)
const ISO = '2026-07-17', REM = 'SANSBACKDOOR'
await backToSans(page, size)
await press(size, cell(page, ISO), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
await fileCommit(page, size, 'yeti', { f: true }, { remarks: REM }); await page.click('#inpEditSave'); await page.waitForTimeout(500)
L('filed on SANS:', JSON.stringify(await readDate(page, ISO)), '| in SANS day window:', /SANSBACKDOOR|Bolt/.test((await readDayWin(page)).list))
await tid(page, 'win-sansday-x').click().catch(() => {})
const types = async sel => page.evaluate(s => { const e = document.querySelector(s); return e ? [...e.options].map(o => o.text.trim()) : null }, sel)
// 1. the Inputs month and its opened day
await page.click('#inMemberMode'); await page.waitForTimeout(500); await toMonth(page, size, 2026, 7); await page.waitForTimeout(300)
const bars = await page.evaluate(() => [...document.querySelectorAll('.ib-bar')].map(b => b.innerText.replace(/\s+/g, ' ')).filter(t => /Bolt|SANS|BACKDOOR/i.test(t)))
L('INPUTS MONTH bars mentioning Bolt/SANS:', JSON.stringify(bars))
await shot(page, `p409-${size}-inputs-month`)
await press(size, cell(page, ISO), { position: { x: 8, y: 8 } }); await page.waitForTimeout(500)
const idy = await tid(page, 'win-inputsday').innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => 'no window')
L('INPUTS DAY Jul 17:', idy.slice(0, 260))
// the "+ Input" door: a NEW input's Type list
await page.click('#icPopAdd'); await page.waitForSelector('#inpEditPop', { state: 'visible' }); await page.waitForTimeout(300)
L('+ Input (new) Type options:', JSON.stringify(await types('#inpEditType')))
await shot(page, `p409-${size}-newinput`)
await press(size, page.locator('#inpEditCancel')); await page.waitForTimeout(300)
// 2. an existing ordinary input's editor (retype): the Jul 16 demo input, or whichever is on the day
await tid(page, 'win-inputsday-x').click().catch(() => {}); await page.waitForTimeout(200)
await press(size, cell(page, '2026-07-23'), { position: { x: 8, y: 8 } }); await page.waitForTimeout(500)
const first = page.locator('[data-testid="win-inputsday"] [data-testid="idy-open"]').first()
if (await first.count()) { await press(size, first); await page.waitForSelector('#inpEditPop', { state: 'visible' }); await page.waitForTimeout(300); L('EXISTING input editor Type options (retype):', JSON.stringify(await types('#inpEditType')), 'selected', await page.locator('#inpEditType').inputValue().catch(() => null)); await shot(page, `p409-${size}-retype`); await press(size, page.locator('#inpEditCancel')); await page.waitForTimeout(300) }
else L('no ordinary input on 23 Jul to open')
// 3. the List
await tid(page, 'win-inputsday-x').click().catch(() => {})
await page.click('#inListBtn'); await page.waitForTimeout(500)
await page.click('#inRangeBtn').catch(() => {}); await page.click('#inRangeAll').catch(() => {}); await page.waitForTimeout(400)
if (isTouch(size)) { await page.click('#inFiltersBtn'); await page.waitForTimeout(300) }
await page.fill('#inFSearch', REM); await page.waitForTimeout(400)
L('LIST search "' + REM + '": rows', await page.locator('#inBody tr[data-iid]').count())
await page.fill('#inFSearch', 'Bolt'); await page.waitForTimeout(400)
L('LIST search "Bolt": rows', await page.locator('#inBody tr[data-iid]').count(), '| types shown:', await page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid] td[data-fld="Type"]')].map(t => t.innerText.trim()).join(',')))
await page.fill('#inFSearch', ''); await page.waitForTimeout(300)
L('LIST filter Type options:', JSON.stringify(await types('#inFType')))
L('LIST Add form Type options:', JSON.stringify(await types('#inType')))
const ed = page.locator('#inBody tr[data-iid] [data-edit]').first()
if (await ed.count()) { await press(size, ed); await page.waitForTimeout(300); L('LIST inline edit Type options:', JSON.stringify(await types('#inBody tr.ined [data-ed="type"]'))); await shot(page, `p409-${size}-inline`); await page.keyboard.press('Escape') }
await shot(page, `p409-${size}-list`)
// 4. the schedule's own SANS availability section
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1000)
const sa = await page.evaluate(() => { const h = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /SANS AVAIL/i.test(e.textContent)); return h.map(e => (e.closest('.sb-sec, .sec, section, .day') || e).innerText.replace(/\s+/g, ' ').slice(0, 200)).slice(0, 3) })
L('SCHEDULE SANS availability sections:', JSON.stringify(sa))
console.log(errors.join('|'))
await ctx.close(); await browser.close()
