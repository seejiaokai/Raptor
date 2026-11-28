// swd-w14c-lib — walker w14c's helpers ("the reminder over dates and days": B8 (a)–(e), B10, A1, A2, A5, A7, A10; probes
// P11, P12), chat 174, the night of 24–25 Nov 26. Built on w14b's and w14a's passing helpers (swd-w14b-lib → swd-w14a-lib →
// swd-w12-lib → swd-w11-lib → sah-w10-lib / asp-w2-lib / sud-w5-lib), copied, never edited. window.* is only READ here (and
// window.go, the recipes' own page switch). Every staging step is the app's own controls.
import './swd-w14c-env.mjs'
import path from 'node:path'
const Z = await import('./swd-w14b-lib.mjs')
export const { K, X, T, L, W5, RANGER, HEX, CASPER, D, ISO, DI, WK1, WK2, WORDS, lineIs, remIs, bell, say, sayB, readReminder, need, asR, asS, asH,
  scene, sleep, planSim, remDays, J, addLine, armSeat, crewSay, tickOf, seatOn, fileMe, topBar, tbSay, sansOn, postAny, withWords } = Z
export const plan = Z.Z.plan || (await import('./swd-w12-lib.mjs')).plan
export const OUT = L.OUT

/* the line holding the man on day di taken off by its own ✕ ("Remove this line") on the Scheduler Board — the one door that
   empties a seat at both sizes (the drag off a seat is a desktop gesture: WebKit's touches drive no pointer events) */
export async function lineOff(p, W, sid, di, id = RANGER) {
  await T.gotoWeek(p, W, di >= 7 ? WK2 : WK1)
  await L.openBoard(p, W, di % 7)
  const key = await p.evaluate(([i, id]) => { const d = window.DAYS[i]; for (let g = 0; g < d.waves.length; g++) for (let f = 0; f < d.waves[g].formations.length; f++) for (let a = 0; a < d.waves[g].formations[f].aircraft.length; a++) { const x = d.waves[g].formations[f].aircraft[a]; if (x.p === id || x.w === id) return `${i}.${g}.${f}.${a}` } return null }, [di % 7, id])
  if (!key) { need(W, sid, `a line holding ${id} on day ${di} found to remove`, false, 'none'); return }
  await W.press(p, L.B(`[data-ldel="${key}"]`), 'ldel'); await sleep(600)
  const toast = await L.toastSaid(p)
  const left = await T.holds(p, id)
  const pic = await W.pic(p, sid.replace(/\./g, '-') + '-lineoff')
  await L.closeBoard(p, W)
  need(W, sid, `Saber removes the line holding ${id === RANGER ? 'Ranger' : id} on day ${di} by its ✕ ("Remove this line") on the Scheduler Board`, /Line removed/.test(toast) && !left.split(' | ')[di % 7].includes('.aircraft'), `note "${toast}" · what he holds (read): ${left}`, pic)
  await T.gotoWeek(p, W, WK1)
}
/* the sim row holding the man on day di removed by its own ✕ ("Remove this sim") */
export async function simOff(p, W, sid, di, kind = 'oft', id = RANGER) {
  await T.gotoWeek(p, W, WK1)
  await L.openBoard(p, W, di)
  const ri = await p.evaluate(([i, k, id]) => (window.DAYS[i].sims[k] || []).findIndex(r => JSON.stringify(r).includes(`"${id}"`)), [di, kind, id])
  if (ri < 0) { need(W, sid, `a ${kind} row holding ${id} on day ${di} found`, false, 'none'); return }
  await W.press(p, L.B(`[data-srdel="${di}.${kind}.${ri}"]`), 'srdel'); await sleep(600)
  const toast = await L.toastSaid(p)
  const left = await T.holds(p, id)
  const pic = await W.pic(p, sid.replace(/\./g, '-') + '-simoff')
  await L.closeBoard(p, W)
  need(W, sid, `Saber removes the ${kind.toUpperCase()} row holding ${id === RANGER ? 'Ranger' : id} on day ${di} by its ✕ ("Remove this sim")`, !left.split(' | ')[di].includes('.sims'), `note "${toast}" · what he holds (read): ${left}`, pic)
}
/* Saber moves Ranger's posting date (any cell, any day) through the posting sheet; the sheet's own line read back */
export async function moveTo(p, W, cell, to, sid, id = RANGER) {
  await K.warReady(p)
  const m = await T.movePo(p, W, id, cell, to, sid.replace(/\./g, '-'))
  need(W, sid, `Saber moves PO from (sheet opened from the ${cell.slice(8)} Jul cell) to ${to.slice(8)} ${to.slice(5, 7) === '08' ? 'Aug' : 'Jul'}`, m.ok && new RegExp(`On ${+to.slice(8)} `).test(m.line || ''), `"${m.before}" → "${m.line}" ${m.err || ''} ${J(m.rec)}`, m.pic)
  return m
}
/* a bell line tapped where it stands; what the tap opened read at once (page, SANS month, the day window, whether the list
   stayed open), then the line's own read state read back from the bell (the list reopened) */
