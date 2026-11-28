// bell190-b scenario group 9 (desktop): the weekend OIL question on the Inputs page — ALL AVAIL on Sat 18 Jul tells no man
// [F29 weekend, A33]; a several-people input on a Saturday: nothing while the question is up, nothing after "Back", one
// line each after the answer [the Inputs door of F8 / A37].
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-s9 v1')
const P = 'b-s9'
L.clearPics(P)
const { b, page, errs } = await L.launch('desk')
const log = (...a) => console.log(...a)
const ID = L.ID
log('saber:', await L.as.saber(page))
await L.makeMoxie(page)
async function weekend(key, o, answer) {
  await L.goInputs(page)
  const had = await L.inputIds(page)
  await L.openNewFromList(page)
  await L.setType(page, o.type)
  if (o.title) await page.locator('#inpEditOwnTitle').evaluate((el, v) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) }, o.title)
  await L.setPeople(page, o.people)
  await L.pickDates(page, o.date)
  const before = await L.notices(page)
  await page.click('#inpEditSave'); await page.waitForTimeout(600)
  const oil = page.locator('[data-testid="oilconf"]')
  const up = await oil.isVisible().catch(() => false)
  await L.pic(page, `${P}-${key}-question`)
  log(`[${key}] the OIL question is up: ${up}; it says:`, up ? (await oil.innerText()).replace(/\s+/g, ' ').slice(0, 220) : '-')
  log(`[${key}] lines written while the question is up:`, L.fmt(L.newNotices(await L.notices(page), before)) || 'none')
  if (up && answer === 'back') {
    await page.click('[data-testid="oilconf-cancel"]'); await page.waitForTimeout(600)
    await L.pic(page, `${P}-${key}-after-back`)
    log(`[${key}] after Back: window open=${await page.locator(L.WIN).count()} made=${JSON.stringify(await L.made(page, had))} lines:`, L.fmt(L.newNotices(await L.notices(page), before)) || 'none')
    await L.closeWin(page)
  } else if (up) {
    await page.click('[data-testid="oil-yes"]'); await page.click('[data-testid="oilconf-save"]'); await page.waitForTimeout(700)
    log(`[${key}] after Yes · Save: window open=${await page.locator(L.WIN).count()} made=${JSON.stringify(await L.made(page, had))} lines:\n    ` + (L.fmt(L.newNotices(await L.notices(page), before)) || 'none'))
  }
}
await weekend('9a', { type: 'Duty', title: 'B9a Sat avail', people: ['allavail'], date: '2026-07-18' }, 'yes')
await weekend('9b', { type: 'Meeting', title: 'B9b Sat back', people: [ID.Ranger, ID.Moxie], date: '2026-07-18' }, 'back')
await weekend('9c', { type: 'Meeting', title: 'B9c Sat yes', people: [ID.Ranger, ID.Moxie], date: '2026-07-18' }, 'yes')
await L.signOut(page)
log('ranger:', await L.as.ranger(page))
const rb = await L.readBell(page, `${P}-ranger-bell`)
log('RANGER bell:', L.bellText(rb), JSON.stringify(rb.lit))
await L.signOut(page)
log('errors', JSON.stringify(errs))
await b.close()
