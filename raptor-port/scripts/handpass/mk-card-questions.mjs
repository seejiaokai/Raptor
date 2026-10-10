// THE TWO MOCK-UPS HE ASKED FOR AT THE CLOSE OF THE INPUT CARD'S CHECK (10 Oct 26 — "2 can u show me a mock up /
// 3 show me a mock up"; the sheet docs/handpass/2026-10-10-input-card-check.md §0, questions 2 and 3).
// Every picture is the BUILT app (the frozen bundle), its own records and its own stylesheet. The "today" pictures
// are untouched; a "proposed" picture is the same screen with ONLY the words or the look in question re-drawn in the
// page (nothing is built — D718's manner: a drawing first).
//
//   QUESTION 2 — a desktop's Inputs table: a shared input reads "Saber +3"; the kind is a pill.
//                drawn: every name (wrapping) · and the kind in small grey capitals, as the cards have it.
//   QUESTION 3 — a several-day input's card says "till 17 Jul" at its right AND in its remark.
//                drawn: the automatic "till <date>" left out of the remark on the card; other words stay.
//
//   THE WHOLE SET  — asked the same day ("if I do A can u show me how the inputs calander desktop and mobile look
//                like as well as the list. Like wise for b"): Thu 23 Jul opened on the calendar on a desktop and on a
//                phone, the phone's month and its list, AS BUILT (A and B change the desktop table only) — and the
//                cards drawn with the table's pill, should he want the pill everywhere.
//
//   node scripts/handpass/mk-card-questions.mjs <out dir>          (LOOK_URL — the built bundle; default :4233)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/mock/img/card-questions'
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
  const id = cs => page.evaluate(cs => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === cs), cs)
  await page.evaluate(() => window.go('inputs'))
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await tap(page.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
  const openDay = async iso => {
    if (await page.locator(DAY).count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
    const cell = page.locator(`#inpCal [data-icday="${iso}"]`)
    if (phone) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
    await page.locator(DAY).waitFor()
  }
  /* file one input through the app's own "+ Input": the day it starts, the day of the month it runs till (same month) */
  const file = async ({ iso, till, type, who, several, title, rmk, from, to }) => {
    await openDay(iso)
    await tap(page.locator('#icPopAdd')); await page.locator(WIN).waitFor()
    await page.selectOption('#inpEditType', type)
    if (several) {
      await tap(page.locator(`${WIN} [data-testid="pp-several"]`))
      for (const cs of several) { const b = page.locator(`${WIN} [data-pp="${await id(cs)}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await tap(b) }
    } else if (who) await page.selectOption('#inpEditPerson', await id(who))
    if (till) { await tap(page.locator('#inpEdCal .rc-d', { hasText: new RegExp('^' + till + '$') })); await page.waitForTimeout(150) }
    if (from) { await page.fill('#inpEditStart', from).catch(() => {}); await page.fill('#inpEditEnd', to).catch(() => {}) }
    if (title) await page.fill('#inpEditOwnTitle', title)
    if (rmk) await page.fill('#inpEditRmk', rmk)
    await tap(page.locator('#inpEditSave'))
    const sheet = page.locator('[data-testid="oilconf"]')
    if (await sheet.waitFor({ timeout: 1500 }).then(() => true, () => false)) { await tap(sheet.locator('[data-testid="oil-yes"]')); await tap(sheet.locator('[data-testid="oilconf-save"]')) }
    await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => errors.push('the window stayed open after Save: ' + JSON.stringify({ iso, type, who })))
    await page.waitForTimeout(350)
  }
  const list = async () => {
    if (await page.locator(DAY).count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
    await tap(page.locator('#inListBtn'))
    if (!(await page.locator('#inRangePop').count())) await tap(page.locator('#inRangeBtn'))
    await tap(page.locator('#inRangeAll')); await page.waitForTimeout(400)
  }
  /* a sharp picture of the box that holds these elements, a little air round it */
  const shot = async (name, sel, pad = 8, maxW = 0) => {
    const box = await page.evaluate(sel => {
      const els = [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length)
      if (!els.length) return null
      const r = els.map(e => e.getBoundingClientRect())
      return { l: Math.min(...r.map(x => x.left)), t: Math.min(...r.map(x => x.top)), r: Math.max(...r.map(x => x.right)), b: Math.max(...r.map(x => x.bottom)) }
    }, sel)
    if (!box) { errors.push('nothing to photograph for ' + name); return }
    if (!phone) await page.mouse.move(2, 2)             // no row under the pointer: a hovered name is underlined
    const vw = page.viewportSize()
    const x = Math.max(0, box.l - pad), y = Math.max(0, box.t - pad)
    await page.screenshot({ path: join(OUT, name + '.png'), clip: { x, y, width: Math.min(vw.width, box.r + pad, maxW ? x + maxW : 1e9) - x, height: Math.min(vw.height, box.b + pad) - y } })
  }
  return { ctx, page, tap, openDay, file, list, shot }
}

/* "THE PILL EVERYWHERE", drawn: the cards' kind in the table's pill (its own measures; the card's ground is the pill's
   usual fill, so the pill takes the panel behind it to be seen) */
const PILL = '.icard-kind{font-size:9.5px;font-weight:700;letter-spacing:.04em;padding:2px 8px;border-radius:999px;background:var(--panel);border:1px solid var(--edge);color:var(--ink-2);vertical-align:1px}'
const pill = (page, on) => page.evaluate(([css, on]) => {
  document.querySelector('#mockPill')?.remove()
  if (on) { const st = document.createElement('style'); st.id = 'mockPill'; st.textContent = css; document.head.appendChild(st) }
}, [PILL, on])

/* ───────────── QUESTION 3 — "till" said twice — a phone ───────────── */
{
  const { ctx, page, openDay, file, list, shot } = await world(true)
  /* two inputs of several days, filed the app's own way: one with no remark typed, one with a remark typed */
  await file({ iso: '2026-07-13', till: '15', type: 'Training', who: 'Ranger', title: 'Range week' })
  await file({ iso: '2026-07-13', till: '16', type: 'Duty', who: 'Blade', rmk: 'bring ID card' })
  console.log('as stored:', JSON.stringify(await page.evaluate(() => window.INPUTS.filter(r => r.date === 'Jul 13').map(r => [window.PEOPLE[r.person]?.cs, r.type, r.title || '', r.remarks]))))
  /* the automatic words left out of the remark ON THE CARD ONLY (the record keeps them) */
  const redraw = () => page.evaluate(() => {
    for (const card of document.querySelectorAll('.icard')) {
      const when = card.querySelector('.icard-hrs')?.textContent || ''
      const till = (when.match(/till \d{1,2} [A-Za-z]{3}/) || [])[0]
      if (!till) continue
      const rmks = [...card.querySelectorAll('.icard-rmk')], rmk = rmks.find(x => !x.hasAttribute('aria-hidden'))
      if (!rmk) continue
      const left = rmk.textContent.replace(new RegExp('[\\s,·—–-]*\\b' + till.replace(/\s+/g, '\\s+') + '\\b', 'i'), '').replace(/^[\s,·—–-]+|[\s,·—–-]+$/g, '')
      if (left) rmk.textContent = left
      else rmks.forEach(x => x.remove())
      const text = card.querySelector('.icard-text'); if (text && !text.textContent.trim()) text.remove()
    }
  })
  /* the opened day */
  await openDay('2026-07-14')
  await page.locator(`${DAY} [data-testid^="idy-row-"]`).first().waitFor(); await page.waitForTimeout(3600)
  console.log('day cards:', JSON.stringify(await page.locator(`${DAY} [data-testid^="idy-row-"]`).evaluateAll(els => els.map(e => e.innerText.replace(/\n/g, ' | ')))))
  const DAYBOX = `${DAY} .win-bar, ${DAY} #icPopAdd, ${DAY} [data-testid^="idy-row-"]`
  await shot('q3-day-today', DAYBOX, 10)
  await redraw(); await page.waitForTimeout(150)
  await shot('q3-day-proposed', DAYBOX, 10)
  /* the Inputs list, at Mon 13 Jul's heading */
  await list()
  const toDay = () => page.evaluate(() => {
    const t = [...document.querySelectorAll('[data-testid="inl-day"]')].find(el => /13 Jul/.test(el.textContent))
    if (!t) return
    t.scrollIntoView({ block: 'start' }); window.scrollBy(0, -130)
    /* mark that day's heading and cards, for the picture's edges */
    t.setAttribute('data-mockbox', '')
    for (let n = t.nextElementSibling; n && !n.matches('[data-testid="inl-day"]'); n = n.nextElementSibling) n.setAttribute('data-mockbox', '')
  })
  await toDay(); await page.waitForTimeout(3600)
  await shot('q3-list-today', '[data-mockbox]', 12)
  await redraw(); await page.waitForTimeout(150)
  await shot('q3-list-proposed', '[data-mockbox]', 12)
  await ctx.close()
}

/* ───────────── QUESTION 2 — the desktop table: "Saber +3" and the pill ───────────── */
{
  const { ctx, page, file, list, shot, openDay } = await world(false)
  /* beside the demo's shared meeting of four (Thu 23 Jul): one for nine people, so a long list is seen too */
  await file({ iso: '2026-07-23', type: 'Event', several: ['Ranger', 'Ace', 'Drifter', 'Vapor', 'Blade', 'Cinch', 'Echo', 'Wisp'], title: 'Squadron photo', from: '15:00', to: '15:30' })
  /* THE WHOLE SET he asked to see for A and for B (10 Oct 26): the Inputs calendar on a desktop, that day opened */
  await openDay('2026-07-23'); await page.locator(`${DAY} [data-testid^="idy-row-"]`).first().waitFor(); await page.waitForTimeout(3600)
  await page.mouse.move(2, 2)
  await page.screenshot({ path: join(OUT, 'set-cal-desk.png') })
  await shot('set-cal-desk-day', `${DAY}`, 6)
  await pill(page, true); await page.waitForTimeout(150)
  await shot('set-cal-desk-day-pill', `${DAY}`, 6)
  await pill(page, false)
  await list()
  /* only the rows round that day, so the table's own head stands right above them */
  const kept = await page.evaluate(() => {
    let n = 0
    for (const tr of document.querySelectorAll('#inBody tr')) {
      const keep = /^2[2-4] Jul\b/.test((tr.querySelector('td[data-label="Start"]')?.textContent || '').trim())
      if (keep) n++; else tr.style.display = 'none'
    }
    return n
  })
  console.log('desktop rows kept:', kept, JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#inBody tr')].slice(0, 3).map(tr => [...tr.children].map(td => td.getAttribute('data-label') + '=' + td.textContent.trim().slice(0, 24))))))
  await page.evaluate(() => { document.querySelector('#intbl')?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -90) })
  await page.waitForTimeout(3600)
  console.log('names today:', JSON.stringify(await page.locator('#inBody tr:visible [data-testid="in-open"]').allInnerTexts()))
  await shot('q2-table-today', '#intbl thead, #inBody tr')
  await shot('q2-table-today-left', '#intbl thead, #inBody tr', 8, 700)   // the columns in question, readable on a phone
  /* drawn: every name, A to Z, wrapping in its column */
  await page.evaluate(() => {
    const st = document.createElement('style'); st.id = 'mockQ2'
    st.textContent = '#intbl th:first-child{width:270px} #intbl td[data-label="Name"]{white-space:normal} #intbl .in-open{white-space:normal;line-height:1.35}'
    document.head.appendChild(st)
    for (const b of document.querySelectorAll('#inBody [data-testid="in-open"]')) if (/ \+\d+$/.test(b.textContent)) b.textContent = b.title.split(', ').sort((a, c) => a.localeCompare(c)).join(', ')
  })
  await page.waitForTimeout(200)
  await shot('q2-table-names', '#intbl thead, #inBody tr')
  await shot('q2-table-names-left', '#intbl thead, #inBody tr', 8, 700)   // the columns in question, readable on a phone
  /* drawn: and the kind in the cards' small grey capitals in place of the pill */
  await page.evaluate(() => {
    document.querySelector('#mockQ2').textContent += ' #intbl .intag{background:none;border:0;padding:0;border-radius:0;font-size:10.5px;font-weight:600;letter-spacing:.06em;color:var(--ink-3)}'
  })
  await page.waitForTimeout(200)
  await shot('q2-table-names-grey', '#intbl thead, #inBody tr')
  await shot('q2-table-names-grey-left', '#intbl thead, #inBody tr', 8, 700)   // the columns in question, readable on a phone
  await ctx.close()
}
/* ───────────── THE WHOLE SET, a phone: the same day opened, and the list at that day ───────────── */
{
  const { ctx, page, openDay, file, list, shot } = await world(true)
  await file({ iso: '2026-07-23', type: 'Event', several: ['Ranger', 'Ace', 'Drifter', 'Vapor', 'Blade', 'Cinch', 'Echo', 'Wisp'], title: 'Squadron photo', from: '15:00', to: '15:30' })
  await openDay('2026-07-23'); await page.locator(`${DAY} [data-testid^="idy-row-"]`).first().waitFor(); await page.waitForTimeout(3600)
  const DAYBOX = `${DAY} .win-bar, ${DAY} #icPopAdd, ${DAY} [data-testid^="idy-row-"]`
  await shot('set-cal-phone', DAYBOX, 10)
  await pill(page, true); await page.waitForTimeout(150)
  await shot('set-cal-phone-pill', DAYBOX, 10)
  await pill(page, false)
  /* the month itself, the day window put away */
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, 'set-cal-phone-month.png') })
  await list()
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('[data-testid="inl-day"]')].find(el => /23 Jul/.test(el.textContent))
    if (!t) return
    t.scrollIntoView({ block: 'start' }); window.scrollBy(0, -130)
    t.setAttribute('data-mockbox', '')
    for (let n = t.nextElementSibling; n && !n.matches('[data-testid="inl-day"]'); n = n.nextElementSibling) n.setAttribute('data-mockbox', '')
  })
  await page.waitForTimeout(3600)
  await shot('set-list-phone', '[data-mockbox]', 12)
  await pill(page, true); await page.waitForTimeout(150)
  await shot('set-list-phone-pill', '[data-mockbox]', 12)
  await ctx.close()
}
await browser.close()
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors')
