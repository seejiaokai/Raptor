/* WALKER G — X-05: a holiday change retags the calendars at once but respects a published day's OIL */
import * as G from './cal-G-lib.mjs'
const { L, W, sleep } = G
G.setTag('x05')
const { browser, ctx, p, errors } = await G.world({ who: 'a' })
const tid = id => p.locator(`[data-testid="${id}"]`)
const HM = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const fmt = o => Object.entries(o).map(([k, v]) => `${k}: cell="${v.cell}" bal=${v.bal}`).join(' | ')

/* ---- who works on Wed 15 (day 2) and Thu 16 (day 3) of the week of 13 Jul ---- */
const crew = di => p.evaluate(d => {
  const x = window.DAYS[d], P = window.PEOPLE, out = new Set()
  for (const w of x.waves || []) for (const f of w.formations || []) for (const a of f.aircraft || []) { if (a.p && P[a.p]) out.add(a.p); if (a.w && P[a.w]) out.add(a.w) }
  return [...out]
}, di)
const crew2 = await crew(2), crew3 = await crew(3)
console.log('crew Wed', crew2.join(','), '| crew Thu', crew3.join(','))
const WORK_W = crew2.slice(0, 2), WORK_T = crew3.slice(0, 2)   // two men on a flying line each day
const NAMES = ids => p.evaluate(i => i.map(x => window.PEOPLE[x].cs), ids)
console.log('Wed workers', JSON.stringify(await NAMES(WORK_W)), 'Thu workers', JSON.stringify(await NAMES(WORK_T)))

