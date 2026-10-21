/* [BOARD-SIDE-WIDTH] (D1113–D1116) — the design questions' DRAWN pictures, on the real app at his PC's size
   (1536 × 864 — a 1920 screen at 125%; 2x for sharpness). Each is ONE named transform on the live page, nothing else
   restyled, and every picture asserts its transform is still there before it is taken:
   · W<w>-desk: the right panel at w wide (D1113) with a grip drawn on its left edge (NEW — cloned from the look of the
     grip between the issues list and the crew list, turned on its side), the first duty desk picked, and each crossed-out man's
     reason beside his puck where at least 92 is left for it, under it where not — the ALL AVAIL window's own rule (D40);
     the strike drawn across the puck only (today it runs on across the empty column)
   · attb-<w>: no seat picked; the ATT B man (Havoc here, filed through the app's own Inputs door) in full colour with
     "ATT B: no flying" in the crew list's own reason words, moved to sit after the free men (D1114)
   · week-fixed: Edit Schedule scrolled down, the crew panel held just under the top bar instead of behind it (D1116)
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/bsw-mock.mjs */
console.log('bsw-mock v1')
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
mkdirSync(SHOTS, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const VW = 1536, VH = 864
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 })
await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await login(page, 'a')
const noToasts = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })

/* ATT B on Monday for a pilot who is free that day */
const attb = await page.evaluate(() => {
  const P = window.PEOPLE, id = Object.keys(P).find(k => P[k].cs === 'Havoc')
  window.fileInput({ person: id, date: 'Jul 13', allday: true, type: 'ATT B', remarks: 'Medically down', mod: '2026-07-10' })
  return id
})

await go(page, 'editsched')
await page.waitForTimeout(500)
/* D1116 — before and after, scrolled down */
await page.evaluate(() => window.scrollTo(0, 900)); await page.waitForTimeout(300); await noToasts()
await page.screenshot({ path: `${SHOTS}/week-before.png` })
await page.evaluate(() => {
  const s = document.createElement('style'); s.id = 'bswWeek'
  const bar = Math.ceil(document.querySelector('.topbar').getBoundingClientRect().bottom)
  s.textContent = `@media (min-width:821px){.edit-board .eroster{top:${bar + 8}px!important;max-height:calc(100vh - ${bar + 16}px)!important}}`
  document.head.appendChild(s)
})
await page.waitForTimeout(300); await noToasts()
if (!(await page.locator('#bswWeek').count())) throw new Error('week transform lost')
const wk = await page.evaluate(() => { const h = document.querySelector('.edit-board .eroster .er-h').getBoundingClientRect(); return [Math.round(h.top), Math.round(h.bottom)] })
console.log('week fixed: heading at', wk)
await page.screenshot({ path: `${SHOTS}/week-fixed.png` })
await page.evaluate(() => { document.getElementById('bswWeek').remove(); window.scrollTo(0, 0) })

/* the board, Monday; a duty desk is picked (the SDO desk's "+ add"), whose list prints a reason under each man */
await page.click('#eWeek [data-sbday="0"]:visible')
await page.waitForSelector('#schedBoard'); await page.waitForTimeout(700)

