// Re-walk A8c — C-F3 once: a member holding a bid in a stretch whose dates ended is told "Bidding closed · its dates ended".
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
const { T, rec, shot, txt, press } = L
console.log('[lw-m4-rw-a8c v1]')
const w = await L.newCtx('desk'); const P = w.page
const wait = ms => P.waitForTimeout(ms)
try {
  await L.signIn(w, 'member')
  await L.openCell(w, 'bane', '2026-01-08'); await L.placeLeave(w, 'LL')
  await L.switchTo(w, 'admin')
  await press(w, T('open-chip')); await P.waitForSelector(T('open-dates'), { state: 'visible' }); await wait(500)
  for (const k of ['2026-01', '2026-02', '2026-03']) { await press(w, T(`od-month-${k}`)); await wait(500) }
  await press(w, T('od-more')); await wait(500)
  await press(w, T('od-new-day-2026-01-06')); await wait(300)
  await press(w, T('od-new-day-2026-01-09')); await wait(400)
  await press(w, T('od-apply')); await wait(600)
  console.log('lines:', await txt(P, T('od-lines')))
  await press(w, T('open-dates-close')); await wait(400)
  await L.switchTo(w, 'member')
  await P.evaluate(t => window.lwSetMemberToday(t), '2026-01-12'); await wait(900)
  await L.openBell(w); await wait(400)
  const b = await L.bellLines(P)
  console.log('bell:', b.map(l => (l.unread ? '*' : '') + l.text).join(' | '))
  await shot(w, 'a8c-1-bell-after-pin')
  rec('A8.5 (C-F3) a stretch whose dates ended: "Bidding closed · its dates ended"', 'desk', b.some(l => /Bidding closed/.test(l.text) && /dates ended/.test(l.text)) ? 'PASS' : 'FAIL', b.map(l => l.text).join(' | '), ['a8c-1-bell-after-pin'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'a8c-error').catch(() => {}) }
await w.ctx.close(); L.writeResults('a8c'); await L.closeBrowser(); console.log('DONE')
