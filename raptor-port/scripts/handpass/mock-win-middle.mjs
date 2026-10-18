/* Pictures for his question after D996 (18 Oct 26): which of the phone's windows that stand at the foot of the screen
   should move to the middle? Each window as it is today and drawn in the middle (a style laid over the real app, nothing
   saved), the window ringed. Phone 390 × 844 by touch, the built app. `docs/img/handpass/2026-10-18-win-middle/`.
   Run: SPF_URL=http://localhost:4174 node scripts/handpass/mock-win-middle.mjs */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.SPF_URL || 'http://localhost:4174'
const OUT = resolve(here, '../../docs/img/handpass/2026-10-18-win-middle')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
console.log('mock-win-middle v2 →', OUT)

const MIDDLE = `
  .floatwin{top:50% !important;bottom:auto !important;transform:translateY(-50%) !important}
  .modal{align-items:center !important;padding:12px !important}
  .modal-box{border-radius:16px !important;max-height:calc(100dvh - 24px) !important}`
async function ring(page, sel) {
  await page.evaluate(s => {
    document.getElementById('mockRing')?.remove()
    const e = document.querySelector(s); if (!e) return
    const r = e.getBoundingClientRect()
    const d = document.createElement('div'); d.id = 'mockRing'
    Object.assign(d.style, { position: 'fixed', left: (r.left - 4) + 'px', top: (r.top - 4) + 'px', width: (r.width + 8) + 'px', height: (r.height + 8) + 'px', border: '3px solid #FF3B30', borderRadius: '18px', zIndex: 99999, pointerEvents: 'none' })
    document.body.appendChild(d)
  }, sel)
}
async function both(page, name, sel) {
  await sleep(500); await ring(page, sel)
  await page.screenshot({ path: join(OUT, `${name}-today.png`) })
  const tag = await page.addStyleTag({ content: MIDDLE }); await sleep(400); await ring(page, sel)
  await page.screenshot({ path: join(OUT, `${name}-middle.png`) })
  await tag.evaluate(t => t.remove()); await page.evaluate(() => document.getElementById('mockRing')?.remove())
  console.log('drew', name)
}
async function open() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(BASE + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.locator('#loginForm button[type=submit]').tap()
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
  return { ctx, page }
}
const go = async (page, p) => { await page.evaluate(x => window.go(x), p); await sleep(600) }

{ /* 1 — the Inputs page's "+ Input" (D996: moving) */
  const { ctx, page } = await open()
  await go(page, 'inputs')
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await page.locator('#inListBtn').tap(); await sleep(400) }
  await page.locator('#inNew').tap()
  await both(page, '1-plus-input', '[data-testid="win-inputedit"]')
  /* 2 — the Inputs calendar's settings (⚙) */
  await page.locator('#inpEditCancel').tap(); await sleep(300)
  await page.locator('#inGear').tap()
  await both(page, '2-inputs-settings', '.floatwin:not([hidden])')
  /* 3 — "Calendar…" (each date's flying, the holidays) */
  await page.locator('[data-testid="iset-days"]').tap(); await sleep(500)
  await both(page, '3-calendar-window', '.floatwin:not([hidden])')
  await ctx.close()
}
{ /* 4 — a day opened on the Inputs calendar (two heights, pulled by its bar — D683, D648) */
  const { ctx, page } = await open()
  await go(page, 'inputs')
  if (await page.locator('#inCalBtn[aria-pressed="false"]').count()) { await page.locator('#inCalBtn').tap(); await sleep(400) }
  await page.locator('[data-icday]:visible').nth(12).tap(); await sleep(700)
  await both(page, '4-inputs-day', '.floatwin:not([hidden])')
  await ctx.close()
}
{ /* 5 — Insights from Edit Schedule (a pop-up window of the bottom-sheet kind — D536, D537) */
  const { ctx, page } = await open()
  await go(page, 'editsched')
  const more = page.locator('.schedule-more:visible').first()
  if (await more.count()) { await more.tap(); await sleep(400) }
  const ins = page.locator('.schedule-moreitem:visible, #insightBtn:visible').first()
  if (await ins.count()) { await ins.tap(); await sleep(800); await both(page, '5-insights', '.modal .modal-box') }
  else console.log('NOT DRAWN 5 — no Insights door found on the phone')
  await ctx.close()
}
await browser.close()
