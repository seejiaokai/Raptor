// W1 part A — scenarios 1-10 at 390x844 (touch). VERSION 1
import { start, openCalendarWindow, press, shot, text, rect, vis, swipeFrom, swipeOn, pass, rec, summary, errors } from './lib.mjs'
console.log('w1/a.mjs VERSION 1')
const SZ = '390x844'
const L = await start(390, 844)
const { page } = L
const month = () => text(L, '[data-testid="days-month"]')
const undo = () => page.evaluate(() => ({ undo: document.getElementById('undoBtn')?.disabled, redo: document.getElementById('redoBtn')?.disabled }))
const face = iso => page.evaluate(i => { const b = document.querySelector(`[data-testid="days-step-${i}"]`); return b ? { html: b.innerHTML.replace(/\s+/g, ' ').slice(0, 200), cls: b.className, aria: b.getAttribute('aria-label') || b.title || '' } : null }, iso)
const sameFace = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const step = async (id, fn) => { try { await fn() } catch (e) { rec(id, SZ, 'NOT WALKED', 'the script stopped: ' + String(e).split('\n')[0].slice(0, 200)); await shot(L, `s${id}-STOPPED`).catch(() => {}) } }
const gridMid = async () => { const g = await rect(L, '[data-testid="days-grid"]'); return g }

await openCalendarWindow(L)
const m0 = await month()
console.log('opens on', m0)

