// The Inputs small fixes (D994, 20 Oct 26) — the walk, as assertions: a PASS means the app does the right thing.
// Every write goes through the app's own controls; the probe bridge only GETS to a page (window.go) and READS.
//   T  [TILL-NEXT-YEAR]       a last day in another year prints its year — the Inputs list, the input's own window,
//                              the week, the board, View-only Sched; a published Friday reads nothing pending for it
//   O  [OIL-ASK-HEAD-SEVERAL] the waiting OIL question is headed "<first A to Z> +2" — a bar of three dragged onto a
//                              Saturday (desktop); one man of three handed over on an Unavailable row (phone and desktop)
//   S  [INP-TILL-STALE]       a range taken back to one day in the window: the grey date follows, the remarks box holds
//                              only what was typed
//
//   node scripts/handpass/inputs-small-fixes-walk.mjs [out dir]      (empties its own folder first)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('inputs-small-fixes-walk v2')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-20-inputs-small-fixes')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const results = [], errs = []
let n = 0
const check = (name, ok, got) => { const l = `${ok ? 'PASS' : 'FAIL'} ${name} — saw ${JSON.stringify(got)}`; results.push(l); console.log(l) }
const notWalked = (name, why) => { const l = `NOT WALKED ${name} — ${why}`; results.push(l); console.log(l) }
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const SIZES = [['desktop', { viewport: { width: 1440, height: 900 } }, false], ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, true]]

async function session(opts) {
  const ctx = await browser.newContext({ ...opts, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url()}`) })
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(400)
  return { ctx, page }
}
const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await page.waitForTimeout(350) }
const tid = (page, t) => page.locator(`[data-testid="${t}"]`)
const press = (page, tap, loc) => (typeof loc === 'string' ? page.locator(loc) : loc).first()[tap ? 'tap' : 'click']()
const shot = async (page, name) => { await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' }); const f = join(OUT, `${String(++n).padStart(2, '0')}-${name}.png`); await page.screenshot({ path: f }); return f }
const mark = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); if (e) { e.scrollIntoView({ block: 'center' }); e.style.outline = '3px solid #ff3b6b'; e.style.outlineOffset = '2px' } return !!e }, sel)
const text = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : null }, sel)
/* the Inputs calendar turned to a month by reading its own heading */
async function incalMonth(page, tap, y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.indexOf(name.slice(0, 3)))
    if (!d) return
    await press(page, tap, d > 0 ? '#icNext' : '#icPrev')
  }
  throw new Error('Inputs calendar never reached the month')
}
/* the input window's own calendar turned to a month, by its heading */
async function winMonth(page, tap, iso) {
  for (let i = 0; i < 40 && !(await page.locator(`#inpEdCal [data-iso="${iso}"]`).count()); i++) {
    const [m, y] = (await page.locator('#inpEdCal .dcal-my').innerText()).trim().split(/\s+/)
    const at = `${y}-${String(MONTHS.indexOf(m.toLowerCase().slice(0, 3)) + 1).padStart(2, '0')}`
    await press(page, tap, `#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`)
  }
}
async function openDay(page, iso) {
  await page.locator(`#inpCal [data-icday="${iso}"]`).focus()
  await page.keyboard.press('Enter')
  await tid(page, 'win-inputsday').waitFor()
}
/* people free on the days asked (day indexes of the loaded week): named (not a placeholder, not ground crew, not archived,
   not SANS), on no line of those days and in no input covering them — read off the app, never written */
