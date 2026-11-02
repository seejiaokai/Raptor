/* WALKER B, part 1: B1-B10 (keyboard-only on Edit Schedule, View-only Sched, mouse, phone). node ws-walk-b.mjs */
import { start, signIn, editTab, recorder, shotter, at, boardOpen, around, OUT, writeJson } from './ws-walk-b-lib.mjs'
console.log('ws-walk-b v1 part 1 (B1-B10), pictures in ' + OUT)
const { browser, page, errors } = await start()
const { rows, note } = recorder()
const shot = shotter(page)
await signIn(page)
await editTab(page)

/* snapshot of the data and the week's scroll, to prove "nothing else changes" */
const snap = () => page.evaluate(() => JSON.stringify([window.DAYS, window.INPUTS, window.SCHED]).length + '|' + (document.querySelector('#eWeek')?.scrollLeft))

/* ---------- B1 Tab / Shift+Tab to the date, by keys only ---------- */
const s0 = await snap()
await page.locator('#roleBadge').focus()
const stops = []
let reached = false
for (let i = 1; i <= 80; i++) {
  await page.keyboard.press('Tab')
  const a = await at(page)
  stops.push(`${a.tag}#${a.id}.${a.cls}${a.sbday !== null ? '[sbday=' + a.sbday + ']' : ''}`)
  if (a.sbday === '0') { reached = true; break }
}
let a = await at(page)
console.log('B1 Tab stops from the last top-bar control:', JSON.stringify(stops))
const s1 = await snap()
let pics = await shot('B1-tab-to-date-ring', await around(page, '#eWeek .day[data-day="0"] .day-head', 30))
note('B1 Tab from the top bar reaches Monday\'s date; cyan ring on it, nothing else changed', reached && a.ring && !(await boardOpen(page)) && s0 === s1, `tabs ${stops.length}; active ${JSON.stringify(a)}; data/scroll ${s0} -> ${s1}`, pics)
/* Shift+Tab goes back one stop and Tab returns */
await page.keyboard.press('Shift+Tab'); const back = await at(page)
await page.keyboard.press('Tab'); a = await at(page)
note('B1b Shift+Tab leaves the date, Tab comes back to it with its ring', a.sbday === '0' && a.ring, `shift+tab went to ${back.tag}#${back.id}.${back.cls}; back on ${JSON.stringify(a)}`)

/* ---------- B2 Enter ---------- */
await page.keyboard.press('Enter'); await page.waitForTimeout(400)
a = await at(page)
const sbday = await page.evaluate(() => window.SBDAY)
pics = await shot('B2-enter-board-open')
note('B2 Enter opens the Scheduler Board on Monday, the keys on the board', (await boardOpen(page)) && sbday === 0 && a.inBoard, `SBDAY ${sbday}; active ${JSON.stringify(a)}`, pics)

/* ---------- B3 Escape ---------- */
await page.keyboard.press('Escape'); await page.waitForTimeout(400)
a = await at(page)
pics = await shot('B3-escape-ring-back', await around(page, '#eWeek .day[data-day="0"] .day-head', 30))
note('B3 Escape closes the board; the ring is back on Monday\'s date', !(await boardOpen(page)) && a.sbday === '0' && a.ring, JSON.stringify(a), pics)

/* ---------- B4 Space, then Done by keys ---------- */
await page.keyboard.press(' '); await page.waitForTimeout(400)
const openedBySpace = await boardOpen(page)
const bdStops = []
let doneReached = false
for (let i = 1; i <= 90; i++) {
  await page.keyboard.press('Tab')
  a = await at(page)
  bdStops.push(a.id || a.cls)
  if (a.id === 'sbDone') { doneReached = true; break }
}
console.log('B4 Tab stops from the board to Done:', bdStops.length, JSON.stringify(bdStops.slice(0, 20)))
const p4a = await shot('B4a-space-board-done-focused')
await page.keyboard.press('Enter'); await page.waitForTimeout(400)
a = await at(page)
const p4b = await shot('B4b-done-ring-back', await around(page, '#eWeek .day[data-day="0"] .day-head', 30))
note('B4 Space opens the board; Tab reaches ✓ Done; Enter closes it, ring back on the date', openedBySpace && doneReached && !(await boardOpen(page)) && a.sbday === '0' && a.ring, `tabs to Done ${bdStops.length}; after: ${JSON.stringify(a)}`, p4a + ' ' + p4b)

