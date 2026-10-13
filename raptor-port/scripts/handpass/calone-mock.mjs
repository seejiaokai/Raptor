// A MOCK-UP, NOT A BUILD — [ONE-DATE-CALENDAR] (owner D796, 13 Oct 26): ONE date calendar of the app's own, on the iPhone
// calendar's pattern in the Raptor look — the month and year as a title that opens two scrolled lists (months, years), a
// Today icon right of the year, two arrows at the right, large round dates, no Reset and no tick: a tap picks.
// Pictured at phone size on the app's REAL screens, reached by real taps:
//   "Every Thursday" (the calendar over the window; then its month-and-year lists) · "Add a holiday" (a run of dates —
//   the calendar inside the form) · the Leave War's post-out date · a new person's Post in — and, AS BUILT, the three
//   small calendars the app draws today (the Leave War's, an input's own window's, the schedule's "Jump to a date").
// HOW: a picture as built; then the proposed calendar is drawn on the page (class "mockx") from the app's own colours,
// type and Today icon (the week picker's page-with-a-number). NOTHING INJECTED IS IN THE APP.
//   npm run build && node scripts/handpass/calone-mock.mjs [out dir]     (default docs/mock/2026-10-13-cal-swipe-fit)
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
/* today is Tue 3 Nov 26, so "today" shows in the month "Every Thursday" opens on */
const TODAY = '2026-11-03'
await page.clock.setFixedTime(new Date(TODAY + 'T09:00:00'))
const errors = []
page.on('pageerror', e => errors.push(String(e).slice(0, 200)))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
const say = (step, what) => console.log(`${step}: ${typeof what === 'string' ? what : JSON.stringify(what)}`)
const tap = async sel => { await page.locator(sel).first().tap(); await page.waitForTimeout(350) }
const shot = async name => { await page.screenshot({ path: join(OUT, `one-${name}.png`) }); say('picture', `one-${name}.png`) }
const visible = sel => page.evaluate(s => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().width > 0 }, sel)
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