const freeMen = (page, k, days = [3, 4, 5]) => page.evaluate(([k, days]) => {
  const P = window.PEOPLE, D = window.DAYS
  return Object.keys(P).filter(id => !P[id].special && !P[id].pers && !P[id].archived && !P[id].san
    && days.every(d => !JSON.stringify(D[d]).includes(`"${id}"`))
    && !window.INPUTS.some(r => JSON.stringify(r).includes(`"${id}"`) && days.some(d => window.inputCoversDate(r, D[d].dt)))).slice(0, k)
}, [k, days])
const cs = (page, id) => page.evaluate(id => window.PEOPLE[id].cs, id)
const azHead = async (page, ids) => { const c = []; for (const id of ids) c.push(await cs(page, id)); c.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })); return `${c[0]} +${ids.length - 1}` }
/* file an input through a day of the Inputs calendar and its "+ Input" — returns its iid, named by the difference */
async function fileOn(page, tap, iso, spec) {
  await go(page, 'inputs')
  if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(page, tap, '#inCalBtn')
  await incalMonth(page, tap, +iso.slice(0, 4), +iso.slice(5, 7))
  await openDay(page, iso)
  const before = await page.evaluate(() => window.INPUTS.map(r => String(r.iid)))
  await press(page, tap, '#icPopAdd')
  await page.locator('#inpEditPop #inpEditType').waitFor()
  await page.selectOption('#inpEditPop #inpEditType', spec.type)
  if (spec.people.length > 1) {
    await press(page, tap, '#inpEditPop [data-testid="pp-several"]')
    for (const id of spec.people) if ((await page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(page, tap, `#inpEditPop [data-pp="${id}"]`)
    const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    for (const id of lit) if (!spec.people.includes(id)) await press(page, tap, `#inpEditPop [data-pp="${id}"]`)
  } else await page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
  if (spec.end) { await winMonth(page, tap, spec.end); await press(page, tap, `#inpEdCal [data-iso="${spec.end}"]`) }
  const ad = page.locator('#inpEditPop #inpEditAllday')
  if (spec.from) { if (await ad.count() && await ad.isChecked()) await ad.click(); await page.fill('#inpEditPop #inpEditStart', spec.from); await page.fill('#inpEditPop #inpEditEnd', spec.to) }
  if (spec.title && await page.locator('#inpEditPop #inpEditOwnTitle').count()) await page.fill('#inpEditPop #inpEditOwnTitle', spec.title)
  if (spec.remarks) await page.fill('#inpEditPop #inpEditRmk', spec.remarks)
  if (spec.beforeSave) await spec.beforeSave()
  await press(page, tap, '#inpEditSave')
  await page.waitForTimeout(400)
  if (await tid(page, 'oilconf').count()) { await press(page, tap, '[data-testid="oil-yes"]'); await press(page, tap, '[data-testid="oilconf-save"]') }
  if (await tid(page, 'win-inputsday-x').count()) await press(page, tap, '[data-testid="win-inputsday-x"]')
  const made = await page.evaluate(b => window.INPUTS.map(r => String(r.iid)).filter(x => !b.includes(x)), before)
  return made.length === 1 ? made[0] : null
}
async function board(page, di) {
  await go(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await page.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' })
  await page.waitForTimeout(400)
}
const closeBoard = async (page) => { if (await page.locator('#sbDone:visible').count()) { await page.locator('#sbDone:visible').first().click(); await page.waitForTimeout(400) } }
/* the week's day card for day index di brought into view (the phone steps day to day; read the card that is there) */
const dayCard = (page, root, di) => page.evaluate(([root, di]) => { const d = document.querySelector(`${root} .day[data-day="${di}"]`); if (d) d.scrollIntoView({ block: 'start', inline: 'start' }); return !!d }, [root, di])
/* every visible element of a scope that holds `words`, its own text */
const holds = (page, scope, words) => page.evaluate(([scope, words]) => [...document.querySelectorAll(`${scope} *`)].filter(e => e.children.length === 0 && e.getBoundingClientRect().height > 1 && (e.textContent || '').includes(words)).map(e => (e.parentElement?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90)), [scope, words])

/* ============================== T — the till date's year ============================== */
for (const [size, opts, tap] of SIZES) {
  const { ctx, page } = await session(opts)
  try {
    /* T1 the demo's own 15 Feb 2027 input, on the Inputs list (All dates) */
    await go(page, 'inputs')
    await press(page, tap, '#inListBtn'); await page.waitForTimeout(300)
    if (!(await page.locator('#inRangePop').count())) await press(page, tap, '#inRangeBtn')
    await press(page, tap, '#inRangeAll'); await page.waitForTimeout(300)
    const iid = await page.evaluate(() => { const r = window.INPUTS.find(x => x.date === 'Feb 15' && +x.yr === 2027); return r ? String(r.iid) : null })
    if (!iid) notWalked(`${size} T1`, 'the demo has no 15 Feb 2027 input')
    else {
      const row = `#inBody [data-iid="${iid}"], #inList [data-iid="${iid}"]`
      const t = await text(page, row)
      if (size === 'desktop') check(`${size} T1: the Inputs list's row prints "till 15 Feb 2027"`, /till 15 Feb 2027/.test(t || ''), t)
      else check(`${size} T1: the phone's card carries no till date (D728 — its heading says the date)`, !/till 15 Feb/.test(t || ''), t)
      await mark(page, row); await shot(page, `${size}-T1-list-next-year`)
      /* T2 its own window: the grey date after the remarks box */
      await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); e && e.style.removeProperty('outline') }, row)
      await press(page, tap, page.locator(row).filter({ visible: true }))
      await page.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 5000 })
      const g = await text(page, '[data-testid="inped-till"]')
      check(`${size} T2: its window's grey date reads "till 15 Feb 2027"`, g === 'till 15 Feb 2027', g)
      await mark(page, '[data-testid="inped-till"]'); await shot(page, `${size}-T2-window-next-year`)
      await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    }
    /* T3 a leave filed on Friday 17 Jul 2026 running to Tuesday 5 Jan 2027, through the calendar's "+ Input" — desktop
       files it; the phone reads the same world in its own session, so it files its own */
    const [who] = await freeMen(page, 1)
    let grey = null
    const lid = await fileOn(page, tap, '2026-07-17', { type: 'OL', people: [who], end: '2027-01-05', remarks: 'Walk leave',
      beforeSave: async () => { grey = await text(page, '[data-testid="inped-till"]'); await mark(page, '[data-testid="inped-till"]'); await shot(page, `${size}-T3-window-before-save`) } })
    check(`${size} T3: picked 17 Jul → 5 Jan, the window's grey date reads "till 5 Jan 2027"`, grey === 'till 5 Jan 2027', grey)
    if (!lid) { notWalked(`${size} T4–T7`, 'the leave was not filed (no new input)'); throw new Error('stop T') }
    const shown = await page.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === id); return r && { date: r.date, end: r.endDate, yr: r.yr, remarks: r.remarks } }, lid)
    check(`${size} T3: saved 17 Jul → 5 Jan 2027, its remark only what was typed`, !!shown && shown.remarks === 'Walk leave' && /Jan 5/.test(shown.end || ''), shown)
    /* T4 Edit Schedule's week, Friday: the leave's line under Unavailable */
    await go(page, 'editsched'); await dayCard(page, '#eWeek', 4); await page.waitForTimeout(300)
    const wk = await holds(page, '#eWeek .day[data-day="4"]', 'till 5 Jan 2027')
    check(`${size} T4: Edit Schedule's Friday prints "till 5 Jan 2027"`, wk.length > 0, wk)
    await page.evaluate(() => { const e = [...document.querySelectorAll('#eWeek .day[data-day="4"] *')].find(x => x.children.length === 0 && (x.textContent || '').includes('till 5 Jan 2027')); if (e) { e.scrollIntoView({ block: 'center' }); e.style.outline = '3px solid #ff3b6b' } })
    await shot(page, `${size}-T4-week-friday`)
    /* T5 the Scheduler Board, Friday */
    await board(page, 4)
    const bd = await holds(page, '#schedBoard', 'till 5 Jan 2027')
    check(`${size} T5: the Scheduler Board's Friday prints "till 5 Jan 2027"`, bd.length > 0, bd)
    await page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard *')].find(x => x.children.length === 0 && x.getBoundingClientRect().height > 1 && (x.textContent || '').includes('till 5 Jan 2027')); if (e) { e.scrollIntoView({ block: 'center' }); e.style.outline = '3px solid #ff3b6b' } })
    await shot(page, `${size}-T5-board-friday`)
    /* T6 published (desktop: signed and published through the board's own controls), then nothing waits on it */
    if (size === 'desktop') {
      const sels = page.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible')
      for (let i = 0, k = await sels.count(); i < k; i++) {
        const o = await sels.nth(i).locator('option').evaluateAll(os => os.map(x => x.value).filter(v => v && v !== '—'))
        await sels.nth(i).selectOption(o[Math.min(i, o.length - 1)])
      }
      const beak = page.locator('#schedBoard [data-beak="4"]:visible')
      if (!(await beak.count()) || await beak.first().isDisabled()) notWalked(`${size} T6`, 'no enabled Publish on Friday')
      else {
        await beak.first().click(); await page.waitForTimeout(800)
        const st = await page.evaluate(() => ({ pend: window.dayShownPendCount ? window.dayShownPendCount(4) : null, approved: !!(window.SCHED && window.SCHED.dayOK && window.SCHED.dayOK[4]) }))
        const chip = await text(page, '#schedBoard .dpend:not(.dnew):not(.dchg)')
        check(`${size} T6: Friday published with the leave on it — no "pending" chip`, st.approved && !chip, { ...st, chip })
        await shot(page, `${size}-T6-published-friday`)
        /* …and after a reload, worked out again from the saved world */
        await closeBoard(page)
        await page.reload(); await page.waitForSelector('#vWeek .day, #luser', { state: 'attached' }); await page.waitForTimeout(500)
        if (await page.locator('#luser').count()) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached' }) }
        await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
        await board(page, 4)
        const chip2 = await text(page, '#schedBoard .dpend:not(.dnew):not(.dchg)')
        const bd2 = await holds(page, '#schedBoard', 'till 5 Jan 2027')
        check(`${size} T6: after a reload — still nothing pending, still "till 5 Jan 2027"`, !chip2 && bd2.length > 0, { chip2, bd2 })
        await shot(page, `${size}-T6-after-reload`)
      }
    }
    await closeBoard(page)
    /* T7 View-only Sched, Friday */
    await go(page, 'viewsched'); await dayCard(page, '#vWeek', 4); await page.waitForTimeout(300)
    const vw = await holds(page, '#vWeek .day[data-day="4"]', 'till 5 Jan 2027')
    check(`${size} T7: View-only Sched's Friday prints "till 5 Jan 2027"`, vw.length > 0, vw)
    await page.evaluate(() => { const e = [...document.querySelectorAll('#vWeek .day[data-day="4"] *')].find(x => x.children.length === 0 && (x.textContent || '').includes('till 5 Jan 2027')); if (e) { e.scrollIntoView({ block: 'center' }); e.style.outline = '3px solid #ff3b6b' } })
    await shot(page, `${size}-T7-viewonly-friday`)
  } catch (e) { if (e.message !== 'stop T') { results.push(`ERROR ${size} T: ${e.message.split('\n')[0]}`); console.log('ERROR', e.message); await shot(page, `${size}-T-error`) } }
  await ctx.close()
}

