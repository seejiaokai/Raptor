/* www W2 scenario 10: phone fit of each Conflict line, gestures in each drawer.
   usage (from raptor-port/): PHONE=1 (WebKit 402)  or  W390=1 (Chromium 390)  or neither (desktop 1536, one look) */
const PHONE = process.env.PHONE === '1', W390 = process.env.W390 === '1'
const TAG = PHONE ? 'p' : (W390 ? 'c390' : 'd')
process.env.WWW_RUN ||= 's10-' + TAG
const H = await import('./www-w2-lib2.mjs')
const { X, say, sleep, L } = H
const size = PHONE ? '402 WebKit' : (W390 ? '390 Chromium' : '1536')
const R = (did, exp, saw, v, pic) => X.row('10 phone fit and gestures', size, did, exp, saw, v, pic)
say('www-w2-s10 v1', size)
const w = await X.open({ phone: PHONE })
if (W390) { await w.page.setViewportSize({ width: 390, height: 844 }); await sleep(500); w.P = 'c' }
const { page } = w
const P = TAG
const FRI = X.FRI
const touch = PHONE
const tapEl = async el => { await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); if (touch) await el.tap(); else await el.click(); await sleep(400) }
await X.board(w, FRI)
await H.frFlight(w, FRI, '12:00', '', 'bane', 'VL BFM')
await H.frFlight(w, FRI, '14:00', '', 'bane', 'RU')
await H.gRow(w, FRI, 'MASS DEBRIEF + BEER CALL', '13:10', '13:20', 'bane')
const ace = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ace'))
await H.frFlight(w, FRI, '09:00', '10:00', ace, 'ACE FLT')
await H.gRow(w, FRI, 'ACE ITEM', '09:30', '09:40', ace)
// the measure: count rows of the text after the grey kind label; a time range (.tr-nw) never split
const measureJS = (root) => {
  const els = [...document.querySelectorAll(root + ' .witem, ' + root + ' .wln')].filter(e => e.getBoundingClientRect().width > 0)
  return els.map(e => {
    const tx = e.querySelector('.wtx, .wln-t') || e.querySelector('.wbar + span') || e
    const code = tx.querySelector('.wcode')
    const r = document.createRange()
    if (code) r.setStartAfter(code); else r.selectNodeContents(tx)
    if (code) r.setEndAfter(tx.lastChild)
    const rects = [...r.getClientRects()].filter(c => c.width > 0.5)
    const rows = new Set(rects.map(c => Math.round(c.top))).size
    const nw = [...tx.querySelectorAll('.tr-nw')].map(n => new Set([...n.getClientRects()].filter(c => c.width > 0.5).map(c => Math.round(c.top))).size)
    const full = e.innerText.replace(/[\s ]+/g, ' ').trim()
    return { text: full, rows, nwSplit: nw.some(k => k > 1), w: Math.round(tx.getBoundingClientRect().width), cls: String(e.className) }
  })
}
async function fit(where, pic, root = 'body') {
  const ls = await page.evaluate(measureJS, root)
  const cl = ls.filter(l => /Conflict: /.test(l.text))
  const bad = cl.filter(l => l.rows > 2 || l.nwSplit)
  R(`${where}: every "Conflict:" line measured`, 'each at most two rows; no time range split', JSON.stringify(cl.map(l => `${l.rows} rows${l.nwSplit ? ' SPLIT' : ''} w${l.w}: ${l.text.slice(0, 120)}`)) + ' | all lines: ' + JSON.stringify(ls.filter(l => !/Conflict: /.test(l.text)).map(l => `${l.rows}r ${l.text.slice(0, 90)}`)), cl.length === 0 ? 'NOT WALKED' : (bad.length ? 'FAIL' : 'PASS'), pic)
  return ls
}
// board issues
await H.bwf(w)
await X.pic(w, `10-1-board-issues-${P}`)
await fit('board issues list', `10-1-board-issues-${P}.png`, '#schedBoard')
await X.closeBoard(w)
// Edit Schedule week strip
const ww = await X.weekWarn(w, '#eWeek', FRI)
await X.pic(w, `10-2-week-strip-${P}`)
await fit('Edit Schedule week strip', `10-2-week-strip-${P}.png`, '#eWeek')
// day details
const dd = await X.dayDetails(w, '#eWeek', FRI)
await X.pic(w, `10-3-day-details-${P}`)
if (dd.ok) await fit('day details window', `10-3-day-details-${P}.png`, '#dayPopBody'); else R('day details window', 'opens', dd.why, 'NOT WALKED', '')
// the gestures inside day details: tap a warning line body -> lights its crew (never selection blue); no hide on body tap
if (dd.ok) {
  const line = page.locator('#dayPopBody .witem:visible').filter({ hasText: /Ranger — Conflict:/ }).first()
  if (await line.count()) {
    const before = await page.evaluate(() => document.querySelectorAll('.puck.sel').length)
    await tapEl(line)
    await X.pic(w, `10-4-dd-line-tapped-${P}`)
    const st = await page.evaluate(() => ({ popOpen: !!document.querySelector('#dayPop:not([hidden]) .airpop-box'), hid: document.querySelectorAll('#dayPopBody .witem.hid, #dayPopBody .wln.hid').length, lit: [...document.querySelectorAll('.puck')].filter(e => /lit|warn|wl-|hl-/.test(e.className)).map(e => e.className).slice(0, 4), sel: document.querySelectorAll('.puck.sel').length }))
    R('day details: tapped the Ranger Conflict line body', 'body tap opens/leads to the issues list and lights its crew; does NOT hide', JSON.stringify(st) + ' before sel ' + before, st.hid ? 'FAIL' : 'RECORDED', `10-4-dd-line-tapped-${P}.png`)
  }
  await H.closeDayPopSafe?.(w)
  await X.closeDayPop(w, 'done').catch(() => {})
}
// the week strip: tap warning body lights crew, ✕ hides, then reshow
await X.weekWarn(w, '#eWeek', FRI)
const wl = page.locator('#eWeek [data-dwbox="4"] .witem:visible').filter({ hasText: /Ranger — Conflict:/ }).first()
if (await wl.count()) {
  await tapEl(wl.locator('.wtx').first())
  const lit = await page.evaluate(() => [...document.querySelectorAll('#eWeek .puck')].filter(e => getComputedStyle(e).outlineStyle !== 'none' || /lit|wl|hl/.test(e.className)).map(e => e.innerText.replace(/\s+/g, ' ').trim() + ':' + e.className).slice(0, 6))
  const blue = await page.evaluate(() => document.querySelectorAll('#eWeek .puck.sel').length)
  await X.pic(w, `10-5-week-tapped-${P}`)
  R('Edit Schedule week strip: tapped the Ranger Conflict line body', 'lights Ranger crew in the warning colours; never selection blue; nothing hidden', JSON.stringify(lit) + ' selBlue ' + blue, blue ? 'FAIL' : 'RECORDED', `10-5-week-tapped-${P}.png`)
  const x = wl.locator('.wln-mute, button:has-text("✕")').first()
  await tapEl(x)
  const hid = await page.evaluate(() => [...document.querySelectorAll('#eWeek [data-dwbox="4"] .witem')].filter(e => e.offsetWidth).map(e => e.className + ':' + e.innerText.replace(/\s+/g, ' ').slice(0, 60)))
  await X.pic(w, `10-6-week-hidden-${P}`)
  R('Edit Schedule week strip: pressed ✕ on that line', 'that warning hidden (struck), others stay', JSON.stringify(hid), hid.some(s => /hid/.test(s)) ? 'PASS' : 'FAIL', `10-6-week-hidden-${P}.png`)
  const wl2 = page.locator('#eWeek [data-dwbox="4"] .witem.hid .wln-mute, #eWeek [data-dwbox="4"] .hid .wln-mute').first()
  if (await wl2.count()) { await tapEl(wl2) }
  const hid2 = await page.evaluate(() => [...document.querySelectorAll('#eWeek [data-dwbox="4"] .witem')].filter(e => e.offsetWidth).map(e => e.className.slice(0, 20)))
  R('the hidden line\'s arrow pressed', 'shown again', JSON.stringify(hid2), hid2.some(s => /hid/.test(s)) ? 'FAIL' : 'PASS', '')
}
// ALL AVAIL reasons window on a ground row at the phone's width
await X.board(w, FRI)
const gP = await H.gRow(w, FRI, 'PROBE', '13:10', '13:20', null)
await X.seat(w, `[data-fill="g:${FRI}.${gP}.+"]`, 'all')
const wa = await H.openAvail(w, `g:${FRI}.${gP}`)
await X.pic(w, `10-7-all-window-${P}`)
const awbox = await page.evaluate(() => { const e = document.querySelector('.availwin'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight, overflowX: e.scrollWidth > e.clientWidth + 1 } })
R('ALL window opened on the 13:10-13:20 row; its frame', 'window on screen, no sideways overflow; RECORD', JSON.stringify(awbox) + ' ' + JSON.stringify(wa).slice(0, 300), awbox && !awbox.overflowX && awbox.x >= 0 && awbox.x + awbox.w <= awbox.vw + 1 ? 'PASS' : 'FAIL', `10-7-all-window-${P}.png`)
// a busy man's reason: tap Ranger in the roster behind? read rows of reasons in the window
const rp = page.locator('.availwin:visible .puck', { hasText: 'Ranger' }).first()
if (await rp.count()) { await tapEl(rp); await X.pic(w, `10-8-all-reason-${P}`); const t = await page.evaluate(() => document.querySelector('.availwin')?.innerText.replace(/\s+/g, ' ').slice(0, 500)); R('ALL window: Ranger tapped for the reason', 'reason lines fit', t, 'RECORDED', `10-8-all-reason-${P}.png`) }
else R('ALL window: Ranger in its list', 'RECORD', 'Ranger is not in the window (busy)', 'RECORDED', '')
await H.closeAvail(w)
// the drop note: drag a puck onto a seat that clashes
await X.fin(w)
