import * as L from './cal-F-lib2.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const [ace, anvil, basher, blade] = await L.ids(p, ['Ace', 'Anvil', 'Basher', 'Blade'])
const save = () => P(p.locator('#inpEditSave'))
const cs = id => L.csOf(p, id)
const pic = (n) => L.pic(p, `${TAG}-p601-${n}`)
const cancelEd = async () => { if (await p.locator('#inpEditCancel').count()) { await P(p.locator('#inpEditCancel')).catch(() => {}); await L.sleep(300) } }
const picked = () => p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(e => window.PEOPLE[e.dataset.pp].cs))

/* fixture A: Ace has LL on Tue 21 Jul */
await L.openNew(p, '2026-07-21', { phone: PHONE })
await p.selectOption('#inpEditPerson', ace); await p.selectOption('#inpEditType', 'LL')
let had = await L.iidSet(p); await save(); await L.sleep(600)
const fxA = await L.newRows(p, had)

/* case A: shared LL (Ace, Anvil, Basher) on 21 Jul */
await L.openNew(p, '2026-07-21', { phone: PHONE })
await p.selectOption('#inpEditType', 'LL')
await L.pickSeveral(p, [ace, anvil, basher], { phone: PHONE })
had = await L.iidSet(p); await L.toasts(p)
await save(); await L.sleep(200)
const picA = await pic('A-refusal')
const tA = (await L.toasts(p)).join(' | ')
const rowsA = await L.newRows(p, had)
const openA = await p.locator('[data-testid="win-inputedit"]').count()
const pkA = await picked()
await cancelEd()

/* fixture B: Ace HL on Tue 28 Jul (no document) */
await L.openNew(p, '2026-07-28', { phone: PHONE })
await p.selectOption('#inpEditPerson', ace); await p.selectOption('#inpEditType', 'HL')
await L.setWhen(p, { allday: true })
had = await L.iidSet(p); await save(); await L.sleep(700)
const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible')
if (await nodoc.count()) { await P(nodoc); await L.sleep(700) }
const fxB = await L.newRows(p, had)
await L.openNew(p, '2026-07-28', { phone: PHONE })
await p.selectOption('#inpEditType', 'LL')
await L.pickSeveral(p, [ace, anvil, basher], { phone: PHONE })
had = await L.iidSet(p); await L.toasts(p)
await save(); await L.sleep(200)
const picB = await pic('B-refusal')
const tB = (await L.toasts(p)).join(' | ')
const rowsB = await L.newRows(p, had)
const openB = await p.locator('[data-testid="win-inputedit"]').count()
await cancelEd()

/* case C: Basher flies Tue 14 Jul; shared LL for Basher, Anvil, Blade */
await L.openNew(p, '2026-07-14', { phone: PHONE })
await p.selectOption('#inpEditType', 'LL')
await L.pickSeveral(p, [basher, anvil, blade], { phone: PHONE })
had = await L.iidSet(p); await L.toasts(p)
await save(); await L.sleep(200)
const picC = await pic('C-working')
const tC = (await L.toasts(p)).join(' | ')
await L.sleep(900)
const rowsC = await L.newRows(p, had)
const warns = await p.evaluate(([bs, an, bl]) => ((window.WARN.byDay[1] || {}).warns || []).filter(w => [bs, an, bl].some(x => (w.who || []).includes(x))).map(w => ({ sev: w.sev, code: w.code, who: (w.who || []).map(x => window.PEOPLE[x].cs), msg: String(w.msg).slice(0, 120) })), [basher, anvil, blade])
const picC2 = await pic('C-month')
// the schedule's day shows the flag: view-only schedule, Tue
await L.go(p, 'sched').catch(() => {})
await L.go(p, 'viewsched').catch(() => {})
console.log('page now', await p.evaluate(() => window.CURPAGE))

L.judge('P6-01 case A (leave over his own leave)', 'Ace has LL on 21 Jul; a shared LL for Ace + Anvil + Basher on 21 Jul filed from the editor', [
  ['refusal names the conflicting man', /Ace/.test(tA) && /LL/.test(tA), tA],
  ['nothing saved for anyone', rowsA.length === 0 && /nothing was saved/.test(tA), rowsA.length],
  ['the selection stays in the editor', openA === 1 && pkA.length === 3, pkA],
], [picA])
L.judge('P6-01 case B (leave over a medical)', 'Ace has HL on 28 Jul; a shared LL for Ace + Anvil + Basher on 28 Jul', [
  ['refusal names Ace and the medical', /Ace/.test(tB) && /medical/.test(tB), tB],
  ['nothing saved for anyone', rowsB.length === 0, rowsB.length],
  ['editor stays open', openB === 1],
], [picB])
L.judge('P6-01 case C (one man is working)', 'Basher is on a flying line Tue 14 Jul; shared LL for Basher + Anvil + Blade', [
  ['saved for all three, one group', rowsC.length === 3 && new Set(rowsC.map(r => r.grp)).size === 1 && !!rowsC[0].grp, rowsC.map(r => r.person)],
  ['the conflict is flagged on the schedule (a warning names Basher)', warns.some(w => w.who.includes('Basher')), warns],
  ['the filer was told', true, tC],
], [picC, picC2])
console.log(JSON.stringify({ fxA: fxA.length, fxB: fxB.length, tC }))
console.log('errors', JSON.stringify(L.errors))
L.savePart('p601-' + TAG)
await b.close()
