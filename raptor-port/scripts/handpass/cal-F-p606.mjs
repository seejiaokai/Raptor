import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const [ranger, echo, cutter, saber, ace, anvil, basher, bolt, jester] = await L.ids(p, ['Ranger', 'Echo', 'Cutter', 'Saber', 'Ace', 'Anvil', 'Basher', 'Bolt', 'Jester'])
const pic = n => L.pic(p, `${TAG}-p606-${n}`)
const picked = () => p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(e => window.PEOPLE[e.dataset.pp].cs))
const why = () => p.evaluate(() => ({ why: (document.querySelector('#inpEditPop [data-testid="pp-why"]') || {}).innerText || null, fix: (document.querySelector('#inpEditPop [data-testid="pp-fix"]') || {}).innerText || null }))
const closeEd = async () => { for (const s of ['#inpEditCancel', '#inpEditClose']) { if (await p.locator(s + ':visible').count()) { await P(p.locator(s)).catch(() => {}); await L.sleep(300); return } } }
const A = {}   // collected

/* ---- A: Ranger, a Duty for three; change the kind ---- */
await L.be(p, ranger, 'member')
await L.openNew(p, '2026-08-10', { phone: PHONE })
await p.selectOption('#inpEditType', 'Duty')
await L.pickSeveral(p, [ranger, echo, cutter], { phone: PHONE })
A.types = await p.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.textContent))
A.sansOffered = A.types.some(t => /SANS/i.test(t))
for (const t of ['LL', 'HL', 'Upchit']) {
  await p.selectOption('#inpEditType', t); await L.sleep(300)
  const had = await L.iidSet(p)
  A[t] = { picked: await picked(), ...(await why()) }
  await L.toasts(p)
  await P(p.locator('#inpEditSave')); await L.sleep(350)
  A[t].toast = (await L.toasts(p)).join(' | ')
  A[t].saved = (await L.newRows(p, had)).length
  A[t].pickedAfter = await picked()
  A[t].open = (await p.locator('[data-testid="win-inputedit"]').count()) === 1
  A[t].pic = await pic('ranger-' + t.toLowerCase())
}
/* the correcting press, for LL */
await p.selectOption('#inpEditType', 'LL'); await L.sleep(300)
const fixBtn = p.locator('#inpEditPop [data-testid="pp-fix"]')
if (await fixBtn.count()) { await P(fixBtn); await L.sleep(300) }
A.afterFix = await picked()
A.afterFixWhy = await why()
await pic('ranger-ll-after-fix')
await closeEd()

/* ---- B: Ranger, the List's Add form ---- */
await P(p.locator('#inListBtn')); await L.sleep(600)
await p.evaluate(() => scrollTo(0, 0))
await p.selectOption('#inType', 'Duty'); await L.sleep(300)
const listSw = p.locator('[data-testid="pp-several"]:visible').first()
A.listHasSwitch = (await listSw.count()) > 0
if (A.listHasSwitch) {
  await P(listSw); await L.sleep(300)
  const lp = id => p.locator(`[data-pp="${id}"]:visible`).first()
  for (const id of [echo, cutter]) { await lp(id).scrollIntoViewIfNeeded(); await P(lp(id)); await L.sleep(100) }
  await p.selectOption('#inType', 'LL'); await L.sleep(300)
  A.listPicked = await p.evaluate(() => [...document.querySelectorAll('#intbl [data-pp][aria-pressed="true"], [data-pp][aria-pressed="true"]')].filter(e => e.offsetParent !== null).map(e => window.PEOPLE[e.dataset.pp].cs))
  A.listWhy = await p.evaluate(() => ({ why: [...document.querySelectorAll('[data-testid="pp-why"]')].filter(e => e.offsetParent !== null).map(e => e.innerText).join(' / ') }))
  await P(p.locator('#inCal [data-cal="2026-07-22"]').first()); await L.sleep(200)
  const had = await L.iidSet(p)
  await L.toasts(p)
  await P(p.locator('#inAdd')); await L.sleep(400)
  A.listToast = (await L.toasts(p)).join(' | ')
  A.listSaved = (await L.newRows(p, had)).length
  A.listPic = await pic('list-add-ll-refused')
}
await P(p.locator('#inCalBtn')).catch(() => {}); await L.sleep(500)

