/* D2081 (16 Nov 26) — on a phone, Edit Schedule's open Legend leaves a strip at its right for the parked AIRCREW tab, so
   no flag runs under it. Drawn on the running app and put to him BEFORE it is built (D1625). Drives the local built app
   (vite preview on :4173): his iPhone's size, 402 x 874, in WebKit (skill note 955 — not 390), and a 1536-wide desktop.
   Pictures the open Legend scrolled into the tab's band as it is today, then with the one proposed rule added (a right
   padding on the phone only), the strip outlined. The desktop gets the same rule to show it changes nothing there.
   Run from raptor-port/: node docs/mock/2026-11-16-legend-tab-strip/shoot.mjs */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'img')
mkdirSync(OUT, { recursive: true })
const req = createRequire(resolve(HERE, '../../../package.json'))
const { chromium, webkit } = req('@playwright/test')

/* the proposed rule, exactly as it would be built: phone widths only, Edit Schedule's Legend only (D2081) */
const RULE = '@media (max-width:820px){#eLegendBox .legend{padding-right:44px}}'
const errors = []

async function shoot(name, phone) {
  const browser = phone ? await webkit.launch() : await chromium.launch({ headless: true })
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`${name} pageerror ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${name} console ${m.text()}`) })
  await page.goto('http://localhost:4173/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched'))
  await page.waitForFunction(() => window.CURPAGE === 'editsched')
  await page.waitForTimeout(600)
  /* open the Legend and bring it into the parked tab's band (the tab sits centred, 440px tall at this height) */
  await page.evaluate(() => {
    const d = document.querySelector('#eLegendBox'); d.open = true
    const y = d.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, y - 300)
  })
  await page.waitForTimeout(400)
  const measure = () => page.evaluate(() => {
    const lg = document.querySelector('#eLegend')
    const tab = document.querySelector('.edit-board .eroster')
    const tr = tab ? tab.getBoundingClientRect() : null
    const tabLeft = tr ? Math.max(tr.left, window.innerWidth - 30) : null
    const spans = [...lg.querySelectorAll(':scope > span')]
    const under = tr ? spans.filter(s => { const r = s.getBoundingClientRect(); return r.right > tabLeft && r.bottom > tr.top && r.top < tr.bottom }).map(s => s.textContent.trim()) : []
    return { legendH: Math.round(lg.getBoundingClientRect().height), tabLeft: tabLeft && Math.round(tabLeft), under }
  })
  const before = await measure()
  await page.screenshot({ path: join(OUT, `${name}-1-today.png`), ...(phone ? { clip: { x: 0, y: 92, width: 402, height: 300 } } : {}) })
  await page.addStyleTag({ content: RULE })
  await page.waitForTimeout(200)
  const after = await measure()
  /* outline the strip the rule leaves: the Legend's own right padding, drawn as a dashed box (takes no room) */
  if (phone) await page.evaluate(() => {
    const r = document.querySelector('#eLegend').getBoundingClientRect()
    const m = document.createElement('div')
    Object.assign(m.style, { position: 'fixed', left: (r.right - 44) + 'px', top: r.top + 'px', width: '44px', height: r.height + 'px',
      outline: '2px dashed #2EE6D6', outlineOffset: '-2px', pointerEvents: 'none', zIndex: 999 })
    document.body.appendChild(m)
  })
  await page.screenshot({ path: join(OUT, `${name}-2-proposed.png`), ...(phone ? { clip: { x: 0, y: 92, width: 402, height: 300 } } : {}) })
  console.log(name, 'today', JSON.stringify(before), '| proposed', JSON.stringify(after))
  await browser.close()
}

await shoot('iphone402', true)
await shoot('desktop', false)
console.log(errors.length ? errors.join('\n') : 'no console or page errors')
