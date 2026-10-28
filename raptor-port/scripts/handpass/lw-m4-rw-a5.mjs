// Re-walk A5 — "Also since you last looked" (a member withdraws his own pending bid), beside r22-2. Run from raptor-port/.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const { L, placeBid, lineLoc } = await import('./lw-m4-walk-a-lib.mjs')
const { T, rec, shot, txt, press, vis } = L
console.log('[lw-m4-rw-a5 v1]')
const w = await L.newCtx('desk')
const P = w.page
try {
  await L.signIn(w, 'admin')
  await L.openApprovals(w)   // first visit, nothing yet
  await L.openGrid(w)
  await L.switchTo(w, 'member')
  await placeBid(w, 'bane', '2026-01-13')
  await placeBid(w, 'bane', '2026-01-15')
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)   // the visit that sees both
  console.log('visit 2:', await txt(P, T('appr-sub')))
  await L.openGrid(w)
  await L.switchTo(w, 'member')
  // withdraw the 13 Jan bid
  await L.openCell(w, 'bane', '2026-01-13')
  await press(w, T('bid-clear')); await P.waitForTimeout(500)
  if (await vis(P, T('bid-picker'))) { await press(w, T('bid-clear')); await P.waitForTimeout(600) }
  const gone = !(await P.locator(T('cell-bane-2026-01-13')).evaluate(e => /LL/.test(e.innerText)).catch(() => false))
  console.log('13 Jan bid gone from grid:', gone)
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  console.log('sub:', await txt(P, T('appr-sub')))
  await press(w, T('appr-new')); await P.waitForTimeout(500)
  await shot(w, 'a5-1-new-also')
  const also = await P.evaluate(() => {
    const el = document.querySelector('[data-testid="appr-also"]')
    if (!el) return null
    const rows = [...el.querySelectorAll('*')].filter(e => e.children.length === 0 && (e.innerText || '').trim()).map(e => ({ t: e.innerText.trim().slice(0, 40), cls: e.className.toString().slice(0, 25), l: Math.round(e.getBoundingClientRect().left), r: Math.round(e.getBoundingClientRect().right), top: Math.round(e.getBoundingClientRect().top), b: Math.round(e.getBoundingClientRect().bottom) }))
    const heads = [...document.querySelectorAll('.appr-cols:not(.ph) > *')].map(h => ({ t: h.innerText.trim(), l: Math.round(h.getBoundingClientRect().left) }))
    return { text: el.innerText.replace(/\s+/g, ' ').trim(), rows, heads }
  })
  console.log('also:', JSON.stringify(also, null, 0))
  rec('A5.1 under New: "Also since you last looked" lists the withdrawn bid', 'desk', also && /Bid withdrawn by Ranger/.test(also.text) ? 'PASS' : 'FAIL', also ? also.text : 'no also block', ['a5-1-new-also'])
  if (also) {
    const words = also.rows.find(r => /withdrawn/.test(r.t)); const dates = also.rows.find(r => /Jan/.test(r.t) && r !== words); const when = also.rows.find(r => /\d\d:\d\d/.test(r.t))
    const daysH = also.heads.find(h => h.t === 'DAYS'), placedH = also.heads.find(h => h.t === 'PLACED')
    console.log('words', JSON.stringify(words), 'dates', JSON.stringify(dates), 'when', JSON.stringify(when), 'DAYS@', daysH && daysH.l, 'PLACED@', placedH && placedH.l)
    const levelDates = words && dates && Math.abs((words.top + words.b) / 2 - (dates.top + dates.b) / 2) <= 3
    rec('A5.2 the words sit level with the dates', 'desk', levelDates ? 'PASS' : 'FAIL', `dates mid ${dates && (dates.top + dates.b) / 2} words mid ${words && (words.top + words.b) / 2}`, ['a5-1-new-also'])
    rec('A5.3 what happened stands under DAYS, the time under PLACED', 'desk', words && daysH && placedH && when && Math.abs(words.l - daysH.l) <= 2 && Math.abs(when.l - placedH.l) <= 2 ? 'PASS' : 'FAIL', `words left ${words && words.l} vs DAYS ${daysH && daysH.l}; time left ${when && when.l} vs PLACED ${placedH && placedH.l}`, ['a5-1-new-also'])
  }
  await shot(w, 'a5-2-also-zoom', { clip: { x: 20, y: 130, width: 1300, height: 420 } })
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 300)); await shot(w, 'a5-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close(); L.writeResults('a5'); await L.closeBrowser(); console.log('DONE')
