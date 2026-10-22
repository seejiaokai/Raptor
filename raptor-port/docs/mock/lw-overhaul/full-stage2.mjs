// A second entry on one day, through the bid window: Warden's free morning of Fri 23 Jan (his afternoon holds LL waiting).
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, q, esc, errs, OUT } from './full-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const { ctx, p } = await newPage(browser, 1536, 860, false, state)
await signIn(p, 'admin')
await p.click(q('cell-nact-2026-01-23')); await p.waitForTimeout(500)
console.log(await p.evaluate(() => [...document.querySelectorAll('.bidsheet button')].map(b => (b.dataset.testid || '') + ':' + b.textContent.trim() + (b.getAttribute('aria-pressed') === 'true' ? '*' : '')).join(' | ')))
if (await p.locator(q('bid-heldhalf')).count()) { await p.click(q('bid-heldhalf')); await p.waitForTimeout(300); console.log('heldhalf pressed') }
await p.click(q('portion-am')); await p.waitForTimeout(200)
await p.click(q('bid-OIL')); await p.waitForTimeout(400); await p.click(q('bid-OIL')); await p.waitForTimeout(500)
console.log('after:', await p.evaluate(() => document.querySelector('.bidsheet')?.innerText.replace(/\s+/g, ' ').slice(0, 300)))
await esc(p)
console.log(await p.evaluate(() => { const e = document.querySelector('[data-testid="cell-nact-2026-01-23"]'); return e.innerHTML.slice(0, 400) }))
writeFileSync(join(OUT, 'state.json'), JSON.stringify(await ctx.storageState({ indexedDB: true })))
await ctx.close(); await browser.close(); console.log('errors:', errs)
