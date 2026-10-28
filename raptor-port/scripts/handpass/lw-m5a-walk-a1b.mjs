// walker A: the empty box, verified (blank + Enter, blank + leaving by another press) — admin, desktop
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a/a1b'
process.env.LW_TODAY ||= '2026-01-25'
const A = await import('./lw-m5a-walk-a-lib.mjs')
const { L, T, rec, press, txt, balRow, shotD } = A
console.log('[lw-m5a-walk-a1b v1]')
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin'); await A.openBalances(w)
const undo0 = await P.evaluate(() => document.querySelector('#undoBtn')?.disabled)
await press(w, T('bal-LVE-bane')); await P.waitForTimeout(200)
await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.waitForTimeout(200)
const v1 = await P.locator(T('bal-LVE-bane')).inputValue()
await shotD(w, 'blank-typed')
await P.keyboard.press('Enter'); await P.waitForTimeout(600)
const v2 = await P.locator(T('bal-LVE-bane')).inputValue()
const e2 = await txt(P, T('bal-LVE-bane-err'))
await shotD(w, 'blank-enter')
console.log('blank typed, box read:', JSON.stringify(v1), '| after Enter box', JSON.stringify(v2), 'words', e2, 'undo disabled', undo0, '->', await P.evaluate(() => document.querySelector('#undoBtn')?.disabled), 'row', JSON.stringify(await balRow(P, 'bane')))
// blank, then leave by pressing another box
await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.waitForTimeout(150)
const v3 = await P.locator(T('bal-LVE-bane')).inputValue()
await press(w, T('bal-LVE-stiff')); await P.waitForTimeout(600)
const v4 = await P.locator(T('bal-LVE-bane')).inputValue()
const e4 = await txt(P, T('bal-LVE-bane-err'))
await shotD(w, 'blank-leave')
console.log('blank typed (box read', JSON.stringify(v3), ') then pressed another box: bane box', JSON.stringify(v4), 'words', e4, 'row', JSON.stringify(await balRow(P, 'bane')))
console.log('errs', w.errs)
L.writeResults('a1b')
await w.ctx.close(); await L.closeBrowser()
