// The keys and windows batch: the three places the BUILT app differs from the mock-up he approved — drawn on the built app
// (frozen build) with a label on each picture, at a desktop's size (1536 x 864, device scale 2), for him to rule on keep / change.
//   WALK_DIR=<frozen dist> ISR_OUT=<scratch> LOOK_URL=http://localhost:4398/ [DEP_OUT=<pictures folder>] node scripts/handpass/kw-departures.mjs
// D1  the cyan keyboard ring on the board menus' small buttons (the stores menu's pencil; the stores editor's up / down / remove)
// D2  "Jump to a date" pressed again while it is open
// D3  the OIL question's "Don't add": the keys land on "Answer OIL" (the bar the board carries over its own top bar)
// Set-up that is NOT a press: the one input's stored OIL answer is deleted through the probe bridge (the state a day made a
// holiday afterwards leaves), so that adding a man to it asks the question. Every step after that is a real press or drag.
import * as L from './isr-A-lib.mjs'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
L.SIZES.desktop[0].viewport = { width: 1536, height: 864 }
const { note, check } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const OUT = process.env.DEP_OUT || join(process.cwd(), 'docs/mock/2026-11-05-keys-windows/img/departures')
mkdirSync(OUT, { recursive: true })
const { page, tap } = await L.session('desktop', 'ad')
const CYAN = /rgb\(59, 198, 232\)/

/* a label (and optionally an arrow) drawn over the page: the app's cyan and white on a dark backing, so it reads on a phone */
async function draw(text, at, arrow) {
  await page.evaluate(([text, at, arrow]) => {
    document.querySelectorAll('[data-kwdep]').forEach(e => e.remove())
    const mk = (css, html) => { const d = document.createElement('div'); d.setAttribute('data-kwdep', ''); d.style.cssText = 'position:fixed;z-index:2147483000;pointer-events:none;' + css; d.innerHTML = html; document.body.append(d); return d }
    mk(`left:${at.x}px;top:${at.y}px;max-width:${at.w || 520}px;background:#07101c;color:#fff;border:2px solid #3bc6e8;border-radius:8px;padding:7px 12px;font:700 17px/1.25 system-ui,sans-serif;box-shadow:0 2px 10px #000a`, text)
    if (arrow) mk(`left:${arrow.x - 18}px;top:${arrow.y - 18}px;width:36px;text-align:center;font:900 ${arrow.size || 34}px/1 system-ui,sans-serif;color:#3bc6e8;text-shadow:0 0 3px #000,0 0 3px #000,0 0 6px #000`, arrow.glyph || '▼')
  }, [text, at, arrow])
}
const undraw = () => page.evaluate(() => document.querySelectorAll('[data-kwdep]').forEach(e => e.remove()))
const shot = (name, clip) => page.screenshot({ path: join(OUT, name), clip })
const rectOf = (sel) => page.evaluate(sel => { const e = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!e) throw new Error('rectOf: nothing at ' + sel); const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, sel)
const union = (...rs) => { const x = Math.min(...rs.map(r => r.x)), y = Math.min(...rs.map(r => r.y)), x2 = Math.max(...rs.map(r => r.x + r.w)), y2 = Math.max(...rs.map(r => r.y + r.h)); return { x, y, w: x2 - x, h: y2 - y } }
const clipOf = (r, m = { l: 28, t: 28, r: 28, b: 28 }) => { const x = Math.max(0, r.x - m.l), y = Math.max(0, r.y - m.t); return { x, y, width: Math.min(1536 - x, r.x + r.w + m.r - x), height: Math.min(864 - y, r.y + r.h + m.b - y) } }
const ring = () => page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const s = getComputedStyle(a); return { cls: String(a.className).slice(0, 40), title: a.getAttribute('title') || a.getAttribute('aria-label') || (a.textContent || '').trim().slice(0, 20), focusVisible: a.matches(':focus-visible'), outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, offset: s.outlineOffset } })
const focusIs = (sel) => page.evaluate(sel => !!document.activeElement && document.activeElement.matches(sel), sel)
async function tabTo(sel, max = 14, key = 'Tab') { for (let i = 0; i < max; i++) { if (await focusIs(sel)) return true; await page.keyboard.press(key); await sleep(80) } return await focusIs(sel) }

