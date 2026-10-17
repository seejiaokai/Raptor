/* THE TRACKER BATCH (D495, 17 Oct 26) — THE WALK. Evidence: docs/handpass/2026-10-17-tracker-batch.md.
   Every step drives the built app through its own controls (trk-lib.mjs) and ASSERTS the right behaviour, so a PASS
   means correct and a re-run on a fixed build is the re-walk (bug-check order §5). Reading the store is only to check
   what a screen claims (core()). The one outside act is making the browser's storage refuse writes (scenario S) — the
   condition being shown, not a state of the app.
     HP_URL=http://localhost:4194 HP_SHOTS=… HP_OUT=… node scripts/handpass/trk-batch-walk.mjs [K,P,L,E,W,B,N,S,U]
   Scenarios: K the chart by keyboard (D980) · P a man deleted through Post out (D981) · L the landing ([TRK-REMOUNT-LANDING])
   · E nothing dropped before the chart's start · W one zoom per wheel step, one link per Connect · B the bars' words (D982)
   · N every name of the key inside the card · S no "saved" while a save has failed · U an undo stores nothing nobody made. */
import { open, login, logout, toTracker, toPage, shot, core, log, save, dlg, PHONE, DESK } from './trk-lib.mjs'

const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const L = log()
const allErrors = []
const sleep = ms => new Promise(r => setTimeout(r, ms))
const tag = s => (s === PHONE ? 'phone' : 'desk')

/* the event a ball id is, ringed by the keyboard? */
const ringOn = page => page.evaluate(() => { const w = document.querySelector('#flowSvg .kbdring'), r = w && w.querySelector('circle'); return r ? { id: w.dataset.id, n: document.querySelectorAll('#flowSvg .kbdring').length, stroke: r.getAttribute('stroke'), sw: r.getAttribute('stroke-width'), filter: getComputedStyle(r).filter } : null })
const focusIs = page => page.evaluate(() => { const a = document.activeElement; return a ? (a.id || (a.dataset && a.dataset.g ? 'grade:' + a.dataset.g : a.tagName)) : null })
const ballBox = (page, id) => page.evaluate(i => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i); const bd = document.getElementById('board'); if (!g || !bd) return null; const r = g.getBoundingClientRect(), b = bd.getBoundingClientRect(); return { inView: r.top >= b.top - 1 && r.bottom <= b.bottom + 1 && r.left >= b.left - 1 && r.right <= b.right + 1, top: r.top - b.top } }, id)
/* how far a ball's centre sits from the chart box's middle, up and down — a landing is centred (his "centralise the view
   if its possible", 9 Sep 26; the Tracker suite's CENTRED is 4px); id null = the topmost ball, the chart's first event */
const centredOff = (page, id) => page.evaluate(i => { const bd = document.getElementById('board'), b = bd.getBoundingClientRect(); const balls = [...document.querySelectorAll('#flowSvg .ball')]; const g = i ? balls.find(x => x.dataset.id === i) : balls.map(x => [x, x.getBoundingClientRect().top]).sort((a, z) => a[1] - z[1])[0][0]; const r = g.getBoundingClientRect(); return { id: g.dataset.id, off: Math.round(Math.abs((r.top + r.height / 2) - (b.top + b.height / 2))), held: Math.abs(bd.scrollTop - Math.round(bd.clientHeight / 2)) <= 1, emptyAbove: Math.round(Math.min(...balls.map(x => x.getBoundingClientRect().top)) - b.top) } }, id)
const grade = (page, id) => page.evaluate(i => window.__undoForTests().grade(i), id)
async function press(page, sel, touch) { const l = page.locator(sel).first(); if (touch) await l.tap(); else await l.click(); await sleep(300) }
/* a ball's marking pop-up, by a press on its centre (the chart scrolled to it first by its own scroll) */
async function openBall(page, id, touch) {
  await page.evaluate(i => { const bd = document.getElementById('board'), g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i); const r = g.getBoundingClientRect(), b = bd.getBoundingClientRect(); bd.scrollTop += (r.top + r.height / 2) - (b.top + b.height / 2); bd.scrollLeft += (r.left + r.width / 2) - (b.left + b.width / 2) }, id)
  await sleep(200)
  const c = await page.evaluate(i => { const r = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, id)
  if (touch) await page.touchscreen.tap(c.x, c.y); else await page.mouse.click(c.x, c.y)
  await page.waitForSelector('#pop', { timeout: 4000 }); await sleep(250)
}
async function addMember(page, cs, touch) {
  await press(page, '#addStu', touch)
  await page.waitForSelector('#dlgList .dlg-item')
  const it = page.locator('#dlgList .dlg-item', { hasText: cs }).first()
  if (touch) await it.tap(); else await it.click()
  await sleep(200)
  if (await page.locator('#dlgOk:visible').count()) await press(page, '#dlgOk', touch)
  await sleep(700)
}
async function addTyped(page, name, touch) {
  await press(page, '#addStu', touch)
  await page.waitForSelector('#dlgModal', { state: 'visible' })
  await page.locator('#dlgInput').fill(name); await press(page, '#dlgOk', touch); await sleep(600)
}
const view = async (page, v, touch) => { if (touch) await press(page, `#page-tracker button[data-view="${v}"]`, touch) }
/* the Leave War's Post out → Delete, twice, on today's cell of a man's row (as po-walk-a.mjs drives it) */
async function postOutDelete(page, pid) {
  await toPage(page, 'leavewar')
  const today = await page.evaluate(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+today.slice(5, 7) - 1]
  const m = page.locator(`[data-testid="month-${mon}"]`); if (await m.count()) { await m.first().click(); await sleep(900) }
  const cell = page.locator(`[data-testid="cell-${pid}-${today}"]`); await cell.scrollIntoViewIfNeeded(); await cell.click(); await sleep(400)
  await page.click('[data-testid="bid-postout"]'); await sleep(300)
  await page.click('[data-testid="po-delete"]'); await sleep(200)
  await page.click('[data-testid="po-confirm"]'); await sleep(300)
  await page.click('[data-testid="po-confirm"]'); await sleep(1200)
  await page.keyboard.press('Escape').catch(() => {})
  return page.evaluate(i => !!(window.PEOPLE[i] && window.PEOPLE[i].deleted), pid)
}
const rosterHas = (page, pid) => core(page, (c, pid) => c.rosterNow().some(r => r.pid === pid), pid)
const storedListHas = (page, courseId, sylId, pid) => core(page, (c, a) => { const v = c.lsRecord(`v3:${a.c}:${a.s}:roster`); let l = []; try { l = JSON.parse(v || '[]') } catch (_) {} return l.some(r => r.pid === a.pid) }, { c: courseId, s: sylId, pid })
const contrast = page => page.evaluate(() => {
  const lum = s => { const m = s.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]) }
  return [...document.querySelectorAll('.flexbar')].filter(b => b.offsetParent).map(b => { const cs = getComputedStyle(b); const a = lum(cs.color), c = lum(cs.backgroundColor); return { txt: b.textContent, bg: cs.backgroundColor, ink: cs.color, ratio: +((Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05)).toFixed(2) } })
})

