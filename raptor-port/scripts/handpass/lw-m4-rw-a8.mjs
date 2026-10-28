// Re-walk A8 — the bell: capitals on "Bidding open / Bidding closed" (D1433); a bell of 12+ lines scrolls inside, "Mark all read" at its foot, "↓ N more" until the end (C-F4).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc } = A
const { T, rec, shot, txt, press, vis } = L
console.log('[lw-m4-rw-a8 v1]')
const w = await L.newCtx('desk'); const P = w.page
const wait = ms => P.waitForTimeout(ms)
async function openDates() { await press(w, T('open-chip')); await P.waitForSelector(T('open-dates'), { state: 'visible' }); await wait(500) }
async function closeDates() { await press(w, T('open-dates-close')); await wait(400) }
const bell = async tag => { await L.openBell(w); const b = await L.bellLines(P); console.log(tag, b.length, 'lines'); return b }
try {
  await L.signIn(w, 'member')
  await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL')   // a write first (the order's 7.7)
  await L.switchTo(w, 'admin')
  await openDates()
  for (const k of ['2026-04', '2026-05', '2026-06']) { await press(w, T(`od-month-${k}`)); await wait(500) }
  console.log('lines:', await txt(P, T('od-lines')))
  await closeDates()
  await L.switchTo(w, 'member')
  const b1 = await bell('after opening Apr-Jun')
  await shot(w, 'a8-1-bell-open')
  const open = b1.filter(l => /Bidding open/.test(l.text))
  console.log('   ', b1.map(l => l.text).join(' | '))
  rec('A8.1 bell: "Bidding open" with a capital', 'desk', open.length >= 1 && !b1.some(l => /bidding open/.test(l.text)) ? 'PASS' : 'FAIL', b1.map(l => l.text).join(' | '), ['a8-1-bell-open'])
  await L.closeBell(w)
  await L.switchTo(w, 'admin')
  await openDates()
  for (const k of ['2026-04', '2026-05', '2026-06']) { await press(w, T(`od-month-${k}`)); await wait(500) }   // closes them (a month tap on an open month)
  console.log('lines after:', await txt(P, T('od-lines')))
  await closeDates()
  await L.switchTo(w, 'member')
  const b2 = await bell('after closing Apr-Jun')
  await shot(w, 'a8-2-bell-closed')
  console.log('   ', b2.map(l => l.text).join(' | '))
  rec('A8.2 bell: "Bidding closed" with a capital', 'desk', b2.some(l => /Bidding closed/.test(l.text)) && !b2.some(l => /bidding closed/.test(l.text)) ? 'PASS' : 'FAIL', b2.map(l => l.text).join(' | '), ['a8-2-bell-closed'])
  await L.closeBell(w)
  // a long bell: Ranger bids on 13 separate days; admin approves each separately
  const days = []
  for (let d = 7; d <= 31; d += 2) days.push('2026-01-' + String(d).padStart(2, '0'))
  console.log('days', days.join(' '))
  let placed = 0
  for (const iso of days) {
    await L.reachCell(w, 'bane', iso)
    await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId('bane', iso)); await wait(300)
    await L.openCell(w, 'bane', iso)
    if (await L.placeLeave(w, 'LL')) placed++
    await wait(200)
  }
  console.log('placed', placed)
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  const n = await P.locator('[data-testid="approvals-page"] .appr-ok').count()
  for (let i = 0; i < n; i++) { const b = P.locator('[data-testid="approvals-page"] .appr-ok').nth(i); await b.scrollIntoViewIfNeeded(); const bb = await b.boundingBox(); await P.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await wait(250) }
  console.log('approved', n, 'lines')
  await L.switchTo(w, 'member')
  await L.openBell(w); await wait(400)
  await shot(w, 'a8-3-long-bell')
  const info = await P.evaluate(() => {
    const list = document.querySelector('[data-testid="bell-list"]')
    if (!list) return null
    let sc = list; for (let e = list; e && e !== document.body; e = e.parentElement) { if (getComputedStyle(e).overflowY.match(/auto|scroll/) && e.scrollHeight > e.clientHeight + 1) { sc = e; break } }
    const panel = list.closest('#notifyPanel, [role=dialog], .bellpanel, .notif') || list.parentElement
    const mark = [...document.querySelectorAll('button')].find(b => /Mark all read/i.test(b.innerText) && b.getBoundingClientRect().height > 0)
    const more = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /↓\s*\d+\s*more/.test(e.innerText || '') && e.getBoundingClientRect().height > 0)
    const mr = mark && mark.getBoundingClientRect(), lr = sc.getBoundingClientRect()
    return { lines: list.querySelectorAll('[data-testid^="bell-line-"]').length, scrollerIsList: sc === list, scTag: sc.tagName + '.' + String(sc.className).slice(0, 30) + '#' + (sc.dataset.testid || sc.id), scH: sc.clientHeight, scScrollH: sc.scrollHeight, scTop: sc.scrollTop, listRect: [Math.round(lr.top), Math.round(lr.bottom)], markRect: mr && [Math.round(mr.top), Math.round(mr.bottom)], markInside: mr && mr.top >= lr.bottom - 1, more: more && more.innerText.trim(), vh: innerHeight, panelBottom: Math.round(panel.getBoundingClientRect().bottom) }
  })
  console.log('long bell:', JSON.stringify(info))
  rec('A8.3 a long bell scrolls inside; "Mark all read" stays at its foot; "↓ N more" shows', 'desk', info && info.scScrollH > info.scH + 1 && info.markRect && info.markRect[1] <= info.vh && info.more ? 'PASS' : 'FAIL', JSON.stringify(info), ['a8-3-long-bell'])
  // scroll to the end
  await P.evaluate(() => { const list = document.querySelector('[data-testid="bell-list"]'); let sc = list; for (let e = list; e && e !== document.body; e = e.parentElement) { if (getComputedStyle(e).overflowY.match(/auto|scroll/) && e.scrollHeight > e.clientHeight + 1) { sc = e; break } } sc.scrollTop = sc.scrollHeight }); await wait(500)
  await shot(w, 'a8-4-long-bell-end')
  const end = await P.evaluate(() => {
    const more = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /↓\s*\d+\s*more/.test(e.innerText || '') && e.getBoundingClientRect().height > 0)
    const mark = [...document.querySelectorAll('button')].find(b => /Mark all read/i.test(b.innerText) && b.getBoundingClientRect().height > 0)
    return { more: more ? more.innerText.trim() : null, mark: !!mark }
  })
  console.log('at the end:', JSON.stringify(end))
  rec('A8.4 at the end of the list: no "↓ N more", "Mark all read" still there', 'desk', !end.more && end.mark ? 'PASS' : 'FAIL', JSON.stringify(end), ['a8-4-long-bell-end'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'a8-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('a8'); await L.closeBrowser(); console.log('DONE')
