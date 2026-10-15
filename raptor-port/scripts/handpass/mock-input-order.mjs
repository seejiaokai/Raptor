/* MOCK-UP for his idea D913 (15 Oct 26): "Should we move the time and remarks above the calendar since I can already select
   the dates through the initial inputs calendar". Drawn on the real built page, a phone 390 x 844, an input of 15–16 Oct
   opened from its day on the Inputs calendar. TODAY: Person, Type, Title, Dates (the calendar), When, Remarks.
   A — his idea: the When and Remarks blocks MOVED above the Dates block (nodes moved, nothing restyled).
   B — the agent's alternative: the Dates block FOLDED to one line that says the dates and opens the calendar on a tap —
       drawn in by hiding the calendar and showing the window's own read-out line as a button (an existing .abtn
       cloned); When and Remarks then stand where they are and nothing needs scrolling.
   usage: node scripts/handpass/mock-input-order.mjs [baseURL] [outDir] — the served build (preview_start raptor-walk) */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-15-calendar-step-two/question'
mkdirSync(out, { recursive: true })
const b = await chromium.launch()
const res = {}
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
async function opened() {
  const ctx = await b.newContext({ baseURL: base, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  await p.goto('/'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  await p.evaluate(() => window.go('inputs')); await p.waitForFunction(() => window.CURPAGE === 'inputs'); await p.waitForTimeout(400)
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 9 - (+year * 12 + MONTHS.findIndex(x => name.startsWith(x)))
    if (!d) break
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  await p.evaluate(() => { const w = window, P = w.PEOPLE; const crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
    w.fileInput({ iid: 'mock-order', person: crew[0], type: 'Meeting', date: 'Oct 15', endDate: 'Oct 16', yr: 2026, allday: false, s: 360, e: 1080 }) })
  await p.locator('#inpCal [data-icday="2026-10-15"]').tap(); await p.waitForTimeout(400)
  await p.locator('[data-testid="idy-row-mock-order"] [data-testid="idy-open"]').tap()
  await p.waitForSelector('[data-testid="win-inputedit"] #inpEdCal'); await p.waitForTimeout(400)
  return { ctx, p }
}
const fieldOf = (p, word) => p.evaluateHandle(w => [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-f')].find(f => (f.querySelector('.inped-k')?.textContent || '').trim() === w), word)
const measure = p => p.evaluate(() => { const body = document.querySelector('[data-testid="win-inputedit"] .win-body'), r = s => { const e = [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-k')].find(k => k.textContent.trim() === s); return e ? Math.round(e.getBoundingClientRect().top) : null }
  return { dates: r('Dates'), when: r('When'), remarks: r('Remarks'), scrolls: body ? body.scrollHeight > body.clientHeight + 1 : null, foot: Math.round(document.querySelector('[data-testid="win-inputedit"]').getBoundingClientRect().bottom) } })
for (const mode of ['today', 'A', 'B']) {
  const { ctx, p } = await opened()
  if (mode === 'A') {
    const dates = await fieldOf(p, 'Dates'), when = await fieldOf(p, 'When'), rmk = await fieldOf(p, 'Remarks')
    await p.evaluate(([d, w, r]) => { if (!d || !w || !r) throw new Error('premise gone'); d.parentElement.insertBefore(w, d); d.parentElement.insertBefore(r, d) }, [dates, when, rmk])
  }
  if (mode === 'B') {
    await p.evaluate(() => {
      const d = [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-f')].find(f => (f.querySelector('.inped-k')?.textContent || '').trim() === 'Dates')
      if (!d) throw new Error('premise gone')
      const cal = d.querySelector('#inpEdCal'), read = d.querySelector('.rc-read'), like = document.querySelector('#inpEditCancel')
      if (!cal || !read || !like) throw new Error('premise gone')
      cal.style.display = 'none'; read.style.display = 'none'
      const btn = like.cloneNode(false); btn.removeAttribute('id'); btn.setAttribute('data-mock', 'drawn-in')
      btn.textContent = '📅 ' + read.textContent.trim() + '  ▾'; btn.style.cssText = 'width:100%;justify-content:flex-start;min-height:44px;font-size:15px'
      d.querySelector('.inped-dates').prepend(btn)
    })
  }
  await p.waitForTimeout(300)
  res[mode] = await measure(p)
  await p.screenshot({ path: `${out}/order-${mode}.png` })
  await ctx.close()
}
console.log(JSON.stringify(res))
await b.close()
