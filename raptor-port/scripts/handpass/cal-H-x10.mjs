/* X-10 — Undo never reverses another person's work (D148). The host's second-person arrangement: stay signed in and swap
   identity in place (window.raptorMe / window.raptorRole), do B's act through the visible controls, swap back. */
import * as H from './cal-H-lib.mjs'
H.setTag('x10')
const { browser, page, errors } = await H.world({})
await H.toastSpy(page)
const A = await H.pidOf(page, 'Saber'), B = await H.pidOf(page, 'Ranger')
const swap = async (pid, role) => { await page.evaluate(([p, r]) => { window.raptorMe(p); window.raptorRole(r) }, [pid, role]); await H.sleep(500) }
const undoState = async () => page.evaluate(() => { const b = document.getElementById('undoBtn'); const r = document.getElementById('redoBtn'); return { undoTitle: b && b.title, undoDis: b && b.disabled, redoTitle: r && r.title, redoDis: r && r.disabled } })
const grpOf = async remark => (await H.inputsNow(page)).filter(x => x.remarks === remark)
const badge = () => page.locator('#roleBadge').innerText()

/* ---------------- PART 1 — different items ---------------- */
await H.inputsMonth(page, 2026, 7)
await H.fileShared(page, { iso: '2026-07-15', type: 'Meeting', people: ['Ranger', 'Drifter', 'Ace'], remarks: 'X10-A-group' })
const g1 = await grpOf('X10-A-group')
const p1a = await H.pic(page, 'a1-A-filed-group')
// B (Ranger, member): files his own input
await swap(B, 'member')
console.log('badge as B', await badge())
await H.inputsMonth(page, 2026, 7)
await H.openNewInput(page, '2026-07-16')
await page.selectOption('#inpEditType', 'Appointment')
await page.fill('#inpEditRmk', 'X10-B-own')
await page.click('#inpEditSave'); await H.sleep(700)
await H.answerOilIfAsked(page, 'Yes')
const b1 = await grpOf('X10-B-own')
const p1b = await H.pic(page, 'a2-B-filed-own')
const stB = await undoState()
// back to A
await swap(A, 'admin')
console.log('badge as A', await badge())
const stA = await undoState()
const p1c = await H.pic(page, 'a3-A-back-before-undo')
await H.toastSpy(page)
const u1 = await H.door(page, 'undo')
const afterU = { g: await grpOf('X10-A-group'), b: await grpOf('X10-B-own'), st: await undoState(), toast: await H.toastText(page) }
const p1d = await H.pic(page, 'a4-A-undone')
const r1 = await H.door(page, 'redo')
const afterR = { g: await grpOf('X10-A-group'), b: await grpOf('X10-B-own'), st: await undoState(), toast: await H.toastText(page) }
const p1e = await H.pic(page, 'a5-A-redone')
H.judge('X-10 (a) different items — group input vs B\'s own input', 'A filed a group of 4 (Saber, Ranger, Drifter, Ace); B (Ranger, member, swap) filed his own Appointment; swapped back to A; pressed the top-bar Undo, then Redo', [
  ['the group was filed as 4 records, B filed 1', g1.length === 4 && b1.length === 1, { g1: g1.length, b1: b1.length }],
  ['as A the Undo button is enabled after B\'s later change (B did not switch off A\'s unrelated Undo)', stA.undoDis === false, stA],
  ['A\'s Undo was pressed and it ran', u1.pressed === true, u1],
  ['Undo reversed A\'s group (0 records left)', afterU.g.length === 0, afterU.g.length],
  ['B\'s own input is still there after A\'s Undo (1 record)', afterU.b.length === 1, afterU.b.length],
  ['Redo restores A\'s group whole (4) without touching B (1)', r1.pressed === true && afterR.g.length === 4 && afterR.b.length === 1, { r1: r1.pressed, g: afterR.g.length, b: afterR.b.length }],
  ['the group is still ONE shared input after Redo (one group id)', new Set(afterR.g.map(x => x.grp)).size === 1 && !!afterR.g[0]?.grp, afterR.g.map(x => x.grp)],
], [p1a, p1b, p1c, p1d, p1e], { stB, stA, u1, afterU: { toast: afterU.toast, st: afterU.st }, afterR: { toast: afterR.toast, st: afterR.st } })

