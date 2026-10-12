import { launch, open, fileInput, openFromList, describeWin, shot, WIN, toastMark, toastsSince, save, errs, as, badgeText } from './or-H-lib.mjs'
const out = {}
const log = (k, v) => { out[k] = v; console.log('## ' + k + ' ' + JSON.stringify(v)) }
const browser = await launch()
const { ctx, page } = await open(browser)
await as(page, 'Saber')
const r = await fileInput(page, { type: 'Training', person: 'Tally', from: '2026-07-15', to: '2026-07-15', timed: ['10:00', '11:00'], title: 'Tally solo' })
const iid = r[0].iid
log('filed', r)
const reasonLines = () => page.locator(WIN).evaluate(w => [...w.querySelectorAll('*')].filter(e => e.children.length === 0 && e.getClientRects().length && /ALL AVAIL is|one day|is for|one person|Personal input|medical|only|can't|cannot|not offered/i.test(e.textContent)).map(e => e.textContent.trim().slice(0, 150)))
async function read(tag) {
  await openFromList(page, iid)
  const d = await describeWin(page)
  const dom = await page.evaluate(sel => ['inpEditType', 'inpEditOwnTitle', 'inpEditStart', 'inpEditEnd', 'inpEditRmk', 'inpEditPerson'].map(id => { const e = document.querySelector(sel + ' #' + id); return e ? id + ':' + e.tagName.toLowerCase() : null }).filter(Boolean), WIN)
  const res = { badge: await badgeText(page), textTail: d.text.slice(-300), buttons: d.buttons.map(b => b.id + ':' + b.text).filter(t => t.length > 4), save: await page.locator('#inpEditSave').count(), del: await page.locator('#inpEditDel').count(), takeout: await page.locator('[data-testid="inped-takeout"]').count(), pickerToggles: await page.locator(`${WIN} [data-testid="pp-several"]`).count(), pickerPucks: d.picker.n, reasonLines: await reasonLines(), domControls: dom }
  log(tag, res)
  await shot(page, 'H12-' + tag)
  const tl = page.locator('#inpEditOwnTitle'); const tv = await tl.inputValue().catch(() => null)
  await tl.click({ force: true }).catch(() => {}); await page.keyboard.type('ZZ')
  log(tag + '-typed', { before: tv, after: await tl.inputValue().catch(() => null) })
  await page.locator(`${WIN} #inpEditCancel`).click().catch(() => {}); await page.waitForTimeout(300)
}
/* Saber in the member view: the name badge */
await page.locator('#roleBadge').click(); await page.waitForTimeout(500)
log('badge-after-tap', await badgeText(page))
await shot(page, 'H12-0-member-view')
await read('saber-member-view')
await page.locator('#roleBadge').click(); await page.waitForTimeout(500)
log('badge-back', await badgeText(page))
/* a member opening someone else's one-person input */
await as(page, 'Ranger')
await read('ranger-member')
log('errors', errs)
save('H12', out)
await browser.close()
