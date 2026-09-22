/* H2 third attempt — the Inputs page's own "Add input" row, whose dates come
   from the range picker.  Training Fri 17 → Mon 20 Jul, OIL Saturday only. */
import { open, board, shot, publish, go, oilMode } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
const R = {}

await go(page, 'inputs')
await page.waitForTimeout(1200)

/* the range picker */
const rangeBtn = page.locator('button').filter({ hasText: /→/ }).first()
R.rangeLabelBefore = (await rangeBtn.innerText()).trim()
await rangeBtn.click(); await page.waitForTimeout(700)
await shot(page, 'G-H2-20-range-picker')
R.picker = await page.evaluate(() => {
  const p = [...document.querySelectorAll('[class*=rangep], [role=dialog], .sheet')].filter(e => e.offsetParent)[0]
  return p ? { text: (p.innerText || '').replace(/\n+/g, ' | ').slice(0, 220), cls: p.className } : null
})
/* step back to July */
for (let i = 0; i < 4; i++) {
  const m = await page.evaluate(() => {
    const p = [...document.querySelectorAll('[class*=rangep], [role=dialog], .sheet')].filter(e => e.offsetParent)[0]
    return p ? (p.innerText || '').split('\n').find(l => /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(l)) : null
  })
  R.month = m
  if (m && /jul/i.test(m)) break
  const prev = page.locator('[class*=rangep] button, [role=dialog] button').filter({ hasText: /^‹$/ }).first()
  if (!await prev.count()) break
  await prev.click(); await page.waitForTimeout(350)
}
/* pick 17 then 20 */
const pickDay = async (n) => {
  const d = page.locator(`[class*=rangep] button, [role=dialog] button`).filter({ hasText: new RegExp(`^${n}$`) }).first()
  if (await d.count()) { await d.click(); await page.waitForTimeout(350); return true }
  return false
}
R.picked17 = await pickDay(17)
R.picked20 = await pickDay(20)
await shot(page, 'G-H2-21-range-17-to-20')
const done = page.locator('button').filter({ hasText: /^(Done|Apply|OK|Use)/ }).first()
if (await done.count()) { await done.click(); await page.waitForTimeout(600) }
else { await page.keyboard.press('Escape'); await page.waitForTimeout(400) }
R.rangeLabelAfter = await rangeBtn.count() ? (await rangeBtn.innerText()).trim() : null

/* the add row */
const addBtn = page.locator('button').filter({ hasText: /^Add input$/ }).first()
R.addRow = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find(e => (e.innerText || '').trim() === 'Add input')
  const row = b && b.closest('tr, .inp-add, form, div')
  if (!row) return null
  return {
    selects: [...row.querySelectorAll('select')].map(s => ({ v: s.value, n: s.options.length, opts: [...s.options].slice(0, 4).map(o => o.textContent.trim()) })),
    inputs: [...row.querySelectorAll('input')].map(e => ({ t: e.type, v: e.value, ph: e.placeholder })),
    buttons: [...row.querySelectorAll('button')].map(e => (e.innerText || '').trim()).slice(0, 8),
    text: (row.innerText || '').replace(/\s+/g, ' ').slice(0, 220),
  }
})
await shot(page, 'G-H2-22-add-row')

