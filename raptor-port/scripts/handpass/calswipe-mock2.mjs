// A MOCK-UP, NOT A BUILD — [CAL-PHONE-SWIPE-FIT], the fourth question (owner, 13 Oct 26 — "Show me how it looks like first
// before I decide"): the app's OTHER date boxes that are still the phone's own, each pictured at phone size AS BUILT and
// then with the app's own date field DRAWN in its place (D795's field — calswipe-mock.mjs draws it in "Every Thursday").
//   Admin → Users → the new person's "Post in" · Admin → Data → "Clear edit history…" · the Leave War's post-out sheet
//   ("PO from") · a medical input's upchit date, where it can be reached.
// HOW: real taps to the real screen, a picture; then the date box is hidden and a field is drawn where it stood, sized
// and coloured from the box itself (class "mockx"). The open month is the app's own, copied as drawn out of the real
// "Add a holiday" window. NOTHING INJECTED IS IN THE APP. Chromium on Windows: these boxes all fit here.
//   npm run build && node scripts/handpass/calswipe-mock2.mjs [out dir]     (default docs/mock/2026-10-13-cal-swipe-fit)
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'docs/mock/2026-10-13-cal-swipe-fit'
const DPR = +(process.env.HP_DPR || 2)
mkdirSync(OUT, { recursive: true })
const DIST = resolve('dist')
if (!existsSync(join(DIST, 'index.html'))) { console.error('no dist/index.html — run npm run build first'); process.exit(1) }
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }
const server = createServer((req, res) => {
  let file = normalize(join(DIST, decodeURIComponent((req.url || '/').split('?')[0])))
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html')
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file))
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const URL = `http://127.0.0.1:${server.address().port}/`
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
await page.clock.setFixedTime(new Date('2026-10-13T09:00:00'))
const errors = []
page.on('pageerror', e => errors.push(String(e).slice(0, 200)))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
const say = (step, what) => console.log(`${step}: ${typeof what === 'string' ? what : JSON.stringify(what)}`)
const tap = async sel => { await page.locator(sel).first().tap(); await page.waitForTimeout(350) }
const shot = async name => { await page.screenshot({ path: join(OUT, `o390-${name}.png`) }); say('picture', `o390-${name}.png`) }
const visible = sel => page.evaluate(s => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().width > 0 }, sel)
const buttons = () => page.evaluate(() => [...document.querySelectorAll('button,summary,[role=tab]')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.top < innerHeight * 3 }).map(b => (b.id || b.getAttribute('data-testid') || '') + ':' + b.textContent.trim().slice(0, 24)).slice(0, 70))
const tapText = async (scope, re) => {
  const hit = await page.evaluate(([scope, src]) => {
    const re = new RegExp(src, 'i')
    const b = [...document.querySelectorAll(scope)].find(b => b.getBoundingClientRect().width > 0 && re.test(b.textContent.trim()))
    if (!b) return false
    b.scrollIntoView({ block: 'center' }); b.setAttribute('data-mocktap', '1'); return true
  }, [scope, re.source])
  if (!hit) return false
  await page.locator('[data-mocktap]').first().tap(); await page.waitForTimeout(450)
  await page.evaluate(() => document.querySelectorAll('[data-mocktap]').forEach(e => e.removeAttribute('data-mocktap')))
  return true
}
const unpaint = () => page.evaluate(() => {
  document.querySelectorAll('.mockx').forEach(e => e.remove())
  document.querySelectorAll('[data-mockhid]').forEach(e => { e.style.display = ''; e.removeAttribute('data-mockhid') })
})
/* the date box hidden and a field drawn where it stood — its size, border, ground and letters taken from the box itself */
const draw = (sel, words, cal) => page.evaluate(([sel, words, cal]) => {
  const inp = document.querySelector(sel); if (!inp) return null
  const cs = getComputedStyle(inp), r = inp.getBoundingClientRect()
  const b = document.createElement('button')
  b.type = 'button'; b.className = 'mockx'
  b.style.cssText = `display:${cs.display === 'block' ? 'flex' : 'inline-flex'};align-items:center;justify-content:space-between;gap:8px;box-sizing:border-box;` +
    `width:${r.width}px;height:${r.height}px;margin:${cs.margin};padding:${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft};` +
    `border:${cs.borderTopWidth} solid ${cal ? 'var(--accent)' : cs.borderTopColor};border-radius:${cs.borderRadius};background:${cs.backgroundColor};` +
    `color:${cs.color};font:${cs.font};text-align:left;cursor:pointer;vertical-align:${cs.verticalAlign};flex:${cs.flex}`
  b.innerHTML = `<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${words}</span><span aria-hidden="true" style="flex:0 0 auto;font-size:11px;color:${cal ? 'var(--accent)' : 'var(--ink-3)'}">${cal ? '&#9652;' : '&#9662;'}</span>`
  inp.style.display = 'none'; inp.setAttribute('data-mockhid', '1'); inp.after(b)
  if (cal) {
    const box = document.createElement('div')
    box.className = 'hol-cal mockx'
    box.style.cssText = 'flex:1 1 100%;grid-column:1 / -1;min-width:0;width:100%;box-sizing:border-box;margin-top:6px;padding:8px 8px 6px;border:1px solid var(--edge);border-radius:10px;background:var(--bg)'
    box.innerHTML = cal
    const ft = box.querySelector('.rpick-ft'); if (ft) ft.remove()
    const rp = box.querySelector('.rpick'); if (rp) rp.style.maxWidth = 'none'
    /* after the row the box stands in, so the month takes the form's width */
    const row = b.closest('.mfield, .bidsheet-row, .inped-f') || b
    row.after(box); box.scrollIntoView({ block: 'nearest' })
  } else b.scrollIntoView({ block: 'center' })
  return { was: Math.round(r.width), font: cs.font }
}, [sel, words, cal || ''])