/* ============ K — the chart by keyboard (D980), desktop ============ */
if (want('K')) {
  const { browser, page, errors } = await open({ size: DESK })
  /* one Tab from the control before the chart reaches it, and the next Tab leaves it — the chart is ONE stop */
  await page.locator('#hSearch').focus()
  let hops = 0, on = ''
  for (; hops < 40; hops++) { await page.keyboard.press('Tab'); on = await focusIs(page); if (on === 'board') break }
  const r0 = await ringOn(page)
  L.ok('K1 Tab reaches the chart; the ring is on its landing event, the plain blue ring, one only, no glow', on === 'board' && r0 && r0.stroke === '#1E86FF' && r0.n === 1 && r0.sw === '2' && (r0.filter === 'none' || !r0.filter), `Tabs from the search box: ${hops + 1} · ring ${JSON.stringify(r0)}`)
  await shot(page, 'K1-tab-in')
  await page.keyboard.press('Tab'); const out = await page.evaluate(() => { const a = document.activeElement; return { inChart: !!(a && a.closest && a.closest('#flowSvg')), id: a && (a.id || a.tagName) } })
  L.ok('K2 the next Tab leaves the chart — no Tab stop on its events', !out.inChart && out.id !== 'board', JSON.stringify(out))
  await page.keyboard.press('Shift+Tab'); await sleep(150)
  L.ok('K2b Shift+Tab comes back to the chart, the ring on the same event', (await focusIs(page)) === 'board' && ((await ringOn(page)) || {}).id === r0.id, JSON.stringify(await ringOn(page)))
  /* the arrows */
  const start = (await ringOn(page)).id
  await page.keyboard.press('ArrowRight'); await sleep(150); const a1 = (await ringOn(page)).id
  await page.keyboard.press('ArrowLeft'); await sleep(150); const a2 = (await ringOn(page)).id
  L.ok('K3 → goes on along a line, ← comes back to the event it needs', a1 !== start && a2 === start, `${start} → ${a1} ← ${a2}`)
  for (let i = 0; i < 14; i++) { await page.keyboard.press('ArrowDown'); await sleep(60) }
  const deep = (await ringOn(page)).id, deepBox = await ballBox(page, deep)
  L.ok('K4 ↓ fourteen times walks down the chart and the chart follows: the ringed event is in view', deep !== start && deepBox.inView, `on ${deep} · ${JSON.stringify(deepBox)}`)
  await shot(page, 'K4-down-the-chart')
  for (let i = 0; i < 14; i++) { await page.keyboard.press('ArrowUp'); await sleep(60) }
  const back = (await ringOn(page)).id
  L.ok('K5 ↑ as many times climbs back to the top rows', (await ballBox(page, back)).inView, `on ${back}`)
  /* Enter: the pop-up, the keyboard inside it on the event's grade */
  await page.keyboard.press('ArrowRight'); await sleep(150)
  const ev = (await ringOn(page)).id
  await page.keyboard.press('Enter'); await sleep(500)
  const f1 = await focusIs(page), g0 = await grade(page, ev)
  L.ok('K6 Enter opens the marking pop-up on that event, the keyboard on its grade as it is', (await page.locator('#pop').count()) === 1 && f1 === 'grade:' + (g0 || '0'), `pop on ${await page.locator('#popTitle').innerText().catch(() => '?')} · focus ${f1} · its grade ${g0}`)
  L.ok('K6b the ring stays on the event while the pop-up is up', ((await ringOn(page)) || {}).id === ev, JSON.stringify(await ringOn(page)))
  await shot(page, 'K6-enter-opens')
  await page.keyboard.press('ArrowRight'); await sleep(120)
  L.ok('K7 → inside the pop-up steps to the next grade', (await focusIs(page)) === 'grade:dco', await focusIs(page))
  let stay = true; for (let i = 0; i < 16; i++) { await page.keyboard.press('Tab'); if (!(await page.evaluate(() => !!document.activeElement.closest('#pop')))) { stay = false; break } }
  L.ok('K8 Tab goes round inside the pop-up (16 presses)', stay, String(stay))
  /* back to DCO and press it */
  await page.locator('#pop .opts button[data-g="dco"]').focus(); await page.keyboard.press('Enter'); await sleep(500)
  L.ok('K9 Enter on DCO marks it and the keyboard is back on the chart, on the same event', (await grade(page, ev)) === 'dco' && (await focusIs(page)) === 'board' && ((await ringOn(page)) || {}).id === ev, `grade ${await grade(page, ev)} · focus ${await focusIs(page)} · ring ${JSON.stringify(await ringOn(page))}`)
  await shot(page, 'K9-marked-back-on-chart')
  await page.keyboard.press('Control+z'); await sleep(500)
  L.ok('K10 Ctrl+Z takes the mark back; the chart is drawn again and the ring is still on the event', (await grade(page, ev)) === 0 && ((await ringOn(page)) || {}).id === ev, `grade ${await grade(page, ev)} · ring ${JSON.stringify(await ringOn(page))}`)
  await page.keyboard.press('Enter'); await sleep(400); await page.keyboard.press('Escape'); await sleep(400)
  L.ok('K11 Escape closes the pop-up, the keyboard back on the chart, the same event', (await page.locator('#pop').count()) === 0 && (await focusIs(page)) === 'board' && ((await ringOn(page)) || {}).id === ev, `${await focusIs(page)} · ${JSON.stringify(await ringOn(page))}`)
  /* the scenario designer's cases (17 Oct 26) */
  const depth = () => page.evaluate(() => window.__undoForTests().undo)
  await page.keyboard.press('ArrowDown'); await sleep(150)
  const evd = (await ringOn(page)).id, d0 = await depth(), gd = await grade(page, evd)
  await page.keyboard.press('Enter'); await sleep(450); await page.keyboard.press('Enter'); await sleep(450)
  L.ok('K11b Enter, Enter on an event: the second press of its own grade changes nothing — no undo step, the pop-up closes', (await depth()) === d0 && (await grade(page, evd)) === gd && (await page.locator('#pop').count()) === 0 && (await focusIs(page)) === 'board', `undo steps ${d0} → ${await depth()} · grade ${gd} → ${await grade(page, evd)}`)
  /* ✎ Edit details by keyboard */
  await page.keyboard.press('Enter'); await sleep(450)
  for (let i = 0; i < 20 && (await focusIs(page)) !== 'popEditInfo'; i++) await page.keyboard.press('Tab')
  await page.keyboard.press('Enter'); await sleep(500)
  const infoUp = await page.locator('#infoModal').evaluate(e => getComputedStyle(e).display !== 'none').catch(() => false)
  const ringAt = ((await ringOn(page)) || {}).id
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await sleep(300)
  L.ok('K11c ✎ Edit details pressed from the keyboard: the details window is up and the arrows and Enter do nothing to the chart behind it', infoUp && (await page.locator('#pop').count()) === 0 && ((await ringOn(page)) || {}).id === ringAt, `window up ${infoUp} · ring ${ringAt} → ${((await ringOn(page)) || {}).id}`)
  await shot(page, 'K11c-edit-details')
  await page.keyboard.press('Escape'); await sleep(400)
  L.ok('K11d Escape closes the details window and the keyboard is back on the chart, the same event', (await focusIs(page)) === 'board' && ((await ringOn(page)) || {}).id === evd, `${await focusIs(page)} · ${JSON.stringify(await ringOn(page))}`)
  /* the date box inside the pop-up, by keyboard: Escape closes the calendar first, then the pop-up */
  await page.keyboard.press('Enter'); await sleep(450)
  for (let i = 0; i < 20 && (await focusIs(page)) !== 'popDoneDate'; i++) await page.keyboard.press('Tab')
  await page.keyboard.press('Enter'); await sleep(450)
  const calUp = await page.locator('[data-testid="dcal-card"]').count()
  await page.keyboard.press('Escape'); await sleep(350)
  const afterOne = { cal: await page.locator('[data-testid="dcal-card"]').count(), pop: await page.locator('#pop').count() }
  await page.keyboard.press('Escape'); await sleep(350)
  L.ok('K11e Done on opened from the keyboard: the first Escape closes only its calendar, the second the pop-up — the keyboard back on the chart', calUp === 1 && afterOne.cal === 0 && afterOne.pop === 1 && (await page.locator('#pop').count()) === 0 && (await focusIs(page)) === 'board', `calendar ${calUp} · after one Escape ${JSON.stringify(afterOne)} · then ${await focusIs(page)}`)
  /* a press elsewhere closes a keyboard pop-up and the ring goes */
  await page.keyboard.press('Enter'); await sleep(450)
  await page.locator('.sidecol .card').first().click({ position: { x: 20, y: 10 } }); await sleep(400)
  L.ok('K11f a keyboard pop-up closed by a click on the side panel takes the ring with it', (await page.locator('#pop').count()) === 0 && !(await ringOn(page)), JSON.stringify(await ringOn(page)))
  /* a search, then an arrow: the keyboard starts from the event found */
  await page.fill('#hSearch', 'ACG-02'); await page.keyboard.press('Enter'); await sleep(600)
  await page.locator('#board').focus(); await sleep(200)
  L.ok('K11g after a search for ACG-02 the keyboard is on ACG-02', ((await ringOn(page)) || {}).id === 'ACG-02', JSON.stringify(await ringOn(page)))
  /* branches on screen: → ← → takes ACG-02's second branch */
  const br = []
  for (const k of ['ArrowRight', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight']) { await page.keyboard.press(k); await sleep(120); br.push((await ringOn(page)).id) }
  L.ok('K11h branches: from ACG-02, → ← → ← → walks its first, second and third branch', br[1] === 'ACG-02' && br[3] === 'ACG-02' && new Set([br[0], br[2], br[4]]).size === 3, br.join(' '))
  await shot(page, 'K11h-branch')
  await page.fill('#hSearch', ''); await page.keyboard.press('Escape'); await sleep(200)
  /* the mouse: a grade by a click — no keyboard ring */
  await page.mouse.click(5, 300); await sleep(200)
  await openBall(page, ev, false)
  await page.locator('#pop .opts button[data-g="marg"]').click(); await sleep(500)
  L.ok('K12 a grade pressed with the mouse: marked, no keyboard ring, the chart not given the focus', (await grade(page, ev)) === 'marg' && !(await ringOn(page)) && (await focusIs(page)) !== 'board', `grade ${await grade(page, ev)} · ring ${JSON.stringify(await ringOn(page))} · focus ${await focusIs(page)}`)
  await shot(page, 'K12-mouse-grade-no-ring')
  await page.keyboard.press('Control+z'); await sleep(400)
  /* Details mode: Enter shows the brief */
  await page.locator('#board').focus(); await page.keyboard.press('ArrowDown'); await sleep(150)
  await press(page, '#detailsBtn'); await page.locator('#board').focus(); await sleep(200)
  await page.keyboard.press('Enter'); await sleep(400)
  const bubble = await page.evaluate(() => { const b = document.getElementById('detailBubble'); return !!(b && getComputedStyle(b).display !== 'none' && getComputedStyle(b).visibility !== 'hidden' && b.getBoundingClientRect().width > 0) })   /* a fixed bubble has no offsetParent */
  L.ok('K13 in Details mode Enter shows the event\'s brief, and no marking pop-up', bubble && (await page.locator('#pop').count()) === 0, `bubble ${bubble}`)
  await shot(page, 'K13-details-enter')
  await press(page, '#detailsHintOff, #detailsBtn')
  /* Edit chart layout: the arrows are not the chart's */
  await press(page, '#sylMenuBtn'); await press(page, '#arrangeBtn'); await sleep(400)
  await page.locator('#board').focus(); await sleep(100)
  const beforeArr = await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#flowSvg .ball')].slice(0, 3).map(g => g.getAttribute('transform'))))
  await page.keyboard.press('ArrowDown'); await sleep(200)
  const afterArr = await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#flowSvg .ball')].slice(0, 3).map(g => g.getAttribute('transform'))))
  L.ok('K14 in Edit chart layout no ring is drawn and the arrows move nothing', !(await ringOn(page)) && beforeArr === afterArr, JSON.stringify(await ringOn(page)))
  await press(page, '#sylMenuBtn'); await press(page, '#arrangeBtn'); await sleep(400)
  /* a crew change and a search with the keyboard on the chart */
  await page.locator('#board').focus(); await page.keyboard.press('ArrowDown'); await sleep(150)
  const evc = (await ringOn(page)).id
  await page.selectOption('#activeSel', { index: 1 }); await sleep(600)
  await page.locator('#board').focus(); await sleep(150)
  /* the keyboard follows where the chart lands for the student picked (the scenario designer's 6): the next arrow starts there, never yanking the view back */
  const k15 = await ringOn(page)
  L.ok('K15 after a crew change the keyboard is on the event the chart landed on, in view', !!k15 && (await ballBox(page, k15.id)).inView, `was on ${evc}, now ${JSON.stringify(k15)}`)
  /* the fresh code read's 3 and 4: a mouse press on the chart while a keyboard pop-up is up; a Log out with one up */
  await page.locator('#board').focus(); await page.keyboard.press('Enter'); await sleep(450)
  const bb = await page.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return { x: r.left + 30, y: r.top + 30 } })
  await page.mouse.click(bb.x, bb.y); await sleep(400)
  L.ok('K16 a keyboard pop-up, then a mouse press on empty chart: the pop-up closes and no ring is left', (await page.locator('#pop').count()) === 0 && !(await ringOn(page)), JSON.stringify(await ringOn(page)))
  await page.locator('#board').focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await sleep(450)
  await logout(page); await login(page); await toTracker(page); await sleep(700)
  L.ok('K17 Log out with a keyboard pop-up up, and back in: no ring on the chart until the keyboard comes to it', !(await ringOn(page)), JSON.stringify(await ringOn(page)))
  await shot(page, 'K17-after-relogin-no-ring')
  L.note('K console/page errors', errors.join(' | '))
  allErrors.push(...errors.map(e => 'K: ' + e))
  await browser.close()
}

