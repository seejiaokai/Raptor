// Walker A, scenario 2 variant: phone, Manning button scrolled OUT of view when the bid is placed -> the bubble at the foot with Show (D1277)
import * as L from './lw-m3-walk-a-lib.mjs'
const tag = 's2b-ph'
console.log('lw-m3-walk-a2b v1', tag)
const w = await L.newCtx('phone')
const P = w.page, ID = '2b phone/chromium'
await L.signInPlain(w, 'admin')
await L.setRequired(w, 'p', '2026-02-20', 28)
await L.signInPlain(w, 'member', '2026-02-15')
await L.reachCell(w, 'bane', '2026-02-20')
// scroll the page so the Manning button is above the screen but Ranger's row is still in view
await P.evaluate(() => window.scrollBy(0, 260)); await P.waitForTimeout(400)
const mb = await P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); const c = document.querySelector('[data-testid="cell-bane-2026-02-20"]').getBoundingClientRect(); return { manningBottom: Math.round(r.bottom), cellY: Math.round(c.top), scrollY: Math.round(scrollY) } })
console.log('before tap', JSON.stringify(mb))
await L.shot(w, tag + '-00-scrolled')
await L.press(w, L.T('cell-bane-2026-02-20'), tag + '-01-celltap-q'); await P.waitForTimeout(450)
await L.shot(w, tag + '-01-open')
const dl = await L.dayline(P)
await L.step(w, tag + '-02-ll1', L.T('bid-LL'))
if (await L.vis(P, L.T('bid-picker'))) await L.step(w, tag + '-03-ll2', L.T('bid-LL'))
await P.waitForTimeout(500)
const foot = await P.evaluate(() => { const f = document.querySelector('[data-testid="manning-bubble-foot"]'); const u = document.querySelector('[data-testid="manning-bubble"]'); const e = f || u; if (!e) return null; const r = e.getBoundingClientRect(); return { kind: f ? 'foot' : 'under-manning', text: e.innerText.replace(/\s+/g, ' ').trim(), y: Math.round(r.top), b: Math.round(r.bottom), h: Math.round(r.height), vh: innerHeight, manningBottom: Math.round(document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect().bottom) } })
console.log('bubble', JSON.stringify(foot))
await L.shot(w, tag + '-04-bubble')
L.rec(ID + ' (bubble at the foot when Manning is out of view)', 'phone', foot && foot.kind === 'foot' && /Available P red/.test(foot.text) && /Show/.test(foot.text) ? 'PASS' : 'FAIL', `day line "${dl}"; bubble kind ${foot?.kind} "${foot?.text}" y ${foot?.y}-${foot?.b} of ${foot?.vh}; Manning button bottom ${foot?.manningBottom}`, [tag + '-04-bubble'])
if (foot?.kind === 'foot') {
  await L.step(w, tag + '-05-show', L.T('manning-bubble-show')); await P.waitForTimeout(600)
  const after = await P.evaluate(() => ({ scrollY: Math.round(scrollY), req: !!document.querySelector('[data-testid="req-p-2026-02-20"]'), reqVis: (() => { const e = document.querySelector('[data-testid="req-p-2026-02-20"]'); if (!e) return false; const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight })(), foot: !!document.querySelector('[data-testid="manning-bubble-foot"]'), toggle: document.querySelector('[data-testid="counts-toggle"]').getAttribute('aria-expanded') }))
  console.log('after Show', JSON.stringify(after))
  L.rec(ID + ' (Show › takes him up to the Manning rows, opened)', 'phone', after.reqVis && !after.foot ? 'PASS' : 'FAIL', `after Show: scrollY ${after.scrollY}, the Required P cell for 20 Feb in view: ${after.reqVis}, foot note gone: ${!after.foot}, Manning expanded ${after.toggle}`, [tag + '-05-show'])
}
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
