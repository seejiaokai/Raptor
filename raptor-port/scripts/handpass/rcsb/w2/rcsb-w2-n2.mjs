/* rcsb-w2-n2 v1 — W2 N2 (Downchit + planned) on Friday 17 Jul.
   usage: node scripts/handpass/rcsb/w2/rcsb-w2-n2.mjs [pc|phone] ["ATT B"|"ATT C"|Upchit] [Callsign] */
const KIND = process.argv[2] || 'pc'
const TYPE = process.argv[3] || 'ATT B'
const MAN = process.argv[4] || 'Nomad'
const C = await import('./rcsb-w2-common.mjs')
C.setShots(`N2-${TYPE.replace(/\W/g, '')}-${KIND}`)
console.log('rcsb-w2-n2 v1', KIND, TYPE, MAN, process.env.HP_SHOTS)
const { run } = await import('./rcsb-w2-warn.mjs')
const { w, out } = await run({ kind: KIND, tag: 'N2', man: MAN, di: 4, iso: '2026-07-17', type: TYPE, doPublish: false })
const { writeFileSync } = await import('node:fs')
writeFileSync(process.env.HP_SHOTS + '/out.json', JSON.stringify(out, null, 1))
await w.browser.close()