/* ---------- B5 small menus on the board ---------- */
await page.keyboard.press('Enter'); await page.waitForTimeout(400)   // open the board again
const menus = [['block', '#sbBoard [data-dwadd]', '+ Block'], ['templates', '#sbTpl', 'Templates'], ['plans', '#schedBoard [data-planmenu]', 'plans selector'], ['stores', '#sbBoard [data-stcfg]', 'a jet\'s stores'], ['wave', '#sbBoard [data-wvadd]', '+ Wave']]
let n5 = 0
for (const [name, sel, label] of menus) {
  n5++
  const b = page.locator(sel).first()
  await b.scrollIntoViewIfNeeded()
  await b.focus()
  await page.keyboard.press('Enter'); await page.waitForTimeout(300)
  const up = await page.locator('.wavemenu').count()
  const pu = await shot(`B5-${name}-up`, await around(page, '.wavemenu', 80))
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)
  const gone = (await page.locator('.wavemenu').count()) === 0
  const kept = await boardOpen(page)
  const back = await b.evaluate(el => ({ same: el === document.activeElement, ring: el.matches(':focus-visible') }))
  const pe = await shot(`B5-${name}-escaped`, await around(page, sel, 80))
  note(`B5.${n5} ${label}: menu up (${up}); Escape closes only the menu, board stays, ring back on its button`, up === 1 && gone && kept && back.same && back.ring, `gone ${gone}; board ${kept}; focus on button ${back.same}; ring ${back.ring}`, pu + ' ' + pe)
}

/* ---------- B6 Traffic and day details over the board ---------- */
const air = page.locator('#sbBoard [data-air]').first()
await air.scrollIntoViewIfNeeded(); await air.focus()
await page.keyboard.press('Enter'); await page.waitForTimeout(300)
const airUp = await page.locator('#airpop:not([hidden])').count()
const p6a = await shot('B6a-traffic-up')
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
a = await at(page)
let p6b = await shot('B6a-traffic-escaped', await around(page, '#sbBoard [data-air]', 80))
note('B6a Traffic window over the board: Escape closes it only; keys back on its button', airUp === 1 && (await page.locator('#airpop:not([hidden])').count()) === 0 && (await boardOpen(page)) && !!a.air && a.inBoard, JSON.stringify(a), p6a + ' ' + p6b)

/* a Traffic line typed but not left */
await air.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300)
const before = await page.locator('#airBody [data-airi]').evaluateAll(bs => bs.map(b => b.value))
await page.locator('#airAdd').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300)
const mid = await page.locator('#airBody [data-airi]').evaluateAll(bs => bs.map(b => b.value))
const last = page.locator('#airBody [data-airi]').last()
await last.focus(); await page.keyboard.type('WSBTYPED')
const p6c = await shot('B6b-traffic-typed-not-left')
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
const closedTyped = (await page.locator('#airpop:not([hidden])').count()) === 0
await air.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300)
const after = await page.locator('#airBody [data-airi]').evaluateAll(bs => bs.map(b => b.value))
const p6d = await shot('B6b-traffic-reopened')
note('B6b a Traffic line typed but not left: Escape closes the window and the typed text is kept on reopening', closedTyped && mid.length === before.length + 1 && after.some(v => v.includes('WSBTYPED')), `lines before ${JSON.stringify(before)}; typed ${mid.length}; closed ${closedTyped}; reopened ${JSON.stringify(after)}`, p6c + ' ' + p6d)
await page.keyboard.press('Escape'); await page.waitForTimeout(300)

