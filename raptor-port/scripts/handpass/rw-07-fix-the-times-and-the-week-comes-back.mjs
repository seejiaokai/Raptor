/* G3 — tap the nought-minute warning, then FIX the times (which is what the
   warning asks for). What does the screen look like afterwards? */
import { open, board, type, STATE } from './lib.mjs'
const { browser, page, errors } = await open({ state: STATE })
const DI = 5
await board(page, DI)
const to = await page.evaluate(i => {
  const f = ((window.DAYS[i].waves || [])[0] || {}).formations
  return f && f[0] ? f[0].to : null
}, DI)
if (!to) { console.log('the seed Saturday has no flying line — nothing to walk'); await browser.close(); process.exit(0) }
await type(page, `[data-bfld="ff:${DI}.0.0.ld"]`, to)
await page.waitForTimeout(700)

const rows = await page.evaluate(() => [...document.querySelectorAll('.wln')].filter(e => e.offsetParent !== null)
  .map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60)))
const hit = rows.findIndex(x => /takes off and lands at the same time/.test(x))
await page.evaluate(i => { const e = [...document.querySelectorAll('.wln')].filter(x => x.offsetParent !== null); e[i].click() }, hit)
await page.waitForTimeout(600)

const look = () => page.evaluate(() => {
  const b = document.querySelector('#schedBoard') || document
  return {
    lit: b.querySelectorAll('.wfoc').length,
    dimmed: b.querySelectorAll('.puck.dim').length,
    pucks: b.querySelectorAll('.puck[data-person]').length,
    clearBtn: !!document.querySelector('[data-wclear], .wclear'),
    warnRows: [...document.querySelectorAll('.wln')].filter(e => e.offsetParent !== null).length,
  }
})
console.log('AFTER TAPPING the warning: ', JSON.stringify(await look()))

/* now do what the warning asks — correct the landing time */
await type(page, `[data-bfld="ff:${DI}.0.0.ld"]`, '11:30')
await page.waitForTimeout(900)
console.log('AFTER FIXING the times:   ', JSON.stringify(await look()))
console.log('errors:', errors.slice(0, 4))
await browser.close()
