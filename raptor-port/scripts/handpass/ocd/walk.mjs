/* THE WALK OF [OIL-CONFIRM-DAYGRID] (owner D923, 17 Oct 26): the OIL question's "Only some days…" as the app's one
   calendar. Drives the built app (the served bundle, HP_URL, default http://localhost:4173) through every way in that
   draws the question's several-days form, with the app's own controls, and leaves a picture per step.
   Each check prints PASS / FAIL with the value it read (docs/walk-scripts.md §4); a step whose set-up could not act
   prints NOT WALKED.
   usage: node scripts/handpass/ocd/walk.mjs [only-these-scenario-ids, comma-separated]
   pictures: HP_SHOTS, default docs/img/handpass/2026-10-17-oil-confirm-daygrid/walk (a re-walk sets its own folder) */
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const SHOTS = process.env.HP_SHOTS || fileURLToPath(new URL('../../../docs/img/handpass/2026-10-17-oil-confirm-daygrid/walk/', import.meta.url))
const BASE = process.env.HP_URL || 'http://localhost:4173'
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) throw new Error('HP_URL must be a local build')
/* one run, one folder (docs/walk-scripts.md §5) */
if (existsSync(SHOTS)) for (const f of readdirSync(SHOTS)) if (f.endsWith('.png')) rmSync(SHOTS + '/' + f)
mkdirSync(SHOTS, { recursive: true })
const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const SIZES = {
  desk: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  side: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
}
const results = []
let shotN = 0
const log = (id, ok, what, seen) => { const r = { id, res: ok === null ? 'NOT WALKED' : ok ? 'PASS' : 'FAIL', what, seen }; results.push(r); console.log(`${r.res.padEnd(10)} ${id} — ${what}${seen !== undefined ? ' · read: ' + JSON.stringify(seen) : ''}`) }
const shot = async (p, name) => { const f = `${String(++shotN).padStart(2, '0')}-${name}.png`; await p.screenshot({ path: SHOTS + '/' + f }); return f }

