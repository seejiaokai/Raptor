// THE HOST'S LOOK — the Tracker's date boxes as the app's own (owner D801, 13 Oct 26). It drives the REAL built bundle,
// reaches each of the Tracker's date boxes by the Tracker's own controls, measures what a picture normalises (the box
// inside the screen and its card, its words not cut, the calendar wholly on the screen and on top, the marking pop-up
// still up after a pick) and saves a picture a step. It writes only under this checkout.
//   npm run build && node scripts/handpass/trk-datebox-look.mjs [phone|desktop]
// VERSION 6
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const WHICH = process.argv[2] || 'phone'
const [W, H, TOUCH] = WHICH === 'desktop' ? [1440, 900, false] : [390, 844, true]
/* LOOK_OUT: a run made as a DETECTOR (the break tests run this against builds broken on purpose) writes its pictures
   somewhere else — the evidence folder holds only pictures of the true build */
const OUT = process.env.LOOK_OUT ? resolve(process.env.LOOK_OUT, `look-${WHICH}`) : resolve(ROOT, `docs/img/handpass/2026-10-13-tracker-date-boxes/look-${WHICH}`)
if (existsSync(OUT)) for (const f of readdirSync(OUT)) rmSync(join(OUT, f))
mkdirSync(OUT, { recursive: true })
console.log(`trk-datebox-look VERSION 6 — ${WHICH} ${W}x${H} -> ${OUT}`)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const DIST = resolve(ROOT, 'dist')
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }
const server = createServer((req, res) => {
  let file = normalize(join(DIST, decodeURIComponent((req.url || '/').split('?')[0])))
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html')
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file))
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: TOUCH, hasTouch: TOUCH })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)))
page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) })
let n = 0, fails = 0
const shot = async name => { const f = `${String(++n).padStart(2, '0')}-${name}.png`; await page.screenshot({ path: join(OUT, f) }); console.log(`  picture ${f}`) }
const check = (ok, what, seen) => { if (!ok) fails++; console.log(`  ${ok ? 'PASS' : 'FAIL'} ${what} — saw ${typeof seen === 'string' ? seen : JSON.stringify(seen)}`) }
const press = async sel => { const l = page.locator(sel).first(); if (TOUCH) await l.tap(); else await l.click(); await page.waitForTimeout(280) }
async function step(name, fn) { console.log(`\n== ${name}`); try { await fn() } catch (e) { fails++; console.log(`  FAIL (the step could not finish) ${String(e).split('\n')[0].slice(0, 220)}`); await shot('STOPPED').catch(() => {}) } }
/* every date box of the Tracker now on screen: inside the screen, its words whole */
const boxes = () => page.evaluate(() => [...document.querySelectorAll('#page-tracker button.datebox')].filter(b => b.getBoundingClientRect().width > 0).map(b => {
  const r = b.getBoundingClientRect(), t = b.querySelector('.datebox-txt'), x = b.parentElement.querySelector('.trdate-x')
  /* the words' own right edge (the text, not its box), against the left edge of "take this date off": the button is laid
     over the box's right end, so words that reach it would be under it and still not "cut" */
  const rg = document.createRange(); rg.selectNodeContents(t); const tw = rg.getBoundingClientRect()
  return { id: b.id || (b.closest('.frow') ? 'a failures row' : '?'), l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height), words: t.textContent, cut: t.scrollWidth > t.clientWidth + 0.5, off: !!x, under: !!x && Math.min(tw.right, t.getBoundingClientRect().right) > x.getBoundingClientRect().left + 0.5, xIn: !x || (x.getBoundingClientRect().right <= r.right + 0.5 && x.getBoundingClientRect().left >= r.left) }
}))
async function cardOnTop(name) {
  await page.waitForSelector('[data-testid="dcal-card"]', { timeout: 3000 }); await page.waitForTimeout(220)
  const r = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="dcal-card"]'); const b = c.getBoundingClientRect()
    const at = (x, y) => { const h = document.elementFromPoint(x, y); return !!h && (h === c || c.contains(h)) }
    return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), centre: at(b.left + b.width / 2, b.top + b.height / 2), corners: [at(b.left + 6, b.top + 6), at(b.right - 6, b.top + 6), at(b.left + 6, b.bottom - 6), at(b.right - 6, b.bottom - 6)], month: document.querySelector('[data-testid="dcal"]').getAttribute('data-month') }
  })
  check(r.l >= 0 && r.t >= 0 && r.r <= W && r.b <= H, `${name}: the calendar is wholly on the screen`, r)
  check(r.centre && r.corners.every(Boolean), `${name}: the calendar is on top at its centre and its four corners`, { centre: r.centre, corners: r.corners })
  return r
}

