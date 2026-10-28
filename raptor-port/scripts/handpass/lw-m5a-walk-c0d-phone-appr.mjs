// walker C recon: the phone's Approvals line structure (no verdicts)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/c/recon'
const { L, T } = await import('./lw-m5a-walk-c-lib.mjs')
console.log('[lw-m5a-walk-c0d-phone-appr v1]')
const w = await L.newCtx('phone'); const P = w.page
await L.signIn(w, 'admin'); await L.openApprovals(w)
console.log(JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('[data-testid^="appr-line-"]')].slice(0, 4).map(e => ({ id: e.dataset.testid, text: e.innerText.replace(/\s+/g, ' ').slice(0, 80), kids: [...e.querySelectorAll('[data-testid]')].map(k => k.dataset.testid).join(',') })))))
await L.shot(w, '13-phone-approvals')
await w.ctx.close(); await L.closeBrowser(); console.log('DONE')
