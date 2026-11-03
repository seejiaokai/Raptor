// W1 — S19 (windows dragged on small phones; finger drag by CDP, resting and quick flick) and S24 (ALL AVAIL window corner) and S25 (SANS Highlight list). v1
import * as L from './ibc-w1-lib.mjs'
const { sleep, tid, press, shot, row, act, wins, rect, hitOf } = L
console.log('ibc-w1-s19 v1')
L.startRun('keep')
const browser = await L.launch()

const finger = async (w, from, to, rest = true, steps = 10, gap = 20) => {
  const c = await w.ctx.newCDPSession(w.page)
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] })
  for (let i = 1; i <= steps; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps }] }); if (gap) await sleep(gap) }
  if (rest) await sleep(100)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(500)
  await c.detach().catch(() => {})
}
const geo = (page, win) => page.evaluate(win => {
  const e = document.querySelector(`[data-testid="${win}"]`); if (!e) return null
  const r = e.getBoundingClientRect()
  const body = e.querySelector('.win-body') || e
  const btns = [...e.querySelectorAll('button')].filter(b => { const q = b.getBoundingClientRect(); return q.height > 0 && q.width > 0 })
  const low = btns.sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom)[0]
  const lq = low ? low.getBoundingClientRect() : null
  const h = lq ? document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, lq.left + lq.width / 2)), Math.min(innerHeight - 1, Math.max(0, lq.top + lq.height / 2))) : null
  let foot = null
  if (low && body.scrollHeight > body.clientHeight) { const keep = body.scrollTop; body.scrollTop = body.scrollHeight; const q = low.getBoundingClientRect(); const hh = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, q.left + q.width / 2)), Math.min(innerHeight - 1, Math.max(0, q.top + q.height / 2))); foot = { bottom: Math.round(q.bottom), inScreen: q.bottom <= innerHeight + 1 && q.top >= 0, fingerMeetsIt: !!hh && (hh === low || low.contains(hh)) }; body.scrollTop = keep }
  return { footAfterScrollingBody: foot, vw: innerWidth, vh: innerHeight, win: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], winInside: r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1, bodyScroll: [Math.round(body.scrollTop), body.scrollHeight, body.clientHeight], lowestButton: low ? (low.id || low.getAttribute('data-testid') || low.textContent.trim().slice(0, 12)) : null, lowestButtonBottom: lq ? Math.round(lq.bottom) : null, lowestButtonFingerMeetsIt: !!h && !!low && (h === low || low.contains(h)) }
}, win)
async function dragSeq(w, win, T) {
  const p = w.page
  const g0 = await geo(p, win)
  const bar = async () => { const b = await tid(p, win).locator('.win-bar').boundingBox(); return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) } }
  let f = await bar(); await finger(w, f, { x: f.x, y: f.y + 320 })
  const g1 = await geo(p, win); await shot(p, `${T}-dragged-low`)
  f = await bar(); await finger(w, f, { x: f.x, y: 24 })
  const g2 = await geo(p, win); await shot(p, `${T}-dragged-back-up`)
  /* quick flick: no rest, few moves, no gap */
  f = await bar(); await finger(w, f, { x: f.x, y: f.y + 420 }, false, 3, 0)
  const g3 = await geo(p, win); await shot(p, `${T}-quick-flick-low`)
  f = await bar(); await finger(w, f, { x: f.x, y: 10 }, false, 3, 0)
  const g4 = await geo(p, win); await shot(p, `${T}-quick-flick-up`)
  return { g0, g1, g2, g3, g4 }
}
async function s19(size) {
  const w = await L.session(browser, size); const p = w.page, T = `S19-${size}`
  try {
    /* 1. the Calendar window on August 2026 */
    await L.inputsCal(w, 2026, 8)
    await press(w, '#inGear'); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
    /* 2. the Inputs settings window, dragged */
    const r2 = await dragSeq(w, 'win-inputsset', `${T}-settings`)
    const ok2 = [r2.g1, r2.g2, r2.g3, r2.g4].every(g => g.winInside)
    row(`S19.2-${size}`, `${size}: Inputs settings window dragged low, up, quick flick low, quick flick up`, 'window always inside the screen; its last control reachable', r2, ok2 ? 'PASS' : 'FAIL', `${T}-settings-*.png`)
    /* Calendar window from it (the settings window may be dragged anywhere; reopen fresh first) */
    await L.closeWins(w); await press(w, '#inGear'); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
    await press(w, tid(p, 'iset-days')); await tid(p, 'win-days').waitFor(); await sleep(500)
    const tab = tid(p, 'days-tab-month'); if (await tab.count()) { await press(w, tab); await sleep(300) }
    for (let i = 0; i < 24; i++) {
      const [m, y] = (await tid(p, 'days-month').innerText()).trim().toLowerCase().split(/\s+/)
      const d = 2026 * 12 + 7 - (+y * 12 + ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].indexOf(m))
      if (!d) break
      await press(w, tid(p, d > 0 ? 'days-next' : 'days-prev'))
    }
    const month = (await tid(p, 'days-month').innerText()).trim()
    const r1 = await dragSeq(w, 'win-days', `${T}-calendar`)
    const last = await p.evaluate(() => { const e = document.querySelector('[data-testid="days-cell-2026-08-31"]'); if (!e) return null; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2))); return { bottom: Math.round(r.bottom), top: Math.round(r.top), vh: innerHeight, finger: !!h && e.contains(h) } })
    const ok1 = [r1.g1, r1.g2, r1.g3, r1.g4].every(g => g.winInside)
    row(`S19.1-${size}`, `${size}: Calendar window (${month}) dragged low, up, quick flick low, quick flick up`, 'window always inside the screen; its last week reachable', { ...r1, last31Aug: last }, ok1 && last && last.bottom <= last.vh && last.finger ? 'PASS' : 'FAIL', `${T}-calendar-*.png`)
    /* rotate sideways after the drag */
    if (size === 'phone') {
      await p.setViewportSize({ width: 874, height: 402 }); await sleep(600)
      const gs = await geo(p, 'win-days')
      row(`S19.1r-${size}`, `${size}: rotate sideways (874x402) with the Calendar window after the drags`, 'RECORD (cap from portrait height?)', gs, 'RECORDED', `${T}-calendar-rotated.png`)
      await shot(p, `${T}-calendar-rotated`)
      await p.setViewportSize({ width: 402, height: 874 }); await sleep(400)
    }
    await L.closeWins(w)
    /* 3. the input window from the List's + Input, dragged; Remarks box position */
    await press(w, '#inListBtn'); await sleep(400)
    await press(w, '#inNew'); await tid(p, 'win-inputedit').waitFor(); await sleep(500)
    const r3 = await dragSeq(w, 'win-inputedit', `${T}-inputwin`)
    const rmk = await p.evaluate(() => { const e = document.getElementById('inpEditRmk'); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); const h = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2))); const sv = document.getElementById('inpEditSave'); const sq = sv ? sv.getBoundingClientRect() : null; return { rmk: [Math.round(r.top), Math.round(r.bottom)], save: sq ? [Math.round(sq.top), Math.round(sq.bottom)] : null, vh: innerHeight, finger: !!h && (h === e || e.contains(h)) } })
    row(`S19.3-${size}`, `${size}: input window (List + Input) dragged low, up, quick flick low, quick flick up; where Remarks and Save stand`, 'window inside the screen; Remarks above Save and met by a finger (keyboard up NOT driven)', { ...r3, remarks: rmk }, [r3.g1, r3.g2, r3.g3, r3.g4].every(g => g.winInside) && rmk && rmk.finger ? 'PASS' : 'FAIL', `${T}-inputwin-*.png`)
    await L.closeWins(w)
    /* 4. SANS settings window */
    await press(w, '#inSansMode'); await tid(p, 'sanscal').waitFor(); await sleep(400)
    await press(w, tid(p, 'sc-gear')); await tid(p, 'win-sansset').waitFor(); await sleep(400)
    const r4 = await dragSeq(w, 'win-sansset', `${T}-sansset`)
    row(`S19.4-${size}`, `${size}: SANS settings window dragged low, up, quick flick low, quick flick up`, 'window always inside the screen; its last control reachable', r4, [r4.g1, r4.g2, r4.g3, r4.g4].every(g => g.winInside) ? 'PASS' : 'FAIL', `${T}-sansset-*.png`)
    /* day windows unchanged: a SANS day (rests) */
    await L.closeWins(w)
    await L.toSans(w, 2026, 7)
    await L.openSansDay(w, '2026-07-14')
    const gd = await geo(p, 'win-sansday')
    row(`S19.5-${size}`, `${size}: SANS day window as opened (a "rests" window, unchanged by F5)`, 'RECORD', gd, 'RECORDED', `${T}-sansday.png`)
    await shot(p, `${T}-sansday`)
  } catch (e) { L.say(`ERROR s19 ${size}: ${e.stack}`); await shot(p, `s19-${size}-error`).catch(() => {}) }
  await w.ctx.close()
}
await s19('small')
await s19('phone')