/* ============================== O — the OIL question's heading ============================== */
/* O1 (desktop): a Training of three on Friday 17 Jul, its bar dragged onto Saturday 18 Jul with the mouse */
{
  const { ctx, page } = await session(SIZES[0][1])
  try {
    const three = await freeMen(page, 3)
    if (three.length < 3) throw new Error(`only ${three.length} free men for a Training of three`)
    const id = await fileOn(page, false, '2026-07-17', { type: 'Training', people: three, from: '09:00', to: '10:00', title: 'Walk brief' })
    if (!id) throw new Error('the Training of three was not filed')
    await go(page, 'inputs'); await incalMonth(page, false, 2026, 7)
    const bar = page.locator(`#inpCal .ib-bar[data-iid="${id}"]`).first()
    const sat = page.locator('#inpCal [data-icday="2026-07-18"]').first()
    await bar.scrollIntoViewIfNeeded()
    const b = await bar.boundingBox(), s = await sat.boundingBox()
    await page.mouse.move(b.x + Math.min(20, b.width / 2), b.y + b.height / 2); await page.mouse.down()
    for (let i = 1; i <= 12; i++) await page.mouse.move(b.x + 20 + (s.x + s.width / 2 - b.x - 20) * i / 12, b.y + b.height / 2 + (s.y + s.height * 0.75 - b.y - b.height / 2) * i / 12)
    await page.waitForTimeout(120); await page.mouse.up(); await page.waitForTimeout(500)
    const head = await text(page, '[data-testid="oilconf"] .airpop-head b')
    const want = `OIL: ${await azHead(page, three)}, Walk brief`
    check(`desktop O1: the bar of three dragged onto Saturday — the question waits, headed "${want}"`, head === want, head)
    await mark(page, '[data-testid="oilconf"] .airpop-head'); await shot(page, 'desktop-O1-drag-heading')
    const date0 = await page.evaluate(id => window.INPUTS.find(x => String(x.iid) === id).date, id)
    check('desktop O1: nothing moved while it waits', date0 === 'Jul 17', date0)
    if (await tid(page, 'oil-yes').count()) { await tid(page, 'oil-yes').click(); await tid(page, 'oilconf-save').click(); await page.waitForTimeout(400) }
    const date1 = await page.evaluate(id => window.INPUTS.find(x => String(x.iid) === id).date, id)
    check('desktop O1: answered — moved to Saturday', date1 === 'Jul 18', date1)
  } catch (e) { results.push(`ERROR desktop O1: ${e.message.split('\n')[0]}`); console.log('ERROR', e.message); await shot(page, 'desktop-O1-error') }
  await ctx.close()
}
/* O2 (phone and desktop): an overseas duty of three on Thursday 16 Jul, Thursday then made a public holiday and its
   OIL list left for later; on Edit Schedule's week one of the three is handed over by an armed tap */
