/* Walker E — P4b-01 .. P4b-06: the phone Scheduler Board's Desktop layout (D548). Phone only (390x844, isMobile + touch).
   Starts from the saved unpublished "everything Saturday" world. Pans with REAL touch events (CDP Input.dispatchTouchEvent). */
import * as E from './stk-E-lib.mjs'
import * as LIB from './lib.mjs'
const SZ = 'phone'
const STATE = process.env.E_STATE_DIR + `/world-${SZ}.json`
const sleep = E.sleep
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = id => !ONLY || ONLY.includes(id)

async function fresh(who = 'a') {
  const w = await E.world({ size: E.PHONE, phone: true, who, state: STATE })
  w.cdp = await w.ctx.newCDPSession(w.page)
  return w
}
async function touchSwipe(w, x0, y0, x1, y1, steps = 12) {
  const { cdp } = w
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] })
  for (let i = 1; i <= steps; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / steps, y: y0 + (y1 - y0) * i / steps }] }); await sleep(16) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await waitStill(w.page)
}
async function waitStill(page) {
  let last = '', same = 0
  for (let i = 0; i < 40 && same < 4; i++) { const cur = await page.evaluate(() => { const b = document.querySelector('#schedBoard'), s = document.querySelector('#sbBoard'), r = document.querySelector('#sbRoster'); return [b && b.scrollLeft, s && s.scrollTop, r && r.scrollTop, scrollY].map(x => Math.round(x || 0)).join(',') }); same = cur === last ? same + 1 : 0; last = cur; await sleep(120) }
}
async function openDay(page, di) {
  await E.closeBoard(page)
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') await E.nav(page, 'editsched')
  await page.evaluate(d => { const b = document.querySelector(`#eWeek [data-sbday="${d}"]`); const dd = b.closest('.day'); const sc = dd.parentElement; if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = dd.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0) }, di)
  await sleep(300)
  await page.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await page.waitForSelector('#schedBoard', { state: 'visible', timeout: 10000 }); await sleep(600)
}
const toWide = async page => { if (await page.locator('#schedBoard.sb-wide').count()) return; await page.locator('#sbMore').click(); await sleep(300); await page.locator('#sbMoreWide').click(); await sleep(900) }
const toPhone = async page => { if (!(await page.locator('#schedBoard.sb-wide').count())) return; await page.locator('#sbMore').scrollIntoViewIfNeeded().catch(() => {}); await page.locator('#sbMore').click(); await sleep(300); await page.locator('#sbMoreWide').click(); await sleep(900) }
const panLeftEdge = page => page.evaluate(() => { document.querySelector('#schedBoard').scrollLeft = 0 })
const scrollBoardTo = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); if (e) e.scrollIntoView({ block: 'start', inline: 'nearest' }); return !!e }, sel)
const scrollBoardCenter = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }); return !!e }, sel)
const boardState = page => page.evaluate(() => { const b = document.querySelector('#schedBoard'), s = document.querySelector('#sbBoard'), r = document.querySelector('#sbRoster'); return { wide: b.classList.contains('sb-wide'), day: window.SBDAY, sl: Math.round(b.scrollLeft), smax: b.scrollWidth - b.clientWidth, bst: Math.round(s ? s.scrollTop : -1), rst: Math.round(r ? r.scrollTop : -1) } })

