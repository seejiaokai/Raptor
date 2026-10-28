// walker C, scenarios 2, 3, 4 — re-typed bids, another kind placed approved over a bid, a remark from the drag window (desktop)
const CL = await import('./lw-m4-walk-c-lib.mjs')
const L = await CL.setup('c', 's234')
const H = CL.mk(L)
const { T, rec, shot, press, vis, txt } = L
console.log('[lw-m4-walk-c2 v2]')
L.clearOut()
const size = 'desk'
const w = await L.newCtx(size)
const P = w.page
let before = []
const say = (...a) => console.log(...a)
const wait = ms => P.waitForTimeout(ms)
const ids = () => P.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).filter(t => /^(bid-|decide|sel-|portion|select-sheet|dl-)/.test(t) && !/-left$/.test(t)))
async function memberBell(id, label) {
  await L.switchTo(w, 'member')
  const after = await H.bell(w)
  const fresh = H.bellDiff(before, after)
  const gone = before.filter(b => !after.some(a => a.id === b.id))
  await shot(w, `${id}-bell`)
  say(`   bell after ${label}: new=${fresh.length}`, fresh.map(l => `${l.unread ? '*' : ''}${l.text}`).join(' | '), gone.length ? ` ;; gone: ${gone.map(g => g.text).join(' | ')}` : '')
  before = after
  return { fresh, after, gone }
}
/* press a leave button of the open window until the window closes (a second tap answers "below zero") */
async function placeVia(prefix, type) {
  const sheet = prefix === 'sel' ? T('select-sheet') : T('bid-picker')
  await press(w, T(`${prefix}-${type}`)); await wait(500)
  if (await vis(P, sheet)) { await press(w, T(`${prefix}-${type}`)); await wait(600) }
  return !(await vis(P, sheet))
}
try {
  await L.signIn(w, 'member')
  /* ---- 2: re-typed ---- */
  await H.bid(w, '2026-02-16'); await H.bid(w, '2026-02-17'); await H.bid(w, '2026-02-19')
  before = await H.bell(w); await L.closeBell(w)
  await L.switchTo(w, 'admin')
  await L.openCell(w, 'bane', '2026-02-16')
  const tick = await L.approveWhatIEnter(w, false)
  say('   Approve what I enter now', tick, '(aria-checked ' + await P.locator(T('bid-approve-tick')).first().getAttribute('aria-checked') + ')')
  await L.closeWin(w)
  /* 2a: the drag window over both days, OL */
  const opened = await H.drag(w, '2026-02-16', '2026-02-17')
  say('   drag window ids:', JSON.stringify(await ids()))
  const tickSel = await P.locator(T('sel-approve-tick')).first().getAttribute('aria-checked')
  await shot(w, '2a-drag-window')
  const placed2a = await placeVia('sel', 'OL')
  await shot(w, '2a-after')
  say('   2a placed', placed2a, 'tick in drag window', tickSel)
  /* 2b: the one-day window, OL */
  await L.openCell(w, 'bane', '2026-02-19')
  await shot(w, '2b-window')
  const placed2b = await placeVia('bid', 'OL')
  await shot(w, '2b-after')
  const grid2 = await Promise.all(['2026-02-16', '2026-02-17', '2026-02-19'].map(async d => d.slice(5) + ':' + await H.cellText(w, 'bane', d)))
  say('   cells after re-typing:', grid2.join(' '))
  let r = await memberBell('2', 're-typed to OL (drag window and one-day window)')
  rec('2 re-typed LL->OL (drag window + one-day window): no "LL bid deleted" line', size,
    opened && placed2a && placed2b && !r.after.some(l => /LL bid deleted/.test(l.text)) && !r.fresh.some(l => /delet/i.test(l.text)) ? 'PASS' : (opened && placed2a && placed2b ? 'FAIL' : 'NOT WALKED'),
    `drag ${opened}, placed ${placed2a}/${placed2b}, cells ${grid2.join(' ')}; Ranger's new lines: ${r.fresh.map(l => l.text).join(' | ') || 'none'}`, ['2a-drag-window', '2a-after', '2b-after', '2-bell'])

  /* ---- 3: another kind placed approved over his bid ---- */
  await L.switchTo(w, 'member')
  await H.bid(w, '2026-02-23')
  before = await H.bell(w); await L.closeBell(w)
  await L.switchTo(w, 'admin')
  await L.openCell(w, 'bane', '2026-02-23')
  await L.approveWhatIEnter(w, true)
  await shot(w, '3-admin-window-tick-on')
  const placed3 = await placeVia('bid', 'OL')
  await shot(w, '3-after-place')
  await L.openCell(w, 'bane', '2026-02-23')
  const placedLine3 = await txt(P, T('bid-placed'))
  await shot(w, '3-admin-window-placed-line')
  await L.closeWin(w)
  r = await memberBell('3', 'OL placed approved over his LL bid')
  await L.closeBell(w)
  await L.openCell(w, 'bane', '2026-02-23')
  const memberPlaced3 = await txt(P, T('bid-placed'))
  await shot(w, '3-member-window-placed-line')
  await L.closeWin(w)
  say('   Placed line (admin view):', placedLine3, ' (member view):', memberPlaced3)
  rec('3 OL placed approved over his LL bid -> "OL added and approved · Saber"', size, placed3 && r.fresh.some(l => /Your leave.*23 Feb.*OL added and approved.*Saber/.test(l.text)) ? 'PASS' : 'FAIL', `placed ${placed3}; Ranger's new: ${r.fresh.map(l => l.text).join(' | ') || 'none'}; gone: ${r.gone.map(g => g.text).join(' | ') || 'none'}`, ['3-bell'])
  rec('3b the Placed line over a replaced bid (reading R16: the bid\'s placer is kept)', size, /^Placed Ranger/.test(placedLine3 || '') ? 'PASS' : 'FAIL', `admin sees "${placedLine3}"; Ranger sees "${memberPlaced3}"`, ['3-admin-window-placed-line', '3-member-window-placed-line'])

  /* ---- 4: a remark from the drag window ---- */
  await L.switchTo(w, 'member')
  const o4 = await H.drag(w, '2026-03-02', '2026-03-03')
  say('   member drag window (2 days):', o4)
  const placed4 = await placeVia('sel', 'LL')
  before = await H.bell(w); await L.closeBell(w)
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  await H.pressLoc(w, H.lineBtn(w, 'Tue 3 Mar', 'appr-approve')); await wait(500)
  await shot(w, '4-approved-in-approvals')
  await L.switchTo(w, 'member')
  before = await H.bell(w); await L.closeBell(w)
  say('   Ranger bell after the approval:', before.slice(0, 1).map(l => l.text).join(''))
  await L.switchTo(w, 'admin')
  const o4b = await H.drag(w, '2026-03-02', '2026-03-03')
  say('   admin drag window over the approved leave ids:', JSON.stringify(await ids()))
  await shot(w, '4-admin-drag-window')
  const rmk = P.locator(T('sel-remarks')).first()
  await rmk.click(); await P.keyboard.type('doctor appointment'); await wait(300)
  await shot(w, '4-remark-typed')
  /* the window's action that keeps the words: Approve if it is offered, else the window's own action */
  let kept = null
  for (const id of ['sel-approve', 'sel-LL']) { if (await vis(P, T(id))) { kept = id; break } }
  say('   action pressed to keep the words:', kept)
  if (kept) { await press(w, T(kept)); await wait(600); if (await vis(P, T('select-sheet'))) { await press(w, T(kept)); await wait(600) } }
  await shot(w, '4-after-press')
  say('   window still up?', await vis(P, T('select-sheet')))
  /* what the remark did: close the drag window, then open one of the days */
  if (await vis(P, T('select-sheet'))) { await press(w, T('sel-cancel')); await wait(400) }
  await L.openCell(w, 'bane', '2026-03-03')
  const rmkNow = await P.locator(T('bid-remarks')).first().inputValue().catch(() => null)
  say('   remark now on 3 Mar:', rmkNow)
  await shot(w, '4-remark-on-day')
  await L.closeWin(w)
  r = await memberBell('4', 'remark typed in the drag window')
  const remarkLines = r.fresh.filter(l => /Remark/i.test(l.text))
  rec('4 remark from the drag window -> ONE "Remark changed" line', size, remarkLines.length === 1 ? 'PASS' : (kept ? 'FAIL' : 'NOT WALKED'), `action ${kept}; remark on the day "${rmkNow}"; Ranger's new lines: ${r.fresh.map(l => l.text).join(' | ') || 'none'}`, ['4-admin-drag-window', '4-after-press', '4-bell'])
} catch (e) {
  rec('ERROR', size, 'FAIL', String(e).slice(0, 400))
  await shot(w, 'error').catch(() => {})
}
if (w.errs.length) rec('console', size, 'FAIL', w.errs.join(' || ').slice(0, 800))
L.writeResults('s234')
await w.ctx.close()
await L.closeBrowser()
console.log('DONE')
