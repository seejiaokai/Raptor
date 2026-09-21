/* H2 second attempt — the multi-day request filed from the INPUTS PAGE, which
   is where the date range lives, then answered Yes for Saturday only. */
import { open, board, shot, publish, go, oilMode } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
const R = {}

await go(page, 'inputs')
await page.waitForTimeout(900)
R.addDoors = await page.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent)
  .map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => /add|new|\+/i.test(t)).slice(0, 12))
const add = page.locator('button').filter({ hasText: /^\+\s*(Add|New)|^Add input|^\+$/i }).first()
if (await add.count()) { await add.click(); await page.waitForTimeout(800) }
else { const any = page.locator('button').filter({ hasText: /add/i }).first(); if (await any.count()) { await any.click(); await page.waitForTimeout(800) } }
const pop = page.locator('#inpEditPop')
R.popUp = await pop.count() ? await pop.isVisible() : false
R.form = R.popUp ? (await pop.innerText()).replace(/\n+/g, ' | ').slice(0, 300) : null
R.fields = await page.evaluate(() => {
  const p = document.querySelector('#inpEditPop'); if (!p) return null
  return { dates: [...p.querySelectorAll('input[type=date]')].map(e => ({ v: e.value, lbl: (e.labels && e.labels[0] && e.labels[0].innerText) || e.getAttribute('aria-label') || '' })),
    times: p.querySelectorAll('input[type=time]').length, selects: p.querySelectorAll('select').length,
    checkboxes: [...p.querySelectorAll('input[type=checkbox]')].map(e => ({ checked: e.checked, lbl: (e.parentElement && e.parentElement.innerText || '').trim().slice(0, 30) })) }
})
await shot(page, 'G-H2-10-inputs-page-form')

R.filed = await (async () => {
  if (!R.popUp) return { ok: false, why: 'the Inputs page did not open a form' }
  const before = await page.evaluate(() => Object.keys(window.INPUTS).length)
  const busy = await page.evaluate(() => {
    const s = new Set(); for (const e of document.querySelectorAll('.puck[data-person]')) s.add(e.dataset.person); return [...s]
  })
  const opts = await pop.locator('select').nth(0).locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: (o.textContent || '').trim() })))
  const pick = opts.find(o => o.v && !/^all/i.test(o.v) && !busy.includes(o.v)) || opts[1]
  await pop.locator('select').nth(0).selectOption(pick.v)
  const types = await pop.locator('select').nth(1).locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: (o.textContent || '').trim() })))
  const tr = types.find(o => /train/i.test(o.t)) || types[1]
  await pop.locator('select').nth(1).selectOption(tr.v)
  await page.waitForTimeout(400)
  const dates = pop.locator('input[type=date]')
  const nd = await dates.count()
  if (nd >= 2) { await dates.nth(0).fill('2026-07-17'); await dates.nth(1).fill('2026-07-20') }
  const cb = pop.locator('input[type=checkbox]').first()
  if (await cb.count() && await cb.isChecked()) await cb.click()
  const times = pop.locator('input[type=time]')
  if (await times.count() >= 2) { await times.nth(0).fill('09:00'); await times.nth(1).fill('12:00') }
  await page.waitForTimeout(400)
  await shot(page, 'G-H2-11-multi-day-filled')
  await page.locator('#inpEditSave').click()
  await page.waitForTimeout(1000)
  const conf = page.locator('[data-testid="oilconf"]')
  const asked = await conf.count() && await conf.isVisible()
  let sheet = null, before2 = [], after2 = []
  if (asked) {
    sheet = (await conf.innerText()).replace(/\n+/g, ' | ').slice(0, 650)
    before2 = await conf.locator('[data-oilday]').evaluateAll(bs => bs.map(b => ({ d: b.getAttribute('data-oilday'), t: (b.innerText || '').trim(), cls: b.className })))
    await shot(page, 'G-H2-12-oil-question-multi-day')
    const some = conf.locator('button').filter({ hasText: /only some|some days/i }).first()
    if (await some.count()) { await some.click(); await page.waitForTimeout(500) }
    const days = await conf.locator('[data-oilday]').evaluateAll(bs => bs.map(b => ({ d: b.getAttribute('data-oilday'), cls: b.className })))
    for (const d of days) {
      const btn = conf.locator(`[data-oilday="${d.d}"]`)
      const on = await btn.evaluate(e => /\bon\b|\bsel\b|pick|approve/.test(e.className))
      if (on !== (d.d === '2026-07-18')) { await btn.click(); await page.waitForTimeout(250) }
    }
    after2 = await conf.locator('[data-oilday]').evaluateAll(bs => bs.map(b => ({ d: b.getAttribute('data-oilday'), cls: b.className })))
    await shot(page, 'G-H2-13-saturday-only-picked')
    const save = conf.locator('button').filter({ hasText: /^Save$/ }).first()
    if (await save.count()) { await save.click(); await page.waitForTimeout(1100) }
  }
  const after = await page.evaluate(() => Object.keys(window.INPUTS).length)
  return { ok: true, who: pick, type: tr, asked, sheet, dayButtonsBefore: before2, dayButtonsAfter: after2, added: after - before }
})()