/* ---------------- D2 — Jump to a date pressed while it is open (Edit Schedule) ---------------- */
await L.go(page, 'editsched'); await sleep(300)
const calBtn = page.locator('button[aria-label="Jump to a date"]').filter({ visible: true }).first()
await page.evaluate(() => { window.__calLog = []; const n = document.getElementById('weekCal'); if (n) new MutationObserver(() => window.__calLog.push((n.hidden ? 'hidden' : 'shown') + '@' + Math.round(performance.now()))).observe(n, { attributes: true, attributeFilter: ['hidden'], childList: true }) })
await calBtn.click(); await page.waitForSelector('#weekCal:not([hidden]) .weekcal-box'); await sleep(350)
await page.mouse.move(700, 600)
const cb = await rectOf(await calBtn.elementHandle())
const topClip = { x: 0, y: 0, width: 1536, height: 560 }
const calLabel = (text) => draw(text, { x: Math.max(8, cb.x - 40), y: cb.y + cb.h + 46, w: 420 }, { x: cb.x + cb.w / 2, y: cb.y + cb.h + 24, glyph: '▲' })
await calLabel('Press this while the window is open…')
await shot('D2a-cal-open.png', topClip)
await undraw()
const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.id || String(e.className).slice(0, 40) || e.tagName) : null }, [cb.x + cb.w / 2, cb.y + cb.h / 2])
note('D2', `with the window open, what the browser finds at the calendar button's middle: ${hit}`)
const state = () => page.evaluate(() => { const n = document.getElementById('weekCal'); return !!n && !n.hidden && n.getBoundingClientRect().width > 0 })
const logOf = n => page.evaluate(n => window.__calLog.slice(n), n)
/* 1: the mouse, at the button's own place */
const logBefore = await page.evaluate(() => window.__calLog.length)
await page.mouse.click(cb.x + cb.w / 2, cb.y + cb.h / 2); await sleep(700)
const afterMouse = await state()
note('D2', `MOUSE press on the calendar button while the window is open: window open afterwards = ${afterMouse}; its hidden flag changed as ${JSON.stringify(await logOf(logBefore))}`)
/* 2: the keys: the button focused, Enter (the window put up again first if the mouse press only closed it) */
if (!afterMouse) { await calBtn.click(); await page.waitForSelector('#weekCal:not([hidden]) .weekcal-box'); await sleep(350) }
await page.mouse.move(700, 600)
const logB2 = await page.evaluate(() => window.__calLog.length)
/* a mark on the open window's box and a watch on the page: a window that closed and opened again has a NEW box (or the page saw it leave) */
await page.evaluate(() => { const b = document.querySelector('#weekCal .weekcal-box'); if (b) b.setAttribute('data-kwmark', '1'); window.__calSeen = []; new MutationObserver(ms => { for (const m of ms) { for (const n of m.removedNodes) if (n.nodeType === 1 && (n.id === 'weekCal' || n.querySelector?.('#weekCal') || n.matches?.('.weekcal-box'))) window.__calSeen.push('removed'); for (const n of m.addedNodes) if (n.nodeType === 1 && (n.id === 'weekCal' || n.querySelector?.('#weekCal') || n.matches?.('.weekcal-box'))) window.__calSeen.push('added'); if (m.type === 'attributes' && m.target.id === 'weekCal') window.__calSeen.push('attr ' + m.attributeName + '=' + (m.target.hidden ? 'hidden' : 'shown')) } }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'class'] }) })
await calBtn.focus(); await page.keyboard.press('Enter'); await sleep(700)
const keyFacts = await page.evaluate(() => ({ sameBox: !!document.querySelector('#weekCal .weekcal-box[data-kwmark]'), seen: window.__calSeen }))
note('D2', `KEYBOARD Enter: the open window's box is the same one as before = ${keyFacts.sameBox}; what the page saw happen to it: ${JSON.stringify(keyFacts.seen)}`)
const afterKey = await state()
note('D2', `KEYBOARD Enter on the calendar button (focused) while the window is open: window open afterwards = ${afterKey}; its hidden flag changed as ${JSON.stringify(await logOf(logB2))}`)
await page.mouse.move(700, 600)
const which = afterKey ? 'the keyboard press (Enter)' : (afterMouse ? 'the mouse press' : 'neither press')
note('D2', `picture D2b is taken after ${which}`)
if (afterMouse || afterKey) await calLabel('…it closes and opens again')
else await calLabel('What it did: it only closed')
await shot('D2b-cal-reopened.png', topClip)
await undraw()
await page.keyboard.press('Escape'); await sleep(250)
if (await state()) { await page.evaluate(() => document.querySelector('#weekCal .airpop-head .x')?.click()); await sleep(250) }

