// THE MOCK-UP OF WHAT THE DESIGN VET SUGGESTS FOR THE INPUTS CALENDAR AND THE INPUTS LIST (owner, 10 Oct 26 — "vet how
// the inputs calendar and list is designed … every component including the text. I don't like too wordy interface …
// show me a mock up in what u suggest to improve" — D726). Every picture is the BUILT app with its own records. A
// "today" picture is untouched; a "drawn" picture is the same screen with the suggested words and look re-drawn in
// the page. NOTHING HERE IS BUILT (a drawing first — D541).
//
//   node scripts/handpass/mk-inputs-vet.mjs <out dir>          (LOOK_URL — the built bundle; default :4233)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/mock/img/inputs-vet'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4233/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const WIN = '[data-testid="win-inputedit"]', DAY = '[data-testid="win-inputsday"]'
const errors = []

async function world(phone) {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push((phone ? 'phone' : 'desk') + ' pageerror: ' + e.message))
  const tap = l => (phone ? l.tap() : l.click())
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs'))
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await tap(page.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
  const pic = async name => { await page.waitForTimeout(300); if (!phone) await page.mouse.move(2, 2); await page.screenshot({ path: join(OUT, name + '.png') }) }
  const box = async (name, sel, pad = 8) => {
    await page.waitForTimeout(300); if (!phone) await page.mouse.move(2, 2)
    const b = await page.evaluate(sel => { const r = [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length).map(e => e.getBoundingClientRect()); return r.length ? { l: Math.min(...r.map(x => x.left)), t: Math.min(...r.map(x => x.top)), r: Math.max(...r.map(x => x.right)), b: Math.max(...r.map(x => x.bottom)) } : null }, sel)
    if (!b) { errors.push('nothing to photograph: ' + name); return }
    const vw = page.viewportSize(), x = Math.max(0, b.l - pad), y = Math.max(0, b.t - pad)
    await page.screenshot({ path: join(OUT, name + '.png'), clip: { x, y, width: Math.min(vw.width, b.r + pad) - x, height: Math.min(vw.height, b.b + pad) - y } })
  }
  return { ctx, page, tap, pic, box }
}

/* ── the drawings, each a function run in the page ── */
/* THE LIST: its own add form becomes one "+ Input" button (the same window the calendar opens); every name; the kind
   in small grey capitals; "By Saber" only where someone else placed it, on the remark's own line; "Changed". */
const drawList = phone => {
  const add = document.querySelector('#inAdd')
  let form = add; while (form && !form.querySelector('.ifield.cal')) form = form.parentElement
  if (form) { form.style.display = 'none'; const box = form.parentElement; if (box && ![...box.children].some(c => c !== form && c.getClientRects().length)) box.style.display = 'none'; else if (box) { box.style.padding = '0'; box.style.minHeight = '0' } }
  const st = document.createElement('style'); st.id = 'mockVet'
  st.textContent = `
    #intbl .intag{background:none;border:0;padding:0;border-radius:0;font-size:10.5px;font-weight:600;letter-spacing:.06em;color:var(--ink-2)}
    #intbl th:first-child{width:250px} #intbl td[data-label="Name"]{white-space:normal} #intbl .in-open{white-space:normal;line-height:1.35}
    #intbl .in-placed{display:inline;margin-left:12px;white-space:nowrap}
    .mock-add{font-weight:700}`
  document.head.appendChild(st)
  /* the button: beside "All dates" on a desktop; at the left of the view switch's row on a phone */
  const b = document.createElement('button'); b.className = 'abtn primary mock-add'; b.textContent = '+ Input'
  const range = document.querySelector('#inRangeBtn')
  if (range) { b.style.cssText = 'margin-right:8px'; range.parentElement.insertBefore(b, range) }
  for (const tr of document.querySelectorAll('#inBody tr')) {
    const open = tr.querySelector('[data-testid="in-open"]'); if (!open) continue
    const shared = / \+\d+$/.test(open.textContent)
    const own = open.textContent.trim()
    if (shared) open.textContent = open.title.split(', ').sort((a, c) => a.localeCompare(c)).join(', ')
    const p = tr.querySelector('.in-placed'); if (!p) continue
    const by = (p.textContent.match(/^Placed by (\S+)/) || [])[1]
    if (by && (shared || by !== own)) p.textContent = 'By ' + by; else p.remove()
  }
  for (const th of document.querySelectorAll('#intbl th')) if (/last modified/i.test(th.textContent)) th.firstChild.textContent = th.firstChild.textContent.replace(/last modified/i, 'Changed')
}
/* THE MONTH: a shared input's bar leads with how many and WHAT ("4 · Meeting"); a timed input's bar is a tint with a
   solid edge, an all-day one stays solid. */