/* ===== S24 — ALL AVAIL window corner (F10 / D77) ===== */
async function s24(size) {
  const w = await L.session(browser, size); const p = w.page, T = `S24-${size}`
  try {
    await L.go(p, 'editsched'); await sleep(500)
    /* the ALL AVAIL window is opened from the schedule: look for its door */
    const door = await p.evaluate(() => [...document.querySelectorAll('[data-oilsent]')].filter(b => b.getBoundingClientRect().height > 0).slice(0, 5).map(b => ({ tag: b.tagName, id: b.id, cls: b.className.toString().slice(0, 30), txt: (b.textContent || '').trim().slice(0, 30) })))
    row(`S24.0-${size}`, `${size}: looking for a door to the ALL AVAIL window on Edit Schedule`, 'RECORD', door, 'RECORDED')
    const d = p.locator('[data-oilsent]:visible').first()
    let opened = false
    if (await d.count()) { await d.scrollIntoViewIfNeeded(); await (w.touch ? d.tap() : d.click()); await sleep(900); opened = (await p.locator('.availwin:not([hidden])').count()) > 0 }
    if (!opened) {
      /* try the puck of ALL AVAIL in the crew panel or the day's ALL AVAIL chip */
      const alt = p.locator('text=/ALL AVAIL/').first()
      if (await alt.count()) { await alt.click({ force: true }).catch(() => {}); await sleep(700); opened = (await p.locator('.availwin:not([hidden])').count()) > 0 }
    }
    const cs = await p.evaluate(() => { const e = document.querySelector('.availwin:not([hidden])'); if (!e) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { cls: e.className.toString().slice(0, 50), resize: cs.resize, overflow: cs.overflow, box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] } })
    if (!opened) row(`S24-${size}`, `${size}: ALL AVAIL window`, 'phone: no resize corner (D77)', { door }, 'NOT WALKED premise — could not open the ALL AVAIL window from the controls tried')
    else { row(`S24-${size}`, `${size}: ALL AVAIL window opened; computed resize and box`, 'no resize corner on a phone (D77)', cs, cs && cs.resize === 'none' ? 'PASS' : (cs ? 'FAIL' : 'NOT WALKED premise'), `${T}.png`); await shot(p, T) }
  } catch (e) { L.say(`ERROR s24 ${size}: ${e.stack}`); await shot(p, `s24-${size}-error`).catch(() => {}) }
  await w.ctx.close()
}

