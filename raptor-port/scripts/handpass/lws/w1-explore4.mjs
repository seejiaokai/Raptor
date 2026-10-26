// W1 explore 4 — VERSION 2
import { openWorld, tools } from './w1-lib.mjs'
const w = await openWorld(process.argv[2] || 'desktop')
const t = tools(w, 'w1-explore4'); const { page } = w
const D10 = t.addDays(10)
await t.go('leavewar')
const tap = async (id, iso) => { await t.press(`[data-testid="month-${t.monthOf(iso)}"]`); await page.waitForTimeout(700); await page.locator(`[data-testid="cell-${id}-${iso}"]`).first().scrollIntoViewIfNeeded(); await t.press(`[data-testid="cell-${id}-${iso}"]`); await page.waitForTimeout(400) }
await tap('rocky', D10)
await t.press('[data-testid="bid-postout"]'); await t.press('[data-testid="po-delete"]'); await t.press('[data-testid="po-confirm"]'); await t.press('[data-testid="po-confirm"]'); await page.waitForTimeout(600)
const info = await page.evaluate(() => { const tr = document.querySelector('tr[data-testid="row-rocky"]'); return [...tr.querySelectorAll('td')].filter(e=>/2026-10-3|2026-11-0[1-3]/.test(e.outerHTML.slice(0,300)) || /\bpo/.test(e.className)).slice(0,8).map(e=>e.outerHTML.slice(0,260)) })
console.log(info.join('\n'))
console.log(w.errors); await w.browser.close()
