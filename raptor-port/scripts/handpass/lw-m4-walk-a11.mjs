// Walker A, look 11: a Manning counter's own window (where its amber and red numbers are typed).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
const { T, shot, txt } = L
console.log('[lw-m4-walk-a11 v1]')
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin')
const heads = await P.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => !/-\d{4}-\d\d-\d\d$/.test(e.dataset.testid) && /count|ctr|manning|mrow|label/i.test(e.dataset.testid)).map(e => e.dataset.testid + ':' + e.innerText.trim().slice(0, 12)).slice(0, 40))
console.log('heads', JSON.stringify(heads))
const rowHead = P.locator('[data-testid="manning-info-ip"], [data-testid="x1"], [data-testid="x2"]').first()
console.log('ip head count', await rowHead.count())
if (await rowHead.count()) { await rowHead.click(); await P.waitForTimeout(700) }
await shot(w, 'a11-counter-window')
const ids = await P.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && !/^(cell-|head-|row-|month-|count-|counter-name)/.test(e.dataset.testid)).map(e => e.dataset.testid))].filter(i => /ctr|counter|amber|red|point|warn|save|rule|sheet/i.test(i)))
console.log('ids', JSON.stringify(ids))
console.log('errs', JSON.stringify(w.errs))
await w.ctx.close(); await L.closeBrowser()