const drawMonth = () => {
  const st = document.createElement('style'); st.id = 'mockVet'
  st.textContent = `.ib-bar.mock-timed{background:color-mix(in srgb,var(--mock-c) 34%,var(--panel));box-shadow:inset 3px 0 0 var(--mock-c);color:var(--ink)}`
  document.head.appendChild(st)
  const I = window.INPUTS
  for (const bar of document.querySelectorAll('.ib-bar')) {
    const key = bar.getAttribute('data-iid'), one = I.find(r => String(r.iid) === key || String(r.grp) === key || key.endsWith(String(r.iid)) || (r.grp && key.endsWith(String(r.grp)))), rows = one ? (one.grp ? I.filter(r => r.grp === one.grp) : [one]) : []
    if (!rows.length) continue
    const r = rows[0], t = bar.textContent
    if (rows.length > 1) { const what = (t.split(' · ')[1] || r.type).replace(/…$/, ''); bar.textContent = `${rows.length} · ${r.title && r.title !== r.type ? r.title : what}` }   // the count first: a cut-off bar never loses it
    const timed = r.allday === false
    if (timed) { bar.style.setProperty('--mock-c', getComputedStyle(bar).backgroundColor); bar.classList.add('mock-timed') }
  }
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let n = tw.nextNode(); n; n = tw.nextNode()) if (/duty or commitment/.test(n.nodeValue) && n.parentElement.closest('#page-inputs, .page, main')) n.nodeValue = n.nodeValue.replace('duty or commitment', 'duty')
}
/* THE INPUT'S WINDOW: the paragraph of instructions under the remarks goes — the line under the calendar already
   says what Save will write. */
const drawWindow = () => { for (const h of document.querySelectorAll('[data-testid="win-inputedit"] .inped-hint')) h.remove() }
/* THE GEAR'S SETTINGS: the same three settings in fewer words. */
const drawGear = () => {
  const swap = (from, to) => { const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const hit = []; for (let n = tw.nextNode(); n; n = tw.nextNode()) if (n.nodeValue.trim().startsWith(from)) hit.push(n); for (const n of hit) n.nodeValue = to }
  swap('Day flying, night flying or no fly', 'Day, night or no-fly dates, and holidays.')
  swap('An input last changed after its cut-off', 'Later than this is LATE. Medical is never late.')
  swap('Members may file duties and commitments', 'Members may file duties for others')
  swap('Off, a member files for himself only', 'Never leave, medical or SANS.')
}

/* ───────────── a desktop ───────────── */
{
  const { ctx, page, tap, pic, box } = await world(false)
  /* the month */
  await pic('desk-month-today')
  await page.evaluate(drawMonth); await pic('desk-month-drawn')
  await page.evaluate(() => document.querySelector('#mockVet')?.remove())
  /* the gear */
  await tap(page.locator('#inGear')); await page.waitForTimeout(300)
  await page.evaluate(() => { let w = [...document.querySelectorAll('*')].find(e => [...e.childNodes].some(c => c.nodeType === 3 && /Inputs calendar settings/.test(c.textContent))); while (w && w.parentElement && !(w.getBoundingClientRect().height > 500)) w = w.parentElement; w?.setAttribute('data-mockgear', '') })
  const GEAR = '[data-mockgear]'
  await box('desk-gear-today', GEAR); await page.evaluate(drawGear); await box('desk-gear-drawn', GEAR)
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  /* the list as it opens */
  await tap(page.locator('#inListBtn')); await page.waitForTimeout(500)
  if (!(await page.locator('#inRangePop').count())) await tap(page.locator('#inRangeBtn'))
  await tap(page.locator('#inRangeAll')); await page.waitForTimeout(400)
  /* July at the head of the table, so the rows in the picture are the demo's fullest */
  await page.evaluate(() => { for (const tr of document.querySelectorAll('#inBody tr')) { const s = (tr.querySelector('td[data-label="Start"]')?.textContent || '').trim(); if (!/ Jul\b/.test(s)) tr.style.display = 'none' } window.scrollTo(0, 0) })
  await pic('desk-list-today')
  await page.evaluate(drawList, false); await pic('desk-list-drawn')
  /* the input's window, from that list */
  const iid = await page.evaluate(() => window.INPUTS.find(r => r.type === 'Appointment' && !r.grp && /Jul 16/.test(r.date))?.iid ?? window.INPUTS.find(r => r.type === 'Appointment' && !r.grp)?.iid)
  await tap(page.locator(`[data-iid="${iid}"]`).first().locator('[data-testid="in-open"]')); await page.locator(WIN).waitFor()
  await box('desk-window-today', WIN); await page.evaluate(drawWindow); await box('desk-window-drawn', WIN)
  await ctx.close()
}
/* ───────────── a phone ───────────── */
{
  const { ctx, page, tap, pic, box } = await world(true)
  await tap(page.locator('#inListBtn')); await page.waitForTimeout(600)
  if (!(await page.locator('#inRangePop').count())) await tap(page.locator('#inRangeBtn'))
  await tap(page.locator('#inRangeAll')); await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollTo(0, 0)); await pic('phone-list-today')
  await page.evaluate(drawList, true); await page.evaluate(() => window.scrollTo(0, 0)); await pic('phone-list-drawn')
  const iid = await page.evaluate(() => window.INPUTS.find(r => r.type === 'Appointment' && !r.grp)?.iid)
  await tap(page.locator(`[data-iid="${iid}"]`).first().locator('[data-testid="inl-open"]')); await page.locator(WIN).waitFor(); await page.waitForTimeout(400)
  await pic('phone-window-today'); await page.evaluate(drawWindow); await pic('phone-window-drawn')
  await ctx.close()
}
await browser.close()
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors')
