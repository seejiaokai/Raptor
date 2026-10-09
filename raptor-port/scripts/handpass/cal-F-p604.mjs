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
const pic = n => L.pic(p, `${TAG}-p604-${n}`)
const R = {}   // results
const recs = () => p.evaluate(() => window.INPUTS.filter(r => r.remarks && /^p604/.test(r.remarks)).map(r => ({ cs: window.PEOPLE[r.person].cs, date: r.date, remarks: r.remarks, grp: r.grp, grpBy: r.grpBy ? window.PEOPLE[r.grpBy].cs : null, oil: r.oil, iid: r.iid })))
const bar = (txt) => p.locator('#inpCal .ib-bar').filter({ hasText: txt }).first()
const closeEd = async () => { for (const s of ['#inpEditCancel', '#inpEditClose']) { if (await p.locator(s + ':visible').count()) { await P(p.locator(s)).catch(() => {}); await L.sleep(300); return } } }
const edInfo = () => p.evaluate(() => {
  const e = document.getElementById('inpEditPop'); if (!e) return null
  const ids = [...e.querySelectorAll('[data-testid]')].map(x => x.dataset.testid)
  const vis = s => { const x = document.querySelector(s); return !!x && x.offsetParent !== null }
  return { ids, save: vis('#inpEditSave'), del: vis('#inpEditDel'), takeout: vis('[data-testid="inped-takeout"]'), oilOwn: vis('[data-testid="oil-revise-own"]'), oilAll: vis('[data-testid="oil-revise"]'), ro: (document.querySelector('[data-testid="inped-ro"]') || {}).innerText || '', text: e.innerText.replace(/\s+/g, ' ').slice(-380) }
})


const listDoor = async (who) => {
  await P(p.locator('#inListBtn')); await L.sleep(600)
  await p.evaluate(() => scrollTo(0, 0))
  if (await p.locator('#inRangeBtn:visible').count()) { await P(p.locator('#inRangeBtn')); await L.sleep(300); if (await p.locator('#inRangeAll:visible').count()) { await P(p.locator('#inRangeAll')); await L.sleep(500) } }
  const row = p.locator('#inBody tr[data-iid]').filter({ hasText: 'p604' }).first()
  const out = { rows: await p.locator('#inBody tr[data-iid]').filter({ hasText: 'p604' }).count() }
  out.rowText = await row.evaluate(t => t.innerText.replace(/\s+/g, ' ').slice(0, 140)).catch(() => null)
  out.btns = await row.evaluate(t => [...t.querySelectorAll('[data-edit], [data-del], .red, button')].map(e => (e.dataset.edit !== undefined ? 'edit' : e.dataset.del !== undefined ? 'del' : e.innerText.trim() || e.className).toString().slice(0, 14))).catch(() => null)
  await pic('list-' + who)
  const ed = row.locator('[data-edit]').first()
  if (await ed.count()) { await P(ed); await L.sleep(700); out.editor = await edInfo(); await pic('list-' + who + '-editor'); await closeEd() }
  await P(p.locator('#inCalBtn')); await L.sleep(600)
  return out
}

const closeDay = async () => { if (await p.locator('[data-testid="win-inputsday-x"]').count()) { await P(p.locator('[data-testid="win-inputsday-x"]')); await L.sleep(250) } }
const cdp = PHONE ? await ctx.newCDPSession(p) : null
async function dragBar(fromIso, toIso) {
  await closeDay()
  const bx = await bar('+1').boundingBox()
  const a = await L.cell(p, fromIso).boundingBox(), z = await L.cell(p, toIso).boundingBox()
  const y = Math.round(bx.y + bx.height / 2), ax = Math.round(a.x + a.width / 2), zx = Math.round(z.x + z.width / 2)
  let ghost
  if (!PHONE) {
    await p.mouse.move(ax, y); await p.mouse.down()
    await p.mouse.move(Math.round((ax + zx) / 2), y + 4, { steps: 4 })
    ghost = await p.locator('.ic-ghost').count()
    await p.mouse.move(zx, y + 6, { steps: 4 }); await p.mouse.up()
  } else {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: ax, y, id: 1 }] })
    await L.sleep(900)
    ghost = await p.locator('.ic-ghost').count()
    const n = 4
    for (let i = 1; i <= n; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(ax + (zx - ax) * i / n), y: y + 3, id: 1 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  await L.sleep(800)
  const monthAfter = (await p.locator('#inpCal .ic-mon').innerText()).trim()
  if (PHONE) await L.month(p, 2026, 7, l => l.tap())
  return { ghost, monthAfter, dates: (await recs()).map(r => [r.cs, r.date]), editorOpened: !!(await p.locator('[data-testid="win-inputedit"]').count()) }
}
/* the editor's own Delete (the phone has no Delete key): what it asks, then answer No */
async function editorDeleteAsk() {
  const d = p.locator('#inpEditDel:visible')
  if (!(await d.count())) return 'no Delete button'
  await P(d); await L.sleep(400)
  const t = await p.locator('[data-testid="inped-delall"]').innerText().catch(() => 'no ask')
  await pic('editor-delete-ask')
  await P(p.locator('[data-testid="inped-delall-no"]')).catch(() => {}); await L.sleep(300)
  return t
}