/* ---- C: Saber, group medical ---- */
await L.be(p, saber, 'admin')
await L.openNew(p, '2026-08-10', { phone: PHONE })
await p.selectOption('#inpEditType', 'Duty')
await L.pickSeveral(p, [ace, anvil, basher], { phone: PHONE })
for (const t of ['HL', 'Upchit']) {
  await p.selectOption('#inpEditType', t); await L.sleep(300)
  const had = await L.iidSet(p)
  A['adm' + t] = { picked: await picked(), ...(await why()) }
  await L.toasts(p)
  await P(p.locator('#inpEditSave')); await L.sleep(400)
  const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible')
  A['adm' + t].docAsk = (await nodoc.count()) > 0
  if (A['adm' + t].docAsk) { await pic('admin-' + t + '-docask'); await P(nodoc); await L.sleep(500) }
  A['adm' + t].toast = (await L.toasts(p)).join(' | ')
  A['adm' + t].saved = (await L.newRows(p, had)).length
  A['adm' + t].pickedAfter = await picked()
  A['adm' + t].pic = await pic('admin-' + t.toLowerCase())
}
await closeEd()

/* ---- D: SANS tab: an admin's "+ Commitment" for several SANS men ---- */
await P(p.locator('[role=tab]:has-text("SANS")').first()); await L.sleep(800)
await P(p.locator('[data-testid="sc-day-2026-08-11"]')).catch(async () => { await p.locator('[data-testid="sc-day-2026-08-11"]').click({ position: { x: 8, y: 8 } }) })
await L.sleep(600)
await P(p.locator('[data-testid="sd-add"]')); await L.sleep(700)
A.sansEditor = await p.evaluate(() => { const e = document.getElementById('inpEditPop'); return e ? { types: [...e.querySelectorAll('#inpEditType option')].map(o => o.textContent), groups: [...e.querySelectorAll('[data-ppgroup]')].map(g => g.dataset.ppgroup), sw: !!e.querySelector('[data-testid="pp-several"]'), title: (document.querySelector('[data-testid="win-inputedit"] .win-ttl') || {}).innerText } : null })
await pic('sans-editor')
if (A.sansEditor && A.sansEditor.sw) {
  await L.pickSeveral(p, [bolt, jester], { phone: PHONE })
  A.sansPicked = await picked()
  A.sansType0 = await p.evaluate(() => document.querySelector('#inpEditType') ? document.querySelector('#inpEditType').value : null)
  await pic('sans-several')
  for (const t of ['HL', 'LL']) {
    const o = await p.evaluate(tt => [...document.querySelectorAll('#inpEditType option')].some(x => x.textContent === tt), t)
    if (!o) { A['sans' + t] = 'type not offered'; continue }
    await p.selectOption('#inpEditType', t); await L.sleep(300)
    const had = await L.iidSet(p)
    A['sans' + t] = { picked: await picked(), ...(await why()) }
    await L.toasts(p)
    await P(p.locator('#inpEditSave')); await L.sleep(500)
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible')
    if (await nodoc.count()) { A['sans' + t].docAsk = true; await pic('sans-' + t + '-docask'); await P(nodoc); await L.sleep(500) }
    A['sans' + t].toast = (await L.toasts(p)).join(' | ')
    A['sans' + t].saved = (await L.newRows(p, had)).length
    A['sans' + t].pickedAfter = await picked()
    A['sans' + t].pic = await pic('sans-' + t.toLowerCase())
  }
}
/* a shared SANS commitment (Bolt + Jester) filed, then opened: which kinds does ITS editor offer? */
await P(p.locator('#inpEditSave')); await L.sleep(700)
const sansRows = await p.evaluate(() => window.INPUTS.filter(r => r.type === 'SANS Availability' && r.date === 'Aug 11').map(r => ({ cs: window.PEOPLE[r.person].cs, grp: r.grp })))
A.sansSharedRows = sansRows
await P(p.locator('[data-testid="sc-day-2026-08-11"]')).catch(() => {}); await L.sleep(500)
if (!(await p.locator('[data-testid="sd-open"]').count())) { await p.locator('[data-testid="sc-day-2026-08-11"]').click({ position: { x: 8, y: 8 } }); await L.sleep(500) }
await P(p.locator('[data-testid="sd-open"]').first()); await L.sleep(700)
A.sansReopen = await p.evaluate(() => { const e = document.getElementById('inpEditPop'); return e ? { typeSel: !!e.querySelector('#inpEditType'), types: [...e.querySelectorAll('#inpEditType option')].map(o => o.textContent), fixed: (e.querySelector('#inpEditTypeFixed') || {}).innerText || null, picked: [...e.querySelectorAll('[data-pp][aria-pressed="true"]')].map(x => window.PEOPLE[x.dataset.pp].cs) } : null })
await pic('sans-reopen')
if (A.sansReopen && A.sansReopen.typeSel) {
  for (const t of ['HL', 'LL']) {
    await p.selectOption('#inpEditType', t); await L.sleep(300)
    const had = await L.iidSet(p)
    A['re' + t] = { picked: await picked(), ...(await why()) }
    await L.toasts(p); await P(p.locator('#inpEditSave')); await L.sleep(500)
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { A['re' + t].docAsk = true; await P(nodoc); await L.sleep(500) }
    A['re' + t].toast = (await L.toasts(p)).join(' | ')
    A['re' + t].saved = (await L.newRows(p, had)).length
    A['re' + t].changed = await p.evaluate(() => window.INPUTS.filter(r => r.date === 'Aug 11' && /Bolt|Jester/.test(window.PEOPLE[r.person].cs)).map(r => window.PEOPLE[r.person].cs + ':' + r.type))
    A['re' + t].pic = await pic('sans-reopen-' + t.toLowerCase())
  }
}
await closeEd()

