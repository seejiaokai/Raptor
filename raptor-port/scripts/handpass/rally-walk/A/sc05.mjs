import { reload, launch, ctxOpen, SIZES, sleep, shot, buildSat, bPublish, bType, bf, rlBox, val, status, model, rec, errors, openBoard } from './lib.mjs'
console.log('sc05 v1')
const b = await launch()
const R = rlBox(5, 0, 0), B = rlBox(5, 0, 0, 'br'), T = rlBox(5, 0, 0, 'to'), L = rlBox(5, 0, 0, 'ld'), CS = rlBox(5, 0, 0, 'cs'), M = rlBox(5, 0, 0, 'msn')
const leave = async p => { const r = await p.locator(rlBox(5, 0, 0) + ":visible").first().boundingBox(); await p.mouse.click(r.x + r.width / 2 + 200, r.y - 28) }
const undoState = p => p.evaluate(() => { const u = document.querySelector('#sbUndo'); return { disabled: u.disabled || u.classList.contains('off') || u.getAttribute('aria-disabled') === 'true', cls: u.className } })
const pic = (p, n) => shot(p, n, p.locator('#schedBoard .sb-go').first())
/* (a) */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '5a')
  await buildSat(p)
  const u0 = await undoState(p)
  await p.locator(R + ':visible').first().click(); await sleep(250)
  const v1 = await val(p, R); const pa = await pic(p, 'A05a-1-clicked')
  rec('5a', 'desk', 'click empty R', '09:00 placed, highlighted', v1, v1.v === '09:00' && v1.sel === '09:00' ? 'PASS' : 'FAIL', pa)
  await p.keyboard.type('0830'); const v2 = await val(p, R)
  rec('5a', 'desk', 'type 0830', 'replaces (08:30), not appended (09:000830)', v2, /^08:?30$/.test(v2.v) ? 'PASS' : 'FAIL')
  await leave(p); await sleep(400)
  const m = await model(p, 5, 0, 0)
  rec('5a', 'desk', 'leave the box by clicking elsewhere', 'saved 08:30', m, m.rl === '08:30' ? 'PASS' : 'FAIL', await pic(p, 'A05a-2-saved'))
  let n = 0
  while (n < 4) { await p.locator('#sbUndo').click(); n++; await sleep(500); const mm = await model(p, 5, 0, 0); if (!mm.rl) break }
  const m3 = await model(p, 5, 0, 0); const v3 = await val(p, R)
  rec('5a', 'desk', 'press Undo until R is empty', 'ONE Undo brings back the empty box and its faint suggestion', { presses: n, model: m3, box: v3 }, n === 1 && !m3.rl && v3.v === '' && v3.ph === '09:00' ? 'PASS' : 'FAIL', await pic(p, 'A05a-3-undone'))
  await p.locator('#sbRedo').click(); await sleep(500)
  const m4 = await model(p, 5, 0, 0)
  rec('5a', 'desk', 'Redo', 'R 08:30 again', m4, m4.rl === '08:30' ? 'PASS' : 'FAIL')
  await reload(p)
  const m5 = await model(p, 5, 0, 0)
  rec('5a', 'desk', 'reload the page', 'R 08:30 survives', m5, m5.rl === '08:30' ? 'PASS' : 'FAIL')
  await ctx.close()
}
/* (b) Escape, unpublished and published */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '5b')
  await buildSat(p)
  const u0 = await undoState(p); const e0 = await p.evaluate(() => (document.querySelector('#schedBoard [data-histcount], #schedBoard .chg, #schedBoard [data-dayhist]') || {}).innerText)
  const hist0 = await p.evaluate(() => (window.HIST ? (window.HIST.length ?? window.HIST.undo?.length ?? null) : null))
  await p.locator(R + ':visible').first().click(); await sleep(200)
  const v1 = await val(p, R)
  await p.keyboard.press('Escape'); await sleep(400)
  const v2 = await val(p, R); const m = await model(p, 5, 0, 0)
  const hist1 = await p.evaluate(() => (window.HIST ? (window.HIST.length ?? window.HIST.undo?.length ?? null) : null))
  const u1 = await undoState(p)
  rec('5b', 'desk', 'click R then Escape (unpublished)', 'empty, nothing saved, no Undo entry', { placed: v1.v, after: v2, model: m, hist0, hist1, u0, u1 }, v1.v === '09:00' && v2.v === '' && !m.rl && hist0 === hist1 ? 'PASS' : 'FAIL', await pic(p, 'A05b-escape'))
  await leave(p); await sleep(300); const m2 = await model(p, 5, 0, 0)
  rec('5b', 'desk', 'then leave the box', 'still nothing saved', m2, !m2.rl ? 'PASS' : 'FAIL')
  await bPublish(p, 5)
  const st0 = await status(p)
  await p.locator(R + ':visible').first().click(); await sleep(200)
  await p.keyboard.press('Escape'); await sleep(400); await leave(p); await sleep(300)
  const st1 = await status(p); const m3 = await model(p, 5, 0, 0)
  const alp = await p.evaluate(() => document.querySelector('[data-bfld="ff:5.0.0.rl"]').dataset.alp || null)
  rec('5b', 'desk', 'Published Saturday: click R, Escape, leave', 'no pending mark, button stays "no change"', { st0, st1, model: m3, alp }, st1.beak === st0.beak && !m3.rl && !alp ? 'PASS' : 'FAIL', await pic(p, 'A05b-pub-escape'))
  await ctx.close()
}
/* (c) tab */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '5c')
  await buildSat(p)
  await p.locator(CS + ':visible').first().click(); await sleep(150)
  const order = []
  const act = () => p.evaluate(() => { const a = document.activeElement; return (a.dataset && (a.dataset.bfld || '')) || a.tagName })
  order.push(await act())
  for (let i = 0; i < 5; i++) { await p.keyboard.press('Tab'); await sleep(150); order.push(await act()) }
  const vs = { r: await val(p, R), b: await val(p, B) }
  const m = await model(p, 5, 0, 0)
  const exp = ['ff:5.0.0.cs', 'ff:5.0.0.msn', 'ff:5.0.0.rl', 'ff:5.0.0.br', 'ff:5.0.0.to', 'ff:5.0.0.ld']
  rec('5c', 'desk', 'click CS then Tab x5', 'order CS, MSN, R, B, TO, LD; nothing filled in R or B (D554, D1030)', { order, vs, model: m }, JSON.stringify(order) === JSON.stringify(exp) && !m.rl && !m.br ? 'PASS' : 'FAIL', await pic(p, 'A05c-tab'))
  // shift+tab back
  const back = []
  for (let i = 0; i < 5; i++) { await p.keyboard.press('Shift+Tab'); await sleep(150); back.push(await act()) }
  rec('5c', 'desk', 'Shift+Tab x5 from LD', 'reverses: TO, B, R, MSN, CS', back, JSON.stringify(back) === JSON.stringify(['ff:5.0.0.to', 'ff:5.0.0.br', 'ff:5.0.0.rl', 'ff:5.0.0.msn', 'ff:5.0.0.cs']) ? 'PASS' : 'FAIL')
  const m2 = await model(p, 5, 0, 0)
  rec('5c', 'desk', 'after the shift-tab walk', 'still nothing filled', m2, !m2.rl && !m2.br ? 'PASS' : 'FAIL')
  await ctx.close()
}
/* (d) R then B */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '5d')
  await buildSat(p)
  await p.locator(R + ':visible').first().click(); await sleep(200)
  await p.locator(B + ':visible').first().click(); await sleep(250)
  const m1 = await model(p, 5, 0, 0); const vb = await val(p, B)
  rec('5d', 'desk', 'click R, then at once click B', 'R saved 09:00 on leaving; B placed and highlighted (09:40)', { model: m1, B: vb }, m1.rl === '09:00' && vb.v === '09:40' && vb.sel === '09:40' ? 'PASS' : 'FAIL', await pic(p, 'A05d-R-then-B'))
  await leave(p); await sleep(300)
  const m2 = await model(p, 5, 0, 0)
  rec('5d', 'desk', 'then leave B', 'B saved 09:40', m2, m2.br === '09:40' ? 'PASS' : 'FAIL')
  await ctx.close()
}
/* (e) R then Done / day arrow */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '5e')
  await buildSat(p)
  await p.locator(R + ':visible').first().click(); await sleep(200)
  await p.locator('#sbDone').click(); await sleep(700)
  const m = await model(p, 5, 0, 0)
  rec('5e', 'desk', 'click R (09:00 placed) then at once Done', 'RECORD whether the rally was saved', m, 'RECORD')
  await openBoard(p, 5)
  const m2 = await model(p, 5, 0, 0)
  const v = await val(p, R)
  rec('5e', 'desk', 'reopen the Saturday board', 'RECORD R box now', { model: m2, box: v }, 'RECORD')
  await p.locator(R + ':visible').first().click(); await sleep(200)
  await p.locator('#schedBoard button:has-text("Fri 17"), #schedBoard [data-sbgo="4"], #schedBoard [data-sbday="4"]').first().click().catch(() => {})
  await sleep(700)
  const m3 = await model(p, 5, 0, 0)
  rec('5e', 'desk', 'click R then at once the Fri 17 day button', 'RECORD whether the rally was saved', { model: m3, day: await p.evaluate(() => window.SBDAY) }, 'RECORD')
  await ctx.close()
}
/* (f) R then Enter */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '5f')
  await buildSat(p)
  await p.locator(R + ':visible').first().click(); await sleep(200)
  await p.keyboard.press('Enter'); await sleep(400)
  const m = await model(p, 5, 0, 0); const v = await val(p, R)
  rec('5f', 'desk', 'click R then Enter', 'RECORD: saved 09:00 and leaves the box', { model: m, box: v }, 'RECORD', await pic(p, 'A05f-enter'))
  await ctx.close()
}
console.log('errors', JSON.stringify(errors))
await b.close()
