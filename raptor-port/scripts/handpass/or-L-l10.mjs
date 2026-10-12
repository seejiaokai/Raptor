import { open, fileInput, toWeek, shot, saveRes, errs, browser, toast, inputsOf, become, bellRead, deleteUser, weekRows } from './or-L-lib.mjs'
const R = {}
const { ctx, page } = await open('ad', 'a')
await become(page, 'Ranger', 'member')
R.filed = await fileInput(page, { type: 'Training', people: ['Hex', 'Hunter'], from: '2026-07-15', to: '2026-07-15', timed: ['10:00', '11:00'], title: 'L10 training' })
R.filedBy = R.filed[0]?.by
await become(page, 'Saber', 'admin')
R.del = await deleteUser(page, 'Hunter')
await shot(page, 'l10-1-after-delete')
R.inputs = (await inputsOf(page, 'L10 training')).map(r => ({ people: r.people, by: r.by }))
await toWeek(page)
R.weekRow = await weekRows(page, 2, 'L10 training')
for (const [cs] of [['Ranger'], ['Hex']]) { await become(page, cs, 'member'); R['bell_' + cs] = await bellRead(page, `l10-bell-${cs}`) }
await become(page, 'Saber', 'admin')
R.bell_Saber = await bellRead(page, 'l10-bell-Saber')
saveRes('L10', R)
console.log(JSON.stringify(R, null, 1))
console.log('ERRS', errs.join('\n'))
await browser.close()