/* ---- THE PROPOSED CALENDAR, as a drawing: its styles and its builder live on the page for the run ---- */
const CSS = `
.mx-scrim{position:fixed;inset:0;z-index:99990;background:rgba(4,7,10,.52)}
.mx-card{position:fixed;z-index:99991;left:50%;top:50%;transform:translate(-50%,-50%);width:min(350px,calc(100vw - 24px));box-sizing:border-box;
  background:var(--panel);border:1px solid var(--edge-2);border-radius:16px;padding:10px 12px 12px;box-shadow:0 18px 50px rgba(0,0,0,.6)}
.mx-cal{color:var(--ink);font-family:inherit}
.mx-hd{display:flex;align-items:center;gap:4px;min-height:44px;padding-bottom:4px}
.mx-title{display:inline-flex;align-items:center;gap:7px;background:none;border:0;padding:8px 4px;color:var(--ink);font-family:inherit;font-size:17px;font-weight:800;letter-spacing:.01em;white-space:nowrap}
.mx-title i{font-style:normal;color:var(--accent);font-size:12px}
.mx-title.xopen{color:var(--accent)}
.mx-cal .wc-today{margin:0 0 0 2px;flex:0 0 auto}
.mx-sp{flex:1 1 auto}
.mx-nav{flex:0 0 auto;width:40px;height:40px;border-radius:10px;border:1px solid var(--edge);background:var(--panel-2);color:var(--ink);font-family:inherit;font-size:20px;line-height:1;padding:0}
.mx-dow{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));padding:4px 0 2px}
.mx-dow span{text-align:center;font-size:10px;font-weight:800;letter-spacing:.08em;color:var(--ink-3)}
.mx-dow span.xmk{color:var(--accent)}
.mx-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}
.mx-d{height:44px;display:flex;align-items:center;justify-content:center;position:relative}
.mx-d b{position:relative;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums}
.mx-d.xwe b{color:var(--ink-3)}
.mx-cal.xmarked .mx-d b{color:var(--ink-2);font-weight:500}
.mx-cal.xmarked .mx-d.xwe b{color:var(--ink-3)}
.mx-cal.xmarked .mx-d.xmk b{color:var(--ink);font-weight:800}
.mx-d.xtd b{background:rgba(59,198,232,.14);color:var(--accent) !important;font-weight:800 !important}
.mx-d.xsel b{background:var(--accent);color:#06222B !important;font-weight:800 !important}
.mx-d.xin::before{content:'';position:absolute;left:0;right:0;top:3px;bottom:3px;background:rgba(59,198,232,.16)}
.mx-d.xfr::before{left:50%}
.mx-d.xto::before{right:50%}
.mx-ft{padding:8px 4px 0;font-size:12.5px;font-weight:700;color:var(--accent)}
.mx-wheels{position:relative;height:264px;display:grid;grid-template-columns:1.25fr 1fr;grid-template-rows:264px;align-items:center;overflow:hidden}
.mx-band{position:absolute;left:4px;right:4px;top:50%;height:44px;transform:translateY(-50%);border-radius:12px;background:var(--panel-2);border:1px solid var(--edge)}
.mx-col{position:relative;height:308px;display:flex;flex-direction:column;align-items:center}
.mx-col span{flex:0 0 44px;display:flex;align-items:center;font-size:19px;font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums}
.mx-inline{border:1px solid var(--edge);border-radius:12px;background:var(--bg);padding:6px 8px 10px}
`
await page.addInitScript(() => {
  const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  /* o: { y, m, today, from, to, markWd (0 = Monday), wheels, foot } → the calendar's element */
  window.mxCal = o => {
    const el = document.createElement('div')
    el.className = 'mx-cal' + (o.markWd != null ? ' xmarked' : '')
    const todayNum = +o.today.slice(8, 10)
    let h = `<div class="mx-hd"><button type="button" class="mx-title${o.wheels ? ' xopen' : ''}">${MON[o.m - 1]} ${o.y}<i>${o.wheels ? '&#9662;' : '&#8250;'}</i></button>` +
      `<button type="button" class="wc-today" aria-label="Go to today"><span class="wc-pg"><span class="wc-n">${todayNum}</span></span></button><span class="mx-sp"></span>` +
      (o.wheels ? '' : `<button type="button" class="mx-nav">&#8249;</button><button type="button" class="mx-nav">&#8250;</button>`) + `</div>`
    if (o.wheels) {
      const fade = [0.1, 0.3, 0.62, 1, 0.62, 0.3, 0.1]
      const col = items => `<div class="mx-col">${items.map((t, i) => `<span style="opacity:${fade[i]}">${t}</span>`).join('')}</div>`
      const months = [-3, -2, -1, 0, 1, 2, 3].map(k => MON[(((o.m - 1 + k) % 12) + 12) % 12])
      const years = [-3, -2, -1, 0, 1, 2, 3].map(k => o.y + k)
      h += `<div class="mx-wheels"><div class="mx-band"></div>${col(months)}${col(years)}</div>`
    } else {
      h += `<div class="mx-dow">${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => `<span class="${o.markWd === i ? 'xmk' : ''}">${d}</span>`).join('')}</div><div class="mx-grid">`
      const lead = (new Date(Date.UTC(o.y, o.m - 1, 1)).getUTCDay() + 6) % 7
      const dim = new Date(Date.UTC(o.y, o.m, 0)).getUTCDate()
      for (let i = 0; i < 42; i++) {
        const d = i - lead + 1
        if (d < 1 || d > dim) { h += '<div class="mx-d"></div>'; continue }
        const k = iso(o.y, o.m, d), wd = i % 7
        const c = ['mx-d']
        if (wd >= 5) c.push('xwe')
        if (o.markWd === wd) c.push('xmk')
        if (k === o.today) c.push('xtd')
        if (o.from && (k === o.from || k === o.to)) c.push('xsel')
        if (o.from && o.to && o.to > o.from && k >= o.from && k <= o.to) c.push('xin', k === o.from ? 'xfr' : k === o.to ? 'xto' : 'xmid')
        h += `<div class="${c.join(' ')}"><b>${d}</b></div>`
      }
      h += '</div>'
      if (o.foot) h += `<div class="mx-ft">${o.foot}</div>`
    }
    el.innerHTML = h
    return el
  }
  /* the calendar floating over the page, as the phone's own does */
  window.mxOver = o => {
    const s = document.createElement('div'); s.className = 'mx-scrim mockx'
    const c = document.createElement('div'); c.className = 'mx-card mockx'
    c.appendChild(window.mxCal(o)); document.body.append(s, c)
  }
})
/* a date box hidden and the app's own field drawn where it stood, sized and coloured from the box itself */
const field = (sel, words, open) => page.evaluate(([sel, words, open]) => {
  const inp = document.querySelector(sel); if (!inp) return false
  const cs = getComputedStyle(inp), r = inp.getBoundingClientRect()
  const b = document.createElement('button')
  b.type = 'button'; b.className = 'mockx'
  b.style.cssText = `display:${cs.display === 'block' ? 'flex' : 'inline-flex'};align-items:center;justify-content:space-between;gap:8px;box-sizing:border-box;` +
    `width:${r.width}px;height:${r.height}px;margin:${cs.margin};padding:${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft};` +
    `border:${cs.borderTopWidth} solid ${open ? 'var(--accent)' : cs.borderTopColor};border-radius:${cs.borderRadius};background:${cs.backgroundColor};` +
    `color:${cs.color};font:${cs.font};text-align:left;vertical-align:${cs.verticalAlign};flex:${cs.flex}`
  b.innerHTML = `<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${words}</span><span aria-hidden="true" style="flex:0 0 auto;font-size:11px;color:${open ? 'var(--accent)' : 'var(--ink-3)'}">&#9662;</span>`
  inp.style.display = 'none'; inp.setAttribute('data-mockhid', '1'); inp.after(b)
  return true
}, [sel, words, !!open])

