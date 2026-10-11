// [GROUP-INPUT-ONE-ROW] W1 (the hands, desktop 1440x900) - my own helpers. Real controls only.
import { browser, fileInput, press, csId, DESK } from './gi-lib.mjs'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

export { browser, fileInput, press, csId, DESK }
export const BASE = 'http://localhost:4180/'
export const OUT = 'docs/img/handpass/2026-10-11-group-input-one-row/w1'
mkdirSync(OUT, { recursive: true })
export const errs = []
export const ISO = '2026-07-15', DI = 2
export const FOUR = ['Drifter', 'Hunter', 'Ranger', 'Tally']
export const TITLE = 'Range safety brief'

export async function openWorld(who = 'ad', pass = 'a', viewport = DESK) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 300)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 300)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  /* read-only watcher: every note the app raises in #toastEl is logged with the page's clock, so each act can say what it raised */
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(ms => { const hit = ms.some(m => { const n = m.target; const el = n.nodeType === 1 ? n : n.parentElement; return (el && (el.id === 'toastEl' || el.closest('#toastEl'))) || [...m.addedNodes].some(x => x.id === 'toastEl') }); if (!hit) return; const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1') window.__toasts.push({ text: t.textContent, at: performance.now() }) }).observe(document.documentElement, { subtree: true, childList: true, characterData: true })
    if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
  })
  await page.goto(BASE)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })   /* the app's smooth scrolling makes every target 'not stable' for Playwright; same trick as scripts/handpass/lib.mjs */
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.waitForTimeout(500)
  return { ctx, page }
}

/* sign in again after a reload if the login card shows */
export async function reload(page) {
  await page.reload()
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForSelector('#vWeek .day, #loginForm', { state: 'attached' })
  await page.waitForTimeout(400)
  if (await page.locator('#loginForm').isVisible().catch(() => false)) {
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day')
    await page.waitForTimeout(500)
  }
}

export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); return name + '.png' }
export const shotEl = async (loc, name) => {
  try { await loc.screenshot({ path: join(OUT, name + '.png'), timeout: 8000 }) }
  catch { const b = await loc.boundingBox(); const pg = loc.page(); await pg.screenshot({ path: join(OUT, name + '.png'), clip: { x: Math.max(0, b.x), y: Math.max(0, b.y), width: Math.min(b.width, 1440), height: Math.min(b.height, 900 - Math.max(0, b.y)) } }) }
  return name + '.png'
}
export const toastMark = p => p.evaluate(() => (window.__toasts || []).length)
export const toastsSince = async (p, m) => (await p.evaluate(m => (window.__toasts || []).slice(m).map(t => t.text), m)).filter((t, i, a) => i === 0 || t !== a[i - 1]).join(' || ')
export const toast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || t.textContent || '').trim() : '' })
export const pid = (p, cs) => csId(p, cs)

