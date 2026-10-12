import * as L from './on-C-lib.mjs'
const { tid, shot, check } = L
const browser = await L.launch()
const { ctx, page, errors } = await L.world(browser)
const F = []
const oilOn = id => page.evaluate(i => JSON.stringify((window.INPUTS.find(r => r.iid === i) || {}).oil || null), id)
const tr = await L.fileIt(page, L.FRI, { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' }, 'yes')
const du = await L.fileIt(page, L.FRI, { type: 'Duty', people: ['harpoon'], title: 'Gate duty' }, 'yes')
F.push(`Filed on Fri 17 (working day, no question): Training Ranger+Tally ${tr}; Duty Trident ${du}`)
/* the Leave War's OIL tracker: read, picture, close */
async function tracker(label) {
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
  await page.locator('[data-testid="oil-tracker"]').click(); await page.waitForTimeout(900)
  const rows = await page.evaluate(() => {
    const out = {}
    const find = re => [...document.querySelectorAll('[data-testid^="oil-row-"]')].find(e => re.test(e.innerText))
    for (const [k, re] of [['Ranger', /^\s*Ranger\b/], ['Tally', /^\s*Tally\b/], ['Trident', /^\s*Trident\b/]]) {
      const r = find(re); out[k] = r ? r.getAttribute('data-testid') + ' :: ' + r.innerText.replace(/\s+/g, ' ').slice(0, 260) : 'NO ROW'
    }
    out.total = document.querySelectorAll('[data-testid^="oil-row-"]').length
    return out
  })
  await shot(page, `C7-${label}-tracker`)
  console.log('TRACKER', label, JSON.stringify(rows))
  F.push(`OIL tracker ${label}: ${JSON.stringify(rows)}`)
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  if (await page.locator('[data-testid="oil-sheet"]').count()) {
    const x = page.locator('[data-testid="oil-sheet"]').locator('button').filter({ hasText: /^[✕×x]$/ }).first()
    const c = await x.count(); if (c) await x.click(); else await page.mouse.click(1411, 36)
    await page.waitForTimeout(400)
  }
  console.log('sheet closed', await page.locator('[data-testid="oil-sheet"]').count() === 0)
  return rows
}
await tracker('1-before')
/* the holiday */
await L.fileOutHoliday(page, L.FRI, 'National Day')
console.log('list up', await tid(page, 'win-oilday').count(), 'inputs on it', await page.locator('[data-testid="win-oilday"] .icard').count())
await tid(page, `odl-yes-${tr}`).click(); await tid(page, `odl-no-${du}`).click()
console.log('COUNT', await tid(page, 'odl-count').innerText())
await L.hush(page); await shot(page, 'C7-2-list-yes-no'); await L.unhush(page)
await tid(page, 'odl-save').click(); await page.waitForTimeout(700)
F.push(`List: Yes on Range brief, No on Gate duty, Save; Training oil ${await oilOn(tr)}; Duty oil ${await oilOn(du)}; toast "${await L.toast(page)}"`)
async function earn(label) {
  await L.toBoard(page, L.FRI_DI)
  const on = await page.evaluate(() => !!(window.OILDAY != null || document.querySelector('#schedBoard [data-oilitem]')))
  if (!on) { await page.locator('#sbOil').click(); await page.waitForTimeout(900) }
  const info = await page.evaluate(() => {
    const items = [...document.querySelectorAll('#schedBoard [data-oilitem]')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 100))
    const oilp = [...document.querySelectorAll('#schedBoard [data-oilp]')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 40) + ' {' + (e.classList.contains('on') ? 'on' : e.classList.contains('off') ? 'off' : e.className.slice(0, 30)) + '}')
    return { items, oilp }
  })
  await L.hush(page)
  await page.evaluate(() => { const g = document.querySelector('#schedBoard [data-oilitem]'); if (g) g.scrollIntoView({ block: 'center' }) })
  await page.waitForTimeout(300)
  await shot(page, `C7-${label}-oilearn`); await L.unhush(page)
  console.log('EARN', label, JSON.stringify(info))
  F.push(`OIL Earn Friday ${label}: oil people ${JSON.stringify(info.oilp)}`)
  await page.locator('#sbOil').click().catch(() => {}); await page.waitForTimeout(400)
  await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(300)
}
await earn('3-before-publish')
await tracker('4-after-save-before-publish')
const pub = await L.signAndPublish(page, L.FRI_DI)
F.push('publish: ' + JSON.stringify(pub))
await earn('5-after-publish')
await tracker('6-after-publish')
console.log('FACTS\n' + F.join('\n'))
console.log('ERRORS', JSON.stringify(errors))
await ctx.close(); await browser.close()
