// Walker B, step 7: the slim bar against the foot. (a) a bid that raises the manning bubble with the slim bar up; (b) the bid window's
// buttons press; (c) the grid behind the bar answers. Chromium 402x874.
// Prime: as admin (Approve what I enter on), place LL for the SXO men on Wed 14 Jan one by one until the manning bubble appears,
// Undo that last bid; then Ranger's request -> Approvals -> dates -> slim bar up on the grid; place the same bid again there.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-walk-b7 v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
const box = sel => P.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.height > 0 ? { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) } : null }, sel)
const inter = (a, b) => a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b
const atCentre = (sel) => P.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (e === h || e.contains(h)) }, sel)
try {
  await B.signIn(w, 'member')
  await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL')
  await B.switchTo(w, 'admin')
  const DAY = '2026-01-15'
  /* the exploration (lw-m4-walk-b7x.mjs) found: IWSO 3 -> 2 turns on the fifth IW-group bid of a day: Reaper, Basher, Echo, Ledger, then Quill */
  const prime = ['dice', 'glass', 'freak', 'drill']
  const hit = 'nasty'
  let bubEarly = false
  for (const id of prime) {
    await L.openCell(w, id, DAY)
    await L.placeLeave(w, 'LL'); await B.sleep(w, 500)
    if (await B.vis(P, T('manning-bubble'))) bubEarly = true
  }
  rec('S7 prime: four bids placed, no bubble yet', 'phone', !bubEarly ? 'PASS' : 'FAIL', `bubble seen early: ${bubEarly}`, [])
  /* the slim bar up: Approvals -> Ranger's dates */
  await B.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  const idx = await P.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]; const i = ls.findIndex(e => /13 Jan/.test(e.innerText)); if (i >= 0) ls[i].setAttribute('data-walk', 'j13'); return i })
  if (idx < 0) throw new Error('no 13 Jan line')
  await B.press(w, '[data-walk="j13"] [data-testid="appr-dates"]', null)
  await B.sleep(w, 1200)
  await shot(w, 's7-slim-up')
  const slim = await box(T('appr-slim'))
  rec('S7 slim bar is up on the grid', 'phone', slim ? 'PASS' : 'FAIL', JSON.stringify(slim) + ' ' + await B.txt(P, T('appr-slim')), ['s7-slim-up.png'])
  /* (a) the bid under the slim bar */
  await L.openCell(w, hit, DAY, 's7a-opencell-q')
  await shot(w, 's7a-window-with-slim')
  const win = await box(T('bid-picker')); const slim2 = await box(T('appr-slim'))
  console.log('window', JSON.stringify(win), 'slim now', JSON.stringify(slim2))
  const bubBefore = await B.vis(P, T('manning-bubble'))
  const placed = await L.placeLeave(w, 'LL'); await B.sleep(w, 700)
  await shot(w, 's7a-bubble-with-slim')
  const bub = await box(T('manning-bubble')); const slim3 = await box(T('appr-slim'))
  const bubTxt = await B.txt(P, T('manning-bubble'))
  const bubOn = bub ? await atCentre(T('manning-bubble')) : null
  const slimOn = slim3 ? await atCentre(T('appr-slim')) : null
  console.log('bubble', JSON.stringify(bub), bubTxt, 'slim', JSON.stringify(slim3), 'bubOn', bubOn, 'slimOn', slimOn)
  rec('S7a bubble and slim bar at the foot: nothing overlaps, both readable', 'phone', placed && bub && slim3 && !inter(bub, slim3) && bubOn && slimOn ? 'PASS' : 'FAIL', `bid placed ${placed}; bubble ${JSON.stringify(bub)} "${bubTxt}"; slim ${JSON.stringify(slim3)}; each on top at its centre: ${bubOn}/${slimOn}; overlap ${inter(bub, slim3)}`, ['s7a-bubble-with-slim.png'])
  /* (b) the window's buttons, with the slim bar up */
  await L.openCell(w, 'bane', '2026-01-13', 's7b-open-q')
  await B.sleep(w, 400); await shot(w, 's7b-window')
  const wb = await box(T('bid-picker')); const sl = await box(T('appr-slim'))
  const btns = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] button')].filter(b => b.getBoundingClientRect().height > 0).map(b => { const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: (b.innerText || b.getAttribute('aria-label') || b.dataset.testid || '').replace(/\s+/g, ' ').slice(0, 18), id: b.dataset.testid || '', top: Math.round(r.top), bottom: Math.round(r.bottom), ok: b === h || b.contains(h) } }))
  const bad = btns.filter(b => !b.ok)
  console.log('window', JSON.stringify(wb), 'slim', JSON.stringify(sl), 'buttons', btns.length, 'covered', JSON.stringify(bad))
  rec('S7b bid window up with the slim bar: every button is on top at its middle', 'phone', btns.length > 8 && bad.length === 0 ? 'PASS' : 'FAIL', `${btns.length} buttons; covered: ${JSON.stringify(bad)}; window ${JSON.stringify(wb)}; slim bar ${JSON.stringify(sl)}; overlap ${inter(wb, sl)}`, ['s7b-window.png'])
  /* press one: AM then Whole day, then the Remarks box */
  const before = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] button')].filter(b => /^AM$/.test(b.innerText.trim())).map(b => b.className + '|' + b.getAttribute('aria-pressed')))
  await B.press(w, '[data-testid="bid-picker"] button:has-text("AM")', 's7b-am-q'); await B.sleep(w, 400); await shot(w, 's7b-am')
  const after = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] button')].filter(b => /^AM$/.test(b.innerText.trim())).map(b => b.className + '|' + b.getAttribute('aria-pressed')))
  rec('S7b2 a window button presses (AM)', 'phone', JSON.stringify(before) !== JSON.stringify(after) ? 'PASS' : 'FAIL', `AM before ${JSON.stringify(before)} after ${JSON.stringify(after)}`, ['s7b-am-q.png', 's7b-am.png'])
  /* the window's own foot buttons: Delete is the lowest button; press its first tap only (arms "Delete — sure?") */
  const slimAfterWin = await B.vis(P, T('appr-slim'))
  console.log('slim visible with window open:', slimAfterWin)
  await L.closeWin(w); await B.sleep(w, 500)
  await shot(w, 's7b-closed')
  const slimBack = await box(T('appr-slim'))
  rec('S7b3 the slim bar is back once the window closes', 'phone', slimBack ? 'PASS' : 'FAIL', `slim bar ${JSON.stringify(slimBack)}; it was visible while the window was up: ${slimAfterWin}`, ['s7b-closed.png'])
  /* (c) the grid behind the bar answers: a cell above the bar, and a cell just above its top edge */
  const slimTop = slimBack ? slimBack.t : 808
  const cellsAbove = await P.evaluate(top => [...document.querySelectorAll('td[data-testid^="cell-"]')].map(td => { const r = td.getBoundingClientRect(); return { id: td.dataset.testid, l: r.left, t: r.top, b: r.bottom, w: r.width } }).filter(c => c.l > 120 && c.l + c.w < 380 && c.t > 340 && c.b < top - 2).sort((a, b) => b.b - a.b)[0], slimTop)
  console.log('cell just above the bar', JSON.stringify(cellsAbove))
  if (!cellsAbove) rec('S7c grid behind the bar answers', 'phone', 'NOT WALKED', 'no cell found above the bar', [])
  else {
    await B.tapAt(w, cellsAbove.l + cellsAbove.w / 2, (cellsAbove.t + cellsAbove.b) / 2, 's7c-tap-q'); await B.sleep(w, 600); await shot(w, 's7c-tap')
    const open = await B.vis(P, T('bid-picker')); const title = await B.txt(P, T('bid-picker'))
    rec('S7c a cell just above the slim bar answers (the bid window opens)', 'phone', open ? 'PASS' : 'FAIL', `cell ${cellsAbove.id} (bottom ${Math.round(cellsAbove.b)} vs bar top ${slimTop}); window open ${open}: "${(title || '').slice(0, 70)}"`, ['s7c-tap-q.png', 's7c-tap.png'])
    await L.closeWin(w); await B.sleep(w, 400)
    /* scroll the grid with a finger, bar up: the page moves, the bar stays */
    const sy0 = await B.scrollY(P)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 250, y: 600 }] })
    for (let i = 1; i <= 6; i++) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 250, y: 600 - i * 40 }] }); await P.waitForTimeout(8) }
    await P.waitForTimeout(90); await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await B.sleep(w, 900)
    const sy1 = await B.scrollY(P); const slimStay = await box(T('appr-slim'))
    await shot(w, 's7c-scrolled')
    rec('S7c2 a finger scroll behind the bar moves the page and the bar stays', 'phone', sy1 > sy0 && slimStay && slimStay.t === slimTop ? 'PASS' : 'FAIL', `scrollY ${sy0} -> ${sy1}; slim bar top ${slimTop} -> ${slimStay && slimStay.t}`, ['s7c-scrolled.png'])
  }
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 's7-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('s7')
await B.closeAll()
console.log('DONE')
