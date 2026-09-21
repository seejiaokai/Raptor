/* H2 (Fable S42) — a request spanning several days, answered Yes for one day
   only.  Training Fri 17 – Mon 20 Jul 09:00–12:00, OIL for Saturday alone. */
import { open, board, tap, shot, publish, go, oilMode, readDay } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
const R = {}

await board(page, 5)

/* file the multi-day request through the board's own + INPUTS door */
R.filing = await (async () => {
  await tap(page, `[data-inpadd="5.g"]`)
  await page.waitForTimeout(700)
  const pop = page.locator('#inpEditPop')
  R.formText = (await pop.innerText()).replace(/\n+/g, ' | ').slice(0, 420)
  await shot(page, 'G-H2-01-request-form')
  const before = await page.evaluate(() => Object.keys(window.INPUTS).length)
  /* person: someone with nothing on the Saturday */
  const opts = await pop.locator('select').nth(0).locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.textContent })))
  const busy = await page.evaluate(() => {
    const s = new Set()
    for (const e of document.querySelectorAll('#schedBoard .puck[data-person]')) if (!e.closest('#sbRoster')) s.add(e.dataset.person)
    return [...s]
  })
  const pick = opts.find(o => o.v && !busy.includes(o.v) && !/^all/i.test(o.v))
  await pop.locator('select').nth(0).selectOption(pick.v)
  const types = await pop.locator('select').nth(1).locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: (o.textContent || '').trim() })))
  const tr = types.find(o => /train/i.test(o.t)) || types.find(o => /commit|duty/i.test(o.t)) || types[1]
  await pop.locator('select').nth(1).selectOption(tr.v)
  await page.waitForTimeout(400)
  /* the date range: Fri 17 → Mon 20 */
  const dates = pop.locator('input[type=date]')
  const nd = await dates.count()
  if (nd >= 2) { await dates.nth(0).fill('2026-07-17'); await dates.nth(1).fill('2026-07-20') }
  else if (nd === 1) { await dates.nth(0).fill('2026-07-17') }
  const cb = pop.locator('input[type=checkbox]').first()
  if (await cb.isChecked()) await cb.click()
  const times = pop.locator('input[type=time]')
  if (await times.count() >= 2) { await times.nth(0).fill('09:00'); await times.nth(1).fill('12:00') }
  await page.waitForTimeout(400)
  await shot(page, 'G-H2-02-request-filled')
  await page.locator('#inpEditSave').click()
  await page.waitForTimeout(900)
  /* the OIL question */
  const conf = page.locator('[data-testid="oilconf"]')
  const asked = await conf.count() && await conf.isVisible()
  let sheet = null, dayBtns = []
  if (asked) {
    sheet = (await conf.innerText()).replace(/\n+/g, ' | ').slice(0, 500)
    await shot(page, 'G-H2-03-oil-question')
    /* the "only some days" choice */
    const some = conf.locator('button').filter({ hasText: /only some|some days|choose|pick/i }).first()
    if (await some.count()) { await some.click(); await page.waitForTimeout(500) }
    else { const yes = conf.locator('button').filter({ hasText: /^Yes/ }).first(); if (await yes.count()) await yes.click(); await page.waitForTimeout(400) }
    dayBtns = await conf.locator('[data-oilday]').evaluateAll(bs => bs.map(b => ({ v: b.getAttribute('data-oilday'), t: (b.innerText || '').trim(), on: b.className })))
    /* leave only Saturday picked */
    for (const d of dayBtns) {
      const btn = conf.locator(`[data-oilday="${d.v}"]`)
      const on = await btn.evaluate(e => /on|sel|pick|approve/.test(e.className))
      const wantOn = d.v === '2026-07-18'
      if (on !== wantOn) { await btn.click(); await page.waitForTimeout(250) }
    }
    await shot(page, 'G-H2-04-oil-question-saturday-only')
    const picked = await conf.locator('[data-oilday]').evaluateAll(bs => bs.map(b => ({ v: b.getAttribute('data-oilday'), cls: b.className })))
    await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(async () => {
      await conf.locator('button').filter({ hasText: /Save|Done|OK/ }).first().click()
    })
    await page.waitForTimeout(1000)
    return { before, asked, sheet, dayBtns, picked, after: await page.evaluate(() => Object.keys(window.INPUTS).length) }
  }
  return { before, asked: false, after: await page.evaluate(() => Object.keys(window.INPUTS).length) }
})()

