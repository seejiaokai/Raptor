/* W5 probe 3 (investigation, not a walk step): what the FIRST ↶ Undo of a mark writes for a student whose pace, lull
   periods and dates were never set — the values of each row, before the mark, after it, after the Undo; and whether
   the same happens without a reload in between. */
import * as L from './dbrA-lib.mjs'
import * as T from './dbrA-W5-lib.mjs'

const errors = []
const b = await L.launch()
try {
  for (const reload of [false, true]) {
    const ctx = await L.context(b)
    const p = await L.page(ctx, errors, 'probe3')
    await T.firstBoot(p); await T.firstMount(p)
    const [stA] = await p.evaluate(() => window.__coreForTests.rosterNow())
    const [, e2] = await T.firstBalls(p, 2)
    const mine = async () => Object.fromEntries(Object.entries(await L.rows(p)).filter(([k]) => k.startsWith('tracker/') && k.endsWith(stA.id)))
    console.log(`\n=== ${reload ? 'with' : 'without'} a reload between the mark and the undo`)
    console.log('before the mark', JSON.stringify(await mine()))
    await T.grade(p, e2, 'DCO'); await L.settle(p)
    console.log('after the mark ', JSON.stringify(await mine()))
    if (reload) { await T.trkReload(p, 'probe'); await T.grade(p, e2, 'Marginal'); await L.settle(p); console.log('after a 2nd mark', JSON.stringify(await mine())) }
    const exp1 = await p.evaluate(async () => JSON.stringify((await window.__coreForTests.collectStudents()).byCourse))
    await p.click('#trUndoBtn'); await L.settle(p)
    console.log('after the undo ', JSON.stringify(await mine()))
    const exp2 = await p.evaluate(async () => JSON.stringify((await window.__coreForTests.collectStudents()).byCourse))
    console.log('export before undo:', exp1.slice(0, 600))
    console.log('export after undo :', exp2.slice(0, 600))
    await ctx.close()
  }
} finally { await b.close() }
console.log('errors', errors)
