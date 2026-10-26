// M3 follow-ups — [INP-LIST-PHONE-WIDTH] (his D1293) and [MED-ADD-RIGHT-FLASH] (his D1300): the Inputs page's List view,
// its calendar's day panel and the Medical tab on a phone (402 wide), each card's edges measured against the filters row;
// and "+ Medical" on a desktop. Usage: node lw-m3-follow-inputs.mjs <tag>   (tag: before | after)
import * as L from './lw-m3-follow-lib.mjs'
import { mkdirSync } from 'node:fs'
const tag = process.argv[2] || 'before'
mkdirSync(L.OUT, { recursive: true })
const edges = (page, sels) => page.evaluate(sels => Object.fromEntries(sels.map(s => {
  const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0)
  if (!e) return [s, null]
  const r = e.getBoundingClientRect(); return [s, { l: Math.round(r.left * 10) / 10, r: Math.round((innerWidth - r.right) * 10) / 10 }]
})), sels)

const w = await L.newCtx('phone')
const P = w.page
await L.signIn(w, 'admin')
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(700)
await P.click('#inListBtn'); await P.waitForTimeout(500)
await P.click('#inRangeBtn'); await P.waitForTimeout(300); await P.click('#inRangeAll'); await P.waitForTimeout(600)
console.log('LIST', JSON.stringify(await edges(P, ['#inFiltersBtn', '.inputs-filterfields', '.inputs-tools', '#inList', '[data-testid="inl-day"]', '#inList [data-iid]', '#inNew', '#inRangeBtn'])))
await L.shot(w, `inp-list-${tag}`)
await P.click('#inCalBtn'); await P.waitForTimeout(600)
const busy = await P.evaluate(() => { const c = [...document.querySelectorAll('#inpCal [data-icday]')].find(e => e.querySelector('[class*="bar"], [class*="ev"]')) || document.querySelector('#inpCal [data-icday]'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + 8, y: r.top + 8, d: c.dataset.icday } })
console.log('opening day', busy && busy.d)
if (busy) { await P.mouse.click(busy.x, busy.y); await P.waitForTimeout(800) }
console.log('DAYPANEL', JSON.stringify(await edges(P, ['[data-testid="win-inputsday"]', '[data-testid="win-inputsday"] [data-iid]', '[data-testid="win-inputsday"] .icard', '[data-testid="win-inputsday"] .sd-top', '[data-testid="win-inputsday"] .win-body'])))
await L.shot(w, `inp-daypanel-${tag}`)
await P.keyboard.press('Escape'); await P.waitForTimeout(300)
await P.click('#inMedBtn'); await P.waitForTimeout(700)
console.log('MED', JSON.stringify(await edges(P, ['#medNew', '#medView', '.medcard', '#inMedBtn'])))
await L.shot(w, `inp-med-${tag}`)
/* the windows on a phone stand in the middle — 12px each side (the found fault: the screen less 32 left them 8px short) */
const side = sel => P.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(innerWidth - r.right) } }, sel)
await P.click('#inSansMode'); await P.waitForTimeout(600)
const sc = await P.evaluate(() => { const c = [...document.querySelectorAll('#page-inputs [data-icday]')][10]; if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + 8, y: r.top + 8 } })
if (sc) { await P.mouse.click(sc.x, sc.y); await P.waitForTimeout(700) }
console.log('SANSDAY', JSON.stringify(await side('[data-testid="win-sansday"]')))
await L.shot(w, `win-sansday-${tag}`)
if (await L.vis(P, '[data-testid="win-sansday-x"]')) { await P.click('[data-testid="win-sansday-x"]'); await P.waitForTimeout(300) }
await P.click('#inMemberMode'); await P.waitForTimeout(500)
await P.click('#inListBtn'); await P.waitForTimeout(400)
await P.click('#inNew'); await P.waitForTimeout(700)
console.log('INPUTWIN', JSON.stringify(await side('[data-testid="win-inputedit"]')))
await L.shot(w, `win-inputedit-${tag}`)
console.log('ERRS', w.errs.length ? w.errs.join('\n') : 'none')
await L.closeBrowser()