/* day details over the board */
const info = page.locator('#schedBoard .dinfobtn').first()
await info.scrollIntoViewIfNeeded(); await info.focus()
await page.keyboard.press('Enter'); await page.waitForTimeout(300)
const dayUp = await page.locator('#dayPop:not([hidden])').count()
const p6e = await shot('B6c-daydetails-up')
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
a = await at(page)
const p6f = await shot('B6c-daydetails-escaped', await around(page, '#schedBoard .dinfobtn', 80))
note('B6c day-details window over the board: Escape closes it only; keys back on its ⓘ', dayUp === 1 && (await page.locator('#dayPop:not([hidden])').count()) === 0 && (await boardOpen(page)) && a.info && a.inBoard, JSON.stringify(a), p6e + ' ' + p6f)

/* close the board with Escape, then the week's own windows */
await page.locator('#sbCal').focus(); await page.keyboard.press('Escape'); await page.waitForTimeout(400)
const wair = page.locator('#eWeek [data-air]:visible').first()
await wair.scrollIntoViewIfNeeded(); await wair.focus()
await page.keyboard.press('Enter'); await page.waitForTimeout(300)
const wUp = await page.locator('#airpop:not([hidden])').count()
const p6g = await shot('B6d-week-traffic-up')
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
note("B6d the week's own Traffic window: Escape closes it, keys back on its button", wUp === 1 && (await page.locator('#airpop:not([hidden])').count()) === 0 && (await wair.evaluate(el => el === document.activeElement)), '', p6g)
const winfo = page.locator('#eWeek .day[data-day="0"] .dinfobtn')
await winfo.scrollIntoViewIfNeeded(); await winfo.focus()
await page.keyboard.press('Enter'); await page.waitForTimeout(300)
const wdUp = await page.locator('#dayPop:not([hidden])').count()
const p6h = await shot('B6e-week-daydetails-up')
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
note("B6e the week's day-details window: Escape closes it, keys back on its ⓘ", wdUp === 1 && (await page.locator('#dayPop:not([hidden])').count()) === 0 && (await winfo.evaluate(el => el === document.activeElement)), '', p6h)

/* ---------- B7 the Tab route over a flying line's boxes in the week ---------- */
const field = (k) => page.locator(`#eWeek .day[data-day="0"] [data-txt="ff:0.0.0.${k}"]`).first()
const route = [['cs', field('cs')], ['msn', field('msn')], ['rl', field('rl')], ['br', field('br')], ['to', field('to')], ['ld', field('ld')], ['remarks fr:0.0.0.0', page.locator('#eWeek .day[data-day="0"] [data-txt="fr:0.0.0.0"]').first()]]
await route[0][1].scrollIntoViewIfNeeded()
await route[0][1].focus()
const seq = []
let okRoute = true
for (let i = 1; i < route.length; i++) {
  await page.keyboard.press('Tab')
  const hit = await route[i][1].evaluate(e => e === document.activeElement)
  const ae = await at(page)
  seq.push(`${route[i][0]}:${hit}${ae.sbday !== null ? ' ON DATE' : ''}`)
  if (!hit || ae.sbday !== null) okRoute = false
}
const p7a = await shot('B7-tab-route-remarks')
/* and back with Shift+Tab: still never on a date */
for (let i = route.length - 2; i >= 0; i--) {
  await page.keyboard.press('Shift+Tab')
  const hit = await route[i][1].evaluate(e => e === document.activeElement)
  const ae = await at(page)
  if (!hit || ae.sbday !== null) { okRoute = false; seq.push(`back ${route[i][0]}:${hit}${ae.sbday !== null ? ' ON DATE' : ''}`) }
}
note('B7 Tab route callsign > mission > brief > take-off > landing > remarks is unchanged, the date never a stop', okRoute, `forward ${seq.join(', ')}; (the rally box sits between mission and brief as in the e2e route)`, p7a)
/* where does Shift+Tab from the first box of the day go (an extra look: the date is allowed to be reached from outside the run) */
await route[0][1].focus(); await page.keyboard.press('Shift+Tab'); a = await at(page)
console.log('B7 extra: Shift+Tab from the callsign goes to', JSON.stringify(a))

