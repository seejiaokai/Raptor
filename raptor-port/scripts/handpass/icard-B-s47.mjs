// #47 Leave approved by the Leave War - phone 390x844 by touch: Saber (admin) creates and approves, then edits; Ranger (member) changes dates and deletes
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const T = true
const { ctx, page: p } = await L.open(browser, { width: 390, height: 844 }, 'ad', 'a', true, false)
await L.watchToasts(p)
const pics = []
const ran = await L.csId(p, 'Ranger')
const span = r => r ? `${r.date}${r.endDate ? '→' + r.endDate : ''}` : 'none'
const ll = async () => p.evaluate(rid => { const r = window.INPUTS.find(x => x.person === rid && x.type === 'LL'); return r ? { iid: r.iid, date: r.date, endDate: r.endDate, remarks: r.remarks, lw: r.lw || null, half: r.half || null, by: r.by } : null }, ran)
const MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const toMonth = async iso => { await p.evaluate(() => window.go('leavewar')); await p.waitForTimeout(900); const b = p.locator(`[data-testid="month-${MON[+iso.slice(5, 7) - 1]}"]`); await L.press(T, b); await p.waitForTimeout(900) }
const cellInfo = async iso => { await toMonth(iso); const c = p.locator(`[data-testid="cell-bane-${iso}"]`); if (!(await c.count())) return 'no cell'; await c.scrollIntoViewIfNeeded(); return await c.evaluate(e => (e.className + ' | ' + e.innerText.trim() + ' | ' + (e.getAttribute('title') || '')).replace(/\s+/g, ' ')) }
const cells = async (label, ds) => { const o = {}; for (const d of ds) o[d.slice(5)] = await cellInfo(d); return label + ': ' + JSON.stringify(o) }
await L.scn(47, '390x844 touch', 'Saber (admin) then Ranger (member)', async () => {
  const notes = [], ck = []
  await toMonth('2026-07-27')
  const cell = p.locator('[data-testid="cell-bane-2026-07-27"]')
  await cell.scrollIntoViewIfNeeded(); await p.waitForTimeout(400)
  await L.press(T, cell); await p.waitForTimeout(700)
  const ls = p.locator('button:visible:not(.inpedit)', { hasText: /^LL$/ }).last()
  await L.press(T, ls); await p.waitForTimeout(500); await L.press(T, ls); await p.waitForTimeout(900)
  if (await p.locator('[data-testid="span-one"]').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(300) }
  pics.push(await L.shot(p, 'B47-1-bid-made'))
  notes.push('bid made on 27 Jul; Inputs holds LL: ' + JSON.stringify(await ll()))
  await cell.scrollIntoViewIfNeeded(); await L.press(T, cell); await p.waitForTimeout(700)
  await L.press(T, p.locator('[data-testid="decide-approve"]')); await p.waitForTimeout(1000)
  if (await p.locator('[data-testid="span-one"]').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(300) }
  pics.push(await L.shot(p, 'B47-2-approved'))
  let r = await ll()
  notes.push('after Approve, Inputs holds LL: ' + JSON.stringify(r))
  ck.push(!!r && r.date === 'Jul 27' && !!r.lw)
  notes.push(await cells('war cells after approve', ['2026-07-27', '2026-07-28']))
  if (!r) return { ok: 'NOT RUN', saw: notes.join(' || ') + ' || could not reach an approved leave', pics }
  const iid = r.iid
  // remark only, as the admin
  await L.openFromList(p, T, iid)
  await p.fill('#inpEditRmk', 'war remark one')
  await L.saveWin(p, T)
  r = await ll(); notes.push('remark-only edit: ' + JSON.stringify(r)); ck.push(r.remarks === 'war remark one' && !!r.lw && r.date === 'Jul 27')
  notes.push(await cells('war cells after remark', ['2026-07-27', '2026-07-28']))
  // Undo / Redo of that
  await L.undo(p); const u1 = await ll(); await L.redo(p); const re1 = await ll()
  notes.push(`Undo -> remark "${u1.remarks}"; Redo -> "${re1.remarks}"`)
  // dates, as the admin: 27 -> 28
  await L.openFromList(p, T, iid)
  await L.tapDate(p, T, '2026-07-28')
  await L.saveWin(p, T)
  r = await ll(); notes.push('admin date change: ' + JSON.stringify(r)); ck.push(r.date === 'Jul 28')
  notes.push(await cells('war cells after admin date change', ['2026-07-27', '2026-07-28']))
  pics.push(await L.shot(p, 'B47-3-war-after-date-change'))
  // Ranger: his own date change
  await p.goto('http://localhost:4232/'); await L.signIn(p, 'us', 'us')
  await L.watchToasts(p)
  await L.openFromList(p, T, iid)
  await L.tapDate(p, T, '2026-07-29')
  await L.saveWin(p, T)
  r = await ll(); notes.push('Ranger date change: ' + JSON.stringify(r)); ck.push(r.date === 'Jul 29' && !r.lw)
  notes.push(await cells('war cells after Ranger date change', ['2026-07-28', '2026-07-29']))
  pics.push(await L.shot(p, 'B47-4-war-after-ranger'))
  // Ranger: remark only on a war-approved? (the lw is cleared now) - delete it
  await L.openFromList(p, T, iid)
  await p.locator('#inpEditDel').scrollIntoViewIfNeeded(); await L.press(T, p.locator('#inpEditDel')); await p.waitForTimeout(600)
  r = await ll(); notes.push('after Delete: ' + JSON.stringify(r)); ck.push(!r)
  notes.push(await cells('war cells after delete', ['2026-07-27', '2026-07-28', '2026-07-29']))
  pics.push(await L.shot(p, 'B47-5-war-after-delete'))
  await L.undo(p); r = await ll(); notes.push('Undo of the delete: ' + JSON.stringify(r)); ck.push(!!r && r.date === 'Jul 29')
  await ctx.close()
  return { ok: ck.every(Boolean), saw: notes.join(' || ') + ` || checks ${JSON.stringify(ck)}`, pics }
})
L.save('s47')
console.log(L.errs)
await browser.close()