/* ============ P — a man deleted through Post out (D981) ============ */
if (want('P')) {
  /* P1, desktop: HEX on two courses, nothing marked; deleted while the Tracker is open; then a reload */
  {
    const { browser, page, errors } = await open({ size: DESK })
    const c1 = await core(page, c => c.coursesNow()[0].id), s1 = await core(page, c => c.curSylId())
    await addMember(page, 'HEX')
    const hexEnr = await core(page, c => (c.rosterNow().find(r => r.pid === 'rocky') || {}).id)
    await press(page, '#courseMenuBtn'); await press(page, '#addCourse'); await dlg(page, { value: 'P1SECOND' }); await sleep(900)
    const c2 = await core(page, c => c.coursesNow().find(x => x.name === 'P1SECOND').id), s2 = await core(page, c => c.curSylId())
    await addMember(page, 'HEX')
    await page.selectOption('#courseSel', { index: 1 }); await sleep(900)
    const onBoth = (await storedListHas(page, c1, s1, 'rocky')) && (await storedListHas(page, c2, s2, 'rocky'))
    L.ok('P1.1 HEX, a squadron member, on two courses (stored)', onBoth, `${c1} ${c2}`)
    await shot(page, 'P1-1-on-course')
    const marksKey = `v3:${c1}:${s1}:m:${hexEnr}`
    const marksBefore = await core(page, (c, k) => c.lsRecord(k), marksKey)
    const gone = await postOutDelete(page, 'rocky')
    L.ok('P1.2 HEX deleted through the Leave War\'s Post out', gone, String(gone))
    await toTracker(page); await sleep(900)
    const left1 = !(await storedListHas(page, c1, s1, 'rocky')), left2 = !(await storedListHas(page, c2, s2, 'rocky')), shown = await rosterHas(page, 'rocky')
    L.ok('P1.3 he has left both courses — the one on screen and the other — on screen and stored', left1 && left2 && !shown, `course 1 stored ${!left1} · course 2 stored ${!left2} · on screen ${shown}`)
    const chips = await page.locator('.c-students .chip').allInnerTexts()
    L.ok('P1.4 the Students card no longer lists him', !chips.some(t => /HEX/.test(t)), chips.join(' | '))
    const marksAfter = await core(page, (c, k) => c.lsRecord(k), marksKey)
    L.ok('P1.5 his marks record is kept, as it was (nothing of his record erased)', marksAfter === marksBefore && marksBefore != null, `before ${marksBefore} · after ${marksAfter}`)
    await shot(page, 'P1-5-after-delete')
    await page.reload(); await login(page); await toTracker(page); await sleep(900)
    L.ok('P1.6 after a reload he is still off both courses', !(await storedListHas(page, c1, s1, 'rocky')) && !(await rosterHas(page, 'rocky')), '')
    L.note('P1 console/page errors', errors.join(' | ')); allErrors.push(...errors.map(e => 'P1: ' + e))
    await browser.close()
  }
  /* P2, desktop: CASPER on the course; then the page reloaded and the delete made BEFORE the Tracker is opened again —
     the Tracker learns of it on its boot */
  {
    const { browser, page, errors } = await open({ size: DESK })
    await addMember(page, 'OUTLAW')
    const c1 = await core(page, c => c.coursesNow()[0].id), s1 = await core(page, c => c.curSylId())
    /* he is the student picked, and the last one marked */
    await openBall(page, 'ST-01', false); await press(page, '#pop .opts button[data-g="dco"]'); await sleep(500)
    const picked = await page.evaluate(() => document.getElementById('activeSel').selectedOptions[0].textContent)
    L.ok('P2.1 OUTLAW on the course (stored), picked, and the last one marked', (await storedListHas(page, c1, s1, 'casper')) && /OUTLAW/.test(picked), picked)
    await page.reload(); await login(page)
    const gone = await postOutDelete(page, 'casper')
    L.ok('P2.2 OUTLAW deleted through Post out, the Tracker not opened since the reload', gone, String(gone))
    /* from the first moment the chart is drawn: never him */
    const firstSight = []
    page.on('framenavigated', () => {})
    const watch = setInterval(async () => { try { firstSight.push(await page.evaluate(() => { const s = document.getElementById('activeSel'); return s ? [...s.options].map(o => o.textContent).join(',') : '' })) } catch (_) {} }, 25)
    await toTracker(page); await sleep(1200); clearInterval(watch)
    const sel = await page.evaluate(() => document.getElementById('activeSel').selectedOptions[0].textContent)
    L.ok('P2.3 opening the Tracker afterwards: he has left the course, on screen and stored; another student is picked', !(await rosterHas(page, 'casper')) && !(await storedListHas(page, c1, s1, 'casper')) && !/OUTLAW/.test(sel), `picked ${sel}`)
    L.ok('P2.4 not even for a moment: no sample of the Crew list since the chart came up names him', firstSight.every(t => !/OUTLAW/.test(t)), `${firstSight.length} samples`)
    await shot(page, 'P2-3-boot-after-delete')
    L.note('P2 console/page errors', errors.join(' | ')); allErrors.push(...errors.map(e => 'P2: ' + e))
    await browser.close()
  }
  /* P3, phone: HEX on the course, deleted, the Students card at the phone's width */
  {
    const { browser, page, errors } = await open({ size: PHONE, touch: true })
    await view(page, 'info', true)
    await addMember(page, 'HEX', true)
    L.ok('P3.1 phone: HEX on the course', await rosterHas(page, 'rocky'), '')
    await page.locator('.c-students').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
    await shot(page, 'P3-1-phone-on-course')
    /* the delete itself on the Leave War at a desktop's width (its phone grid draws its cells otherwise — not this change);
       the Tracker looked at on the phone */
    await view(page, 'flow', true)   /* the Tracker comes back on its chart half, where the walk's driver looks for the balls */
    await page.setViewportSize(DESK); await sleep(300)
    const gone = await postOutDelete(page, 'rocky')
    await page.setViewportSize(PHONE); await sleep(400)
    await toTracker(page); await view(page, 'info', true); await sleep(900)
    const chips = await page.locator('.c-students .chip').allInnerTexts()
    L.ok('P3.2 phone: after the delete the Students card no longer lists him', gone && !(await rosterHas(page, 'rocky')) && !chips.some(t => /HEX/.test(t)), chips.join(' | '))
    await page.locator('.c-students').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
    await shot(page, 'P3-2-phone-after-delete')
    L.note('P3 console/page errors', errors.join(' | ')); allErrors.push(...errors.map(e => 'P3: ' + e))
    await browser.close()
  }
}