/* ---------- B8 View-only Sched ---------- */
await page.evaluate(() => window.go('viewsched'))
await page.waitForTimeout(600)
const cur = await page.evaluate(() => window.CURPAGE)
await page.locator('#roleBadge').focus()
const vstops = []
let onDate = 0, inView = 0
for (let i = 1; i <= 100; i++) {
  await page.keyboard.press('Tab')
  const r = await page.evaluate(() => { const e = document.activeElement; return { tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 25), inV: !!e.closest('#vWeek'), isDt: !!e.closest('#vWeek .dt, #vWeek [data-sbday]') || e.classList.contains('dt') } })
  vstops.push(r)
  if (r.inV) inView++
  if (r.isDt) onDate++
}
const vdt = await page.evaluate(() => { const d = document.querySelector('#vWeek .day .dt'); return d ? { html: d.outerHTML.slice(0, 160), tabindex: d.getAttribute('tabindex'), role: d.getAttribute('role') } : null })
const p8 = await shot('B8-viewonly-after-100-tabs')
note('B8 View-only Sched: 100 Tabs never land on a day\'s date; its date has no tabindex / button role', cur === 'viewsched' && onDate === 0 && inView > 0 && vdt && vdt.tabindex === null && vdt.role === null, `page ${cur}; stops inside the week ${inView}; on a date ${onDate}; date markup ${JSON.stringify(vdt)}`, p8)

/* ---------- B9 mouse click on Edit Schedule's date ---------- */
await editTab(page)
await page.mouse.click(5, 500)
const dt = page.locator('#eWeek .day[data-day="1"] .dt.sb-open')
await dt.scrollIntoViewIfNeeded()
await dt.click(); await page.waitForTimeout(400)
const openedM = await boardOpen(page)
const p9a = await shot('B9a-mouse-board-open')
await page.locator('#sbDone').click(); await page.waitForTimeout(400)
a = await at(page)
const p9b = await shot('B9b-mouse-after-close-no-ring', await around(page, '#eWeek .day[data-day="1"] .day-head', 30))
note('B9 mouse click on the date opens the board; after ✓ Done by mouse the date wears no ring', openedM && !(await boardOpen(page)) && !a.ring, `active ${JSON.stringify(a)}`, p9a + ' ' + p9b)

console.log('errors:', JSON.stringify(errors))
note('B-errs desktop part: no console errors, page errors or failed requests', errors.length === 0, errors.join(' | '))
await browser.close()

/* ---------- B10 phone: a tap on the edit week's date ---------- */
const ph = await start({ width: 402, height: 874, touch: true })
const pn = recorder()
const pshot = shotter(ph.page)
await signIn(ph.page)
await editTab(ph.page)
const pdt = ph.page.locator('#eWeek .day[data-day="0"] .dt.sb-open').first()
await pdt.scrollIntoViewIfNeeded()
const pic10a = await pshot('B10a-phone-before-tap')
await pdt.tap(); await ph.page.waitForTimeout(150)
const pic10t = await pshot('B10b-phone-right-after-tap')
await ph.page.waitForTimeout(450)
const pOpen = await boardOpen(ph.page)
const pic10b = await pshot('B10c-phone-board-open')
const done = ph.page.locator('#sbDone:visible').first()
const hasDone = await done.count()
if (hasDone) await done.tap(); else await ph.page.keyboard.press('Escape')
await ph.page.waitForTimeout(450)
const pa = await at(ph.page)
const pic10d = await pshot('B10d-phone-after-close')
const ringBox = await ph.page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="0"] .dt.sb-open'); const cs = getComputedStyle(d); return { outline: cs.outlineStyle + ' ' + cs.outlineWidth, ring: d.matches(':focus-visible'), focused: d === document.activeElement } })
note('B10 phone 402x874: a tap on the edit week\'s date opens the board; after closing there is no ring', pOpen && !(await boardOpen(ph.page)) && !ringBox.ring, `Done found ${hasDone}; date state ${JSON.stringify(ringBox)}; active ${JSON.stringify(pa)}`, [pic10a, pic10t, pic10b, pic10d].join(' '))
note('B10-errs phone: no console errors, page errors or failed requests', ph.errors.length === 0, ph.errors.join(' | '))
await ph.browser.close()

writeJson('ws-walk-b-results1.json', [...rows, ...pn.rows])
const all = [...rows, ...pn.rows]
console.log(`\n${all.filter(r => r.ok).length}/${all.length} pass`)
