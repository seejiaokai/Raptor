// bell190-b scenario group 5 (desktop): leave and a medical filed by Saber for Ranger on the Inputs page — one line,
// none from the war [F30, F31, A22]; the same over Ranger's pending LL bid, which Ranger files on the Leave War first —
// "You were added · replaces your LL bid" [F16 (Inputs door), A23].
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-s5 v1')
const P = 'b-s5'
L.clearPics(P)
const { b, page, errs } = await L.launch('desk')
const log = (...a) => console.log(...a)
const ID = L.ID
log('saber:', await L.as.saber(page))
async function step(key, o) {
  const before = await L.notices(page)
  const r = await L.file(page, { picBefore: `${P}-${key}-window`, picAsk: `${P}-${key}-asked`, ...o })
  const nn = L.newNotices(await L.notices(page), before)
  log(`[${key}] picked=${JSON.stringify(r.ppl)} open=${r.open} asked=${JSON.stringify(r.asked)} rows=${JSON.stringify(r.rows)}`)
  log(`[${key}] new notices (${nn.length}):\n    ${L.fmt(nn)}`)
  if (r.open) { await L.pic(page, `${P}-${key}-still-open`); await L.closeWin(page) }
  return r
}
async function medical(key, from, to) {
  // the Medical tab's own "+ Medical" door (the same window, ATT C set)
  await L.goInputs(page)
  await page.click('#inMedBtn'); await page.waitForTimeout(500)
  const had = await L.inputIds(page)
  await page.locator('button:visible', { hasText: '+ Medical' }).first().click()
  await page.waitForSelector(L.WIN)
  log(`[${key}] the window opens on type`, await page.locator('#inpEditType').inputValue().catch(() => '?'))
  await L.setPeople(page, [ID.Ranger])
  await L.pickDates(page, from, to)
  await L.pic(page, `${P}-${key}-window`)
  const before = await L.notices(page)
  const r = await L.save(page, { picAsk: `${P}-${key}-asked` })
  const nn = L.newNotices(await L.notices(page), before)
  log(`[${key}] open=${r.open} asked=${JSON.stringify(r.asked)} rows=${JSON.stringify(await L.made(page, had))}`)
  log(`[${key}] new notices (${nn.length}):\n    ${L.fmt(nn)}`)
  if (r.open) { await L.pic(page, `${P}-${key}-still-open`); await L.closeWin(page) }
}
// 5a: LL for Ranger, Mon 20 - Tue 21 Jul, on the Inputs page
await L.goInputs(page)
await step('5a', { from: 'list', type: 'LL', people: [ID.Ranger], date: '2026-07-20', to: '2026-07-21' })
// 5b: a medical (ATT C) for Ranger, Wed 15 - Thu 16 Jul, by "+ Medical"
await medical('5b', '2026-07-15', '2026-07-16')
// 5c setup: Saber opens December for bidding on the Leave War, so Ranger can bid
await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-bane"]', { timeout: 20000 })
await page.click('[data-testid="open-chip"]'); await page.waitForSelector('[data-testid="open-dates"]')
const dec = page.locator('[data-testid="od-month-2026-12"]')
log('December before:', await dec.getAttribute('data-state'))
if ((await dec.getAttribute('data-state')) !== 'open') { await dec.click(); await page.waitForTimeout(400) }
log('December after:', await dec.getAttribute('data-state'))
await L.pic(page, `${P}-5c-saber-opens-december`)
await page.click('[data-testid="open-dates-close"]'); await page.waitForTimeout(300)
log('chip:', await page.locator('[data-testid="open-chip"]').innerText())
await L.signOut(page)
// Ranger bids LL on Mon 7 Dec and Wed 9 Dec on his own row
log('ranger:', await L.as.ranger(page))
await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-bane"]', { timeout: 20000 })
await page.click('[data-testid="month-DEC"]'); await page.waitForTimeout(800)
for (const d of ['2026-12-07', '2026-12-09']) {
  const c = page.locator(`[data-testid="cell-bane-${d}"]`)
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  await c.click(); await page.waitForSelector('[data-testid="bid-picker"]', { timeout: 5000 })
  await L.pic(page, `${P}-5c-ranger-bid-window-${d.slice(8)}`)
  const before = await L.notices(page)
  await page.click('[data-testid="bid-LL"]'); await page.waitForTimeout(600)
  // a balance below zero asks to tap again: answer it as the member would
  if (await page.locator('[data-testid="bid-picker"]').isVisible().catch(() => false)) {
    const below = await page.locator('[data-testid="bid-picker"]').innerText()
    if (/again/i.test(below)) { await page.click('[data-testid="bid-LL"]'); await page.waitForTimeout(600) }
  }
  if (await page.locator('[data-testid="bid-picker"]').isVisible().catch(() => false)) await page.click('[data-testid="bid-cancel"]').catch(() => {})
  await page.waitForTimeout(300)
  const cell = await c.evaluate(e => ({ text: e.innerText.trim(), html: e.innerHTML.slice(0, 200) }))
  log(`[5c] Ranger's bid on ${d}: cell`, JSON.stringify(cell), ' notices:', L.fmt(L.newNotices(await L.notices(page), before)) || 'none')
}
await L.pic(page, `${P}-5c-ranger-bids`)
await L.signOut(page)
// Saber files LL on the Inputs page over the bid of Mon 7 Dec, and a medical over the bid of Wed 9 Dec
log('saber:', await L.as.saber(page))
await L.goInputs(page)
await step('5c-ll', { from: 'list', type: 'LL', people: [ID.Ranger], date: '2026-12-07' })
await medical('5c-med', '2026-12-09', '2026-12-09')
const all = await L.notices(page)
log('STORE every line to Ranger now:\n    ' + L.fmt(all.filter(n => n.to === ID.Ranger)))
await L.signOut(page)
log('ranger:', await L.as.ranger(page))
const rb = await L.readBell(page, `${P}-ranger-bell`)
log('RANGER bell:', L.bellText(rb), JSON.stringify(rb.lit))
const t1 = await L.tapLine(page, 'Mon 7 Dec', `${P}-ranger-tap-5c-ll`)
log('RANGER tap the 7 Dec line ->', JSON.stringify(t1)); await L.closeWin(page)
await L.readBell(page, null)
const t2 = await L.tapLine(page, 'Mon 20 Jul', `${P}-ranger-tap-5a`)
log('RANGER tap the 20 Jul line ->', JSON.stringify(t2)); await L.closeWin(page)
// what the Leave War shows for his December days now
await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-bane"]', { timeout: 20000 })
await page.click('[data-testid="month-DEC"]'); await page.waitForTimeout(800)
await page.locator('[data-testid="cell-bane-2026-12-07"]').evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
log('[5c] war cells now:', JSON.stringify(await page.evaluate(() => ['07', '09'].map(d => document.querySelector(`[data-testid="cell-bane-2026-12-${d}"]`)?.innerText.trim()))))
await L.pic(page, `${P}-5c-ranger-war-after`)
await L.signOut(page)
log('errors', JSON.stringify(errs))
await b.close()
