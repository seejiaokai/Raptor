/* The drawing check for D2081/D2082 (D1494, D1495; skill note 955 — at his iPhone's 402, not 390). Two modes, run from
   raptor-port/ against the local build on :4173:
     node docs/mock/2026-11-16-legend-tab-strip/drawcheck.mjs record   — on the build BEFORE the change: injects the drawn
       rule (exactly the drawing's) and saves where each part of the open Legend sits, as the drawing has it;
     node docs/mock/2026-11-16-legend-tab-strip/drawcheck.mjs check    — on the BUILT change: injects nothing, measures
       the same parts and lists every difference over 2px in place, size, colour or text alignment. Red until none.
   Phone: 402 x 874 WebKit (his iPhone). Desktop: 1536 x 864 Chromium (the rule must leave it as it was: recorded bare). */
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const req = createRequire(resolve(HERE, '../../../package.json'))
const { chromium, webkit } = req('@playwright/test')
const MODE = process.argv[2]
if (!['record', 'check'].includes(MODE)) throw new Error('mode: record | check')
const RULE = '@media (max-width:820px){#eLegendBox .legend{padding-right:44px}}'
const FILE = join(HERE, 'drawing-parts.json')

async function parts(name, phone) {
  const browser = phone ? await webkit.launch() : await chromium.launch({ headless: true })
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }
    : { viewport: { width: 1536, height: 864 } })
  const page = await ctx.newPage()
  await page.goto('http://localhost:4173/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched'))
  await page.waitForFunction(() => window.CURPAGE === 'editsched')
  await page.waitForTimeout(500)
  if (MODE === 'record' && phone) await page.addStyleTag({ content: RULE })
  await page.evaluate(() => { const d = document.querySelector('#eLegendBox'); d.open = true; window.scrollTo(0, 0) })
  await page.waitForTimeout(300)
  const out = await page.evaluate(() => {
    const lg = document.querySelector('#eLegend')
    const box = lg.getBoundingClientRect()
    const rel = r => ({ x: Math.round(r.left - box.left), y: Math.round(r.top - box.top), w: Math.round(r.width), h: Math.round(r.height) })
    const cs = getComputedStyle(lg)
    const list = [{ part: 'the Legend', ...rel(box), color: cs.color, align: cs.textAlign, padR: cs.paddingRight }]
    lg.querySelectorAll(':scope > span').forEach((s, i) => {
      const c = getComputedStyle(s)
      list.push({ part: `${i} ${s.textContent.trim()}`, ...rel(s.getBoundingClientRect()), color: c.color, align: c.textAlign })
    })
    return list
  })
  await browser.close()
  return out
}

const now = { phone: await parts('phone', true), desktop: await parts('desktop', false) }
if (MODE === 'record') {
  writeFileSync(FILE, JSON.stringify(now, null, 1))
  console.log('recorded', now.phone.length, 'phone parts and', now.desktop.length, 'desktop parts')
} else {
  const drawn = JSON.parse(readFileSync(FILE, 'utf8'))
  const diffs = []
  for (const k of ['phone', 'desktop']) {
    if (drawn[k].length !== now[k].length) diffs.push(`${k}: ${drawn[k].length} parts drawn, ${now[k].length} built`)
    drawn[k].forEach((d, i) => {
      const b = now[k][i]; if (!b) return
      if (d.part !== b.part) diffs.push(`${k} #${i}: drawn "${d.part}", built "${b.part}"`)
      for (const f of ['x', 'y', 'w', 'h']) if (Math.abs(d[f] - b[f]) > 2) diffs.push(`${k} ${d.part}: ${f} drawn ${d[f]}, built ${b[f]}`)
      for (const f of ['color', 'align', 'padR']) if (d[f] !== b[f]) diffs.push(`${k} ${d.part}: ${f} drawn ${d[f]}, built ${b[f]}`)
    })
  }
  console.log(diffs.length ? 'DIFFERENCES:\n' + diffs.join('\n') : `no difference over 2px — ${now.phone.length} phone and ${now.desktop.length} desktop parts`)
  process.exitCode = diffs.length ? 1 : 0
}