console.log(JSON.stringify(A, null, 1))
const okRefuse = x => x && x.saved === 0 && (x.open !== false) && x.pickedAfter.length === 3 && !!x.why && /./.test(x.toast)
L.judge('P6-06', 'Ranger: a three-man Duty then the kind changed to LL, HL, Upchit and Save pressed; the correcting press; the List add form; then Saber (admin) the same for HL and Upchit; then the SANS tab', [
  ['Ranger LL: the sentence and the correcting press shown, Save refused in words, nothing saved, all three still picked', okRefuse(A.LL), A.LL],
  ['Ranger HL: the same', okRefuse(A.HL), A.HL],
  ['Ranger Upchit: the same', okRefuse(A.Upchit), A.Upchit],
  ['the correcting press ("File it for me only") leaves Ranger alone, in words and not silently', A.afterFix.length === 0 || (A.afterFix.length === 1 && A.afterFix[0] === 'Ranger'), A.afterFix],
  ['the kind list of the Inputs editor does not offer SANS availability (D620)', A.sansOffered === false, A.sansOffered],
  ['List add form, Ranger: several for a Duty then LL refused in words, nothing saved', A.listHasSwitch ? (A.listSaved === 0 && /./.test(A.listToast || '')) : false, { sw: A.listHasSwitch, picked: A.listPicked, why: A.listWhy, toast: A.listToast, saved: A.listSaved }],
  ['Saber, group HL: refused ("one person at a time"), nothing saved, selection kept', okRefuse(A.admHL), A.admHL],
  ['Saber, group Upchit: the same', okRefuse(A.admUpchit), A.admUpchit],
  ['SANS tab (Saber): a shared SANS commitment for Bolt + Jester saved as two records; its editor’s kind: either fixed (no transition reachable) or an HL/LL change is refused/handled with nothing smuggled in', A.sansSharedRows && A.sansSharedRows.length === 2 && (!A.sansReopen || !A.sansReopen.typeSel || (A.reHL && A.reHL.saved === 0 && !/HL/.test((A.reHL.changed || []).join()))), { shared: A.sansSharedRows, reopen: A.sansReopen, reHL: A.reHL, reLL: A.reLL }],
], [A.LL && A.LL.pic, A.HL && A.HL.pic, A.admHL && A.admHL.pic])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p606-' + TAG)
await b.close()
