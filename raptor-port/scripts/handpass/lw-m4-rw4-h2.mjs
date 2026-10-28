// Re-walk 4, H2: a month's chip comes with its first request and goes with its last (D1444 B), phone 402, by finger. Chromium.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk4'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-rw4-h2 v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
const DAY = '2026-03-10'
const chips = () => P.evaluate(() => ({ months: [...document.querySelectorAll('[data-testid^="appr-m-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.trim() + (/on|lit|sel|active/.test(String(e.className)) ? '*' : '') + '[' + String(e.className).replace(/appr-f\s*/, '') + ']'), rows: [...document.querySelectorAll('[data-testid^="appr-line-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70)), sub: document.querySelector('[data-testid="appr-sub"]')?.innerText.trim(), tab: document.querySelector('[data-testid="lw-approvals-count"]')?.innerText.trim() }))
const top = async name => { const g = await P.evaluate(() => { const r = document.querySelector('[data-testid="approvals-page"] .appr-card').getBoundingClientRect(); const c = document.querySelector('[data-testid="approvals-page"] .appr-cols').getBoundingClientRect(); return { y: Math.max(0, r.top - 10), h: c.top - r.top + 160 } }); await shot(w, name, { clip: { x: 0, y: g.y, width: 402, height: g.h } }) }
const clearBid = async () => { await L.openCell(w, 'bane', DAY); await B.press(w, T('bid-clear')); await B.sleep(w, 500); if (await B.vis(P, T('bid-picker'))) { await B.press(w, T('bid-clear')); await B.sleep(w, 600) } }
try {
  await B.signIn(w, 'admin')
  await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  const c0 = await chips(); console.log('start', JSON.stringify(c0)); await top('h2-0-start')
  await B.switchTo(w, 'member')
  await L.openCell(w, 'bane', DAY); const placed = await L.placeLeave(w, 'LL'); console.log('placed Mar bid:', placed); await B.sleep(w, 400)
  await B.switchTo(w, 'admin')
  await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 400)
  const c1 = await chips(); console.log('after bid', JSON.stringify(c1)); await top('h2-1-chip-appears')
  const hasMar = c1.months.some(m => /^Mar/.test(m)) && c1.months.length === c0.months.length + 1
  // in place: Jan Feb Mar in month order
  rec('H2 a bid in a month with none: its chip appears in place', 'phone', hasMar && c1.months.map(m => m.slice(0, 3)).join() === 'Jan,Feb,Mar' ? 'PASS' : 'FAIL', `before ${JSON.stringify(c0.months)} after ${JSON.stringify(c1.months)}; tab ${c1.tab}`, ['h2-0-start.png', 'h2-1-chip-appears.png'])
  await B.press(w, T('appr-m-2026-03'), 'h2-2-pick-q'); await B.sleep(w, 500); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 200)
  const c2 = await chips(); console.log('picked Mar', JSON.stringify(c2)); await top('h2-2-picked')
  rec('H2 tap the Mar chip: the list shows that month only', 'phone', c2.rows.length === 1 && /Mar/.test(c2.rows[0]) ? 'PASS' : 'FAIL', `lines ${JSON.stringify(c2.rows)}; chips ${JSON.stringify(c2.months)}`, ['h2-2-pick-q.png', 'h2-2-picked.png'])
  // delete the bid as the admin (grid) while Mar is still picked, then come back
  await B.openGrid(w); await clearBid(); await B.sleep(w, 300)
  await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 400)
  const c3 = await chips(); console.log('deleted while picked (admin, back on Approvals)', JSON.stringify(c3)); await top('h2-3-deleted-while-picked')
  // then an unpicked case: place again as member, check chip, delete as member without picking
  await B.switchTo(w, 'member')
  await L.openCell(w, 'bane', DAY); await L.placeLeave(w, 'LL'); await B.sleep(w, 400)
  await B.switchTo(w, 'admin')
  await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 400)
  const c4 = await chips(); console.log('re-placed', JSON.stringify(c4)); await top('h2-4-replaced')
  await B.switchTo(w, 'member'); await clearBid(); await B.sleep(w, 400)
  await B.switchTo(w, 'admin')
  await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 400)
  const c5 = await chips(); console.log('deleted unpicked', JSON.stringify(c5)); await top('h2-5-deleted-unpicked')
  rec('H2 deleted its last request, not picked: the chip goes', 'phone', !c5.months.some(m => /^Mar/.test(m)) && c5.months.length === c0.months.length ? 'PASS' : 'FAIL', `after ${JSON.stringify(c5.months)}; lines ${JSON.stringify(c5.rows)}`, ['h2-4-replaced.png', 'h2-5-deleted-unpicked.png'])
  console.log('picked-case result:', JSON.stringify({ monthsAfterDelete: c3.months, rows: c3.rows }))
} catch (e) { console.log('ERR', String(e).slice(0, 400)); rec('script error', 'phone', 'NOT WALKED', String(e).slice(0, 200)) }
if (w.errs.length) console.log('errs', w.errs)
B.writeResults('h2'); await w.ctx.close(); await B.closeAll()