for (const [size, opts, tap] of SIZES) {
  const { ctx, page } = await session(opts)
  try {
    const men = await freeMen(page, 4), three = men.slice(0, 3), newcomer = men[3]
    if (men.length < 4) throw new Error(`only ${men.length} free men for the hand-over`)
    const id = await fileOn(page, tap, '2026-07-16', { type: 'OD', people: three, title: 'Walk OD' })
    if (!id) throw new Error('the overseas duty of three was not filed')
    await go(page, 'inputs')
    await press(page, tap, '#inGear'); await press(page, tap, '[data-testid="iset-days"]')
    if (await tid(page, 'days-tab-holidays').count()) await press(page, tap, '[data-testid="days-tab-holidays"]')
    await press(page, tap, '[data-testid="hol-add"]'); await press(page, tap, '[data-testid="hol-kind-ph"]')
    await tid(page, 'hol-name').fill('Walk holiday')
    for (let i = 0; i < 40; i++) {
      const [nm, yr] = (await page.locator('[data-testid="holcal-title"] .dcal-my').innerText()).trim().toLowerCase().split(/\s+/)
      const d = 2026 * 12 + 6 - (+yr * 12 + MONTHS.indexOf(nm.slice(0, 3)))
      if (!d) break
      await press(page, tap, d > 0 ? '[data-testid="holcal-next"]' : '[data-testid="holcal-prev"]')
    }
    await press(page, tap, '[data-testid="holcal-day-2026-07-16"]'); await press(page, tap, '[data-testid="hol-save"]')
    await page.waitForTimeout(500)
    if (await tid(page, 'odl-later').count()) await press(page, tap, '[data-testid="odl-later"]')
    for (const x of ['win-days-x', 'win-inputsset-x']) if (await tid(page, x).count()) await press(page, tap, `[data-testid="${x}"]`)
    const oil = await page.evaluate(id => window.INPUTS.find(x => String(x.iid) === id).oil || null, id)
    check(`${size} O2: set-up — the overseas duty of three on a holiday, its OIL question unanswered`, !oil || !oil['2026-07-16'], oil)
    await go(page, 'editsched'); await dayCard(page, '#eWeek', 3); await page.waitForTimeout(300)
    const seat = page.locator(`#eWeek .day[data-day="3"] [data-inpseat^="${id}"]`).filter({ visible: true })
    const seats = await seat.count()
    if (!seats) { notWalked(`${size} O2`, 'no Unavailable seat drawn for the duty'); await shot(page, `${size}-O2-noseat`); throw new Error('stop O2') }
    await seat.first().evaluate(e => e.scrollIntoView({ block: 'center' }))
    await press(page, tap, seat.first())
    const armed = await page.evaluate(() => window.ARM && window.ARM.key)
    const puck = page.locator(`#eRoster .rpuck[data-person="${newcomer}"]`).filter({ visible: true })
    if (!armed || !(await puck.count())) { notWalked(`${size} O2`, `armed ${JSON.stringify(armed)}, newcomer's puck offered ${await puck.count()}`); await shot(page, `${size}-O2-noarm`); throw new Error('stop O2') }
    await puck.first().evaluate(e => e.scrollIntoView({ block: 'center' }))
    await press(page, tap, puck.first()); await page.waitForTimeout(500)
    const handedFrom = await page.evaluate(([id, three]) => { const r = window.INPUTS.find(x => String(x.iid) === id); return (r.people || []).map(e => e.p).filter(p => three.includes(p)).length }, [id, three])
    const head = await text(page, '[data-testid="oilconf"] .airpop-head b')
    const after = await page.evaluate(([id]) => (window.INPUTS.find(x => String(x.iid) === id).people || []).map(e => e.p), [id])
    /* who it will hold: the three, one of them swapped for the newcomer — the seat tapped names which */
    const out = three.filter(p => !after.includes(p))
    const tapped = await seat.first().evaluate(e => e.getAttribute('data-inpseat'))
    const leaving = (tapped.split('~')[1]) || three[0]
    const want = `OIL: ${await azHead(page, three.map(p => (p === leaving ? newcomer : p)))}, Walk OD`
    check(`${size} O2: one of three handed over — the question waits, headed "${want}"`, head === want, { head, tapped, out, handedFrom })
    check(`${size} O2: nobody handed over while it waits`, after.length === 3 && three.every(p => after.includes(p)), after)
    await mark(page, '[data-testid="oilconf"] .airpop-head'); await shot(page, `${size}-O2-handover-heading`)
    if (await tid(page, 'oil-yes').count()) { await press(page, tap, '[data-testid="oil-yes"]'); await press(page, tap, '[data-testid="oilconf-save"]'); await page.waitForTimeout(400) }
    const done = await page.evaluate(([id]) => (window.INPUTS.find(x => String(x.iid) === id).people || []).map(e => e.p), [id])
    check(`${size} O2: answered — the newcomer holds the place`, done.includes(newcomer) && !done.includes(leaving) && done.length === 3, done)
  } catch (e) { if (e.message !== 'stop O2') { results.push(`ERROR ${size} O2: ${e.message.split('\n')[0]}`); console.log('ERROR', e.message); await shot(page, `${size}-O2-error`) } }
  await ctx.close()
}