/* admin: look at the members' switch (default) */
await P(p.locator('[data-testid="in-gear"]')); await L.sleep(500)
const sw0 = await p.locator('[data-testid="iset-memberfile"]').isChecked()
await pic('gear')
await P(p.locator('[data-testid="iset-cancel"]')); await L.sleep(300)
console.log('members switch default', sw0)

/* SETUP: Ranger files a Duty on Sat 25 Jul for himself and Echo, OIL Yes */
await L.be(p, ranger, 'member')
await L.openNew(p, '2026-07-25', { phone: PHONE })
await p.selectOption('#inpEditType', 'Duty')
await L.pickSeveral(p, [ranger, echo], { phone: PHONE })
await L.setWhen(p, { allday: true, remarks: 'p604 one' })
let had = await L.iidSet(p)
await P(p.locator('#inpEditSave')); await L.sleep(500)
const ask1 = await L.answerOil(p, 'yes', { phone: PHONE })
await L.sleep(600)
const tSetup = (await L.toasts(p)).join(' | ')
const s0 = await recs()
console.log('setup', tSetup, JSON.stringify(s0.map(r => [r.cs, r.grpBy, r.oil])))
if (await p.locator('[data-testid="win-inputsday-x"]').count()) await P(p.locator('[data-testid="win-inputsday-x"]'))
await L.sleep(300)

/* ---- the FILER (Ranger): the editor, the List, the day's Delete, the bar ---- */
await P(bar('+1')); await L.sleep(700)
const edF = await edInfo()
await pic('filer-editor')
await p.locator('#inpEditRmk').fill('p604 one edited')
await P(p.locator('#inpEditSave')); await L.sleep(700)
await L.answerOil(p, null).catch(() => {})
const s1 = await recs()
R.filerEdit = s1.map(r => r.remarks)
await closeEd()
/* the List door */
const listF = await listDoor('filer')
const edFL = listF.editor
console.log('filer list', JSON.stringify({ rows: listF.rows, btns: listF.btns, rowText: listF.rowText, save: edFL && edFL.save }))
/* the day's Delete: by the keyboard on the line on a desktop (asks first), by the editor's own Delete on a phone: answer Keep */
let delAskF = null
if (!PHONE) {
  await L.openNew(p, '2026-07-25', { phone: PHONE }).catch(() => {})
  await closeEd()
  await p.locator('[data-testid="idy-open"]').first().focus()
  await p.keyboard.press('Delete'); await L.sleep(400)
  delAskF = await p.locator('[data-testid="idy-ask"]').innerText().catch(() => 'no ask')
  await pic('filer-day-delete-ask')
  await P(p.locator('[data-testid="idy-del-no"]')).catch(() => {}); await L.sleep(300)
} else {
  await closeDay(); await P(bar('+1')); await L.sleep(600)
  delAskF = await editorDeleteAsk()
  await closeEd()
}
console.log('filer delete ask:', delAskF, 'count after Keep', (await recs()).length)
/* the bar's drag: Sat 25 -> Sun 26 (a mouse drag on a desktop, a held finger on a phone) */
const dragF = await dragBar('2026-07-25', '2026-07-26')
await pic('filer-dragged')
{
  const askedDrag = await L.answerOil(p, 'yes', { phone: PHONE }); await L.sleep(600)
  dragF.oilAsked = askedDrag ? askedDrag.slice(0, 60) : null
  dragF.oilAfter = (await recs()).map(r => [r.cs, JSON.stringify(r.oil)])
  dragF.editorOpenAfter = !!(await p.locator('[data-testid="win-inputedit"]').count())
  await closeEd()
}
console.log('filer drag', JSON.stringify(dragF))

