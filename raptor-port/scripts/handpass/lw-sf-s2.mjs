// The small fixes of 30 Oct 26 — fix 2, [LW-HALF-DAY-WORDS-LEFT]: what is PRINTED for an OIL the app credited and for a half
// day matches the grid's box (D1306 "FO*"/"HO*", D1160 / D1246 the half by its box). Scenarios S2-1, S2-4, S2-6, S2-9 of the
// scenario list, through the app's own controls: the demo Saturday (18 Jul) published from Edit Schedule, which credits
// plasma's weekend duty; the bid window. SIZE=desk (default) or phone (WebKit 402).
process.env.LW_OUT ||= '2026-10-30-lw-small-fixes/s2'
const L = await import('./lw-sf-lib.mjs')
const H = await import('./lib.mjs')
const { T } = L
const SIZE = process.env.SIZE || 'desk'
console.log('[lw-sf-s2 v2]', SIZE)
L.clearOut()
let w = null, P = null
async function world() { if (w) await w.ctx.close(); w = await L.newCtx(SIZE === 'phone' ? 'phone' : 'desk'); P = w.page; await L.signIn(w, 'admin') }
const boxes = async (who, iso) => ((await L.cellInfo(P, who, iso))?.boxes ?? []).map(b => `${b.text}:${(b.cls.match(/\b(top|bot|whole|left|right|right-am|right-pm)\b/) || [])[0]}:${(b.cls.match(/s-\w/) || [])[0]}`)
/* the clash note: the desktop line under the top rows, or the phone's slim line opened into its list */
async function clashTexts() {
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  if (w.phone) {
    const slim = P.locator('[data-testid="clash-line"]').first()
    /* one clash starts open (D827's drawing); several start closed — opened only when it is closed */
    if (await slim.count() && await slim.isVisible() && (await slim.getAttribute('aria-expanded')) !== 'true') { await L.press(w, '[data-testid="clash-line"]'); await P.waitForTimeout(400) }
  }
  return P.evaluate(() => [...document.querySelectorAll('.clash-what, [data-testid="sync-clashes"] .row')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()))
}
const publishSat = async () => { await H.board(P, 5); const r = await H.publish(P, 5); await H.closeBoard(P); await L.openWar(w); await L.openGrid(w); return r }
const PL = 'plasma', SAT = '2026-07-18'

/* ---- S2-4: the "OIL the app credited" sheet — the demo Saturday published, plasma's credit alone on 18 Jul ---- */
await world()
const pub = await publishSat()
await L.reachCell(w, PL, SAT)
const b18 = await boxes(PL, SAT)
await L.rowShot(w, PL, '2026-07-17', '2026-07-19', 's2-4-a-credit-box')
/* the admin's own tap opens the bid window on a day only the app's credit holds (openWorkOnly — so he may grant OIL there);
   the read-only "OIL the app credited" sheet is what everyone else's tap opens: the admin's member view (D292), changed in
   place through the localhost bridge so the world stays the one built (the order's §7.7) */
await P.evaluate(() => window.lwSetRole('member')); await P.waitForTimeout(500)
await L.openCell(w, PL, SAT, w.phone ? 's2-4-b-sheet-q' : null)
const title = await P.evaluate(() => document.querySelector('[data-testid="raptor-sheet"] .cur')?.textContent.trim() ?? null)   // its words; the stylesheet draws them in capitals
await L.shot(w, 's2-4-b-sheet')
L.rec('S2-4 the credited sheet’s title reads as the box', SIZE, pub.published && /^FO\*/.test(b18[0] || '') && title === 'FO* · approved' ? 'PASS' : 'FAIL',
  `published ${pub.published}; box ${b18.join(',')}; title "${title}"`, ['s2-4-a-credit-box', 's2-4-b-sheet'])
await L.closeWin(w)
await P.evaluate(() => window.lwSetRole('admin')); await P.waitForTimeout(500)

