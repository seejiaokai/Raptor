// walker C — exploration 3: the Open-for-bidding window, a drag over an approved two-day leave
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/c/explore'
const L = await import('./lw-m4-lib.mjs')
const { T, shot, press, vis, txt } = L
console.log('[lw-m4-walk-c-explore3 v1]')
const w = await L.newCtx('desk')
const P = w.page
const ids = () => P.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid))
await L.signIn(w, 'member')
await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL')
await L.switchTo(w, 'admin')
await press(w, T('settings-open')); await P.waitForTimeout(500)
console.log('SETTINGS:', JSON.stringify((await ids()).filter(t => !/^(cell|row|lw-|drag|gpdrag|gdrag)/.test(t))))
await shot(w, 'settings')
await press(w, T('settings-days')); await P.waitForTimeout(600)
console.log('OPEN DATES:', JSON.stringify((await ids()).filter(t => !/^(cell|row|lw-)/.test(t))))
await shot(w, 'open-dates')
console.log('errs', w.errs)
await w.ctx.close()
await L.closeBrowser()
console.log('DONE')
