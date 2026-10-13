// W2 scenario 7 — Edit history, "A specific date" = today. VERSION 1
// usage: node s7.mjs desktop|phone
import { openWorld, tools, adminCategory } from './lib.mjs'
const WHICH = process.argv[2] || 'desktop'
console.log(`s4b VERSION 1 — ${WHICH}`)
const w = await openWorld(WHICH)
const { page, TOUCH } = w
const t = tools(w, `${WHICH}-s4b`)
const today = t.addDays(0)
const toast = () => page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.top > innerHeight * 0.6 && (e.innerText || '').trim() && e.children.length < 4 }).map(e => e.innerText.trim().replace(/\s+/g, ' ')).join(' | '))
const btn = async sel => page.locator(sel).first().evaluate(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim(), disabled: e.disabled }))

await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1500)
// find a visible remark cell on a flying line
const cells = await page.locator('.rmkcell span.txed').all()
let cell = null
for (const c of cells) { if (await c.isVisible()) { cell = c; break } }
console.log(`remark cells ${cells.length}, a visible one found: ${!!cell}`)
if (!cell) { await t.shot('s7-no-cell'); t.rec('7', WHICH, 'NOT WALKED', 'could not find a visible remark cell on a flying line to type in', ''); console.log(JSON.stringify(t.results)); await w.browser.close(); process.exit(0) }
await cell.scrollIntoViewIfNeeded()
const before = await cell.innerText()
if (TOUCH) await cell.tap(); else await cell.click()
await page.waitForTimeout(300)
await page.keyboard.press('End'); await page.keyboard.type(' odc7'); await page.keyboard.press('Tab'); await page.waitForTimeout(600)
const after = await cell.innerText().catch(() => '?')
console.log(`S7 remark before "${before.replace(/\s+/g, ' ')}" after "${after.replace(/\s+/g, ' ')}"`)
await t.shot('s7-remark-typed')
await adminCategory(page, '^Data')
await page.waitForSelector('#admLogMode')
await page.selectOption('#admLogMode', { label: 'A specific date' }); await page.waitForTimeout(350)
await page.locator('#admLogDate').scrollIntoViewIfNeeded()
const lab = await page.evaluate(() => { const l = document.querySelector('label[for="admLogDate"]'); return l ? l.textContent.trim() : null })
console.log(`S7 Edit history specific date label "${lab}"; box reads "${(await t.text('#admLogDate')).replace(/\s+/g, ' ')}"; button ${JSON.stringify(await btn('#admLog'))}`)
await t.press('#admLogDate')
const c = await t.cardOnTop('Edit history date')
await t.shot('s7-calendar')
// today = the 13th: its button
await t.pick(today)
await page.locator('#admLogDate').scrollIntoViewIfNeeded()
const v = await t.val('#admLogDate'), tx = await t.text('#admLogDate')
console.log(`S7 box now "${tx.replace(/\s+/g, ' ')}" (${v}); button ${JSON.stringify(await btn('#admLog'))}`)
await t.shot('s7-date-picked')
await page.locator('#admLog').scrollIntoViewIfNeeded()
const log0 = (await page.locator('#admData').innerText()).split('\n').map(s => s.trim()).filter(Boolean)
await t.press('#admLog')
const armed = await btn('#admLog')
console.log(`S4b armed: button "${armed.text}"`)
await t.press('#admLogDate'); await t.cardOnTop('Edit history date again')
const cm = await page.getAttribute('[data-testid="dcal"]', 'data-month')
await t.pick(`${cm}-12`)
const dis = await btn('#admLog')
console.log(`S4b after picking ${cm}-12: button "${dis.text}" disabled=${dis.disabled}; box reads "${(await t.text('#admLogDate')).replace(/\s+/g, ' ')}"`)
await t.shot('s4b-after-other-date')
console.log('errors', JSON.stringify(w.errors))
await w.browser.close()
