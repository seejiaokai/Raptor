// THE WALK: cal-wheel-drag (D2170), 17 Nov 26. Version 3. Run from raptor-port/: node docs/handpass/2026-11-17-cal-wheel-drag/walk.mjs
// env: SURF=1,2,3  WORLD=desk|phone  OUT=<subfolder name>
import { writeFileSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { launch, world, go, press, rect, sleep, mouseDrag, atRest, listTop, fingerSwipe, ensure, HERE } from './lib.mjs'

console.log('walk.mjs version 5')
const OUT = path.join(HERE, process.env.OUT || 'pics'); ensure(OUT)
const only = process.env.SURF ? process.env.SURF.split(',').map(Number) : null
const worlds = process.env.WORLD ? [process.env.WORLD] : ['desk', 'phone']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const rows = []
const rec = (n, surf, step, wd, status, detail, pic = '') => { rows.push({ n, surf, step, wd, status, detail, pic }); console.log(`${status.padEnd(11)} ${n}-${surf} ${step} [${wd}] ${detail}${pic ? '  -> ' + pic : ''}`) }
const pad = n => String(n).padStart(2, '0')
const near = (a, b) => ['l', 't', 'r', 'b'].every(k => Math.abs(a[k] - b[k]) <= 0.6)

async function adminPanel(page, name) {
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on')
  const back = page.locator('#page-admin .adm-back')
  if (await back.count() && await back.first().isVisible()) await back.first().click()
  await page.evaluate(n => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && new RegExp('^' + n).test((b.textContent || '').trim())); if (b) b.click() }, name)
  await sleep(300)
}
async function dcalOpen(w, what) {
  const card = w.page.locator('[data-testid="dcal-card"]')
  await card.waitFor({ state: 'visible', timeout: 5000 })
  for (let i = 0; i < 30; i++) { if (await card.evaluate(c => getComputedStyle(c).opacity) === '1') break; await sleep(100) }
  await sleep(300)
}
async function openWheels(w, prefix) {
  await press(w, `[data-testid="${prefix}-title"]`)
  await w.page.locator(`[data-testid="${prefix}-lists"]`).waitFor({ state: 'visible', timeout: 5000 })
  await sleep(400)
}
const textOf = (page, sel) => page.locator(sel).first().innerText()
const yearIn = t => +(/(\d{4})/.exec(t) || ['', '0'])[1]
const monthIn = t => { const m = (/^\s*([A-Za-z]+)/.exec(t) || ['', ''])[1].toLowerCase(); return MONTHS.find(x => x.toLowerCase() === m) || m }
async function closeLayer(w) { if (w.touch) await w.page.touchscreen.tap(3, 3); else await w.page.mouse.click(3, 3) }
const boxVal = (page, sel) => page.locator(sel).first().getAttribute('data-value')

/** pick the first enabled date of the open dcal (middle of the month) as a person would */
async function pickOnDcal(w, prefix) {
  const days = w.page.locator(`[data-testid^="${prefix}-day-"]:not([disabled])`)
  const n = await days.count()
  if (!n) throw new Error('no enabled date on the calendar')
  const el = days.nth(Math.min(n - 1, Math.floor(n / 2)))
  const id = await el.getAttribute('data-testid')
  if (w.touch) await el.tap(); else await el.click()
  return id.slice(`${prefix}-day-`.length)
}

// ---------------------------------------------------------------------------- surfaces
const S = []
// 1. Admin Users Post in
S.push({ n: 1, name: 'admin-postin', label: 'Admin > Users > Post in (#accAddPostIn)', prefix: 'dcal', hosts: ['[data-testid="dcal-card"]'],
  async open(w) {
    await adminPanel(w.page, 'Users')
    await w.page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
    this.v0 = await boxVal(w.page, '#accAddPostIn')
    await press(w, '#accAddPostIn'); await dcalOpen(w); await openWheels(w, 'dcal')
  },
  read: w => boxVal(w.page, '#accAddPostIn'),
  async finish(w) {
    await press(w, '[data-testid="dcal-title"]'); await w.page.locator('[data-testid="dcal-grid"]').waitFor({ state: 'visible' })
    const iso = await pickOnDcal(w, 'dcal'); await sleep(500)
    const v = await boxVal(w.page, '#accAddPostIn')
    return { ok: v === iso && v !== this.v0, detail: `picked ${iso}, box shows ${v} (was ${this.v0})`, pic: '#accAddPostIn' }
  } })
