// Scenario 30 - Title -> amendment -> retitle. usage: node it-B-s30.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const DI = 2, ISO = '2026-07-15'
const FOC = 'sports day|games afternoon|^event$'
for (const variant of ['A', 'B']) {
  const W = await L.mk(size)
  const p = W.page
  const ranger = await L.csId(p, 'Ranger')
  const tag = `s30-${size}-${variant}`
  await L.fileInput(W, { iso: ISO, type: 'Event', person: ranger, s: '09:00', e: '10:00', rmk: 'untitled event' })
  const r = await L.recBy(p, { person: ranger, type: 'Event' })
  const pub0 = await L.pubDay(W, DI)
  await L.retitle(W, r.iid, ISO, 'Sports day')
  const sMid = await L.snap(W, DI, { focus: FOC, pic: tag + '-1title-pending' })
  const pub1 = await L.pubDay(W, DI)   // AL1
  console.log('pub0', JSON.stringify(pub0.r), 'pub1', JSON.stringify(pub1.r), pub1.kind)
  const sAl1 = await L.snap(W, DI, { focus: FOC, pic: tag + '-2al1-published' })
  console.log('AL1 published', L.brief(sAl1))
  await L.retitle(W, r.iid, ISO, 'Games afternoon')
  const rd = async t => {
    const S = await L.snap(W, DI, { focus: FOC, pic: t })
    const oo = await L.lookIssued(W, DI, 'orig'); const vOrig = oo.face || { rows: [], signedLn: '' }; await L.focusName(p, '#eWeek', DI, FOC); await L.shot(p, t + '-view-orig'); await L.backLive(W, DI)
    const aa = await L.lookIssued(W, DI, 'AL1'); const vAl1 = aa.face || { rows: [], signedLn: '' }; await L.focusName(p, '#eWeek', DI, FOC); await L.shot(p, t + '-view-al1'); await L.backLive(W, DI)
    const vDef = S.v
    const text = `${L.brief(S)} | ORIG face rows:${L.nm(vOrig)} signedLn:${vOrig.signedLn} | AL1 face rows:${L.nm(vAl1)} signedLn:${vAl1.signedLn} `
    return { s: { S, vOrig, vAl1 }, text, pics: [t + '-edit.png', t + '-togo.png', t + '-view.png', t + '-view-orig.png', t + '-view-al1.png'] }
  }
  const applied = ({ S, vOrig, vAl1 }) => S.f.pend.length === 1 && /not yet signed/i.test(S.f.nys) && S.f.rows[0]?.name === 'GAMES AFTERNOON' && S.f.rows[0]?.kind === 'EVENT'
    && S.v.rows[0]?.name === 'SPORTS DAY' && vOrig.rows[0]?.name === 'EVENT' && !vOrig.rows[0]?.kind && vAl1.rows[0]?.name === 'SPORTS DAY'
    && /SIGNED/i.test(vAl1.signedLn || '') && /AL1/.test(vAl1.signedLn || '') && /ORIG/.test(vOrig.signedLn || '')
  const reverted = ({ S, vOrig, vAl1 }) => !S.f.pend.length && !S.f.nys && S.f.rows[0]?.name === 'SPORTS DAY' && vOrig.rows[0]?.name === 'EVENT' && vAl1.rows[0]?.name === 'SPORTS DAY'
  const s1 = await rd(tag + '-3retitled')
  const midOk = sMid.f.pend.length === 1 && /not yet signed/i.test(sMid.f.nys) && sMid.f.rows[0]?.name === 'SPORTS DAY'
  const al1Ok = !sAl1.f.pend.length && !sAl1.f.nys && sAl1.f.rows[0]?.name === 'SPORTS DAY' && sAl1.v.rows[0]?.name === 'SPORTS DAY' && /AL1/.test(sAl1.f.signedLn)
  L.row('30', size, 'admin', midOk && al1Ok && applied(s1.s) ? 'PASS' : 'FAIL', `[${variant}] untitled published, titled+AL1 published (after AL1: ${L.brief(sAl1)}), then retitled: ${s1.text}`, [tag + '-2al1-published-edit.png', ...s1.pics])
  console.log('midOk', midOk, 'al1Ok', al1Ok, 'applied', applied(s1.s))
  await L.checkpoint(W, variant, { n: '30', tag, read: rd, applied, reverted })
  await W.browser.close()
}
L.saveRows('s30-' + size)
console.log('ERRORS', L.ERRS)
