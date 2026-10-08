import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const [ranger, echo, cutter, saber] = await L.ids(p, ['Ranger', 'Echo', 'Cutter', 'Saber'])
const pic = n => L.pic(p, `${TAG}-p610-${n}`)
const recs = () => p.evaluate(() => window.INPUTS.filter(r => r.remarks && /^p610/.test(r.remarks)).map(r => ({ cs: window.PEOPLE[r.person].cs, remarks: r.remarks, grp: r.grp, grpBy: r.grpBy ? window.PEOPLE[r.grpBy].cs : null, by: r.by ? window.PEOPLE[r.by].cs : null, date: r.date })).sort((a, b) => a.cs.localeCompare(b.cs)))
const bar = () => p.locator('#inpCal .ib-bar').filter({ hasText: /\+[0-9]|p610|Meeting/ }).first()
const edInfo = () => p.evaluate(() => { const vis = s => { const x = document.querySelector(s); return !!x && x.offsetParent !== null }; const e = document.getElementById('inpEditPop'); if (!e) return null; return { save: vis('#inpEditSave'), del: vis('#inpEditDel'), takeout: vis('[data-testid="inped-takeout"]'), ro: (document.querySelector('[data-testid="inped-ro"]') || {}).innerText || '', title: (document.querySelector('[data-testid="win-inputedit"] .win-ttl') || {}).innerText, picked: [...e.querySelectorAll('[data-pp][aria-pressed="true"]')].map(x => window.PEOPLE[x.dataset.pp].cs) } })
const closeEd = async () => { for (const s of ['#inpEditCancel', '#inpEditClose']) { if (await p.locator(s + ':visible').count()) { await P(p.locator(s)).catch(() => {}); await L.sleep(300); return } } }
const closeDay = async () => { if (await p.locator('[data-testid="win-inputsday-x"]').count()) { await P(p.locator('[data-testid="win-inputsday-x"]')); await L.sleep(250) } }
const open = async () => { await closeDay(); await P(bar()); await L.sleep(700) }

/* 1. Ranger files Meeting for himself and Echo */
await L.be(p, ranger, 'member')
await L.openNew(p, '2026-08-07', { phone: PHONE })
await p.selectOption('#inpEditType', 'Meeting')
await L.pickSeveral(p, [ranger, echo], { phone: PHONE })
await L.setWhen(p, { allday: true, remarks: 'p610 one' })
await P(p.locator('#inpEditSave')); await L.sleep(700)
const s1 = await recs()
/* 2. Saber adds Cutter */
await L.be(p, saber, 'admin')
await open()
await L.pickSeveral(p, [ranger, echo, cutter], { phone: PHONE })
await P(p.locator('#inpEditSave')); await L.sleep(700)
const s2 = await recs()
await pic('after-admin-adds')
await closeEd()
/* 3. Ranger takes himself out (unpicks himself) */
await L.be(p, ranger, 'member')
await open()
const ed3 = await edInfo()
await L.pickSeveral(p, [echo, cutter], { phone: PHONE })
await pic('ranger-unpicks-himself')
await L.toasts(p)
await P(p.locator('#inpEditSave')); await L.sleep(700)
const t3 = (await L.toasts(p)).join(' | ')
const s3 = await recs()
await closeEd()
console.log('step3', t3, JSON.stringify(s3))
/* 4. Ranger, no longer in it, tries a whole-entry edit */
await open()
const ed4 = await edInfo()
await pic('ranger-not-a-subject-opens')
let t4 = '', s4 = null
if (ed4 && ed4.save) {
  await p.locator('#inpEditRmk').fill('p610 two')
  await L.toasts(p)
  await P(p.locator('#inpEditSave')); await L.sleep(700)
  t4 = (await L.toasts(p)).join(' | ')
  s4 = await recs()
}
await closeEd()
/* 5. subjects' limited actions (Echo, Cutter) and the admin */
await L.be(p, echo, 'member'); await open(); const edE = await edInfo(); await closeEd()
await L.be(p, cutter, 'member'); await open(); const edC = await edInfo(); await pic('cutter-added-by-admin'); await closeEd()
await L.be(p, saber, 'admin'); await open(); const edA = await edInfo(); await closeEd()
const s5 = await recs()
console.log(JSON.stringify({ s1, s2, ed3, ed4, t4, s4, edE, edC, edA }, null, 1))

const filer = r => r.grpBy
L.judge('P6-10', 'Ranger files for himself + Echo; Saber adds Cutter; Ranger takes himself out of it; Ranger (no longer a subject) tries a whole-entry edit while member filing is on', [
  ['the first filing: filer is Ranger on both records', s1.length === 2 && s1.every(r => r.grpBy === 'Ranger'), s1.map(r => [r.cs, r.grpBy, r.by])],
  ['Saber’s addition did not take the entry: all three records still say Ranger filed it', s2.length === 3 && s2.every(r => r.grpBy === 'Ranger'), s2.map(r => [r.cs, r.grpBy, r.by])],
  ['Ranger could take himself out (the entry is now Echo + Cutter), filer still Ranger', s3.length === 2 && s3.every(r => r.grpBy === 'Ranger') && !s3.some(r => r.cs === 'Ranger'), { toast: t3, rows: s3.map(r => [r.cs, r.grpBy]) }],
  ['Ranger, no longer a subject, still opens the entry with its Save (the original filer’s authority remains)', !!ed4 && ed4.save, ed4],
  ['his whole-entry edit went through for both men', !!s4 && s4.length === 2 && s4.every(r => r.remarks === 'p610 two'), { t4, s4: s4 && s4.map(r => [r.cs, r.remarks]) }],
  ['Echo (subject): read-only with Take me out; Cutter (added by Saber): the same, not the admin’s rights', !!edE && !edE.save && edE.takeout && !!edC && !edC.save && edC.takeout, { edE: edE && { save: edE.save, takeout: edE.takeout }, edC: edC && { save: edC.save, takeout: edC.takeout } }],
  ['Saber (admin) still has Save and Delete', !!edA && edA.save && edA.del, edA && { save: edA.save, del: edA.del }],
], [])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p610-' + TAG)
await b.close()
