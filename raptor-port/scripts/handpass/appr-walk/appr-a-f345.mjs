import * as C from './appr-a-common.mjs'
console.log('[appr-a-f345 v1]')
C.initLog('appr-a-f345-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const open = () => P.evaluate(() => !!document.querySelector('[data-testid="appr-range-picker"]'))
const decidedN = () => P.evaluate(sel => document.querySelectorAll(`${sel} [data-testid="appr-approve"][aria-pressed="true"], ${sel} [data-testid="appr-refuse"][aria-pressed="true"]`).length, C.PAGE)
const sc = () => P.evaluate(sel => { const e = document.querySelector(`${sel} .appr-scroll`); const card = document.querySelector(`${sel} .appr-card`); const se = document.scrollingElement; return { scTop: +e.scrollTop.toFixed(1), cardScrollTop: card.scrollTop, winRoom: se.scrollHeight - se.clientHeight, cardBottom: +card.getBoundingClientRect().bottom.toFixed(1), inner: innerHeight } }, C.PAGE)
// the first Approve button wholly visible in the list box (below pinned headings / calendar, above the fade)
const visApprove = () => P.evaluate(sel => {
  const scr = document.querySelector(`${sel} .appr-scroll`).getBoundingClientRect(); const cols = document.querySelector(`${sel} .appr-cols`).getBoundingClientRect(); const card = document.querySelector(`${sel} .appr-card`).getBoundingClientRect()
  const pinned = Math.abs(cols.top - scr.top) < 1.5; const top = pinned ? cols.bottom : Math.max(scr.top, cols.bottom)
  const bs = [...document.querySelectorAll(`${sel} [data-testid="appr-approve"]`)]
  for (let i = 0; i < bs.length; i++) { const r = bs[i].getBoundingClientRect(); if (r.top >= top + 2 && r.bottom <= Math.min(scr.bottom, card.bottom - 28) - 2) { const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (h && (h === bs[i] || bs[i].contains(h))) return { idx: i, x: r.left + r.width / 2, y: r.top + r.height / 2, t: +r.top.toFixed(1), b: +r.bottom.toFixed(1), text: bs[i].innerText.trim() } } }
  return null
}, C.PAGE)
const calBox = () => P.evaluate(() => { const r = document.querySelector('[data-testid="appr-range-picker"]')?.getBoundingClientRect(); return r ? { t: +r.top.toFixed(1), b: +r.bottom.toFixed(1) } : null })

// ===== F3
C.note('=== F3 (917)')
for (const variant of ['a-list-top', 'b-wheeled-after-open']) {
  await P.locator(T('appr-all')).click(); await C.sleep(500)
  if (await open()) { await P.locator(T('appr-pick')).click(); await C.sleep(500) }
  const y0 = (await sc()).scTop
  await P.locator(T('appr-pick')).click(); await C.sleep(900)
  if (variant === 'b-wheeled-after-open') await C.wheelList(P, 300) // the calendar is the first part of the box: scroll it up under the pinned headings
  const cal = await calBox(); const c0 = await C.counts(P); const d0 = await decidedN(); const s0 = await sc()
  const target = await visApprove()
  C.note(`F3 ${variant}: list before open ${y0}, after open ${s0.scTop}; calendar ${JSON.stringify(cal)}; counts ${JSON.stringify(c0)}; decided ${d0}; target Approve ${JSON.stringify(target)}`)
  await C.shot(P, `f3-${variant}-1-open`)
  if (!target) { C.check(`F3-${variant}`, false, 'NOT REACHED: no Approve button wholly visible to press'); continue }
  await P.mouse.click(target.x, target.y); await C.sleep(700)
  const o1 = await open(); const c1 = await C.counts(P); const d1 = await decidedN()
  await C.shot(P, `f3-${variant}-2-first-press`)
  C.note(`  after the first press: calendar open ${o1}; counts ${JSON.stringify(c1)}; decided ${d1}`)
  C.check(`F3-${variant}-first`, !o1 && d1 === d0 && JSON.stringify(c1) === JSON.stringify(c0), `first press on an Approve at y ${target.t}-${target.b} (calendar ${cal?.t}-${cal?.b}): calendar open ${o1}, decided lines ${d0} -> ${d1}, counts ${JSON.stringify(c0)} -> ${JSON.stringify(c1)}`)
  const target2 = await visApprove()
  await P.mouse.click(target2.x, target2.y); await C.sleep(700)
  const c2 = await C.counts(P); const d2 = await decidedN()
  await C.shot(P, `f3-${variant}-3-second-press`)
  C.note(`  second press on line ${target2.idx} Approve: counts ${JSON.stringify(c2)}; decided ${d2}`)
  C.check(`F3-${variant}-second`, d2 === d1 + 1 && c2.approveAll !== c1.approveAll, `second press (line ${target2.idx}): decided ${d1} -> ${d2}, Approve all "${c1.approveAll}" -> "${c2.approveAll}"`)
  // undo it so the next variant starts clean
  const pressed = P.locator(`${C.PAGE} [data-testid="appr-approve"][aria-pressed="true"]`).first()
  await pressed.click(); await C.sleep(500)
}

// ===== F4
C.note('=== F4 (917): range by two day presses')
await P.locator(T('appr-all')).click(); await C.sleep(500)
if (await open()) { await P.locator(T('appr-pick')).click(); await C.sleep(500) }
await P.evaluate(() => 0)
const b0 = await C.boxes(P)
await P.locator(T('appr-pick')).click(); await C.sleep(900)
const bOpen = await C.boxes(P)
const dOpen = C.diffBoxes(b0, bOpen, ['approveAll', 'scroller', 'cols', 'pick'])
await C.shot(P, 'f4-1-open')
const clickDay = async id => { const bb = await P.locator(T(id)).boundingBox(); const hit = await P.evaluate(([x, y, id]) => { const h = document.elementFromPoint(x, y); return h && (h.dataset.testid === id || h.closest(`[data-testid="${id}"]`)) ? 'day' : (h ? h.className : 'none') }, [bb.x + bb.width / 2, bb.y + bb.height / 2, id]); await P.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await C.sleep(500); return hit }
const h5 = await clickDay('appr-range-day-2026-01-05'); await C.shot(P, 'f4-2-start-picked')
const h9 = await clickDay('appr-range-day-2026-01-09'); await C.sleep(500)
await C.shot(P, 'f4-3-range-done')
const bAfter = await C.boxes(P); const g = await C.geo(P); const o = await open()
const dAfter = C.diffBoxes(b0, bAfter, ['approveAll', 'scroller', 'cols', 'pick'])
const chip = (await P.locator(T('appr-pick')).innerText()).replace(/\s+/g, ' ')
C.note(`F4: clicks hit ${h5}/${h9}; calendar open ${o}; chip "${chip}"; lines ${g.lines}; card foot ${g.card.bottom} (screen ${g.inner}); winRoom ${g.winRoom}; neighbours moved on open: ${dOpen.join(';') || 'none'}; after: ${dAfter.join(';') || 'none'}; Pick chip right edge ${b0.pick.r} -> ${bAfter.pick.r}; Approve all right edge ${b0.approveAll.r} -> ${bAfter.approveAll.r}`)
C.check('F4-range', !o && g.lines >= 1 && g.lines < 19 && dOpen.length === 0 && dAfter.length === 0 && g.winRoom <= 0 && Math.abs(g.card.bottom - (g.inner - 8)) <= 1.01 && (await sc()).scTop === 0, `two real presses (5 then 9 Jan): calendar closed, chip "${chip}", ${g.lines} lines; title/chips/card unmoved on open (${dOpen.join(';') || 'none'}) and after (${dAfter.join(';') || 'none'}); card foot ${g.card.bottom} = screen ${g.inner} - 8; window room ${g.winRoom}; list at ${(await sc()).scTop}`)

// ===== F5 keyboard with the calendar open, 917
C.note('=== F5 (917): keyboard with the calendar open')
await P.locator(T('appr-all')).click(); await C.sleep(500)
if (await open()) { await P.locator(T('appr-pick')).click(); await C.sleep(500) }
await P.locator(T('appr-pick')).click(); await C.sleep(900)
await P.locator(T('appr-pick')).focus(); await C.sleep(150)
const probe = () => P.evaluate(sel => { const e = document.activeElement; if (!e || e === document.body) return { tid: 'none' }; const r = e.getBoundingClientRect(); const scE = document.querySelector(`${sel} .appr-scroll`); const s = scE.getBoundingClientRect(); const cols = document.querySelector(`${sel} .appr-cols`).getBoundingClientRect(); const card = document.querySelector(`${sel} .appr-card`); const cb = card.getBoundingClientRect(); const inList = !!e.closest('.appr-scroll'); const inCal = !!e.closest('[data-testid="appr-range-picker"]'); const pinned = Math.abs(cols.top - s.top) < 1.5; const top = pinned ? cols.bottom : Math.max(s.top, 0); const under = inList && !inCal && !pinned ? r.top < cols.bottom - 0.5 && r.bottom > cols.top : false; return { tid: e.dataset.testid || e.tagName, inList, inCal, t: +r.top.toFixed(1), b: +r.bottom.toFixed(1), scTop: +scE.scrollTop.toFixed(1), cardScrollTop: card.scrollTop, winY: scrollY, ringed: (getComputedStyle(e).outlineStyle !== 'none' && parseFloat(getComputedStyle(e).outlineWidth) > 0) || getComputedStyle(e).boxShadow !== 'none', ring: getComputedStyle(e).outlineStyle + ' ' + getComputedStyle(e).outlineWidth + ' ' + getComputedStyle(e).outlineColor + ' / ' + getComputedStyle(e).boxShadow.slice(0, 50), visible: inList ? (r.top >= top - 0.5 && r.bottom <= Math.min(s.bottom, cb.bottom - 28) + 0.5 && !under) : (r.top >= 0 && r.bottom <= innerHeight), openCal: !!document.querySelector('[data-testid="appr-range-picker"]') } }, C.PAGE)
const fw = []
for (let i = 0; i < 45; i++) { await P.keyboard.press('Tab'); await C.sleep(130); fw.push(await probe()) }
C.note('Tab x45: ' + fw.map(t => t.tid.replace('appr-', '') + (t.visible ? '' : '(HIDDEN ' + t.t + '-' + t.b + ')')).join(' > '))
await C.shot(P, 'f5-1-tab-45')
const bw = []
for (let i = 0; i < 45; i++) { await P.keyboard.press('Shift+Tab'); await C.sleep(110); bw.push(await probe()) }
C.note('Shift+Tab x45: ' + bw.map(t => t.tid.replace('appr-', '') + (t.visible ? '' : '(HIDDEN ' + t.t + '-' + t.b + ')')).join(' > '))
await C.shot(P, 'f5-2-shifttab-back')
const all = fw.concat(bw)
const calStops = fw.filter(t => t.inCal).length
C.note('ring per stop (outline / shadow): ' + JSON.stringify([...new Map(all.map(t => [t.tid, t.ring])).entries()]))
C.check('F5-keys', calStops >= 3 && all.every(t => t.cardScrollTop === 0 && t.winY === 0) && all.every(t => t.visible) && all.every(t => t.ringed || /range-title|range-day/.test(t.tid)) && all.every(t => t.openCal), `calendar open, Tab through its ${calStops} stops and on into the list (45 forward, 45 back): every focused thing wholly visible (hidden ${all.filter(t => !t.visible).length}), focus ring on each (the calendar's title and day draw their own ring on an inner element, seen in appr-a-f5x-fix1-title.png and -day-2026-01-01.png and identical on main; every other stop has the 1.6px cyan outline; stops without an outline or shadow of their own: ${all.filter(t => !t.ringed).length}, all of them the title or the day), card.scrollTop max ${Math.max(...all.map(t => t.cardScrollTop ?? 0))}, window scrollY max ${Math.max(...all.map(t => t.winY ?? 0))}, calendar stayed open at each stop ${all.every(t => t.openCal)}`)
C.note('errors ' + JSON.stringify(errs)); C.check('F345-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
