// bell190-b scenario group 6 (desktop): the SANS calendar's "+ Commitment" by Saber for a SANS man — RECORD [F32, A31].
// Tally is SANS on the roster (the people picker lists him under SANS); he has no sign-in, so his bell is read in the store.
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-s6 v1')
const P = 'b-s6'
L.clearPics(P)
const { b, page, errs } = await L.launch('desk')
const log = (...a) => console.log(...a)
const ID = L.ID
log('saber:', await L.as.saber(page))
log('SANS men on the roster:', await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k, p]) => p.quals && p.quals.san).map(([k, p]) => k + '=' + p.cs).join(' ')))
await L.goInputs(page)
await page.click('#inSansMode'); await page.waitForSelector('[data-testid="sanscal"]'); await page.waitForTimeout(500)
// to July 2026, reading the calendar's own heading
for (let i = 0; i < 12; i++) {
  const head = await page.locator('[data-testid="sanscal"]').evaluate(e => (e.innerText.match(/(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER|JAN|FEB|MAR|APR|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})/i) || [])[0] || '')
  if (/^JUL\w*\s+2026/i.test(head)) { log('SANS calendar on', head); break }
  await page.click('[data-testid="sc-prev"]'); await page.waitForTimeout(400)
}
await L.monthStill(page)
async function commit(key, iso, ids, letters) {
  const cell = page.locator(`[data-testid="sanscal"] [data-icday="${iso}"]`).first()
  await cell.click({ position: { x: 8, y: 8 } }); await page.waitForSelector('[data-testid="sd-add"]', { timeout: 5000 })
  await page.waitForTimeout(300)
  await L.pic(page, `${P}-${key}-day`)
  log(`[${key}] the day says:`, (await page.locator('#sansday').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300))
  const had = await L.inputIds(page)
  await page.click('[data-testid="sd-add"]'); await page.waitForSelector(L.WIN, { timeout: 5000 })
  await page.waitForTimeout(300)
  const w = await page.evaluate(w => { const e = document.querySelector(w); return { text: e.innerText.replace(/\s+/g, ' ').slice(0, 400), sel: !!e.querySelector('#inpEditPerson'), sans: [...e.querySelectorAll('#inpEditSans button, #inpEditSans input, [data-sans]')].map(x => x.innerText || x.value || x.getAttribute('data-sans')) } }, L.WIN)
  log(`[${key}] the window:`, JSON.stringify(w))
  await L.setPeople(page, ids)
  for (const l of letters || []) { const btn = page.locator(`${L.WIN} #inpEditSans button`, { hasText: new RegExp('^' + l) }).first(); if (await btn.count()) { await btn.click(); await page.waitForTimeout(150) } }
  if (await page.locator(`${L.WIN} [data-testid="inpEdCal-day-${iso}"]`).count() && key.includes('range')) await L.pickDates(page, iso, '2026-07-17')
  await L.pic(page, `${P}-${key}-window`)
  const before = await L.notices(page)
  const r = await L.save(page, { picAsk: `${P}-${key}-asked` })
  const nn = L.newNotices(await L.notices(page), before)
  log(`[${key}] picked=${JSON.stringify(await L.chosenPeople(page).catch(() => []))} open=${r.open} asked=${JSON.stringify(r.asked)} made=${JSON.stringify(await L.made(page, had))}`)
  log(`[${key}] new notices (${nn.length}):\n    ${L.fmt(nn)}`)
  if (r.open) { await L.pic(page, `${P}-${key}-still-open`); log('   window says', (await page.locator(L.WIN).innerText()).replace(/\s+/g, ' ').slice(-300)); await L.closeWin(page) }
  await L.closeDay(page)
  return L.made(page, had)
}
// 6a: one SANS man (Tally), Wed 15 Jul, flying offered
const m6a = await commit('6a', '2026-07-15', [ID.Tally], ['F'])
// 6b: two SANS men (Tally and Zulu), a run of days Wed 15 - Fri 17 Jul
const zulu = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Zulu'))
const m6b = await commit('6b-range', '2026-07-16', [ID.Tally, zulu], ['F'])
// 6c: an existing commitment's picker — Zulu added to 6a's
if (m6a[0]) {
  await L.goInputs(page)
  await page.click('#inSansMode'); await page.waitForTimeout(400)
  const cell = page.locator(`[data-testid="sanscal"] [data-icday="2026-07-15"]`).first()
  await cell.click({ position: { x: 8, y: 8 } }); await page.waitForSelector('[data-testid="sd-add"]')
  const card = page.locator(`[data-popiid="${m6a[0].iid}"]:visible`).first()
  if (await card.count()) {
    await card.click(); await page.waitForSelector(L.WIN, { timeout: 5000 })
    await L.pic(page, `${P}-6c-opened`)
    const hasSw = await page.locator(`${L.WIN} [data-testid="pp-several"]`).count()
    log('[6c] the window offers "Several people":', hasSw, ' text:', (await page.locator(L.WIN).innerText()).replace(/\s+/g, ' ').slice(0, 200))
    if (hasSw) {
      await L.setPeople(page, [ID.Tally, zulu], true)
      const before = await L.notices(page)
      const r = await L.save(page)
      log('[6c] save', JSON.stringify(r), ' now', JSON.stringify(await L.input(page, m6a[0].iid)), '\n    notices:', L.fmt(L.newNotices(await L.notices(page), before)) || 'none')
      if (r.open) { await L.pic(page, `${P}-6c-still-open`); await L.closeWin(page) }
    } else await L.closeWin(page)
  } else log('[6c] no card for 6a on the opened SANS day')
}
const all = await L.notices(page)
log('STORE Tally:\n    ' + L.fmt(all.filter(n => n.to === ID.Tally)))
log('STORE Zulu:\n    ' + L.fmt(all.filter(n => n.to === zulu)))
log('STORE Saber count:', all.filter(n => n.to === ID.Saber).length)
log('errors', JSON.stringify(errs))
await b.close()
