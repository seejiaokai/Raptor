import { launch, ctxOpen, SIZES, sleep, shot, buildSat, rlBox, val, model, rec, errors } from './lib.mjs'
console.log('sc05c v1')
const b = await launch()
const R = rlBox(5, 0, 0)
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '5e2')
  await buildSat(p)
  await p.locator(R + ':visible').first().click(); await sleep(200)
  const placed = await val(p, R)
  await p.locator('#schedBoard [data-sbtab="4"]:visible').first().click(); await sleep(900)
  const dayAfter = await p.evaluate(() => window.SBDAY)
  const m = await model(p, 5, 0, 0)
  rec('5e', 'desk', 'click R (09:00 placed) then at once the Fri 17 day tab', 'RECORD whether the rally was saved before the board changed day', { placed: placed.v, dayAfter, model: m }, 'RECORD', await shot(p, 'A05e-day-tab'))
  await ctx.close()
}
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '5e3')
  await buildSat(p)
  await p.locator(R + ':visible').first().click(); await sleep(200)
  await p.locator('#sbDone').click(); await sleep(800)
  const m = await model(p, 5, 0, 0)
  rec('5e', 'desk', 'fresh: click R (09:00 placed) then at once Done', 'RECORD whether the rally was saved', m, 'RECORD')
  await ctx.close()
}
console.log('errors', JSON.stringify(errors))
await b.close()