async function world(size, who = 'ad', pass = 'a', fresh = true) {
  const ctx = await browser.newContext({ baseURL: BASE, ...SIZES[size] })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message))
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()) })
  await p.goto(fresh ? '/?fresh=1' : '/')
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await p.fill('#luser', who); await p.fill('#lpass', pass); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(500)
  const touch = !!SIZES[size].hasTouch
  const press = async sel => { const l = p.locator(sel).first(); if (touch) await l.tap(); else await l.click() }
  return { ctx, p, errs, press, touch, size }
}
async function toInputsMonth(w, iso) {
  const { p, press } = w
  await p.evaluate(() => window.go('inputs')); await p.waitForFunction(() => window.CURPAGE === 'inputs'); await p.waitForTimeout(300)
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press('#inCalBtn')
  await p.waitForSelector('#inpCal')
  for (let i = 0; i < 36 && !(await p.locator(`#inpCal [data-icday="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
    await press(at < want ? '#icNext' : '#icPrev')
  }
  console.log(`  (Inputs calendar on: ${(await p.locator('#inpCal .ic-mon').innerText()).trim()})`)
}
/* a new input over `days` days from `from`, picked with the keyboard on the Inputs calendar; its window filled and Saved */
async function fileNew(w, from, days, title, type = 'Duty') {
  const { p, press } = w
  await toInputsMonth(w, from)
  await p.locator(`#inpCal [data-icday="${from}"]`).focus()
  for (let i = 1; i < days; i++) await p.keyboard.press('Shift+ArrowRight')
  await p.keyboard.press('Enter')
  const win = '[data-testid="win-inputedit"]'
  await p.waitForSelector(`${win} #inpEditType`)
  await p.selectOption(`${win} #inpEditType`, type)
  await p.fill(`${win} #inpEditOwnTitle`, title)
  await press('#inpEditSave')
  await p.waitForTimeout(300)
}
const rec = (p, title) => p.evaluate(t => { const r = window.INPUTS.find(x => x.title === t); return r ? { oil: r.oil || null, date: r.date, endDate: r.endDate, iid: r.iid } : null }, title)
const count = p => p.locator('[data-testid="oil-count"]').innerText().catch(() => '')
const picked = p => p.evaluate(() => [...document.querySelectorAll('[data-testid="oilcal"] .dcal-d.is-sel')].map(e => e.getAttribute('data-iso')))
const tappable = p => p.evaluate(() => [...document.querySelectorAll('[data-testid="oilcal"] button.dcal-d:not(:disabled)')].map(e => e.getAttribute('data-iso')))
const month = p => p.locator('[data-testid="oilcal"]').getAttribute('data-month')
/* a press AT THE POINT of a date — the thing at its centre must be the date (nothing drawn over it) */
async function pressDay(w, iso) {
  const { p, touch } = w
  const d = p.locator(`[data-testid="oilcal-day-${iso}"]`)
  await d.evaluate(e => e.scrollIntoView({ block: 'center' }))
  const b = await d.boundingBox()
  const hit = await p.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[data-iso]')?.getAttribute('data-iso') || (document.elementFromPoint(x, y)?.className || 'nothing'), [b.x + b.width / 2, b.y + b.height / 2])
  if (hit !== iso) return { ok: false, hit }
  if (touch) await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await p.waitForTimeout(120)
  return { ok: true, hit }
}
/* the card and its two buttons inside the screen; the calendar inside the card from side to side */
const geometry = p => p.evaluate(() => {
  const card = document.querySelector('[data-testid="oilconf"] .airpop-box').getBoundingClientRect()
  const cal = document.querySelector('[data-testid="oilcal"]')?.getBoundingClientRect()
  const btn = ['[data-testid="oilconf-cancel"]', '[data-testid="oilconf-save"]'].map(q => document.querySelector(q).getBoundingClientRect())
  return {
    cardIn: card.left >= -0.5 && card.right <= innerWidth + 0.5 && card.top >= -0.5 && card.bottom <= innerHeight + 0.5,
    calInCard: !cal || (cal.left >= card.left - 0.5 && cal.right <= card.right + 0.5),
    buttonsInSight: btn.every(r => r.height > 0 && r.top >= card.top - 0.5 && r.bottom <= card.bottom + 0.5 && r.bottom <= innerHeight + 0.5),
    calW: cal ? Math.round(cal.width) : 0, cardW: Math.round(card.width),
  }
})
const want = id => !ONLY.length || ONLY.includes(id)

/* ---- S1 — the new input's Add, at the three sizes: the one calendar, the Friday faint, a press on Saturday, Add ---- */
for (const size of ['desk', 'phone', 'side']) {
  const id = `S1-${size}`
  if (!want(id) && !want('S1')) continue
  const w = await world(size)
  try {
    await fileNew(w, '2026-07-17', 3, `Walk S1 ${size}`)
    if (!(await w.p.locator('[data-testid="oilconf"]').count())) { log(id, null, 'the question did not open'); continue }
    log(id, /2 non-working days/i.test(await w.p.locator('[data-testid="oilconf"] .upconf-h').innerText()), 'the question asks about 2 non-working days', await w.p.locator('[data-testid="oilconf"] .upconf-h').innerText())
    await w.press('[data-testid="oil-some"]'); await w.p.waitForSelector('[data-testid="oilcal"]')
    const cls = await w.p.locator('[data-testid="oilcal"]').getAttribute('class')
    log(id, /\bdcal\b/.test(cls) && /\bis-many\b/.test(cls), 'it is the app’s one calendar, several-days mode', cls)
    log(id, (await month(w.p)) === '2026-07', 'it opens on July 2026', await month(w.p))
    log(id, JSON.stringify(await tappable(w.p)) === '["2026-07-18","2026-07-19"]', 'only Sat 18 and Sun 19 take a press', await tappable(w.p))
    const g = await geometry(w.p)
    log(id, g.cardIn && g.calInCard && g.buttonsInSight, 'card in the screen, calendar in the card, Back and Add in sight', g)
    await shot(w.p, `S1-${size}-opened`)
    const r = await pressDay(w, '2026-07-18')
    log(id, r.ok, 'Saturday is the thing under its own centre', r.hit)
    log(id, JSON.stringify(await picked(w.p)) === '["2026-07-18"]', 'Saturday is lit', await picked(w.p))
    log(id, (await count(w.p)) === '1 of 2 days selected — tap a day to change it', 'the count line', await count(w.p))
    await w.p.locator('[data-testid="oilcal-day-2026-07-17"]').dispatchEvent('click')
    log(id, JSON.stringify(await picked(w.p)) === '["2026-07-18"]', 'a click on the faint Friday changes nothing', await picked(w.p))
    const g2 = await geometry(w.p)
    log(id, g2.buttonsInSight, 'Back and Add still in sight after the press', g2)
    await shot(w.p, `S1-${size}-saturday-on`)
    log(id, (await w.p.locator('[data-testid="oilconf-save"]').innerText()) === 'Add', 'the right-hand button says Add (a new input)', await w.p.locator('[data-testid="oilconf-save"]').innerText())
    await w.press('[data-testid="oilconf-save"]'); await w.p.waitForTimeout(300)
    const s = await rec(w.p, `Walk S1 ${size}`)
    log(id, JSON.stringify(s?.oil) === '{"2026-07-18":1,"2026-07-19":0}', 'saved: Saturday FO, Sunday none', s?.oil)
    await shot(w.p, `S1-${size}-saved`)
    log(id, !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { log(id, false, 'threw', String(e).slice(0, 300)); await shot(w.p, `${id}-threw`).catch(() => {}) }
  finally { await w.ctx.close() }
}

/* ---- S2..S4 — orders inside one question (desktop) ---- */
if (want('S2') || want('S3') || want('S4')) {
  const w = await world('desk')
  try {
    /* S2: pick Saturday, then "All days" — every day credited */
    await fileNew(w, '2026-07-17', 3, 'Walk S2')
    await w.press('[data-testid="oil-some"]'); await pressDay(w, '2026-07-18')
    await w.press('[data-testid="oil-all"]')
    log('S2', !(await w.p.locator('[data-testid="oilcal"]').count()), '"All days" puts the calendar away', await w.p.locator('[data-testid="oilcal"]').count())
    await w.press('[data-testid="oilconf-save"]'); await w.p.waitForTimeout(300)
    log('S2', JSON.stringify((await rec(w.p, 'Walk S2'))?.oil) === '{"2026-07-18":1,"2026-07-19":1}', 'picked Saturday then All days: both days credited', (await rec(w.p, 'Walk S2'))?.oil)
    /* S3: pick Saturday, No OIL, back to Only some days — Saturday is still on; Save keeps it */
    await fileNew(w, '2026-07-24', 3, 'Walk S3')
    await w.press('[data-testid="oil-some"]'); await pressDay(w, '2026-07-26')
    await w.press('[data-testid="oil-none"]'); await w.press('[data-testid="oil-some"]')
    log('S3', JSON.stringify(await picked(w.p)) === '["2026-07-26"]', 'No OIL then Only some days again: the day picked before is still on', await picked(w.p))
    await shot(w.p, 'S3-desk-some-again')
    await w.press('[data-testid="oil-none"]'); await w.press('[data-testid="oilconf-save"]'); await w.p.waitForTimeout(300)
    log('S3', JSON.stringify((await rec(w.p, 'Walk S3'))?.oil) === '{"2026-07-25":0,"2026-07-26":0}', 'but No OIL saved: nothing credited, whatever was picked', (await rec(w.p, 'Walk S3'))?.oil)
    /* S4: Back, then Save again — the question again, nothing picked, nothing saved by Back */
    await fileNew(w, '2026-07-31', 3, 'Walk S4')
    await w.press('[data-testid="oil-some"]'); await pressDay(w, '2026-08-01')
    await w.press('[data-testid="oilconf-cancel"]'); await w.p.waitForTimeout(200)
    log('S4', !(await rec(w.p, 'Walk S4')) && (await w.p.locator('[data-testid="win-inputedit"]').count()) === 1, 'Back writes nothing and leaves the input’s window up', { saved: await rec(w.p, 'Walk S4'), window: await w.p.locator('[data-testid="win-inputedit"]').count() })
    await w.press('#inpEditSave'); await w.p.waitForTimeout(200)
    log('S4', (await w.p.locator('[data-testid="oilconf-save"]').isDisabled()), 'asked again, no answer picked: Add waits', await w.p.locator('[data-testid="oilconf-save"]').isDisabled())
    await w.press('[data-testid="oil-some"]')
    log('S4', (await month(w.p)) === '2026-08' && JSON.stringify(await picked(w.p)) === '[]', 'asked again: opens on August (the first day asked), nothing picked', { month: await month(w.p), picked: await picked(w.p) })
    log('S4', (await count(w.p)) === 'No days selected — tap a day to credit it', 'the empty count line', await count(w.p))
    await shot(w.p, 'S4-desk-asked-again')
    log('S2-S4', !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { log('S2-S4', false, 'threw', String(e).slice(0, 300)); await shot(w.p, 'S2-S4-threw').catch(() => {}) }
  finally { await w.ctx.close() }
}

/* ---- S5 — the input's window, "Change…" on its OIL line: the earlier answer is lit; Sunday on, Saturday off; Save ---- */
for (const size of ['desk', 'phone']) {
  const id = `S5-${size}`
  if (!want(id) && !want('S5')) continue
  const w = await world(size)
  try {
    await fileNew(w, '2026-07-17', 3, `Walk S5 ${size}`)
    await w.press('[data-testid="oil-some"]'); await pressDay(w, '2026-07-18'); await w.press('[data-testid="oilconf-save"]'); await w.p.waitForTimeout(300)
    const iid = (await rec(w.p, `Walk S5 ${size}`)).iid
    await w.press(`[data-testid="ib-bar-${iid}"]`).catch(async () => { await w.p.locator(`[data-testid="ib-bar-${iid}"]`).first().dispatchEvent('click') })
    await w.p.waitForSelector('[data-testid="oil-revise"]', { timeout: 4000 })
    log(id, /credited on 1 of 2/.test(await w.p.locator('.inped-oilsum').first().innerText()), 'the window’s OIL line says what stands', await w.p.locator('.inped-oilsum').first().innerText())
    await w.press('[data-testid="oil-revise"]'); await w.p.waitForSelector('[data-testid="oilconf"]')
    await w.press('[data-testid="oil-some"]')
    log(id, JSON.stringify(await picked(w.p)) === '["2026-07-18"]', 'the earlier answer is lit as it opens', await picked(w.p))
    await shot(w.p, `S5-${size}-change-opened`)
    await pressDay(w, '2026-07-19'); await pressDay(w, '2026-07-18')
    log(id, JSON.stringify(await picked(w.p)) === '["2026-07-19"]', 'Sunday on, Saturday off', await picked(w.p))
    log(id, (await w.p.locator('[data-testid="oilconf-save"]').innerText()) === 'Save', 'the right-hand button says Save (a change)', await w.p.locator('[data-testid="oilconf-save"]').innerText())
    await w.press('[data-testid="oilconf-save"]'); await w.p.waitForTimeout(300)
    /* the change is made by the window's own Save */
    if (await w.p.locator('#inpEditSave:visible').count()) { await w.press('#inpEditSave'); await w.p.waitForTimeout(300) }
    log(id, JSON.stringify((await rec(w.p, `Walk S5 ${size}`))?.oil) === '{"2026-07-18":0,"2026-07-19":1}', 'saved: Sunday FO, Saturday none', (await rec(w.p, `Walk S5 ${size}`))?.oil)
    await shot(w.p, `S5-${size}-saved`)
    log(id, !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { log(id, false, 'threw', String(e).slice(0, 300)); await shot(w.p, `${id}-threw`).catch(() => {}) }
  finally { await w.ctx.close() }
}

/* ---- S6 — the Inputs list's row, its OIL chip (a desktop's) ---- */
if (want('S6')) {
  const w = await world('desk')
  try {
    await fileNew(w, '2026-07-17', 3, 'Walk S6')
    await w.press('[data-testid="oil-all"]'); await w.press('[data-testid="oilconf-save"]'); await w.p.waitForTimeout(300)
    await w.press('#inListBtn')             // the list
    await w.p.waitForTimeout(400)
    const chip = w.p.locator('tr:has-text("Walk S6") .roil').first()
    if (!(await chip.count())) { log('S6', null, 'no OIL chip on the row (list on another month?)', await w.p.locator('.roil').count()); await shot(w.p, 'S6-no-chip') }
    else {
      await chip.click(); await w.p.waitForSelector('[data-testid="oilconf"]')
      await w.press('[data-testid="oil-some"]')
      log('S6', JSON.stringify(await picked(w.p)) === '["2026-07-18","2026-07-19"]', 'both days lit (both were answered yes)', await picked(w.p))
      await pressDay(w, '2026-07-19')
      await shot(w.p, 'S6-desk-list-chip')
      await w.press('[data-testid="oilconf-save"]'); await w.p.waitForTimeout(300)
      log('S6', JSON.stringify((await rec(w.p, 'Walk S6'))?.oil) === '{"2026-07-18":1,"2026-07-19":0}', 'saved from the list: Saturday only', (await rec(w.p, 'Walk S6'))?.oil)
    }
    log('S6', !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { log('S6', false, 'threw', String(e).slice(0, 300)); await shot(w.p, 'S6-threw').catch(() => {}) }
  finally { await w.ctx.close() }
}

/* ---- S7 — across a month's end: Fri 24 Jul – Sun 2 Aug, four days; the arrows, the lists, the swipe (phone) ---- */
for (const size of ['desk', 'phone']) {
  const id = `S7-${size}`
  if (!want(id) && !want('S7')) continue
  const w = await world(size)
  try {
    await fileNew(w, '2026-07-24', 10, `Walk S7 ${size}`)
    log(id, /4 non-working days/i.test(await w.p.locator('[data-testid="oilconf"] .upconf-h').innerText()), 'asks about 4 days', await w.p.locator('[data-testid="oilconf"] .upconf-h').innerText())
    await w.press('[data-testid="oil-some"]')
    await pressDay(w, '2026-07-25')
    if (size === 'desk') await w.press('[data-testid="oilcal-next"]')
    else {
      /* a finger slid sideways on the dates turns the month (D800) — resting before it lifts (walk-scripts §4) */
      const g = await w.p.locator('[data-testid="oilcal-grid"]').boundingBox(), y = g.y + g.height / 2
      const cdp = await w.ctx.newCDPSession(w.p)
      const t = (type, x) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] })
      await t('touchStart', g.x + g.width - 30); for (let i = 1; i <= 8; i++) await t('touchMove', g.x + g.width - 30 - i * 25); await w.p.waitForTimeout(90); await t('touchEnd')
      await w.p.waitForTimeout(400)
    }
    log(id, (await month(w.p)) === '2026-08', `${size === 'desk' ? 'the › arrow' : 'a sideways finger'} turns to August`, await month(w.p))
    await pressDay(w, '2026-08-02')
    await shot(w.p, `S7-${size}-august`)
    /* the lists: back to July by the month list */
    await w.press('[data-testid="oilcal-title"]'); await w.p.waitForSelector('[data-testid="oilcal-lists"]')
    await shot(w.p, `S7-${size}-lists`)
    await w.p.locator('[data-testid="oilcal-months"] [role="option"]', { hasText: /^July$/ }).first().click()
    await w.press('[data-testid="oilcal-title"]'); await w.p.waitForTimeout(200)
    log(id, (await month(w.p)) === '2026-07' && JSON.stringify(await picked(w.p)) === '["2026-07-25"]', 'back on July by the lists, Saturday 25 still lit', { m: await month(w.p), picked: await picked(w.p) })
    log(id, (await count(w.p)) === '2 of 4 days selected — tap a day to change it', 'the count counts both months', await count(w.p))
    await w.press('[data-testid="oilconf-save"]'); await w.p.waitForTimeout(300)
    log(id, JSON.stringify((await rec(w.p, `Walk S7 ${size}`))?.oil) === '{"2026-07-25":1,"2026-07-26":0,"2026-08-01":0,"2026-08-02":1}', 'saved: 25 Jul and 2 Aug only', (await rec(w.p, `Walk S7 ${size}`))?.oil)
    log(id, !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { log(id, false, 'threw', String(e).slice(0, 300)); await shot(w.p, `${id}-threw`).catch(() => {}) }
  finally { await w.ctx.close() }
}

/* ---- S8 — the keyboard alone (desktop): Tab into the dates, arrows step over the faint days, Space turns one on, Tab to
   Add, Enter; and Escape on the calendar closes the question, nothing written ---- */
if (want('S8')) {
  const w = await world('desk')
  const k = key => w.p.keyboard.press(key)
  const at = () => w.p.evaluate(() => { const a = document.activeElement; return a?.getAttribute('data-iso') || a?.getAttribute('data-testid') || a?.tagName })
  try {
    await fileNew(w, '2026-07-24', 10, 'Walk S8')
    await w.p.locator('[data-testid="oil-some"]').focus(); await k('Enter'); await w.p.waitForSelector('[data-testid="oilcal"]')
    const path = []
    for (let i = 0; i < 8 && !/^\d{4}-/.test(await at() || ''); i++) { await k('Tab'); path.push(await at()) }
    log('S8', (await at()) === '2026-07-25', 'Tab reaches the dates on the first day that takes a tap', { path })
    await k('ArrowRight'); const a1 = await at()
    await k('ArrowRight'); const a2 = await at()
    log('S8', a1 === '2026-07-26' && a2 === '2026-08-01', '→ is Sunday, → again steps over the weekdays into August', [a1, a2, await month(w.p)])
    await k('Space'); await w.p.waitForTimeout(100)
    log('S8', JSON.stringify(await picked(w.p)) === '["2026-08-01"]', 'Space turns it on', await picked(w.p))
    await shot(w.p, 'S8-desk-keyboard')
    await k('ArrowLeft'); log('S8', (await at()) === '2026-07-26' && (await month(w.p)) === '2026-07', '← goes back over the month’s end to Sunday 26 Jul', [await at(), await month(w.p)])
    let n = 0
    while ((await at()) !== 'oilconf-save' && n++ < 12) await k('Tab')
    log('S8', (await at()) === 'oilconf-save', 'Tab reaches Add', n)
    await k('Enter'); await w.p.waitForTimeout(300)
    log('S8', JSON.stringify((await rec(w.p, 'Walk S8'))?.oil) === '{"2026-07-25":0,"2026-07-26":0,"2026-08-01":1,"2026-08-02":0}', 'saved by keyboard: 1 Aug only', (await rec(w.p, 'Walk S8'))?.oil)
    /* Escape on the calendar: the question closes, nothing written (the sheet's own Escape — its Back) */
    await fileNew(w, '2026-07-17', 3, 'Walk S8b')
    await w.p.locator('[data-testid="oil-some"]').focus(); await k('Enter')
    await w.p.locator('[data-testid="oilcal-day-2026-07-18"]').focus(); await k('Space')
    await k('Escape'); await w.p.waitForTimeout(200)
    log('S8', !(await w.p.locator('[data-testid="oilconf"]').count()) && !(await rec(w.p, 'Walk S8b')), 'Escape on the calendar closes the question; nothing written', { open: await w.p.locator('[data-testid="oilconf"]').count(), rec: await rec(w.p, 'Walk S8b') })
    log('S8', (await w.p.locator('[data-testid="win-inputedit"]').count()) === 1, '…and the input’s window is still up behind it', await w.p.locator('[data-testid="win-inputedit"]').count())
    log('S8', !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { log('S8', false, 'threw', String(e).slice(0, 300)); await shot(w.p, 'S8-threw').catch(() => {}) }
  finally { await w.ctx.close() }
}

/* ---- S9 — undo, redo and a reload after a save with some days (desktop) ---- */
if (want('S9')) {
  const w = await world('desk', 'ad', 'a', false)
  try {
    await fileNew(w, '2026-07-17', 3, 'Walk S9')
    await w.press('[data-testid="oil-some"]'); await pressDay(w, '2026-07-19'); await w.press('[data-testid="oilconf-save"]'); await w.p.waitForTimeout(300)
    const before = (await rec(w.p, 'Walk S9'))?.oil
    const undo = w.p.locator('#undoBtn:visible, [data-testid="undo"]:visible, button[aria-label="Undo"]:visible').first()
    if (!(await undo.count())) { log('S9', null, 'no Undo button found in view') }
    else {
      await undo.click(); await w.p.waitForTimeout(300)
      log('S9', !(await rec(w.p, 'Walk S9')), 'Undo takes the input and its answer away in one step', await rec(w.p, 'Walk S9'))
      const redo = w.p.locator('#redoBtn:visible, [data-testid="redo"]:visible, button[aria-label="Redo"]:visible').first()
      await redo.click(); await w.p.waitForTimeout(300)
      log('S9', JSON.stringify((await rec(w.p, 'Walk S9'))?.oil) === JSON.stringify(before), 'Redo brings both back', (await rec(w.p, 'Walk S9'))?.oil)
    }
    await w.p.reload(); await w.p.waitForSelector('#luser, #vWeek .day', { state: 'attached' })
    if (await w.p.locator('#luser').count()) { await w.p.fill('#luser', 'ad'); await w.p.fill('#lpass', 'a'); await w.p.click('#loginForm button[type=submit]'); await w.p.waitForSelector('#vWeek .day', { state: 'attached' }) }
    await w.p.waitForTimeout(500)
    log('S9', JSON.stringify((await rec(w.p, 'Walk S9'))?.oil) === '{"2026-07-18":0,"2026-07-19":1}', 'after a reload the answer is kept', (await rec(w.p, 'Walk S9'))?.oil)
    log('S9', !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { log('S9', false, 'threw', String(e).slice(0, 300)); await shot(w.p, 'S9-threw').catch(() => {}) }
  finally { await w.ctx.close() }
}

/* ---- S10 — the question that waits before a change: a weekday input's bar dragged onto a weekend (desktop) ---- */
if (want('S10')) {
  const w = await world('desk')
  try {
    await fileNew(w, '2026-07-20', 3, 'Walk S10')   // Mon–Wed: nothing to ask
    const asked = await w.p.locator('[data-testid="oilconf"]').count()
    if (asked) { log('S10', null, 'a weekday input asked the question — set-up failed'); throw new Error('premise') }
    if (await w.p.locator('[data-testid="win-inputedit"]').count()) await w.p.locator('[data-testid="win-inputedit-x"]').click().catch(() => {})
    const iid = (await rec(w.p, 'Walk S10')).iid
    const bar = w.p.locator(`[data-testid="ib-bar-${iid}"]`).first()
    const b = await bar.boundingBox(), y = b.y + b.height / 2
    const xOf = async iso => { const r = await w.p.locator(`#inpCal [data-icday="${iso}"]`).boundingBox(); return r.x + r.width / 2 }
    /* the bar sits in week row of the 20th; the 24th-26th are in the same row — drag Mon 20 → Fri 24 */
    await w.p.mouse.move(await xOf('2026-07-20'), y); await w.p.mouse.down()
    for (const d of ['2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24']) await w.p.mouse.move(await xOf(d), y + 3, { steps: 4 })
    await w.p.mouse.up(); await w.p.waitForTimeout(400)
    const up = await w.p.locator('[data-testid="oilconf"]').count()
    log('S10', up === 1, 'the move waits on the question', { up, rec: await rec(w.p, 'Walk S10') })
    if (up) {
      log('S10', /Move/.test(await w.p.locator('[data-testid="oilconf-save"]').innerText()), 'its buttons say what they do', [await w.p.locator('[data-testid="oilconf-cancel"]').innerText(), await w.p.locator('[data-testid="oilconf-save"]').innerText()])
      const multi = await w.p.locator('[data-testid="oil-some"]').count()
      if (!multi) log('S10', null, 'the move asked about one day only — the several-days form is not on this route', await w.p.locator('[data-testid="oilconf"]').innerText())
      else {
        await w.press('[data-testid="oil-some"]')
        log('S10', JSON.stringify(await tappable(w.p)) === '["2026-07-25","2026-07-26"]', 'only the new weekend takes a press', await tappable(w.p))
        await pressDay(w, '2026-07-25')
        await shot(w.p, 'S10-desk-move-waits')
        await w.press('[data-testid="oilconf-save"]'); await w.p.waitForTimeout(400)
        const r = await rec(w.p, 'Walk S10')
        log('S10', r?.date === 'Jul 24' && JSON.stringify(r?.oil) === '{"2026-07-25":1,"2026-07-26":0}', 'moved, with Saturday credited only', r)
      }
    }
    log('S10', !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { if (String(e) !== 'Error: premise') log('S10', false, 'threw', String(e).slice(0, 300)); await shot(w.p, 'S10-threw').catch(() => {}) }
  finally { await w.ctx.close() }
}

/* ---- S11 — a member files his own (phone): the same calendar ---- */
if (want('S11')) {
  const w = await world('phone', 'us', 'us')
  try {
    await fileNew(w, '2026-07-17', 3, 'Walk S11')
    if (!(await w.p.locator('[data-testid="oilconf"]').count())) { log('S11', null, 'the member’s save did not ask', await rec(w.p, 'Walk S11')); await shot(w.p, 'S11-no-question') }
    else {
      await w.press('[data-testid="oil-some"]')
      log('S11', JSON.stringify(await tappable(w.p)) === '["2026-07-18","2026-07-19"]', 'a member’s question: only the weekend takes a press', await tappable(w.p))
      await pressDay(w, '2026-07-19')
      await shot(w.p, 'S11-phone-member')
      await w.press('[data-testid="oilconf-save"]'); await w.p.waitForTimeout(300)
      log('S11', JSON.stringify((await rec(w.p, 'Walk S11'))?.oil) === '{"2026-07-18":0,"2026-07-19":1}', 'saved: Sunday only', (await rec(w.p, 'Walk S11'))?.oil)
    }
    log('S11', !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { log('S11', false, 'threw', String(e).slice(0, 300)); await shot(w.p, 'S11-threw').catch(() => {}) }
  finally { await w.ctx.close() }
}

/* ---- S12 — the other calendars that share it are as they were: one date (Jump to a date) and a run (the input's dates) ---- */
if (want('S12')) {
  const w = await world('desk')
  try {
    await toInputsMonth(w, '2026-07-17')
    await w.p.locator('#inpCal [data-icday="2026-07-20"]').focus(); await w.p.keyboard.press('Shift+ArrowRight'); await w.p.keyboard.press('Enter')
    await w.p.waitForSelector('[data-testid="win-inputedit"] .dcal')
    const runCal = await w.p.evaluate(() => { const c = document.querySelector('[data-testid="win-inputedit"] .dcal'); return { cls: c.className, out: c.querySelectorAll('.dcal-d.is-out').length, sel: [...c.querySelectorAll('.dcal-d.is-sel')].map(e => e.getAttribute('data-iso')) } })
    log('S12', !/is-many/.test(runCal.cls) && runCal.out === 0 && JSON.stringify(runCal.sel) === '["2026-07-20","2026-07-21"]', 'the input’s own dates: a run, nothing faint, not the several-days mode', runCal)
    await shot(w.p, 'S12-desk-run-calendar')
    log('S12', !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { log('S12', false, 'threw', String(e).slice(0, 300)); await shot(w.p, 'S12-threw').catch(() => {}) }
  finally { await w.ctx.close() }
}

/* ---- S13 — narrow phones (the scenario designer's F3): 360 and 320 wide — the calendar's head inside the calendar, the
   calendar inside the card, the card inside the screen ---- */
for (const width of (process.env.S13_WIDTHS || '360,320').split(',').map(Number)) {
  const id = `S13-${width}`
  if (!want(id) && !want('S13')) continue
  SIZES['n' + width] = { viewport: { width, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const w = await world('n' + width)
  try {
    await fileNew(w, '2026-07-17', 3, `Walk S13 ${width}`)
    await w.press('[data-testid="oil-some"]'); await w.p.waitForSelector('[data-testid="oilcal"]')
    const m = await w.p.evaluate(() => {
      const r = q => document.querySelector(q).getBoundingClientRect()
      const cal = r('[data-testid="oilcal"]'), card = r('[data-testid="oilconf"] .airpop-box'), next = r('[data-testid="oilcal-next"]'), title = r('[data-testid="oilcal-title"]')
      const sat = r('[data-testid="oilcal-day-2026-07-18"] b'), col = r('[data-testid="oilcal-day-2026-07-18"]')
      return { vw: innerWidth, cal: [Math.round(cal.left), Math.round(cal.right)], card: [Math.round(card.left), Math.round(card.right)], next: [Math.round(next.left), Math.round(next.right)], titleL: Math.round(title.left),
        headIn: next.right <= cal.right + 0.5 && title.left >= cal.left - 0.5, calIn: cal.left >= card.left - 0.5 && cal.right <= card.right + 0.5, cardIn: card.left >= -0.5 && card.right <= innerWidth + 0.5,
        discInCol: sat.width <= col.width + 0.5, disc: Math.round(sat.width), colW: Math.round(col.width), pageScrollW: document.documentElement.scrollWidth }
    })
    log(id, m.headIn && m.calIn && m.cardIn && m.pageScrollW <= m.vw, 'head inside the calendar, calendar inside the card, card inside the screen, no sideways scroll', m)
    log(id, m.discInCol, 'a date disc fits its column', { disc: m.disc, col: m.colW })
    await shot(w.p, `S13-${width}-narrow`)
    log(id, !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { log(id, false, 'threw', String(e).slice(0, 300)); await shot(w.p, `${id}-threw`).catch(() => {}) }
  finally { await w.ctx.close() }
}

/* ---- S14 — a phone on its side, the keyboard: a date the keys reach is in sight, never under the card's pinned foot
   (the design guide §2: nothing that takes the keyboard may be hidden under a bar that stays) ---- */
if (want('S14')) {
  const w = await world('side')
  const k = key => w.p.keyboard.press(key)
  try {
    await fileNew(w, '2026-07-24', 10, 'Walk S14')
    await w.p.locator('[data-testid="oil-some"]').focus(); await k('Enter'); await w.p.waitForSelector('[data-testid="oilcal"]')
    const seen = async () => w.p.evaluate(() => {
      const a = document.activeElement, r = a.getBoundingClientRect(), foot = document.querySelector('[data-testid="oilconf"] .airpop-foot').getBoundingClientRect()
      const box = document.querySelector('[data-testid="oilconf"] .airpop-box').getBoundingClientRect()
      return { iso: a.getAttribute('data-iso'), top: Math.round(r.top), bottom: Math.round(r.bottom), footTop: Math.round(foot.top), boxTop: Math.round(box.top), inSight: r.bottom <= foot.top + 0.5 && r.top >= box.top - 0.5 }
    })
    let n = 0
    while (!(await w.p.evaluate(() => !!document.activeElement?.getAttribute('data-iso'))) && n++ < 8) await k('Tab')
    const s1 = await seen()
    await k('ArrowDown'); const s2 = await seen()
    await k('ArrowDown'); const s3 = await seen()
    log('S14', s1.inSight && s2.inSight && s3.inSight, 'each date the keys reach is in sight above the pinned foot', [s1, s2, s3])
    await shot(w.p, 'S14-side-keyboard')
    log('S14', !w.errs.length, 'no error on the way', w.errs)
  } catch (e) { log('S14', false, 'threw', String(e).slice(0, 300)); await shot(w.p, 'S14-threw').catch(() => {}) }
  finally { await w.ctx.close() }
}

await browser.close()
const n = k => results.filter(r => r.res === k).length
console.log(`\nDONE — ${n('PASS')} PASS, ${n('FAIL')} FAIL, ${n('NOT WALKED')} NOT WALKED; ${shotN} pictures in ${SHOTS}`)