/* what window.INPUTS says about one input title: people (callsigns) + times */
export const inputsOf = (p, title = TITLE) => p.evaluate(title => {
  const ts = [].concat(title).map(t => t.toLowerCase())
  const rows = window.INPUTS.filter(r => ts.includes((r.title || '').toLowerCase()))
  return { n: rows.length, people: rows.map(r => window.PEOPLE[r.person]?.cs).sort(), times: [...new Set(rows.map(r => `${r.s}-${r.e}`))], clock: [...new Set(rows.map(r => { const f = m => (m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')); return `${f(r.s)}-${f(r.e)}` }))], rmk: [...new Set(rows.map(r => r.remarks || ''))], titles: [...new Set(rows.map(r => r.title))], dates: [...new Set(rows.map(r => r.date))], grp: [...new Set(rows.map(r => JSON.stringify(r.grp || null)))] }
}, title)

/* press the top bar's Undo / Redo (the board has its own pair: #sbUndo / #sbRedo) */
export async function undoRedo(p, which) {
  const board = await p.evaluate(() => window.SBDAY != null)
  const ids = board ? [which === 'undo' ? '#sbUndo' : '#sbRedo', which === 'undo' ? '#undoBtn' : '#redoBtn'] : [which === 'undo' ? '#undoBtn' : '#redoBtn']
  for (const id of ids) {
    const b = p.locator(id).first()
    if ((await b.count()) && (await b.isVisible())) {
      if (await b.isDisabled()) return { used: id + ' (disabled)', ok: false }
      await b.click(); await p.waitForTimeout(600)
      return { used: id, ok: true }
    }
  }
  await p.keyboard.press(which === 'undo' ? 'Control+z' : 'Control+y'); await p.waitForTimeout(600)
  return { used: 'keyboard', ok: true }
}

/* a real drag with the mouse. to: a locator or {x,y}. wheel: roll the mouse wheel mid-drag until the target is in view. onUp: called straight after the button is let go */
export async function drag(p, fromLoc, to, { steps = 14, wait = 120, onUp = null, wheel = false } = {}) {
  const fb = await fromLoc.boundingBox()
  if (!fb) throw new Error('drag: no box for source')
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2
  const target = async () => { if (to.x != null) return { x: to.x, y: to.y }; const tb = await to.boundingBox(); if (!tb) throw new Error('drag: no box for target'); return { x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 } }
  await p.mouse.move(fx, fy); await p.mouse.down()
  await p.mouse.move(fx + 6, fy + 6, { steps: 3 })
  if (wheel) {
    for (let k = 0; k < 40; k++) {
      const t = await target()
      if (t.y > 140 && t.y < 800) break
      await p.mouse.wheel(0, t.y < 140 ? -300 : 300); await p.waitForTimeout(140)
      await p.mouse.move(fx + 8 + (k % 2), fy + 8)
    }
  }
  const t = await target()
  await p.mouse.move(t.x, t.y, { steps })
  await p.waitForTimeout(wait)
  await p.mouse.move(t.x + 1, t.y + 1)
  await p.waitForTimeout(wait)
  await p.mouse.up()
  let up = null
  if (onUp) up = await onUp()
  await p.waitForTimeout(550)
  return up
}

/* the landing flash: elements wearing the mark right now */
export const flashNow = p => p.evaluate(() => [...document.querySelectorAll('.lift-land')].filter(e => e.getClientRects().length).map(e => ({
  tag: e.tagName.toLowerCase(), cls: e.className.replace(/\s+/g, ' ').slice(0, 60), slot: e.getAttribute('data-slot') || e.getAttribute('data-fill') || null, text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60),
  row: (() => { const r = e.closest('.sb-arow,.pl-row') || (e.matches('.sb-arow,.pl-row') ? e : null); if (!r) return null; const rows = [...r.parentElement.querySelectorAll(':scope > .sb-arow, :scope > .pl-row')]; return { idx: rows.indexOf(r), title: (r.querySelector('textarea.ain, input.ain')?.value || r.querySelector('.nm .ntx')?.textContent || '').trim() } })() })))

/* file the fixture G4 and S1 */
export async function fileFixture(p) {
  const g4 = await fileInput(p, { type: 'Meeting', people: FOUR, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: TITLE }, false)
  const s1 = await fileInput(p, { type: 'Training', person: 'Anvil', from: ISO, to: ISO, timed: ['10:00', '11:00'] }, false)
  return { g4, s1 }
}

export const weekDay = p => p.locator('#eWeek .day:not(.peek)').nth(DI)
export const weekGround = p => p.locator('#eWeek .day:not(.peek) .sec-grnd .pl-row')
export const boardGround = p => p.locator('#schedBoard .sb-panel.grnd .sb-arow')

/* every surface's draw of the shared input: callsigns on each ground row/line */
export const readRows = (p, title = TITLE) => p.evaluate(title => {
  const ts = [].concat(title).map(t => t.toLowerCase())
  const norm = s => (s || '').trim().toLowerCase()
  const names = r => [...r.querySelectorAll('.ppl .puck .nm')].map(n => n.textContent.trim())
  const pick = (sel, name) => [...document.querySelectorAll(sel)].filter(r => ts.includes(norm(name(r)))).map(names)
  return {
    weekGround: pick('#eWeek .day:not(.peek) .sec-grnd .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    weekInputs: pick('#eWeek .day:not(.peek) .sec-inp .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    boardGround: pick('#schedBoard .sb-panel.grnd .sb-arow', r => r.querySelector('textarea.ain, input.ain')?.value),
    boardInputs: pick('#schedBoard .sb-panel.pinp .sb-arow.inprow', r => r.querySelector('.inpedit')?.textContent),
  }
}, title)
