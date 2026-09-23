/* w3 item 8 — resizing (Fable #34, Astra #37, #38): phone ↔ desktop with the
   Info tab, a grading pop-up, the search strip and the lull calendar open; a
   zoom set by hand is kept (both the chart's and the panel's). A desktop
   browser window narrowed and widened — the way a person drags the window, or
   a tablet rotates. */
import { open, shot, save, log, reveal, DESK, PHONE } from './trk-lib.mjs'
import { sleep, ball, halves, box } from './trk-w3-lib.mjs'

const L = log()
const inView = async (page, sel) => { const b = await box(page, sel); const vp = page.viewportSize(); return b ? { ...b, inside: b.x >= 0 && b.y >= 0 && b.r <= vp.width && b.b <= vp.height } : null }
const zoom = page => page.evaluate(() => ({ chart: (document.getElementById('fzPct') || {}).textContent, panel: (document.getElementById('szPct') || {}).textContent, sw: document.getElementById('board').scrollWidth, cw: document.getElementById('board').clientWidth, top: document.getElementById('board').scrollTop }))
const W = DESK, N = { width: 390, height: 844 }

const { browser, page, errors } = await open({ size: N, who: 'a' })
/* 1. the Info tab open, widen, narrow */
await page.click('#viewtabs [data-view="info"]'); await sleep(300)
await page.setViewportSize(W); await sleep(600)
let h = await halves(page)
L.ok('1. Info tab open at 390 → widen to 1440: both columns show', h.flow && h.info && !h.tabs, JSON.stringify(h))
await shot(page, 'w3-08-1-info-widened')
await page.setViewportSize(N); await sleep(600)
h = await halves(page)
L.ok('1. …narrow again: ONE half (the Info tab it was on)', h.info && !h.flow, JSON.stringify(h))
await page.click('#viewtabs [data-view="flow"]'); await sleep(300)

/* 2. a grading pop-up open */
await reveal(page, 'ST-01'); const b = await ball(page, 'ST-01').boundingBox()
await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(400)
L.note('2. pop-up at 390', JSON.stringify(await inView(page, '#pop')))
await page.setViewportSize(W); await sleep(600)
let p = await inView(page, '#pop')
L.ok('2. widen with the pop-up open: it is still on screen and whole', !!p && p.inside, JSON.stringify(p))
await shot(page, 'w3-08-2-pop-widened')
await page.setViewportSize(N); await sleep(600)
p = await inView(page, '#pop')
L.ok('2. …narrow again: still on screen and whole (every button reachable)', !!p && p.inside, JSON.stringify(p))
await shot(page, 'w3-08-2-pop-narrowed')
if (await page.locator('#pop').isVisible().catch(() => false)) { await page.keyboard.press('Escape'); await sleep(200) }

/* 3. the search strip open */
await page.click('#hSearchBtn'); await sleep(300); await page.keyboard.type('ACG', { delay: 30 }); await sleep(400)
L.note('3. search strip at 390', JSON.stringify({ panel: await inView(page, '#hSearchPanel'), list: await inView(page, '#hSearchList') }))
await page.setViewportSize(W); await sleep(600)
const s1 = { box: await inView(page, '#hSearch'), panel: await inView(page, '#hSearchPanel'), btn: await inView(page, '#hSearchBtn'), list: await inView(page, '#hSearchList'), hdr: await box(page, '#page-tracker header') }
L.ok('3. widen with the strip open: the box sits inline in the bar, 🔍 gone', s1.box && s1.hdr && s1.box.y >= s1.hdr.y && s1.box.b <= s1.hdr.b && !s1.btn, JSON.stringify(s1))
await shot(page, 'w3-08-3-search-widened')
await page.setViewportSize(N); await sleep(600)
const s2 = { panel: await inView(page, '#hSearchPanel'), list: await inView(page, '#hSearchList'), btn: await inView(page, '#hSearchBtn') }
L.note('3. …narrow again', JSON.stringify(s2))
await shot(page, 'w3-08-3-search-narrowed')
await page.click('#hSearchClear').catch(() => {}); await page.keyboard.press('Escape'); await sleep(300)

/* 4. the lull calendar open on the Info tab */
await page.click('#viewtabs [data-view="info"]'); await sleep(300)
await page.click('#setLullBtn'); await sleep(400)
L.note('4. lull calendar at 390', JSON.stringify(await inView(page, '#lullCal')))
await page.setViewportSize(W); await sleep(600)
let lc = await inView(page, '#lullCal')
L.ok('4. widen with the lull calendar open: on screen and whole', !!lc && lc.inside, JSON.stringify(lc))
await shot(page, 'w3-08-4-lull-widened')
await page.setViewportSize(N); await sleep(600)
lc = await inView(page, '#lullCal')
L.ok('4. …narrow again: on screen and whole', !!lc && lc.inside, JSON.stringify(lc))
await shot(page, 'w3-08-4-lull-narrowed')
await page.keyboard.press('Escape'); await sleep(300)
await page.click('#viewtabs [data-view="flow"]'); await sleep(300)

/* 5. a chart zoom set by hand is kept; reset re-fits */
const z0 = await zoom(page)
await page.click('#fzIn'); await sleep(200); await page.click('#fzIn'); await sleep(300)
const z1 = await zoom(page)
await page.setViewportSize(W); await sleep(700)
const z2 = await zoom(page)
await page.setViewportSize(N); await sleep(700)
const z3 = await zoom(page)
L.ok('5. a chart zoom set by hand (+ +) is kept through widen and narrow', z1.chart === z2.chart && z2.chart === z3.chart, `fit ${z0.chart} → mine ${z1.chart} → 1440: ${z2.chart} → 390: ${z3.chart}`)
await page.click('#fzReset'); await sleep(400)
const z4 = await zoom(page)
await page.setViewportSize({ width: 844, height: 390 }); await sleep(700)
const z5 = await zoom(page)
L.ok('5. after "reset" the chart re-fits on its own again (turned sideways: a new fit)', z4.chart === z0.chart && z5.chart !== z4.chart && z5.sw <= z5.cw + 1, `reset ${z4.chart}; at 844x390 ${z5.chart} (sideways wander ${z5.sw > z5.cw})`)

/* 6. desktop at a custom chart AND panel zoom and a scroll: to phone and back */
await page.setViewportSize(W); await sleep(600)
await page.click('#fzOut'); await sleep(200); await page.click('#fzOut'); await sleep(200)
await page.click('#szOut'); await sleep(300)
const bd = await box(page, '#board'); await page.mouse.move(bd.x + bd.w / 2, bd.y + bd.h / 2); await page.mouse.wheel(0, 1500); await sleep(400)
const d0 = await zoom(page)
await page.setViewportSize(N); await sleep(700)
const d1 = await zoom(page)
await page.setViewportSize(W); await sleep(700)
const d2 = await zoom(page)
L.ok('6. desktop chart zoom 80% and panel 90%: kept through a trip to 390 and back', d0.chart === d2.chart && d0.panel === d2.panel, `1440 ${JSON.stringify(d0)} → 390 ${JSON.stringify(d1)} → 1440 ${JSON.stringify(d2)}`)
L.note('6. the chart\'s scroll after the trip (was ' + d0.top + ')', String(d2.top))
await shot(page, 'w3-08-6-desk-after-trip')
L.note('errors', errors.join(' | ') || 'none')
save('w3-08-resize', { rows: L.rows })
await browser.close()