const CSS = w => `
#schedBoard .sb-side{width:${w}px!important;flex:0 0 ${w}px!important;position:relative}
#schedBoard .sb-roster .rpuck.no.haswhy{flex-direction:row;flex-wrap:wrap;align-items:flex-start;column-gap:6px}
#schedBoard .sb-roster .rpuck.no.haswhy .puck{flex:0 0 var(--puck-w)!important}
#schedBoard .sb-roster .rpuck .rwhy{flex:1 1 92px;min-width:0}
#schedBoard .sb-roster .rpuck.no::after{right:auto;width:calc(var(--puck-w) - 6px)}
#bswGrip{position:absolute;left:-4px;top:0;bottom:0;width:7px;cursor:ew-resize;z-index:6}
#bswGrip::before{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:3px;height:34px;border-radius:3px;background:var(--edge-2)}
#bswGrip.hov::before{background:var(--accent)}`
const apply = (w, hov) => page.evaluate(([css, hov]) => {
  document.getElementById('bswCss')?.remove()
  const s = document.createElement('style'); s.id = 'bswCss'; s.textContent = css; document.head.appendChild(s)
  const side = document.querySelector('#schedBoard .sb-side')
  let g = document.getElementById('bswGrip')
  if (!g) { g = document.createElement('div'); g.id = 'bswGrip'; g.dataset.new = 'drawn'; side.appendChild(g) }
  g.classList.toggle('hov', !!hov)
}, [CSS(w), hov])
const assertMock = async () => { if (!(await page.locator('#bswCss').count()) || !(await page.locator('#bswGrip').count())) throw new Error('mock transform lost') }
const arm = async () => {
  await page.locator('#schedBoard [data-fill="d:0.0.0.+"]:visible').first().click(); await page.waitForTimeout(500)
  return page.evaluate(() => window.ARM && window.ARM.key)
}
const measure = () => page.evaluate(() => {
  const side = document.querySelector('#schedBoard .sb-side').getBoundingClientRect()
  const cols = [...document.querySelectorAll('#schedBoard .sb-roster .rcols > .rcol')].map(c => Math.round(c.getBoundingClientRect().width))
  const whys = [...document.querySelectorAll('#schedBoard .sb-roster .rpuck.haswhy')]
  const beside = whys.filter(e => { const p = e.querySelector('.puck').getBoundingClientRect(), r = e.querySelector('.rwhy')?.getBoundingClientRect(); return r && r.left > p.right - 1 }).length
  const line = document.querySelector('#schedBoard .sb-line, #schedBoard .sb-arow')?.getBoundingClientRect()
  return { side: Math.round(side.width), cols, reasons: whys.length, beside, dayWidth: line ? Math.round(line.width) : null }
})
const shotSide = async (name, full) => {
  await noToasts(); await assertMock()
  const b = await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-side').getBoundingClientRect(); return { x: Math.max(0, r.left - 6), y: r.top, width: r.width + 6, height: Math.min(r.height, innerHeight - r.top) } })
  await page.screenshot({ path: `${SHOTS}/${name}.png`, clip: b })
  if (full) await page.screenshot({ path: `${SHOTS}/${name}-full.png` })
  console.log(name, JSON.stringify(await measure()))
}
/* the crew list scrolled to its pilot / WSO columns, so the reasons are in view */
const toCols = () => page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-roster'); const c = r.querySelector('.rcols'); r.scrollTop = c.offsetTop - r.offsetTop - 8 })

console.log('armed', await arm())
for (const w of [320, 460, Math.round(VW * 0.4)]) {
  await apply(w, w !== 320); await page.waitForTimeout(250); await toCols()
  await shotSide(`W${w}-desk`, w !== 320)
}
/* the grip close up, at the widest */
await noToasts()
const g = await page.evaluate(() => { const r = document.getElementById('bswGrip').getBoundingClientRect(); return { x: r.left - 60, y: r.top + r.height / 2 - 70, width: 140, height: 140 } })
await page.screenshot({ path: `${SHOTS}/grip-close.png`, clip: g })

/* D1114 — no seat picked; the ATT B man as drawn */
await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click()); await page.waitForTimeout(400)
const attbMock = id => page.evaluate(id => {
  const e = document.querySelector(`#schedBoard .sb-roster .rpuck[data-person="${id}"]`)
  const was = e.className
  e.className = 'rpuck haswhy'; e.dataset.bswattb = '1'
  const why = document.createElement('span'); why.className = 'rwhy'; why.textContent = 'ATT B: no flying'; e.appendChild(why)
  e.style.flexDirection = 'row'; e.style.flexWrap = 'wrap'; e.style.alignItems = 'flex-start'; e.style.columnGap = '6px'
  /* after the last free man of his column */
  const col = e.parentElement, free = [...col.querySelectorAll('.rpuck')].filter(x => !x.classList.contains('busy') && !x.classList.contains('no') && x !== e)
  free[free.length - 1].after(e)
  return was
}, id)
await apply(320, false); await page.waitForTimeout(250); await toCols()
console.log('attb today class', await page.evaluate(id => document.querySelector(`#schedBoard .sb-roster .rpuck[data-person="${id}"]`).className, attb))
await shotSide('attb-today-320')
await attbMock(attb)
for (const w of [320, Math.round(VW * 0.4)]) {
  await apply(w, false); await page.waitForTimeout(250)
  if (!(await page.locator('#schedBoard [data-bswattb="1"]').count())) throw new Error('ATT B transform lost')
  await toCols(); await shotSide(`attb-${w}`)
}
console.log('errors', errors.length, errors.slice(0, 5))
await browser.close()
