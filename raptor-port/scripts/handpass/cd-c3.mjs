/* C3 — a row reordered, its man swapped, deleted and re-made, while a
   decision sits on it.  F20 / C13. */
import { open, board, shot, tap, put } from './lib.mjs'
import { bars, modeSnap, tapOilPerson, tapOilItem, warCells, publishAL, dragRow, history, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })
const ground = p => p.evaluate(i => window.DAYS[i].ground.map((g, n) => `${n}:${g.prog}|${g.str}-${g.end}|${(window.PEOPLE[g.who] || {}).cs || g.who}`), di)

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const SAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
say('GROUND:', JSON.stringify(await ground(page)))
const grips = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-move]')].filter(e => e.offsetParent)
  .map(e => ({ k: e.dataset.move, row: ((e.closest('tr,.sb-arow,.sb-grow') || {}).innerText || '').replace(/\s+/g, ' ').trim().slice(0, 34) })).filter(x => /^mv:g/.test(x.k)))
say('GROUND GRIPS:', JSON.stringify(grips))

/* the decisions: Saber off OCU REVIEW, and the OFT sim switched off */
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
const ms0 = await modeSnap(page)
say('Saber pucks:', JSON.stringify(ms0.people.filter(p => p.who === 'Saber').map(p => p.where)))
const ocuIx = ms0.people.filter(p => p.who === 'Saber').findIndex(p => /OCU/.test(p.where))
await tapOilPerson(page, 'Saber', ocuIx < 0 ? 1 : ocuIx)
say('Saber after the deny:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Saber')))
say('sim item switch:', await tapOilItem(page, /EP-6/))
say('items now:', JSON.stringify((await modeSnap(page)).items.filter(i => /EP-6/.test(i.text))))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const p1 = await publishAL(page, di)
say('AL1:', p1.label, '->', await headTxt(page))
say('WAR Saber after AL1:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await board(page, di)
await shot(page, 'CD-C3-01-decisions-issued')

/* 1 — REORDER: drag OCU REVIEW down past ADMIN */
if (grips.length >= 2) {
  say('drag:', await dragRow(page, `[data-move="${grips[0].k}"]`, `[data-move="${grips[grips.length - 1].k}"]`))
}
say('GROUND after the drag:', JSON.stringify(await ground(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Saber after the reorder:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Saber')))
await shot(page, 'CD-C3-02-after-reorder')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)

/* 2 — SWAP the man on OCU REVIEW */
const ix = await page.evaluate(i => window.DAYS[i].ground.findIndex(g => /OCU/i.test(g.prog || '')), di)
say('OCU REVIEW is now row', ix)
const del = await page.evaluate(([i, x]) => {
  const row = [...document.querySelectorAll(`#schedBoard [data-fill="g:${i}.${x}.+"]`)][0]
  const pk = row ? row.parentElement.querySelector('.puck[data-person]') : null
  return pk ? { person: pk.dataset.person, html: pk.outerHTML.slice(0, 80) } : null
}, [di, ix])
say('the puck on it:', JSON.stringify(del))
await page.evaluate(([i, x]) => {
  const pk = [...document.querySelectorAll(`#schedBoard .puck[data-person]`)].find(e => {
    const r = e.closest('tr, .sb-grow'); return r && /OCU/i.test(r.innerText || '')
  })
  if (pk) { const ev = new MouseEvent('contextmenu', { bubbles: true }); pk.dispatchEvent(ev) }
}, [di, ix])
await page.waitForTimeout(700)
say('GROUND after removing him:', JSON.stringify(await ground(page)))
const newMan = await put(page, `[data-fill="g:${di}.${ix}.+"]`, ['dj', 'slash', 'harpoon'])
say('put a new man on:', newMan)
say('GROUND:', JSON.stringify(await ground(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
const msSwap = await modeSnap(page)
say('MODE on OCU REVIEW after the swap:', JSON.stringify(msSwap.people.filter(p => /OCU/i.test(p.where))))
await shot(page, 'CD-C3-03-after-swap')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)

/* put Saber back */
await page.evaluate(() => {
  const pk = [...document.querySelectorAll('#schedBoard .puck[data-person]')].find(e => {
    const r = e.closest('tr, .sb-grow'); return r && /OCU/i.test(r.innerText || '')
  })
  if (pk) pk.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
})
await page.waitForTimeout(600)
say('Saber back on:', await put(page, `[data-fill="g:${di}.${ix}.+"]`, [SAB]))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE OCU REVIEW when Saber returns:', JSON.stringify((await modeSnap(page)).people.filter(p => /OCU/i.test(p.where))))
await shot(page, 'CD-C3-04-saber-back')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)

/* 3 — DELETE the sim row that carries the item switch, then undo */
say('SIMS before:', JSON.stringify(await page.evaluate(i => window.DAYS[i].sims.oft.map(s => `${s.label}|${s.str}-${s.end}`), di)))
await tap(page, `[data-srdel="${di}.oft.0"]`)
await page.waitForTimeout(900)
say('SIMS after the delete:', JSON.stringify(await page.evaluate(i => window.DAYS[i].sims.oft.map(s => `${s.label}|${s.str}-${s.end}`), di)))
say('head:', await headTxt(page))
await page.locator('#sbUndo').click(); await page.waitForTimeout(1000)
say('SIMS after Undo:', JSON.stringify(await page.evaluate(i => window.DAYS[i].sims.oft.map(s => `${s.label}|${s.str}-${s.end}`), di)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE EP-6 switch after the undo:', JSON.stringify((await modeSnap(page)).items.filter(i => /EP-6/.test(i.text))))
await shot(page, 'CD-C3-05-after-undo-delete')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)

/* 4 — delete for real, publish, then build the same row again */
await tap(page, `[data-srdel="${di}.oft.0"]`)
await page.waitForTimeout(800)
const p2 = await publishAL(page, di)
say('PUBLISH after the delete:', p2.label, '->', await headTxt(page), p2.why || '')
await board(page, di)
await tap(page, `[data-sradd="${di}.oft"]`)
await page.waitForTimeout(700)
const { type } = await import('./lib.mjs')
await type(page, `[data-bfld="sr:${di}.oft.0.label"]`, 'EP-6')
await type(page, `[data-bfld="sr:${di}.oft.0.str"]`, '14:00')
await type(page, `[data-bfld="sr:${di}.oft.0.end"]`, '15:30')
say('new sim row:', JSON.stringify(await page.evaluate(i => window.DAYS[i].sims.oft.map(s => `${s.label}|${s.str}-${s.end}`), di)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE the NEW EP-6 row:', JSON.stringify((await modeSnap(page)).items.filter(i => /EP-6/.test(i.text))))
await shot(page, 'CD-C3-06-new-row-fresh')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('head at the end:', await headTxt(page))
say('HISTORY:', JSON.stringify((await history(page) || {}).top))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