await step('01', async () => {
  const seenM = [m0]
  for (let i = 0; i < 3; i++) { await swipeOn(L, '[data-testid="days-grid"]', -140, 0, 0.5, 0.3); seenM.push(await month()) }
  const navs = { prev: await vis(L, '[data-testid="days-prev"]'), next: await vis(L, '[data-testid="days-next"]'), today: await vis(L, '[data-testid="days-today"]') }
  const f = await shot(L, 's01-after-three-left')
  pass('1', SZ, seenM.join(' > ') === `${m0} > November 2026 > December 2026 > January 2027` && navs.prev && navs.next && navs.today, `${seenM.join(' > ')}; arrows/Today visible ${JSON.stringify(navs)}`, f)
})
await step('02', async () => {
  const seenM = []
  for (let i = 0; i < 3; i++) { await swipeOn(L, '[data-testid="days-grid"]', 140, 0, 0.5, 0.3); seenM.push(await month()) }
  const f = await shot(L, 's02-after-three-right')
  pass('2', SZ, seenM[2] === m0, `${seenM.join(' > ')} (opened on ${m0})`, f)
})
await step('03', async () => {
  const iso = '2026-10-15'
  const before = await face(iso), u0 = await undo()
  await swipeOn(L, `[data-testid="days-step-${iso}"]`, -140, 0, 0.5, 0.5)
  const mAfter = await month(); const fMid = await shot(L, 's03-after-left-on-button')
  const during = await undo()
  await swipeOn(L, '[data-testid="days-grid"]', 140, 0, 0.5, 0.3)
  const back = await month(); const after = await face(iso), u1 = await undo()
  const f = await shot(L, 's03-back-again')
  pass('3', SZ, mAfter === 'November 2026' && back === m0 && sameFace(before, after), `slide left started on the button of ${iso}: month ${m0} -> ${mAfter}; back via right swipe ${back}; face before ${JSON.stringify(before.html.slice(0, 60))} after ${sameFace(before, after) ? 'the same' : JSON.stringify(after)}; Undo/Redo disabled: before ${JSON.stringify(u0)} during ${JSON.stringify(during)} after ${JSON.stringify(u1)}`, f)
})
await step('04', async () => {
  const mA = await month()
  await swipeOn(L, '[data-testid="days-grid"]', -30, 0, 0.5, 0.4)
  const m1 = await month(); const f1 = await shot(L, 's04-short-slide')
  await swipeOn(L, '[data-testid="days-grid"]', -30, 130, 0.5, 0.3)
  const m2 = await month(); const f2 = await shot(L, 's04-mostly-down')
  const sy = await page.evaluate(() => { const b = document.querySelector('.win-body'); return b ? b.scrollTop : null })
  pass('4', SZ, m1 === mA && m2 === mA, `month before ${mA}; after 30px sideways ${m1}; after mostly-down (dx -30, dy +130) ${m2}; win-body scrollTop ${sy}`, f2)
})
await step('05', async () => {
  const mA = await month()
  /* a control tap, no slide, on a neighbour that starts with the same face */
  const ctrl = '2026-10-22', tgt = '2026-10-21'
  const c0 = await face(ctrl), t0 = await face(tgt)
  await page.locator(`[data-testid="days-step-${ctrl}"]`).tap(); await page.waitForTimeout(400)
  const c1 = await face(ctrl)
  await swipeOn(L, '[data-testid="days-grid"]', -140, 0, 0.5, 0.3)
  const mN = await month()
  await swipeOn(L, '[data-testid="days-grid"]', 140, 0, 0.5, 0.3)
  const mB = await month()
  await page.waitForTimeout(40)
  await page.locator(`[data-testid="days-step-${tgt}"]`).tap(); await page.waitForTimeout(400)
  const t1 = await face(tgt)
  const f = await shot(L, 's05-after-slide-slide-tap')
  const u = await undo()
  const oneChange = !sameFace(t0, t1) && sameFace(c1, t1) && sameFace(c0, t0)
  pass('5', SZ, mN === 'November 2026' && mB === mA && oneChange, `slides ${mA} -> ${mN} -> ${mB}; control tap on ${ctrl}: ${JSON.stringify(c0.html.slice(0, 50))} -> ${JSON.stringify(c1.html.slice(0, 50))}; the tap right after the slides on ${tgt}: ${JSON.stringify(t0.html.slice(0, 50))} -> ${JSON.stringify(t1.html.slice(0, 50))}; same result as the control: ${sameFace(c1, t1)}; Undo/Redo disabled ${JSON.stringify(u)}`, f)
})
await step('06', async () => {
  const mA = await month()
  const w0 = await rect(L, '[data-testid="win-days"]'), bar0 = await rect(L, '[data-testid="win-days"] .win-bar')
  /* start the slide on the bar's title text, away from the close button */
  const x0 = bar0.l + 120, y0 = bar0.t + bar0.h / 2
  await swipeFrom(L, x0, y0, -140, 0)
  const m1 = await month(); const w1 = await rect(L, '[data-testid="win-days"]'), bar1 = await rect(L, '[data-testid="win-days"] .win-bar')
  const f1 = await shot(L, 's06-after-left-on-bar')
  await swipeFrom(L, bar1.l + 120, bar1.t + bar1.h / 2, 140, 0)
  const m2 = await month(); const w2 = await rect(L, '[data-testid="win-days"]')
  const f2 = await shot(L, 's06-after-right-on-bar')
  pass('6', SZ, m1 === mA && m2 === mA, `month ${mA} -> after left on the bar ${m1} -> after right ${m2}; the window box before ${JSON.stringify(w0)} after left ${JSON.stringify(w1)} after right ${JSON.stringify(w2)} (the bar itself: ${JSON.stringify(bar0)} -> ${JSON.stringify(bar1)})`, f1)
})
await step('07', async () => {
  const mA = await month()
  await swipeOn(L, '[data-testid="days-wd-3"]', -140, 0, 0.5, 0.5)
  const m1 = await month(); const every = await vis(L, '[data-testid="win-every"]')
  const f = await shot(L, 's07-after-left-on-THU')
  pass('7', SZ, m1 !== mA && !every, `month ${mA} -> ${m1}; "Every ..." window open: ${every}`, f)
  await swipeOn(L, '[data-testid="days-grid"]', 140, 0, 0.5, 0.3)
})
await step('08', async () => {
  const mA = await month()
  const win = await rect(L, '[data-testid="win-days"]'), g = await rect(L, '[data-testid="days-grid"]')
  const x0 = win.l + win.w / 2 + 70, y0 = win.b - 24
  const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.getAttribute('data-testid') || e.className || e.tagName) : null }, [x0, y0])
  await swipeFrom(L, x0, y0, -140, 0)
  const m1 = await month(); const f = await shot(L, 's08-after-left-in-room')
  await swipeFrom(L, x0, y0, 140, 0)
  const m2 = await month()
  pass('8', SZ, m1 !== mA && m2 === mA, `grid bottom ${g.b}, window bottom ${win.b}; finger at y=${y0} (element there: ${hit}); month ${mA} -> ${m1} -> back ${m2}`, f)
})
await step('09', async () => {
  const mA = await month()
  await press(L, '[data-testid="days-tab-holidays"]')
  const y0 = await text(L, '[data-testid="hol-year"]')
  const read = async () => ({ year: await text(L, '[data-testid="hol-year"]'), form: await page.evaluate(() => document.querySelectorAll('[data-testid^="win-"]').length), wins: await page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].map(e => e.getAttribute('data-testid')).filter(t => !t.endsWith('-x')).join(',')) })
  await swipeOn(L, '[data-testid="hol-list"]', -140, 0, 0.5, 0.5, 0)
  const a = await read(); const fa = await shot(L, 's09-left-on-list')
  await swipeOn(L, '[data-testid="hol-list"]', 140, 0, 0.5, 0.5, 0)
  const b = await read()
  /* start a slide ON a holiday's line */
  const line = await page.evaluate(() => { const b = document.querySelector('[data-testid="hol-list"] button'); const r = b.getBoundingClientRect(); return { t: b.innerText.replace(/\s+/g, ' ').slice(0, 30), x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await swipeFrom(L, line.x, line.y, -140, 0)
  const c = await read(); const fc = await shot(L, 's09-left-on-holiday-line')
  await swipeOn(L, '[data-testid="hol-add"]', 140, 0, 0.5, 0.5)
  const d = await read(); const fd = await shot(L, 's09-right-on-plus-add')
  /* the room under the list */
  const win = await rect(L, '[data-testid="win-days"]'), list = await rect(L, '[data-testid="hol-list"]')
  const xr = win.l + win.w / 2, yr = win.b - 24
  await swipeFrom(L, xr, yr, -140, 0)
  const e = await read(); const fe = await shot(L, 's09-left-in-room-under-list')
  await swipeFrom(L, xr, yr, 140, 0)
  const f2 = await read()
  await press(L, '[data-testid="days-tab-month"]')
  const mB = await month()
  const ok = a.year === String(+y0 + 1) && b.year === y0 && !a.wins.includes('every') && c.year !== b.year && d.year !== c.year && e.year !== f2.year && f2.year === d.year && mB === mA
  pass('9', SZ, ok, `year ${y0}; left on the list -> ${a.year}; right -> ${b.year}; left starting on the holiday line "${line.t}" -> ${c.year}; right starting on "+ Add" -> ${d.year}; left in the room under the list (list bottom ${list.b}, window bottom ${win.b}, finger y ${yr}) -> ${e.year}; right there -> ${f2.year}; windows open after each: ${[a, b, c, d, e, f2].map(x => x.wins || 'none').join(' | ')}; Month tab afterwards ${mB} (left on ${mA})`, fc)
})
await step('10', async () => {
  const mA = await month()
  await press(L, '[data-testid="days-wd-3"]')
  await page.waitForSelector('[data-testid="win-every"]')
  const e0 = await rect(L, '[data-testid="win-every"]'), snap0 = await page.evaluate(() => ({ from: document.querySelector('[data-testid="every-from"]').innerText, says: document.querySelector('[data-testid="every-says"]').innerText.slice(0, 60) }))
  const bar = await rect(L, '[data-testid="win-every"] .win-bar')
  await swipeOn(L, '[data-testid="every-says"]', -160, 0, 0.5, 0.5)
  const m1 = await month(), e1 = await rect(L, '[data-testid="win-every"]'), snap1 = await page.evaluate(() => ({ from: document.querySelector('[data-testid="every-from"]').innerText, says: document.querySelector('[data-testid="every-says"]').innerText.slice(0, 60) }))
  const fa = await shot(L, 's10-after-left-on-every-window')
  await swipeOn(L, '[data-testid="every-from"]', 160, 0, 0.5, 0.5)
  const m2 = await month(), snap2 = await page.evaluate(() => ({ from: document.querySelector('[data-testid="every-from"]').innerText, open: !!document.querySelector('[data-testid="dcal-card"]') }))
  const fb = await shot(L, 's10-after-right-on-from-box')
  pass('10', SZ, m1 === mA && m2 === mA, `month behind ${mA} -> after left on the sentence ${m1} -> after right on the From box ${m2}; the window box ${JSON.stringify(e0)} -> ${JSON.stringify(e1)}; contents before ${JSON.stringify(snap0)} after ${JSON.stringify(snap1)} then ${JSON.stringify(snap2)}`, fa)
  await page.waitForTimeout(200)
  if (await vis(L, '[data-testid="dcal-card"]')) await page.mouse.click(4, 4)
  await page.waitForTimeout(250)
  if (await vis(L, '[data-testid="every-cancel"]')) await press(L, '[data-testid="every-cancel"]')
})
console.log('\nRESULTS_JSON ' + JSON.stringify((await import('./lib.mjs')).results))
summary('a')
await L.browser.close()
