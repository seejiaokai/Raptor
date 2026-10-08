/* WALKER G — X-09's "from a schedule puck": is there any way to open a medical document from the schedule? */
import * as G from './cal-G-lib.mjs'
const { L, W, sleep } = G
G.setTag('puckdoc')
const { browser, p, errors } = await G.world({ who: 'a' })
await L.go(p, 'editsched'); await W.showDay(p, 0)
await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#schedBoard'); await sleep(900)
const found = await p.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const hits = [...root.querySelectorAll('[data-doc], .rclip, [class*="clip"], [title*="document" i], [aria-label*="document" i]')].map(e => e.outerHTML.slice(0, 120))
  const grit = [...root.querySelectorAll('.puck')].filter(e => /Grit/.test(e.innerText)).length
  return { hits, gritPucks: grit }
})
console.log('document controls on the board:', JSON.stringify(found))
// press a medically-down man's puck (Grit, ATT C) wherever it is drawn and see what opens
const gp = p.locator('#schedBoard .puck').filter({ hasText: 'Grit' }).first()
if (await gp.count()) { await gp.evaluate(e => e.scrollIntoView({ block: 'center' })); await gp.click(); await sleep(700) }
console.log('after pressing his puck: viewer open =', await p.locator('#docViewPop:not([hidden])').count(), '| any dialog =', await p.locator('[role=dialog]:visible, .airpop:visible').count())
await G.shot(p, 'board-grit-puck')
console.log('errors', JSON.stringify(errors))
await browser.close()