/* the Tracker, signed in — and again after a reload, which ends the sign-in */
async function openTracker(fresh) {
  if (fresh) await page.goto(`http://127.0.0.1:${server.address().port}/`); else await page.reload()
  await page.waitForSelector('#loginForm, #vWeek .day', { state: 'attached' })
  if (await page.locator('#loginForm').isVisible().catch(() => false)) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]') }
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('tracker'))
  await page.waitForSelector('#flowSvg .ball', { state: 'attached', timeout: 20000 }); await page.waitForTimeout(500)
}
await openTracker(true)

await step('the side panel’s date boxes', async () => {
  /* a phone keeps the side panel behind its own tab or button: say what is on screen first */
  let bs = await boxes()
  console.log(`  date boxes on screen as the Tracker opens: ${bs.length} (${bs.map(b => b.id).join(', ')})`)
  if (!bs.length) {
    /* the Tracker's own phone tabs: Flow chart / Info / Show All — the side panel is the Info tab */
    const opener = await page.locator('#page-tracker button[data-view="info"]').count() ? 'Info' : null
    console.log(`  the control that shows the panel on this size: ${opener}`)
    if (opener) { await press('#page-tracker button[data-view="info"]'); bs = await boxes() }
  }
  await shot('side-panel')
  check(bs.length >= 3, 'the side panel’s date boxes are drawn', bs.map(b => `${b.id}: "${b.words}" ${b.w}x${b.h}`))
  check(bs.every(b => b.l >= 0 && b.r <= W), 'every box is inside the screen', bs.filter(b => !(b.l >= 0 && b.r <= W)))
  check(bs.every(b => !b.cut), 'no box’s words are cut short', bs.filter(b => b.cut).map(b => `${b.id}: "${b.words}" in ${b.w}px`))
  check(await page.locator('#page-tracker input[type="date"]').count() === 0, 'no phone’s date box is left in the Tracker', await page.locator('#page-tracker input[type="date"]').count())
  const first = bs.find(b => b.id === 'lastSyll') ? '#lastSyll' : '#page-tracker button.datebox'
  await page.locator(first).first().scrollIntoViewIfNeeded()
  await press(first)
  const c = await cardOnTop('a side-panel box')
  await shot('side-panel-calendar')
  await press(`[data-testid="dcal-day-${c.month}-05"]`)
  check(!(await page.locator('[data-testid="dcal-card"]').count()), 'a tap on a date closes the calendar', await page.locator(first).first().innerText())
  await shot('side-panel-picked')
  for (const id of ['upchit', 'targetIn', 'targetIn2']) {
    if (!(await page.locator('#' + id).count())) continue
    await page.locator('#' + id).scrollIntoViewIfNeeded(); await press('#' + id)
    const k = await cardOnTop(id); await press(`[data-testid="dcal-day-${k.month}-28"]`); await page.waitForTimeout(250)
  }
  await page.locator('#targetIn').scrollIntoViewIfNeeded().catch(() => {})
  await shot('side-panel-every-box-filled')
  const after = await boxes()
  console.log('  ' + after.map(b => `${b.id}: "${b.words}" ${b.w}x${b.h}`).join(' · '))
  check(after.every(b => !b.under && b.xIn), '"take this date off" sits inside its box’s right end, clear of the words', after.filter(b => b.under || !b.xIn).map(b => b.id))
  check(after.length >= 5 && after.every(b => b.off && !b.cut), 'with a date in every box, no box’s words are cut short and each offers "take this date off"', after.filter(b => b.cut).map(b => `${b.id}: "${b.words}" in ${b.w}px`))
  console.log(`  boxes that offer "take this date off": ${after.filter(b => b.off).map(b => b.id).join(', ') || 'none'}`)
})