export async function tapAndRead(p, W, lineId, tag) {
  await T.closeAll(p, W)
  await W.press(p, '.bellbtn:visible', 'bell')
  await p.waitForSelector('[data-testid="bell-list"]', { timeout: 5000 }).catch(() => {})
  await sleep(350)
  const loc = p.locator(`[data-testid="bell-line-${lineId}"]:visible`).first()
  if (!(await loc.count())) return { ok: false, why: 'no such line ' + lineId, pic: await W.pic(p, tag + '-noline') }
  const bb = await loc.boundingBox()
  if (W.isPhone) { await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-line-now-phone.png`) }) }
  else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
  await sleep(1100)
  const got = await p.evaluate(() => {
    const t = e => e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const vis = e => !!e && e.getBoundingClientRect().width > 0
    const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(vis)
    const ie = [...document.querySelectorAll('#inpEditPop')].find(vis)
    const list = [...document.querySelectorAll('[data-testid="bell-list"]')].find(vis)
    return { page: window.CURPAGE, month: t(document.querySelector('[data-testid="sc-month"]')), win: w ? t(w).slice(0, 80) : 'none', inputWin: ie ? t(ie).slice(0, 60) : 'none', listOpen: !!list, toast: t(document.getElementById('toastEl')) }
  })
  const pic = await W.pic(p, tag + '-tapped')
  const b = await bell(p, W, tag + '-after')
  const l = b.lines.find(x => x.id === lineId)
  await T.closeAll(p, W)
  return { ok: true, ...got, line: l || null, after: b, pic: pic + ', ' + b.pic }
}
export const tapSay = t => t.ok ? `page "${t.page}" · SANS month "${t.month}" · day window "${t.win}" · input window "${t.inputWin}" · the list ${t.listOpen ? 'STAYED open' : 'closed'} · note "${t.toast}" · the line after: ${t.line ? say(t.line) : 'gone'}` : t.why
/* the SANS calendar's day read: his filing shown, the day's F count */
export async function calSays(p, W, iso, tag, who = 'Ranger') {
  const s = await K.seen(p, W, iso, tag, who)
  await T.closeAll(p, W)
  return s
}
/* save week 2: a Ground Programme row naming CASPER on Wed 22 (so that week counts, D2394 Q8, without naming the man under test) */
export async function saveWk2(p, W, sid) {
  return plan(p, W, 22, sid, { id: CASPER, name: 'W14C WK2', a: '22:00', b: '22:30' })
}
export { path }

/* a filing run across the month's end, through the day's "+ Commitment" window: its own calendar turned on by its › and the
   last day tapped (T.file only taps a day already drawn); Add pressed; what it made read by the ids before and after */
export async function fileAcross(p, W, from, to, tag) {
  await T.closeAll(p, W)
  await W5.sansDay(p, W, from)
  await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add')
  await p.waitForSelector('#inpEditPop', { timeout: 6000 }); await sleep(400)
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  for (let i = 0; i < 3 && !(await p.locator(`[data-testid="inpEdCal-day-${to}"]:visible`).count()); i++) {
    const nx = p.locator('#inpEditPop button:visible').filter({ hasText: /^\s*›\s*$/ }).first()
    const nx2 = p.locator('#inpEditPop button[aria-label*="ext" i]:visible').first()
    const b = (await nx2.count()) ? nx2 : nx
    if (!(await b.count())) break
    await b.scrollIntoViewIfNeeded().catch(() => {})
    await W.press(p, b, 'cal-next'); await sleep(400)
  }
  const d = p.locator(`[data-testid="inpEdCal-day-${to}"]:visible`).first()
  const found = !!(await d.count())
  if (found) { await d.scrollIntoViewIfNeeded().catch(() => {}); await W.press(p, d, 'cal-' + to); await sleep(300) }
  const read = ((await p.locator('#inpEditPop .rc-read').first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
  const pic0 = await W.pic(p, tag + '-form')
  await W.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
  const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click().catch(() => {}); await sleep(400) }
  const made = await p.evaluate(b => (window.INPUTS || []).filter(r => !b.includes(r.iid)).map(r => ({ iid: r.iid, date: r.date, endDate: r.endDate || null })), before)
  const pic = await W.pic(p, tag + '-saved')
  await T.closeAll(p, W)
  return { found, read, made, pic: pic0 + ', ' + pic }
}
/* Ranger's own run on the SANS calendar: a mouse drag on the desktop (sah-w8-lib dragDays via swd-w13-lib), then Add; on the
   phone the day's "+ Commitment" window with its last day tapped (WebKit's touches drive no drag) */
export async function runOf(p, W, from, to, tag) {
  if (W.isPhone) {
    const f = await T.file(p, W, from, null, ['fly'], null, tag, { endIso: to })
    await T.closeAll(p, W)
    return { how: 'the day\'s + Commitment window, last day tapped', made: f.made ? [f.made] : [], said: f.refused || '', pic: f.pic }
  }
  const Q = await import('./swd-w13-lib.mjs')
  const g = await Q.drag(p, W, from, to)
  if (!g.opened) return { how: 'a mouse drag on the SANS month', made: [], said: 'the window did not open; picked ' + J(g.picked), pic: await W.pic(p, tag + '-nodrag') }
  const a = await Q.add(p, W, tag)
  await T.closeAll(p, W)
  return { how: `a mouse drag on the SANS month (held: ${J(g.picked)})`, made: a.made, said: a.said, pic: a.pic }
}
/* the top bar's Undo / Redo read without pressing (its title, greyed or not) */
export const barLook = async (p, sel = '#undoBtn') => {
  const b = p.locator(sel).first()
  return { title: await b.getAttribute('title').catch(() => ''), greyed: await b.isDisabled().catch(() => 'no button'), aria: await b.getAttribute('aria-label').catch(() => '') }
}
