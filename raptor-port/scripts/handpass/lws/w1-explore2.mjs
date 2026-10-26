// W1 explore 2 — VERSION 1: fixture on Hex, open the one-day sheet
import { openWorld, tools } from './w1-lib.mjs'
const which = process.argv[2] || 'desktop'
const w = await openWorld(which)
const t = tools(w, `w1-${which}-explore2`)
const { page } = w
const H = 'rocky'
const D10 = t.addDays(10)
await t.go('leavewar')
await t.press(`[data-testid="month-${t.monthOf(D10)}"]`)
await page.waitForTimeout(800)
const cell = `[data-testid="cell-${H}-${D10}"]`
console.log('cell count', await page.locator(cell).count())
await page.locator(cell).first().scrollIntoViewIfNeeded()
await t.press(cell)
await page.waitForTimeout(500)
await t.shot('sheet')
const tids = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && !/^(cell|row|month|dcal-day)/.test(e.getAttribute('data-testid')) }).map(e => e.getAttribute('data-testid')))
console.log('visible testids', tids.join(' '))
await t.press('[data-testid="bid-postout"]')
await page.waitForTimeout(400)
await t.shot('po')
const tids2 = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && !/^(cell|row|month|dcal-day)/.test(e.getAttribute('data-testid')) }).map(e => e.getAttribute('data-testid') + '=' + (e.getAttribute('data-value') || '') ))
console.log('after PO testids', tids2.join(' '))
console.log('errors', JSON.stringify(w.errors))
await w.browser.close()
