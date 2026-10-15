/* MOCK-UP for [INPUT-NEW-DEFAULTS] (15 Oct 26) — drawn on the real built page before anything is built (D853).
   Two questions, each "today" beside the proposal, at his phone's size (390 x 844, 3x) and a desktop's (1440 x 900, 2x):
   PENCIL (D918 — "an edit pencil icon beside the title to indicate that people can edit it"): a NEW input opened from a
     day on the Inputs calendar, its kind changed to Event (a real pick in the Type list — a kind that takes a title, D716).
       P1 — the agent's pick: a pencil INSIDE the title box at its right end, the box's own grey; the typed words stop
            short of it (the box's right padding grows by the pencil's room). Drawn in: one SVG in the app's line-icon
            style (ui/icons.tsx — stroke currentColor, round caps), the box's own --ink-3 grey; nothing else restyled.
       P2 — the other way: the pencil OUTSIDE, beside the box, as a small square button the box's height; the box
            shortens by it. Drawn in: the same SVG inside a clone of the window's own Cancel button, squared.
   ORDER (D913 drawing A, reopened by D916 — "move the time and remarks above the calendar"): a NEW input opened from a
     run of two days picked on the Inputs calendar (15–16 Oct, picked by the keyboard's Shift+arrow — the same run a drag
     makes), its kind set to OL as D917 will open it, and again to Event (real picks). A — the When and Remarks blocks MOVED above the
     Dates block (nodes moved, nothing restyled).
   Every picture carries a dashed orange box round the part the question is about — the marker only, not the design.
   Which part gives way when the letters are wider (his iPhone's font is wider than this browser's): in P1 the title's
   words — they stop at the pencil and scroll inside the box as they do today; the pencil never moves. In P2 the box
   shortens; the pencil never wraps to a line of its own.
   usage: node scripts/handpass/mock-input-defaults.mjs [baseURL] [outDir] — the served build (preview_start raptor-walk) */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-15-input-new-defaults'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const SIZES = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
}
const res = {}
const errors = []

async function signedIn(size) {
  const ctx = await b.newContext({ baseURL: base, ...SIZES[size] })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(size + ': ' + e.message))
  p.on('console', m => { if (m.type() === 'error') errors.push(size + ': ' + m.text()) })
  await p.goto('/'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  await p.evaluate(() => window.go('inputs')); await p.waitForFunction(() => window.CURPAGE === 'inputs'); await p.waitForTimeout(400)
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 9 - (+year * 12 + MONTHS.findIndex(x => name.startsWith(x)))
    if (!d) break
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  return { ctx, p }
}
const win = '[data-testid="win-inputedit"]'
/* the NEW input's window from one day: the day opened by a tap (a click on a desktop), then its own "+ Input" */
async function newFromDay(p, size) {
  const day = p.locator('#inpCal [data-icday="2026-10-15"]')
  if (size === 'phone') await day.tap(); else await day.click()
  await p.waitForSelector('#icPopAdd'); await p.waitForTimeout(250)
  await p.locator('#icPopAdd').click()
  await p.waitForSelector(win + ' #inpEditType'); await p.waitForTimeout(350)
}
/* the NEW input's window from a run of two days: Shift+→ stretches the keyboard's run, Enter files "+ Input" for it */
async function newFromRun(p) {
  await p.locator('#inpCal [data-icday="2026-10-15"]').focus()
  await p.keyboard.press('Shift+ArrowRight'); await p.waitForTimeout(150)
  await p.keyboard.press('Enter')
  await p.waitForSelector(win + ' #inpEdCal'); await p.waitForTimeout(350)
}
const pickType = (p, t) => p.selectOption(win + ' #inpEditType', t).then(() => p.waitForTimeout(250))
const fieldOf = (p, word) => p.evaluateHandle(([w, sel]) => [...document.querySelectorAll(sel + ' .inped-f')]
  .find(f => (f.querySelector('.inped-k')?.textContent || '').trim() === w), [word, win])