R.filed = await (async () => {
  const before = await page.evaluate(() => Object.keys(window.INPUTS).length)
  const row = page.locator('button').filter({ hasText: /^Add input$/ }).first()
  await row.click(); await page.waitForTimeout(900)
  await shot(page, 'G-H2-22b-add-form-open')
  const sels = page.locator('select:visible')
  const n = await sels.count()
  /* the add row's own selects are the last ones on the page */
  const person = sels.nth(n - 2), type = sels.nth(n - 1)
  const opts = await person.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: (o.textContent || '').trim() })))
  const who = opts.find(o => o.v && !/^all/i.test(o.v) && /^[A-Z]/.test(o.t)) || opts[1]
  await person.selectOption(who.v).catch(() => {})
  const topts = await type.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: (o.textContent || '').trim() })))
  const tr = topts.find(o => /train/i.test(o.t)) || topts[1]
  await type.selectOption(tr.v).catch(() => {})
  await page.waitForTimeout(400)
  await shot(page, 'G-H2-23-add-row-filled')
  const save = page.locator('#inpEditSave, button').filter({ hasText: /^(Add|Save)$/ }).last()
  if (await save.count()) await save.click()
  await page.waitForTimeout(1200)
  const conf = page.locator('[data-testid="oilconf"]')
  const asked = await conf.count() && await conf.isVisible().catch(() => false)
  let sheet = null, before2 = [], after2 = []
  if (asked) {
    sheet = (await conf.innerText()).replace(/\n+/g, ' | ').slice(0, 700)
    before2 = await conf.locator('[data-oilday]').evaluateAll(bs => bs.map(b => ({ d: b.getAttribute('data-oilday'), t: (b.innerText || '').trim(), cls: b.className })))
    await shot(page, 'G-H2-24-oil-question')
    const some = conf.locator('button').filter({ hasText: /only some|some days/i }).first()
    if (await some.count()) { await some.click(); await page.waitForTimeout(500) }
    const days = await conf.locator('[data-oilday]').evaluateAll(bs => bs.map(b => b.getAttribute('data-oilday')))
    for (const d of days) {
      const btn = conf.locator(`[data-oilday="${d}"]`)
      const on = await btn.evaluate(e => /(^| )on( |$)|sel|pick|approve/.test(e.className))
      if (on !== (d === '2026-07-18')) { await btn.click(); await page.waitForTimeout(250) }
    }
    after2 = await conf.locator('[data-oilday]').evaluateAll(bs => bs.map(b => ({ d: b.getAttribute('data-oilday'), cls: b.className })))
    await shot(page, 'G-H2-25-saturday-only')
    const save = conf.locator('button').filter({ hasText: /^Save$/ }).first()
    if (await save.count()) { await save.click(); await page.waitForTimeout(1200) }
  }
  return { who, tr, asked, sheet, before2, after2, added: (await page.evaluate(() => Object.keys(window.INPUTS).length)) - before }
})()

R.stored = await page.evaluate(w => Object.entries(window.INPUTS).filter(([, i]) => i.person === w)
  .map(([k, i]) => ({ k, raw: JSON.stringify(i).slice(0, 300) })), R.filed.who && R.filed.who.v)

const dayOil = async (di) => {
  await go(page, 'editsched'); await board(page, di)
  const door = page.locator('#sbOil')
  if (!await door.count() || !(await door.isVisible().catch(() => false))) return 'no OIL door on this day'
  await oilMode(page, true)
  const r = await page.evaluate(w => [...document.querySelectorAll('#schedBoard .oilpk')].map(e => {
    const pk = e.querySelector('[data-person]')
    const id = e.getAttribute('data-oilp') || (pk && pk.dataset.person) || ''
    return { id, kind: e.classList.contains('inert') ? 'INERT' : e.classList.contains('on') ? 'ON' : 'OFF', fig: pk ? (pk.innerText || '').replace(/\s+/g, ' ').trim() : '', title: (e.getAttribute('title') || '').slice(0, 80) }
  }).filter(p => p.id === w), R.filed.who && R.filed.who.v)
  await shot(page, 'G-H2-26-mode-day' + di)
  await oilMode(page, false)
  return r
}
R.sat = await dayOil(5); R.sun = await dayOil(6); R.mon = await dayOil(0)
await go(page, 'editsched'); await board(page, 5); R.pubSat = await publish(page, 5)
await page.waitForTimeout(500); await board(page, 6); R.pubSun = await publish(page, 6)
await page.waitForTimeout(700)
R.credits = await (async () => {
  await go(page, 'leavewar'); await page.waitForTimeout(1500)
  const out = {}
  for (const d of ['2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20']) {
    const c = page.locator(`[data-testid="cell-${R.filed.who.v}-${d}"]`)
    out[d] = await c.count() ? ((await c.innerText()).replace(/\s+/g, ' ').trim() || '(blank)') : 'no cell'
  }
  await shot(page, 'G-H2-27-credits')
  return out
})()

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-h2c.json', JSON.stringify(R, null, 1))
console.log('range label:', R.rangeLabelBefore, '→', R.rangeLabelAfter, ' picker:', JSON.stringify(R.picker), ' month:', R.month, ' picked:', R.picked17, R.picked20)
console.log('add row:', JSON.stringify(R.addRow))
console.log('filed:', JSON.stringify({ who: R.filed.who, tr: R.filed.tr, asked: R.filed.asked, added: R.filed.added }))
console.log('THE OIL QUESTION:', R.filed.sheet)
console.log('day buttons offered:', JSON.stringify(R.filed.before2))
console.log('after picking Saturday only:', JSON.stringify(R.filed.after2))
console.log('stored:', JSON.stringify(R.stored))
console.log('SAT:', JSON.stringify(R.sat)); console.log('SUN:', JSON.stringify(R.sun)); console.log('MON:', JSON.stringify(R.mon))
console.log('the money:', JSON.stringify(R.credits))
console.log('errors:', R.errors)
await browser.close()