/* ============ L — the landing ============ */
if (want('L')) for (const size of [DESK, PHONE]) {
  const touch = size === PHONE
  const { browser, page, errors } = await open({ size, touch })
  const deep = await page.evaluate(() => { let best = null, bd = 1e9; for (const g of document.querySelectorAll('#flowSvg .ball')) { const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(g.getAttribute('transform')); const d = Math.abs(+m[2] - 2400); if (d < bd) { bd = d; best = g.dataset.id } } return best })
  await openBall(page, deep, touch); await press(page, '#pop .opts button[data-g="dco"]', touch); await sleep(400)
  await logout(page); await login(page); await toTracker(page); await sleep(900)
  const b1 = await ballBox(page, deep)
  L.ok(`L1 ${tag(size)}: Log out and back in, the Tracker opens on the last mark (${deep}) — in view`, b1 && b1.inView, JSON.stringify(b1))
  await shot(page, `L1-${tag(size)}-relogin`)
  await toPage(page, 'editsched'); await toTracker(page); await sleep(500)
  L.ok(`L2 ${tag(size)}: another tab and back — the view is where it was (the mark still in view)`, (await ballBox(page, deep)).inView, '')
  await page.selectOption('#activeSel', { label: 'STUDENT B' }); await sleep(900)
  /* D984 (17 Oct 26, "As recommended B"): an event near the top is held at the chart's top — no empty space above the
     chart — instead of centred */
  const l3 = await centredOff(page, null)
  L.ok(`L3 ${tag(size)}: a student with nothing marked lands on the first event, at the chart's top — no empty space above it`, l3.held && l3.emptyAbove >= 0 && l3.emptyAbove < 60, JSON.stringify(l3))
  await shot(page, `L3-${tag(size)}-first-event`)
  /* a search for the first event */
  if (!touch) {
    await page.locator('#board').evaluate(b => { b.scrollTop = b.scrollHeight }); await sleep(200)
    await page.fill('#hSearch', 'ST-01'); await page.keyboard.press('Enter'); await sleep(700)
    const l4 = await centredOff(page, 'ST-01'), l4in = await ballBox(page, 'ST-01')
    L.ok('L4 desk: a search that finds ST-01 brings it in, at the chart\'s top — no empty space above it', l4in && l4in.inView && l4.held && l4.emptyAbove >= 0 && l4.emptyAbove < 60, JSON.stringify(l4))
    await page.fill('#hSearch', ''); await page.keyboard.press('Escape')
  }
  /* the member signs in on the same browser (D376 — his own place): the landing as a pick makes it */
  await logout(page); await login(page, 'u'); await toTracker(page); await sleep(900)
    /* someone new opens on the first course and its last-graded student (D376) — STUDENT A, whose last mark is the deep one */
  const l5in = await ballBox(page, deep)
  const l5 = await centredOff(page, deep)
  L.ok(`L5 ${tag(size)}: the member signs in — the Tracker opens on the last-graded student's last mark (${deep}), centred`, l5in.inView && l5.off <= 4, `${JSON.stringify(l5)} · ${deep} ${JSON.stringify(l5in)}`)
  await shot(page, `L5-${tag(size)}-member`)
  L.note(`L ${tag(size)} console/page errors`, errors.join(' | ')); allErrors.push(...errors.map(e => `L ${tag(size)}: ` + e))
  await browser.close()
}

