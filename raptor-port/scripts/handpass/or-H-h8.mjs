import { launch, open, fileInput, openFromList, describeWin, shot, WIN, toastMark, toastsSince, save, errs, as, badgeText, inputOf } from './or-H-lib.mjs'
const out = {}
const log = (k, v) => { out[k] = v; console.log('## ' + k + ' ' + JSON.stringify(v)) }
const browser = await launch()
const { ctx, page } = await open(browser)
await as(page, 'Saber')
const snap = iid => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? { people: r.people.map(e => window.PEOPLE[e.p]?.cs || e.p).join('+'), type: r.type, date: r.date, to: r.to || null, days: r.days || null } : null }, iid)
const reasons = () => page.locator(WIN).evaluate(w => [...w.querySelectorAll('*')].filter(e => e.children.length === 0 && /one day|is for|Personal|medical|one person|own document|only/i.test(e.textContent) && e.getClientRects().length).map(e => e.textContent.trim().slice(0, 140)))
const winCount = () => page.locator(WIN).count()
async function tryIt(key, iid, act) {
  const before = JSON.stringify(await snap(iid))
  await openFromList(page, iid)
  const m = await toastMark(page)
  await act()
  await page.waitForTimeout(300)
  const pre = { reasonsShown: await reasons() }
  await shot(page, 'H8-' + key + '-set')
  let saved = false
  if (await page.locator('#inpEditSave').count()) { await page.locator('#inpEditSave').click(); await page.waitForTimeout(700) }
  const res = { before, after: JSON.stringify(await snap(iid)), toast: await toastsSince(page, m), winStillOpen: await winCount(), reasonsAfterSave: await winCount() ? await reasons() : null, preSave: pre }
  log(key, res)
  await shot(page, 'H8-' + key + '-after')
  if (await winCount()) await page.locator('#inpEditCancel').click().catch(() => {})
  await page.waitForTimeout(250)
}
/* (a) ALL AVAIL input re-dated to two days */
const a = await fileInput(page, { type: 'Duty', people: ['Ranger'], placeholder: 'ALL AVAIL', from: '2026-07-15', to: '2026-07-15', timed: ['09:00', '12:00'] })
log('a-filed', a)
await tryIt('a-two-days', a[0].iid, async () => { await page.locator('#inpEdCal [data-cal="2026-07-15"]').click(); await page.locator('#inpEdCal [data-cal="2026-07-16"]').click() })
/* (b) its kind -> Fly with */
await tryIt('b-fly-with', a[0].iid, async () => { await page.selectOption('#inpEditType', 'Fly with') })
/* (c) shared Training -> Personal */
const c = await fileInput(page, { type: 'Training', people: ['Ranger', 'Tally'], from: '2026-07-14', to: '2026-07-14', timed: ['10:00', '11:00'] })
log('c-filed', c)
await tryIt('c-personal', c[0].iid, async () => { await page.selectOption('#inpEditType', 'Personal') })
/* (d) a second person for a medical kind: file for Ranger a medical, then pick Tally */
await page.evaluate(() => window.go('inputs'))
await page.locator('#inNew').click(); await page.locator(WIN).waitFor()
/* the medical kind first: does the window offer "Several people" at all? */
await page.selectOption('#inpEditType', 'OML'); await page.waitForTimeout(300)
await shot(page, 'H8-d1-oml-chosen')
{ const dd = await describeWin(page); log('d1-window-with-OML-first', { severalToggles: dd.buttons.filter(b => b.id === 'pp-several').length, personField: dd.fields.filter(f => f.id === 'inpEditPerson').length, reasons: await reasons() }) }
/* then the other order: two people first, then the medical kind */
await page.selectOption('#inpEditType', 'Training'); await page.waitForTimeout(250)
await page.locator(`${WIN} [data-testid="pp-several"]`).click(); await page.waitForTimeout(300)
await page.locator(`${WIN} [data-pp]`, { hasText: 'Tally' }).first().click(); await page.waitForTimeout(200)
await page.locator(`${WIN} [data-pp]`, { hasText: 'Ranger' }).first().click(); await page.waitForTimeout(200)
log('d2-two-picked-before-kind', (await describeWin(page)).picker)
await page.waitForTimeout(4000)
const m = await toastMark(page)
await page.selectOption('#inpEditType', 'OML'); await page.waitForTimeout(400)
log('d2-after-kind-OML', { picker: (await describeWin(page)).picker, toast: await toastsSince(page, m), reasons: await reasons(), typeNow: await page.locator('#inpEditType').inputValue() })
await shot(page, 'H8-d2-kind-oml-with-two')
await page.locator('#inpEdCal [data-cal="2026-07-14"]').click().catch(() => {})
const n0 = await page.evaluate(() => window.INPUTS.length)
await page.locator('#inpEditSave').click().catch(() => {}); await page.waitForTimeout(800)
log('d2-after-save', { toast: await toastsSince(page, m), win: await winCount(), nInputsBefore: n0, nInputsAfter: await page.evaluate(() => window.INPUTS.length), reasons: await winCount() ? await reasons() : null })
await shot(page, 'H8-d2-after-save')
log('errors', errs)
save('H8', out)
await browser.close()
