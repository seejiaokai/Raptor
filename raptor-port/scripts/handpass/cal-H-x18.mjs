/* X-18 — every publish stage survives reload and a second sign-in without rebuilding the group (D654, D663, D142, D178).
   PLAIN address (not ?fresh=1), so a reload keeps what was saved. A shared Duty on Sat 18 Jul 26 (a weekend: one OIL
   question for everyone) is taken through four stages — draft, published clean, a pending edit, amended — and at each:
   read as Saber; reload; sign out and in as Ranger (a subject, "us"); sign out and in as Saber again. */
import * as H from './cal-H-lib.mjs'
H.setTag('x18')
const { browser, page, errors } = await H.world({ plain: true })
await H.toastSpy(page)
const DI = 5   // Sat 18 Jul
const MEN = ['Ranger', 'Drifter', 'Ace', 'Saber']
const undo = () => page.evaluate(() => { const b = document.getElementById('undoBtn'); return b ? { title: b.title, disabled: b.disabled } : null })
async function lwOil() {
  await H.go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-slipway"]'); await H.sleep(900)
  await page.locator('[data-testid="month-JUL"]').first().click().catch(() => {}); await H.sleep(1000)
  const o = {}
  for (const cs of MEN) { const pid = await H.pidOf(page, cs); o[cs] = (await page.locator(`[data-testid="cell-${pid}-2026-07-18"]`).first().innerText().catch(() => '?')).replace(/\s+/g, ' ').trim() }
  return o
}
async function placedLine() {
  await H.inputsMonth(page, 2026, 7)
  await page.locator('[data-icday="2026-07-18"]').click({ position: { x: 8, y: 8 } }); await H.sleep(700)
  const t = await page.locator('[data-testid="win-inputsday"]').innerText().then(x => x.replace(/\s+/g, ' ')).catch(() => '')
  const m = t.match(/Ace \+3[\s\S]*?(Placed by[^]*?(?=$))/)
  const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.click().catch(() => {})
  const line = (t.match(/Placed by Saber for 4 people.{0,95}/) || [''])[0]
  return { day: t.slice(0, 700), line: line.trim() }
}
const groupNow = async () => (await H.inputsNow(page)).filter(x => /X18/.test(x.remarks)).map(x => `${x.person}|${x.grp}|${x.remarks}|${JSON.stringify(x.oil)}|${x.placedBy}|${x.grpBy}`).sort()
async function snapAdmin(label) {
  const o = { label }
  o.group = await groupNow()
  o.lw = await lwOil()
  o.placed = await placedLine()
  await H.toEdit(page); await H.showDay(page, DI)
  const h = await H.head(page, DI)
  o.head = { tag: h.tag, pending: h.pending, signed: h.signed, nys: h.nys }
  o.undo = await undo()
  o.pic = await H.pic(page, label)
  return o
}
async function snapMember(label) {
  const o = { label }
  o.group = await groupNow()
  o.lw = await lwOil()
  o.placed = await placedLine()
  await H.go(page, 'viewsched'); await H.sleep(500)
  o.pend = await page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="5"]'); return d ? { tag: ((d.querySelector('.verchip') || {}).innerText || ''), pend: ((d.querySelector('.dpend') || {}).innerText || '') } : null })
  o.undo = await undo()
  o.badge = await page.locator('#roleBadge').innerText().catch(() => '')
  o.pic = await H.pic(page, label)
  return o
}
const sameAdmin = (a, b) => JSON.stringify([a.group, a.lw, a.placed.line, a.head]) === JSON.stringify([b.group, b.lw, b.placed.line, b.head])
async function threeReads(stage) {
  const direct = await snapAdmin(`${stage}-a-direct`)
  await page.reload(); await H.signIn(page, 'ad')
  const reloaded = await snapAdmin(`${stage}-b-reloaded`)
  await H.signOut(page); await H.signIn(page, 'us', 'us')
  const asRanger = await snapMember(`${stage}-c-as-Ranger`)
  await H.signOut(page); await H.signIn(page, 'ad')
  const back = await snapAdmin(`${stage}-d-back-as-Saber`)
  const checks = [
    ['after a reload: the same group (4 records, one group id), the same OIL cells, the same placed line and the same day head', sameAdmin(direct, reloaded), { d: direct.group.length, r: reloaded.group.length, lwD: direct.lw, lwR: reloaded.lw, headD: direct.head, headR: reloaded.head, plD: direct.placed.line, plR: reloaded.placed.line }],
    ['signed in as Ranger: he sees the same group and the same OIL cells', JSON.stringify([asRanger.group, asRanger.lw]) === JSON.stringify([direct.group, direct.lw]), { grp: asRanger.group.length, lw: asRanger.lw, badge: asRanger.badge }],
    ['signed in as Ranger: the placed line reads the same', asRanger.placed.line === direct.placed.line, { r: asRanger.placed.line, d: direct.placed.line }],
    ['back as Saber: all the same again', sameAdmin(direct, back), { backGroup: back.group.length, lw: back.lw, head: back.head }],
    ['the group is still ONE shared input of 4 records', new Set(back.group.map(s => s.split('|')[1])).size === 1 && back.group.length === 4, back.group.length],
    ['Undo does not carry over: disabled for Ranger, and for Saber after coming back', (asRanger.undo ? asRanger.undo.disabled : true) === true && back.undo && back.undo.disabled === true, { ranger: asRanger.undo, saberBack: back.undo, saberReloaded: reloaded.undo }],
  ]
  return { direct, reloaded, asRanger, back, checks }
}

