// sa208-wA-keep — walker A's cited pictures copied from the raw run folders (D:/raptor-work/c208/A/out/<run>) into the walk's
// picture folder (docs/img/handpass/2026-11-27-sans-answers/A/<run>/), each one a result line names; plus every phone
// "right after the tap" picture of the cited runs' notes. Run from raptor-port/: node scripts/handpass/sa208-wA-keep.mjs
import { readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const DEST = path.join(HERE, '../../docs/img/handpass/2026-11-27-sans-answers/A')
const RAW = 'D:/raptor-work/c208/A'
const RUNS = [['final', ['d', 'p', 'pc', 'd125']], ['final-a13p', ['p']], ['final-pu39b', ['pc']], ['repro1', ['d']], ['repro2', ['d']], ['rewalk1', ['d', 'p']], ['rewalk1-control', ['d']]]
let n = 0, miss = []
for (const [run, sizes] of RUNS) for (const sz of sizes) {
  const f = path.join(RAW, `results-${run}-${sz}.json`)
  if (!existsSync(f)) { miss.push(f); continue }
  const res = JSON.parse(readFileSync(f, 'utf8'))
  for (const r of res) for (const pic of String(r.pics || '').split(',').map(s => s.trim()).filter(Boolean)) {
    const src = path.join(RAW, 'out', run, pic)
    if (!existsSync(src)) { miss.push(src); continue }
    const dst = path.join(DEST, run, pic)
    mkdirSync(path.dirname(dst), { recursive: true })
    copyFileSync(src, dst); n++
  }
}
console.log('copied', n, 'missing', miss.length, miss.slice(0, 10).join(' | '))
