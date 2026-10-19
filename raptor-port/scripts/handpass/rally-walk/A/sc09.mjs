import { launch, ctxOpen, SIZES, sleep, go, shot, buildSat, bPublish, bType, bf, rlBox, val, model, status, rec, errors, openBoard, hours, addIt, itLines, lwOil, closeBoard } from './lib.mjs'
console.log('sc09 v1')
const b = await launch()
const R = rlBox(5, 0, 0)
const setLead = async (p, v) => {
  await closeBoard(p)
  await go(p, 'logic')
  if (!(await p.locator('[data-lgset="reportLead"]').count())) { await p.locator('button:visible:has-text("Edit"):not(:has-text("Schedule"))').first().click(); await sleep(500) }
  const inp = p.locator('[data-lgset="reportLead"]').first()
  await inp.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await inp.click(); await inp.fill(v); await p.keyboard.press('Enter'); await sleep(500)
  await inp.blur().catch(() => {}); await sleep(300)
  const now = await p.locator('[data-lgset="reportLead"]').first().inputValue()
  return now
}
const labelRead = p => p.evaluate(() => (document.querySelector('[data-lgkey="reportLead"] .lgnm') || {}).textContent)
/* B: published day, empty R boxes -> pending */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '9b')
  await buildSat(p); await bPublish(p, 5)
  const st0 = await status(p)
  await setLead(p, '2h30')
  await openBoard(p, 5)
  const st1 = await status(p)
  const lw = await lwOil(p, ['stiff'])
  const pic = await shot(p, 'A09b-pub-empty-after-change')
  rec('9', 'desk', 'Published Saturday with R empty; change the default 3h -> 2h30; reopen the board', 'reads pending (D592(8)): publish button offers an amendment', { st0, st1, lw }, /Publish AL/.test(st1.beak) ? 'PASS' : 'FAIL', pic)
  const wl = await setLead(p, '3h')
  await openBoard(p, 5)
  const st2 = await status(p)
  rec('9', 'desk', 'set it back to 3h', 'pending clears (nothing differs from the issued day)', { wl, st2 }, st2.beak === '' || !/Publish AL/.test(st2.beak) ? 'PASS' : 'RECORD')
  await ctx.close()
}
/* C: published day where every line has R typed */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '9c')
  await buildSat(p)
  await bType(p, rlBox(5, 0, 0, 'rl'), '08:30')
  await bPublish(p, 5)
  const st0 = await status(p)
  await setLead(p, '2h30'); await openBoard(p, 5)
  const st1 = await status(p)
  rec('9', 'desk', 'Published Saturday where every line has R typed; change the default; reopen', 'RECORD whether it reads pending', { st0, st1 }, 'RECORD', await shot(p, 'A09c-pub-typed-after-change'))
  await setLead(p, '3h')
  await ctx.close()
}
console.log('errors', JSON.stringify(errors))
await b.close()
