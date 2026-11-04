// THE NUMBER PAD'S BOX — how it says "you are typing here, no tap needed" (his question of 4 Nov 26, after D1629 chose the
// box). Drawn on the real pad, sideways and upright: the box D1629 approved, then the proposal — the figure SELECTED when
// the pad opens (the next key replaces it, which is what the pad already does), and a typing line after the figure
// once a key is pressed — on the pad's box AND on the cell's own box over the grid, so the two read as one thing.
// Self-contained (no shared kit — observation 796). Run from raptor-port/: node scripts/handpass/lwsf-mock-caret.mjs
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.env.LWSF_OUT || join(HERE, '../../docs/img/handpass/2026-11-04-lw-small-fixes-mock')
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
mkdirSync(OUT, { recursive: true })
const SIZES = {
  phone: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true },
  side: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true },
}
const sleep = ms => new Promise(r => setTimeout(r, ms))
const say = l => { console.log(l); appendFileSync(join(OUT, 'measures.txt'), l + '\n') }
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

async function openPad(size) {
  const ctx = await browser.newContext({ ...SIZES[size], deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const w = { ctx, page }
  const tap = async sel => { await page.locator(sel).first().tap(); await sleep(650) }
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(400)
  await page.evaluate(() => window.go('leavewar'))
  await page.locator('[data-testid="row-slipway"]').waitFor({ timeout: 15000 }); await sleep(500)
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
  if (await page.locator('[data-testid="month-FEB"]').count()) await tap('[data-testid="month-FEB"]')
  if (!(await page.locator('[data-testid^="req-p-"]').count()) && await page.locator('[data-testid="counts-toggle"]').count()) await tap('[data-testid="counts-toggle"]')
  const iso = '2026-02-25'
  /* the day starts holding a figure, as a real one does: 7 typed and Done, then the pad opened again on it */
  await page.evaluate(iso => document.querySelector(`[data-testid="req-p-${iso}"]`).scrollIntoView({ block: 'center', inline: 'center' }), iso); await sleep(350)
  await tap(`[data-testid="req-p-${iso}"]`)
  await tap('[data-testid="fly-pad-7"]'); await tap('[data-testid="fly-pad-done"]')
  await page.evaluate(iso => document.querySelector(`[data-testid="req-p-${iso}"]`).scrollIntoView({ block: 'center', inline: 'center' }), iso); await sleep(350)
  await tap(`[data-testid="req-p-${iso}"]`)
  if (!(await page.locator('[data-testid="fly-pad"]').count())) throw new Error(size + ': no number pad')
  return w
}

/* state: 'plain' — D1629's box as approved, the figure alone; 'open' — the pad just opened, the figure selected;
   'typed' — 9 pressed, the typing line after it; 'empty' — ⌫ pressed down to nothing, the typing line alone.
   The selection is the app's own cyan at the strength of a picked chip's fill, behind the figure; the typing line is a
   2px cyan bar the figure's height (drawn steady for the picture; in the app it blinks, and stays steady for a reader
   who asked for less motion). Both drawn into the pad's box AND the cell's own box (`fly-edit-touch`). */
async function draw(page, state, fig) {
  return page.evaluate(([state, fig]) => {
    document.querySelectorAll('.lwsf-new').forEach(e => e.remove())
    document.querySelectorAll('[data-lwsf-hid]').forEach(e => { e.style.visibility = ''; e.removeAttribute('data-lwsf-hid') })
    const day = document.querySelector('.flypad-hd .flypad-day')
    day.style.display = 'inline-flex'; day.style.alignItems = 'center'
    const cell = document.querySelector('[data-testid="fly-edit-touch"]')
    const cs = getComputedStyle(cell)
    const sel = 'background:color-mix(in srgb, #3BC6E8 38%, transparent);border-radius:2px;padding:0 1px'
    const line = h => `<span style="display:inline-block;width:2px;height:${h}px;background:#3BC6E8;margin-left:1px;vertical-align:middle"></span>`
    const inner = h => state === 'plain' ? fig
      : state === 'open' ? `<span style="${sel}">${fig}</span>`
      : state === 'typed' ? `${fig}${line(h)}`
      : line(h)
    const box = document.createElement('span')
    box.className = 'lwsf-new'
    box.innerHTML = `<span style="display:inline-grid;place-items:center;min-width:44px;height:30px;margin-left:10px;box-sizing:border-box;border:${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor};border-radius:${cs.borderTopLeftRadius};background:${cs.backgroundColor};color:${cs.color};font-weight:800;font-size:18px;font-variant-numeric:tabular-nums;vertical-align:middle"><span style="display:inline-flex;align-items:center">${inner(20)}</span></span>`
    box.style.outline = '2px dashed #ff3b6b'; box.style.outlineOffset = '3px'
    day.appendChild(box)
    /* the cell's own box over the grid, the same state (the app's box keeps its size: only what is inside it changes) */
    if (state !== 'plain') {
      const ch = cell.getBoundingClientRect().height
      const mark = document.createElement('span'); mark.className = 'lwsf-new'
      mark.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;pointer-events:none'
      mark.innerHTML = `<span style="display:inline-flex;align-items:center">${inner(Math.max(10, Math.round(ch * 0.62)))}</span>`
      if (getComputedStyle(cell).position === 'static') cell.style.position = 'relative'
      for (const n of [...cell.childNodes]) if (n.nodeType === 3) { const s = document.createElement('span'); s.setAttribute('data-lwsf-hid', '1'); s.style.visibility = 'hidden'; s.textContent = n.textContent; n.replaceWith(s) }
      cell.appendChild(mark)
    }
    return { cell: [Math.round(cell.getBoundingClientRect().width), Math.round(cell.getBoundingClientRect().height)] }
  }, [state, fig])
}
for (const size of ['side', 'phone']) {
  const w = await openPad(size)
  for (const [state, fig] of [['plain', '7'], ['open', '7'], ['typed', '9'], ['empty', '']]) {
    const m = await draw(w.page, state, fig)
    say(`caret ${size} ${state}: ${JSON.stringify(m)}`)
    await w.page.screenshot({ path: join(OUT, `p1c-${size}-${state}.png`) })
  }
  await w.ctx.close()
}
await browser.close()
