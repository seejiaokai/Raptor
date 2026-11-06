// The walk of his D1722 and D1725 (6 Nov 26): every combination of entries on a posted-out man's gone days — how it looks,
// what a tap opens, how that window looks, how to reach the change — set beside the SAME combination on an ordinary man
// (§7.11 lesson 23: the expected window is the one the same entry opens on any other day, never the build's).
// SIZE=desk|phone, LW_DIST=<build>, LW_OUT=<pictures>. Written as assertions, so a re-run is the re-walk.
process.env.LW_OUT ||= '2026-11-06-lw-faults/d1722'
process.env.WNAME = 'd1722'
const { L, row, T, openNow, fresh, finish } = await import('./lw-f1106-w0.mjs')
const SIZE = L.SIZE
console.log('[lw-d1722-walk v1]', SIZE, L.DIST)
const w = await fresh(SIZE)
const P = w.page
const step = async (id, fn) => { try { await fn() } catch (e) { console.log(e.stack); row(id, SIZE, 'step', 'stopped: ' + String(e).slice(0, 250), 'NOT WALKED') } }
const GONE = await L.pidOf(P, 'Diesel'), HERE = await L.pidOf(P, 'Vapor')
const d = i => L.day(i)                       // L.day(54) = Mon 28 Dec 26
const PO = d(47)                              // Mon 21 Dec: Diesel posted out from here
const C1 = [d(48), d(50)]                     // Tue 22 – Thu 24 Dec: an OD of three whole days
const C3 = [d(50), d(51)]                     // Thu 24 – Fri 25: Grant OIL — 24th: OD + FO (two entries), 25th: FO alone
const C2 = [d(54), d(55)]                     // Mon 28 – Tue 29: an Other, mornings only (half days)
const C4 = [d(56), d(57)]                     // Wed 30 – Thu 31: LL, approved
/* what is open now, read off the screen: which window, its title, its held lines, its range chips */
const win = () => P.evaluate(() => {
  const vis = t => { const e = document.querySelector(`[data-testid="${t}"]`); return e && e.getBoundingClientRect().height > 0 ? e : null }
  const which = ['bid-picker', 'daylist-sheet', 'postout-sheet', 'select-sheet', 'sel-sheet'].find(t => vis(t)) || 'none'
  const s = which === 'none' ? null : vis(which)
  const txt = sel => s ? [...s.querySelectorAll(sel)].map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean) : []
  return { which, title: txt('.bidsheet-hd .when')[0] || '', held: txt('[data-testid="bid-heldday"]'), scope: txt('[data-testid^="scope-"]'),
    lines: which === 'daylist-sheet' ? txt('.dl-row, [data-testid^="dl-"]').slice(0, 4) : [] }
})
const close = async () => { await L.closeWin(w); await L.settle(w) }
const say = x => `${x.which}${x.title ? ` "${x.title}"` : ''}${x.scope.length ? ` [${x.scope.join(' | ')}]` : ''}${x.held.length ? ` held: ${x.held.map(h => h.slice(0, 40)).join(' / ')}` : ''}`

async function setUp(pid) {
  /* C1 — OD over three whole days */
  await L.dragCells(w, [pid, C1[0]], [pid, C1[1]])
  /* OD stands in the window's own row (opening ⋯ first made the press only close the menu — the night's walker's "first
     press left the row empty") */
  await L.press(w, T('sel-file-OD')); await P.waitForTimeout(900)
  await close()
  /* C3 — Grant OIL, an FO on each of two days */
  await L.dragCells(w, [pid, C3[0]], [pid, C3[1]])
  await L.press(w, T('sel-oil')); await P.waitForTimeout(300)
  if (await P.locator(T('sel-oil-pick-fo')).count()) await L.press(w, T('sel-oil-pick-fo'))
  await L.press(w, T('sel-oil-give')); await P.waitForTimeout(900)
  await close()
  /* C2 — an Other, mornings only */
  await L.dragCells(w, [pid, C2[0]], [pid, C2[1]])
  await L.press(w, T('sel-portion-am')); await P.waitForTimeout(250)
  if (await P.locator(T('sel-more')).count()) { await L.press(w, T('sel-more')); await P.waitForTimeout(300) }
  await L.press(w, T('sel-file-OTH')); await P.waitForTimeout(900)
  await close()
  /* C4 — LL, approved */
  await L.dragCells(w, [pid, C4[0]], [pid, C4[1]])
  await L.autoApprove(w, true, 'sel')
  await L.press(w, T('sel-LL')); await P.waitForTimeout(900)
  await close()
  return Promise.all([C1[0], C1[1], d(49), C3[0], C3[1], C2[0], C2[1], C4[0], C4[1]].map(x => L.cellWords(w, pid, x)))
}

