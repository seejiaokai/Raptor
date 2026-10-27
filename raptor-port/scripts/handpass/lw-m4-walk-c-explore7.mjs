// walker C — exploration 7: as Ranger, file an LL on the Inputs page
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/c/explore'
const L = await import('./lw-m4-lib.mjs')
const { T, shot, press, vis, txt } = L
console.log('[lw-m4-walk-c-explore7 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'member')
await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL')
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(900)
await P.getByRole('button', { name: 'List' }).first().click(); await P.waitForTimeout(600)
await P.click('#in-new'); await P.waitForTimeout(800)
await shot(w, 'new-input-window')
const dump = await P.evaluate(() => [...document.querySelectorAll('#win-inputedit *')].filter(e => e.getBoundingClientRect().height > 0 && (e.id || e.dataset.testid || e.tagName === 'SELECT' || e.tagName === 'BUTTON' || e.tagName === 'INPUT')).map(e => `${e.tagName}#${e.id || ''}|${e.dataset.testid || ''}|${(e.innerText || e.value || '').slice(0, 16)}`).filter(t => !/inpEdCal-day/.test(t)))
console.log('NEW WINDOW:', JSON.stringify(dump.slice(0, 80)))
console.log('errs', w.errs)
await w.ctx.close()
await L.closeBrowser()
console.log('DONE')
