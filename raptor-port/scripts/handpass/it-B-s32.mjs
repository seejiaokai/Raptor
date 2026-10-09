// Scenario 32 - Capital letters alone. usage: node it-B-s32.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const DI = 2, ISO = '2026-07-15'
const FOC = 'sports day'
for (const variant of ['A', 'B']) {
  const W = await L.mk(size)
  const p = W.page
  const ranger = await L.csId(p, 'Ranger')
  const tag = `s32-${size}-${variant}`
  await L.fileInput(W, { iso: ISO, type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'titled one' })
  const r = await L.recBy(p, { person: ranger, type: 'Event' })
  await L.pubDay(W, DI)
  const rd = async t => { const S = await L.snap(W, DI, { focus: FOC, pic: t }); const rec = await L.rec(p, r.iid); return { s: { S, rec }, text: L.brief(S) + ` | saved title ${JSON.stringify(rec && rec.title)}`, pics: [t + '-edit.png', t + '-togo.png'] } }
  const base = await rd(tag + '-0published')
  await L.retitle(W, r.iid, ISO, 'SPORTS DAY')
  const chg = await rd(tag + '-1caps')
  const applied = ({ S, rec }) => rec.title === 'SPORTS DAY' && S.f.pend.length === 1 && /not yet signed/i.test(S.f.nys) && S.f.rows[0]?.name === 'SPORTS DAY' && /Sports day/.test(S.togo || '') && /SPORTS DAY/.test(S.togo || '') && /Sports day\s*→\s*SPORTS DAY/.test(S.togo || '')
  const reverted = ({ S, rec }) => rec.title === 'Sports day' && !S.f.pend.length && !S.f.nys && S.f.rows[0]?.name === 'SPORTS DAY' && !!S.f.signedLn
  const okBase = reverted(base.s)
  L.row('32', size, 'admin', okBase && applied(chg.s) ? 'PASS' : 'FAIL', `[${variant}] published "Sports day" (${base.text}); changed to SPORTS DAY: ${chg.text}`, [tag + '-0published-edit.png', tag + '-1caps-edit.png', tag + '-1caps-togo.png'])
  if (variant === 'A') {
    await L.retitle(W, r.iid, ISO, 'Sports day')
    const back = await rd(tag + '-2back')
    L.row('32', size, 'admin', reverted(back.s) ? 'PASS' : 'FAIL', `[A] typed "Sports day" back: ${back.text}`, [tag + '-2back-edit.png'])
    await L.retitle(W, r.iid, ISO, 'SPORTS DAY')   // re-apply for the checkpoint
  }
  await L.checkpoint(W, variant, { n: '32', tag, read: rd, applied, reverted })
  await W.browser.close()
}
L.saveRows('s32-' + size)
console.log('ERRORS', L.ERRS)
