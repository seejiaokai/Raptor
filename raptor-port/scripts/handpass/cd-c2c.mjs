/* C2 part three — the CANCEL leg, pressing the popup's own "Cancel line". */
import { open, board, shot, tap } from './lib.mjs'
import { bars, modeSnap, warCells, publishAL, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })

async function cxLine(page, key, want) {
  await tap(page, `[data-grcx="${key}"]`)
  await page.waitForTimeout(700)
  const pop = page.locator('#cxPop')
  if (!(await pop.count()) || !(await pop.isVisible())) return { popup: null }
  const btns = await pop.locator('button').evaluateAll(bs => bs.map(b => (b.innerText || '').trim()))
  const b = pop.locator('button').filter({ hasText: want }).first()
  const pressed = (await b.count()) ? (await b.innerText()).trim() : null
  if (pressed) { await b.click(); await page.waitForTimeout(900) }
  return { offered: btns, pressed }
}

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const SAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
const ix = await page.evaluate(i => window.DAYS[i].ground.findIndex(g => /OCU/i.test(g.prog || '')), di)
say('WAR Saber at the start:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await board(page, di)

say('CANCEL:', JSON.stringify(await cxLine(page, `${di}.${ix}`, /Cancel line/)))
say('row now:', await page.evaluate(([i, x]) => { const g = window.DAYS[i].ground[x]; return `${g.prog}|cx=${g.cx}|info=${!!g.info}` }, [di, ix]))
say('Saber bars with the row cancelled:', JSON.stringify((await bars(page)).filter(b => b.who === 'Saber').slice(0, 2)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
const m = await modeSnap(page)
say('MODE Saber with the row cancelled:', JSON.stringify(m.people.filter(p => p.who === 'Saber')))
say('does the cancelled row still offer a switch?', JSON.stringify(m.items.filter(i => /OCU/i.test(i.text))))
await shot(page, 'CD-C2-11-cancelled')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const p1 = await publishAL(page, di)
say('PUBLISH:', p1.label, '->', await headTxt(page))
say('WAR Saber with the row cancelled:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await board(page, di)

say('UN-CANCEL:', JSON.stringify(await cxLine(page, `${di}.${ix}`, /Un-cancel/)))
say('row now:', await page.evaluate(([i, x]) => { const g = window.DAYS[i].ground[x]; return `${g.prog}|cx=${g.cx}` }, [di, ix]))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Saber after un-cancelling:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Saber')))
await shot(page, 'CD-C2-12-un-cancelled')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const p2 = await publishAL(page, di)
say('PUBLISH:', p2.label, '->', await headTxt(page))
say('WAR Saber at the end:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
