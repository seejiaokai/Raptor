// Walker B, steps 8, 9, 10: the bell tap with the OIL tab up; Pick dates... on a phone; the day's list with two entries. Chromium 402x874.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-walk-b8 v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
const box = sel => P.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.height > 0 ? { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) } : null }, sel)
try {
  /* fixtures: Ranger bids LL Tue 13 Jan (approved below), and LL AM on Wed 21 Jan (the day's list case) */
  await B.signIn(w, 'member')
  await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL'); await B.sleep(w, 250)
  await L.openCell(w, 'bane', '2026-01-21')
  await B.press(w, '[data-testid="bid-picker"] button:has-text("AM")'); await B.sleep(w, 300)
  const am = await L.placeLeave(w, 'LL'); await B.sleep(w, 300)
  rec('F fixture: Ranger LL AM on 21 Jan placed', 'phone', am ? 'PASS' : 'FAIL', `window closed after placing: ${am}`, [])
  /* admin: approve the 13 Jan request; place OL PM for Ranger on 21 Jan from the grid (Approve what I enter ON) */
  await B.switchTo(w, 'admin')
  await B.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  const mk = await P.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]; const i = ls.findIndex(e => /13 Jan/.test(e.innerText)); if (i >= 0) ls[i].setAttribute('data-walk', 'j13'); return i })
  await B.press(w, '[data-walk="j13"] [data-testid="appr-approve"]'); await B.sleep(w, 500)
  /* ---- STEP 9 first, while the page is the admin's Approvals (Pick dates...) ---- */
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  await B.step(w, 's9-pick-open', T('appr-pick'))
  const pickBox = await box(T('appr-range-picker'))
  rec('S9a Pick dates... opens the calendar', 'phone', pickBox ? 'PASS' : 'FAIL', `calendar box ${JSON.stringify(pickBox)}`, ['s9-pick-open.png', 's9-pick-open-q.png'])
  const dayBtn = T('appr-range-day-2026-01-13')
  await B.press(w, dayBtn, 's9-pick-day-q'); await B.sleep(w, 500); await shot(w, 's9-pick-day')
  const stillOpen = await B.vis(P, T('appr-range-picker'))
  const sel = await B.txt(P, T('appr-range-selection'))
  /* tap outside: the page heading, away from the popup and its button */
  const hd = await P.evaluate(() => { const e = document.querySelector('[data-testid="approvals-page"] h2, [data-testid="approvals-page"] .appr-h'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + 20, y: r.top + r.height / 2 } })
  console.log('heading point', JSON.stringify(hd), 'selection', sel, 'open', stillOpen)
  const outside = hd || { x: 30, y: 200 }
  await B.tapAt(w, outside.x, outside.y, 's9-outside-q'); await B.sleep(w, 500); await shot(w, 's9-outside')
  const closed1 = !(await B.vis(P, T('appr-range-picker')))
  rec('S9b one day picked, a tap outside closes the calendar', 'phone', stillOpen && closed1 ? 'PASS' : 'FAIL', `selection "${sel}"; open after the day tap: ${stillOpen}; closed after the outside tap: ${closed1}`, ['s9-pick-day.png', 's9-outside-q.png', 's9-outside.png'])
  /* open again, Escape */
  await B.press(w, T('appr-pick')); await B.sleep(w, 500)
  const open2 = await B.vis(P, T('appr-range-picker'))
  await P.keyboard.press('Escape'); await B.sleep(w, 400)
  await shot(w, 's9-escape')
  const closed2 = !(await B.vis(P, T('appr-range-picker')))
  rec('S9c Escape closes the calendar (hardware keyboard)', 'phone', open2 && closed2 ? 'PASS' : 'FAIL', `open ${open2}; closed after Escape ${closed2}`, ['s9-escape.png'])
  /* ---- STEP 10: the day's list ---- */
  await B.openGrid(w)
  await L.openCell(w, 'bane', '2026-01-21', 's10-open-cell-q')
  await B.sleep(w, 500); await shot(w, 's10-window-for-free-half')
  const hasWin = await B.vis(P, T('bid-picker'))
  const pmLit = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] button')].filter(b => /^(AM|PM)$/.test(b.innerText.trim())).map(b => b.innerText.trim() + ':' + (b.className.includes('on') ? 'on' : 'off')))
  console.log('window for the free half:', hasWin, JSON.stringify(pmLit))
  await B.press(w, '[data-testid="bid-picker"] button:has-text("PM")'); await B.sleep(w, 300)
  const pm2 = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] button')].filter(b => /^(AM|PM)$/.test(b.innerText.trim())).map(b => b.innerText.trim() + ':' + (b.className.includes('on') ? 'on' : 'off')))
  console.log('after pressing PM:', JSON.stringify(pm2))
  const placedOL = await L.placeLeave(w, 'OL'); await B.sleep(w, 400)
  rec('F fixture: Saber placed OL on Ranger\'s free half of 21 Jan', 'phone', placedOL ? 'PASS' : 'FAIL', `window ${hasWin}; AM/PM ${JSON.stringify(pmLit)}; closed after: ${placedOL}`, ['s10-window-for-free-half.png'])
  await L.openCell(w, 'bane', '2026-01-21', 's10-daylist-q')
  await B.sleep(w, 500); await shot(w, 's10-daylist')
  const dl = await box(T('daylist-sheet'))
  if (!dl) rec('S10 the day\'s list opens for a day with two entries', 'phone', await B.vis(P, T('bid-picker')) ? 'FAIL' : 'NOT WALKED', 'no daylist-sheet; the bid window is open: ' + await B.vis(P, T('bid-picker')), ['s10-daylist.png'])
  else {
    const placedLines = await P.evaluate(() => [...document.querySelectorAll('[data-testid="daylist-sheet"] [data-testid^="dl-placed-"]')].map(e => { const r = e.getBoundingClientRect(); const sh = document.querySelector('[data-testid="daylist-sheet"]').getBoundingClientRect(); return { id: e.dataset.testid, text: e.innerText.replace(/\s+/g, ' ').trim(), l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), inside: r.left >= sh.left - 0.5 && r.right <= sh.right + 0.5 && r.top >= sh.top - 0.5 && r.bottom <= sh.bottom + 0.5, clipped: e.scrollWidth > e.clientWidth + 1 } }))
    console.log('day list', JSON.stringify(dl), JSON.stringify(placedLines))
    const good = placedLines.length === 2 && placedLines.every(p => p.inside && !p.clipped && /Placed/.test(p.text))
    rec('S10 each entry\'s Placed line is readable, inside the window', 'phone', good ? 'PASS' : 'FAIL', JSON.stringify(placedLines), ['s10-daylist-q.png', 's10-daylist.png'])
  }
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 's8-error').catch(() => {}) }
/* ---- STEP 8: the member, the OIL tab, the bell ---- */
try {
  await L.closeWin(w); await P.keyboard.press('Escape'); await B.sleep(w, 300)
  await B.switchTo(w, 'member')
  await B.press(w, T('oil-tracker')); await B.sleep(w, 800)
  await shot(w, 's8-oil-up')
  const oilUp = await B.vis(P, '[data-testid="oil-sheet"], .oil-tracker, [data-testid^="oil-"]:not([data-testid="oil-tracker"])')
  const gridHidden = !(await B.vis(P, T('cell-bane-2026-01-13')))
  console.log('oil up, grid cell visible:', !gridHidden)
  await L.openBell(w)
  const bl = await B.bellLines(P)
  console.log('bell', bl.map(b => b.text).join(' | '))
  await shot(w, 's8-bell-open')
  const target = bl.find(b => /13 Jan/.test(b.text) && /approved/.test(b.text))
  if (!target) rec('S8 bell tap with the OIL tab up', 'phone', 'NOT WALKED', 'no approved 13 Jan line: ' + bl.map(b => b.text).join(' | '), ['s8-bell-open.png'])
  else {
    await B.press(w, `[data-testid="bell-line-${target.id}"]`, 's8-bell-tap-q'); await B.sleep(w, 900); await shot(w, 's8-bell-tapped')
    const gridNow = await B.vis(P, T('cell-bane-2026-01-13'))
    const ring = await P.evaluate(() => { const t = document.querySelector('td.lw-ring'); return t ? t.dataset.testid : null })
    const oilNow = await B.vis(P, '[data-testid="oil-sheet"]')
    const bellOpen = await B.vis(P, T('bell-list'))
    rec('S8 bell tap with the OIL tab up: the grid in front at that day, ringed', 'phone', gridNow && ring === 'cell-bane-2026-01-13' ? 'PASS' : 'FAIL', `grid cell visible ${gridNow}; ring on ${ring}; OIL sheet visible ${oilNow}; bell list still open ${bellOpen}; the OIL tab was up before: ${!gridHidden}`, ['s8-oil-up.png', 's8-bell-open.png', 's8-bell-tap-q.png', 's8-bell-tapped.png'])
  }
} catch (e) { rec('ERROR s8', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 's8-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('s8')
await B.closeAll()
console.log('DONE')
