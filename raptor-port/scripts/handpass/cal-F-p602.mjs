import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const [ace, anvil, basher, cinder, saber] = await L.ids(p, ['Ace', 'Anvil', 'Basher', 'Cinder', 'Saber'])
const pic = n => L.pic(p, `${TAG}-p602-${n}`)
const oilCount = () => p.locator('[data-testid="oilconf"]').count()

/* the three, before */
const lw0 = await L.lwCells(p, [ace, anvil, basher, cinder], '2026-07-18')
const lw0b = await L.lwCells(p, [cinder], '2026-07-25')
const tr0 = await L.oilRows(p, [ace, anvil, basher, cinder]); await L.closeOil(p)
await L.go(p, 'inputs')

/* single control: Cinder on Sat 25 Jul, a duty, all day, answered Yes */
await L.openNew(p, '2026-07-25', { phone: PHONE })
await p.selectOption('#inpEditPerson', cinder); await p.selectOption('#inpEditType', 'Duty')
await L.setWhen(p, { allday: true })
let had = await L.iidSet(p)
await P(p.locator('#inpEditSave'))
const askedS = await L.answerOil(p, 'yes', { phone: PHONE })
await L.sleep(500)
const single = (await L.newRows(p, had))[0]

/* the shared filing, Sat 18 Jul, three people */
await L.openNew(p, '2026-07-18', { phone: PHONE })
await p.selectOption('#inpEditType', 'Duty')
await L.pickSeveral(p, [ace, anvil, basher], { phone: PHONE })
await L.setWhen(p, { allday: true, remarks: 'group duty' })
had = await L.iidSet(p)
await P(p.locator('#inpEditSave'))
await L.sleep(500)
const pQ = await pic('oil-question')
const nQ = await oilCount()
const asked = await L.answerOil(p, 'yes', { phone: PHONE })
const nAfterAnswer = await oilCount()
await L.sleep(500)
const rows = await L.newRows(p, had)
const pDone = await pic('after-save')

/* each person's own: bell, editor line */
const per = {}
for (const [nm, id] of [['Ace', ace], ['Anvil', anvil], ['Basher', basher], ['Saber', saber]]) {
  await L.be(p, id, nm === 'Saber' ? 'admin' : 'member')
  const bell = await L.bellState(p)
  await P(p.locator('#notifyBell')); await L.sleep(300)
  const t = (await L.toasts(p)).join(' | ')
  let ownLine = null
  if (nm !== 'Saber') {
    if (await p.locator('[data-testid="win-inputsday-x"]').count()) { await P(p.locator('[data-testid="win-inputsday-x"]')); await L.sleep(250) }
    await P(p.locator('#inpCal .ib-bar').filter({ hasText: '+2' }).first()); await L.sleep(600)
    ownLine = await p.evaluate(() => { const e = document.getElementById('inpEditPop'); const m = e && e.innerText.match(/Your OIL:[^\n]*/); return m ? m[0] : (e ? 'editor up, no "Your OIL" line' : 'no editor') })
    if (nm === 'Anvil') await pic('anvil-editor')
    await P(p.locator('#inpEditCancel')).catch(() => {}); await P(p.locator('#inpEditClose')).catch(() => {}); await L.sleep(300)
  }
  per[nm] = { bell, t, ownLine }
}
await L.be(p, saber, 'admin')
const lw1 = await L.lwCells(p, [ace, anvil, basher, cinder], '2026-07-18')
const lw1b = await L.lwCells(p, [cinder], '2026-07-25')
const pLW = await pic('leavewar-18jul')
const tr1 = await L.oilRows(p, [ace, anvil, basher, cinder])
const pTR = await pic('oil-tracker')
await L.closeOil(p)
console.log(JSON.stringify({ lw0, lw0b, tr0, askedS, single: single && single.oil, lw1, lw1b, tr1 }, null, 1))
console.log(JSON.stringify(per))

const ids3 = [ace, anvil, basher]
L.judge('P6-02', 'Saber files an all-day Duty for Ace, Anvil, Basher on Sat 18 Jul, answers the OIL question Yes once; then each man read as himself, the Leave War cell and the OIL tracker', [
  ['one question was asked (once) and is gone after the answer', nQ === 1 && nAfterAnswer === 0 && !!asked, { nQ, nAfterAnswer }],
  ['three records, one group', rows.length === 3 && new Set(rows.map(r => r.grp)).size === 1, rows.map(r => r.person)],
  ['each record carries his own full-day claim (one day, value 1), not a combined 3', rows.every(r => r.oil && Object.keys(r.oil).length === 1 && r.oil['2026-07-18'] === 1), rows.map(r => r.oil)],
  ['each man’s bell is not lit with a question for him (Ace, Anvil, Basher)', ['Ace', 'Anvil', 'Basher'].every(n => per[n].bell && !per[n].bell.on), ['Ace', 'Anvil', 'Basher'].map(n => per[n].bell)],
  ['each man’s editor line reads his own answer', ['Ace', 'Anvil', 'Basher'].every(n => /Your OIL: credited/.test(per[n].ownLine || '')), ['Ace', 'Anvil', 'Basher'].map(n => per[n].ownLine)],
  ['no credit has landed yet for any of the three (Leave War cell blank, tracker balance as before) � the same as for the single filing (Cinder, 25 Jul)', ['Ace', 'Anvil', 'Basher'].every(n => lw1[n].text === '' && tr1[n].bal === tr0[n].bal) && lw1b.Cinder.text === '' && tr1.Cinder.bal === tr0.Cinder.bal, { lw1, lw1b, bal0: Object.fromEntries(Object.entries(tr0).map(([k, v]) => [k, v.bal])), bal1: Object.fromEntries(Object.entries(tr1).map(([k, v]) => [k, v.bal])) }],
], [pQ, pDone, pLW, pTR])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p602-' + TAG)
await b.close()
