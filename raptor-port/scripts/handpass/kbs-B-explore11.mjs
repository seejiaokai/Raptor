// exploration of the Required P cell — VERSION 1
import { launch, dumpInputs, dumpBtns } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore11 VERSION 1', size)
const A = await launch(size)
const { page } = A
await A.go('leavewar'); await page.waitForTimeout(1200)
await A.tap('[data-testid="month-FEB"]'); await page.waitForTimeout(900)
const c = page.locator('[data-testid="req-p-2026-02-10"]')
console.log('cell count', await c.count(), await c.first().innerText().catch(() => ''))
await c.first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
await A.shot('x-req-before')
await A.tap(c.first()); await page.waitForTimeout(600)
await A.shot('x-req-open')
console.log('active', await A.active())
console.log((await dumpInputs(page)).join('\n'))
console.log((await dumpBtns(page)).filter(x => /pad|key|digit|num|req/i.test(x) && !/req-p-|fly-row/.test(x)).join('\n'))
console.log(await page.evaluate(() => [...document.querySelectorAll('.bidsheet, [class*=pad]')].map(e => (e.getAttribute('data-testid') || e.className) + ' :: ' + e.innerText.replace(/\n/g, ' | ')).join('\n')))
console.log('errors', A.errors)
await A.close()
