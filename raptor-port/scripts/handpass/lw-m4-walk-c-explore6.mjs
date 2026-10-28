// walker C — exploration 6: the changes window (clock) on Edit Schedule, and its lines for Leave War changes
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/c/explore'
const L = await import('./lw-m4-lib.mjs')
const { T, shot, press, vis, txt } = L
console.log('[lw-m4-walk-c-explore6 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'member')
await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL')
await L.switchTo(w, 'admin')
await L.openCell(w, 'bane', '2026-01-13'); await press(w, T('decide-approve')); await P.waitForTimeout(600)
await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(1200)
const tb = await P.evaluate(() => [...document.querySelectorAll('.topbar button, #topbar button, header button')].filter(e => e.getBoundingClientRect().height > 0).map(e => `${e.id || ''}|${e.getAttribute('title') || ''}|${e.getAttribute('aria-label') || ''}|${(e.innerText || '').slice(0, 14)}`))
console.log('TOPBAR:', JSON.stringify(tb))
await shot(w, 'editsched-top')
console.log('errs', w.errs)
await w.ctx.close()
await L.closeBrowser()
console.log('DONE')