R.stored = await page.evaluate(w => {
  const out = []
  for (const [k, i] of Object.entries(window.INPUTS)) if (i.person === w) out.push({ k, type: i.type, oil: i.oil, keys: Object.keys(i).slice(0, 14), raw: JSON.stringify(i).slice(0, 320) })
  return out
}, R.filed.who && R.filed.who.v)

const dayOil = async (di) => {
  await go(page, 'editsched'); await board(page, di)
  const door = page.locator('#sbOil')
  if (!await door.count() || !(await door.isVisible().catch(() => false))) return 'no OIL door on this day'
  await oilMode(page, true)
  const r = await page.evaluate(w => {
    const root = document.querySelector('#schedBoard')
    return [...root.querySelectorAll('.oilpk')].map(e => {
      const pk = e.querySelector('[data-person]')
      const id = e.getAttribute('data-oilp') || (pk && pk.dataset.person) || ''
      return { id, kind: e.classList.contains('inert') ? 'INERT' : e.classList.contains('on') ? 'ON' : 'OFF',
        fig: pk ? (pk.innerText || '').replace(/\s+/g, ' ').trim() : '', title: (e.getAttribute('title') || '').slice(0, 80) }
    }).filter(p => p.id === w)
  }, R.filed.who && R.filed.who.v)
  await shot(page, 'G-H2-14-mode-day' + di)
  await oilMode(page, false)
  return r
}
R.sat = await dayOil(5)
R.sun = await dayOil(6)
R.mon = await dayOil(0)

await go(page, 'editsched'); await board(page, 5); R.pubSat = await publish(page, 5)
await page.waitForTimeout(500)
await board(page, 6); R.pubSun = await publish(page, 6)
await page.waitForTimeout(700)
R.credits = await (async () => {
  await go(page, 'leavewar'); await page.waitForTimeout(1500)
  const out = {}
  for (const d of ['2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20']) {
    const c = page.locator(`[data-testid="cell-${R.filed.who.v}-${d}"]`)
    out[d] = await c.count() ? (await c.innerText()).replace(/\s+/g, ' ').trim() || '(blank)' : 'no cell'
  }
  await shot(page, 'G-H2-15-credits')
  return out
})()
R.inputsPage = await (async () => {
  await go(page, 'inputs'); await page.waitForTimeout(1000)
  const rows = await page.evaluate(cs => [...document.querySelectorAll('tr')]
    .map(r => (r.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => cs && t.includes(cs)).slice(0, 4), R.filed.who.t)
  await shot(page, 'G-H2-16-inputs-page-row')
  return rows
})()

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-h2b.json', JSON.stringify(R, null, 1))
console.log('add doors on the Inputs page:', JSON.stringify(R.addDoors))
console.log('the form:', R.form)
console.log('its fields:', JSON.stringify(R.fields))
console.log('filed:', JSON.stringify({ who: R.filed.who, type: R.filed.type, asked: R.filed.asked, added: R.filed.added }))
console.log('THE OIL QUESTION:', R.filed.sheet)
console.log('day buttons as offered:', JSON.stringify(R.filed.dayButtonsBefore))
console.log('day buttons after picking Saturday only:', JSON.stringify(R.filed.dayButtonsAfter))
console.log('stored:', JSON.stringify(R.stored))
console.log('SATURDAY:', JSON.stringify(R.sat))
console.log('SUNDAY  :', JSON.stringify(R.sun))
console.log('MONDAY  :', JSON.stringify(R.mon))
console.log('the money:', JSON.stringify(R.credits))
console.log('the Inputs page row:', JSON.stringify(R.inputsPage))
console.log('errors:', R.errors)
await browser.close()