/* ---- the INCLUDED NON-FILER (Echo) ---- */
await L.be(p, echo, 'member')
await p.evaluate(() => scrollTo(0, 0))
await P(bar('+1')); await L.sleep(700)
const edE = await edInfo()
await pic('echo-editor')
const echoDelAsk = null
await P(p.locator('[data-testid="oil-revise-own"]')); await L.sleep(500)
await L.answerOil(p, 'no', { phone: PHONE }); await L.sleep(600)
const sE1 = await recs()
await closeEd()
let delAskE = null
if (!PHONE) {
  await L.openNew(p, '2026-07-26', { phone: PHONE }).catch(() => {}); await closeEd()
  await p.locator('[data-testid="idy-open"]').first().focus()
  await p.keyboard.press('Delete'); await L.sleep(400)
  delAskE = await p.locator('[data-testid="idy-ask"]').innerText().catch(() => 'no ask')
  await pic('echo-day-delete-ask')
  await P(p.locator('[data-testid="idy-del-no"]')).catch(() => {}); await L.sleep(300)
} else {
  delAskE = 'phone: no Delete in the editor'
}
const dragE = await dragBar('2026-07-26', '2026-07-27')
await pic('echo-drag-attempt')
await closeEd()
const listE = await listDoor('echo')
console.log('echo list', JSON.stringify({ rows: listE.rows, btns: listE.btns, save: listE.editor && listE.editor.save, takeout: listE.editor && listE.editor.takeout }))
console.log('echo', JSON.stringify({ edE, delAskE, dragE, oil: sE1.map(r => [r.cs, r.oil]) }))

/* ---- the STRANGER (Cutter) ---- */
await L.be(p, cutter, 'member')
await P(bar('+1')); await L.sleep(700)
const edC = await edInfo()
await pic('stranger-editor')
await closeEd()
let delAskC = null
let nC = 0
if (!PHONE) {
  await L.openNew(p, '2026-07-26', { phone: PHONE }).catch(() => {}); await closeEd()
  await p.locator('[data-testid="idy-open"]').first().focus()
  await L.toasts(p)
  await p.keyboard.press('Delete'); await L.sleep(400)
  delAskC = await p.locator('[data-testid="idy-ask"]').innerText().catch(() => 'no ask')
  const toastC = (await L.toasts(p)).join(' | ')
  delAskC += ' // toast: ' + toastC
  await pic('stranger-day-delete')
  await p.locator('[data-testid="idy-del-no"]').click().catch(() => {}); await L.sleep(300)
} else {
  delAskC = 'phone: ' + (edC && edC.del ? 'a Delete is offered (!)' : 'no Delete in the editor')
}
nC = (await recs()).length
const dragC = await dragBar('2026-07-26', '2026-07-27')
await pic('stranger-drag-attempt')
await closeEd()
const listC = await listDoor('stranger')
console.log('stranger list', JSON.stringify({ rows: listC.rows, btns: listC.btns, save: listC.editor && listC.editor.save, takeout: listC.editor && listC.editor.takeout }))
console.log('stranger', JSON.stringify({ edC, delAskC, dragC }))

/* ---- Saber (admin): changes the whole ---- */
await L.be(p, saber, 'admin')
await P(bar('+1')); await L.sleep(700)
const edA = await edInfo()
await pic('admin-editor')
await p.locator('#inpEditRmk').fill('p604 one by admin')
await P(p.locator('#inpEditSave')); await L.sleep(700)
await L.answerOil(p, null).catch(() => {})
const sA = await recs()
await closeEd()