/* ---- S2-6 (a) and S2-9: a pending morning LL (Auto-approve off, AM picked); the bid window on it; approve then send back ---- */
const R = 'bane', D = '2026-11-12'
await L.openCell(w, R, D); await L.autoApprove(w, false)
await L.press(w, T('portion-am')).catch(() => {}); await P.waitForTimeout(200)
await L.placeLeave(w, 'LL')
const bm = await boxes(R, D)
await L.openCell(w, R, D, w.phone ? 's2-6-a-window-q' : null)
const lit = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [aria-pressed="true"], [data-testid="bid-picker"] .on, [data-testid="bid-picker"] .lit')].map(e => (e.dataset.testid || '') + ':' + e.textContent.trim()).filter(Boolean))
await L.shot(w, 's2-6-a-window')
L.rec('S2-6 (a) the bid window lights AM on a morning box (D1331)', SIZE, /top/.test(bm[0] || '') && lit.some(s => /^portion-am:/.test(s)) ? 'PASS' : 'FAIL', `box ${bm.join(',')}; lit ${lit.join(' | ')}`, ['s2-6-a-window'])
/* then OL pressed in that window: the bid becomes a morning OL (D1331's reading — "a leave changed from that window keeps its half") */
await L.press(w, T('bid-OL')); await P.waitForTimeout(500)
if (await L.vis(P, T('bid-picker')) && /again/i.test((await L.txt(P, T('bid-picker'))) || '')) { await L.press(w, T('bid-OL')); await P.waitForTimeout(500) }
await L.closeWin(w)
const bo = await boxes(R, D)
await L.rowShot(w, R, '2026-11-11', '2026-11-13', 's2-6-b-ol-keeps-half')
L.rec('S2-6 (a) a change from that window keeps its half', SIZE, /^OL:top:s-w/.test(bo[0] || '') ? 'PASS' : 'FAIL', `after OL: ${bo.join(',')}`, ['s2-6-b-ol-keeps-half'])
/* approve it from the window, then a second tap on the lit Approve sends it back (D1330) — the stored half must stay */
await L.openCell(w, R, D)
await L.press(w, T('decide-approve')); await P.waitForTimeout(500)
const ba = await boxes(R, D)
if (!(await L.vis(P, T('bid-picker')))) await L.openCell(w, R, D)
await L.press(w, T('decide-approve')); await P.waitForTimeout(600)
await L.closeWin(w)
const bb = await boxes(R, D)
await L.rowShot(w, R, '2026-11-11', '2026-11-13', 's2-9-a-sent-back')
await L.openApprovals(w)
const al = (await L.apprLines(P)).filter(l => l.who === R && /12 Nov/.test(l.text))
await L.shot(w, 's2-9-b-approvals')
await L.openGrid(w)
L.rec('S2-9 a send-back keeps the morning (the stored code untouched)', SIZE, /top:s-a/.test(ba[0] || '') && /top:s-w/.test(bb[0] || '') && al.some(l => /AM/.test(l.text)) ? 'PASS' : 'FAIL',
  `approved ${ba.join(',')} → sent back ${bb.join(',')}; Approvals: ${al.map(l => l.text.slice(0, 50)).join(' / ')}`, ['s2-9-a-sent-back', 's2-9-b-approvals'])

/* ---- S2-1: the clash note on a credited day holding approved leave — an LL approved on plasma's Saturday, then published ---- */
await world()
await L.openCell(w, PL, SAT); await L.autoApprove(w, true)
const placed = await L.placeLeave(w, 'LL')
const b0 = await boxes(PL, SAT)
const pub2 = await publishSat()
await L.reachCell(w, PL, SAT)
const b1 = await boxes(PL, SAT)
await L.rowShot(w, PL, '2026-07-17', '2026-07-19', 's2-1-a-day')
const lines = await clashTexts()
await L.shot(w, 's2-1-b-clash-note', w.phone ? {} : { clip: { x: 0, y: 0, width: 1536, height: 260 } })
const mine = lines.find(t => /Weekend\/PH work earns/.test(t)) || ''
L.rec('S2-1 the clash note names the credit as the box does', SIZE, placed && pub2.published && /earns FO\*, but the day holds approved LL/.test(mine) ? 'PASS' : 'FAIL',
  `plasma ${SAT}: leave ${b0.join(',')} → after publishing ${b1.join(',')}; the note: "${mine}" (${lines.length} line(s))`, ['s2-1-a-day', 's2-1-b-clash-note'])

console.log('errors:', w.errs.length ? w.errs : 'none')
L.writeResults('s2-' + SIZE)
await L.closeBrowser()