/* ---------------- PART 2 — the same item ---------------- */
await H.inputsMonth(page, 2026, 7)
await H.fileShared(page, { iso: '2026-07-16', type: 'Meeting', people: ['Ace', 'Drifter'], remarks: 'X10-G2' })
const g2 = await grpOf('X10-G2')
const q1 = await H.pic(page, 'b1-A-filed-G2')
// B as admin edits the same item (changes its remark) through the editor window
await swap(B, 'admin')
await H.inputsMonth(page, 2026, 7)
await page.locator('#inpCal .ib-bar').filter({ hasText: '+2' }).first().click().catch(() => {})
await H.sleep(500)
const editorOpen = await page.locator('[data-testid="win-inputedit"]').count()
let opened = 'no'
if (editorOpen) {
  opened = await page.locator('[data-testid="win-inputedit"] .win-ttl').innerText()
}
console.log('editor title', opened)
await page.fill('#inpEditRmk', 'X10-G2-by-B')
await H.pic(page, 'b2-B-editing-G2')
await page.click('#inpEditSave'); await H.sleep(800)
await H.answerOilIfAsked(page, 'Yes')
const g2b = await grpOf('X10-G2-by-B')
const q2 = await H.pic(page, 'b3-B-changed-G2')
await swap(A, 'admin')
const stA2 = await undoState()
await H.toastSpy(page)
const u2 = await H.door(page, 'undo')
const t2 = await H.toastText(page)
const afterU2 = { still: await grpOf('X10-G2-by-B'), old: await grpOf('X10-G2'), st: await undoState() }
const q3 = await H.pic(page, 'b4-A-undo-after-B')
const r2 = await H.door(page, 'redo')
const afterR2 = { still: await grpOf('X10-G2-by-B'), old: await grpOf('X10-G2'), st: await undoState(), toast: await H.toastText(page) }
const q4 = await H.pic(page, 'b5-A-redo')
H.judge('X-10 (b) same item — B changed the item after A', 'A filed G2 (2 men + Saber); B (Ranger, admin, swap) changed its remark; back to A; Undo, then Redo', [
  ['A filed G2 as 3 records, B changed all 3 to the new remark', g2.length === 3 && g2b.length === 3, { g2: g2.length, g2b: g2b.length }],
  ['the Undo press was refused or did nothing: B\'s change is still there (3 with B\'s remark, 0 with the old)', afterU2.still.length === 3 && afterU2.old.length === 0, { still: afterU2.still.length, old: afterU2.old.length }],
  ['the refusal names the newer actor (Ranger) on screen', /Ranger/i.test(t2 || '') || /Ranger/i.test(JSON.stringify(u2.toasts || [])), { toast: t2, toasts: u2.toasts }],
  ['Redo does not overwrite B\'s work (still 3 with B\'s remark)', afterR2.still.length === 3, { still: afterR2.still.length, old: afterR2.old.length, toast: afterR2.toast }],
], [q1, q2, q3, q4], { stA2, u2, t2, afterU2, afterR2 })