await step('the marking pop-up: Done on, Failed on', async () => {
  if (TOUCH) { await press('#page-tracker button[data-view="flow"]'); await page.waitForTimeout(300) }
  await page.locator('#flowSvg .ball').first().scrollIntoViewIfNeeded().catch(() => {})
  await press('#flowSvg .ball')
  await page.waitForSelector('#pop #popDoneDate', { timeout: 5000 })
  const pop = await page.evaluate(() => { const r = document.getElementById('pop').getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) } })
  const bs = (await boxes()).filter(b => b.id === 'popDoneDate' || b.id === 'popFailDate')
  check(bs.length === 2 && bs.every(b => b.l >= pop.l && b.r <= pop.r && !b.cut), 'Done on and Failed on sit inside the pop-up, their words whole', { pop, boxes: bs })
  check(bs.every(b => b.w >= (pop.r - pop.l) - 30), 'each takes the pop-up’s width, as the box it replaced did', bs.map(b => b.w))
  await shot('pop')
  await press('#popDoneDate')
  const c = await cardOnTop('Done on')
  await shot('pop-done-calendar')
  await press(`[data-testid="dcal-day-${c.month}-02"]`)
  check(await page.locator('#pop').count() === 1 && await page.locator('#pop').isVisible(), 'the marking pop-up is still up after a date was picked on the calendar over it', await page.locator('#popDoneDate').innerText())
  await shot('pop-done-picked')
  await press('#popFailDate')
  await cardOnTop('Failed on')
  await page.mouse.click(3, 3); await page.waitForTimeout(250)
  check(await page.locator('#pop').isVisible(), 'a tap outside the calendar closes the calendar only — the pop-up stays', '')
})

const toFlow = async () => { if (TOUCH) { await press('#page-tracker button[data-view="flow"]'); await page.waitForTimeout(300) } }
const toInfo = async () => { if (TOUCH) { await press('#page-tracker button[data-view="info"]'); await page.waitForTimeout(300) } }
const closePop = async () => { if (await page.locator('#pop').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) } }


await step('a day after today in Done on is refused, with its one line (D374)', async () => {
  await closePop(); await toFlow()
  await press('#flowSvg .ball'); await page.waitForSelector('#pop #popDoneDate', { timeout: 5000 })
  const before = await page.locator('#popDoneDate').getAttribute('data-value')
  await press('#popDoneDate'); const c = await cardOnTop('Done on')
  await press('[data-testid="dcal-next"]')
  const next = await page.locator('[data-testid="dcal"]').getAttribute('data-month')
  check(next !== c.month, 'the arrow turns the month', `${c.month} -> ${next}`)
  await press(`[data-testid="dcal-day-${next}-15"]`); await page.waitForTimeout(250)
  const warn = await page.locator('#popDoneWarn').count() ? await page.locator('#popDoneWarn').innerText() : ''
  check(!!warn, 'the refusal says why, under the box', warn)
  /* an event NOT yet done: the refused day stays in the box with its line until it is put right (core.js, the leftovers' walk of 28 Sep 26) — never turned into today */
  check(await page.locator('#popDoneDate').getAttribute('data-value') === `${next}-15`, 'the refused day stays in the box, with its line — not turned into today', `was ${before}, now ${await page.locator('#popDoneDate').getAttribute('data-value')}`)
  const w = await page.evaluate(() => { const e = document.getElementById('popDoneWarn'), p = document.getElementById('pop'); if (!e) return null; const a = e.getBoundingClientRect(), b = p.getBoundingClientRect(); return { inside: a.left >= b.left && a.right <= b.right && a.bottom <= b.bottom, popBottom: Math.round(b.bottom) } })
  check(!!w && w.inside && w.popBottom <= H, 'the line sits inside the pop-up, and the pop-up inside the screen', w)
  await shot('pop-done-refused')
  await press('#popDoneDate'); const c2 = await cardOnTop('Done on, to put it right')
  check(c2.month === next, 'the calendar opens on the month of the day in the box', c2.month)
  await press('[data-testid="dcal-prev"]'); await press(`[data-testid="dcal-day-${c.month}-01"]`); await page.waitForTimeout(250)
  check(!(await page.locator('#popDoneWarn').count()), 'a day put right takes the line away', await page.locator('#popDoneDate').innerText())
})

