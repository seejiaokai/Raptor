/* w3 item 4 — the seams (R67, R68, R112, R113):
   - switching tabs away and back keeps the chart;
   - nothing of the Tracker shows on other pages;
   - Escape / Delete / Ctrl+Z pressed on ANOTHER page never reach the Tracker
     (each first proved to WORK on the Tracker, so a quiet result means the
     listener was really off, not that the setup was wrong);
   - while on the Tracker the PAGE never scrolls; leaving restores scrolling;
   - the schedule's ALL AVAIL window closes when the Tracker tab opens (D66). */
import { open, shot, save, log, toPage, toTracker, reveal, DESK } from './trk-lib.mjs'
import { tap, type, put } from './lib.mjs'
import { sleep, ball, tapBall, menuItem, dlgText, dlgPress, bubble } from './trk-w3-lib.mjs'

const L = log()
const wedges = (page, id) => page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null }, id)
/* anything of the Tracker a person could see while another page is up. A
   dozing section (content-visibility:hidden) is not painted but still reports
   boxes for its insides, so what counts is what the screen HITS: a grid of
   points across the window, and the details bubble, which lives outside the
   section on <body>. */
const trackerShowing = page => page.evaluate(() => {
  const sec = document.getElementById('page-tracker')
  const hits = new Set()
  for (let y = 5; y < innerHeight; y += 40) for (let x = 5; x < innerWidth; x += 40) {
    const h = document.elementFromPoint(x, y)
    if (h && sec && sec.contains(h)) hits.add(h.tagName + '#' + h.id + '.' + (typeof h.className === 'string' ? h.className.slice(0, 24) : ''))
  }
  const bub = document.getElementById('detailBubble')
  const bshown = !!bub && getComputedStyle(bub).display !== 'none'
  return { sectionClass: sec ? sec.className : null, hitPoints: [...hits].slice(0, 6), bubble: bshown }
})
const pageScroll = page => page.evaluate(() => ({ y: Math.round(window.scrollY), sh: document.documentElement.scrollHeight, ih: innerHeight, trOn: document.body.classList.contains('tr-on') }))
const navByKeyboard = async (page, id) => { await page.focus(`#topnav a[data-page="${id}"]`); await page.keyboard.press('Enter'); await page.waitForFunction(p => window.CURPAGE === p, id); await sleep(400) }

const { browser, page, errors } = await open({ size: DESK, who: 'a' })

/* ---- A. the page never scrolls on the Tracker ---- */
let ps = await pageScroll(page)
L.note('A. on the Tracker', JSON.stringify(ps))
for (const sel of ['#page-tracker .legend', '#page-tracker header', '.topbar']) {
  const b = await page.locator(sel).first().boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.wheel(0, 800); await sleep(250)
}
await page.keyboard.press('End'); await sleep(200); await page.keyboard.press('PageDown'); await sleep(200)
ps = await pageScroll(page)
L.ok('A. a wheel over the legend / bar / top bar, End, PageDown — the PAGE does not move', ps.y === 0, JSON.stringify(ps))
/* the chart and the panel scroll in their own boxes */
const bd = await page.locator('#board').boundingBox()
await page.mouse.move(bd.x + bd.width / 2, bd.y + bd.height / 2); await page.mouse.wheel(0, 1200); await sleep(300)
const sp = await page.locator('#side').boundingBox()
await page.mouse.move(sp.x + sp.width / 2, sp.y + sp.height / 2); await page.mouse.wheel(0, 600); await sleep(300)
const inner = await page.evaluate(() => ({ board: document.getElementById('board').scrollTop, side: document.getElementById('side').scrollTop, page: window.scrollY }))
L.ok('A. …while the chart and the panel scroll inside their own boxes', inner.board > 0 && inner.side > 0 && inner.page === 0, JSON.stringify(inner))
await shot(page, 'w3-04-A-tracker-scrolled-inside')

