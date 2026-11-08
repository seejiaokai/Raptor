// W2 probe: Leave War entry on the healthy world (state3): cells on 15 Jul, what a tap opens.
import * as L from './sm-lib.mjs'
import { readFileSync } from 'node:fs'
console.log('sm-w2-p2 v2')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const state = JSON.parse(readFileSync(SCR + '/w2-state3.json', 'utf8'))
const W = await L.launch('pc', { origin: 'http://localhost:4393', state })
const { page } = W
await L.signIn(W)
await page.evaluate(() => window.go('leavewar')); await L.sleep(2500)
await page.waitForSelector('td[data-testid^="cell-"]', { timeout: 15000 })
const info = await page.evaluate(() => {
  const cells = [...document.querySelectorAll('td[data-testid^="cell-"]')]
  const jul = cells.filter(c => /2026-07-1[3-9]/.test(c.dataset.testid)).slice(0, 8).map(c => c.dataset.testid)
  const first = cells.slice(0, 3).map(c => c.dataset.testid)
  const last = cells.slice(-3).map(c => c.dataset.testid)
  const tabs = [...document.querySelectorAll('[data-testid^="lw-tab"],[data-testid="open-chip"],[data-testid^="month"]')].map(e => e.dataset.testid + ':' + e.textContent.trim().slice(0, 20))
  return { n: cells.length, jul, first, last, tabs }
})
console.log(JSON.stringify(info))
await L.pic(W, L.outDir('w2'), 'probe-lw', { clip: { x: 0, y: 0, width: 1536, height: 864 } })
await page.locator('[data-testid="month-JUL"]').click(); await L.sleep(1200)
const c = page.locator('[data-testid="cell-shaft-2026-07-15"]'); await c.scrollIntoViewIfNeeded(); await c.click(); await L.sleep(1200)
console.log('after cell click', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && !/^cell-|^row-|^hdr|month|^day-/.test(e.dataset.testid)).map(e => e.dataset.testid).slice(0, 60))))
await L.pic(W, L.outDir('w2'), 'probe-lw-cell', { clip: { x: 0, y: 0, width: 1536, height: 864 } })
const ap = page.locator('[data-testid="lw-tab-approvals"]'); await ap.click(); await L.sleep(1200)
console.log('approvals', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + ':' + e.textContent.trim().replace(/\s+/g,' ').slice(0, 70)).slice(0, 40))))
await L.pic(W, L.outDir('w2'), 'probe-lw-approvals', { clip: { x: 0, y: 0, width: 1536, height: 864 } })
await L.closeAll(W)