/* ============================== S — a range taken back to one day ============================== */
for (const [size, opts, tap] of SIZES) {
  const { ctx, page } = await session(opts)
  try {
    const [who] = await freeMen(page, 1)
    await go(page, 'inputs')
    if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(page, tap, '#inCalBtn')
    await incalMonth(page, tap, 2026, 7); await openDay(page, '2026-07-18')
    await press(page, tap, '#icPopAdd'); await page.locator('#inpEditPop #inpEditType').waitFor()
    await page.selectOption('#inpEditPop #inpEditType', 'OL'); await page.selectOption('#inpEditPop #inpEditPerson', who)
    await page.fill('#inpEditPop #inpEditRmk', 'Bangkok')
    const g0 = await text(page, '[data-testid="inped-till"]')
    await press(page, tap, '#inpEdCal [data-iso="2026-07-19"]'); await page.waitForTimeout(200)
    const g1 = await text(page, '[data-testid="inped-till"]')
    await press(page, tap, '#inpEdCal [data-iso="2026-07-19"]'); await page.waitForTimeout(200)
    const g2 = await text(page, '[data-testid="inped-till"]')
    const box = await page.locator('#inpEditPop #inpEditRmk').inputValue()
    check(`${size} S1: 18 Jul, then 19 Jul, then 19 Jul again — the grey date follows each pick`, g0 === 'till 18 Jul' && g1 === 'till 19 Jul' && g2 === 'till 19 Jul', [g0, g1, g2])
    check(`${size} S1: the remarks box holds only what was typed`, box === 'Bangkok', box)
    await mark(page, '#inpEditPop .inped-rmk'); await shot(page, `${size}-S1-window-one-day`)
    const before = await page.evaluate(() => window.INPUTS.map(r => String(r.iid)))
    await press(page, tap, '#inpEditSave'); await page.waitForTimeout(400)
    const made = await page.evaluate(b => window.INPUTS.filter(r => !b.includes(String(r.iid))).map(r => ({ date: r.date, end: r.endDate || '', remarks: r.remarks })), before)
    check(`${size} S1: saved as one day, 19 Jul, its remark "Bangkok"`, made.length === 1 && made[0].remarks === 'Bangkok' && (!made[0].end || made[0].end === made[0].date), made)
  } catch (e) { results.push(`ERROR ${size} S1: ${e.message.split('\n')[0]}`); console.log('ERROR', e.message); await shot(page, `${size}-S1-error`) }
  await ctx.close()
}

await browser.close()
const log = [...results, ...errs.map(e => 'ERROR ' + e)].join('\n')
writeFileSync(join(OUT, 'results.txt'), log + '\n')
console.log(`\n${results.filter(r => r.startsWith('PASS')).length} PASS · ${results.filter(r => r.startsWith('FAIL')).length} FAIL · ${results.filter(r => r.startsWith('NOT')).length} NOT WALKED · ${errs.length} browser errors`)