/* ===== S25 — SANS Highlight on 844x390 and 1440x700 ===== */
async function s25(size, custom) {
  if (custom) L.SIZES[size] = custom
  const w = await L.session(browser, size); const p = w.page, T = `S25-${size}`
  try {
    await L.toSans(w, 2026, 7)
    await p.evaluate(() => window.scrollTo(0, 0)); await sleep(250)
    await press(w, tid(p, 'sc-hl')); await tid(p, 'sc-hl-menu').waitFor(); await sleep(300)
    const g = () => p.evaluate(() => {
      const m = document.querySelector('[data-testid="sc-hl-menu"]'); const r = m.getBoundingClientRect()
      const items = [...m.querySelectorAll('[role=option]')]; const last = items[items.length - 1].getBoundingClientRect()
      return { vh: innerHeight, menu: [Math.round(r.top), Math.round(r.bottom)], items: items.length, lastItem: [Math.round(last.top), Math.round(last.bottom)], menuScroll: [m.scrollTop, m.scrollHeight, m.clientHeight], overflowY: getComputedStyle(m).overflowY }
    })
    const g0 = await g(); await shot(p, `${T}-open`)
    await p.evaluate(() => { const m = document.querySelector('[data-testid="sc-hl-menu"]'); m.scrollTop = m.scrollHeight }); await sleep(300)
    const g1 = await g()
    row(`S25a-${size}`, `${size}: SANS Highlight opened, then its list scrolled to the foot`, 'list foot inside the screen; scrolls inside itself; last person reachable', { opened: g0, scrolledToFoot: g1 }, g0.menu[1] <= g0.vh && g1.lastItem[1] <= g1.vh && g1.menuScroll[0] > 0 || (g0.menuScroll[1] <= g0.menuScroll[2] && g0.lastItem[1] <= g0.vh) ? 'PASS' : 'FAIL', `${T}-open.png`)
    await shot(p, `${T}-scrolled-to-foot`)
    /* press the last person */
    const lastBox = await p.evaluate(() => { const m = document.querySelector('[data-testid="sc-hl-menu"]'); const items = [...m.querySelectorAll('[role=option]')]; const l = items[items.length - 1]; const r = l.getBoundingClientRect(); const h = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), Math.min(innerHeight - 1, r.top + r.height / 2)); return { name: l.textContent.trim().slice(0, 20), fingerMeetsIt: !!h && (h === l || l.contains(h)), box: [Math.round(r.top), Math.round(r.bottom)] } })
    await (w.touch ? p.locator('[data-testid="sc-hl-menu"] [role=option]').last().tap() : p.locator('[data-testid="sc-hl-menu"] [role=option]').last().click()); await sleep(500)
    const after = await p.evaluate(() => ({ menuOpen: !!document.querySelector('[data-testid="sc-hl-menu"]'), picked: [...document.querySelectorAll('[data-testid="sc-hl"], [data-testid="sc-hl"] *')].map(e => (e.textContent || '').trim()).filter(Boolean).slice(0, 3) }))
    row(`S25b-${size}`, `${size}: press the last person in the list`, 'last person is pickable (Highlight now names him)', { lastBox, after }, lastBox.fingerMeetsIt ? 'PASS' : 'FAIL', `${T}-last-person.png`)
    await shot(p, `${T}-last-person`)
    /* open, rotate, reopen (sideways only) */
    if (size === 'side') {
      await p.setViewportSize({ width: 390, height: 844 }); await sleep(500)
      await p.setViewportSize({ width: 844, height: 390 }); await sleep(500)
      await p.evaluate(() => window.scrollTo(0, 0))
      if (!(await tid(p, 'sc-hl-menu').count())) await press(w, tid(p, 'sc-hl'))
      await sleep(300)
      const g2 = await g()
      row(`S25c-${size}`, `${size}: open, rotate upright and back, reopen`, 'list still wholly on screen / scrollable', g2, g2.menu[1] <= g2.vh ? 'PASS' : 'FAIL', `${T}-reopened.png`)
      await shot(p, `${T}-reopened`)
    }
  } catch (e) { L.say(`ERROR s25 ${size}: ${e.stack}`); await shot(p, `s25-${size}-error`).catch(() => {}) }
  await w.ctx.close()
}
await s25('side')
await s25('d700', { viewport: { width: 1440, height: 700 } })
await browser.close()
L.finishRun('s19')
