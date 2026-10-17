/* The scheduling-on-a-phone batch (18 Oct 26, D994) — [SCHED-INPUT-WINDOW-PHONE] measured by touch.
   (1) the window an input's Personal Inputs line opens on Edit Schedule and the Scheduler Board: its box against the
       screen, and the same input's window on the Inputs page beside it (D706);
   (2) a finger swiped inside that window: does the page behind it scroll (D686)?
   (3) a phone on its side (844 × 390): the Inputs page's "+ Input" window inside the screen, Add and ✕ reachable;
       the page's own width.
   Run: SPF_URL=http://localhost:4174 SPF_OUT=<folder> node scripts/handpass/spf-win.mjs */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.SPF_URL || 'http://localhost:4174'
const OUT = process.env.SPF_OUT || resolve(here, '../../docs/img/handpass/2026-10-18-sched-phone/before-win')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
const errs = []
const res = {}
console.log('spf-win v1 →', OUT)

async function open(viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height}`
  page.on('pageerror', e => errs.push(`${tag} pageerror ${e}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + '/')
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.locator('#loginForm button[type=submit]').tap()
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(600)
  return { ctx, page }
}
const shot = (page, name) => page.screenshot({ path: join(OUT, name + '.png') })
/* a finger: down, moves, a rest, up (docs/walk-scripts.md §4 — a lift at full speed swallows the next tap) */
async function swipe(page, x, y, dy) {
  const c = await page.context().newCDPSession(page)
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x, y) })
  for (let i = 1; i <= 10; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x, y + dy * i / 10) }); await sleep(20) }
  await sleep(90)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await c.detach().catch(() => {})
  await sleep(900)
}
const box = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }, sel)
/* the window's scrolling box: the element under the window that actually scrolls */
const scrollers = page => page.evaluate(() => { const w = document.querySelector('#inpEditPop'); if (!w) return null; let t = 0; [w, ...w.querySelectorAll('*')].forEach(e => { t += e.scrollTop }); return { inner: t, page: Math.round(window.scrollY) } })

/* the first Personal Inputs line's title on a surface — the window's own door */
async function openFromSchedule(page, onBoard) {
  await page.locator('#burger').tap()
  await page.locator('#drawerNav [data-page="editsched"]').tap()
  await sleep(500)
  if (onBoard) {
    await page.locator('#eWeek [data-sbday="0"]:visible').tap()
    await page.locator('#sbBoard .sb-sec').first().waitFor({ state: 'attached' })
    const tog = page.locator('#schedBoard [data-pitog="0"]:visible')
    if (!(await page.locator('#schedBoard [data-inpedit]:visible').count()) && await tog.count()) { await tog.tap(); await sleep(400) }
  }
  const scope = onBoard ? '#schedBoard' : '#eWeek .day[data-day="0"]'
  const door = page.locator(`${scope} [data-inpedit]:visible`).first()
  await door.scrollIntoViewIfNeeded(); await sleep(300)
  const name = (await door.innerText()).trim().slice(0, 40)
  await door.tap(); await sleep(600)
  return name
}

for (const [surface, onBoard] of [['week', false], ['board', true]]) {
  const { ctx, page } = await open({ width: 390, height: 844 })
  const door = await openFromSchedule(page, onBoard)
  const r = { door, box: await box(page, '#inpEditPop .inpedbox'), screen: [390, 844] }
  r.inner = await page.evaluate(() => { const b = document.querySelector('#inpEditPop .inpedbox'); return b ? { scrollH: b.scrollHeight, clientH: b.clientHeight } : null })
  await shot(page, `${surface}-01-window`)
  /* (2) swipe inside the window, both ways, the page's scroll read before and after */
  const b = r.box
  if (b) {
    const x = b[0] + b[2] / 2, y = b[1] + Math.min(b[3] / 2, 300)
    const s0 = await scrollers(page)
    await swipe(page, x, y, -260); const s1 = await scrollers(page)
    await swipe(page, x, y, -260); const s2 = await scrollers(page)
    await swipe(page, x, y, +260); const s3 = await scrollers(page)
    await swipe(page, x, y, +260); const s4 = await scrollers(page)
    r.swipes = [s0, s1, s2, s3, s4]
    await shot(page, `${surface}-02-after-swipes`)
  }
  res[surface] = r
  await ctx.close()
}

/* the same input's window from the Inputs page, for the side-by-side (D706's window) */
{
  const { ctx, page } = await open({ width: 390, height: 844 })
  await page.evaluate(() => window.go('inputs')); await sleep(600)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await page.locator('#inListBtn').tap(); await sleep(400) }
  const card = page.locator('[data-inpedit]:visible').first()
  if (await card.count()) { await card.scrollIntoViewIfNeeded(); await card.tap(); await sleep(600) }
  res.inputsPage = { box: await box(page, '[data-testid="win-inputedit"]') }
  await shot(page, 'inputs-01-window')
  await ctx.close()
}

/* (3) a phone on its side: the Inputs page's "+ Input" */
{
  const { ctx, page } = await open({ width: 844, height: 390 })
  await page.evaluate(() => window.go('inputs')); await sleep(700)
  const r = await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, inner: innerWidth, vv: Math.round(visualViewport.width) }))
  /* what reaches past the screen's right edge: the widest offenders, by their own box */
  r.wide = await page.evaluate(() => {
    const W = document.documentElement.clientWidth
    return [...document.querySelectorAll('body *')].map(e => { const b = e.getBoundingClientRect(); return { e, b } })
      .filter(({ b }) => b.right > W + 1 && b.width > 0)
      .map(({ e, b }) => ({ tag: e.tagName.toLowerCase(), id: e.id, cls: String(e.className).slice(0, 60), left: Math.round(b.left), right: Math.round(b.right), w: Math.round(b.width) }))
      .slice(0, 14)
  })
  await shot(page, 'side-01-inputs-page')
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await page.locator('#inListBtn').tap(); await sleep(400) }
  const add = page.locator('#inNew:visible, #icPopAdd:visible').first()
  if (await add.count()) { await add.tap(); await sleep(700) }
  r.win = await box(page, '[data-testid="win-inputedit"]')
  r.save = await box(page, '#inpEditSave')
  r.cancel = await box(page, '#inpEditCancel')
  await shot(page, 'side-02-plus-input')
  res.side = r
  await ctx.close()
}

console.log(JSON.stringify(res, null, 1))
console.log('errors', JSON.stringify(errs))
await browser.close()
