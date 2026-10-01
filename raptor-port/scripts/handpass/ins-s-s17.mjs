/* Scenario 17 — reload at every publication state must preserve the same answer. */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s17-')
const { browser, p, errors } = await B.world()
const saved = async () => p.evaluate(() => { const e = document.querySelector('#syncChip, .syncchip, [data-sync], #sbSync, .tb-sync'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(no chip)' })
async function reloadLook(id, expect, name) {
  const before = await S.look(p, `s17-${id}-before`)
  const sv = await saved()
  await L.settle(p, 1200)
  await B.admin(p)   // reload + sign in again (the app's own reload)
  const d = await S.dayState(p, TUE, { view: false })
  const after = await S.look(p, `s17-${id}-after`)
  const ok = S.same(after, before) && S.same(after, expect)
  row(`17.${id}`, name, `${ok ? '✓' : '✗'} Insights after the reload ${S.same(after, before) ? 'identical to just before it' : 'DIFFERS from before: ' + S.delta(before, after).slice(0, 300)}; ${S.same(after, expect) ? 'matches the expected state' : 'does NOT match the expected state: ' + S.delta(expect, after).slice(0, 300)} · Tuesday tag "${d.tag}" chip "${d.pending}" signs [${d.signs}] · sync chip before: ${sv}`, ok ? 'PASS' : 'FAIL', [before.shot, after.shot])
  return { before, after, d }
}
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  const orig = await S.look(p, 's17-a-original')
  const a = await reloadLook('a', orig, 'Original published; reload')

  await S.takeOff(p, TUE, '1.1.1.0.p'); await B.toEdit(p)
  const b = await reloadLook('b', orig, 'a change waiting on Tuesday (Rebel off); reload')

  await S.publish(p, TUE, 'al')
  const al = await S.look(p, 's17-c-al1')
  const c = await reloadLook('c', al, 'AL1 published; reload')

  const lk = await B.look(p, TUE, /ORIG/i); const ld = await B.load(p, TUE, { confirm: true }); await B.backLive(p, TUE); await B.toEdit(p)
  const d = await reloadLook('d', al, `Original loaded onto the working copy (${(ld.said || []).join(' → ')}); reload`)

  const up = await W.unpublish(p, TUE); await L.settle(p)
  await B.toEdit(p)
  const e = await reloadLook('e', orig, `AL1 unpublished (${JSON.stringify(up)}); reload`)
} catch (e) { row('17.X', 'the script stopped', String(e && e.stack || e).slice(0, 1500), 'FAIL', [await pic(p, 's17-X-error')]) }
row('17.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s17', { errors })
await browser.close()
