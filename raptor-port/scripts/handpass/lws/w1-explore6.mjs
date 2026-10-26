// W1 explore 6 — VERSION 1: why is the Nov cell missing after a month press
import { openWorld, tools } from './w1-lib.mjs'
const w = await openWorld('desktop'); const t = tools(w, 'w1-explore6'); const { page } = w
await t.go('leavewar')
const probe = async label => console.log(label, JSON.stringify(await page.evaluate(() => { const r = document.querySelector('tr[data-testid="row-rocky"]'); return { rowExists: !!r, cells: r ? r.querySelectorAll('[data-testid^="cell-rocky-2026-11"]').length : null, cellsAll: r ? r.querySelectorAll('[data-testid^="cell-"]').length : null, rows: document.querySelectorAll('tr[data-testid^="row-"]').length } })))
await probe('start')
await t.press('[data-testid="month-NOV"]'); await page.waitForTimeout(1200); await probe('after NOV')
await page.locator('tr[data-testid="row-rocky"]').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(800); await probe('after scroll row')
await t.press('[data-testid="month-OCT"]'); await page.waitForTimeout(1200); await probe('after OCT')
await t.press('[data-testid="month-NOV"]'); await page.waitForTimeout(1200); await probe('after NOV again')
console.log(w.errors); await w.browser.close()
