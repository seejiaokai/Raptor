/* [TRK-STRAY-SCROLLBARS] (D1405, 27 Oct 26): list every box on the Tracker that can scroll, and every one that
   draws a bar, on his PC's desktop (Windows Chrome at 125%, bars always drawn) and on a phone's width.
   Playwright hides scroll bars in a headless browser by default (--hide-scrollbars), which would hide the very
   fault being looked for: that flag is taken off here.
   Usage: HP_URL=http://localhost:4180 node scripts/handpass/trk-sb-inventory.mjs <out folder> */
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'
import { login, toTracker, BASE } from './trk-lib.mjs'

const OUTDIR = process.argv[2] || 'sb-out'
mkdirSync(OUTDIR, { recursive: true })

/* every element whose overflow lets it scroll, with what it holds beyond its box and the bar it draws */
const SCAN = () => {
  const out = []
  const name = el => {
    let s = el.tagName.toLowerCase()
    if (el.id) s += '#' + el.id
    if (el.classList.length) s += '.' + [...el.classList].slice(0, 3).join('.')
    return s
  }
  for (const el of [document.documentElement, document.body, ...document.querySelectorAll('#page-tracker *')]) {
    const cs = getComputedStyle(el)
    const ox = cs.overflowX, oy = cs.overflowY
    const can = v => v === 'auto' || v === 'scroll'
    if (!can(ox) && !can(oy) && el !== document.documentElement && el !== document.body) continue
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height || cs.visibility === 'hidden') continue
    const barV = el.offsetWidth - el.clientWidth - (parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth))
    const barH = el.offsetHeight - el.clientHeight - (parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth))
    out.push({
      el: name(el), ox, oy,
      box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
      extraX: el.scrollWidth - el.clientWidth, extraY: el.scrollHeight - el.clientHeight,
      barV: Math.round(barV), barH: Math.round(barH),
      sbw: cs.scrollbarWidth,
    })
  }
  return out
}

async function run(label, ctxOpts, views) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, ignoreDefaultArgs: ['--hide-scrollbars'] })
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(BASE + '/')
  await login(page, 'a')
  await toTracker(page)
  const res = {}
  for (const v of views) {
    if (v.tab) { await page.locator(v.tab).first().click(); await page.waitForTimeout(500) }
    res[v.name] = await page.evaluate(SCAN)
    await page.screenshot({ path: resolve(OUTDIR, `${label}-${v.name}.png`) })
  }
  await browser.close()
  return { res, errors }
}

const all = {}
all.desk = await run('desk', { viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 }, [
  { name: 'chart' },
  { name: 'showall', tab: '#showAllBtn' },
])
all.phone = await run('phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true }, [
  { name: 'chart' },
  { name: 'info', tab: '#viewtabs button[data-view="info"]' },
  { name: 'flowback', tab: '#viewtabs button[data-view="flow"]' },
  { name: 'showall', tab: '#showAllTab' },
])
writeFileSync(resolve(OUTDIR, 'inventory.json'), JSON.stringify(all, null, 1))
for (const [k, v] of Object.entries(all)) {
  console.log('==', k, 'errors:', v.errors.length)
  for (const [view, rows] of Object.entries(v.res)) {
    console.log(' --', view)
    for (const r of rows) console.log(`   ${r.el}  ox=${r.ox} oy=${r.oy} box=${r.box.join(',')} extra=${r.extraX}/${r.extraY} bars=${r.barV}/${r.barH} sbw=${r.sbw}`)
  }
}