/* ---- B. set up three things the other page's keys could reach ---- */
await page.mouse.move(bd.x + bd.width / 2, bd.y + bd.height / 2)
await tapBall(page, 'ST-01')
await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(500)
const marked = await wedges(page, 'ST-01')
/* prove Ctrl+Z works HERE, then put the mark back with Ctrl+Y */
await page.mouse.click(bd.x + 20, bd.y + bd.height - 30); await sleep(200)
await page.keyboard.press('Control+z'); await sleep(400)
const undone = await wedges(page, 'ST-01')
await page.keyboard.press('Control+y'); await sleep(400)
const redone = await wedges(page, 'ST-01')
L.ok('B. on the Tracker, Ctrl+Z takes the mark back and Ctrl+Y puts it back (the keys are live here)', JSON.stringify(undone) !== JSON.stringify(marked) && JSON.stringify(redone) === JSON.stringify(marked), `marked ${JSON.stringify(marked)} undone ${JSON.stringify(undone)} redone ${JSON.stringify(redone)}`)
const scrollBefore = await page.evaluate(() => ({ t: document.getElementById('board').scrollTop, l: document.getElementById('board').scrollLeft, balls: document.querySelectorAll('#flowSvg .ball').length, syl: document.querySelector('#sylSel option:checked').textContent, crew: document.querySelector('#activeSel option:checked').textContent }))
/* Show All open (Escape would close it here — item 2 proved that) */
await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' })

/* ---- C. leave by keyboard, press the three keys on other pages ---- */
await navByKeyboard(page, 'inputs')
let ts = await trackerShowing(page)
L.ok('C. on Inputs, nothing of the Tracker shows (Show All was open when we left)', !ts.hitPoints.length && !ts.bubble, JSON.stringify(ts))
await shot(page, 'w3-04-C-inputs-after-leaving-showall-open')
ps = await pageScroll(page)
L.ok('C. leaving the Tracker gives the page its scrolling back (body lock off)', !ps.trOn, JSON.stringify(ps))
await page.mouse.move(700, 600); await page.mouse.wheel(0, 700); await sleep(300)
ps = await pageScroll(page)
L.note('C. a wheel on the Inputs page scrolls the page', JSON.stringify(ps))
await page.keyboard.press('Escape'); await sleep(200)
await page.keyboard.press('Control+z'); await sleep(300)
await toPage(page, 'editsched')
await page.keyboard.press('Control+z'); await sleep(300)
await page.keyboard.press('Escape'); await sleep(200)
ts = await trackerShowing(page)
L.ok('C. on Edit Schedule, nothing of the Tracker shows', !ts.hitPoints.length && !ts.bubble, JSON.stringify(ts))
await toTracker(page)
L.ok('C. back on the Tracker: Show All is STILL open (Escape on the other pages did not reach it)', await page.locator('#showAllPanel').isVisible().catch(() => false), '')
await page.click('#saClose'); await sleep(250)
const after = await wedges(page, 'ST-01')
L.ok('C. …and the mark is still there (Ctrl+Z on Inputs and on Edit Schedule did not undo it)', JSON.stringify(after) === JSON.stringify(marked), `${JSON.stringify(marked)} → ${JSON.stringify(after)}`)
const scrollAfter = await page.evaluate(() => ({ t: document.getElementById('board').scrollTop, l: document.getElementById('board').scrollLeft, balls: document.querySelectorAll('#flowSvg .ball').length, syl: document.querySelector('#sylSel option:checked').textContent, crew: document.querySelector('#activeSel option:checked').textContent }))
L.ok('C. …and the chart is kept: same chart, crew, balls and scroll', JSON.stringify(scrollBefore) === JSON.stringify(scrollAfter), `${JSON.stringify(scrollBefore)} → ${JSON.stringify(scrollAfter)}`)
await shot(page, 'w3-04-C-back-on-tracker')

/* ---- D. Delete: select a ball in arrange mode; prove Delete asks HERE; then press it elsewhere ---- */
await menuItem(page, 'syl', 'arrangeBtn')
/* pan to the ball BEFORE picking Select — with Select on, a drag on empty
   space draws a selection box instead of panning */