/* ---- Echo takes himself out: Ranger's record remains ---- */
await L.be(p, echo, 'member')
await P(bar('p604')).catch(() => {}); await L.sleep(500)
await closeEd()
await P(bar('+1')).catch(() => {}); await L.sleep(700)
await P(p.locator('[data-testid="inped-takeout"]')); await L.sleep(400)
const askTO = await p.locator('[data-testid="inped-takeout-ask"]').innerText().catch(() => 'no ask')
await pic('echo-takeout-ask')
await P(p.locator('[data-testid="inped-takeout-yes"]')); await L.sleep(800)
const sT = await recs()
console.log('after take me out', JSON.stringify(sT.map(r => [r.cs, r.grp, r.grpBy])), askTO)
await pic('after-takeout')

const yesNo = (c, name) => [name, c]
L.judge('P6-04', 'Ranger files a Duty (Sat 25 Jul) for himself and Echo; then as Ranger (filer), Echo (included), Cutter (stranger) and Saber (admin) through the editor, the List, the day line’s Delete and the bar’s drag; then Echo takes himself out', [
  ['FILER: editor can Save and carries Delete; remarks change reached both records', edF && edF.save && edF.del && R.filerEdit.length === 2 && R.filerEdit.every(x => x === 'p604 one edited'), { edF: edF && { save: edF.save, del: edF.del }, rem: R.filerEdit }],
    ['FILER: the Delete asks "for all 2 people?"', /all 2 people/.test(delAskF || ''), delAskF],
  ['FILER: the bar moves both records, one command (mouse drag / held finger)', !!dragF && dragF.ghost > 0 && dragF.dates.length === 2 && dragF.dates.every(d => d[1] === 'Jul 26'), dragF],
  ['INCLUDED NON-FILER: reads the whole (no Save, no Delete), has Take me out and his own OIL', !!edE && !edE.save && !edE.del && edE.takeout && edE.oilOwn, edE && { save: edE.save, del: edE.del, takeout: edE.takeout, oilOwn: edE.oilOwn }],
  ['Echo’s own OIL answer changed only his record', (() => { const e = sE1.find(r => r.cs === 'Echo'), r = sE1.find(r => r.cs === 'Ranger'); return e && r && JSON.stringify(e.oil) !== JSON.stringify(r.oil) })(), sE1.map(r => [r.cs, r.oil])],
  ['INCLUDED NON-FILER: the day’s Delete says "Take yourself out" (desktop key); on a phone the editor offers no Delete', PHONE ? !edE.del : /Take yourself out/.test(delAskE || ''), delAskE],
  ['INCLUDED NON-FILER: the bar does not lift (no ghost, dates unchanged)', !!dragE && dragE.ghost === 0 && dragE.dates.every(d => d[1] === 'Jul 26'), dragE],
  ['STRANGER: reads only — no Save, no Delete, no Take me out, no OIL change; the sentence says who can change it', !!edC && !edC.save && !edC.del && !edC.takeout && !edC.oilOwn && /Only its people, Ranger/.test(edC.ro + edC.text), edC && { save: edC.save, takeout: edC.takeout, ro: edC.ro }],
  ['STRANGER: the day’s Delete does not delete (tells who can); on a phone no Delete is offered', PHONE ? !edC.del : (!/Take yourself out|for all 2 people/.test(delAskC || '') && nC === 2 && /Only Ranger/.test(delAskC || '')), { delAskC, nC }],
  ['STRANGER: the bar does not lift', !!dragC && dragC.ghost === 0 && dragC.dates.every(d => d[1] === 'Jul 26'), dragC],
  ['ADMIN: editor Save/Delete present and the change reached both', !!edA && edA.save && edA.del && sA.length === 2 && sA.every(r => r.remarks === 'p604 one by admin'), sA.map(r => r.remarks)],
  ['LIST door as each: filer opens the editable window; Echo opens the read-only one with Take me out; Cutter reads only', !!edFL && edFL.save && !!listE.editor && !listE.editor.save && listE.editor.takeout && !!listC.editor && !listC.editor.save && !listC.editor.takeout, { filer: edFL && edFL.save, echo: listE.editor && { save: listE.editor.save, takeout: listE.editor.takeout }, cutter: listC.editor && { save: listC.editor.save, takeout: listC.editor.takeout } }],
  ['TAKE ME OUT removed only Echo; Ranger’s record remains', sT.length === 1 && sT[0].cs === 'Ranger', sT.map(r => r.cs)],
], [])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p604-' + TAG)
await b.close()