await step('the failures list: a row’s date box, over the list', async () => {
  /* one failure, by the pop-up’s own +, then the list by the Failures title */
  if (!(await page.locator('#pop').count())) { await toFlow(); await press('#flowSvg .ball'); await page.waitForSelector('#popFailPlus') }
  await press('#popFailPlus'); await page.waitForTimeout(300)
  await closePop(); await toInfo()
  await page.locator('#failTitle').scrollIntoViewIfNeeded(); await press('#failTitle')
  await page.waitForSelector('#failLog .frow button.datebox', { timeout: 5000 })
  const row = (await boxes()).find(b => b.id === 'a failures row')
  const lst = await page.evaluate(() => { const l = document.getElementById('failLog').getBoundingClientRect(); return [Math.round(l.left), Math.round(l.right)] })
  check(!!row && row.l >= lst[0] && row.r <= lst[1] && !row.cut && !row.under && row.xIn, 'the row’s box sits inside the list, its words whole and clear of "take this date off"', { list: lst, row })
  await shot('failures-list')
  await press('#failLog .frow button.datebox'); const c = await cardOnTop('a failures row')
  await shot('failures-list-calendar')
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)
  check(!(await page.locator('[data-testid="dcal-card"]').count()) && await page.locator('#failLog').count() === 1, 'Escape closes the calendar first — the failures list stays', '')
  await press('#failLog .frow button.datebox'); await cardOnTop('a failures row, again')
  await press(`[data-testid="dcal-day-${c.month}-01"]`); await page.waitForTimeout(300)
  check(await page.locator('#failLog').count() === 1, 'the list is still up after a pick', '')
  check(await page.locator('#failLog .frow button.datebox').first().getAttribute('data-value') === `${c.month}-01`, 'the row holds the day picked', await page.locator('#failLog .frow button.datebox').first().getAttribute('data-value'))
  await shot('failures-list-picked')
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)
  check(!(await page.locator('#failLog').count()), 'Escape then closes the list', '')
})

await step('a date is kept across a reload; "take this date off" empties it, and that is kept too', async () => {
  await toInfo()
  await page.locator('#upchit').scrollIntoViewIfNeeded(); await press('#upchit')
  const c = await cardOnTop('Upchit')
  await press(`[data-testid="dcal-day-${c.month}-09"]`); await page.waitForTimeout(400)
  check(await page.locator('#upchit').getAttribute('data-value') === `${c.month}-09`, 'Upchit holds the day picked', await page.locator('#upchit').getAttribute('data-value'))
  const x = await page.evaluate(() => { const b = document.getElementById('upchit'), o = b.parentElement.querySelector('.trdate-x'); if (!o) return null; const r = o.getBoundingClientRect(), q = b.getBoundingClientRect(), f = b.closest('.field').getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), boxH: Math.round(q.height), right: Math.round(r.right), fieldRight: Math.round(f.right), label: o.getAttribute('aria-label') } })
  check(!!x && x.right <= x.fieldRight + 1 && x.label === 'Take this date off', 'the box that holds a date offers "Take this date off", inside its field', x)
  await shot('upchit-picked')
  await openTracker(false); await toInfo()
  check(await page.locator('#upchit').getAttribute('data-value') === `${c.month}-09`, 'after a reload Upchit still holds it', await page.locator('#upchit').getAttribute('data-value'))
  await page.locator('#upchit').scrollIntoViewIfNeeded()
  await press('#upchit ~ .trdate-x'); await page.waitForTimeout(400)
  check((await page.locator('#upchit').getAttribute('data-value') || '') === '' && !(await page.locator('#upchit ~ .trdate-x').count()), 'the button empties the box and goes', await page.locator('#upchit').innerText())
  await shot('upchit-taken-off')
  await openTracker(false); await toInfo()
  check((await page.locator('#upchit').getAttribute('data-value') || '') === '', 'after a reload Upchit is still empty', await page.locator('#upchit').innerText())

})

console.log(`\n${fails ? fails + ' FAILED' : 'no failed check'} · ${n} pictures · ${errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no console or page errors'}`)
await browser.close(); server.close()
process.exit(fails ? 1 : 0)