L.note('D. ST-02 brought into view', String(await reveal(page, 'ST-02')))
await page.locator('#arrTools').getByRole('button', { name: '▣ Select', exact: true }).click(); await sleep(250)
const b2 = await ball(page, 'ST-02').boundingBox()
await page.mouse.click(b2.x + b2.width / 2, b2.y + b2.height / 2); await sleep(300)
await page.keyboard.press('Delete'); await sleep(400)
const q = await dlgText(page)
L.ok('D. on the Tracker, Delete with ST-02 selected asks to delete it (the key is live here)', !!q && /ST-02/.test(q), q || 'no question')
await shot(page, 'w3-04-D-delete-asks-on-tracker')
if (q) await dlgPress(page, /^Cancel/)
await page.click('#topnav a[data-page="quals"]'); await page.waitForFunction(() => window.CURPAGE === 'quals'); await sleep(400)
await page.keyboard.press('Delete'); await sleep(300)
await page.keyboard.press('Backspace'); await sleep(300)
await toTracker(page).catch(() => {})
await sleep(300)
const q2 = await dlgText(page)
L.ok('D. Delete / Backspace on the Quals page did not reach the chart (no question, ST-02 still there)', !q2 && (await ball(page, 'ST-02').count()) === 1, (q2 || 'no question') + ' · ST-02 balls: ' + (await ball(page, 'ST-02').count()))
await menuItem(page, 'syl', 'arrangeBtn')   // Done editing chart

/* ---- E. the ALL AVAIL window on the schedule, then the Tracker tab ---- */
await page.click('#topnav a[data-page="editsched"]'); await page.waitForFunction(() => window.CURPAGE === 'editsched'); await sleep(500)
const DI = 5
await page.click(`#eWeek [data-sbday="${DI}"]:visible`); await page.waitForSelector('#schedBoard'); await sleep(600)
await tap(page, `[data-padd="${DI}"]`)
const n = await page.evaluate(di => document.querySelectorAll(`#schedBoard [data-bfld^="ap:${di}."][data-bfld$=".prog"]`).length, DI)
const ri = n - 1
await type(page, `[data-bfld="ap:${DI}.${ri}.prog"]`, 'FAMILY DAY')
await type(page, `[data-bfld="ap:${DI}.${ri}.str"]`, '10:00')
await type(page, `[data-bfld="ap:${DI}.${ri}.end"]`, '14:00')
const putRes = await put(page, `[data-fill="a:${DI}.${ri}.+"]`, ['allavail'])
L.note('E. an ALL AVAIL row on Saturday\'s Common Programme', 'row ' + ri + ' · ' + putRes)
const chip = page.locator('#schedBoard [data-oilsent]:visible').first()
let winOpen = false
if (await chip.count()) {
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await chip.click(); await sleep(500)
  winOpen = (await page.locator('.availwin:not([hidden])').count()) > 0
}
L.ok('E. the ALL AVAIL count chip opens its window', winOpen, winOpen ? 'open' : 'no window (chip count ' + (await chip.count()) + ')')
await shot(page, 'w3-04-E-allavail-open')
/* now the Tracker tab — straight from the top nav if a person can reach it */
let how = 'top nav with the board open'
try { await page.click('#topnav a[data-page="tracker"]', { timeout: 3000 }) }
catch (e) {
  how = 'the board covers the nav — closed it with its own Close first (window ' + ((await page.locator('.availwin:not([hidden])').count()) ? 'still open' : 'closed by that') + ')'
  const x = page.locator('#schedBoard').getByRole('button', { name: /Close/ }).first(); await x.click(); await sleep(500)
  await page.click('#topnav a[data-page="tracker"]')
}
await page.waitForFunction(() => window.CURPAGE === 'tracker'); await sleep(600)
const still = await page.locator('.availwin:not([hidden])').count()
L.ok('E. opening the Tracker tab closes the ALL AVAIL window (D66)', still === 0, `reached the Tracker via ${how}; window elements shown: ${still}`)
await shot(page, 'w3-04-E-tracker-after-allavail')
await page.click('#topnav a[data-page="editsched"]'); await sleep(600)
L.ok('E. back on Edit Schedule the window stays closed', (await page.locator('.availwin:not([hidden])').count()) === 0, '')
L.note('errors', errors.join(' | ') || 'none')
save('w3-04-seams', { rows: L.rows })
await browser.close()