const measure = p => p.evaluate(sel => {
  const box = document.querySelector(sel), body = box.querySelector('.win-body') || box
  const top = w => { const k = [...box.querySelectorAll('.inped-k')].find(e => e.textContent.trim() === w); return k ? Math.round(k.getBoundingClientRect().top) : null }
  const t = box.querySelector('#inpEditOwnTitle'), pen = box.querySelector('[data-mock="pencil"]')
  return { type: box.querySelector('#inpEditType')?.value, title: top('Title'), dates: top('Dates'), when: top('When'), remarks: top('Remarks'),
    foot: Math.round(box.getBoundingClientRect().bottom), screen: innerHeight, scrolls: body.scrollHeight > body.clientHeight + 1,
    titleBox: t ? Math.round(t.getBoundingClientRect().width) + 'x' + Math.round(t.getBoundingClientRect().height) : null,
    pencil: pen ? Math.round(pen.getBoundingClientRect().width) + 'x' + Math.round(pen.getBoundingClientRect().height) : null }
}, win)
/* the marker: a dashed orange box round the elements named, laid over the page (pointer-events off), redrawn last */
const mark = (p, handles) => p.evaluate(els => {
  document.querySelectorAll('[data-mock="marker"]').forEach(e => e.remove())
  const rs = els.filter(Boolean).map(e => e.getBoundingClientRect())
  if (!rs.length) throw new Error('premise gone: nothing to mark')
  const l = Math.min(...rs.map(r => r.left)) - 5, t = Math.min(...rs.map(r => r.top)) - 5
  const r = Math.max(...rs.map(r => r.right)) + 5, bt = Math.max(...rs.map(r => r.bottom)) + 5
  const m = document.createElement('div'); m.setAttribute('data-mock', 'marker')
  m.style.cssText = `position:fixed;left:${l}px;top:${t}px;width:${r - l}px;height:${bt - t}px;border:2px dashed #ff8a1c;border-radius:10px;pointer-events:none;z-index:2147483647`
  document.body.appendChild(m)
}, handles)
const PEN_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'
async function drawPencil(p, mode) {
  await p.evaluate(([mode, svg, sel]) => {
    const t = document.querySelector(sel + ' #inpEditOwnTitle'), like = document.querySelector(sel + ' #inpEditCancel')
    if (!t || !like) throw new Error('premise gone: no title box or no Cancel to copy')
    const h = t.getBoundingClientRect().height
    const wrap = document.createElement('span'); wrap.setAttribute('data-mock', 'wrap')
    t.parentElement.insertBefore(wrap, t); wrap.appendChild(t)
    if (mode === 'P1') {
      wrap.style.cssText = 'position:relative;display:block'
      t.style.paddingRight = '36px'
      const pen = document.createElement('span'); pen.setAttribute('data-mock', 'pencil'); pen.innerHTML = svg
      pen.style.cssText = `position:absolute;right:1px;top:1px;width:34px;height:${h - 2}px;display:flex;align-items:center;justify-content:center;color:var(--ink-3);pointer-events:none`
      wrap.appendChild(pen)
    } else {
      wrap.style.cssText = 'display:flex;gap:8px;align-items:stretch'
      t.style.flex = '1 1 auto'; t.style.minWidth = '0'
      const btn = like.cloneNode(false); btn.removeAttribute('id'); btn.setAttribute('data-mock', 'pencil'); btn.innerHTML = svg
      btn.style.cssText = `width:${Math.round(h)}px;min-width:${Math.round(h)}px;height:${Math.round(h)}px;padding:0;display:flex;align-items:center;justify-content:center;flex:0 0 auto`
      wrap.appendChild(btn)
    }
  }, [mode, PEN_SVG, win])
}

for (const size of ['phone', 'desk']) {
  /* PENCIL — today, P1, P2 */
  for (const mode of ['today', 'P1', 'P2']) {
    const { ctx, p } = await signedIn(size)
    await newFromDay(p, size)
    res[`${size}-open-type`] = await p.locator(win + ' #inpEditType').inputValue()
    await pickType(p, 'Event')
    if (mode !== 'today') await drawPencil(p, mode)
    await p.waitForTimeout(200)
    const f = await fieldOf(p, 'Title')
    if (!(await f.evaluate(x => !!x))) throw new Error('premise gone: no Title field for Event')
    await mark(p, [f])
    res[`pen-${size}-${mode}`] = await measure(p)
    await p.screenshot({ path: `${out}/pen-${size}-${mode}.png` })
    const r = await f.evaluate(x => { const q = x.getBoundingClientRect(); return { x: q.left - 14, y: q.top - 14, width: q.width + 28, height: q.height + 28 } })
    await p.screenshot({ path: `${out}/pen-${size}-${mode}-close.png`, clip: r })
    await ctx.close()
  }
  /* ORDER — today and A, for the kind OL as D917 will open it, and for Event (a commitment: a title, and hours) */
  for (const kind of ['OL', 'Event']) for (const mode of ['today', 'A']) {
    const { ctx, p } = await signedIn(size)
    await newFromRun(p)
    await pickType(p, kind)
    if (mode === 'A') {
      const dates = await fieldOf(p, 'Dates'), when = await fieldOf(p, 'When'), rmk = await fieldOf(p, 'Remarks')
      await p.evaluate(([d, w, r]) => { if (!d || !w || !r) throw new Error('premise gone'); d.parentElement.insertBefore(w, d); d.parentElement.insertBefore(r, d) }, [dates, when, rmk])
    }
    await p.waitForTimeout(250)
    const when = await fieldOf(p, 'When'), rmk = await fieldOf(p, 'Remarks')
    await mark(p, [when, rmk])
    res[`order-${kind}-${size}-${mode}`] = await measure(p)
    await p.screenshot({ path: `${out}/order-${kind.toLowerCase()}-${size}-${mode}.png` })
    await ctx.close()
  }
}
console.log(JSON.stringify({ res, errors }, null, 1))
await b.close()
