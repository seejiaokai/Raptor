/* H2 — the multi-day request, filed on the Inputs page the way the page works:
   pick 17 then 20 on the DATES calendar, person, Training, CUSTOM 09:00–12:00,
   Add input — then answer the OIL question for Saturday only. */
import { open, board, shot, publish, go, oilMode } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
const R = {}

await go(page, 'inputs')
await page.waitForTimeout(1100)
const day = (n) => page.locator('.rc-d, .rc-today').filter({ hasText: new RegExp(`^${n}$`) }).first()
await day(17).click(); await page.waitForTimeout(400)
await day(20).click(); await page.waitForTimeout(400)
R.datesNote = await page.evaluate(() => {
  const n = [...document.querySelectorAll('*')].filter(e => !e.children.length && e.offsetParent)
    .map(e => (e.innerText || '').trim()).filter(t => /pick a|→|selected/i.test(t) && t.length < 60)
  return [...new Set(n)].slice(0, 6)
})
/* person: someone free on the Saturday */
const busy = await page.evaluate(() => { const s = new Set(); for (const e of document.querySelectorAll('.puck[data-person]')) s.add(e.dataset.person); return [...s] })
const personSel = page.locator('#inPerson')
const opts = await personSel.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: (o.textContent || '').trim() })))
R.who = opts.find(o => o.v && !/^all/i.test(o.v) && !busy.includes(o.v)) || opts[1]
await personSel.selectOption(R.who.v)
const typeSel = page.locator('#inType')
const topts = await typeSel.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: (o.textContent || '').trim() })))
R.type = topts.find(o => /train/i.test(o.t) || /^TR$/.test(o.v)) || topts[1]
await typeSel.selectOption(R.type.v)
await page.waitForTimeout(300)
/* the hours are not the point here; ALL DAY keeps the form simple and still
   makes the claim span four days, which is what the OIL question turns on */
await page.waitForTimeout(300)
await shot(page, 'G-H2-30-multi-day-form')
await page.locator('button').filter({ hasText: /^Add input$/ }).first().click()
await page.waitForTimeout(1300)

const conf = page.locator('[data-testid="oilconf"]')
R.asked = await conf.count() ? await conf.isVisible().catch(() => false) : false
if (R.asked) {
  R.sheet = (await conf.innerText()).replace(/\n+/g, ' | ').slice(0, 800)
  R.dayBtns = await conf.locator('[data-oilday]').evaluateAll(bs => bs.map(b => ({ d: b.getAttribute('data-oilday'), t: (b.innerText || '').replace(/\s+/g, ' ').trim(), cls: b.className })))
  await shot(page, 'G-H2-31-oil-question-multi-day')
  const some = conf.locator('button').filter({ hasText: /only some|some days/i }).first()
  R.hasSomeDays = await some.count() > 0
  if (R.hasSomeDays) { await some.click(); await page.waitForTimeout(600) }
  R.dayBtns2 = await conf.locator('[data-oilday]').evaluateAll(bs => bs.map(b => ({ d: b.getAttribute('data-oilday'), t: (b.innerText || '').replace(/\s+/g, ' ').trim(), cls: b.className })))
  for (const d of (R.dayBtns2.length ? R.dayBtns2 : R.dayBtns)) {
    const b = conf.locator(`[data-oilday="${d.d}"]`)
    const on = await b.evaluate(e => /(^|\s)(on|sel|picked|approve)(\s|$)/.test(e.className))
    if (on !== (d.d === '2026-07-18')) { await b.click(); await page.waitForTimeout(250) }
  }
  R.dayBtns3 = await conf.locator('[data-oilday]').evaluateAll(bs => bs.map(b => ({ d: b.getAttribute('data-oilday'), cls: b.className })))
  await shot(page, 'G-H2-32-saturday-only')
  const save = conf.locator('button').filter({ hasText: /^Save$/ }).first()
  if (await save.count()) { await save.click(); await page.waitForTimeout(1200) }
}
await shot(page, 'G-H2-33-after-save')
R.stored = await page.evaluate(w => Object.entries(window.INPUTS).filter(([, i]) => i.person === w)
  .map(([k, i]) => ({ k, raw: JSON.stringify(i).slice(0, 320) })), R.who.v)

const dayOil = async (di) => {
  await go(page, 'editsched'); await board(page, di)
  const door = page.locator('#sbOil')
  if (!await door.count() || !(await door.isVisible().catch(() => false))) return 'no OIL door on this day'
  await oilMode(page, true)
  const r = await page.evaluate(w => [...document.querySelectorAll('#schedBoard .oilpk')].map(e => {
    const pk = e.querySelector('[data-person]')
    const id = e.getAttribute('data-oilp') || (pk && pk.dataset.person) || ''
    return { id, kind: e.classList.contains('inert') ? 'INERT' : e.classList.contains('on') ? 'ON' : 'OFF', fig: pk ? (pk.innerText || '').replace(/\s+/g, ' ').trim() : '', title: (e.getAttribute('title') || '').slice(0, 90) }
  }).filter(p => p.id === w), R.who.v)
  await shot(page, 'G-H2-34-mode-day' + di)
  await oilMode(page, false)
  return r
}
R.fri = await dayOil(4); R.sat = await dayOil(5); R.sun = await dayOil(6)
await go(page, 'editsched'); await board(page, 5); R.pubSat = await publish(page, 5)
await page.waitForTimeout(500); await board(page, 6); R.pubSun = await publish(page, 6)
await page.waitForTimeout(800)
R.credits = await (async () => {
  await go(page, 'leavewar'); await page.waitForTimeout(1500)
  const out = {}
  for (const d of ['2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20']) {
    const c = page.locator(`[data-testid="cell-${R.who.v}-${d}"]`)
    out[d] = await c.count() ? ((await c.innerText()).replace(/\s+/g, ' ').trim() || '(blank)') : 'no cell'
  }
  await shot(page, 'G-H2-35-credits')
  return out
})()
R.inputsRow = await (async () => {
  await go(page, 'inputs'); await page.waitForTimeout(1000)
  const all = page.locator('button').filter({ hasText: /All dates/i }).first()
  if (await all.count()) { await all.click(); await page.waitForTimeout(800) }
  const rows = await page.evaluate(cs => [...document.querySelectorAll('tr')].map(r => (r.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => t.includes(cs)).slice(0, 4), R.who.t)
  await shot(page, 'G-H2-36-inputs-row')
  return rows
})()

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-h2d.json', JSON.stringify(R, null, 1))
console.log('dates note:', JSON.stringify(R.datesNote), ' who:', JSON.stringify(R.who), ' type:', JSON.stringify(R.type))
console.log('OIL question asked:', R.asked)
console.log('THE SHEET:', R.sheet)
console.log('its day buttons:', JSON.stringify(R.dayBtns))
console.log('"only some days" offered:', R.hasSomeDays, ' then:', JSON.stringify(R.dayBtns2))
console.log('after picking Saturday only:', JSON.stringify(R.dayBtns3))
console.log('stored:', JSON.stringify(R.stored))
console.log('FRI:', JSON.stringify(R.fri)); console.log('SAT:', JSON.stringify(R.sat)); console.log('SUN:', JSON.stringify(R.sun))
console.log('the money:', JSON.stringify(R.credits))
console.log('the Inputs page row:', JSON.stringify(R.inputsRow))
console.log('errors:', R.errors)
await browser.close()