// 2a. Admin Data - Older than date box
const dataForm = (n, id, label, mode) => ({ n, name: `admin-${id}-${mode}`, label, hosts: mode === 'run' ? ['#admData'] : ['[data-testid="dcal-card"]', '#admData'], prefix: mode === 'run' ? `${id}Run` : 'dcal',
  async open(w) {
    await adminPanel(w.page, 'Data')
    await w.page.locator(`#${id}Date`).scrollIntoViewIfNeeded()
    if (mode === 'box') {
      this.v0 = await boxVal(w.page, `#${id}Date`)
      await press(w, `#${id}Date`); await dcalOpen(w); await openWheels(w, 'dcal')
    } else {
      await w.page.selectOption(`#${id}Mode`, 'range')
      await w.page.locator(`#${id}Run`).waitFor({ state: 'visible' })
      await w.page.locator(`#${id}Run`).scrollIntoViewIfNeeded()
      await openWheels(w, `${id}Run`)
    }
  },
  read: w => mode === 'box' ? boxVal(w.page, `#${id}Date`) : w.page.locator(`#${id}Run`).evaluate(e => (e.getAttribute('data-from') || '') + '|' + (e.getAttribute('data-to') || '')),
  async finish(w) {
    if (mode === 'box') {
      await press(w, '[data-testid="dcal-title"]'); await w.page.locator('[data-testid="dcal-grid"]').waitFor({ state: 'visible' })
      const iso = await pickOnDcal(w, 'dcal'); await sleep(500)
      const v = await boxVal(w.page, `#${id}Date`)
      return { ok: v === iso, detail: `picked ${iso}, box shows ${v}; Clear button enabled=${await w.page.locator(`#${id}`).isEnabled()}`, pic: `#${id}Date` }
    }
    await press(w, `[data-testid="${id}Run-title"]`); await w.page.locator(`[data-testid="${id}Run-grid"]`).waitFor({ state: 'visible' })
    const days = w.page.locator(`[data-testid^="${id}Run-day-"]:not([disabled])`)
    const a = await days.nth(8).getAttribute('data-testid'), b = await days.nth(11).getAttribute('data-testid')
    await press(w, `[data-testid="${a}"]`); await press(w, `[data-testid="${b}"]`)
    await sleep(300)
    const f = await w.page.locator(`#${id}Run`).getAttribute('data-from'), t = await w.page.locator(`#${id}Run`).getAttribute('data-to')
    return { ok: f === a.slice(`${id}Run-day-`.length) && t === b.slice(`${id}Run-day-`.length), detail: `run ${f} to ${t} (pressed ${a.slice(-10)}, ${b.slice(-10)})`, pic: `#${id}Run` }
  } })
S.push(dataForm(2, 'admWipe', 'Admin > Data > clearing form 1: "Older than" date box', 'box'))
S.push(dataForm(2.1, 'admWipe', 'Admin > Data > clearing form 1: the range calendar (admWipeRun)', 'run'))
S.push(dataForm(2.2, 'admLog', 'Admin > Data > clearing form 2: range calendar (admLogRun)', 'run'))
// 3. Inputs calendar tab month title
S.push({ n: 3, name: 'inputs-cal', label: 'Inputs page > Calendar tab: month title chooser (mjump)', mj: true, titleSel: '#inpCal .ic-mon', hosts: ['[data-testid="dcal-card"]'],
  async open(w) {
    await go(w.page, 'inputs')
    if (await w.page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(w, '#inCalBtn')
    await w.page.locator('#inpCal').waitFor({ state: 'visible' })
    await sleep(500)
    await press(w, '#inpCal .ic-mon'); await w.page.locator('[data-testid="mjump-years"]').waitFor({ state: 'visible' }); await sleep(400)
  },
  read: async () => '',
  async finish(w, st) {
    await closeLayer(w); await sleep(500)
    const t = await textOf(w.page, '#inpCal .ic-mon')
    return { ok: t.includes(String(st.year)) && /^\s*[A-Za-z]+/.test(t) && await w.page.locator('[data-testid="mjump-years"]').count() === 0, detail: `chooser closed, page shows "${t.trim()}" (wheel left it on year ${st.year}, month ${st.month})`, pic: '#inpCal' }
  } })
// 4. SANS calendar
S.push({ n: 4, name: 'sans-cal', label: 'SANS calendar: month title chooser (sc-month)', mj: true, titleSel: '[data-testid="sc-month"]', hosts: ['[data-testid="dcal-card"]'],
  async open(w) {
    await go(w.page, 'inputs')
    await press(w, '#inSansMode'); await w.page.locator('[data-testid="sanscal"]').waitFor({ state: 'visible' }); await sleep(600)
    await press(w, '[data-testid="sc-month"]'); await w.page.locator('[data-testid="mjump-years"]').waitFor({ state: 'visible' }); await sleep(400)
  },
  read: async () => '',
  async finish(w, st) {
    await closeLayer(w); await sleep(500)
    const t = await textOf(w.page, '[data-testid="sc-month"]')
    return { ok: t.includes(String(st.year)) && await w.page.locator('[data-testid="mjump-years"]').count() === 0, detail: `chooser closed, page shows "${t.trim()}" (wheel left year ${st.year}, month ${st.month})`, pic: '[data-testid="sanscal"]' }
  } })
// 5. an input's own window (inpEd)
S.push({ n: 5, name: 'input-window', label: "An input's own window: inline calendar (inpEdCal)", prefix: 'inpEdCal', hosts: ['[data-testid="win-inputedit"]'],
  async open(w) {
    await go(w.page, 'inputs')
    await press(w, '#inListBtn'); await sleep(400)
    await press(w, '#inNew'); await w.page.locator('[data-testid="win-inputedit"]').waitFor({ state: 'visible' }); await sleep(500)
    this.v0 = await w.page.locator('#inpEdCal').evaluate(e => e.outerHTML.length) // placeholder
    await openWheels(w, 'inpEdCal')
  },
  read: async w => (await w.page.locator('[data-testid="win-inputedit"] [data-iso].on, [data-testid="win-inputedit"] [data-iso][aria-pressed="true"]').count()) + '|' + await w.page.locator('#inpEditSave').count(),
  async finish(w) {
    await press(w, '[data-testid="inpEdCal-title"]'); await w.page.locator('[data-testid="inpEdCal-grid"]').waitFor({ state: 'visible' })
    const days = w.page.locator('[data-testid^="inpEdCal-day-"]:not([disabled])')
    const el = days.nth(12); const id = await el.getAttribute('data-testid'); const iso = id.slice('inpEdCal-day-'.length)
    if (w.touch) await el.tap(); else await el.click()
    await sleep(400)
    const foot = await w.page.locator('[data-testid="inpEdCal-foot"]').innerText().catch(() => '(no foot)')
    return { ok: true, detail: `pressed ${iso}; the calendar's foot says "${foot.replace(/\s+/g, ' ')}"`, pic: '[data-testid="win-inputedit"]' }
  } })
// 6. Inputs List date filter
S.push({ n: 6, name: 'list-filter', label: "Inputs List's date filter (inRangeCal)", prefix: 'inRangeCal', hosts: ['#inRangeCal'],
  async open(w) {
    await go(w.page, 'inputs')
    await press(w, '#inListBtn'); await sleep(400)
    await press(w, '#inRangeBtn'); await w.page.locator('#inRangeCal').waitFor({ state: 'visible' }); await sleep(400)
    await openWheels(w, 'inRangeCal')
  },
  read: async w => await w.page.locator('#inRangeBtn').innerText(),
  async finish(w) {
    await press(w, '[data-testid="inRangeCal-title"]'); await w.page.locator('[data-testid="inRangeCal-grid"]').waitFor({ state: 'visible' })
    const days = w.page.locator('[data-testid^="inRangeCal-day-"]:not([disabled])')
    const a = await days.nth(8).getAttribute('data-testid'), b = await days.nth(11).getAttribute('data-testid')
    await press(w, `[data-testid="${a}"]`); await press(w, `[data-testid="${b}"]`); await sleep(500)
    const btn = (await w.page.locator('#inRangeBtn').innerText()).replace(/\s+/g, ' ')
    return { ok: /\d/.test(btn), detail: `range pressed ${a.slice(-10)} to ${b.slice(-10)}; the filter button reads "${btn}"`, pic: '#inRangeBtn' }
  } })
// 7. OIL question "Only some days"
S.push({ n: 7, name: 'oil-someday', label: 'OIL question > "Only some days..." (oilcal)', restore: true, prefix: 'oilcal', hosts: ['[data-testid="oilconf"] .airpop-box'],
  async open(w) {
    const { page } = w
    const FRI = '2026-07-17'
    await go(page, 'inputs')
    if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(w, '#inCalBtn')
    await page.locator('#inpCal').waitFor({ state: 'visible' })
    for (let i = 0; i < 36 && !(await page.locator(`[data-icday="${FRI}"]`).count()); i++) {
      const [m, y] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
      const at = +y * 12 + MONTHS.findIndex(x => x.toLowerCase().startsWith(m)), want = 2026 * 12 + 6
      await press(w, at < want ? '#icNext' : '#icPrev'); await sleep(350)
    }
    await sleep(400)
    await page.locator(`#inpCal [data-icday="${FRI}"]`).focus()
    await page.keyboard.press('Shift+ArrowRight'); await page.keyboard.press('Shift+ArrowRight'); await page.keyboard.press('Enter')
    const win = '[data-testid="win-inputedit"]'
    await page.locator(`${win} #inpEditType`).waitFor({ state: 'visible' })
    await page.selectOption(`${win} #inpEditType`, 'Duty')
    await page.fill(`${win} #inpEditOwnTitle`, 'Range weekend')
    await press(w, '#inpEditSave')
    await page.locator('[data-testid="oilconf"]').waitFor({ state: 'visible' })
    await press(w, '[data-testid="oil-some"]')
    await page.locator('[data-testid="oilcal"]').waitFor({ state: 'visible' }); await sleep(500)
    await openWheels(w, 'oilcal')
  },
  read: async w => await w.page.locator('[data-testid="oilconf"]').count() + '|' + await w.page.locator('[data-testid="oilcal"]').getAttribute('data-month'),
  noReadCompare: true,
  async finish(w) {
    await press(w, '[data-testid="oilcal-title"]'); await sleep(500)
    const en = w.page.locator('[data-testid^="oilcal-day-"]:not([disabled])')
    const n = await en.count()
    if (!n) return { ok: false, detail: 'after the wheels closed no weekend day of the question can be pressed (month ' + await w.page.locator('[data-testid="oilcal"]').getAttribute('data-month') + ')', pic: '[data-testid="oilconf"] .airpop-box' }
    return { ok: true, detail: `closed the wheels; the calendar's month is ${await w.page.locator('[data-testid="oilcal"]').getAttribute('data-month')}; ${n} pressable day(s) on show (the wheels moved the month away from the question's July 2026 days; going back to July is by Today or by the wheels)`, pic: '[data-testid="oilconf"] .airpop-box' }
  } })
// 8. Edit Schedule Jump to a date
S.push({ n: 8, name: 'jump-date', label: 'Edit Schedule > Jump to a date (wcal)', prefix: 'wcal', hosts: ['#weekCal'],
  async open(w) {
    await go(w.page, 'editsched')
    await w.page.evaluate(() => window.openScheduler(2)); await w.page.waitForSelector('#sbCal'); await sleep(500)
    this.week0 = await w.page.evaluate(() => window.CURWEEK)
    await press(w, '#sbCal'); await w.page.locator('#weekCal [data-testid="wcal-grid"]').waitFor({ state: 'visible' }); await sleep(500)
    await openWheels(w, 'wcal')
  },
  read: async w => await w.page.evaluate(() => window.CURWEEK),
  async finish(w) {
    await press(w, '[data-testid="wcal-title"]'); await w.page.locator('[data-testid="wcal-grid"]').waitFor({ state: 'visible' })
    const days = w.page.locator('[data-testid^="wcal-day-"]:not([disabled])')
    const el = days.nth(18); const id = await el.getAttribute('data-testid')
    if (w.touch) await el.tap(); else await el.click()
    await sleep(900)
    const wk = await w.page.evaluate(() => window.CURWEEK)
    return { ok: wk !== this.week0, detail: `pressed ${id.slice(-10)}; the week went from ${this.week0} to ${wk}`, pic: '#sbBar, .sb-title, #sbCal' }
  } })
// 9. Every Thursday From
async function openCalWindow(w) {
  await go(w.page, 'inputs')
  await press(w, '#inGear'); await press(w, '[data-testid="iset-days"]')
  await w.page.locator('[data-testid="win-days"]').waitFor({ state: 'visible' })
  const x = w.page.locator('[data-testid="win-inputsset-x"]')
  if (await x.count()) await x.evaluate(e => e.click())
  await sleep(400)
}
S.push({ n: 9, name: 'every-from', label: 'Inputs settings > Calendar window > "Every Thursday" From (every-from)', prefix: 'dcal', hosts: ['[data-testid="dcal-card"]', '[data-testid="win-every"]', '[data-testid="win-days"]'],
  async open(w) {
    await openCalWindow(w)
    await press(w, '[data-testid="days-wd-3"]'); await w.page.locator('[data-testid="win-every"]').waitFor({ state: 'visible' }); await sleep(400)
    this.v0 = await boxVal(w.page, '[data-testid="every-from"]')
    await press(w, '[data-testid="every-from"]'); await dcalOpen(w); await openWheels(w, 'dcal')
  },
  read: async w => (await boxVal(w.page, '[data-testid="every-from"]')) + '|' + await w.page.locator('[data-testid="win-every"]').count(),
  async finish(w) {
    await press(w, '[data-testid="dcal-title"]'); await w.page.locator('[data-testid="dcal-grid"]').waitFor({ state: 'visible' })
    const iso = await pickOnDcal(w, 'dcal'); await sleep(500)
    const v = await boxVal(w.page, '[data-testid="every-from"]')
    return { ok: v === iso && await w.page.locator('[data-testid="win-every"]').count() === 1, detail: `picked ${iso}, From box shows ${v} (was ${this.v0}); Every window still up=${await w.page.locator('[data-testid="win-every"]').count()}`, pic: '[data-testid="win-every"]' }
  } })
// 10. Holidays list calendar
S.push({ n: 10, name: 'holidays', label: 'Inputs settings > Holidays > Add a holiday calendar (holcal)', prefix: 'holcal', hosts: ['[data-testid="win-holiday"]', '[data-testid="win-days"]'],
  async open(w) {
    await openCalWindow(w)
    if (await w.page.locator('[data-testid="days-tab-holidays"]').count()) await press(w, '[data-testid="days-tab-holidays"]')
    await w.page.locator('[data-testid="days-part-holidays"]').waitFor({ state: 'visible' }); await sleep(400)
    await press(w, '[data-testid="hol-add"]'); await w.page.locator('[data-testid="win-holiday"]').waitFor({ state: 'visible' }); await sleep(500)
    await openWheels(w, 'holcal')
  },
  read: async w => (await w.page.locator('[data-testid="holcal-selection"]').innerText()) + '|' + await w.page.locator('[data-testid="win-holiday"]').count(),
  async finish(w) {
    await press(w, '[data-testid="holcal-title"]'); await w.page.locator('[data-testid="holcal-grid"]').waitFor({ state: 'visible' })
    const days = w.page.locator('[data-testid^="holcal-day-"]:not([disabled])')
    const a = days.nth(9); const id = await a.getAttribute('data-testid')
    if (w.touch) await a.tap(); else await a.click()
    await sleep(400)
    const sel = (await w.page.locator('[data-testid="holcal-selection"]').innerText()).replace(/\s+/g, ' ')
    return { ok: !/Pick a start/.test(sel), detail: `pressed ${id.slice(-10)}; selection line reads "${sel}"`, pic: '[data-testid="win-holiday"]' }
  } })
// 11. Leave War
async function lwOpen(w) {
  const { page } = w
  await go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-slipway"]', { timeout: 20000 })
  await page.evaluate(() => { window.lwSetViewer(null); window.raptorRole('admin'); window.lwSetRole('admin') }); await sleep(300)
}
S.push({ n: 11, name: 'lw-opendates', label: 'Leave War > open-bidding dates sheet calendar (od-range)', restore: true, prefix: 'od-range', hosts: ['[data-testid="open-dates"]', '[data-testid="od-range-picker"]'],
  async open(w) {
    const { page } = w
    await lwOpen(w)
    await page.evaluate(() => {
      const days = []
      for (let t = Date.UTC(2026, 0, 1); t <= Date.UTC(2026, 11, 31); t += 86_400_000) days.push({ date: new Date(t).toISOString().slice(0, 10), events: ['', ''], blocked: false, blockedReason: '', ph: false })
      const war = { period: { id: 'y2026', name: 'JAN - DEC 26', start: '2026-01-01', end: '2026-12-31', open: [{ from: '2026-01-12', to: '2026-01-16' }], lastClosed: null, days }, recs: {} }
      if (!window.lwLoadWars([war], 'y2026')) throw new Error('lwLoadWars refused')
    })
    await sleep(600)
    await press(w, '[data-testid="open-chip"]'); await page.locator('[data-testid="open-dates"]').waitFor({ state: 'visible' }); await sleep(400)
    await press(w, '[data-testid="od-cal-2026-01-12"]'); await page.locator('[data-testid="od-range-picker"]').waitFor({ state: 'visible' }); await sleep(500)
    await openWheels(w, 'od-range')
  },
  read: async w => await w.page.locator('[data-testid="open-chip"]').innerText() + '|' + await w.page.locator('[data-testid="open-dates"]').count(),
  async finish(w) {
    await press(w, '[data-testid="od-range-title"]'); await w.page.locator('[data-testid="od-range-grid"]').waitFor({ state: 'visible' })
    const days = w.page.locator('[data-testid^="od-range-day-"]:not([disabled])')
    const a = days.nth(9); const id = await a.getAttribute('data-testid')
    if (w.touch) await a.tap(); else await a.click()
    await sleep(400)
    return { ok: await w.page.locator('[data-testid="open-dates"]').count() === 1, detail: `pressed ${id.slice(-10)} on the open-dates calendar; the sheet still open=${await w.page.locator('[data-testid="open-dates"]').count()}`, pic: '[data-testid="open-dates"]' }
  } })
async function lwSheet(w, item, dateTid) {
  const { page } = w
  await lwOpen(w)
  const clickIt = async sel => { const l = page.locator(sel); if (w.touch) await l.tap(); else await l.click() }
  await clickIt('[data-testid="month-JUL"]'); await sleep(900)
  await page.locator('[data-testid="head-2026-07-01"]').waitFor({ timeout: 8000 }); await sleep(700)
  const cell = page.locator('[data-testid="cell-slipway-2026-07-14"]')
  await cell.scrollIntoViewIfNeeded(); await clickIt('[data-testid="cell-slipway-2026-07-14"]')
  await page.locator('[data-testid="bid-picker"]').waitFor({ state: 'visible', timeout: 8000 })
  await clickIt('[data-testid="bid-more"]'); await clickIt(`[data-testid="${item}"]`)
  await page.locator(`[data-testid="${dateTid}"]`).waitFor({ state: 'visible' }); await sleep(500)
  await press(w, `[data-testid="${dateTid}"]`); await dcalOpen(w); await openWheels(w, 'dcal')
}
for (const [n, item, tidd] of [[11.1, 'bid-postin', 'pi-date'], [11.2, 'bid-postout', 'po-date']]) {
  S.push({ n, name: 'lw-' + tidd, label: `Leave War > one-day sheet > ${tidd}`, prefix: 'dcal', hosts: ['[data-testid="bid-picker"]', '[data-testid="dcal-card"]'],
    async open(w) { await lwSheet(w, item, tidd); this.v0 = await boxVal(w.page, `[data-testid="${tidd}"]`) },
    read: async w => (await boxVal(w.page, `[data-testid="${tidd}"]`)) + '|' + await w.page.locator('[data-testid="bid-picker"]').count(),
    async finish(w) {
      await press(w, '[data-testid="dcal-title"]'); await w.page.locator('[data-testid="dcal-grid"]').waitFor({ state: 'visible' })
      const iso = await pickOnDcal(w, 'dcal'); await sleep(500)
      const v = await boxVal(w.page, `[data-testid="${tidd}"]`)
      return { ok: v === iso && await w.page.locator('[data-testid="bid-picker"]').count() === 1, detail: `picked ${iso}, box shows ${v} (was ${this.v0}); sheet still open=${await w.page.locator('[data-testid="bid-picker"]').count()}`, pic: '[data-testid="bid-picker"]' }
    } })
}
// 12. Medical upchit
S.push({ n: 12, name: 'upchit', label: "Medical page > an input's window > upchit date (inpEditUpDate)", prefix: 'dcal', hosts: ['[data-testid="dcal-card"]', '[data-testid="win-inputedit"]'],
  async open(w) {
    const { page } = w
    await go(page, 'inputs'); await press(w, '#inMedBtn'); await sleep(500)
    await page.locator('.medsec.med-pend .medcard').first().scrollIntoViewIfNeeded()
    await press(w, '.medsec.med-pend .medcard'); await page.waitForSelector('#docViewPop:not([hidden])')
    await press(w, '#docViewUpchit'); await page.locator('[data-testid="win-inputedit"]').waitFor({ state: 'visible' }); await sleep(500)
    this.v0 = await boxVal(page, '#inpEditUpDate')
    await press(w, '#inpEditUpDate'); await dcalOpen(w); await openWheels(w, 'dcal')
  },
  read: async w => (await boxVal(w.page, '#inpEditUpDate')) + '|' + await w.page.locator('[data-testid="win-inputedit"]').count(),
  async finish(w) {
    await press(w, '[data-testid="dcal-title"]'); await w.page.locator('[data-testid="dcal-grid"]').waitFor({ state: 'visible' })
    const iso = await pickOnDcal(w, 'dcal'); await sleep(500)
    const v = await boxVal(w.page, '#inpEditUpDate')
    return { ok: v === iso && await w.page.locator('[data-testid="win-inputedit"]').count() === 1, detail: `picked ${iso}, upchit box shows ${v} (was ${this.v0}); input window still up=${await w.page.locator('[data-testid="win-inputedit"]').count()}`, pic: '[data-testid="win-inputedit"]' }
  } })

// ---------------------------------------------------------------------------- the suite
async function tagScope(w, s) {
  const sel = s.mj ? '[data-testid="mjump-years"]' : `[data-testid="${s.prefix}-lists"]`
  await w.page.evaluate(([sel, mj]) => {
    document.querySelectorAll('[data-walk]').forEach(e => e.removeAttribute('data-walk'))
    const e = document.querySelector(sel)
    const t = e.closest('[data-testid="dcal-card"]') || e.closest('.dcal') || (mj ? e.parentElement.parentElement : e.parentElement)
    t.setAttribute('data-walk', '1')
  }, [sel, !!s.mj])
}
async function shot(w, s, step, wd, selOverride) {
  const file = `${pad(Math.floor(s.n))}${s.n % 1 ? String.fromCharCode(96 + Math.round((s.n % 1) * 10)) : ''}-${s.name}-${step}-${wd}.png`
  const loc = selOverride ? w.page.locator(selOverride).first() : w.page.locator('[data-walk="1"]').first()
  try { await loc.scrollIntoViewIfNeeded().catch(() => {}); await loc.screenshot({ path: path.join(OUT, file) }) } catch (e) { return file + ' (picture failed: ' + String(e).slice(0, 80) + ')' }
  return file
}
const hostRects = async (w, s) => { const o = []; for (const h of s.hosts) o.push(await rect(w.page, h).catch(() => null)); return o }
const hostsSame = (a, b) => a.every((x, i) => x && b[i] && near(x, b[i]))
const hostStr = a => a.map(x => x ? `[${x.l},${x.t},${x.w}x${x.h}]` : 'gone').join(' ')

async function stateOf(w, s) {
  if (s.mj) { const t = await textOf(w.page, s.titleSel); return { year: yearIn(t), month: monthIn(t), text: t.trim() } }
  const t = await textOf(w.page, `[data-testid="${s.prefix}-title"]`); return { year: yearIn(t), month: monthIn(t), text: t.trim() }
}
const sels = s => s.mj ? { Y: '[data-testid="mjump-years"]', M: '[data-testid="mjump-months"]', open: '[data-testid="mjump-years"]' } : { Y: `[data-testid="${s.prefix}-years"]`, M: `[data-testid="${s.prefix}-months"]`, open: `[data-testid="${s.prefix}-lists"]` }
const isOpen = async (w, s) => (await w.page.locator(sels(s).open).count()) > 0 && await w.page.locator(sels(s).open).first().isVisible()

async function restoreMonth(w, s, st0) {
  const { page } = w; const { Y, M } = sels(s)
  let st = await stateOf(w, s)
  const yr = await rect(page, Y); await page.mouse.move(yr.l + yr.w / 2, yr.t + yr.h / 2)
  await page.mouse.wheel(0, (st0.year - st.year) * 44); await sleep(300); await atRest(page, Y)
  st = await stateOf(w, s)
  const mr = await rect(page, M); await page.mouse.move(mr.l + mr.w / 2, mr.t + mr.h / 2)
  await page.mouse.wheel(0, (MONTHS.indexOf(st0.month) - MONTHS.indexOf(st.month)) * 44); await sleep(300); await atRest(page, M)
  st = await stateOf(w, s)
  console.log('  restored to', st.text)
}
async function deskSuite(w, s) {
  const wd = 'desk', { page } = w
  const { Y, M } = sels(s)
  await tagScope(w, s)
  const st0 = await stateOf(w, s)
  let hosts0 = await hostRects(w, s)
  const val0 = await s.read(w)
  const vw = page.viewportSize().width
  console.log(`  opened: ${st0.text}; hosts ${hostStr(hosts0)}; value0 ${val0}`)
  const stepRec = async (step, cond, detail, pic) => rec(s.n, s.name, step, wd, cond ? 'PASS' : 'FAIL', detail, pic)
  const tail = async () => { const rr = await hostRects(w, s); const v = await s.read(w); return { same: hostsSame(hosts0, rr), rr, v } }
  // A
  let y0 = st0.year
  await mouseDrag(page, Y, -132, 12, 250)
  let rs = await atRest(page, Y); let st = await stateOf(w, s); let t = await tail()
  let pic = await shot(w, s, 'A-year-drag', wd)
  await stepRec('A years drag up 132px', st.year === y0 + 3 && rs.whole && rs.settled && await isOpen(w, s) && t.same && (s.noReadCompare || t.v === val0),
    `year ${y0} -> ${st.year} (want ${y0 + 3}); scrollTop ${rs.top} (whole row ${rs.whole}); open ${await isOpen(w, s)}; hosts ${t.same ? 'unchanged' : 'MOVED ' + hostStr(t.rr) + ' was ' + hostStr(hosts0)}; value ${val0} -> ${t.v}`, pic)
  // B
  let m0 = st.month
  await mouseDrag(page, M, 88, 10, 250)
  rs = await atRest(page, M); st = await stateOf(w, s); t = await tail()
  pic = await shot(w, s, 'B-month-drag', wd)
  const wantM = MONTHS[(MONTHS.indexOf(m0) + 10) % 12]
  await stepRec('B months drag down 88px', st.month === wantM && rs.whole && await isOpen(w, s) && t.same && (s.noReadCompare || t.v === val0),
    `month ${m0} -> ${st.month} (want ${wantM}); scrollTop ${rs.top} (whole ${rs.whole}); open ${await isOpen(w, s)}; hosts ${t.same ? 'unchanged' : 'MOVED'}; value ${t.v}`, pic)
  // C
  let y1 = st.year
  await mouseDrag(page, Y, -88, 3, 0)
  rs = await atRest(page, Y); st = await stateOf(w, s); t = await tail()
  pic = await shot(w, s, 'C-flick', wd)
  await stepRec('C quick flick up 88px', st.year > y1 + 2 && rs.whole && await isOpen(w, s) && t.same,
    `year ${y1} -> ${st.year} (want > ${y1 + 2}); scrollTop ${rs.top} (whole ${rs.whole}); open ${await isOpen(w, s)}; hosts ${t.same ? 'unchanged' : 'MOVED'}`, pic)
  // D
  let y2 = st.year
  const hs = hosts0.filter(Boolean)
  const maxR = Math.max(...hs.map(h => h.r)), minL = Math.min(...hs.map(h => h.l))
  const upX = maxR + 40 < vw - 4 ? maxR + 40 : Math.max(4, minL - 40)
  await mouseDrag(page, Y, -44, 6, 250, upX)
  const under = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.getAttribute('data-testid') || e.className || e.tagName) : null }, [upX, (await rect(page, Y)).t + (await rect(page, Y)).h / 2 - 44])
  rs = await atRest(page, Y); st = await stateOf(w, s); t = await tail()
  pic = await shot(w, s, 'D-drag-off-card', wd)
  await stepRec('D drag up 44px, release sideways off the card at x=' + Math.round(upX), st.year === y2 + 1 && rs.whole && await isOpen(w, s) && t.same && (s.noReadCompare || t.v === val0),
    `year ${y2} -> ${st.year} (want ${y2 + 1}); released over "${under}"; open ${await isOpen(w, s)}; scrollTop ${rs.top} (whole ${rs.whole}); hosts ${t.same ? 'unchanged' : 'MOVED'}; value ${t.v}`, pic)
  // E
  let y3 = st.year
  const yr = await rect(page, Y)
  const bandMid = yr.t + yr.h / 2
  await page.mouse.click(yr.l + yr.w / 2, bandMid + 44)
  rs = await atRest(page, Y); st = await stateOf(w, s); t = await tail()
  pic = await shot(w, s, 'E-click-row', wd)
  await stepRec('E plain click on the row below the band', st.year === y3 + 1 && await isOpen(w, s) && t.same,
    `year ${y3} -> ${st.year} (want ${y3 + 1}); open ${await isOpen(w, s)}; hosts ${t.same ? 'unchanged' : 'MOVED'}`, pic)
  // F
  let y4 = st.year
  await page.mouse.move(yr.l + yr.w / 2, bandMid); await page.mouse.wheel(0, 132)
  await sleep(300); rs = await atRest(page, Y); st = await stateOf(w, s)
  await stepRec('F mouse scroll wheel 132', st.year !== y4 && rs.whole && await isOpen(w, s), `year ${y4} -> ${st.year}; scrollTop ${rs.top} (whole ${rs.whole})`, '')
  // G
  if (s.restore) await restoreMonth(w, s, st0)
  const fin = await s.finish(w, st)
  pic = await shot(w, s, 'G-result', wd, fin.pic)
  await stepRec('G close wheels and finish as a person would', fin.ok, fin.detail, pic)
}

