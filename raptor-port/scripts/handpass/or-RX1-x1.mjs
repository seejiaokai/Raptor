// explore the picker's placeholder pucks
import { launch, openWorld, shotX, errs, log, WIN, describeWin } from './or-RX1-lib.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser, { fresh: false })
await p.evaluate(() => window.go('inputs'))
if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await p.locator('#inListBtn').click(); await p.waitForTimeout(200); await p.locator('#inNew').click(); await p.locator(WIN).waitFor()
await p.selectOption('#inpEditType', 'Personal')
await p.locator(`${WIN} [data-testid="pp-several"]`).click()
log('ph buttons', await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-ph]`)].map(b => ({ ph: b.getAttribute('data-ph'), text: b.innerText, pressed: b.getAttribute('aria-pressed'), dis: b.disabled, ad: b.getAttribute('aria-disabled'), title: b.title, cls: b.className })), WIN))
log('text', (await describeWin(p)).text.slice(0, 500))
await shotX(p, 'x1-picker')
log('errs', errs)
await browser.close()
