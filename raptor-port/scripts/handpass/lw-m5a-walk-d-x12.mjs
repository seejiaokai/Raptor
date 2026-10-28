// exploration 12: grade box list, the Grades window's testids, the lock, Undo button state
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press, vis, txt, shot } = L
console.log('[x12 v1]')
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin'); await D.openBalances(w)
const undoState = () => P.evaluate(() => ['undoBtn', 'redoBtn'].map(id => { const b = document.getElementById(id); return id + ':' + (b ? (b.disabled ? 'disabled' : 'on') + '/' + (b.title || b.getAttribute('aria-label') || '') : 'none') }).join(' '))
console.log('undo state:', await undoState())
await press(w, T('bal-grade-bane')); await P.waitForTimeout(500)
console.log('grade list:', await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-grade-opt-"]')].map(e => e.dataset.testid + '=' + e.innerText.replace(/\s+/g, ' ').trim()).join(' | ')))
await shot(w, 'x12-gradelist')
await P.keyboard.press('Escape'); await P.waitForTimeout(300)
await press(w, T('bal-grades')); await P.waitForTimeout(600)
console.log('grades sheet:', await P.evaluate(() => [...document.querySelectorAll('[data-testid="grades-sheet"] [data-testid], [data-testid="grades-sheet"] input')].map(e => (e.dataset.testid || e.tagName) + '=' + (e.value ?? e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 25)).join(' | ')))
await shot(w, 'x12-grades')
await press(w, T('grade-add')); await P.waitForTimeout(500)
console.log('after add:', await P.evaluate(() => [...document.querySelectorAll('[data-testid^="grade-draft"]')].map(e => e.dataset.testid + '=' + (e.value ?? e.innerText)).join(' | ')))
await shot(w, 'x12-draft')
await w.ctx.close(); await L.closeBrowser()
