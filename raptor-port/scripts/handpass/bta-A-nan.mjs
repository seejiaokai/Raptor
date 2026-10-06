/* walker A — the "NaN:NaN" line seen on a blank SC MAIN seat for a man who is not SC-current (Zulu): blank, then times typed, then cleared.
   Run with BTA_X=bullet BTA_CS=Zulu BTA_SEAT=w */
import * as A from './bta-A-lib.mjs'
const { B, K, TUE, ID, CSN } = A
const { browser, p, errors } = await K.fresh()
try {
  const h = await A.build(p, 'scMain')
  const u = await A.putX(p, h)
  const rd = async tag => {
    const w = await A.fullWarnsX(p, TUE)
    const s = await A.read(p, 'nan-' + tag, { pics: 'list' })
    K.R('NaN ' + tag, `Zulu (not SC-current) on SC MAIN, ${tag}`, `his warnings: ${w.map(x => `[${x.sev}/${x.code}] "${x.msg}"`).join(' || ') || 'none'}`, 'RECORDED', s.pics)
  }
  await rd('blank shift times (placed ' + u.took + '; ' + await h.state() + ')')
  await h.type(); await rd('shift typed 08:00–12:00')
  await h.clear(); await rd('shift cleared again')
} catch (e) { console.log('ERR', e.stack) }
console.log('errors', errors)
B.savePart('bta-A-nan')
for (const r of B.TABLE) console.log(r.id, '→', r.saw)
await browser.close()
