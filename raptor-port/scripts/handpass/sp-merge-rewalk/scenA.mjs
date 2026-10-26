import { launch, login, go, shot } from './common.mjs'
const size = process.argv[2] || 'desktop'
const tag = size === 'phone' ? 'ph' : 'dk'
const { browser, page, errors } = await launch(size)
await login(page)
const res = []
const txt = () => page.evaluate(() => document.body.innerText)
const tagState = () => page.evaluate(() => {
  const all = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /RULES MODIFIED/i.test(e.textContent || ''))
  return all.map(e => e.className + ':' + e.textContent.trim()).join('|') || 'none'
})
const top = async (name) => { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300); await shot(page, name) }
const legendGap = () => page.evaluate(() => {
  const d = [...document.querySelectorAll('details,summary,.legend,[class*=legend]')].find(e => /Legend/i.test(e.textContent || '') && e.getBoundingClientRect().width > 0)
  if (!d) return 'no legend found'
  const r = d.getBoundingClientRect(); const prev = d.previousElementSibling
  const pr = prev ? prev.getBoundingClientRect() : null
  return `legend ${d.tagName}.${d.className} top=${Math.round(r.top)} h=${Math.round(r.height)}; prev=${prev ? prev.tagName + '.' + prev.className + ' bottom=' + Math.round(pr.bottom) + ' h=' + Math.round(pr.height) : 'none'}`
})

// baseline at standard
await go(page, 'viewsched'); await top(`A1-${tag}-viewsched-standard`)
console.log('viewsched standard: tag', await tagState(), '|', await legendGap())
await go(page, 'logic')
await page.click('#lgEdit'); await page.waitForTimeout(400)
const box = page.locator('.lgset[data-lgkey="crewRest"] input').first()
console.log('crewRest box before:', await box.inputValue())
await box.scrollIntoViewIfNeeded()
await box.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('10h'); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
console.log('crewRest box after:', await box.inputValue().catch(() => '?'))
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
console.log('strip:', await page.evaluate(() => { const o = document.querySelector('#lgOff'); return o ? (o.hidden ? 'HIDDEN' : o.innerText) : 'absent' }))
await shot(page, `A2-${tag}-logic-changed-strip`)
await page.click('#lgDone').catch(() => {}); await page.waitForTimeout(400)
console.log('strip after Done:', await page.evaluate(() => { const o = document.querySelector('#lgOff'); return o ? (o.hidden ? 'HIDDEN' : o.innerText) : 'absent' }))
await shot(page, `A2b-${tag}-logic-after-done`)

await go(page, 'viewsched'); await top(`A3-${tag}-viewsched-changed`)
console.log('viewsched changed: tag', await tagState(), '|', await legendGap())
await go(page, 'editsched'); await top(`A4-${tag}-editsched-changed`)
console.log('editsched changed: tag', await tagState(), '|', await legendGap())
// scheduler board
await page.evaluate(() => window.scrollTo(0, 0))
const sb = page.locator('#eWeek [data-sbday="0"]:visible').first()
console.log('board door count', await sb.count())
if (await sb.count()) { await sb.click(); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(600); await shot(page, `A5-${tag}-board-changed`); console.log('board changed: tag', await tagState()); await page.evaluate(() => window.go && 0); const x = page.locator('#schedBoard').getByRole('button', { name: /Done|Close/ }).first(); if (await x.count()) await x.click(); await page.waitForTimeout(500) }

// reset
await go(page, 'logic')
console.log('reset visible:', await page.locator('#lgReset').isVisible())
await page.click('#lgReset'); await page.waitForTimeout(500)
// maybe a confirm
const conf = page.getByRole('button', { name: /^(Reset|Yes|Confirm|OK)/ })
console.log('confirm buttons:', await conf.count())
await page.evaluate(() => window.scrollTo(0, 0))
console.log('strip after reset:', await page.evaluate(() => { const o = document.querySelector('#lgOff'); return o ? (o.hidden ? 'HIDDEN' : o.innerText) : 'absent' }), '| box:', await box.inputValue().catch(() => '?'))
await shot(page, `A6-${tag}-logic-reset`)
await go(page, 'viewsched'); await top(`A7-${tag}-viewsched-reset`)
console.log('viewsched reset: tag', await tagState(), '|', await legendGap())
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
