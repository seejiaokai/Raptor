// w7 probe: the SANS day window's pull-up bar on a phone — does a tap on the bar change its height? Tried in WebKit and
// Chromium (both 402x874, touch), by a finger tap and by a mouse click, on the bar's title and on its grip. Saber, Sat 18 Jul.
import { DUMP } from './sud-w7-env.mjs'
import { chromium, webkit } from '@playwright/test'
import path from 'node:path'
const L = await import('./asp-w2-lib.mjs')
const { sleep } = L
console.log('sud-w7-bar v1', L.URL_, L.OUT)
const state = p => p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0); if (!w) return 'no window'; return { tall: w.classList.contains('is-tall'), top: Math.round(w.getBoundingClientRect().top), h: Math.round(w.getBoundingClientRect().height) } })
for (const [nm, eng] of [['webkit', webkit], ['chromium', chromium]]) {
  const b = await eng.launch({})
  const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
  await ctx.clock.install({ time: new Date('2026-07-15T09:00:00') })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', e => errs.push(e.message))
  await p.goto(L.URL_)
  await L.signIn(p, 'ad', 'a')
  await L.go(p, 'inputs')
  const tab = p.locator('button:visible', { hasText: /^SANS$/ }).first()
  if (await tab.count()) { await tab.tap(); await sleep(700) }
  const cell = p.locator('[data-testid="sc-day-2026-07-18"]').first()
  await cell.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  await cell.tap(); await sleep(800)
  const s0 = await state(p)
  const ttl = p.locator('[data-testid="win-sansday"] .win-ttl').first()
  const bb = await ttl.boundingBox()
  const out = [`${nm}: opened ${JSON.stringify(s0)}`]
  /* 1. a finger tap at the title's middle (the page's touchscreen) */
  await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(700)
  const s1 = await state(p); out.push(`finger tap on the title → ${JSON.stringify(s1)}`)
  await p.screenshot({ path: path.join(L.OUT, `bar-${nm}-1-tap.png`) })
  /* 2. a mouse click at the same point */
  const bb2 = await ttl.boundingBox()
  await p.mouse.click(bb2.x + bb2.width / 2, bb2.y + bb2.height / 2); await sleep(700)
  const s2 = await state(p); out.push(`mouse click on the title → ${JSON.stringify(s2)}`)
  await p.screenshot({ path: path.join(L.OUT, `bar-${nm}-2-click.png`) })
  /* 3. a finger tap on the grip */
  const g = await p.locator('[data-testid="win-sansday"] .win-grip').first().boundingBox()
  if (g) { await p.touchscreen.tap(g.x + g.width / 2, g.y + g.height / 2); await sleep(700) }
  const s3 = await state(p); out.push(`finger tap on the grip → ${JSON.stringify(s3)}`)
  await p.screenshot({ path: path.join(L.OUT, `bar-${nm}-3-grip.png`) })
  console.log(out.join(' | '), errs.length ? 'errors: ' + errs.join(' || ') : '')
  await b.close()
}
