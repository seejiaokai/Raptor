/* walker A — H-01: the oracle on screen. Usage: node bta-A-cells.mjs <name> <types comma list> <fams comma list> [pics=all|few|none]
   For every (type, family): a fresh world, X's input filed for Tuesday through the Inputs page, the family's seat with NO times,
   X put on it by the crew list; read; times typed; read again (and for the first four types cleared again, read once more). */
import * as A from './bta-A-lib.mjs'
const { B, K, TUE, CSN, ID, sleep } = A
const name = process.argv[2] || 'cells'
const types = (process.argv[3] || 'LL').split(',')
const fams = (process.argv[4] || 'fly').split(',')
const picMode = process.argv[5] || 'all'
const FIRST4 = ['LL', 'OL', 'ATT C', 'ATT B']
const clip = s => String(s).replace(/\s+/g, ' ')
for (const type of types) for (const fam of fams) {
  const id = `H-01 ${type} × ${fam}`
  const t0 = Date.now()
  let w
  try {
    w = await K.fresh()
    const { p, errors } = w
    let tpl = null
    if (fam === 'bbDesk') tpl = await A.makeBBTemplate(p)
    const f = await A.fileType(p, type)
    const h = await A.build(p, fam)
    const bl = await A.blankIt(p, h)
    const u = await A.putX(p, h)
    const s1 = await A.read(p, `${type}-${fam}-1blank`.replace(/\W+/g, '_'), { pics: picMode === 'all' ? true : picMode === 'few' ? 'list' : false })
    const j1 = A.judge(type, fam, s1)
    const st1 = await h.state()
    let s2 = null, j2 = null, s3 = null, j3 = null, st2 = ''
    if (u.took) {
      await h.type()
      st2 = await h.state()
      s2 = await A.read(p, `${type}-${fam}-2timed`.replace(/\W+/g, '_'), { pics: picMode === 'all' ? 'list' : false })
      j2 = A.judge(type, fam, s2)
      if (FIRST4.includes(type)) { await h.clear(); s3 = await A.read(p, `${type}-${fam}-3cleared`.replace(/\W+/g, '_'), { pics: false }); j3 = A.judge(type, fam, s3) }
    }
    const same = s2 ? (s1.abs.map(x => x.msg).join('|') === s2.abs.map(x => x.msg).join('|')) : null
    const ok = u.took && j1.ok && (!j2 || j2.ok) && (!j3 || j3.ok)
    const saw = `filed ${type} (${clip(JSON.stringify({ iid: !!f.iid, asked: f.asked, note: f.note, clash: f.clash }))}); ${h.label}${bl.cleared ? ' [it came up with times; cleared: ' + bl.was + ']' : ''}; state ${st1}; crew list before he is placed: ${A.sayRoster(u.r)}${u.row ? ' · row "' + clip(u.row).slice(0, 120) + '"' : ''}; placed ${u.took}${u.toast ? ', toast "' + clip(u.toast).slice(0, 140) + '"' : ''}. BLANK: ${A.say(s1)} → ${j1.ok ? 'matches oracle (' + j1.exp + ')' : 'MISMATCH ' + j1.why}.`
      + (s2 ? ` TIMED (${st2}):${A.say(s2)} → ${j2.ok ? 'matches' : 'MISMATCH ' + j2.why}; same sentence as blank: ${same}.` : '')
      + (s3 ? ` CLEARED AGAIN: ${A.say(s3)} → ${j3.ok ? 'matches' : 'MISMATCH ' + j3.why}.` : '')
      + (tpl ? ` [template note: ${tpl.note}]` : '')
    const pics = [...s1.pics, ...(s2 ? s2.pics : [])]
    K.R(id, saw.slice(0, 1800), '', ok ? 'PASS' : 'FAIL', pics)
    /* keep 'saw' in its own field: R(id, did, saw, ...) — did = the steps, saw = the screen */
    A.B.TABLE[A.B.TABLE.length - 1].did = `${type} filed for Tuesday (Inputs page), then X on ${h.label}`
    A.B.TABLE[A.B.TABLE.length - 1].saw = saw
    A.B.TABLE[A.B.TABLE.length - 1].oracle = j1.exp
    if (errors.length) { K.R(id + '.err', 'browser errors', errors.join(' | ').slice(0, 400), 'FAIL'); }
  } catch (e) {
    K.R(id, 'script', String(e.stack || e).slice(0, 500), 'FAIL', w ? [await A.pic(w.p, `ERR-${type}-${fam}`.replace(/\W+/g, '_'))] : [])
  }
  if (w) await w.browser.close().catch(() => {})
  console.log(`  (${id}: ${((Date.now() - t0) / 1000).toFixed(0)}s)`)
}
B.savePart('bta-A-' + name)
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n      → ${String(r.saw).slice(0, 900)}`)
