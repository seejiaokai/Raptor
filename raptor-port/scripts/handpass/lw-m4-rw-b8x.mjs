// Re-walk walker B, B8 exploration: the 2027 lines on a phone (no assertions).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { T, shot } = B
console.log('[lw-m4-rw-b8x v1]')
const w = await B.newPhone(402, 874, 'chromium'); const P = w.page
await B.signIn(w, 'admin')
await B.openApprovals(w)
await B.press(w, T('appr-elsewhere')); await B.sleep(w, 900)
console.log('view', await B.txt(P, T('period-label')))
const ls = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="appr-line-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid + ' :: ' + e.innerText.replace(/\s+/g, ' ')))
console.log(ls.join('\n'))
await shot(w, 'b8x-2027')
await w.ctx.close(); await B.closeAll()
