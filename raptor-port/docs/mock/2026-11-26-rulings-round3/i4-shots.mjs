/* Round 3, question I4 (his D2790, 26 Nov 26): a row a scheduler types never gets "all day". Shoots the end-time try-out's
   Thursday with a typed Ground Programme row named SAFETY DAY, Diesel on it: (1) both time boxes emptied — outlined, as
   any row with someone on it and a time missing; (2) its real hours typed, 07:30–17:00 — plain. At his iPhone's width
   (402, WebKit, touch) and a desktop's (1536, Chromium). Pictures go to img/i4-*.png.
   Run from raptor-port/: node docs/mock/2026-11-26-rulings-round3/i4-shots.mjs */
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'img')
const req = createRequire(resolve(HERE, '../../../package.json'))
const { chromium, webkit } = req('@playwright/test')
const URL = pathToFileURL(join(HERE, '../2026-11-25-endtime-tryout/index.html')).href
const fails = []
const ok = (c, what) => { if (!c) fails.push(what); console.log((c ? '  ok   ' : '  FAIL ') + what) }

async function run(name, phone) {
  console.log(`== ${name}`)
  const browser = phone ? await webkit.launch() : await chromium.launch()
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', e => errors.push(e.message))
  await p.goto(URL)
  const press = async sel => { const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded(); if (phone) await l.tap(); else await l.click() }
  const setBox = async (key, v) => {
    await press(`[data-txt="${key}"]`); await p.waitForTimeout(150)
    await p.keyboard.press(phone ? 'Meta+A' : 'Control+A'); await p.keyboard.press('Backspace')
    if (v) await p.keyboard.type(v)
    await p.keyboard.press('Enter'); await p.waitForTimeout(120)
  }
  /* the typed row: renamed for the question, a whole-day thing a scheduler types himself */
  await p.evaluate(() => {
    document.querySelector('[data-txt="gr:3.0.prog"]').textContent = 'SAFETY DAY'
    const rk = document.querySelector('[data-txt="gr:3.0.rmks"]'); if (rk) rk.textContent = ''
  })
  const state = () => p.evaluate(() => {
    const s = document.querySelector('[data-txt="gr:3.0.str"]'), e = document.querySelector('[data-txt="gr:3.0.end"]')
    return { str: s.textContent.trim(), end: e.textContent.trim(), sMiss: s.classList.contains('et-miss'), eMiss: e.classList.contains('et-miss') }
  })
  const shot = async file => {
    const box = p.locator('[data-txt="gr:3.0.str"]'); await box.scrollIntoViewIfNeeded(); await p.mouse.move(1, 1); await p.waitForTimeout(250)
    const r = await box.evaluate(e => {
      const sec = e.closest('.sec-grnd').getBoundingClientRect(), day = e.closest('section.day').getBoundingClientRect()
      return { x: day.left, w: day.width, y: sec.top, h: sec.height }
    })
    await p.screenshot({ path: join(OUT, `i4-${file}-${name}.png`), clip: { x: Math.max(0, r.x), y: Math.max(0, r.y - 4), width: Math.min(r.w, p.viewportSize().width), height: r.h + 8 } })
  }
  await setBox('gr:3.0.str', ''); await setBox('gr:3.0.end', '')
  let s = await state()
  ok(s.str === '' && s.end === '' && s.sMiss && s.eMiss, `both boxes empty, Diesel on it: both outlined (${JSON.stringify(s)})`)
  await shot('1-empty-outlined')
  await setBox('gr:3.0.str', '0730'); await setBox('gr:3.0.end', '1700')
  s = await state()
  ok(s.str !== '' && s.end !== '' && !s.sMiss && !s.eMiss, `07:30–17:00 typed: plain (${JSON.stringify(s)})`)
  await shot('2-hours-typed')
  ok(errors.length === 0, `no page errors (${errors.join('; ')})`)
  await browser.close()
}

await run('iphone402', true)
await run('desktop1536', false)
console.log(fails.length ? `${fails.length} FAILED` : 'all passed')
process.exit(fails.length ? 1 : 0)
