import { browser, fresh, go, box, snap } from './lib.mjs'
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const page = await fresh('ad')
const log = (...a) => console.log(...a)
async function sw(who) {
  await page.locator('button:has-text("Logout")').first().click(); await page.waitForTimeout(600)
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : who); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
}
async function war(label) {
  await go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-bane"]')
  const cur = await page.locator('[data-testid="war-picker"] option:checked').innerText()
  if (cur !== label) { await page.selectOption('[data-testid="war-picker"]', { label }); await page.waitForTimeout(700) }
  for (const t of ['counts-toggle','figures-toggle']) if ((await page.locator(`[data-testid="${t}"]`).getAttribute('aria-expanded')) === 'true') { await page.locator(`[data-testid="${t}"]`).click(); await page.waitForTimeout(300) }
  log('  war', await page.locator('[data-testid="war-picker"] option:checked').innerText(), '| stage', await page.locator('[data-testid="stage-now"]').innerText(), '| adv', await page.locator('[data-testid="stage-advance"]').innerText().catch(()=>'-'), '| back', await page.locator('[data-testid="stage-back"]').innerText().catch(()=>'-'), '| bidwin', await page.locator('[data-testid="bid-window"]').innerText().catch(()=>'-'))
}
const sheets = () => page.$$eval('[data-testid$="-sheet"], [data-testid="bid-picker"], [data-testid="daylist"]', els => els.map(e=>e.getAttribute('data-testid')+': '+e.innerText.replace(/\n/g,' | ').slice(0,200)))
// 1 + New
await go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-bane"]')
log('1. wars before', await page.locator('[data-testid="war-picker"] option').allTextContents())
await page.locator('[data-testid="war-new"]').click(); await page.waitForTimeout(300)
await page.locator('[data-testid="war-name"]').fill('JAN 28')
log('  war-month', await page.locator('[data-testid="war-month"]').innerText())
await page.locator('[data-testid="war-day-2028-01-01"]').click(); await page.locator('[data-testid="war-day-2028-01-31"]').click()
await snap(page, 'w1-new')
await page.locator('[data-testid="war-create"]').click(); await page.waitForTimeout(700)
await war('JAN 28')
await snap(page, 'w1-draft')
// 2 open
await page.locator('[data-testid="stage-advance"]').click(); await page.waitForTimeout(500)
log('2. opened'); await war('JAN 28')
await snap(page, 'w1-open')
// 3 member bids
await sw('us'); log('3. member'); await war('JAN 28')
await page.locator('[data-testid="cell-bane-2028-01-12"]').click(); await page.waitForTimeout(300)
log('  sheets', await sheets())
await page.locator('[data-testid="bid-LL"]').click(); await page.waitForTimeout(300)
if (await page.locator('[data-testid="bid-picker"]').count()) { log('  note', await page.locator('[data-testid="span-note"]').innerText().catch(()=>null)); await page.locator('[data-testid="bid-LL"]').click(); await page.waitForTimeout(500) }
log('  chip', await page.locator('[data-testid="cell-bane-2028-01-12"] .c').getAttribute('class').catch(()=>null), await page.locator('[data-testid="cell-bane-2028-01-12"]').innerText())
await snap(page, 'w1-bid')
// 4 admin closes, decides
await sw('ad'); log('4. admin'); await war('JAN 28')
await page.locator('[data-testid="stage-advance"]').click(); await page.waitForTimeout(500); await war('JAN 28')
await page.locator('[data-testid="cell-bane-2028-01-12"]').click(); await page.waitForTimeout(300)
await page.locator('[data-testid="decide-approve"]').click(); await page.waitForTimeout(500)
log('  chip', await page.locator('[data-testid="cell-bane-2028-01-12"] .c').getAttribute('class'))
// 5 publish
await page.locator('[data-testid="stage-advance"]').click(); await page.waitForTimeout(700)
log('5. published'); await war('JAN 28')
log('  toast', await page.locator('#toastEl').innerText().catch(()=>null))
await snap(page, 'w1-published')
// 6 member remarks
await sw('us'); log('6. member'); await war('JAN 28')
await page.locator('[data-testid="cell-bane-2028-01-12"]').click(); await page.waitForTimeout(400)
log('  sheets', await sheets())
if (await page.locator('[data-testid="remarks-field"]').count()) {
  await page.locator('[data-testid="remarks-field"]').fill('Family trip'); await page.locator('[data-testid="remarks-save"]').click(); await page.waitForTimeout(500)
  await page.locator('[data-testid="cell-bane-2028-01-12"]').click(); await page.waitForTimeout(300)
  log('  remark kept', await page.locator('[data-testid="remarks-field"]').inputValue())
  await snap(page, 'w1-remarks')
  await page.locator('[data-testid="remarks-cancel"]').click()
}
// member taps an empty day on published war
await page.locator('[data-testid="cell-bane-2028-01-18"]').click(); await page.waitForTimeout(300)
log('  empty day tap sheets', await sheets())
await page.keyboard.press('Escape')
// 7 member files on Inputs
await go(page, 'inputs'); await page.waitForSelector('#inAdd')
log('7. inputs person', await page.locator('#inPersonFixed').innerText().catch(()=>'select'))
log('  types', (await page.locator('#inType option').evaluateAll(o=>o.map(x=>x.value+'='+x.textContent))).slice(0,12).join(', '))
await page.selectOption('#inType', 'LL')
const walkTo = async iso => {
  for (let i = 0; i < 40 && !(await page.locator(`#inCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await page.locator('#inCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MON.indexOf(m) + 1).padStart(2, '0')}`
    await page.locator(`#inCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
  }
  await page.locator(`#inCal [data-cal="${iso}"]`).click()
}
await walkTo('2028-01-20')
log('  inDates', await page.locator('#inDates').innerText())
if (await page.locator('#inSpan').count()) await page.locator('#inSpan [data-span="all"]').click()
const n0 = await page.evaluate(() => window.INPUTS.length)
await page.locator('#inAdd').click(); await page.waitForTimeout(800)
log('  inputs +', (await page.evaluate(() => window.INPUTS.length)) - n0, 'toast', await page.locator('#toastEl').innerText().catch(()=>null))
log('  row', await page.evaluate(() => JSON.stringify(window.INPUTS.filter(r => r.date && String(r.date).includes('20') && r.type==='LL').slice(-1))))
await snap(page, 'w1-inputs')
await war('JAN 28')
log('  cell 20 Jan', await page.locator('[data-testid="cell-bane-2028-01-20"]').innerText(), await page.locator('[data-testid="cell-bane-2028-01-20"] .c').getAttribute('class').catch(()=>null))
await snap(page, 'w1-after-inputs')
await page.locator('[data-testid="cell-bane-2028-01-20"]').click(); await page.waitForTimeout(400)
log('  20 Jan member tap', await sheets())
await snap(page, 'w1-after-inputs-tap')
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
// 8 admin direct edit on published war
await sw('ad'); log('8. admin'); await war('JAN 28')
log('  cell 20 Jan (admin)', await page.locator('[data-testid="cell-bane-2028-01-20"]').innerText())
await page.locator('[data-testid="cell-bane-2028-01-25"]').click(); await page.waitForTimeout(300)
log('  sheets', await sheets())
if (await page.locator('[data-testid="bid-LL"]').count()) { await page.locator('[data-testid="bid-LL"]').click(); await page.waitForTimeout(300); if (await page.locator('[data-testid="bid-picker"]').count()) { log('  note', await page.locator('[data-testid="span-note"]').innerText().catch(()=>null)); await page.locator('[data-testid="bid-LL"]').click(); await page.waitForTimeout(500) } }
log('  25 Jan', await page.locator('[data-testid="cell-bane-2028-01-25"]').innerText(), await page.locator('[data-testid="cell-bane-2028-01-25"] .c').getAttribute('class').catch(()=>null))
await page.locator('[data-testid="cell-bane-2028-01-25"]').click(); await page.waitForTimeout(300)
log('  25 sheets', await sheets())
if (await page.locator('[data-testid="decide-approve"]').count()) { await page.locator('[data-testid="decide-approve"]').click(); await page.waitForTimeout(500) }
log('  25 Jan after', await page.locator('[data-testid="cell-bane-2028-01-25"] .c').getAttribute('class').catch(()=>null))
await snap(page, 'w1-admin-edit')
await browser.close()
