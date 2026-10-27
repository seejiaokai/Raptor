// Walker A, look 7: the settings gear (+ SANS), the bid window's more menu (Post out), a day's list with two entries (test ids and pictures).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, bidBatch, placeBid, pressLoc } = A
const { T, shot, txt, vis, press } = L
console.log('[lw-m4-walk-a6 v1]')
const w = await L.newCtx('desk')
const P = w.page
const ids = (rootSel) => P.evaluate(sel => { const root = sel ? document.querySelector(sel) : document; return root ? [...new Set([...root.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && !/^(cell-|head-|row-|month-)/.test(e.dataset.testid)).map(e => e.dataset.testid))].join(' ') : 'NO root' }, rootSel)
await L.signIn(w, 'admin')
/* the gear */
await press(w, T('settings-open')); await P.waitForTimeout(700)
await shot(w, 'a6-settings')
console.log('settings ids:', (await ids(null)).split(' ').filter(i => !/^(lw-tab|oil-|period|war-|my-leave|counts|open-chip|legend|counter|settings-open|lw-appr)/.test(i)).join(' '))
const buttons = await P.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.innerText || '').trim().replace(/\s+/g, ' ')).filter(t => /sans|group|show|add/i.test(t)).slice(0, 30))
console.log('buttons about sans/groups:', JSON.stringify(buttons))
await P.keyboard.press('Escape'); await P.waitForTimeout(400)
/* the more menu of a bid */
await L.switchTo(w, 'member')
await bidBatch(w, 'bane', [{ iso: '2026-01-13' }])
await L.switchTo(w, 'admin')
await L.openCell(w, 'bane', '2026-01-13')
await press(w, T('bid-more')); await P.waitForTimeout(500)
await shot(w, 'a6-bid-more')
console.log('more menu text:', await txt(P, T('bid-picker')))
console.log('ids in window', await ids('[data-testid="bid-picker"]'))
const menu = await P.evaluate(() => [...document.querySelectorAll('[role="menu"] *, [data-testid^="bid-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.dataset.testid || ''}:${(e.innerText || '').trim().slice(0, 30)}`).filter(s => /post|more|oil|outc/i.test(s)))
console.log('menu items', JSON.stringify(menu))
console.log('errs', JSON.stringify(w.errs))
await w.ctx.close(); await L.closeBrowser()