/* ---------------- PART 3 — a holiday (Calendar window → Holidays) ---------------- */
const tid = id => page.locator(`[data-testid="${id}"]`)
async function holTap(iso) {
  const MS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const at = async () => { const [m, y] = (await tid('holcal-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MS.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await tid('holcal-next-month').click()
  for (; d < 0; d++) await tid('holcal-prev-month').click()
  await tid(`holcal-day-${iso}`).click(); await H.sleep(200)
}
await H.go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-slipway"]'); await H.sleep(600)
const openHol = async () => {
  if (!(await tid('win-days').count())) { await tid('settings-open').click(); await H.sleep(300); await tid('settings-days').click(); await tid('win-days').waitFor() }
  if (await tid('days-tabs').count()) await tid('days-tab-holidays').click()
  await H.sleep(300)
}
await openHol()
await tid('hol-add').click(); await tid('hol-name').fill('X10 Day'); await tid('hol-short').fill('XA'); await holTap('2026-08-05'); await tid('hol-save').click(); await H.sleep(600)
const hol1 = await page.evaluate(() => [...document.querySelectorAll('.hol-line')].map(e => e.innerText.replace(/\s+/g, ' ')))
const h1 = await H.pic(page, 'c1-A-added-holiday')
await swap(B, 'admin')
await openHol()
// B changes the same holiday (its name)
await page.locator('.hol-line', { hasText: 'X10 Day' }).first().click(); await H.sleep(400)
await tid('hol-name').fill('X10 Day by B'); await tid('hol-save').click(); await H.sleep(600)
const hol2 = await page.evaluate(() => [...document.querySelectorAll('.hol-line')].map(e => e.innerText.replace(/\s+/g, ' ')))
const h2 = await H.pic(page, 'c2-B-changed-holiday')
await swap(A, 'admin')
const uh = await H.door(page, 'undo')
const th = await H.toastText(page)
const hol3 = await page.evaluate(() => [...document.querySelectorAll('.hol-line')].map(e => e.innerText.replace(/\s+/g, ' ')))
const h3 = await H.pic(page, 'c3-A-undo-after-B')
H.judge('X-10 (c) holiday — the same item', 'A added a holiday "X10 Day" (5 Aug); B (Ranger, admin, swap) renamed it; back to A; Undo', [
  ['A\'s holiday was listed', hol1.some(t => /X10 Day/.test(t)), hol1.filter(t => /X10/.test(t))],
  ['B\'s rename was listed', hol2.some(t => /X10 Day by B/.test(t)), hol2.filter(t => /X10/.test(t))],
  ['after A\'s Undo B\'s rename is still there (not reversed)', hol3.some(t => /X10 Day by B/.test(t)), hol3.filter(t => /X10/.test(t))],
  ['the refusal names Ranger on screen', /Ranger/i.test(th || '') || /Ranger/i.test(JSON.stringify(uh.toasts || [])), { toast: th, uh }],
], [h1, h2, h3], { uh, th })

/* a different-item holiday: B adds another; A's Undo reverses only A's own */
await swap(A, 'admin')
await openHol()
await tid('hol-add').click(); await tid('hol-name').fill('X10 A2'); await tid('hol-short').fill('A2'); await holTap('2026-08-12'); await tid('hol-save').click(); await H.sleep(600)
await swap(B, 'admin')
await openHol()
await tid('hol-add').click(); await tid('hol-name').fill('X10 B2'); await tid('hol-short').fill('B2'); await holTap('2026-08-19'); await tid('hol-save').click(); await H.sleep(600)
await swap(A, 'admin')
const uh2 = await H.door(page, 'undo')
const th2 = await H.toastText(page)
const hol4 = await page.evaluate(() => [...document.querySelectorAll('.hol-line')].map(e => e.innerText.replace(/\s+/g, ' ')))
const h4 = await H.pic(page, 'c4-A-undo-different-holiday')
H.judge('X-10 (d) holiday — different items', 'A added "X10 A2" (12 Aug); B (Ranger, admin, swap) added "X10 B2" (19 Aug); back to A; Undo', [
  ['A\'s own latest holiday is gone', !hol4.some(t => /X10 A2/.test(t)), hol4.filter(t => /X10/.test(t))],
  ['B\'s holiday is still there', hol4.some(t => /X10 B2/.test(t)), hol4.filter(t => /X10/.test(t))],
  ['A\'s Undo ran', uh2.pressed === true, { uh2, th2 }],
], [h4], { uh2, th2 })

/* ---------------- PART 4 — a requirement (Leave War's Required P cell, typed by an admin) ---------------- */
await swap(A, 'admin')
await H.go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-slipway"]'); await H.sleep(600)
if (await tid('win-days').count()) { await page.locator('[data-testid="win-days"] .win-x, [data-testid="win-days-x"]').first().click(); await H.sleep(400) }
const reqCell = iso => page.locator(`[data-testid="req-p-${iso}"]`).first()
const reqTxt = async iso => (await reqCell(iso).innerText()).replace(/\s+/g, ' ').trim()
async function typeReq(iso, val) {
  const c = reqCell(iso); await c.scrollIntoViewIfNeeded(); await c.click(); await H.sleep(250)
  await page.keyboard.type(String(val)); await page.keyboard.press('Enter'); await H.sleep(500)
}
await typeReq('2026-08-20', '9')
const e1 = await H.pic(page, 'd1-A-typed-req')
await swap(B, 'admin')
await typeReq('2026-08-21', '8')
const e2 = await H.pic(page, 'd2-B-typed-other-day')
await swap(A, 'admin')
const ur = await H.door(page, 'undo')
const rd = { a: await reqTxt('2026-08-20'), b: await reqTxt('2026-08-21') }
const e3 = await H.pic(page, 'd3-A-undo')
H.judge('X-10 (e) requirement — different days', 'A typed Required P 9 on 20 Aug; B (Ranger, admin, swap) typed 8 on 21 Aug; back to A; Undo', [
  ['A Undo ran', ur.pressed === true, ur],
  ['A figure on 20 Aug is gone', rd.a === '—' || rd.a === '' || rd.a === '–', rd],
  ['B figure on 21 Aug stays', /8/.test(rd.b), rd],
], [e1, e2, e3], { ur, rd })
await typeReq('2026-08-24', '7')
await swap(B, 'admin')
await typeReq('2026-08-24', '6')
await swap(A, 'admin')
const ur2 = await H.door(page, 'undo')
const th4 = await H.toastText(page)
const rd2 = await reqTxt('2026-08-24')
const e4 = await H.pic(page, 'd4-A-undo-same-cell')
H.judge('X-10 (f) requirement — the same cell', 'A typed 7 on 24 Aug; B (Ranger, admin, swap) typed 6 on the same cell; back to A; Undo', [
  ['B 6 stays in the cell', /6/.test(rd2), rd2],
  ['the refusal names Ranger on screen', /Ranger/i.test(th4 || '') || /Ranger/i.test(JSON.stringify(ur2.toasts || [])), { th4, ur2 }],
], [e4], { ur2, th4, rd2 })

console.log('ERRORS', errors)
H.save('x10', { errors, pics: H.picCount() })
await browser.close()
