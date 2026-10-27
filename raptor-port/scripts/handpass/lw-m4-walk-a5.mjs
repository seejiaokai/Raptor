// Walker A, look 6: the dates tap, the slim bar, the bid window opened from it, the document viewer (test ids and pictures).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/explore'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, bidBatch, pressLoc, datesBtn, lineLoc } = A
const { T, shot, txt, vis } = L
console.log('[lw-m4-walk-a5 v1]')
const pdf = L.pdfPath('m4-a-form.pdf')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'member')
await bidBatch(w, 'bane', [{ iso: '2026-01-12', pdf }])
await L.switchTo(w, 'admin')
await L.openApprovals(w)
await pressLoc(w, datesBtn(P, 'Mon 12 Jan')); await P.waitForTimeout(400)
await shot(w, 'a5-grid-after-dates-400ms')
console.log('slim', await txt(P, T('appr-slim')))
const ring = await P.evaluate(() => { const r = document.querySelector('td.lw-ring'); if (!r) return null; const b = r.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), id: r.dataset.testid } })
console.log('ring', JSON.stringify(ring))
await P.waitForTimeout(3000)
await shot(w, 'a5-grid-3s')
await P.waitForTimeout(4000)
console.log('ring after 7 s', await P.evaluate(() => !!document.querySelector('td.lw-ring')))
await L.openCell(w, 'bane', '2026-01-12')
const ids = await P.evaluate(() => { const root = document.querySelector('[data-testid="bid-picker"]'); return root ? [...new Set([...root.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid))].join(' ') : 'NO window' })
console.log('bid window ids', ids)
console.log('window text', await txt(P, T('bid-picker')))
await shot(w, 'a5-bidwin-from-dates')
console.log('slim visible with window up', await vis(P, T('appr-slim')))
await L.closeWin(w)
await pressLoc(w, T('appr-back')) .catch(() => {})
await L.press(w, T('appr-back')); await P.waitForTimeout(600)
console.log('back -> approvals visible', await vis(P, T('approvals-page')))
await pressLoc(w, lineLoc(P, 'Mon 12 Jan').locator('[data-testid="appr-clip"]')); await P.waitForTimeout(700)
await shot(w, 'a5-viewer')
const viewer = await P.evaluate(() => {
  const strip = s => s.replace(/ style="[^"]*"/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>')
  const ids = [...new Set([...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && !/^(cell-|head-|row-|appr-(line|m-)|appr-range)/.test(e.dataset.testid)).map(e => e.dataset.testid))]
  const dlg = document.querySelector('[role="dialog"]')
  return { ids, dlg: dlg ? strip(dlg.outerHTML).slice(0, 2500) : null, text: dlg ? dlg.innerText.replace(/\s+/g, ' ') : null }
})
console.log(JSON.stringify(viewer, null, 1))
console.log('errs', JSON.stringify(w.errs))
await w.ctx.close(); await L.closeBrowser()