/* ============ E — nothing dropped before the chart's start (desktop: Edit chart layout is a desk tool first) ============ */
if (want('E')) {
  const { browser, page, errors } = await open({ size: DESK })
  await press(page, '#sylMenuBtn'); await press(page, '#arrangeBtn'); await sleep(400)
  await press(page, '#fitBtn'); await sleep(400)
  const svgBox = await page.evaluate(() => { const r = document.getElementById('flowSvg').getBoundingClientRect(); return { left: r.left, top: r.top } })
  const posOf = id => page.evaluate(i => { const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec([...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i).getAttribute('transform')); return { x: +m[1] + 29, y: +m[2] + 29 } }, id)
  const ctr = id => page.evaluate(i => { const r = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, id)
  const dragTo = async (from, to) => { await page.mouse.move(from.x, from.y); await page.mouse.down(); for (let k = 1; k <= 12; k++) await page.mouse.move(from.x + (to.x - from.x) * k / 12, from.y + (to.y - from.y) * k / 12); await page.mouse.up(); await sleep(400) }
  await dragTo(await ctr('ST-01'), { x: svgBox.left + 4, y: svgBox.top + 4 })
  const p1 = await posOf('ST-01')
  L.ok('E1 a ball dropped left of and above the chart stops at its start (centre ≥ 29, 29)', p1.x >= 29 && p1.y >= 29, JSON.stringify(p1))
  await shot(page, 'E1-ball-at-start')
  /* a group: ▣ Select all, then dragged by one of them */
  await page.locator('#arrTools button', { hasText: '▣ Select' }).first().click(); await sleep(150)
  await press(page, '#selectAllBtn'); await sleep(200)
  await dragTo(await ctr('ACG-01'), { x: svgBox.left + 2, y: svgBox.top + 2 })
  const all = await page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].map(g => { const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(g.getAttribute('transform')); return [+m[1], +m[2]] }))
  L.ok('E2 the whole chart picked and dragged up and left: it stops as a whole at the chart\'s start', all.every(([x, y]) => x >= -0.01 && y >= -0.01), `least x ${Math.min(...all.map(a => a[0]))}, least y ${Math.min(...all.map(a => a[1]))}`)
  /* a line drawn from far left of the chart */
  await page.locator('#arrTools button', { hasText: '╱ Line' }).first().click(); await sleep(150)
  await page.mouse.click(svgBox.left + 3, svgBox.top + 40); await sleep(200)
  await page.mouse.click(svgBox.left + 3, svgBox.top + 160); await sleep(400)
  const linePts = await page.evaluate(() => [...document.querySelectorAll('#flowSvg .lvert, #flowSvg .lend')].map(h => [+h.getAttribute('cx'), +h.getAttribute('cy')]))
  L.ok('E3 a line drawn from the canvas\'s left edge starts at the chart\'s start or right of it', linePts.length > 0 && linePts.every(([x, y]) => x >= -0.01 && y >= -0.01), JSON.stringify(linePts.slice(0, 4)))
  await shot(page, 'E3-line-at-start')
  /* out of the editor: the chart shows ST-01 whole */
  await page.locator('#arrTools button', { hasText: '✋ Move' }).first().click()
  await press(page, '#sylMenuBtn'); await press(page, '#arrangeBtn'); await sleep(500)
  const ch = await dlgMaybe(page)
  await page.evaluate(() => { const bd = document.getElementById('board'); bd.scrollTop = 0; bd.scrollLeft = 0 }); await sleep(200)
  const vis = await page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ST-01').getBoundingClientRect(), s = document.getElementById('flowSvg').getBoundingClientRect(); return { left: g.left - s.left, top: g.top - s.top } })
  L.ok('E4 out of Edit chart layout ST-01 is drawn whole inside the chart', vis.left >= -1 && vis.top >= -1, JSON.stringify(vis))
  await shot(page, 'E4-out-of-edit')
  L.note('E console/page errors', errors.join(' | ')); allErrors.push(...errors.map(e => 'E: ' + e))
  await browser.close()
}
async function dlgMaybe(page) { if (await page.locator('#dlgModal:visible').count()) return dlg(page, { ok: true }); return null }