/* ---------------- D1 — the keyboard ring on the board menus' small buttons ---------------- */
await L.go(page, 'editsched'); await sleep(300)
await L.press(page, tap, page.locator('[data-sbday="2"]:visible'))
await page.waitForSelector('#schedBoard:not([hidden]) .sb-top'); await sleep(500)
/* what small (non-pick) buttons each board menu holds, opened by the keys */
for (const [name, sel] of [['Templates', '#sbTpl'], ['plans selector', '#schedBoard [data-planmenu]'], ['+ Block', '#sbBoard [data-dwadd]'], ['+ Wave', '#sbBoard [data-wvadd]'], ["a jet's stores", '#sbBoard [data-stcfg]']]) {
  const b = page.locator(sel).filter({ visible: true }).first()
  if (!(await b.count())) { L.notWalked('D1', `${name}: no button`); continue }
  await b.scrollIntoViewIfNeeded(); await b.focus(); await page.keyboard.press('Enter'); await sleep(300)
  const small = await page.evaluate(() => [...document.querySelectorAll('.wavemenu button, .stmenu button')].filter(x => !/(^| )wm( |$)/.test(x.className)).map(x => `${x.className}|${x.getAttribute('title') || x.textContent.trim()}`))
  note('D1', `${name}, opened by Enter: its non-pick buttons ${JSON.stringify(small)}`)
  await page.keyboard.press('Escape'); await sleep(200)
}
const stc = page.locator('#sbBoard [data-stcfg]').filter({ visible: true }).first()
if (!(await stc.count())) L.notWalked('D1', "no stores 'C' button on Wednesday's board")
else {
  await stc.scrollIntoViewIfNeeded(); await stc.focus(); await page.keyboard.press('Enter'); await sleep(350)
  note('D1', `stores menu opened by Enter; the keys are on ${JSON.stringify(await ring())}`)
  /* the pencil is the menu's first control in the page's order, before the picks: Shift+Tab from the first pick */
  const gotPen = await tabTo('.stmenu .st-pen', 14, 'Shift+Tab')
  note('D1', `Shift+Tab from the first item reached the pencil: ${gotPen}`)
  const r1 = await ring()
  check('D1', 'the keys on the stores menu pencil: it wears the cyan ring', gotPen && !!r1 && r1.focusVisible && CYAN.test(r1.outline), r1)
  const mr = union(await rectOf('.stmenu'), await rectOf('.stmenu .st-pen'))
  await draw("Keyboard ring on the menu's small buttons (not in the mock-up)", { x: Math.max(8, mr.x - 20), y: Math.max(6, mr.y - 62), w: Math.max(340, mr.w + 40) })
  await shot('D1-menu-ring.png', clipOf(mr, { l: 36, t: 76, r: 36, b: 30 }))
  await undraw()
  /* the editor: the pencil pressed by the keys */
  await page.keyboard.press('Enter'); await sleep(350)
  const inEdit = await page.evaluate(() => !!document.querySelector('.stmenu .st-elist'))
  note('D1b', `Enter on the pencil: the list editor is ${inEdit ? 'open' : 'NOT open'}; keys now on ${JSON.stringify(await ring())}`)
  if (inEdit) {
    const gotUp = await tabTo('.stmenu .st-erow:nth-child(2) .st-up', 20)
    const r2 = await ring()
    check('D1b', "Tab reaches the second row's up arrow and it wears the cyan ring", gotUp && !!r2 && r2.focusVisible && CYAN.test(r2.outline), r2)
    const er = await rectOf('.stmenu')
    await draw("Keyboard ring on the stores editor's ↑ ↓ ✕ (not in the mock-up)", { x: Math.max(8, er.x - 20), y: Math.max(6, er.y - 62), w: Math.max(340, er.w + 40) })
    await shot('D1b-stores-ring.png', clipOf(er, { l: 36, t: 76, r: 36, b: 30 }))
    await undraw()
    await page.keyboard.press('Tab'); const rd = await ring(); await page.keyboard.press('Tab'); const rx = await ring()
    note('D1b', `next Tabs: ${JSON.stringify(rd)} then ${JSON.stringify(rx)}`)
  }
  await page.keyboard.press('Escape'); await sleep(200)
}
await page.evaluate(() => document.querySelector('#schedBoard:not([hidden]) #sbDone, #schedBoard:not([hidden]) [data-sbdone]')?.click()); await sleep(400)

