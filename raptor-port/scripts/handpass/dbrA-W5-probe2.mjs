/* W5 probe 2 (investigation, not a walk step): which writes, in which order, make the TWO change-log batches seen on
   🗑 Delete syllabus and ↺ Restore of a built-in. The page's own storage calls are only LOGGED (a wrapper that passes
   every call straight through), nothing is changed. */
import * as L from './dbrA-lib.mjs'
import * as T from './dbrA-W5-lib.mjs'

const errors = []
const b = await L.launch()
try {
  const ctx = await L.context(b)
  const p = await L.page(ctx, errors, 'probe2')
  await T.firstBoot(p); await T.firstMount(p)
  await p.evaluate(() => {
    window.__w5log = []
    const S = Storage.prototype, set = S.setItem, rem = S.removeItem
    S.setItem = function (k, v) { if (String(k).startsWith('raptor:') && !String(k).startsWith('raptor:__')) window.__w5log.push({ t: performance.now() | 0, op: 'set', k: String(k).slice(7), v: String(k).startsWith('raptor:changes/') ? v : String(v).slice(0, 160) }); return set.call(this, k, v) }
    S.removeItem = function (k) { if (String(k).startsWith('raptor:') && !String(k).startsWith('raptor:__')) window.__w5log.push({ t: performance.now() | 0, op: 'del', k: String(k).slice(7) }); return rem.call(this, k) }
  })
  const run = async (label, fn) => {
    await p.evaluate(() => { window.__w5log = [] })
    await fn(); await L.settle(p)
    const log = await p.evaluate(() => window.__w5log)
    console.log('\n=== ' + label)
    for (const e of log) console.log(e.t, e.op, e.k, e.op === 'set' ? (e.k.startsWith('changes/') ? e.v : e.v) : '')
  }
  await T.pickFrom(p, '#sylSel', '2024')
  await run('delete 2024', async () => { await T.menu(p, 'syl', 'delSyl'); await T.dlg(p, {}); await p.evaluate(() => window.__coreForTests.whenLoaded()) })
  await T.menu(p, 'syl', 'ordSyl'); await p.waitForSelector('#ordModal[data-ord="syllabus"]', { state: 'visible' })
  await run('restore 2024', async () => { await p.locator('#ordHidden .ordrow', { hasText: '2024' }).locator('button', { hasText: 'Restore' }).click(); await T.sleep(400) })
  await p.click('#ordSave'); await L.settle(p)
  await run('+ Add syllabus', async () => { await T.menu(p, 'syl', 'addSyl'); await T.dlg(p, { value: 'P2' }); await p.evaluate(() => window.__coreForTests.whenLoaded()) })
} finally { await b.close() }
console.log('errors', errors)