/* ============ W — one zoom per wheel step, one link per Connect, after balls moved ============ */
if (want('W')) {
  const { browser, page, errors } = await open({ size: DESK })
  await press(page, '#sylMenuBtn'); await press(page, '#arrangeBtn'); await sleep(400)
  const k = () => page.evaluate(() => { const m = /scale\(([\d.]+)/.exec(document.getElementById('viewport').getAttribute('transform') || ''); return m ? +m[1] : null })
  const wheel = async () => { const b = await page.evaluate(() => { const r = document.getElementById('flowSvg').getBoundingClientRect(); return { x: r.left + 200, y: r.top + 200 } }); await page.mouse.move(b.x, b.y); const k0 = await k(); await page.mouse.wheel(0, -100); await sleep(300); const k1 = await k(); await page.mouse.wheel(0, 100); await sleep(300); return k1 / k0 }
  const ctr = id => page.evaluate(i => { const r = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, id)
  const r0 = await wheel()
  const vt = () => page.evaluate(() => document.getElementById('viewport').getAttribute('transform'))
  const v0 = await vt()
  for (const id of ['ACG-03', 'ACG-04', 'ACG-05']) { const c = await ctr(id); await page.mouse.move(c.x, c.y); await page.mouse.down(); for (let i = 1; i <= 6; i++) await page.mouse.move(c.x + 3 * i, c.y + 2 * i); await page.mouse.up(); await sleep(300) }
  L.ok('W0 after three releases the view is exactly where it was (the chart is drawn again, not moved)', (await vt()) === v0, `${v0} → ${await vt()}`)
  const r3 = await wheel()
  L.ok('W1 after three balls moved, one wheel step zooms as much as before any move', Math.abs(r3 - r0) < 0.01, `×${r0.toFixed(3)} before · ×${r3.toFixed(3)} after`)
  /* → Connect: ACG-03 then ACG-07 makes ONE link */
  await page.locator('#arrTools button', { hasText: '→ Connect' }).first().click(); await sleep(150)
  const before = await page.evaluate(() => document.querySelectorAll('#flowSvg .edgehit').length)
  let c = await ctr('ACG-03'); await page.mouse.click(c.x, c.y); await sleep(250)
  const srcRing = await page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-03').querySelectorAll('circle[stroke-width="3"]').length)
  c = await ctr('ACG-07'); await page.mouse.click(c.x, c.y); await sleep(400)
  const after = await page.evaluate(() => document.querySelectorAll('#flowSvg .edgehit').length)
  L.ok('W2 after the moves, → Connect from ACG-03 to ACG-07 marks the first as the start and makes one link', srcRing === 1 && after === before + 1, `start ring ${srcRing} · links ${before} → ${after}`)
  await shot(page, 'W2-connect-after-moves')
  L.note('W console/page errors', errors.join(' | ')); allErrors.push(...errors.map(e => 'W: ' + e))
  await browser.close()
}

/* ============ B — the Currency & flex bars' words (D982) ============ */
if (want('B')) for (const size of [DESK, PHONE]) {
  const touch = size === PHONE
  const { browser, page, errors } = await open({ size, touch })
  await view(page, 'info', touch)
  const r0 = await contrast(page)
  L.ok(`B1 ${tag(size)}: no flight date — the grey bars keep white words, readable`, r0.length === 2 && r0.every(b => /255, 255, 255/.test(b.ink) && b.ratio >= 4.5), JSON.stringify(r0))
  await shot(page, `B1-${tag(size)}-grey`)
  const setDate = async (sel, daysAgo) => {
    const iso = await page.evaluate(n => { const d = new Date(Date.now() - n * 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }, daysAgo)
    await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
    await press(page, sel, touch); await page.waitForSelector('[data-testid="dcal-card"]')
    for (let i = 0; i < 4; i++) { const at = await page.locator('[data-testid="dcal"]').getAttribute('data-month'); if (at === iso.slice(0, 7)) break; await press(page, `[data-testid="dcal-${at < iso.slice(0, 7) ? 'next' : 'prev'}"]`, touch) }
    await press(page, `[data-testid="dcal-day-${iso}"]`, touch); await sleep(300)
  }
  await setDate('#lastSyll', 10); await setDate('#lastCurr', 3)
  const r1 = await contrast(page)
  L.ok(`B2 ${tag(size)}: green and amber bars — dark words, at least 4.5 : 1`, r1.length === 2 && r1.every(b => !/255, 255, 255/.test(b.ink) && b.ratio >= 4.5), JSON.stringify(r1))
  await page.locator('.flexbar').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await shot(page, `B2-${tag(size)}-green-amber`)
  await setDate('#lastSyll', 25); await setDate('#lastCurr', 9)
  const r2 = await contrast(page)
  L.ok(`B3 ${tag(size)}: red bars — dark words, at least 4.5 : 1`, r2.length === 2 && r2.every(b => !/255, 255, 255/.test(b.ink) && b.ratio >= 4.5), JSON.stringify(r2))
  await page.locator('.flexbar').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await shot(page, `B3-${tag(size)}-red`)
  L.note(`B ${tag(size)} console/page errors`, errors.join(' | ')); allErrors.push(...errors.map(e => `B ${tag(size)}: ` + e))
  await browser.close()
}

/* ============ N — every name of the key inside the card ============ */
if (want('N')) for (const size of [DESK, PHONE]) {
  const touch = size === PHONE
  const { browser, page, errors } = await open({ size, touch })
  await view(page, 'info', touch)
  const fits = () => page.evaluate(() => {
    const svg = document.querySelector('.keyball svg'), vb = svg.viewBox.baseVal
    return [...svg.querySelectorAll('text')].filter(t => t.textContent).map(t => { const b = t.getBBox(); return { name: t.textContent, left: Math.round(b.x), right: Math.round(b.x + b.width), inside: b.x >= vb.x - 0.5 && b.x + b.width <= vb.x + vb.width + 0.5 } })
  })
  await addTyped(page, 'HIS STUDENT', touch)
  const f3 = await fits()
  L.ok(`N1 ${tag(size)}: three students, the third (HIS STUDENT) on the left — every name inside the card`, f3.every(x => x.inside), JSON.stringify(f3))
  await page.locator('.keyball').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await shot(page, `N1-${tag(size)}-three`)
  await addTyped(page, 'LONGCALLSIGN', touch)
  await addTyped(page, 'A VERY LONG STUDENT NAME', touch)
  await addTyped(page, 'WWWWWWWWWW', touch)
  const f5 = await fits()
  L.ok(`N2 ${tag(size)}: six students, three long — one of wide letters (WWWWWWWWWW) — every name inside the card`, f5.every(x => x.inside), JSON.stringify(f5))
  await page.locator('.keyball').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await shot(page, `N2-${tag(size)}-six`)
  L.note(`N ${tag(size)} console/page errors`, errors.join(' | ')); allErrors.push(...errors.map(e => `N ${tag(size)}: ` + e))
  await browser.close()
}

/* ============ S — no "saved" while a save has failed ============ */
if (want('S')) for (const size of [DESK, PHONE]) {
  const touch = size === PHONE
  const { browser, page, errors } = await open({ size, touch })
  const words = () => page.evaluate(() => { const s = document.getElementById('saveStat'), b = document.querySelector('.topbar .savestat'); return { corner: s && !s.hidden && s.offsetParent ? s.textContent : '', band: b ? b.textContent.replace(/\s+/g, ' ').trim() : '' } })
  await page.evaluate(() => { window.__set = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('walk: forced', 'QuotaExceededError') } })
  await openBall(page, 'ST-02', touch); await press(page, '#pop .opts button[data-g="dco"]', touch); await sleep(2500)
  const w1 = await words()
  L.ok(`S1 ${tag(size)}: a mark that cannot be saved — Raptor says Not saved, and nothing in the Tracker says saved`, /Not saved/.test(w1.band) && !/saved/i.test(w1.corner.replace(/not saved/i, '')), JSON.stringify(w1))
  await shot(page, `S1-${tag(size)}-failed`)
  await page.evaluate(() => { Storage.prototype.setItem = window.__set })
  const retry = page.locator('.topbar .savestat button', { hasText: 'Retry' }); if (await retry.count()) { if (touch) await retry.first().tap(); else await retry.first().click() }
  await sleep(2000)
  const w2 = await words()
  L.ok(`S2 ${tag(size)}: storage back, Retry — the warning goes, and the Tracker's words are true again`, !/Not saved/.test(w2.band), JSON.stringify(w2))
  await shot(page, `S2-${tag(size)}-after-retry`)
  L.note(`S ${tag(size)} console/page errors (the forced refusal logs its own)`, errors.join(' | ')); allErrors.push(...errors.filter(e => !/forced|Quota/.test(e)).map(e => `S ${tag(size)}: ` + e))
  await browser.close()
}

/* ============ U — an undo stores nothing nobody made (desktop) ============ */
if (want('U')) {
  const { browser, page, errors } = await open({ size: DESK })
  await addTyped(page, 'UNDO ME')
  const ids = await core(page, c => ({ s: (c.rosterNow().find(r => r.name === 'UNDO ME') || {}).id, c: c.coursesNow()[0].id, syl: c.curSylId() }))
  const has = k => page.evaluate(k => localStorage.getItem('raptor:tracker/' + k) != null, k)
  const k = { p: `v3:${ids.c}:pace:${ids.s}`, l: `v3:${ids.c}:lulls:${ids.s}`, m: `v3:${ids.c}:${ids.syl}:m:${ids.s}` }
  const before = { p: await has(k.p), l: await has(k.l), m: await core(page, (c, k) => c.lsRecord(k), k.m) }
  await openBall(page, 'ST-01', false); await press(page, '#pop .opts button[data-g="dco"]'); await sleep(600)
  await press(page, '.topbar [title*="Undo"], #trUndoBtn, .topbar button[aria-label*="Undo"]'); await sleep(900)
  const after = { p: await has(k.p), l: await has(k.l), m: await core(page, (c, k) => c.lsRecord(k), k.m), g: await grade(page, 'ST-01') }
  L.ok('U1 a new student, one mark, ↶ in the top bar: the mark goes, no pace or lull list is stored, his marks record is as it was', after.g === 0 && !after.p && !after.l && after.m === before.m, `before ${JSON.stringify(before)} · after ${JSON.stringify(after)}`)
  await page.reload(); await login(page); await toTracker(page); await sleep(800)
  L.ok('U2 after a reload, still none stored', !(await has(k.p)) && !(await has(k.l)), '')
  L.note('U console/page errors', errors.join(' | ')); allErrors.push(...errors.map(e => 'U: ' + e))
  await browser.close()
}

save('trk-batch-walk' + (ONLY.length ? '-' + ONLY.join('') : ''), { rows: L.rows, errors: allErrors })
const fails = L.rows.filter(r => r.pass === false)
console.log(`\n${L.rows.filter(r => r.pass === true).length} PASS · ${fails.length} FAIL · errors: ${allErrors.length ? allErrors.join(' | ') : 'none'}`)
process.exit(fails.length ? 1 : 0)
