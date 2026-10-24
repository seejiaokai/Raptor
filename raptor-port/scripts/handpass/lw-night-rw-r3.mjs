// RE-WALK R3: as the member (Ranger) — his pending bid on an open day (30 Nov) and his refused bid on a day since closed (1 Dec); drag both, type words, ✕ → the open day's pending bid has the words.
// Fixture, once, as admin on a desktop context: open November and December; Ranger bids LL on 30 Nov and 1 Dec; admin refuses the 1 Dec bid; admin closes December (November stays open).
// usage (from raptor-port/): node scripts/handpass/lw-night-rw-r3.mjs <desk|phone|webkit>
const R = await import('./lw-night-rw-lib.mjs')
const { H1, H2: H, L, T, rec, judge, sleep } = R
const which = process.argv[2] || 'desk'
const size = which === 'desk' ? 'desk' : 'phone', engine = which === 'webkit' ? 'webkit' : 'chromium'
const phone = size === 'phone'
const label = which === 'desk' ? 'desktop/Chromium' : which === 'webkit' ? 'phone/WebKit' : 'phone/Chromium'
const tag = `r3-${which === 'desk' ? 'dk' : which === 'webkit' ? 'phw' : 'ph'}`
console.log('lw-night-rw-r3 v1', which, tag)
const ME = 'bane'
const NOV30 = '2026-11-30', DEC1 = '2026-12-01'
const toggleMonth = async (fx, m, want) => {
  const P = fx.page
  await L.press(fx, T('open-chip')); await P.waitForSelector(T('open-dates'))
  const on = (await P.locator(T(`od-month-${m}`)).getAttribute('aria-pressed')) === 'true'
  if (on !== want) { await L.press(fx, T(`od-month-${m}`)); await sleep(fx, 500) }
  const now = (await P.locator(T(`od-month-${m}`)).getAttribute('aria-pressed')) === 'true'
  await L.press(fx, T('open-dates-close')); await sleep(fx, 300)
  return now
}
// ---------------- fixture
const fx = await L.newCtx('desk')
await H.signInAs(fx, 'admin')
const ids = await H.people(fx.page)
if (ids.Ranger !== ME) throw new Error('Ranger is not bane')
{
  const P = fx.page
  console.log('Nov open', await toggleMonth(fx, '2026-11', true), 'Dec open', await toggleMonth(fx, '2026-12', true))
  await H.signOut(P); await H.signInAs(fx, 'member')
  await H.place(fx, ME, NOV30, 'LL', {}); await H.place(fx, ME, DEC1, 'LL', {})
  await H.signOut(P); await H.signInAs(fx, 'admin')
  if (!(await H1.dragCells(fx, [ME, DEC1], [ME, '2026-12-02']))) throw new Error('no drag window to refuse 1 Dec')
  await L.press(fx, T('sel-refuse')); await sleep(fx, 700)
  if (await L.vis(P, T('select-sheet'))) await L.press(fx, T('sel-cancel'))
  console.log('Dec open after closing:', await toggleMonth(fx, '2026-12', false), 'chip:', await L.txt(P, T('open-chip')))
  const a = (await H.warRecs(P, ME, NOV30)).filter(r => r.kind === 'request').map(r => `${r.code}/${r.state}/"${r.remarks ?? ''}"`)
  const b = (await H.warRecs(P, ME, DEC1)).filter(r => r.kind === 'request').map(r => `${r.code}/${r.state}/"${r.remarks ?? ''}"`)
  console.log('fixture 30 Nov', a.join(' + '), '| 1 Dec', b.join(' + '))
  if (!/LL\/pending/.test(a.join()) || !/LL\/refused/.test(b.join())) throw new Error('fixture: ' + a + ' | ' + b)
}
const STATE = await fx.ctx.storageState()
await fx.ctx.close()
// ---------------- the walk, as Ranger
const w = await H.ctxFrom(size, engine, STATE)
const P = w.page
await H.signInAs(w, 'member')
const snap = async n => { await L.shot(w, `${tag}-${n}`); return `${tag}-${n}.png` }
const bids = async iso => (await H.warRecs(P, ME, iso)).filter(r => r.kind === 'request').map(r => ({ code: r.code, state: r.state, remarks: r.remarks ?? '' }))
const fmt = a => a.length ? a.map(r => `${r.code}/${r.state}/"${r.remarks}"`).join(' + ') : '-'
try {
  const b0 = [await bids(NOV30), await bids(DEC1)]
  const opened = await H1.dragCells(w, [ME, NOV30], [ME, DEC1])
  if (!opened) {
    const sheet = await H.sheetOf(P)
    const pic = await snap('1-no-window')
    rec('R3 a member’s drag over an open pending bid and a refused bid on a closed day', label, 'RECORD', `the grid gave no drag window (the screen then showed "${sheet}"); before: 30 Nov ${fmt(b0[0])}; 1 Dec ${fmt(b0[1])}`, [pic])
  } else {
    const head = await L.txt(P, T('sel-span')), who = await L.txt(P, T('sel-who')), note = await L.txt(P, T('sel-note'))
    await H.typeInto(w, T('sel-remarks'), 'Back Monday')
    const box = await P.locator(T('sel-remarks')).inputValue()
    const pT = await snap('2-typed')
    let pics
    if (phone) { await L.step(w, `${tag}-3-x`, T('sel-cancel')); pics = [`${tag}-3-x-q.png`, `${tag}-3-x.png`] } else { await L.press(w, T('sel-cancel')); await sleep(w, 500); pics = [await snap('3-x')] }
    const open = await L.vis(P, T('select-sheet'))
    const b1 = [await bids(NOV30), await bids(DEC1)]
    // the open day's own window reads the words
    await L.openCellR(w, ME, NOV30); const sh = await H.sheetOf(P)
    const boxNow = sh === 'bid-picker' ? await P.locator(T('bid-remarks')).inputValue().catch(() => null) : sh === 'remarks-sheet' ? await P.locator(T('remarks-remarks')).inputValue().catch(() => null) : null
    const pW = await snap('4-nov30-window')
    await H.closeSheet(w)
    judge('R3 a member’s drag over his open pending bid and his refused bid on a closed day, words typed, ✕', label, [
      ['the drag window opened over both days', opened, `"${head}" ${who}`],
      ['the drag window closed on ✕', !open, `open=${open}`],
      ['the open day’s (30 Nov) pending bid has the words', b1[0].some(r => r.state === 'pending' && r.remarks === 'Back Monday'), fmt(b1[0])],
      ['the refused bid on the closed day (1 Dec) is left as it was', fmt(b1[1]) === fmt(b0[1]), `${fmt(b0[1])} → ${fmt(b1[1])}`],
      ['30 Nov’s window reads the words', boxNow === 'Back Monday', `${sh}: "${boxNow}"`],
    ], `before: 30 Nov ${fmt(b0[0])}; 1 Dec ${fmt(b0[1])}; Ranger dragged 30 Nov → 1 Dec ("${head}", ${who}${note ? ', note "' + note + '"' : ''}), typed "${box}", ✕. After: 30 Nov ${fmt(b1[0])}; 1 Dec ${fmt(b1[1])}; 30 Nov's one-day window then reads "${boxNow}"`, [pT, ...pics, pW])
  }
} catch (e) { rec('R3', label, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 600), []); await snap('error').catch(() => {}) }
rec('errors-r3', label, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
await w.ctx.close()
await L.closeBrowser()
R.saveResults(`r3-${which}`)
