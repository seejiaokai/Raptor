import { browser, fresh, go, errors, SP } from './lib.mjs'
const page = await fresh()
await go(page, 'editsched')
const census = (root) => page.evaluate((root) => {
  const r = document.querySelector(root); if (!r) return {}
  const out = {}
  r.querySelectorAll('*').forEach(e => {
    for (const a of e.attributes) {
      if (!a.name.startsWith('data-')) continue
      const k = a.name
      if (!out[k]) out[k] = { n: 0, ex: (e.innerText || e.value || e.title || '').replace(/\s+/g, ' ').trim().slice(0, 24), tag: e.tagName }
      out[k].n++
    }
  })
  return out
}, root)
const week = await census('#eWeek .day[data-day="0"]')
await page.click('#eWeek [data-sbday="0"]:visible'); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(900)
await page.screenshot({ path: `${SP}/board-full.png` })
const board = await census('#schedBoard')
const keys = [...new Set([...Object.keys(week), ...Object.keys(board)])].sort()
for (const k of keys) {
  const w = week[k], b = board[k]
  const tag = w && b ? 'BOTH ' : w ? 'WEEK ' : 'BOARD'
  console.log(`${tag} ${k.padEnd(20)} week=${w ? w.n : 0} board=${b ? b.n : 0}  e.g. ${(b || w).tag} "${(b || w).ex}"`)
}
// how does it close
await page.click('#sbDone'); await page.waitForTimeout(700)
console.log('after Done: board visible', await page.locator('#schedBoard:visible').count(), 'page', await page.evaluate(() => window.CURPAGE))
// Escape closes?
await page.click('#eWeek [data-sbday="0"]:visible'); await page.waitForSelector('#schedBoard:visible'); await page.waitForTimeout(600)
await page.keyboard.press('Escape'); await page.waitForTimeout(600)
console.log('after Escape: board visible', await page.locator('#schedBoard:visible').count())
console.log(errors)
await browser.close()