const dayOil = async (di) => {
  await go(page, 'editsched'); await board(page, di)
  const hasDoor = await page.locator('#sbOil').count() && await page.locator('#sbOil').isVisible().catch(() => false)
  if (!hasDoor) { await shot(page, 'G-H2-05-no-oil-door-day' + di); return [{ who: 'n/a', kind: 'NO OIL DOOR ON THIS DAY' }] }
  await oilMode(page, true)
  const r = await page.evaluate(() => {
    const root = document.querySelector('#schedBoard')
    const P = window.PEOPLE
    return [...root.querySelectorAll('.oilpk')].map(e => {
      const pk = e.querySelector('[data-person]')
      const id = e.getAttribute('data-oilp') || (pk && pk.dataset.person) || ''
      return { who: (P[id] || {}).cs || id, kind: e.classList.contains('inert') ? 'INERT' : e.classList.contains('on') ? 'ON' : 'OFF',
        fig: pk ? (pk.innerText || '').replace(/\s+/g, ' ').trim() : '', title: (e.getAttribute('title') || '').slice(0, 80) }
    })
  })
  await shot(page, 'G-H2-05-mode-day' + di)
  await oilMode(page, false)
  return r
}
R.person = await page.evaluate(() => {
  const ks = Object.keys(window.INPUTS)
  const i = window.INPUTS[ks[ks.length - 1]]
  return i ? { person: i.person, cs: (window.PEOPLE[i.person] || {}).cs, type: i.type, from: i.from || i.d1, to: i.to || i.d2, oil: i.oil, oildays: i.oildays } : null
})
R.sat = (await dayOil(5)).filter(p => p.who === (R.person || {}).cs)
R.sun = (await dayOil(6)).filter(p => p.who === (R.person || {}).cs)
R.fri = (await dayOil(4)).filter(p => p.who === (R.person || {}).cs)

/* publish Saturday and Sunday, then read the money */
await go(page, 'editsched'); await board(page, 5); R.pubSat = await publish(page, 5)
await page.waitForTimeout(600)
await board(page, 6); R.pubSun = await publish(page, 6)
await page.waitForTimeout(700)
R.credits = await (async () => {
  await go(page, 'leavewar'); await page.waitForTimeout(1400)
  const out = {}
  for (const d of ['2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20']) {
    const c = page.locator(`[data-testid="cell-${(R.person || {}).person}-${d}"]`)
    out[d] = await c.count() ? (await c.innerText()).replace(/\s+/g, ' ').trim() : 'no cell'
  }
  await shot(page, 'G-H2-06-leavewar-credits')
  return out
})()
/* what the Inputs page says the member answered */
R.inputsPage = await (async () => {
  await go(page, 'inputs'); await page.waitForTimeout(900)
  const rows = await page.evaluate(cs => [...document.querySelectorAll('tr, .inp-row')]
    .map(r => (r.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => cs && t.includes(cs)).slice(0, 4), (R.person || {}).cs)
  await shot(page, 'G-H2-07-inputs-page')
  return rows
})()

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-h2.json', JSON.stringify(R, null, 1))
console.log('the request form:', R.formText)
console.log('filing:', JSON.stringify({ asked: R.filing.asked, added: R.filing.after - R.filing.before }))
console.log('the OIL question read:', R.filing.sheet)
console.log('its day buttons:', JSON.stringify(R.filing.dayBtns))
console.log('after picking Saturday only:', JSON.stringify(R.filing.picked))
console.log('the input stored:', JSON.stringify(R.person))
console.log('FRIDAY  in the mode:', JSON.stringify(R.fri))
console.log('SATURDAY in the mode:', JSON.stringify(R.sat))
console.log('SUNDAY  in the mode:', JSON.stringify(R.sun))
console.log('publish sat/sun:', JSON.stringify(R.pubSat), JSON.stringify(R.pubSun))
console.log('the money:', JSON.stringify(R.credits))
console.log('the Inputs page:', JSON.stringify(R.inputsPage))
console.log('errors:', R.errors)
await browser.close()
