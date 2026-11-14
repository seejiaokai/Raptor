import * as C from './appr-a-common.mjs'
console.log('[appr-a-f1 v1]')
C.initLog('appr-a-f1-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const setWin = await C.windowCtl(P)
const V = () => P.evaluate(sel => {
  const b = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { t: +r.top.toFixed(1), b: +r.bottom.toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1), h: +r.height.toFixed(1) } }
  const pk = document.querySelector('[data-testid="appr-range-picker"]'); const sc = document.querySelector(`${sel} .appr-scroll`); const card = document.querySelector(`${sel} .appr-card`); const se = document.scrollingElement
  const cols = document.querySelector(`${sel} .appr-cols`)
  const d31 = document.querySelector('[data-testid="appr-range-day-2026-01-31"]'); const r31 = d31?.getBoundingClientRect()
  let hit31 = null
  if (r31 && r31.bottom > 0 && r31.top < innerHeight) { const h = document.elementFromPoint(r31.left + r31.width / 2, r31.top + r31.height / 2); hit31 = h ? (h === d31 || d31.contains(h) ? 'day31' : (h.dataset.testid || h.className || h.tagName)) : 'none' }
  const cb = card.getBoundingClientRect()
  return { inner: innerHeight, winRoom: +(se.scrollHeight - se.clientHeight).toFixed(2), winY: scrollY, cardScrollTop: card.scrollTop, pageScrollTop: document.querySelector(sel).scrollTop, scTop: +(sc?.scrollTop ?? -1).toFixed(1), scRoom: sc ? +(sc.scrollHeight - sc.clientHeight).toFixed(1) : null, picker: b(pk), pickerInScroll: !!(sc && pk && sc.contains(pk)), scroller: b(sc), cols: b(cols), card: b(card), d31: b(d31), hit31, fadeTop: +(cb.bottom - 28).toFixed(1), lines: document.querySelectorAll(`${sel} [data-testid^="appr-line-"]`).length, firstLine: b(document.querySelector(`${sel} [data-testid^="appr-line-"]`)) }
}, C.PAGE)
const wholly = (v) => { // day 31 wholly on screen: inside scroller, above the foot fade, below the pinned headings (when pinned)
  if (!v.d31) return false
  const pinned = v.cols && v.scroller && Math.abs(v.cols.t - v.scroller.t) < 1.5
  const top = pinned ? v.cols.b : v.scroller.t
  return v.d31.t >= top - 0.5 && v.d31.b <= Math.min(v.scroller.b, v.fadeTop) + 0.5 && v.d31.b <= v.inner
}
for (const h of [680, 560]) {
  C.note(`=== F1 window 1550x${h}`)
  await setWin(1550, h)
  if (await P.evaluate(() => !!document.querySelector('[data-testid="appr-range-picker"]'))) { await P.locator(T('appr-pick')).click(); await C.sleep(500) }
  await P.locator(T('appr-all')).click(); await C.sleep(600)
  // place the list at ~300 with the real wheel
  await C.wheelList(P, 300); const y0 = await C.listY(P)
  C.note(`list wheeled to ${y0} before Pick dates…`)
  await C.shot(P, `f1-${h}-0-before`)
  await P.locator(T('appr-pick')).click(); await C.sleep(1000)
  const v = await V(); C.note('opened: ' + JSON.stringify(v))
  await C.shot(P, `f1-${h}-1-open`)
  const chips = await P.evaluate(sel => document.querySelector(`${sel} .appr-filters`)?.getBoundingClientRect().bottom, C.PAGE)
  C.check(`F1-${h}-open`, v.pickerInScroll && v.scTop === 0 && v.cardScrollTop === 0 && v.picker && v.picker.t >= chips - 0.5 && v.picker.t - chips < 40 && v.winRoom <= 0, `list ${y0} -> ${v.scTop} at open (box back at its top), calendar inside the list box, top ${v.picker?.t} right under the chips (chips foot ${chips?.toFixed(1)}), card.scrollTop ${v.cardScrollTop}, window room ${v.winRoom}`)
  // real wheel over the calendar, tick by tick, until day 31 wholly visible
  const m = await C.scMid(P); await P.mouse.move(m.x, m.y)
  const trail = []; let vv = v, ticks = 0
  while (!wholly(vv) && ticks < 20) { await P.mouse.wheel(0, 100); await C.sleep(120); ticks++; vv = await V(); trail.push(vv.scTop) }
  await C.sleep(300); vv = await V()
  C.note(`wheel ticks of 100: ${ticks}, scTop trail ${trail.join(',')}; day31 ${JSON.stringify(vv.d31)} scroller ${JSON.stringify(vv.scroller)} fadeTop ${vv.fadeTop} hit ${vv.hit31} winY ${vv.winY} room ${vv.winRoom} cardScrollTop ${vv.cardScrollTop}`)
  await C.shot(P, `f1-${h}-2-last-week`)
  const lastWeek = await P.evaluate(() => { const ds = [...document.querySelectorAll('[data-testid^="appr-range-day-2026-01-"]')].filter(e => +e.dataset.testid.slice(-2) >= 25); return ds.map(e => { const r = e.getBoundingClientRect(); return e.dataset.testid.slice(-2) + ':' + r.top.toFixed(0) + '-' + r.bottom.toFixed(0) }) })
  C.note('days 25-31 boxes: ' + lastWeek.join(' '))
  C.check(`F1-${h}-lastweek`, wholly(vv) && vv.hit31 === 'day31' && vv.winY === 0 && vv.winRoom <= 0 && vv.cardScrollTop === 0, `real wheel (${ticks} ticks) brings day 31 wholly on screen: box ${vv.d31?.t}-${vv.d31?.b} inside the list box (${vv.scroller?.t}-${vv.scroller?.b}) and above the foot fade (${vv.fadeTop}) and the screen (${vv.inner}); a hit test at its centre lands on it (${vv.hit31}); window room ${vv.winRoom}, card.scrollTop ${vv.cardScrollTop}`)
  // wheel further: headings pin at the box's top, lines scroll under them
  const pinTrail = []
  let pinned = null, linesUnder = false
  for (let i = 0; i < 14; i++) {
    await P.mouse.wheel(0, 100); await C.sleep(130); const x = await V(); pinTrail.push(`${x.scTop}:cols${x.cols?.t}`)
    if (x.cols && x.scroller && Math.abs(x.cols.t - x.scroller.t) < 1.5) { pinned = x; if (x.firstLine && x.firstLine.t < x.cols.b - 1) { linesUnder = true; break } }
  }
  pinned = pinned || await V(); C.note('further wheel: ' + pinTrail.join(' ') + ' | ' + JSON.stringify({ cols: pinned.cols, scroller: pinned.scroller, firstLine: pinned.firstLine }))
  await C.shot(P, `f1-${h}-3-headings-pinned`)
  const isPinned = pinned.cols && Math.abs(pinned.cols.t - pinned.scroller.t) < 1.5
  C.check(`F1-${h}-pin`, isPinned && linesUnder && pinned.winRoom <= 0 && pinned.cardScrollTop === 0, `headings top ${pinned.cols?.t} = list box top ${pinned.scroller?.t} (pinned: ${isPinned}), first line top ${pinned.firstLine?.t} is under the headings' foot ${pinned.cols?.b} (lines scroll under: ${linesUnder}), list scrollTop ${pinned.scTop} of ${pinned.scRoom}, window room ${pinned.winRoom}, card.scrollTop ${pinned.cardScrollTop}`)
  // back up to the calendar; Tab through the calendar
  for (let i = 0; i < 30; i++) { await P.mouse.wheel(0, -200); await C.sleep(60) } await C.sleep(300)
  const vt = await V(); C.note('wheeled back up: scTop ' + vt.scTop)
  // the calendar's own foot reachable by the wheel
  let pf = null
  for (let i = 0; i < 12; i++) { await P.mouse.wheel(0, 100); await C.sleep(110); pf = await V(); if (pf.picker && pf.picker.b <= Math.min(pf.scroller.b, pf.fadeTop) + 0.5) break }
  C.note('calendar foot after wheel: picker ' + JSON.stringify(pf.picker) + ' fadeTop ' + pf.fadeTop + ' scTop ' + pf.scTop)
  await C.shot(P, `f1-${h}-3b-calendar-foot`)
  C.check(`F1-${h}-calfoot`, pf.picker.b <= Math.min(pf.scroller.b, pf.fadeTop) + 0.5 && pf.winRoom <= 0, `calendar's own foot reached by the wheel: picker bottom ${pf.picker.b} within list box foot ${pf.scroller.b} and fade ${pf.fadeTop}; window room ${pf.winRoom}`)
  for (let i = 0; i < 30; i++) { await P.mouse.wheel(0, -200); await C.sleep(40) } await C.sleep(300)
  await P.locator(T('appr-pick')).focus(); await C.sleep(200)
  const probe = () => P.evaluate(sel => { const e = document.activeElement; if (!e || e === document.body) return { none: true, tid: 'none' }; const r = e.getBoundingClientRect(); const scE = document.querySelector(`${sel} .appr-scroll`); const sc = scE.getBoundingClientRect(); const cols = document.querySelector(`${sel} .appr-cols`).getBoundingClientRect(); const card = document.querySelector(`${sel} .appr-card`); const cb = card.getBoundingClientRect(); const inList = !!e.closest('.appr-scroll'); const inCal = !!e.closest('[data-testid="appr-range-picker"]'); const pinned = Math.abs(cols.top - sc.top) < 1.5; const top = pinned ? cols.bottom : sc.top; return { tid: e.dataset.testid || e.tagName, inList, inCal, t: +r.top.toFixed(1), b: +r.bottom.toFixed(1), scTop: +scE.scrollTop.toFixed(1), cardScrollTop: card.scrollTop, winY: scrollY, visible: inList ? (r.top >= top - 0.5 && r.bottom <= Math.min(sc.bottom, cb.bottom - 28) + 0.5) : (r.top >= 0 && r.bottom <= innerHeight) } }, C.PAGE)
  const tabs = []
  for (let i = 0; i < 40; i++) { await P.keyboard.press('Tab'); await C.sleep(120); tabs.push(await probe()) }
  const cal = tabs.filter(t => t.inCal)
  C.note(`Tab x40 from Pick dates…: stops ${tabs.map(t => t.tid.replace('appr-', '')).join(' > ')}`)
  C.note(`  calendar stops ${cal.length}; max cardScrollTop ${Math.max(...tabs.map(t => t.cardScrollTop ?? 0))}; max winY ${Math.max(...tabs.map(t => t.winY ?? 0))}; invisible in-list stops ${JSON.stringify(tabs.filter(t => t.inList && !t.visible).map(t => t.tid + ' ' + t.t + '-' + t.b))}`)
  await C.shot(P, `f1-${h}-4-after-tab`)
  // arrows inside the day grid (the grid has ONE tab stop): walk the days with the keyboard
  await P.locator(T('appr-pick')).focus(); await C.sleep(150)
  let onDay = null
  for (let i = 0; i < 12; i++) { await P.keyboard.press('Tab'); await C.sleep(100); const p = await probe(); if (/appr-range-day/.test(p.tid)) { onDay = p; break } }
  const arrows = []
  if (onDay) { for (const k of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowDown']) { await P.keyboard.press(k); await C.sleep(150); arrows.push(await probe()) } }
  C.note(`arrow walk from ${onDay?.tid}: ${arrows.map(a => a.tid.replace('appr-range-day-2026-', '') + '@' + a.t + '-' + a.b + ' sc' + a.scTop + ' card' + a.cardScrollTop).join(' | ')}`)
  await C.shot(P, `f1-${h}-4b-arrow-walk`)
  const moved = new Set(arrows.map(a => a.tid)).size
  C.check(`F1-${h}-tab`, cal.length >= 3 && tabs.every(t => (t.cardScrollTop ?? 0) === 0 && t.winY === 0) && arrows.every(t => (t.cardScrollTop ?? 0) === 0 && t.winY === 0) && tabs.filter(t => t.inList).every(t => t.visible), `Tab through the calendar (${cal.length} stops: ${cal.map(t => t.tid.replace('appr-', '')).join(', ')}) and on into the list; card.scrollTop 0 at every Tab and arrow stop (max ${Math.max(0, ...tabs.concat(arrows).map(t => t.cardScrollTop ?? 0))}), window scrollY 0, every Tab stop in the list box wholly visible (offenders ${tabs.filter(t => t.inList && !t.visible).length})`)
  const arrowHidden = arrows.filter(t => t.inList && !t.visible)
  C.note(`INFO F1-${h}-arrows (seen besides, not a pass/fail of the fix): arrow keys walked ${moved} different days; ${arrowHidden.length} of ${arrows.length} arrow stops left the focused day outside the visible list box (${arrowHidden.map(t => t.tid.replace('appr-range-day-2026-', '') + '@' + t.t + '-' + t.b).join(', ') || 'none'}); the box did not scroll to follow (list scrollTop stayed ${arrows.map(t => t.scTop).join(',')})`)
  // real click on day 29 (start), then day 31 (end) — mouse coordinates only, the list placed by the wheel
  await P.locator(T('appr-pick')).click(); await C.sleep(500); await P.locator(T('appr-pick')).click(); await C.sleep(900) // the arrow walk reached February: close and open again for January
  for (let i = 0; i < 30; i++) { await P.mouse.wheel(0, -200); await C.sleep(40) } await C.sleep(200)
  await P.mouse.move(m.x, m.y)
  const clickDay = async (dd) => {
    let w = await V(), t2 = 0
    const box = () => P.evaluate(id => { const e = document.querySelector(`[data-testid="${id}"]`); const r = e.getBoundingClientRect(); const hh = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { l: r.left, r: r.right, t: r.top, b: r.bottom, hit: hh && (hh === e || e.contains(hh)) ? 'day' : (hh ? (hh.dataset.testid || hh.className) : 'none') } }, `appr-range-day-2026-01-${dd}`)
    let bx = await box()
    while (!(bx.t >= w.scroller.t + 0.5 && bx.b <= Math.min(w.scroller.b, w.fadeTop) && bx.hit === 'day') && t2 < 20) { await P.mouse.wheel(0, 100); await C.sleep(120); t2++; w = await V(); bx = await box() }
    await C.sleep(250); bx = await box()
    await P.mouse.click(bx.l + (bx.r - bx.l) / 2, bx.t + (bx.b - bx.t) / 2); await C.sleep(700)
    return { ticks: t2, hit: bx.hit, box: bx }
  }
  const c1 = await clickDay('29')
  const foot1 = await P.evaluate(() => (document.querySelector('[data-testid="appr-range-picker"]')?.innerText || '').replace(/\s+/g, ' ').slice(-40))
  const w2 = await V(); await C.shot(P, `f1-${h}-5-day29-pressed`)
  C.note(`real click on day 29 (hit ${c1.hit}, ${c1.ticks} wheel ticks): picker foot "${foot1}", list ${w2.scTop}`)
  const c2 = await clickDay('31')
  const open3 = await P.evaluate(() => !!document.querySelector('[data-testid="appr-range-picker"]'))
  const chip = (await P.locator(T('appr-pick')).innerText()).replace(/\s+/g, ' ')
  const w3 = await V()
  C.note(`real click on day 31 (hit ${c2.hit}, ${c2.ticks} more ticks): calendar open ${open3}, chip "${chip}", lines ${w3.lines}, winRoom ${w3.winRoom}, card.scrollTop ${w3.cardScrollTop}, list ${w3.scTop}`)
  await C.shot(P, `f1-${h}-6-range-done`)
  C.check(`F1-${h}-click`, c1.hit === 'day' && c2.hit === 'day' && !open3 && /29 Jan.*31 Jan/.test(chip) && w3.winRoom <= 0 && w3.cardScrollTop === 0, `two real mouse clicks (no script scroll) on day 29 then day 31 (hit-tested as the day buttons): calendar ${open3 ? 'still open' : 'closed'}, chip "${chip}", window room ${w3.winRoom}, card.scrollTop ${w3.cardScrollTop}`)
  if (open3) { await P.locator(T('appr-pick')).click(); await C.sleep(400) }
  await P.locator(T('appr-all')).click(); await C.sleep(500)
  if (open3) { await P.locator(T('appr-pick')).click(); await C.sleep(400) }
  await P.locator(T('appr-all')).click(); await C.sleep(500)
}
C.note('errors ' + JSON.stringify(errs)); C.check('F1-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
