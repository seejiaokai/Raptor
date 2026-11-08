// Walker B — the save layer ([RD-LEFT-1108], 8 Nov 26, chat 31): Astra's S01–S05, S07–S11, S15, S17, S19, S21, S22 on two builds,
// the values each screen says compared step for step. Usage, from raptor-port/:
//   node scripts/handpass/rdl1108-walk.mjs <before dist> <after dist> [out folder] [parts, e.g. U,R] [phone|desk]
import { chromium, webkit, LAUNCH, V, firstLine, press, world, signIn, reload, adminUsers, note, bar, undoState, rowText, counts, store } from './rdl1108-lib.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { PARTS as P1 } from './rdl1108-parts.mjs'
import { PARTS2 } from './rdl1108-parts2.mjs'
const PARTS = { ...P1, ...PARTS2 }
console.log('[rdl1108-walk v2]')
const [before, after, out = 'docs/img/handpass/2026-11-08-rd-last-findings/walkB', onlyArg = '', sizeArg = ''] = process.argv.slice(2)
const ONLY = onlyArg.split(',').filter(Boolean), run = part => !ONLY.length || ONLY.includes(part)
const SIZES = sizeArg ? [sizeArg] : ['desk', 'phone']
mkdirSync(out, { recursive: true })
const NL = String.fromCharCode(10)
let TAG = '', REC = {}
const pics = []
async function step(p, id, scen, desc, fn) {
  const rec = { id, scen, desc }
  try { rec.v = await fn() } catch (e) { rec.err = firstLine(e) }
  const f = `${TAG}-${id}.png`
  try { await p.screenshot({ path: path.join(out, f) }); rec.pic = f; pics.push(f) } catch (e) { rec.pic = null }
  REC[id] = rec
  console.log(`${TAG} ${id} ${rec.err ? 'ERR ' + rec.err : JSON.stringify(rec.v).slice(0, 170)}`)
  return rec
}
const note_ = (id, v, err) => { REC[id] = { id, v, err } }
const ctxBag = { step, note_, snap: async (p, names = []) => {
  const o = { toast: await note(p), bar: await bar(p), undo: await undoState(p), counts: await counts(p) }
  for (const n of names) o['row ' + n] = await rowText(p, n)
  return o
}, out }

async function walkBuild(dist, tag) {
  TAG = tag; REC = {}
  for (const size of SIZES) {
    const br = size === 'phone' ? await webkit.launch() : await chromium.launch(LAUNCH)
    for (const [name, fn] of Object.entries(PARTS)) {
      if (!run(name)) continue
      try { await fn(br, dist, size === 'phone', ctxBag) } catch (e) { REC[`${name}-${size}-abort`] = { id: `${name}-${size}-abort`, err: firstLine(e) }; console.log(tag, name, 'ABORT', firstLine(e)) }
    }
    await br.close()
  }
  return REC
}
const A = await walkBuild(before, 'main'), B = await walkBuild(after, 'branch')
writeFileSync(path.join(out, ONLY.length ? `record-${ONLY.join('-')}-${sizeArg || 'all'}.json` : 'record.json'), JSON.stringify({ main: A, branch: B }, null, 1))
let same = 0, diff = 0, fail = 0
for (const id of new Set([...Object.keys(A), ...Object.keys(B)])) {
  const a = A[id], b = B[id]
  if (a?.err || b?.err) { fail++; console.log(`FAIL ${id}: main=${a?.err || 'ok'} branch=${b?.err || 'ok'}`); continue }
  const ja = JSON.stringify(a?.v), jb = JSON.stringify(b?.v)
  if (ja === jb) same++; else { diff++; console.log(`DIFF ${id}:${NL}  main   ${ja}${NL}  branch ${jb}`) }
}
console.log(`compare: ${same} SAME, ${diff} DIFF, ${fail} FAIL, ${pics.length} pictures`)