await page.goto(URL + '?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{visibility:hidden !important}' + CSS })

/* ================= "Every Thursday": the calendar over the window, then its month-and-year lists ================= */
await page.evaluate(() => window.go('inputs'))
await tap('#inGear'); await tap('[data-testid="iset-days"]')
await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {})
say('REAL — the Calendar window opens on', await page.locator('[data-testid="days-month"]').innerText())
await tap('[data-testid="days-wd-3"]')
say('REAL — From holds', await page.locator('#everyFrom').inputValue())
await field('#everyFrom', 'Thu 5 Nov 2026', true)
await page.evaluate(t => window.mxOver({ y: 2026, m: 11, today: t, from: '2026-11-05', to: '2026-11-05', markWd: 3 }), TODAY)
await shot('1-every-calendar')
await page.evaluate(() => document.querySelectorAll('.mx-scrim,.mx-card').forEach(e => e.remove()))
await page.evaluate(t => window.mxOver({ y: 2026, m: 11, today: t, wheels: true }), TODAY)
await shot('2-every-month-year')
await unpaint()
await tap('[data-testid="every-cancel"]')

/* ================= "Add a holiday": a run of dates — the calendar inside the form ================= */
await tap('[data-testid="days-tab-holidays"]'); await tap('[data-testid="hol-add"]')
for (let i = 0; i < 12 && !(await page.locator('[data-testid="holcal-day-2026-11-09"]').count()); i++) await tap('[data-testid="holcal-next-month"]')
await tap('[data-testid="holcal-day-2026-11-09"]'); await tap('[data-testid="holcal-day-2026-11-10"]')
const span = await page.locator('[data-testid="holcal-selection"]').innerText()
say('REAL — the run picked, in the form\'s own words', span)
await page.locator('.hol-cal').evaluate(e => e.scrollIntoView({ block: 'center' }))
await shot('3-holiday-asbuilt')
await page.evaluate(([t, span]) => {
  const rp = document.querySelector('.hol-cal .rpick')
  rp.style.display = 'none'; rp.setAttribute('data-mockhid', '1')
  const box = document.createElement('div'); box.className = 'mx-inline mockx'
  box.appendChild(window.mxCal({ y: 2026, m: 11, today: t, from: '2026-11-09', to: '2026-11-10', foot: span }))
  rp.after(box); box.scrollIntoView({ block: 'center' })
}, [TODAY, span])
await page.waitForTimeout(150)
await shot('4-holiday-run')
await unpaint()
await tap('[data-testid="hol-cancel"]')
await page.locator('[data-testid="win-days-x"]').evaluate(e => e.click()).catch(() => {})