// ---- stage 1: draft (filed, nothing published)
await H.inputsMonth(page, 2026, 7)
await H.fileShared(page, { iso: '2026-07-18', type: 'Duty', people: ['Ranger', 'Drifter', 'Ace'], remarks: 'X18 duty', answerOil: 'Yes' })
await H.sleep(1500)
const u1 = await undo()
const S1 = await threeReads('1-draft')
H.judge('X-18 stage 1 (draft)', 'filed ONE Duty for Saber, Ranger, Drifter and Ace on Sat 18 Jul (one OIL question, Yes — FO); read as Saber; reloaded; signed out and in as Ranger; signed out and in as Saber', [
  ['the filing was one group of 4 with the OIL answer written for each man', S1.direct.group.length === 4 && S1.direct.group.every(s => /"2026-07-18":1/.test(s)), S1.direct.group],
  ['Undo was live right after the filing (before any sign-out)', u1 && u1.disabled === false, u1],
  ...S1.checks,
], [S1.direct.pic, S1.reloaded.pic, S1.asRanger.pic, S1.back.pic], { S1: { lw: S1.direct.lw, head: S1.direct.head, placed: S1.direct.placed.line, undo: [S1.reloaded.undo, S1.asRanger.undo, S1.back.undo] } })

// ---- stage 2: published clean
await H.toEdit(page); await H.showDay(page, DI); await H.signDay(page, DI); const pub = await H.publishDay(page, DI)
const S2 = await threeReads('2-published')
H.judge('X-18 stage 2 (published clean)', 'signed the four boxes and published Sat 18 Jul; the same four reads', [
  ['the day published (ORIG)', pub.pressed === true && /ORIG/.test(S2.direct.head.tag), { pub, tag: S2.direct.head.tag }],
  ['each man\'s OIL cell reads the same single credit (no doubling) — same text for all four', MEN.every(m => S2.direct.lw[m] === S2.direct.lw.Ranger) && /FO/.test(S2.direct.lw.Ranger), S2.direct.lw],
  ...S2.checks,
], [S2.direct.pic, S2.reloaded.pic, S2.asRanger.pic, S2.back.pic], { S2: { lw: S2.direct.lw, head: S2.direct.head, placed: S2.direct.placed.line } })

// ---- stage 3: a pending edit
await H.inputsMonth(page, 2026, 7)
await H.openBar(page, /\+3/)
await page.fill('#inpEditRmk', 'X18 duty edited'); await page.click('#inpEditSave'); await H.sleep(900); await H.answerOilIfAsked(page, 'Yes')
await H.sleep(1200)
const S3 = await threeReads('3-pending')
H.judge('X-18 stage 3 (published, one edit pending)', 'changed the shared duty\'s remarks on the published day; the same four reads', [
  ['the day reads 4 pending', /^4 pending/.test(S3.direct.head.pending || ''), S3.direct.head],
  ['every man carries the edited remark; one group', S3.direct.group.every(s => /X18 duty edited/.test(s)) && S3.direct.group.length === 4, S3.direct.group],
  ['the placed line now carries "changed by Saber"', /changed by Saber/.test(S3.direct.placed.line), S3.direct.placed.line],
  ['OIL still one credit each (no doubling after the edit)', MEN.every(m => S3.direct.lw[m] === S2.direct.lw[m]), { before: S2.direct.lw, now: S3.direct.lw }],
  ...S3.checks,
], [S3.direct.pic, S3.reloaded.pic, S3.asRanger.pic, S3.back.pic], { S3: { lw: S3.direct.lw, head: S3.direct.head, placed: S3.direct.placed.line } })

// ---- stage 4: amended
await H.toEdit(page); await H.showDay(page, DI); await H.signDay(page, DI); const al = await H.publishAL(page, DI)
const S4 = await threeReads('4-amended')
H.judge('X-18 stage 4 (amended)', 'signed and published AL1; the same four reads', [
  ['AL1 published, nothing pending', al.pressed === true && /AL1/.test(S4.direct.head.tag) && !/pending/.test(S4.direct.head.pending || ''), { al, head: S4.direct.head }],
  ['OIL still one credit each', MEN.every(m => S4.direct.lw[m] === S2.direct.lw[m]), { before: S2.direct.lw, now: S4.direct.lw }],
  ...S4.checks,
], [S4.direct.pic, S4.reloaded.pic, S4.asRanger.pic, S4.back.pic], { S4: { lw: S4.direct.lw, head: S4.direct.head, placed: S4.direct.placed.line } })
console.log('ERRORS', errors)
H.save('x18', { errors })
await browser.close()
