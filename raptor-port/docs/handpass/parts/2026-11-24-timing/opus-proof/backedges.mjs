// For an evaluation order, list every import edge M -> D where D evaluates AFTER M (a cycle's back edge: M runs while D's
// bindings are not yet initialised). Prints them; diff two runs to see edges the branch's new import order created.
import fs from 'node:fs'
import path from 'node:path'
const SRC = path.resolve(process.argv[2])
const ORDER = fs.readFileSync(process.argv[3], 'utf8').split(/\r?\n/).filter(Boolean).map(f => path.resolve(SRC, f))
const ENTRY = path.resolve(process.argv[4])
const idx = new Map(ORDER.map((f, i) => [f, i]))
const exts = ['', '.ts', '.tsx', '.js', '.mjs', '/index.ts', '/index.tsx', '/index.js']
function resolve(from, spec, baseDir) {
  if (!spec.startsWith('.')) return null
  const base = path.resolve(baseDir ?? path.dirname(from), spec)
  for (const e of exts) { const f = base + e; if (fs.existsSync(f) && fs.statSync(f).isFile()) return f }
  return null
}
function importsOf(file, baseDir) {
  let s = fs.readFileSync(file, 'utf8')
  s = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1')
  const out = []
  const re = /^\s*(?:import|export)\s+(?!type\b)(?:[^'";]*?\sfrom\s+)?['"]([^'"]+)['"]/gm
  let m
  while ((m = re.exec(s))) out.push(m[1])
  return out.map(sp => resolve(file, sp, baseDir)).filter(Boolean)
}
const edges = []
for (const f of ORDER) {
  if (f.endsWith('.css')) continue
  const isEntry = path.basename(f) === path.basename(ENTRY) && !idx.has(ENTRY)
  for (const d of importsOf(f, isEntry ? SRC : undefined)) {
    if (idx.has(d) && idx.get(d) > idx.get(f)) edges.push(path.relative(SRC, f) + ' -> ' + path.relative(SRC, d))
  }
}
console.log(edges.sort().join('\n'))
