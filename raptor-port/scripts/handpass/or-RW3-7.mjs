import { open, fileInput, shot, saveRes, errs, browser, csId, toast, lwStagePublished, become, bellRead, leaveInputs, sleep } from './or-RW3-lib.mjs'
const R = {}
async function setup() {
  const { ctx, page } = await open('ad', 'a')
  const filed = await fileInput(page, { type: 'LL', people: ['Drifter', 'Hex', 'Hunter'], from: '2026-07-13', to: '2026-07-17' })
  await lwStagePublished(page)
  return { ctx, page, filed }
}
async function typeRemark(page) {
  const hex = await csId(page, 'Hex')
  await page.locator('[data-testid="month-JUL"]').click(); await sleep(900)
  const cell = page.locator(`[data-testid="cell-${hex}-2026-07-15"]`).first()
  await cell.scrollIntoViewIfNeeded(); await cell.click(); await sleep(600)
  await page.locator('[data-testid="remarks-field"]').fill('Dental')
  await page.locator('[data-testid="remarks-save"]').click(); await sleep(900)
}
const compact = b => ({ lit: b.state?.lit, lines: (b.list?.lines || []).map(l => `${l.unread ? '[unread] ' : '[read] '}${l.name} ${l.day} — ${l.what} (${l.ago})`), empty: b.list?.empty })
/* world 1: bells read AFTER the remark is typed (nothing opened before) */
{
  const { ctx, page } = await setup()
  await typeRemark(page)
  R.inputs = await leaveInputs(page).then(a => a.filter(r => /Drifter|Hunter|Hex/.test(r.people.join())))
  R.after = {}
  for (const [cs, role] of [['Hex', 'member'], ['Drifter', 'member'], ['Hunter', 'member'], ['Saber', 'admin']]) {
    await become(page, cs, role)
    const b = await bellRead(page, `rw3-7-1-after-${cs}`)
    R.after[cs] = compact(b)
  }
  await ctx.close()
}
/* world 2: bells read BEFORE the remark, then AFTER it (what the remark added) */
{
  const { ctx, page } = await setup()
  R.before = {}
  for (const [cs, role] of [['Hex', 'member'], ['Drifter', 'member'], ['Hunter', 'member']]) {
    await become(page, cs, role)
    const b = await bellRead(page, `rw3-7-2-before-${cs}`)
    R.before[cs] = compact(b)
  }
  await become(page, 'Saber', 'admin')
  await typeRemark(page)
  R.afterW2 = {}
  for (const [cs, role] of [['Hex', 'member'], ['Drifter', 'member'], ['Hunter', 'member']]) {
    await become(page, cs, role)
    const b = await bellRead(page, `rw3-7-3-after-${cs}`)
    R.afterW2[cs] = compact(b)
  }
  await ctx.close()
}
saveRes('RW3-7', R)
console.log(JSON.stringify(R, null, 1))
console.log('ERRS', errs.join('\n'))
await browser.close()