await page.goto(URL + '?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{visibility:hidden !important}' })

/* the app's own small month, copied as drawn: Inputs ⚙ → Calendar… → Holidays → + Add → today (real taps), then closed */
await page.evaluate(() => window.go('inputs'))
await tap('#inGear'); await tap('[data-testid="iset-days"]')
await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {})
await tap('[data-testid="days-tab-holidays"]'); await tap('[data-testid="hol-add"]')
say('the small month opens on', await page.locator('[data-testid="holcal-month"]').innerText())
const grab = () => page.locator('.hol-cal .rpick').evaluate(e => e.outerHTML)
await tap('[data-testid="holcal-day-2026-10-13"]')
const CAL = await grab()
for (let i = 0; i < 12 && !(await page.locator('[data-testid="holcal-day-2026-07-14"]').count()); i++) await tap('[data-testid="holcal-prev-month"]')
await tap('[data-testid="holcal-day-2026-07-14"]')
const CAL_JUL = await grab()
await tap('[data-testid="hol-cancel"]')
await page.locator('[data-testid="win-days-x"]').evaluate(e => e.click()).catch(() => {})
await page.waitForTimeout(200)

const WORDS = 'Tue 13 Oct 2026'
/* `cal` null: the closed field only (in a two-column form the month's place is the build's to settle, not a drawing's) */
async function one(name, sel, words = WORDS, cal = CAL) {
  if (!(await visible(sel))) { say(name, 'NOT REACHED — ' + sel + ' is not on screen'); say('buttons', await buttons()); return false }
  await page.locator(sel).evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
  say(name + ' — REAL, the box holds', await page.locator(sel).inputValue())
  await shot(name + '-1-asbuilt')
  say(name + ' — DRAWN, closed', await draw(sel, words))
  await shot(name + '-2-field')
  await unpaint()
  if (!cal) return true
  await draw(sel, words, cal); await page.waitForTimeout(150)
  await shot(name + '-3-open')
  await unpaint()
  return true
}

/* ---- Admin → Users → the new person's Post in ---- */
await page.evaluate(() => window.go('admin')); await page.waitForTimeout(400)
await tapText('#page-admin button', /^Users/)
if (!(await visible('#accAddPostIn'))) await tapText('#page-admin button', /new person|add a person|\+ ?person|^\+ ?add|^add$/)
await one('users-postin', '#accAddPostIn', WORDS, null)

/* ---- Admin → Data → Clear edit history… ---- */
await page.evaluate(() => window.go('admin')); await page.waitForTimeout(300)
if (!(await visible('#admLogMode'))) { await tapText('#page-admin button', /back|‹|admin/).catch(() => {}); await tapText('#page-admin button', /^Data/) }
if (!(await visible('#admLogDate'))) await tapText('#page-admin button', /clear edit history/)
await one('admin-clear', '#admLogDate', '<span style="color:var(--ink-3)">Pick a date</span>', null)

/* ---- the Leave War → a man's day → Post out → PO from ---- */
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(700)
await page.evaluate(() => window.lwSetRole && window.lwSetRole('admin')); await page.waitForTimeout(300)
const jul = page.locator('[data-testid="month-JUL"]'); if (await jul.count()) { await jul.first().tap(); await page.waitForTimeout(600) }
const cell = page.locator('[data-testid="cell-slipway-2026-07-14"]')
if (await cell.count()) { await cell.first().scrollIntoViewIfNeeded(); await cell.first().tap(); await page.waitForTimeout(500) }
if (await page.locator('[data-testid="bid-postout"]').count()) await tap('[data-testid="bid-postout"]')
await one('lw-postout', '[data-testid="po-date"]', 'Tue 14 Jul 2026', CAL_JUL)

/* ---- a medical input's upchit date, where it can be reached by taps ---- */
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(400)
await tapText('button,[role=tab]', /^medical/)
say('medical — what is on screen', (await buttons()).filter(b => /up|chit|med/i.test(b)))
if (!(await visible('#inpEditUpDate'))) await tapText('button', /upchit/)
await one('upchit', '#inpEditUpDate')

console.log(errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors or page errors')
await browser.close(); server.close()