/* ================= Admin → Users → a new person's Post in ================= */
await page.evaluate(() => window.go('admin')); await page.waitForTimeout(400)
await tapText('#page-admin button', /^Users/)
if (await visible('#accAddPostIn')) {
  await page.locator('#accAddPostIn').evaluate(e => e.scrollIntoView({ block: 'center' }))
  await field('#accAddPostIn', 'Tue 3 Nov 2026', true)
  await page.evaluate(t => window.mxOver({ y: 2026, m: 11, today: t, from: t, to: t }), TODAY)
  await shot('5-users-postin')
  await unpaint()
} else say('users', 'NOT REACHED')

/* ================= the Leave War: AS BUILT its own range calendar; then the post-out date with the new one ================= */
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(700)
await page.evaluate(() => window.lwSetRole && window.lwSetRole('admin')); await page.waitForTimeout(300)
const jul = page.locator('[data-testid="month-JUL"]'); if (await jul.count()) { await jul.first().tap(); await page.waitForTimeout(600) }
const cell = page.locator('[data-testid="cell-slipway-2026-07-14"]')
if (await cell.count()) { await cell.first().scrollIntoViewIfNeeded(); await cell.first().tap(); await page.waitForTimeout(500) }
if (await tapText('button', /^pick a range$/)) { await page.waitForTimeout(300); await shot('6-lw-range-asbuilt'); await tapText('button', /^just this day$/) }
else say('lw range', 'NOT REACHED')
if (await page.locator('[data-testid="bid-postout"]').count()) await tap('[data-testid="bid-postout"]')
if (await visible('[data-testid="po-date"]')) {
  await field('[data-testid="po-date"]', 'Tue 14 Jul 2026', true)
  await page.evaluate(t => window.mxOver({ y: 2026, m: 7, today: t, from: '2026-07-14', to: '2026-07-14' }), TODAY)
  await shot('7-lw-postout')
  await unpaint()
} else say('lw postout', 'NOT REACHED')

/* ================= AS BUILT: the schedule's "Jump to a date" ================= */
await page.reload(); await page.waitForTimeout(600)
if (await visible('#luser')) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]') }
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.addStyleTag({ content: '#toastEl{visibility:hidden !important}' })
const calBtn = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.getBoundingClientRect().width > 0 && /jump to a date|calendar|pick a (date|week)/i.test((b.getAttribute('aria-label') || '') + ' ' + (b.title || ''))); if (b) b.setAttribute('data-mocktap', '1'); return b ? (b.id || b.getAttribute('aria-label')) : null })
say('the week picker\'s button', calBtn)
if (calBtn) { await page.locator('[data-mocktap]').first().tap(); await page.waitForTimeout(500) }
if (await visible('#weekCal')) await shot('8-weekpicker-asbuilt'); else say('week picker', 'NOT REACHED')

console.log(errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors or page errors')
await browser.close(); server.close()