/* ---------------- D3 — "Don't add" on the OIL question: where the keys land ---------------- */
const men = await L.freeMen(page, 3, [5])
const iid = await L.fileOn(page, tap, '2026-07-18', { type: 'Training', people: men.slice(0, 2), from: '09:00', to: '12:00', title: 'Range brief' })
note('D3', `set-up: a Training for ${men.slice(0, 2)} filed on Sat 18 Jul through the Inputs calendar (answered Yes at its save: ${iid}); its stored OIL answer then deleted through the bridge`)
await page.evaluate(i => { const x = window.INPUTS.find(y => String(y.iid) === String(i)); delete x.oil; for (const e of x.people || []) delete e.oil }, iid)
await L.go(page, 'editsched'); await sleep(300)
await page.locator('#eWeek [data-sbday="5"]').first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
await page.waitForSelector('#schedBoard:not([hidden]) .sb-top'); await sleep(500)
const row = page.locator('#schedBoard [data-slot="g:5.0"]').first(); await row.scrollIntoViewIfNeeded()
const rb = await row.boundingBox()
const from = await page.locator('#schedBoard .puck', { hasText: /^Ace/ }).first().boundingBox()
const tx = rb.x + 300, ty = rb.y + rb.height / 2
await page.mouse.move(from.x + 20, from.y + 7); await page.mouse.down()
await page.mouse.move(from.x + 10, from.y + 20, { steps: 3 })
await page.mouse.move(tx, ty, { steps: 20 }); await page.mouse.move(tx + 1, ty + 1); await page.mouse.up(); await sleep(600)
const asked = await page.evaluate(() => ({ q: !!document.querySelector('[data-testid="oilconf"]'), no: document.querySelector('[data-testid="oilconf-cancel"]')?.textContent }))
check('D3', "dragging Ace from the crew list onto the input's row asks the OIL question with Don't add", asked.q && /Don.t add/.test(asked.no || ''), asked)
/* by the keys: Don't add focused, Enter */
await page.locator('[data-testid="oilconf-cancel"]').focus(); await page.keyboard.press('Enter'); await sleep(700)
const bar = await page.evaluate(() => { const b = document.querySelector('[data-testid="oilbar"]'); return b ? { cls: b.className, inBoardBar: !!b.closest('.sb-top'), inTopBar: !!b.closest('.topbar'), text: b.textContent } : null })
const f3 = await ring()
note('D3', `bar after Don't add: ${JSON.stringify(bar)}; keys on ${JSON.stringify(f3)}`)
check('D3', 'the keys are on "Answer OIL" with the cyan ring', !!(await focusIs('[data-testid="oilbar-answer"]')) && !!f3?.focusVisible && CYAN.test(f3.outline || ''), f3)
const bb = await rectOf('[data-testid="oilbar"]')
const sb = await rectOf('#schedBoard .sb-top')
const ab = await rectOf('[data-testid="oilbar-answer"]')
await page.mouse.move(700, 700)
const r3 = union(bb, ab)
await draw('After Don’t add, the keys land on Answer OIL', { x: Math.max(8, r3.x), y: Math.min(sb.y + sb.h + 40, r3.y + r3.h + 40), w: 480 }, { x: ab.x + ab.w / 2, y: r3.y + r3.h + 22, glyph: '▲' })
await shot('D3-answer-oil.png', clipOf(union(sb, r3), { l: 0, t: 0, r: 0, b: 110 }))
await undraw()
note('D3', `board bar rect ${JSON.stringify(sb)}, bar rect ${JSON.stringify(bb)}`)
await L.finish('kw-departures')
