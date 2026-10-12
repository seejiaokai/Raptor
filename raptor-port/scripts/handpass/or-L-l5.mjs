import { open, fileInput, toWeek, shot, saveRes, errs, browser, toast, inputsOf, signOut, signIn, become, bellRead, toMonth, openDay, dayCardText, closeDay, undoRedo, barText, listText, sheets } from './or-L-lib.mjs'
const R = {}
const { ctx, page } = await open('ad', 'a')
R.filedLL = await fileInput(page, { type: 'LL', people: ['Ranger', 'Hex', 'Hunter'], from: '2026-07-13', to: '2026-07-17' })
await signOut(page); await signIn(page, 'us', 'us')
const sheetLog = []
page.on('framenavigated', () => {})
R.filedMed = await fileInput(page, { type: 'ATT C', from: '2026-07-15', to: '2026-07-16' })
R.toastAfterFile = await toast(page)
const leaves = async () => (await inputsOf(page)).filter(r => /^(LL|ATT C)$/.test(r.type) && (r.people.some(x => /Ranger|Hex|Hunter/.test(x)) || /Ranger|Hex|Hunter/.test(r.person || '')))
const read = async tag => {
  const o = {}
  o.inputs = await leaves()
  await toMonth(page)
  o.bars = {}
  for (const d of ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17']) o.bars[d] = await barText(page, d)
  await openDay(page, '2026-07-15'); o.cardWed = await dayCardText(page); await shot(page, `l5-${tag}-wed-card`); await closeDay(page)
  await openDay(page, '2026-07-13'); o.cardMon = await dayCardText(page); await closeDay(page)
  return o
}
R.afterFile = await read('1-after-file')
await shot(page, 'l5-1b-month')
/* bells right after the filing, in place, BEFORE any Undo */
R.bells0 = {}
for (const [cs, role] of [['Hex', 'member'], ['Hunter', 'member'], ['Saber', 'admin']]) { await become(page, cs, role); R.bells0[cs] = await bellRead(page, `l5-bell0-${cs}`) }
await become(page, 'Ranger', 'member')
R.undo = await undoRedo(page, 'undo')
R.afterUndo = await read('2-after-undo')
R.bellsU = {}
for (const [cs, role] of [['Hex', 'member'], ['Saber', 'admin']]) { await become(page, cs, role); R.bellsU[cs] = await bellRead(page, `l5-bellU-${cs}`) }
await become(page, 'Ranger', 'member')
R.redo = await undoRedo(page, 'redo')
R.afterRedo = await read('3-after-redo')
saveRes('L5', R)
console.log(JSON.stringify(R, null, 1))
console.log('ERRS', errs.join('\n'))
await browser.close()