const looks = {}
await step('setup', async () => {
  await L.postOutOn(w, GONE, PO, 'overseas', PO)
  await L.toWar(w); await L.openGrid(w)
  for (const [who, pid] of [['Vapor', HERE], ['Diesel', GONE]]) {
    looks[who] = await setUp(pid)
    await L.rowShot(w, pid, d(46), d(57), `S-${SIZE}-${who}-row`)
  }
  row('S-look', SIZE, 'the same entries on Vapor (here) and Diesel (posted out from 21 Dec): OD 22–24, FO 24–25, Other AM 28–29, LL 30–31',
    `Vapor ${JSON.stringify(looks.Vapor)}; Diesel ${JSON.stringify(looks.Diesel)}`,
    JSON.stringify(looks.Vapor) === JSON.stringify(looks.Diesel) ? 'PASS' : 'RECORD', [`S-${SIZE}-Vapor-row`, `S-${SIZE}-Diesel-row`])
})

/* each combination: tap it on Vapor, then on Diesel — the same window is expected (D1722), but for leave (owner answer C:
   the day's list on a gone day) and an OIL award alone (a credit — D261), which are recorded, not judged here */
const CASES = [
  ['C1-mid', 'an OD of three days, its middle day', d(49), 'same'],
  ['C1-end', 'an OD of three days, its first day', C1[0], 'same'],
  ['C3-two', 'an OD and an FO award on one day', C3[0], 'same'],
  ['C2-half', 'an Other, a morning', C2[0], 'same'],
  ['C3-fo', 'an FO award alone', C3[1], 'record'],
  ['C4-leave', 'LL of two days', C4[0], 'record'],
]
for (const [id, what, day, expect] of CASES) await step(id, async () => {
  const got = {}
  for (const [who, pid] of [['Vapor', HERE], ['Diesel', GONE]]) {
    await L.openCell(w, pid, day)
    got[who] = await win()
    await L.shot(w, `${id}-${SIZE}-${who}`)
    await close()
  }
  const same = got.Vapor.which === got.Diesel.which && got.Vapor.title === got.Diesel.title && got.Vapor.scope.join() === got.Diesel.scope.join()
  row(id, SIZE, `tap ${what} (${day}) on Vapor, then on Diesel`, `Vapor: ${say(got.Vapor)} · Diesel: ${say(got.Diesel)}`,
    expect === 'same' ? (same ? 'PASS' : 'FAIL') : (same ? 'RECORD (same)' : 'RECORD (differs)'), [`${id}-${SIZE}-Vapor`, `${id}-${SIZE}-Diesel`])
})

await step('E-edit', async () => {
  /* how to reach the change: the window says "change it on the Inputs page" — the Inputs page, December, Diesel's OD
     opened there, its own window; then closed */
  await L.goPage(w, 'inputs', 'Inputs')
  for (let i = 0; i < 6; i++) {
    const lab = await P.locator('#inpCal .ic-mon').first().getAttribute('aria-label').catch(() => null)
    if (lab && /December 2026/.test(lab)) break
    await L.press(w, '#icNext'); await P.waitForTimeout(300)
  }
  await L.shot(w, `E-${SIZE}-1-inputs-december`)
  const bar = P.getByText('Diesel · OD', { exact: true }).first()
  let opened = 'no Diesel bar found'
  if (await bar.count()) {
    await bar.click(); await P.waitForTimeout(700)
    opened = await P.evaluate(() => { const e = document.querySelector('[role="dialog"], .modal, .sheet'); return e ? e.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) : 'nothing opened' })
    await L.shot(w, `E-${SIZE}-2-opened`)
    await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(400)
  }
  row('E-edit', SIZE, 'the Inputs page, December: tap Diesel\'s entry there', opened, /Diesel|OD|Overseas/i.test(opened) ? 'PASS' : 'RECORD', [`E-${SIZE}-1-inputs-december`, `E-${SIZE}-2-opened`])
})
console.log('errs', JSON.stringify(w.errs))
row('errs', SIZE, 'console errors during the walk', `${w.errs.length}: ${JSON.stringify(w.errs.slice(0, 4))}`, w.errs.length ? 'RECORD' : 'PASS', [])
finish('d1722-' + SIZE)
await L.closeBrowser()
