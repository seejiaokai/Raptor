// THE HOST'S OWN WALK of "the input card, and the Inputs list without its pencil" ([INPUT-LIST-AS-DAY-CARD]; owner
// D718–D724 — 10 Oct 26; docs/handpass/2026-10-10-input-card-check.md §3, §4, §6). It drives the roll-call's rows and
// the door list through the app's own controls in the built bundle: the card on the opened day and on the phone's
// list, the desktop table without its pencil and cross, every door the list lost and where it is now (the window's
// fields, its date calendar for a one-person input, Delete, the paperclip, the OIL chips, the unanswered OIL line), at
// a desktop and a phone, as the admin and as a member — and the surfaces that must NOT have changed. A PASS is the
// right behaviour, so a run on a later build is the re-walk. The publication orders, the medical sheets and the wide
// matrix of kinds are the walkers' shares (Astra's scenarios).
//
//   node scripts/handpass/icard-host-walk.mjs <out dir>          (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-10-input-card-check/host'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
let bad = 0, n = 0
const errs = []
const say = (ok, name, detail = '') => { n++; if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`) }
const step = async (name, fn) => { try { const r = await fn(); say(r === undefined ? true : !!r.ok, name, r && r.detail) } catch (e) { say(false, name, String(e.message || e).split('\n').slice(0, 6).join(' ⏎ ').slice(0, 500)) } }

async function open(viewport, who = 'ad', pass = 'a', touch = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(URL)
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  return { ctx, page }
}
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.png') })
const WIN = '[data-testid="win-inputedit"]', DAYWIN = '[data-testid="win-inputsday"]'
const press = (touch, loc) => (touch ? loc.tap() : loc.click())
const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
const rec = (p, f) => p.evaluate(f => {
  const r = window.INPUTS.find(x => Object.keys(f).every(k => x[k] === f[k]))
  return r ? { iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, oil: r.oil || null, s: r.s, e: r.e, grp: r.grp || null } : null
}, f)
const recId = (p, iid) => rec(p, { iid })
async function month(p, y, m, touch) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await press(touch, p.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
  throw new Error('the calendar never reached the month asked for')
}
async function toCal(p, touch) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inCalBtn'))
  await month(p, 2026, 7, touch)
}
async function openDay(p, iso, touch) {
  await toCal(p, touch)
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await p.locator(DAYWIN).waitFor()
}
async function saveWin(p, touch, oil) {
  await press(touch, p.locator('#inpEditSave'))
  const sheet = p.locator('[data-testid="oilconf"]')
  let asked = false
  if (await sheet.waitFor({ timeout: oil ? 4000 : 900 }).then(() => true, () => false)) {
    asked = true
    await answerOil(p, touch, oil || 'no')
  }
  await p.waitForTimeout(400)
  return asked
}
/* the OIL question's own two forms: one day asks Yes / No; several days ask All days / Only some / No OIL */
async function answerOil(p, touch, how) {
  const sheet = p.locator('[data-testid="oilconf"]')
  const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
  await press(touch, (await one.count()) ? one : many)
  await press(touch, sheet.locator('[data-testid="oilconf-save"]'))
}
/* the six inputs of the approved pictures, filed through the day's own "+ Input" */
async function fileSix(p, touch) {
  const id = cs => csId(p, cs)
  const ranger = await id('Ranger'), blade = await id('Blade'), wisp = await id('Wisp')
  const file = async (type, who, from, to, title, rmk, several) => {
    if (!(await p.locator(DAYWIN).count())) await openDay(p, '2026-07-18', touch)
    await press(touch, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
    await p.selectOption('#inpEditType', type)
    if (several) {
      await press(touch, p.locator(`${WIN} [data-testid="pp-several"]`))
      for (const cs of several) { const b = p.locator(`${WIN} [data-pp="${await id(cs)}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(touch, b) }
    } else if (who) await p.selectOption('#inpEditPerson', who)
    await p.fill('#inpEditStart', from).catch(() => {}); await p.fill('#inpEditEnd', to).catch(() => {})
    if (title) await p.fill('#inpEditOwnTitle', title)
    if (rmk) await p.fill('#inpEditRmk', rmk)
    await saveWin(p, touch, 'yes')
  }
  await openDay(p, '2026-07-18', touch)
  await file('Event', 'allavail', '06:00', '18:00', 'Sports day', 'bring boots')
  await file('Meeting', null, '10:00', '11:00', 'Flight safety brief', '', ['Ranger', 'Ace', 'Drifter', 'Vapor', 'Blade', 'Cinch'])
  await file('Event', null, '09:00', '16:00', 'Squadron family day and open house visit', '')
  await file('Duty', ranger, '13:00', '15:00', '', '')
  await file('Training', blade, '14:00', '16:00', 'CRM refresher', '')
  await file('Other', wisp, '11:00', '12:00', '', 'Collecting a new ID card from the pass office before lunch')
}
/* what a card says, part by part — read off the screen */
const cardFacts = (p, root, tid) => p.locator(`${root} [data-testid^="${tid}-row-"]`).evaluateAll((els, tid) => els.map(c => {
  const t = k => { const e = c.querySelector(`[data-testid="${tid}-${k}"]`); return e ? e.textContent : null }
  const b = c.getBoundingClientRect()
  return { iid: c.getAttribute('data-popiid'), who: t('who'), kind: t('kind'), when: t('when'), title: t('title'), rmk: t('rmk'), by: t('by'), late: !!c.querySelector(`[data-testid="${tid}-late"]`),
    h: Math.round(b.height), pucks: c.querySelectorAll('.puck').length, tone: c.className.includes(' red') ? 'red' : 'amb', kindCaps: getComputedStyle(c.querySelector('.icard-kind')).textTransform }
}), tid)
async function toList(p, touch) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inListBtn'))
  if (!(await p.locator('#inRangePop').count())) await press(touch, p.locator('#inRangeBtn'))
  await press(touch, p.locator('#inRangeAll')); await p.waitForTimeout(300)
}
const expectSix = cards => {
  const by = k => cards.find(c => c.who === k || (c.who || '').startsWith(k))
  const all = by('ALL AVAIL'), own = by('Saber'), team = cards.find(c => (c.who || '').includes(',')), wisp = by('Wisp'), ranger = cards.find(c => c.who === 'Ranger' && c.kind === 'Duty'), blade = by('Blade')
  const problems = []
  const want = (c, name, f) => { if (!c) { problems.push(name + ': no card'); return } for (const [k, v] of Object.entries(f)) if (c[k] !== v) problems.push(`${name}.${k} = ${JSON.stringify(c[k])}, wanted ${JSON.stringify(v)}`) }
  want(all, 'ALL AVAIL', { kind: 'Event', title: 'Sports day', rmk: 'bring boots', by: 'By Saber', when: '06:00–18:00', pucks: 0 })
  want(own, 'Saber’s own', { kind: 'Event', title: 'Squadron family day and open house visit', rmk: null, by: null, pucks: 0 })
  want(team, 'the shared meeting', { who: 'Ace, Blade, Cinch, Drifter, Ranger, Saber, Vapor', kind: 'Meeting', title: 'Flight safety brief', by: 'By Saber', pucks: 0 })
  want(wisp, 'Wisp', { kind: 'Other', title: null, rmk: 'Collecting a new ID card from the pass office before lunch', by: 'By Saber' })
  want(ranger, 'Ranger', { kind: 'Duty', title: null, rmk: null, by: 'By Saber' })
  want(blade, 'Blade', { kind: 'Training', title: 'CRM refresher', by: 'By Saber' })
  for (const c of cards) { if (/\+\d/.test(c.who || '')) problems.push('"+N" on ' + c.who); if (c.kindCaps !== 'uppercase') problems.push('kind not in capitals on ' + c.who) }
  return problems
}

