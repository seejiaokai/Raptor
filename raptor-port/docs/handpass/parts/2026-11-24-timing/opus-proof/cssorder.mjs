// Static import graph of the app's entry, in ES evaluation order (post-order DFS), to list where each CSS file lands.
// Usage: node cssorder.mjs <src dir> <entry file> ; entry may be a variant file placed anywhere (its imports resolved against src).
import fs from 'node:fs'
import path from 'node:path'
const SRC = process.argv[2]
const ENTRY = process.argv[3]
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
const seen = new Set(), order = []
function visit(f, baseDir) {
  if (seen.has(f)) return
  seen.add(f)
  if (!f.endsWith('.css')) for (const d of importsOf(f, baseDir)) visit(d)
  order.push(f)
}
visit(path.resolve(ENTRY), path.resolve(SRC))
const all = order.map(f => path.relative(SRC, f)); if (process.argv[4]) { console.log(all.join(String.fromCharCode(10))); process.exit(0) }
const css = order.filter(f => f.endsWith(".css")).map(f => path.relative(SRC, f))
console.log(css.join('\n'))
console.log('-- modules before scheduler.css:', order.findIndex(f => f.endsWith('scheduler.css')))