async function phoneSuite(w, s) {
  const wd = 'phone', { page } = w
  const { Y } = sels(s)
  const cdp = await w.context.newCDPSession(page)
  await tagScope(w, s)
  const st0 = await stateOf(w, s)
  const hosts0 = await hostRects(w, s)
  const val0 = await s.read(w)
  console.log(`  opened: ${st0.text}; hosts ${hostStr(hosts0)}`)
  const r = await rect(page, Y)
  const x = r.l + r.w / 2, y = r.t + r.h / 2 + 40
  await fingerSwipe(cdp, x, y, -100, 8, 150)
  const picQuick = await shot(w, s, 'H-finger-100ms', wd)
  const rs = await atRest(page, Y)
  const st = await stateOf(w, s); const rr = await hostRects(w, s); const v = await s.read(w)
  const picSettled = await shot(w, s, 'H-finger-settled', wd)
  rec(s.n, s.name, 'H finger up 100px (CDP touch)', wd, st.year > st0.year && rs.whole && await isOpen(w, s) && hostsSame(hosts0, rr) && (s.noReadCompare || v === val0) ? 'PASS' : 'FAIL',
    `year ${st0.year} -> ${st.year}; scrollTop ${rs.top} (whole ${rs.whole}, settled ${rs.settled}); open ${await isOpen(w, s)}; hosts ${hostsSame(hosts0, rr) ? 'unchanged' : 'MOVED ' + hostStr(rr) + ' was ' + hostStr(hosts0)}; value ${val0} -> ${v}`, picQuick + ' / ' + picSettled)
  if (s.restore) await restoreMonth(w, s, st0)
  const fin = await s.finish(w, st)
  const pic = await shot(w, s, 'G-result', wd, fin.pic)
  rec(s.n, s.name, 'G close wheels and finish', wd, fin.ok ? 'PASS' : 'FAIL', fin.detail, pic)
}