/* ================= P4b-01 ================= */
async function p01() {
  const w = await fresh(); const { page, errors } = w; const pics = [], checks = []
  try {
    await openDay(page, 5); await toWide(page)
    await panLeftEdge(page)
    // open the folded Personal Inputs panel the way a person does (its heading toggle)
    const tog = page.locator('#sbBoard [data-pitog="5"]').first()
    if (await tog.count()) { await tog.scrollIntoViewIfNeeded(); const t = (await tog.innerText()).toLowerCase(); if (t.includes('show')) { await tog.click(); await sleep(500) } }
    const keys = await page.evaluate(() => [...document.querySelectorAll('#sbBoard [data-secmove]')].map(e => e.dataset.secmove))
    const per = []
    for (const k of keys) {
      await scrollBoardTo(page, `#sbBoard [data-secmove="${k}"]`); await sleep(350)
      const m = await page.evaluate(k => {
        const s = document.querySelector(`#sbBoard [data-secmove="${k}"]`), r = s.getBoundingClientRect(), cs = getComputedStyle(s)
        const ctl = [...s.querySelectorAll('input:not([type=hidden]),textarea,select,button,[data-bfld],[contenteditable=true],.puck,.rpuck')].find(x => { const q = x.getBoundingClientRect(); return q.width > 8 && q.height > 8 && q.left >= 0 && q.left < innerWidth - 24 && q.top >= 0 && q.bottom <= innerHeight })
        let hit = null
        if (ctl) { const q = ctl.getBoundingClientRect(); const px = Math.min(q.left + q.width / 2, innerWidth - 8), py = q.top + q.height / 2; const h = document.elementFromPoint(px, py); hit = !!h && (h === ctl || ctl.contains(h) || h.contains(ctl)) }
        return { w: Math.round(r.width), h: Math.round(r.height), disp: cs.display, vis: cs.visibility, text: (s.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160), ctl: ctl ? (ctl.dataset.bfld || ctl.id || ctl.tagName) : 'none in view', hit, rowsInside: s.querySelectorAll('input,[data-slot],.puck').length, ifld: s.querySelectorAll('[data-ifld]').length }
      }, k)
      m.key = k; per.push(m)
      pics.push(await E.pic(page, `p4b01-${SZ}-wide-${k.replace(/[^a-z0-9]/gi, '-')}`))
    }
    const bad = per.filter(m => !(m.w >= 300 && m.h >= 40 && m.disp !== 'none' && m.vis !== 'hidden' && m.text.length > 2))
    checks.push([`all ${keys.length} sections draw at a readable width (>= 300px) with content: ${keys.join(', ')}`, keys.length >= 9 && !bad.length, bad.length ? bad : per.map(m => `${m.key} ${m.w}x${m.h}`).join('; ')])
    const noHit = per.filter(m => m.ctl !== 'none in view' && m.hit !== true)
    checks.push(['in every section the first control in view is what a finger lands on', !noHit.length, noHit.length ? noHit : per.map(m => `${m.key}:${m.ctl}`).join('; ')])
    const noCtl = per.filter(m => m.ctl === 'none in view' && m.rowsInside > 0)
    checks.push(['every section that holds crew or fields offers one inside the visible left part of the screen (SANS / Unavailable are empty lists today)', !noCtl.length, { noControl: noCtl.map(m => m.key), emptyLists: per.filter(m => m.ctl === 'none in view' && !m.rowsInside).map(m => m.key + ': ' + m.text.slice(0, 50)) }])
    const inp = per.find(m => m.key.endsWith('inputs'))
    checks.push(['the Personal Inputs panel opens and shows its row', !!inp && inp.h > 70 && inp.ifld > 0, inp])
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 900)]); pics.push(await E.pic(page, 'p4b01-FAILED')) }
  E.judge('P4b-01', 'phone 390x844, Saturday built with every section populated: Desktop layout, each section scrolled into view and its first control pressed-tested', checks, pics)
  await w.browser.close()
}
/* ================= P4b-02 ================= */
async function p02() {
  const w = await fresh(); const { page, errors } = w; const pics = [], checks = []
  try {
    await openDay(page, 5); await toWide(page); await panLeftEdge(page); await sleep(300)
    pics.push(await E.pic(page, `p4b02-${SZ}-wide-left-edge`))
    const s0 = await boardState(page)
    // the way a finger would try: a swipe begun on the schedule, then one begun on the top bar
    await scrollBoardTo(page, '#sbBoard [data-secmove="5.waves"]'); await sleep(300)
    await touchSwipe(w, 340, 500, 40, 500); const sBody = await boardState(page)
    await touchSwipe(w, 340, 20, 40, 20); const sBar1 = await boardState(page)
    await touchSwipe(w, 340, 20, 40, 20); const sBar2 = await boardState(page)
    await touchSwipe(w, 340, 20, 40, 20); const sBar3 = await boardState(page)
    pics.push(await E.pic(page, `p4b02-${SZ}-wide-panned-by-top-bar`))
    // the far-right field and the Done button after panning (one swipe back from the far right so the schedule's right-hand fields are in view)
    const doneFar = await page.evaluate(() => { const q = document.querySelector('#sbDone').getBoundingClientRect(); return { x: Math.round(q.left), inView: q.left >= 0 && q.right <= innerWidth } })
    await touchSwipe(w, 60, 20, 360, 20)
    const right = await page.evaluate(() => { const els = [...document.querySelectorAll('#sbBoard input[data-bfld], #sbBoard textarea[data-bfld]')].filter(e => { const q = e.getBoundingClientRect(); return q.width > 12 && q.height > 8 && q.top > 120 && q.bottom < innerHeight - 10 && q.left >= 0 && q.right <= innerWidth }); els.sort((a, b) => b.getBoundingClientRect().left - a.getBoundingClientRect().left); const e = els[0]; if (!e) return null; const q = e.getBoundingClientRect(); return { key: e.dataset.bfld, x: q.left + q.width / 2, y: q.top + q.height / 2, left: Math.round(q.left) } })
    const done = doneFar
    let tapR = null
    if (right && right.x > 0 && right.x < 385) { await page.mouse.click(right.x, right.y); await sleep(400); tapR = await page.evaluate(() => (document.activeElement && (document.activeElement.dataset.bfld || document.activeElement.id)) || document.activeElement.tagName) }
    pics.push(await E.pic(page, `p4b02-${SZ}-wide-far-right-field-tapped`))
    await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
    // back to the left edge by swipes on the top bar, then the far-left callsign
    for (let i = 0; i < 5; i++) await touchSwipe(w, 60, 20, 360, 20)
    const sBack = await boardState(page)
    await scrollBoardCenter(page, '#sbBoard [data-bfld="ff:5.0.0.cs"]'); await sleep(600)
    const cs = await page.evaluate(() => { const e = document.querySelector('#sbBoard [data-bfld="ff:5.0.0.cs"]'); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, inView: q.left >= 0 && q.right <= innerWidth && q.top >= 0 && q.bottom <= innerHeight } })
    let tapL = null
    if (cs.inView) { const hit = await page.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h && (h.dataset.bfld || h.id || h.className.toString().slice(0, 20)) }, [cs.x, cs.y]); await page.mouse.click(cs.x, cs.y); await sleep(400); tapL = { hit, active: await page.evaluate(() => document.activeElement && (document.activeElement.dataset.bfld || document.activeElement.tagName)) } }
    pics.push(await E.pic(page, `p4b02-${SZ}-wide-far-left-callsign-tapped`))
    checks.push(['a swipe begun on the schedule body pans the Desktop layout sideways', sBody.sl > 100, { before: s0.sl, afterBodySwipe: sBody.sl, max: s0.smax }])
    checks.push(['swipes begun on the top bar pan it, each by about 275px, up to the far right (790px)', sBar1.sl > 100 && sBar3.sl >= 700, { s1: sBar1.sl, s2: sBar2.sl, s3: sBar3.sl, max: s0.smax }])
    checks.push(['a far-right field is reachable and a tap there puts the caret in it', !!right && !!tapR && String(tapR).includes(right.key.split('.')[0]), { right, tapR }])
    checks.push(['the Done button comes into view when panned right', done.inView, done])
    checks.push(['swiping back reaches the left edge and a tap on the far-left callsign puts the caret in it', sBack.sl <= 5 && tapL && /ff:5.0.0.cs/.test(tapL.active || ''), { sBack: sBack.sl, tapL }])
    // the same pan begun on the day-chip row (what a thumb on the second row of the bar does)
    await panLeftEdge(page); await sleep(300)
    const d0 = await boardState(page); await touchSwipe(w, 340, 50, 40, 50); const d1 = await boardState(page)
    pics.push(await E.pic(page, `p4b02-${SZ}-wide-after-swipe-on-day-chips`))
    checks.push(['a swipe begun on the day-chip row pans without changing the open day', d1.sl > 100 && d1.day === d0.day, { dayBefore: d0.day, dayAfter: d1.day, scrollLeft: d1.sl }])
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 900)]); pics.push(await E.pic(page, 'p4b02-FAILED')) }
  E.judge('P4b-02', 'phone 390x844, Desktop layout: REAL touch swipes (from the schedule body and from the top bar), then taps at the far-right and far-left fields', checks, pics)
  await w.browser.close()
}
/* ================= P4b-03 ================= */
async function p03() {
  const w = await fresh(); const { page, errors } = w; const pics = [], checks = []
  try {
    await openDay(page, 5); await toWide(page); await panLeftEdge(page)
    const pub1 = await LIB.publish(page, 5); await sleep(700)
    await LIB.type(page, '[data-bfld="ff:5.0.0.msn"]', 'ACM'); await sleep(500)
    const pub2 = await LIB.publish(page, 5); await sleep(900)
    const vers = await page.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
    checks.push(['Saturday published (Original) and then amended (AL1) with the sign-offs', pub1.published === true && pub2.published === true, { pub1: pub1.version, pub2: pub2.version || pub2.why, vers }])
    await panLeftEdge(page)
    await page.locator('#schedBoard [data-planmenu]').first().scrollIntoViewIfNeeded().catch(() => {})
    await page.locator('#schedBoard [data-planmenu]').first().click(); await sleep(500)
    const items = await page.locator('.wavemenu [data-planpv]').evaluateAll(es => es.map(e => ({ v: e.dataset.planpv, t: e.innerText.replace(/\s+/g, ' ').slice(0, 40) })))
    pics.push(await E.pic(page, `p4b03-${SZ}-wide-plan-menu`))
    await page.keyboard.press('Escape'); await page.mouse.click(5, 300).catch(() => {}); await sleep(300)
    const seen = []
    for (const it of items) {
      await panLeftEdge(page)
      await page.locator('#schedBoard [data-planmenu]').first().click(); await sleep(400)
      await page.locator(`.wavemenu [data-planpv="${it.v}"]`).first().click(); await sleep(900)
      const m = await page.evaluate(() => { const ed = document.querySelectorAll('#sbBoard [contenteditable="true"], #sbBoard input:not([disabled]):not([readonly]):not([type=hidden]), #sbBoard textarea:not([disabled]):not([readonly])').length; const txt = (document.querySelector('#schedBoard').innerText || '').replace(/\s+/g, ' '); const b = document.querySelector('#sbBoard').getBoundingClientRect(); const inputs = [...document.querySelectorAll('#sbBoard input, #sbBoard textarea')].map(e => e.value).join(' '); return { frozen: document.querySelectorAll('#sbBoard .pv-frozen').length, boardW: Math.round(b.width), editable: ed, hasViper: /VIPER/.test(txt + inputs), hasProg: /FAMILY DAY/.test(txt + inputs), hasNotes: /WEEKEND - NO FLYING/.test(txt + inputs), msn: (document.querySelector('#sbBoard [data-bfld="ff:5.0.0.msn"]') || {}).value, warn: (document.querySelector('#sbSide .sb-warn') || { innerText: '' }).innerText.replace(/\s+/g, ' ').slice(0, 90) } })
      m.v = it.v
      pics.push(await E.pic(page, `p4b03-${SZ}-wide-preview-${it.v}`))
      seen.push(m)
    }
    await page.locator('#schedBoard [data-golive="5"]').first().click(); await sleep(900)
    const live = await page.evaluate(() => ({ frozen: document.querySelectorAll('#sbBoard .pv-frozen').length, editable: document.querySelectorAll('#sbBoard input[data-bfld]:not([disabled]):not([readonly])').length }))
    pics.push(await E.pic(page, `p4b03-${SZ}-wide-back-on-working-copy`))
    checks.push([`the plan menu lists the issued versions (${items.map(i => i.t).join(' | ')})`, items.length >= 2, items])
    checks.push(['each issued version draws read-only (frozen, no editable fields) with its schedule and notes', seen.length >= 2 && seen.every(m => m.frozen > 0 && m.editable === 0 && m.hasViper && m.hasProg && m.hasNotes), seen])
    checks.push(['the issued versions show what each went out with: AL1 carries the amended mission ACM, Original does not', seen.length >= 2 && seen[0].msn === '' && seen[1].msn === 'ACM', seen.map(m => ({ v: m.v, missionOfLine1: m.msn }))])
    checks.push(['the board stays its full desktop width in the previews', seen.every(m => m.boardW >= 800), seen.map(m => m.boardW)])
    checks.push(['back on the working copy the board is editable again and no frozen mark remains', live.frozen === 0 && live.editable > 5, live])
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 900)]); pics.push(await E.pic(page, 'p4b03-FAILED')) }
  E.judge('P4b-03', 'phone 390x844, Desktop layout: publish Original and AL1, look at each version read-only, then back to the working copy', checks, pics)
  await w.browser.close()
}
/* ================= P4b-04 ================= */
async function p04() {
  const w = await fresh(); const { page, errors } = w; const pics = [], checks = []
  try {
    await openDay(page, 2)
    for (let i = 0; i < 4; i++) await touchSwipe(w, 200, 700, 200, 250)
    const scrolledEls = () => page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.scrollTop > 40).slice(0, 4).map(e => (e.id || e.className.toString().slice(0, 18)) + ':' + Math.round(e.scrollTop)).concat(['window:' + Math.round(scrollY)]).join(' '))
    const sc0 = await scrolledEls()
    const a = await boardState(page); pics.push(await E.pic(page, `p4b04-${SZ}-phone-wed-lower`))
    await toWide(page); const b = await boardState(page); const sc1 = await scrolledEls(); pics.push(await E.pic(page, `p4b04-${SZ}-wide-wed`))
    await toPhone(page); const c = await boardState(page); const sc2 = await scrolledEls(); pics.push(await E.pic(page, `p4b04-${SZ}-phone-again-wed`))
    // cross 820 / 821 on the Desktop layout and back
    await toWide(page)
    await page.setViewportSize({ width: 820, height: 844 }); await sleep(600); const d820 = await boardState(page); const vis820 = await page.locator('#schedBoard:visible').count(); pics.push(await E.pic(page, `p4b04-${SZ}-wide-at-820`))
    await page.setViewportSize({ width: 821, height: 844 }); await sleep(600); const d821 = await boardState(page); const vis821 = await page.locator('#schedBoard:visible').count(); pics.push(await E.pic(page, `p4b04-${SZ}-at-821`))
    await page.setViewportSize({ width: 390, height: 844 }); await sleep(600); const d390 = await boardState(page); const vis390 = await page.locator('#schedBoard:visible').count(); pics.push(await E.pic(page, `p4b04-${SZ}-back-at-390`))
    // Done from the Desktop layout (panned to the right), then again from the phone layout
    if (!d390.wide) await toWide(page)
    for (let i = 0; i < 4; i++) await touchSwipe(w, 340, 20, 40, 20)
    const doneLands = await E.lands(page.locator('#sbDone')); pics.push(await E.pic(page, `p4b04-${SZ}-wide-done-in-view`))
    await page.mouse.click(...await page.evaluate(() => { const q = document.querySelector('#sbDone').getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2] })); await sleep(900)
    const after = await page.evaluate(() => ({ page: window.CURPAGE, board: !!document.querySelector('#schedBoard:not([hidden])') && document.querySelector('#schedBoard').offsetWidth > 0 }))
    pics.push(await E.pic(page, `p4b04-${SZ}-after-done`))
    checks.push(['Wednesday stays the open day through Phone -> Desktop -> Phone', a.day === 2 && b.day === 2 && c.day === 2 && b.wide && !c.wide, { a, b, c }])
    checks.push(['the board was really scrolled down by touch before the switch (so the layout change is tried from a lower section)', sc0 !== 'window:0', { phoneScrolled: sc0, afterDesktop: sc1, backToPhone: sc2 }])
    checks.push(['across 820 / 821 / 390 px the board stays on Wednesday and is drawn (no blank, no stuck overlay)', d820.day === 2 && d821.day === 2 && d390.day === 2 && vis820 > 0 && vis821 > 0 && vis390 > 0, { d820, d821, d390, vis820, vis821, vis390 }])
    checks.push(['Done, panned into view, is what a finger lands on and returns to the schedule', doneLands === true && after.page === 'editsched' && !after.board, { doneLands, after }])
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 900)]); pics.push(await E.pic(page, 'p4b04-FAILED')) }
  E.judge('P4b-04', 'phone 390x844 (and 820 / 821): Wednesday, scrolled low, Phone <-> Desktop layout, the 820/821 crossing, Done', checks, pics)
  await w.browser.close()
}
/* ================= P4b-05 ================= */
async function p05() {
  const w = await fresh(); const { page, errors } = w; const pics = [], checks = []
  try {
    await page.setViewportSize({ width: 390, height: 568 })
    await openDay(page, 5); await toWide(page); await panLeftEdge(page)
    // the schedule scrolls by itself: swipe it, the crew list must stay put
    const s0 = await boardState(page)
    await touchSwipe(w, 200, 400, 200, 150); const s1 = await boardState(page)
    // pan right with the top bar so the crew column shows, then scroll the crew list
    for (let i = 0; i < 4; i++) await touchSwipe(w, 340, 20, 40, 20)
    const s2 = await boardState(page); pics.push(await E.pic(page, `p4b05-${SZ}-short-wide-crew-column`))
    const crewBox = await page.evaluate(() => { const q = document.querySelector('#sbRoster').getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height), sh: document.querySelector('#sbRoster').scrollHeight } })
    await touchSwipe(w, 1 * crewBox.x + 120, 480, 1 * crewBox.x + 120, 200); const s3 = await boardState(page)
    pics.push(await E.pic(page, `p4b05-${SZ}-short-wide-crew-scrolled`))
    // the schedule part still visible at the left edge: swipe it back, the crew list must not move
    const vis = await page.evaluate(() => { const q = document.querySelector('#sbBoard').getBoundingClientRect(); return { left: Math.round(q.left), right: Math.round(q.right) } })
    if (vis.right > 30) { await touchSwipe(w, Math.max(5, vis.left + 10), 300, Math.max(5, vis.left + 10), 480) }
    const s4 = await boardState(page)
    checks.push(['swiping the schedule scrolls the schedule only (crew list untouched)', s1.bst > s0.bst + 50 && s1.rst === s0.rst, { s0: [s0.bst, s0.rst], s1: [s1.bst, s1.rst] }])
    checks.push(['the crew list has its own scroll range (taller than its box) and scrolls by itself', crewBox.sh > crewBox.h + 40 && s3.rst > s2.rst + 40 && s3.bst === s2.bst, { crewBox, s2: [s2.bst, s2.rst], s3: [s3.bst, s3.rst] }])
    checks.push(['swiping the schedule again does not move the crew list', s4.rst === s3.rst, { s3: [s3.bst, s3.rst], s4: [s4.bst, s4.rst], vis }])
    // placing a crew puck into an empty seat: through the crew list, on the Desktop layout
    const empty = await page.evaluate(() => { const e = [...document.querySelectorAll('#sbBoard [data-slot]')].find(x => !x.querySelector('.puck') && /^5\.\d+\.\d+\.\d+\.[pw]$/.test(x.dataset.slot)); return e ? e.dataset.slot : null })
    let placed = 'no empty seat found'
    if (empty) { placed = await LIB.put(page, `[data-slot="${empty}"]`, ['dj', 'shaft', 'slash', 'yeti', 'snap', 'glass']); await sleep(500) }
    const landed = empty ? await page.evaluate(sl => { const e = document.querySelector(`#sbBoard [data-slot="${sl}"]`); const p = e && e.querySelector('.puck'); return p ? { who: p.dataset.person, slotInLine: e.dataset.slot, day: window.DAYS[5].waves[+sl.split('.')[1]].formations[+sl.split('.')[2]].aircraft[+sl.split('.')[3]][sl.endsWith('.p') ? 'p' : 'w'] } : null }, empty) : null
    pics.push(await E.pic(page, `p4b05-${SZ}-short-wide-puck-placed`))
    checks.push([`placing a crew puck on the Desktop layout reaches the intended seat (${empty})`, !!landed && landed.day === landed.who, { empty, placed, landed }])
    // open / close CREW on the Phone layout, then place there too
    await toPhone(page)
    let opened = 'no CREW tab found'
    const tabc = await page.evaluate(() => { const t = document.querySelector('#schedBoard .ros-tab'); if (!t) return null; const q = t.getBoundingClientRect(); return q.width > 0 ? [q.left + q.width / 2, q.top + q.height / 2] : null })
    if (tabc) {
      const sideLeft = () => page.evaluate(() => Math.round(document.querySelector('#sbRoster').getBoundingClientRect().left))
      const o0 = await sideLeft()
      await page.mouse.click(tabc[0], tabc[1]); await sleep(700); const o1 = await sideLeft(); pics.push(await E.pic(page, `p4b05-${SZ}-short-phone-crew-open`))
      const t2 = await page.evaluate(() => { const t = document.querySelector('#schedBoard .ros-tab'); const q = t.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2] })
      await page.mouse.click(t2[0], t2[1]); await sleep(700); const o2 = await sideLeft()
      opened = { closedLeft: o0, openLeft: o1, closedAgainLeft: o2 }
    }
    checks.push(['on the Phone layout the CREW tab opens and closes the crew drawer', typeof opened === 'object' && opened.openLeft < opened.closedLeft - 100 && opened.closedAgainLeft > opened.openLeft + 100, opened])
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 900)]); pics.push(await E.pic(page, 'p4b05-FAILED')) }
  E.judge('P4b-05', 'phone on a short screen 390x568, Desktop layout: swipe the schedule, swipe the crew list, place a crew puck; CREW drawer on the Phone layout', checks, pics)
  await w.browser.close()
}
/* ================= P4b-06 ================= */
async function p06() {
  const pics = [], checks = []
  const w = await fresh(); const { page, errors } = w
  try {
    await openDay(page, 5); await toWide(page)
    // close the layout through Done (panned in), then switch to the member view through the drawer
    for (let i = 0; i < 4; i++) await touchSwipe(w, 340, 20, 40, 20)
    await page.mouse.click(...await page.evaluate(() => { const q = document.querySelector('#sbDone').getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2] })); await sleep(900)
    const before = await page.evaluate(() => JSON.stringify(window.DAYS))
    await page.locator('#burger').click(); await sleep(400); await page.locator('#drawerRole').click(); await sleep(900)
    pics.push(await E.pic(page, `p4b06-${SZ}-member-view-after-admin-wide`))
    const mv = await page.evaluate(() => ({ page: window.CURPAGE, board: document.querySelector('#schedBoard') ? document.querySelector('#schedBoard').offsetWidth > 0 : false, editors: document.querySelectorAll('#page-viewsched [contenteditable="true"], #page-viewsched [data-txt], #page-viewsched [data-bfld], #page-viewsched textarea, #schedBoard:not([hidden]) [data-bfld]').length, search: !!document.querySelector('#searchV') }))
    // keyboard: tab through the page; focus must never land in the (closed) board and a typed letter changes nothing
    const focusIn = []
    for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); const f = await page.evaluate(() => { const a = document.activeElement; return a && a.closest && a.closest('#schedBoard') ? (a.dataset.bfld || a.id || a.tagName) : null }); if (f) focusIn.push(f) }
    await page.keyboard.type('zz'); await sleep(300)
    const afterTyping = await page.evaluate(() => JSON.stringify(window.DAYS))
    const hasEditDoor = await page.evaluate(() => { document.querySelector('#burger').click(); return !!document.querySelector('#drawerNav [data-page="editsched"]') && document.querySelector('#drawerNav [data-page="editsched"]').offsetParent !== null })
    pics.push(await E.pic(page, `p4b06-${SZ}-member-view-drawer`))
    checks.push(['admin closes the Desktop layout, switches to the member view: the board is gone and no editable field is on the page', !mv.board && mv.editors === 0, mv])
    checks.push(['keyboard Tab x40 never lands inside the closed board, typing changes nothing', focusIn.length === 0 && before === afterTyping, { focusIn: focusIn.slice(0, 4), unchanged: before === afterTyping }])
    checks.push(['the member view\'s drawer offers no Edit Schedule door', !hasEditDoor, hasEditDoor])
  } catch (e) { checks.push(['admin part ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 900)]); pics.push(await E.pic(page, 'p4b06-FAILED-admin')) }
  const errs1 = errors.slice()
  await w.browser.close()
  // a real member
  const m = await fresh('m')
  try {
    await m.page.locator('#burger').click(); await sleep(400)
    const door = await m.page.evaluate(() => { const d = document.querySelector('#drawerNav [data-page="editsched"]'); return !!d && d.offsetParent !== null })
    await m.page.keyboard.press('Escape')
    const board = await m.page.evaluate(() => document.querySelector('#schedBoard') ? document.querySelector('#schedBoard').offsetWidth > 0 : false)
    pics.push(await E.pic(m.page, `p4b06-${SZ}-real-member-drawer`))
    checks.push(['a real member sees no Edit Schedule door and no board', !door && !board, { door, board }])
  } catch (e) { checks.push(['member part ran', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 300)]) }
  const errs2 = m.errors.slice(); await m.browser.close()
  // a guest: the admin lets people waiting for access view the schedule, a new identity enters as a guest
  const g = await fresh(); 
  try {
    await E.nav(g.page, 'admin'); await g.page.locator('.adm-cat').first().click().catch(() => {}); await sleep(400)
    await g.page.locator('#admGuestView').setChecked(true); await sleep(500)
    await g.page.locator('#burger').click(); await sleep(300); await g.page.click('#drawerLogout'); await g.page.waitForSelector('#luser')
    await g.page.fill('#luser', 'ewalk-guest@example.test'); await g.page.fill('#lpass', 'any'); await g.page.click('#loginForm button[type=submit]'); await sleep(900)
    await g.page.fill('#accCs', 'EWALKG'); await g.page.selectOption('#accSeat', 'GND'); await g.page.locator('#accSend').click(); await g.page.waitForSelector('#accessWaiting', { timeout: 15000 }); await sleep(500)
    pics.push(await E.pic(g.page, `p4b06-${SZ}-guest-waiting-screen`))
    const gb = g.page.locator('#accGuest'); let guest = 'no guest door'
    if (await gb.count()) { await gb.click(); await sleep(1200); await g.page.addStyleTag({ content: '*{scroll-behavior:auto !important}' }).catch(() => {}); guest = await g.page.evaluate(() => ({ page: window.CURPAGE, board: document.querySelector('#schedBoard') ? document.querySelector('#schedBoard').offsetWidth > 0 : false, editors: document.querySelectorAll('[contenteditable="true"], [data-txt], [data-bfld], #page-viewsched textarea').length, editDoor: !!document.querySelector('[data-page="editsched"]') && [...document.querySelectorAll('[data-page="editsched"]')].some(e => e.offsetParent !== null) })); pics.push(await E.pic(g.page, `p4b06-${SZ}-guest-schedule`)) }
    checks.push(['a guest reads the schedule: no board, no editable field, no Edit Schedule door', typeof guest === 'object' && !guest.board && guest.editors === 0 && !guest.editDoor, guest])
  } catch (e) { checks.push(['guest part ran', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 300)]); pics.push(await E.pic(g.page, 'p4b06-FAILED-guest')) }
  const errs3 = g.errors.slice(); await g.browser.close()
  checks.push(['no console / page / 4xx errors (three sessions)', !errs1.length && !errs2.length && !errs3.length, [...errs1, ...errs2, ...errs3].slice(0, 4)])
  E.judge('P4b-06', 'phone 390x844: after the Desktop layout, admin member-view, a real member, and a guest - nothing editable behind the role change', checks, pics)
}
if (want('P4b-01')) await p01()
if (want('P4b-02')) await p02()
if (want('P4b-03')) await p03()
if (want('P4b-04')) await p04()
if (want('P4b-05')) await p05()
if (want('P4b-06')) await p06()
E.savePart('p4b-phone' + (ONLY ? '-' + ONLY.join('+') : ''))