/* ============================================================== A — a desktop, the admin (Saber) */
{
  const { ctx, page } = await open({ width: 1440, height: 900 })
  const T = false
  await fileSix(page, T)

  await step('A1 the opened day (desktop): the six cards say what the approved picture says — kind on the top line, title on its own row, every name, "By" as ruled (D723, D724), no pucks, no "+N"', async () => {
    await openDay(page, '2026-07-18', T); await page.waitForTimeout(3500)
    const cards = await cardFacts(page, DAYWIN, 'idy')
    await shot(page, 'A1-desk-day')
    const problems = expectSix(cards)
    return { ok: cards.length === 6 && !problems.length, detail: problems.join('; ') || `${cards.length} cards, heights ${cards.map(c => c.h).join('/')}` }
  })
  await step('A2 LATE on a card is its own button: pressed, it says the cut-off that was missed and opens nothing', async () => {
    const card = page.locator(`${DAYWIN} [data-testid^="idy-row-"]`).filter({ hasText: 'CRM refresher' })
    await card.locator('[data-testid="idy-late"]').click()
    const note = await card.locator('[data-testid="idy-latenote"]').innerText()
    const opened = await page.locator(WIN).count()
    await card.locator('[data-testid="idy-late"]').click()
    return { ok: /^after the cut-off, \w{3} \d{1,2} \w{3}$/.test(note) && !opened, detail: note }
  })
  await step('A3 a click on a card opens the input’s window; who placed it and WHEN is whole there (D629), and on the month’s bar tip', async () => {
    await page.locator(`${DAYWIN} [data-testid^="idy-row-"]`).filter({ hasText: 'Collecting a new ID' }).locator('.icard-words').click()
    await page.locator(WIN).waitFor()
    const placed = await page.locator(`${WIN} [data-testid="inped-placed"]`).innerText()
    await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
    const wisp = await rec(page, { type: 'Other', remarks: 'Collecting a new ID card from the pass office before lunch' })
    const tip = await page.locator(`#inpCal .ib-bar[data-iid="${wisp.iid}"]`).first().getAttribute('title')
    return { ok: /^Placed by Saber for Wisp · \d{1,2} \w{3} \d\d, \d\d:\d\d/.test(placed) && /Placed by Saber for Wisp/.test(tip || ''), detail: placed + ' | tip: ' + (tip || '').replace(/\n/g, ' ⏎ ') }
  })
  await step('A4 the card’s button is reached by keyboard and opens on Enter; its label says the card whole', async () => {
    const open = page.locator(`${DAYWIN} [data-testid^="idy-row-"]`).filter({ hasText: 'Sports day' }).locator('[data-testid="idy-open"]')
    const label = await open.getAttribute('aria-label')
    await open.focus(); await page.keyboard.press('Enter')
    const up = await page.locator(WIN).waitFor({ timeout: 2000 }).then(() => true, () => false)
    if (up) await page.locator('#inpEditCancel').click()
    return { ok: up && /ALL AVAIL, Sports day, Event, 06:00–18:00/.test(label || ''), detail: label }
  })

  await step('A5 the desktop list: the table, its six sortable headings — and no pencil, no cross, no edit row anywhere', async () => {
    await toList(page, T)
    const m = await page.evaluate(() => ({ table: !!document.querySelector('#intbl'), heads: [...document.querySelectorAll('#intbl thead th.insort')].map(t => t.textContent.trim()), rows: document.querySelectorAll('#inBody tr').length,
      old: document.querySelectorAll('#inBody [data-edit], #inBody [data-inx], #inBody [data-save], #inBody .rmx, #inBody tr.ined').length, cards: document.querySelectorAll('[data-testid^="inl-row-"]').length }))
    await page.evaluate(() => { const t = [...document.querySelectorAll('#inBody tr')].find(tr => /16 Jul/.test(tr.textContent)); if (t) { t.scrollIntoView({ block: 'start' }); window.scrollBy(0, -150) } })
    await page.waitForTimeout(250); await shot(page, 'A5-desk-list')
    return { ok: m.table && m.heads.length === 6 && m.rows > 20 && m.old === 0 && m.cards === 0, detail: JSON.stringify(m) }
  })
  await step('A6 the last cell’s row line is drawn at the foot of the row, not across it (the cell is as tall as its row)', async () => {
    const off = await page.evaluate(() => [...document.querySelectorAll('#inBody tr')].slice(0, 40).map(tr => { const a = tr.querySelector('td.inact').getBoundingClientRect(), b = tr.querySelector('td[data-label="Name"]').getBoundingClientRect(); return Math.abs(a.bottom - b.bottom) + Math.abs(a.top - b.top) }).filter(d => d > 1).length)
    return { ok: off === 0, detail: off + ' rows whose last cell is not as tall as the row' }
  })
  const rowOf = text => page.locator('#inBody tr').filter({ hasText: text }).first()
  await step('A7 a click on a row opens that input; so does its Name by keyboard (Tab reaches it, Enter opens)', async () => {
    await rowOf('CRM refresher').locator('td[data-label="Remarks"]').click()
    await page.locator(WIN).waitFor()
    const t1 = await page.locator('#inpEditOwnTitle').inputValue()
    await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
    const name = rowOf('Collecting a new ID').locator('[data-testid="in-open"]')
    await name.focus()
    const focused = await name.evaluate(el => document.activeElement === el && el.tagName === 'BUTTON')
    await page.keyboard.press('Enter'); await page.locator(WIN).waitFor()
    const rm = await page.locator('#inpEditRmk').inputValue()
    await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
    return { ok: t1 === 'CRM refresher' && focused && /Collecting a new ID/.test(rm), detail: `${t1} | ${rm}` }
  })
  await step('A8 the OIL chip stays on a desktop row and does its own work: the question opens, the window does not', async () => {
    const chip = rowOf('Collecting a new ID').locator('[data-oilrev]')
    await chip.click()
    const sheet = await page.locator('[data-testid="oilconf"]').waitFor({ timeout: 2500 }).then(() => true, () => false)
    const win = await page.locator(WIN).count()
    await shot(page, 'A8-desk-oil-chip')
    await page.keyboard.press('Escape'); await page.waitForTimeout(250)
    return { ok: sheet && !win, detail: `sheet ${sheet}, window ${win}` }
  })
  await step('A9 the paperclip stays on a desktop row and opens the document, not the window', async () => {
    const clip = page.locator('#inBody tr .rclip').first()
    if (!(await clip.count())) return { ok: false, detail: 'the demo list shows no paperclip' }
    await clip.click()
    const viewer = await page.locator('#docViewPop:not([hidden])').waitFor({ timeout: 2500 }).then(() => true, () => false)
    const win = await page.locator(WIN).count()
    if (viewer) await page.locator('#docViewClose').click()
    await page.waitForTimeout(200)
    return { ok: viewer && !win, detail: `viewer ${viewer}, window ${win}` }
  })

  const duty = await rec(page, { type: 'Duty', date: 'Jul 18', person: await csId(page, 'Ranger') })
  await step('A10 THE DATES OF A ONE-PERSON INPUT, IN ITS WINDOW: opened from its row, the calendar stands on its saved day; one tap moves it to Mon 20 Jul; the row follows', async () => {
    await rowOf('13:00–15:00').locator('[data-testid="in-open"]').click(); await page.locator(WIN).waitFor()
    const cal = await page.locator(`${WIN} #inpEdCal`).count()
    const on = await page.locator(`${WIN} #inpEdCal [data-cal="2026-07-18"]`).getAttribute('class')
    const hint = await page.locator(`${WIN} .inped-hint`).innerText()
    /* Delete, Cancel and Save are in sight without scrolling inside the window (pinned to its foot) */
    const foot = await page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"]').getBoundingClientRect(); return ['#inpEditDel', '#inpEditCancel', '#inpEditSave'].every(sel => { const e = document.querySelector(sel), b = e.getBoundingClientRect(), hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return b.top >= w.top && b.bottom <= w.bottom + 0.5 && b.bottom <= innerHeight && !!hit && (hit === e || e.contains(hit)) }) })
    if (!foot) throw new Error('Delete / Cancel / Save are not all in sight in the window')
    await shot(page, 'A10-desk-window-dates')
    await page.locator(`${WIN} #inpEdCal [data-cal="2026-07-20"]`).click()
    const read = await page.locator(`${WIN} .rc-read`).innerText()
    const asked = await saveWin(page, T)
    const now = await recId(page, duty.iid)
    const row = await page.locator(`#inBody tr[data-iid="${duty.iid}"] td[data-label="Start"]`).innerText()
    return { ok: cal === 1 && / s/.test(on || '') && /tap the new start/.test(hint) && !/for everyone|Inputs page/.test(hint) && now.date === 'Jul 20' && !now.endDate && /20 Jul/.test(row) && !asked,
      detail: `calendar ${cal}; line "${read}"; saved ${now.date}${now.endDate ? '→' + now.endDate : ''}; row "${row}"; OIL asked ${asked}; oil ${JSON.stringify(now.oil)}` }
  })
  await step('A11 …moved OFF the weekend, its OIL answer no longer stands: no OIL chip on its row, no OIL line in its window', async () => {
    const chips = await page.locator(`#inBody tr[data-iid="${duty.iid}"] .roil`).count()
    await page.locator(`#inBody tr[data-iid="${duty.iid}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
    const lines = await page.locator(`${WIN} [data-testid="oil-revise"], ${WIN} [data-testid="oil-unanswered"]`).count()
    await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
    return { ok: chips === 0 && lines === 0, detail: `chips ${chips}, window OIL lines ${lines}` }
  })
  await step('A12 …and Undo puts it back on Sat 18 Jul in ONE step', async () => {
    await page.locator('#undoBtn').click(); await page.waitForTimeout(400)
    const now = await recId(page, duty.iid)
    return { ok: now.date === 'Jul 18', detail: now.date }
  })
  const appt = await rec(page, { type: 'Appointment', date: 'Jul 16', person: await csId(page, 'Ranger') })
  await step('A13 a weekday appointment moved ONTO Sat 18 – Sun 19 by two taps: the OIL question is asked before anything is written, and its answer is saved with the dates', async () => {
    if (!appt) return { ok: false, detail: 'the demo has no Ranger appointment on 16 Jul' }
    await page.locator(`#inBody tr[data-iid="${appt.iid}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
    await page.locator(`${WIN} #inpEdCal [data-cal="2026-07-18"]`).click()
    await page.locator(`${WIN} #inpEdCal [data-cal="2026-07-19"]`).click()
    await page.locator('#inpEditSave').click()
    const sheet = page.locator('[data-testid="oilconf"]')
    const asked = await sheet.waitFor({ timeout: 4000 }).then(() => true, () => false)
    const before = await recId(page, appt.iid)
    if (asked) { await shot(page, 'A13-desk-oil-asked'); await answerOil(page, T, 'yes') }
    await page.waitForTimeout(400)
    const now = await recId(page, appt.iid)
    return { ok: asked && before.date === 'Jul 16' && now.date === 'Jul 18' && now.endDate === 'Jul 19' && now.oil && Object.keys(now.oil).length >= 1, detail: `asked ${asked}; before ${before.date}; now ${now.date}→${now.endDate}; oil ${JSON.stringify(now.oil)}` }
  })
  await step('A14 its answered OIL shows in the window ("Change…"), and on its desktop row (the OIL chip)', async () => {
    const chip = await page.locator(`#inBody tr[data-iid="${appt.iid}"] [data-oilrev]`).count()
    await page.locator(`#inBody tr[data-iid="${appt.iid}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
    const line = await page.locator(`${WIN} [data-testid="oil-revise"]`).count()
    await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
    return { ok: chip === 1 && line === 1, detail: `chip ${chip}, Change… ${line}` }
  })

  await step('A15 AN OIL QUESTION NOBODY ANSWERED: a bar dragged onto a Sunday and its question put away — the desktop row says "OIL?", the window says "Not answered yet" and answers it', async () => {
    const vapor = await rec(page, { type: 'Appointment', date: 'Jul 20', person: await csId(page, 'Vapor') })
    if (!vapor) return { ok: false, detail: 'the demo has no Vapor appointment on 20 Jul' }
    await toCal(page, T)
    const bar = page.locator(`#inpCal .ib-bar[data-iid="${vapor.iid}"]`).first()
    const from = await bar.boundingBox(), to = await page.locator('#inpCal [data-icday="2026-07-19"]').boundingBox()
    await page.mouse.move(from.x + 12, from.y + from.height / 2); await page.mouse.down()
    await page.mouse.move(from.x + 30, from.y + from.height / 2, { steps: 4 })
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 }); await page.mouse.up()
    const sheet = page.locator('[data-testid="oilconf"]')
    const asked = await sheet.waitFor({ timeout: 4000 }).then(() => true, () => false)
    if (asked) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
    const moved = await recId(page, vapor.iid)
    if (moved.date !== 'Jul 19' || moved.oil) return { ok: false, detail: `the fixture was not reached: asked ${asked}, date ${moved.date}, oil ${JSON.stringify(moved.oil)}` }
    await toList(page, T)
    const chip = await page.locator(`#inBody tr[data-iid="${vapor.iid}"] [data-oilask]`).count()
    await page.locator(`#inBody tr[data-iid="${vapor.iid}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
    const line = await page.locator(`${WIN} [data-testid="oil-unanswered"]`).innerText().catch(() => '')
    await shot(page, 'A15-desk-window-oil-unanswered')
    await page.locator(`${WIN} [data-testid="oil-answer"]`).click()
    await sheet.waitFor(); await answerOil(page, T, 'yes')
    await page.waitForTimeout(400)
    const now = await recId(page, vapor.iid)
    const after = await page.locator(`#inBody tr[data-iid="${vapor.iid}"] [data-oilrev]`).count()
    return { ok: chip === 1 && /Not answered yet — 19 Jul/.test(line.replace(/\s+/g, ' ')) && now.oil && now.oil['2026-07-19'] > 0 && after === 1, detail: `"OIL?" ${chip}; "${line.replace(/\s+/g, ' ')}"; oil ${JSON.stringify(now.oil)}; chip after ${after}` }
  })

  await step('A16 DELETE is in the window: opened from its row, the input goes and its row with it; Undo brings both back', async () => {
    const blade = await rec(page, { type: 'Training', title: 'CRM refresher' })
    await page.locator(`#inBody tr[data-iid="${blade.iid}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
    await page.locator('#inpEditDel').click(); await page.waitForTimeout(400)
    const gone = !(await recId(page, blade.iid)) && !(await page.locator(`#inBody tr[data-iid="${blade.iid}"]`).count())
    await page.locator('#undoBtn').click(); await page.waitForTimeout(400)
    const back = !!(await recId(page, blade.iid)) && (await page.locator(`#inBody tr[data-iid="${blade.iid}"]`).count()) === 1
    return { ok: gone && back, detail: `gone ${gone}, back ${back}` }
  })
  await step('A17 a shared input’s row opens the ENTRY; its Delete asks for everyone first, and "Keep" keeps it', async () => {
    await rowOf('Flight safety brief').first().locator('[data-testid="in-open"]').click(); await page.locator(WIN).waitFor()
    const head = await page.locator(`${WIN} .win-ttl`).innerText().catch(() => '')
    await page.locator('#inpEditDel').click()
    const ask = await page.locator('[data-testid="inped-delall"]').innerText().catch(() => '')
    /* the question and BOTH its answers are in sight, above the window's pinned buttons — no scrolling to find "Keep"
       (walker A saw it under the window's foot at 1440 × 900 before the buttons were pinned) */
    const inSight = await page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"]').getBoundingClientRect(); return ['inped-delall-yes', 'inped-delall-no'].every(t => { const e = document.querySelector(`[data-testid="${t}"]`), b = e.getBoundingClientRect(), hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return b.top >= w.top && b.bottom <= w.bottom && b.bottom <= innerHeight && !!hit && (hit === e || e.contains(hit)) }) })
    await shot(page, 'A17-desk-delete-for-all')
    await page.locator('[data-testid="inped-delall-no"]').click()
    await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
    const still = (await page.evaluate(() => window.INPUTS.filter(r => r.title === 'Flight safety brief' && r.date === 'Jul 18').length))
    return { ok: /\+6/.test(head) && /for all 7 people/.test(ask) && still === 7 && inSight, detail: `${head} | ${ask.replace(/\s+/g, ' ')} | ${still} records | both answers in sight: ${inSight}` }
  })
  await step('A18 every field the pencil’s row changed is changed in the window: kind, title, remarks, hours, the person', async () => {
    const r = await rec(page, { type: 'Other', remarks: 'Collecting a new ID card from the pass office before lunch' })
    await page.locator(`#inBody tr[data-iid="${r.iid}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
    await page.selectOption('#inpEditType', 'Appointment')
    await page.fill('#inpEditOwnTitle', 'Pass office')
    await page.fill('#inpEditRmk', 'new ID card')
    await page.fill('#inpEditStart', '11:30'); await page.fill('#inpEditEnd', '12:30')
    await page.selectOption('#inpEditPerson', await csId(page, 'Blade'))
    await saveWin(page, T, 'yes')
    const now = await recId(page, r.iid)
    const row = (await page.locator(`#inBody tr[data-iid="${r.iid}"]`).innerText()).replace(/\s+/g, ' ')
    return { ok: now.type === 'Appointment' && now.title === 'Pass office' && now.remarks === 'new ID card' && now.s === 690 && now.e === 750 && now.person === await csId(page, 'Blade') && /Blade/.test(row) && /Pass office/.test(row),
      detail: `${now.type} "${now.title}" "${now.remarks}" ${now.s}-${now.e} | row: ${row.slice(0, 90)}` }
  })

  /* ---- what must NOT have changed ---- */
  await step('A19 THE SANS DAY IS NOT THIS CARD: its commitments are still pucks with the CAT, in its own rows (D647, D649)', async () => {
    await page.locator('#inSansMode').click(); await page.waitForTimeout(400)
    const iso = await page.evaluate(() => { const r = window.INPUTS.find(x => /SANS/.test(x.type)); if (!r) return null; const M = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }; const [m, d] = r.date.split(' '); return { iso: `${r.yr || 2026}-${String(M[m]).padStart(2, '0')}-${String(+d).padStart(2, '0')}`, y: r.yr || 2026, m: M[m] } })
    if (!iso) return { ok: false, detail: 'the demo holds no SANS commitment' }
    for (let i = 0; i < 24; i++) {
      const t = (await page.locator('[data-testid="sc-month"]').getAttribute('aria-label')).trim().toLowerCase().split(/\s+/)
      const d = iso.y * 12 + (iso.m - 1) - (+t[1] * 12 + MONTHS.findIndex(x => x.startsWith(t[0])))
      if (!d) break
      await page.locator(`[data-testid="${d > 0 ? 'sc-next' : 'sc-prev'}"]`).click()
    }
    await page.locator(`[data-testid="sc-day-${iso.iso}"], [data-scday="${iso.iso}"], [data-iso="${iso.iso}"]`).first().click({ position: { x: 8, y: 8 } })
    const win = page.locator('[data-testid="win-sansday"]')
    await win.waitFor({ timeout: 4000 })
    const m = await win.evaluate(w => ({ rows: w.querySelectorAll('.sd-row').length, pucks: w.querySelectorAll('.sd-row .puck').length, cards: w.querySelectorAll('.icard').length }))
    await shot(page, 'A19-desk-sans-day')
    await page.keyboard.press('Escape'); await page.locator('#inMemberMode').click(); await page.waitForTimeout(300)
    return { ok: m.rows > 0 && m.pucks >= m.rows && m.cards === 0, detail: JSON.stringify(m) }
  })
  await step('A20 THE MEDICAL TAB keeps its own cards', async () => {
    await page.locator('#inMedBtn').click()
    await page.waitForTimeout(400)
    const m = await page.evaluate(() => ({ med: document.querySelectorAll('.medcard').length, cards: document.querySelectorAll('.medcard .icard, .icard .medcard').length, shownCards: [...document.querySelectorAll('.icard')].filter(e => e.offsetParent).length }))
    await page.locator('#inMemberMode').click().catch(() => {}); await page.waitForTimeout(200)
    return { ok: m.med > 0 && m.cards === 0 && m.shownCards === 0, detail: JSON.stringify(m) }
  })
  await ctx.close()
}

/* ============================================================== B — a desktop, a member (Ranger) */
{
  const { ctx, page } = await open({ width: 1440, height: 900 }, 'us', 'us')
  const T = false
  await step('B1 a member’s list: no pencil, no cross; under Everyone another man’s row OPENS to be read — no Save, no Delete, no date calendar, nothing sending him elsewhere for the dates', async () => {
    await toList(page, T)
    await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(300)
    const old = await page.locator('#inBody [data-edit], #inBody [data-inx], #inBody .rmx').count()
    const other = page.locator('#inBody tr').filter({ hasText: 'Vapor' }).first()
    await other.locator('[data-testid="in-open"]').click(); await page.locator(WIN).waitFor()
    const m = await page.locator(WIN).evaluate(w => ({ save: !!w.querySelector('#inpEditSave'), del: !!w.querySelector('#inpEditDel'), cal: !!w.querySelector('#inpEdCal'), ro: (w.querySelector('[data-testid="inped-ro"]') || {}).textContent || '', hint: (w.querySelector('.inped-hint') || {}).textContent || '' }))
    await shot(page, 'B1-member-reads-another')
    await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
    return { ok: old === 0 && !m.save && !m.del && !m.cal && /Only Vapor or an admin/.test(m.ro) && !/dates are changed/i.test(m.hint), detail: `old controls ${old}; ${JSON.stringify(m)}` }
  })
  await step('B2 his OWN input opens to be changed: Save, Delete and the date calendar; a tap moves it, and it is saved', async () => {
    const mine = await rec(page, { type: 'Appointment', date: 'Jul 16', person: await csId(page, 'Ranger') })
    await page.locator(`#inBody tr[data-iid="${mine.iid}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
    const m = await page.locator(WIN).evaluate(w => ({ save: !!w.querySelector('#inpEditSave'), del: !!w.querySelector('#inpEditDel'), cal: !!w.querySelector('#inpEdCal'), person: !!w.querySelector('#inpEditPerson'), fixed: (w.querySelector('#inpEditPersonFixed') || {}).textContent || '' }))
    await page.locator(`${WIN} #inpEdCal [data-cal="2026-07-21"]`).click()
    await saveWin(page, T)
    const now = await recId(page, mine.iid)
    return { ok: m.save && m.del && m.cal && now.date === 'Jul 21', detail: `${JSON.stringify(m)}; now ${now.date}` }
  })
  await step('B2b ANOTHER man’s medical input, read by a member: the window is read only and its paperclip still opens the document', async () => {
    await toList(page, T); await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(300)
    const row = page.locator('#inBody tr').filter({ has: page.locator('.rclip') }).first()
    if (!(await row.count())) return { ok: false, detail: 'no row with a document in the demo list' }
    const iid = await row.getAttribute('data-iid')
    await row.locator('[data-testid="in-open"]').click(); await page.locator(WIN).waitFor()
    const ro = !(await page.locator('#inpEditSave').count())
    await page.locator(`${WIN} [data-testid="inped-docview"]`).click()
    const viewer = await page.locator('#docViewPop:not([hidden])').waitFor({ timeout: 2500 }).then(() => true, () => false)
    const onTop = viewer && await page.evaluate(() => { const v = document.querySelector('#docViewPop .airpop-box') || document.querySelector('#docViewPop'); const b = v.getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + 20); return !!hit && (v === hit || v.contains(hit)) })
    await shot(page, 'B2b-member-document')
    if (viewer) await page.locator('#docViewClose').click()
    await page.locator('#inpEditCancel').click().catch(() => {}); await page.waitForTimeout(200)
    return { ok: ro && viewer && onTop, detail: `input ${iid}: read only ${ro}, viewer ${viewer}, in front of the window ${onTop}` }
  })
  await step('B3 on the opened day a member sees "By Saber" on what an admin filed for him, and nothing on his own', async () => {
    await openDay(page, '2026-07-21', T)
    const cards = await cardFacts(page, DAYWIN, 'idy')
    const own = cards.find(c => c.who === 'Ranger')
    await shot(page, 'B3-member-day')
    return { ok: !!own && own.by === null, detail: JSON.stringify(cards.map(c => [c.who, c.kind, c.by])) }
  })
  await ctx.close()
}

/* ============================================================== C — a phone, by touch, the admin */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, 'ad', 'a', true)
  const T = true
  await fileSix(page, T)
  await step('C1 the opened day (phone): the six cards as approved; a two-line card is no taller than 56px, the one-line card of a plain input no taller than 38', async () => {
    await openDay(page, '2026-07-18', T); await page.waitForTimeout(3500)
    const cards = await cardFacts(page, DAYWIN, 'idy')
    await shot(page, 'C1-phone-day')
    const problems = expectSix(cards)
    const two = cards.filter(c => c.who === 'ALL AVAIL' || c.who === 'Blade').every(c => c.h <= 56)
    return { ok: cards.length === 6 && !problems.length && two, detail: problems.join('; ') || `heights ${cards.map(c => c.h).join('/')}` }
  })
  await step('C2 the phone’s list: NO table; a heading a day with its count; the same six cards under "Sat 18 Jul · 6 inputs"; no pencil, cross or OIL chip', async () => {
    await toList(page, T)
    const m = await page.evaluate(() => {
      const heads = [...document.querySelectorAll('#inList [data-testid="inl-day"]')]
      const sat = heads.find(h => /Sat 18 Jul/i.test(h.textContent))
      const under = []
      for (let e = sat && sat.nextElementSibling; e && !e.matches('[data-testid="inl-day"]'); e = e.nextElementSibling) under.push(e.getAttribute('data-iid'))
      const order = heads.map(h => h.getAttribute('data-iso'))
      return { table: !!document.querySelector('#intbl'), heads: heads.length, sat: sat ? sat.textContent : null, under: under.length, sorted: order.join() === [...order].sort().join(),
        old: document.querySelectorAll('#inList [data-edit], #inList [data-inx], #inList .rmx, #inList .roil, #inList .rclip').length, wide: document.documentElement.scrollWidth > window.innerWidth }
    })
    await page.evaluate(() => { const t = [...document.querySelectorAll('[data-testid="inl-day"]')].find(el => /16 Jul/i.test(el.textContent)); if (t) { t.scrollIntoView({ block: 'start' }); window.scrollBy(0, -130) } })
    await page.waitForTimeout(300); await shot(page, 'C2-phone-list')
    const cards = (await cardFacts(page, '#inList', 'inl')).filter(c => ['ALL AVAIL', 'Saber', 'Wisp', 'Blade'].includes(c.who) || (c.who || '').includes(',') || (c.who === 'Ranger' && c.kind === 'Duty'))
    const six = cards.filter(c => c.when && /^\d\d:\d\d/.test(c.when) && (c.title || c.rmk || c.by))
    const problems = expectSix(six.filter(c => !(c.who === 'ALL AVAIL' && c.title !== 'Sports day') && !((c.who || '').includes(',') && c.title !== 'Flight safety brief' ) && !(c.who === 'Saber' && !c.title)))
    return { ok: !m.table && m.heads > 5 && /Sat 18 Jul\s*6 inputs/i.test(m.sat || '') && m.under === 6 && m.sorted && m.old === 0 && !m.wide && !problems.length, detail: JSON.stringify(m) + (problems.length ? ' | ' + problems.join('; ') : '') }
  })
  await step('C3 a tap on a card opens the input’s window; its date calendar is there and can be reached; a tap moves the input and its card goes under the new day’s heading', async () => {
    const r = await rec(page, { type: 'Training', title: 'CRM refresher' })
    const card = page.locator(`#inList [data-testid="inl-row-${r.iid}"]`)
    await card.scrollIntoViewIfNeeded(); await card.tap()
    await page.locator(WIN).waitFor()
    const day = page.locator(`${WIN} #inpEdCal [data-cal="2026-07-21"]`)
    await day.scrollIntoViewIfNeeded()
    const box = await day.boundingBox(), vh = 844
    await shot(page, 'C3-phone-window-dates')
    await day.tap()
    await page.locator('#inpEditSave').scrollIntoViewIfNeeded()
    await saveWin(page, T)
    const now = await recId(page, r.iid)
    const head = await page.evaluate(iid => { let e = document.querySelector(`#inList [data-iid="${iid}"]`); while (e && !e.matches('[data-testid="inl-day"]')) e = e.previousElementSibling; return e ? e.textContent : null }, r.iid)
    return { ok: !!box && box.y >= 0 && box.y + box.height <= vh && now.date === 'Jul 21' && /21 Jul/i.test(head || ''), detail: `a day of the window's calendar measures ${box ? Math.round(box.width) + 'x' + Math.round(box.height) : 'none'} (reported, not judged — D487; a question for him); saved ${now.date}; heading "${head}"` }
  })
  await step('C4 LATE on a list card is its own button: tapped, it says the cut-off and opens nothing', async () => {
    const card = page.locator('#inList [data-testid^="inl-row-"]').filter({ hasText: 'Sports day' }).first()
    await card.scrollIntoViewIfNeeded()
    await card.locator('[data-testid="inl-late"]').tap()
    const note = await card.locator('[data-testid="inl-latenote"]').innerText().catch(() => '')
    const opened = await page.locator(WIN).count()
    return { ok: /^after the cut-off/.test(note) && !opened, detail: note }
  })
  await step('C5 an answered OIL is revised from the window a card opens (the card carries no chip): "Change…" opens the question', async () => {
    const r = await rec(page, { type: 'Other', remarks: 'Collecting a new ID card from the pass office before lunch' })
    const card = page.locator(`#inList [data-testid="inl-row-${r.iid}"]`)
    await card.scrollIntoViewIfNeeded(); await card.tap(); await page.locator(WIN).waitFor()
    const btn = page.locator(`${WIN} [data-testid="oil-revise"]`)
    await btn.scrollIntoViewIfNeeded(); await btn.tap()
    const sheet = await page.locator('[data-testid="oilconf"]').waitFor({ timeout: 3000 }).then(() => true, () => false)
    await shot(page, 'C5-phone-oil-change')
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    if (await page.locator(WIN).count()) await page.locator('#inpEditCancel').tap().catch(() => {})
    await page.waitForTimeout(200)
    return { ok: sheet, detail: `the OIL question opened: ${sheet}` }
  })
  await step('C5b A DOCUMENT IS OPENED FROM THE WINDOW ON A PHONE (the card has no paperclip): the paperclip button beside the window’s buttons opens the viewer, in front', async () => {
    const withDoc = await page.evaluate(() => { const r = window.INPUTS.find(x => /^(OML|ATT C|ATT B)$/.test(x.type) && (x.docId || (x.docIds || []).length)); return r ? r.iid : null })
    if (!withDoc) return { ok: false, detail: 'the demo holds no medical input with a document' }
    const card = page.locator(`#inList [data-testid="inl-row-${withDoc}"]`)
    await card.scrollIntoViewIfNeeded(); await card.tap(); await page.locator(WIN).waitFor()
    const btn = page.locator(`${WIN} [data-testid="inped-docview"]`)
    await btn.scrollIntoViewIfNeeded()
    const box = await btn.boundingBox(), beside = await page.locator('#inpEditCancel').boundingBox()
    await btn.tap()
    const viewer = await page.locator('#docViewPop:not([hidden])').waitFor({ timeout: 2500 }).then(() => true, () => false)
    const onTop = viewer && await page.evaluate(() => { const v = document.querySelector('#docViewPop .airpop-box') || document.querySelector('#docViewPop'); const b = v.getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + 20); return !!hit && (v === hit || v.contains(hit)) })
    await shot(page, 'C5b-phone-document')
    if (viewer) await page.locator('#docViewClose').tap()
    await page.locator('#inpEditCancel').tap().catch(() => {}); await page.waitForTimeout(200)
    /* as tall as the buttons it stands beside — the window's own size, not a new one (D487) */
    return { ok: viewer && onTop && !!box && !!beside && Math.abs(box.height - beside.height) <= 1 && box.width >= 40, detail: `viewer ${viewer}, in front ${onTop}, button ${box ? Math.round(box.width) + 'x' + Math.round(box.height) : 'none'}, the Cancel beside it ${beside ? Math.round(beside.height) : '?'} tall` }
  })
  await step('C6 a delete from the window takes the card away and the day’s count goes down by one', async () => {
    const before = await page.evaluate(() => { const h = [...document.querySelectorAll('[data-testid="inl-day"]')].find(x => /Sat 18 Jul/i.test(x.textContent)); return h ? h.querySelector('i').textContent : null })
    const r = await rec(page, { type: 'Duty', date: 'Jul 18', person: await csId(page, 'Ranger') })
    const card = page.locator(`#inList [data-testid="inl-row-${r.iid}"]`)
    await card.scrollIntoViewIfNeeded(); await card.tap(); await page.locator(WIN).waitFor()
    await page.locator('#inpEditDel').scrollIntoViewIfNeeded(); await page.locator('#inpEditDel').tap(); await page.waitForTimeout(400)
    const after = await page.evaluate(() => { const h = [...document.querySelectorAll('[data-testid="inl-day"]')].find(x => /Sat 18 Jul/i.test(x.textContent)); return h ? h.querySelector('i').textContent : null })
    return { ok: !(await recId(page, r.iid)) && before === '5 inputs' && after === '4 inputs', detail: `${before} → ${after}` }
  })
  await step('C7 narrow and sideways: at 320 wide and on its side (844 × 390) nothing runs off the screen and every card is inside it', async () => {
    const out = []
    for (const vp of [{ width: 320, height: 640 }, { width: 844, height: 390 }, { width: 430, height: 932 }]) {
      await page.setViewportSize(vp); await page.waitForTimeout(350)
      const m = await page.evaluate(() => ({ wide: document.documentElement.scrollWidth > window.innerWidth + 1, out: [...document.querySelectorAll('#inList [data-testid^="inl-row-"]')].filter(c => { const b = c.getBoundingClientRect(); return b.left < -0.5 || b.right > window.innerWidth + 0.5 }).length, table: !!document.querySelector('#intbl'), cards: document.querySelectorAll('#inList [data-testid^="inl-row-"]').length }))
      out.push({ vp: `${vp.width}x${vp.height}`, ...m })
      await shot(page, `C7-phone-${vp.width}x${vp.height}`)
    }
    /* 844 wide is past the stylesheet's 820: there the list is the TABLE */
    const ok = out.every(o => !o.wide && o.out === 0) && out[0].cards > 0 && !out[0].table && out[1].table && out[1].cards === 0 && out[2].cards > 0
    await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(300)
    return { ok, detail: JSON.stringify(out) }
  })
  await step('C8 crossing 820px with an input’s window open: the list changes its form behind it and the window keeps what was typed', async () => {
    const card = page.locator('#inList [data-testid^="inl-row-"]').filter({ hasText: 'Sports day' }).first()
    await card.scrollIntoViewIfNeeded(); await card.tap(); await page.locator(WIN).waitFor()
    await page.fill('#inpEditRmk', 'typed before the turn')
    await page.setViewportSize({ width: 900, height: 700 }); await page.waitForTimeout(400)
    const mid = await page.evaluate(() => ({ table: !!document.querySelector('#intbl'), typed: (document.querySelector('#inpEditRmk') || {}).value }))
    await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(400)
    const end = await page.evaluate(() => ({ cards: document.querySelectorAll('#inList [data-testid^="inl-row-"]').length, typed: (document.querySelector('#inpEditRmk') || {}).value }))
    await page.locator('#inpEditCancel').tap().catch(() => {}); await page.waitForTimeout(200)
    return { ok: mid.table && mid.typed === 'typed before the turn' && end.cards > 0 && end.typed === 'typed before the turn', detail: JSON.stringify({ mid, end }) }
  })
  await ctx.close()
}

await browser.close()
console.log(`\n${n - bad} of ${n} steps passed`)
console.log(errs.length ? 'ERRORS SEEN:\n' + [...new Set(errs)].join('\n') : 'no console errors, no page errors, no 4xx')
process.exit(bad ? 1 : 0)