const t0 = Date.now()
const browser = await launch()
for (const wd of worlds) {
  for (const s of S) {
    if (only && !only.includes(Math.floor(s.n)) && !only.includes(s.n)) continue
    console.log(`\n== ${s.n} ${s.label} [${wd}]`)
    const w = await world(browser, wd)
    try {
      try { await s.open(w) } catch (e) { rec(s.n, s.name, 'open', wd, 'NOT REACHED', s.label + ': ' + String(e).split('\n')[0].slice(0, 220)); await page_dump(w, s, wd); continue }
      if (wd === 'desk') await deskSuite(w, s); else await phoneSuite(w, s)
    } catch (e) { rec(s.n, s.name, 'script', wd, 'SCRIPT-ERR', String(e).split('\n').slice(0, 3).join(' | ').slice(0, 300)); await page_dump(w, s, wd) }
    if (w.errs.length) rec(s.n, s.name, 'console/page errors', wd, 'FAIL', w.errs.slice(0, 5).join(' || ').slice(0, 400))
    await w.context.close()
  }
}
async function page_dump(w, s, wd) { try { await w.page.screenshot({ path: path.join(OUT, `err-${s.n}-${s.name}-${wd}.png`) }) } catch {} }
await browser.close()
const secs = Math.round((Date.now() - t0) / 1000)
const counts = rows.reduce((a, r) => (a[r.status] = (a[r.status] || 0) + 1, a), {})
console.log('\nCOUNTS', JSON.stringify(counts), 'seconds', secs)
writeFileSync(path.join(HERE, (process.env.OUT || 'pics') + '-rows.json'), JSON.stringify({ rows, counts, secs }, null, 1))