/* ---- the calendar window, the holiday form ---- */
const FRONT = []
async function openCalendar() {
  if ((await p.evaluate(() => window.CURPAGE)) !== 'inputs') { await L.go(p, 'inputs') }
  if (await p.locator('#inMemberMode').count()) { await p.locator('#inMemberMode').click(); await sleep(400) }
  if (await tid('win-days').count()) { await p.keyboard.press('Escape'); await sleep(300) }
  if (!(await tid('win-inputsset').count())) { await tid('in-gear').click(); await tid('win-inputsset').waitFor(); await sleep(250) }
  await tid('iset-days').click(); await tid('win-days').waitFor(); await sleep(400)
  const hit = await p.evaluate(() => {
    const w = document.querySelector('[data-testid="win-days"]'), t = document.querySelector('[data-testid="days-tab-holidays"]') || document.querySelector('[data-testid="days-prev"]')
    const r = t.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { calendarInFront: !!e && w.contains(e), topmost: e && ((e.closest('[role=dialog]') || {}).ariaLabel) }
  })
  console.log('CALENDAR window front check at its first control:', JSON.stringify(hit)); FRONT.push(hit)
  if (!hit.calendarInFront) { await G.shot(p, 'calendar-behind-settings'); await tid('win-inputsset-x').click().catch(() => {}); await sleep(300) }
  if (await tid('days-tabs').count()) { await tid('days-tab-holidays').click(); await sleep(300) }
}
async function closeWindows() { for (const w of ['win-holiday', 'win-days', 'win-inputsset']) { if (await tid(w).count()) { await tid(w + '-x').click({ timeout: 3000 }).catch(() => {}); await sleep(250) } } for (let i = 0; i < 2; i++) { await p.keyboard.press('Escape'); await sleep(150) } }
async function holTap(iso) {
  const at = async () => { const [m, y] = (await tid('holcal-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + HM.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) { await tid('holcal-next-month').click(); await sleep(80) }
  for (; d < 0; d++) { await tid('holcal-prev-month').click(); await sleep(80) }
  await tid(`holcal-day-${iso}`).click(); await sleep(150)
}
async function holAdd({ kind, name, short, iso }) {
  await tid('hol-add').click(); await tid('win-holiday').waitFor(); await sleep(250)
  await tid(`hol-kind-${kind}`).click()
  await tid('hol-name').fill(name); await tid('hol-short').fill(short)
  await holTap(iso)
  const f = await G.shot(p, `hol-form-${kind}`)
  await tid('hol-save').click(); await sleep(800)
  return f
}
/* read the same date on every place the app draws it */
async function tags(iso) {
  const out = {}
  // 1. the Calendar window's own month (if the window is up)
  out.calwin = await tid(`days-tag-${iso}`).count() ? (await tid(`days-tag-${iso}`).first().innerText()) : '(window not up)'
  // 2. Inputs month
  await closeWindows(); await L.go(p, 'inputs'); if (await p.locator('#inMemberMode').count()) { await p.locator('#inMemberMode').click(); await sleep(400) }; await G.toInputsCal(p); await G.monthTo(p, 2026, 6)
  const ib = tid(`ib-tag-${iso}`)
  out.inputs = await ib.count() ? await ib.first().evaluate(e => ({ text: e.innerText.trim(), cls: e.className, bg: getComputedStyle(e).backgroundColor, col: getComputedStyle(e).color })) : 'NO TAG'
  out.inputsCell = await p.locator(`[data-icday="${iso}"]`).first().evaluate(e => ({ cls: e.className, bg: getComputedStyle(e).backgroundColor }))
  out.f_inputs = await G.shot(p, `tags-inputs-${iso}`)
  // 3. SANS month
  await p.locator('#inSansMode').click(); await sleep(500)
  const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  for (let i = 0; i < 24; i++) {
    const m = (await tid('sc-month').getAttribute('aria-label')).toLowerCase().split(/\s+/)
    const cur = +m[1] * 12 + MON.indexOf(m[0]), want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
    if (cur === want) break
    await tid(cur < want ? 'sc-next' : 'sc-prev').click(); await sleep(150)
  }
  const sc = tid(`sc-tag-${iso}`)
  out.sans = await sc.count() ? await sc.first().evaluate(e => ({ text: e.innerText.trim(), cls: e.className, bg: getComputedStyle(e).backgroundColor, col: getComputedStyle(e).color })) : 'NO TAG'
  out.f_sans = await G.shot(p, `tags-sans-${iso}`)
  // 4. Leave War event row + column tint
  await L.go(p, 'leavewar'); await sleep(1200)
  const mon = new Date(iso + 'T12:00:00').toLocaleString('en', { month: 'short' }).toUpperCase()
  if (await tid(`month-${mon}`).count()) { await tid(`month-${mon}`).first().click(); await sleep(1200) }
  const ev = tid(`event-0-${iso}`)
  out.lw = await ev.count() ? await ev.first().evaluate(e => ({ text: e.innerText.trim(), title: e.getAttribute('title'), cls: e.className, bg: getComputedStyle(e).backgroundColor })) : 'NO EVENT CELL'
  out.lwCol = await p.evaluate(d => { const c = document.querySelector(`[data-testid^="cell-"][data-testid$="-${d}"]`); return c ? { cls: c.className.slice(0, 80), bg: getComputedStyle(c).backgroundColor } : 'no person cell' }, iso)
  out.f_lw = await G.shot(p, `tags-leavewar-${iso}`)
  return out
}
const tg = t => `calwin=${JSON.stringify(t.calwin)} | inputs=${JSON.stringify(t.inputs && t.inputs.text)} (${t.inputs && t.inputs.cls}) | sans=${JSON.stringify(t.sans && t.sans.text)} (${t.sans && t.sans.cls}) | leavewar event="${t.lw && t.lw.text}" title="${t.lw && t.lw.title}"`
const headOf = async di => { await L.go(p, 'editsched'); await W.showDay(p, di); return W.head(p, di) }

/* ---- setup: publish Wed 15 (day 2) and Thu 16 (day 3), four sign-offs each ---- */
await L.go(p, 'editsched'); await W.showDay(p, 2)
await W.signDay(p, 2); await W.publishDay(p, 2); await sleep(500)
await W.showDay(p, 3)
await W.signDay(p, 3); await W.publishDay(p, 3); await sleep(500)
const hW0 = await headOf(2); const hT0 = await headOf(3)
const fW0 = await G.shot(p, 'wed-published-no-ph')
console.log('Wed published', JSON.stringify(hW0), '| Thu published', JSON.stringify(hT0))
const oilW0 = await G.lwOil(p, WORK_W, '2026-07-15'); await G.shot(p, 'oil-wed-before'); await G.closeOilTracker(p)
const oilT0 = await G.lwOil(p, WORK_T, '2026-07-16'); await G.closeOilTracker(p)
console.log('OIL Wed before', fmt(oilW0), '| OIL Thu before', fmt(oilT0))
const tag0 = await tags('2026-07-15')
console.log('TAGS Wed 15 before PH:', tg(tag0))

/* ---- add a PH on Wed 15 through Calendar ---- */
await openCalendar()
const fHolForm = await holAdd({ kind: 'ph', name: 'National Day', short: 'ND', iso: '2026-07-15' })
const fHolList = await G.shot(p, 'hol-list-after-add')
const listText = await tid('days-part-holidays').innerText().catch(() => '(no list)')
console.log('Holidays list:', listText.replace(/\s+/g, ' ').slice(0, 400))
const tag1 = await tags('2026-07-15')
console.log('TAGS Wed 15 with PH:', tg(tag1))
const hW1 = await headOf(2); const fW1 = await G.shot(p, 'wed-after-ph-head')
console.log('Wed after PH', JSON.stringify(hW1))
const oilW1 = await G.lwOil(p, WORK_W, '2026-07-15'); const fo1 = await G.shot(p, 'oil-wed-after-ph-before-reissue'); await G.closeOilTracker(p)
console.log('OIL Wed after PH, before reissue', fmt(oilW1))
// the day says a reissue is due
await L.go(p, 'editsched'); await W.showDay(p, 2)
const chgW = await G.readChanges(p, 2, 'wed-ph')
console.log('Wed changes', JSON.stringify({ tabs: chgW.tabs, out: chgW.TogooutAL || chgW.Togoout }))
// reissue
await W.signDay(p, 2); const pubW = await W.publishAL(p, 2); await sleep(800)
const hW2 = await W.head(p, 2); const fW2 = await G.shot(p, 'wed-after-AL-with-ph')
console.log('Wed AL', JSON.stringify(pubW), JSON.stringify(hW2))
const oilW2 = await G.lwOil(p, WORK_W, '2026-07-15'); const fo2 = await G.shot(p, 'oil-wed-after-AL'); await G.closeOilTracker(p)
const fo2g = await G.shot(p, 'oil-wed-after-AL-grid')
console.log('OIL Wed after reissue with PH', fmt(oilW2))

/* ---- remove the PH ---- */
await openCalendar()
await p.locator('.hol-line[data-from="2026-07-15"]').first().click(); await tid('win-holiday').waitFor(); await sleep(300)
await G.shot(p, 'hol-change-form')
await tid('hol-delete').click(); await sleep(800)
const tag2 = await tags('2026-07-15')
console.log('TAGS Wed 15 PH removed:', tg(tag2))
const hW3 = await headOf(2); const fW3 = await G.shot(p, 'wed-after-ph-removed-head')
console.log('Wed after PH removed', JSON.stringify(hW3))
const oilW3 = await G.lwOil(p, WORK_W, '2026-07-15'); const fo3 = await G.shot(p, 'oil-wed-ph-removed-before-reissue'); await G.closeOilTracker(p)
console.log('OIL Wed PH removed, before reissue', fmt(oilW3))
await L.go(p, 'editsched'); await W.showDay(p, 2)
await W.signDay(p, 2); const pubW2 = await W.publishAL(p, 2); await sleep(800)
const hW4 = await W.head(p, 2)
const oilW4 = await G.lwOil(p, WORK_W, '2026-07-15'); const fo4 = await G.shot(p, 'oil-wed-ph-removed-after-reissue'); await G.closeOilTracker(p)
console.log('Wed AL2', JSON.stringify(pubW2), JSON.stringify(hW4), '| OIL after reissue without PH', fmt(oilW4))
const wBal = (a, b, k) => Number(b[k].bal) - Number(a[k].bal)
const dW = Object.fromEntries(Object.keys(oilW0).map(k => [k, [wBal(oilW0, oilW1, k), wBal(oilW0, oilW2, k), wBal(oilW0, oilW3, k), wBal(oilW0, oilW4, k)]]))
console.log('Wed OIL change vs before: [after PH before reissue, after reissue, PH removed before reissue, after reissue]', JSON.stringify(dW))
G.saveRows('x05-wed')

/* ---- an Off day on Thu 16: tags, and nobody earns ---- */
await openCalendar()
const fOffForm = await holAdd({ kind: 'off', name: 'Stand Down', short: 'SD', iso: '2026-07-16' })
const tagO = await tags('2026-07-16')
console.log('TAGS Thu 16 Off day:', tg(tagO))
const hT1 = await headOf(3); const fT1 = await G.shot(p, 'thu-after-off-head')
console.log('Thu after Off day', JSON.stringify(hT1))
await L.go(p, 'editsched'); await W.showDay(p, 3)
const chgT = await G.readChanges(p, 3, 'thu-off')
await W.signDay(p, 3)
let pubT = null, hT2 = hT1
if (/pending/.test(hT1.pending)) { pubT = await W.publishAL(p, 3); await sleep(800); hT2 = await W.head(p, 3) }
console.log('Thu AL', JSON.stringify(pubT), JSON.stringify(hT2))
const oilT1 = await G.lwOil(p, WORK_T, '2026-07-16'); const fOT = await G.shot(p, 'oil-thu-off-after'); await G.closeOilTracker(p)
console.log('OIL Thu Off day after', fmt(oilT1))
const dT = Object.fromEntries(Object.keys(oilT0).map(k => [k, Number(oilT1[k].bal) - Number(oilT0[k].bal)]))
console.log('Thu OIL change', JSON.stringify(dT))
await G.reload(p)
const tagR = await tags('2026-07-16'); console.log('TAGS Thu 16 after reload', tg(tagR))
G.saveRows('x05-raw')
console.log('errors', JSON.stringify(errors))
await browser.close()
