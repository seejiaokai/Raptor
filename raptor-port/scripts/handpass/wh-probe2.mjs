/* [WARN-HIDE-KEPT] probe 2: the markup of Tuesday's warning list, of a flagged puck, and of the board's checks panel, as
   the app draws them today (the mock-up edits these in the page). Reads only; one hide made through the app's own ✕. */
import * as L from './dbrA-lib.mjs'
import * as W from './dbrA-W1-lib.mjs'
import { mkdirSync } from 'node:fs'
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-01-warn-hide/probe'
mkdirSync(OUT, { recursive: true })
const browser = await L.launch()
const phone = !!process.env.HP_PHONE
const ctx = await L.context(browser, { phone })
const errors = []
const p = await L.page(ctx, errors)
await L.signIn(p, 'a')
await L.go(p, 'editsched')
const DI = 1
await W.showDay(p, DI)
await p.locator(`#eWeek .day[data-day="${DI}"] [data-daywarn="${DI}"]`).first().click(); await L.sleep(400)
const dom = await p.evaluate(di => {
  const day = document.querySelector(`#eWeek .day[data-day="${di}"]`)
  const box = day.querySelector(`[data-dwbox="${di}"]`)
  const pk = [...day.querySelectorAll('[data-person="wolf"]')].map(e => e.outerHTML.slice(0, 700))
  const pk2 = [...day.querySelectorAll('[data-person="salsa"]')].map(e => e.outerHTML.slice(0, 700))
  return { box: box.outerHTML, wolf: pk, salsa: pk2, head: day.querySelector('.dayhead, .dhead, header')?.outerHTML?.slice(0, 1500) }
}, DI)
console.log('BOX\n', dom.box, '\nWOLF\n', dom.wolf.join('\n'), '\nSALSA\n', dom.salsa.join('\n'))
await p.screenshot({ path: `${OUT}/${phone ? 'ph' : 'dk'}-eweek-tue.png` })
/* the board */
await W.boardOn(p, DI); await L.sleep(600)
if (phone) { const t = p.locator('#schedBoard [data-sbwtog]').first(); if (await t.count()) { await t.click(); await L.sleep(300) } }
const bdom = await p.evaluate(() => { const w = document.querySelector('#schedBoard .sb-warn'); return w ? w.outerHTML : '(no .sb-warn)' })
console.log('BOARD\n', bdom)
await p.screenshot({ path: `${OUT}/${phone ? 'ph' : 'dk'}-board-tue.png` })
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
