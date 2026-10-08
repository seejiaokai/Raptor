import * as L from './cal-F-lib2.mjs'
const b = await L.launch()
const ctx = await L.newCtx(b)
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const [ace, anvil, basher] = await L.ids(p, ['Ace', 'Anvil', 'Basher'])
const save = () => p.locator('#inpEditSave').click()
async function single(person, type, iso, iso2) {
  await L.openNew(p, iso)
  await p.selectOption('#inpEditPerson', person)
  await p.selectOption('#inpEditType', type)
  if (iso2) await L.pickDates(p, iso, iso2)
  await L.setWhen(p, { allday: true })
  const had = await L.iidSet(p)
  await L.toasts(p)
  await save(); await L.sleep(400)
  const t = await L.toasts(p)
  const nr = await L.newRows(p, had)
  console.log('single', type, iso, 'toast', JSON.stringify(t), 'new', nr.length)
  if (await p.locator('[data-testid="win-inputedit"]').count()) { await L.pic(p, 'single-' + type + '-' + iso); await p.locator('#inpEditCancel').click().catch(() => {}); await L.sleep(300) }
}
await single(ace, 'LL', '2026-07-21')
await single(ace, 'LL', '2026-07-21')   // same leave again
await single(ace, 'OL', '2026-07-21')   // another leave over it
await single(ace, 'LL', '2026-07-22', '2026-07-23')
console.log(JSON.stringify(L.errors))
await b.close()
