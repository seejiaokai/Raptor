// Scenario 39 - Delete a titled published request. usage: node it-B-s39.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const DI = 2, ISO = '2026-07-15'
const FOC = 'sports day|^event$'
for (const variant of ['A', 'B']) {
  const W = await L.mk(size)
  const p = W.page
  L.setWeek(null)
  const ranger = await L.csId(p, 'Ranger')
  const tag = `s39-${size}-${variant}`
  await L.fileInput(W, { iso: ISO, type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'titled one' })
  const r = await L.recBy(p, { person: ranger, type: 'Event' })
  await L.pubDay(W, DI)
  const exists = () => p.evaluate(() => window.INPUTS.some(x => x.title === 'Sports day' && x.type === 'Event'))
  const rd = async t => {
    const S = await L.snap(W, DI, { focus: FOC, pic: t })
    const hist = await L.allChanges(W, DI); await L.shot(p, t + '-history'); await L.closeChg(p)
    const ex = await exists()
    return { s: { S, hist, ex }, text: L.brief(S) + ` | input exists: ${ex} | history window: ${hist.replace(/^.*?(?=Changes)/, '').slice(0, 300)}`, pics: [t + '-edit.png', t + '-togo.png', t + '-view.png', t + '-history.png'] }
  }
  const base = await rd(tag + '-0published')
  await L.deleteInput(W, r.iid, ISO)
  const del = await rd(tag + '-1deleted')
  const applied = ({ S, hist, ex }) => !ex && S.f.pend.length === 1 && /not yet signed/i.test(S.f.nys) && !S.f.rows.some(x => /sports day/i.test(x.name)) && S.v.rows.some(x => x.name === 'SPORTS DAY' && x.kind === 'EVENT')
    && /sports day/i.test(S.togo || '') && /Sports day deleted/.test(hist)
  const reverted = ({ S, ex }) => ex && !S.f.pend.length && !S.f.nys && S.f.rows.some(x => x.name === 'SPORTS DAY' && x.kind === 'EVENT') && S.v.rows.some(x => x.name === 'SPORTS DAY')
  L.row('39', size, 'admin', reverted(base.s) && applied(del.s) ? 'PASS' : 'FAIL', `[${variant}] published "Sports day", then deleted: ${del.text}`, del.pics)
  console.log('base ok', reverted(base.s), 'deleted ok', applied(del.s))
  await L.checkpoint(W, variant, { n: '39', tag, read: rd, applied, reverted })
  await W.browser.close()
}
L.saveRows('s39-' + size)
console.log('ERRORS', L.ERRS)
