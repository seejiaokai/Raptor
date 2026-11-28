/* With the first four fixed, finds the three further colours that stay furthest (normal sight first) from them, from
   each other, from the app's spent colours and from ordinary text. No pink (his "no pink" lesson), not the app's cyan.
   node extend.mjs '#FFE45C,#8FA6FF,#4FEBC8,#FF9548' */
import { oklch2hex, contrast, de00, worst } from './colour.mjs'
const base = (process.argv[2] || '#FFE815,#94ABFF,#4FEBC8,#FF9548').split(',')
const BG = '#20262E'
const TAKEN = ['#3BC6E8', '#F0555F', '#E5A83B', '#57C97A', '#B24DEA', '#3673DD']
const TEXT = ['#F1F4F7', '#B6C0CB', '#8A96A3']
const pool = []
for (let L = 0.70; L <= 0.921; L += 0.02) for (let C = 0.06; C <= 0.221; C += 0.01) for (let h = 24; h < 330; h += 3) {
  if (h >= 200 && h <= 236) continue
  const x = oklch2hex(L, C, h); if (!x || contrast(x, BG) < 5.5) continue
  if (TEXT.some(t => de00(x, t) < 13) || TAKEN.some(t => de00(x, t) < 11)) continue
  pool.push(x)
}
const score = set => { let n = 1e9, w = 1e9; for (let i = 0; i < set.length; i++) for (let j = i + 1; j < set.length; j++) { if (i < base.length && j < base.length) continue; n = Math.min(n, de00(set[i], set[j])); w = Math.min(w, worst(set[i], set[j])) } return [n, w] }
console.log('base', base.join(' '), 'base min normal/worst', (() => { let n = 1e9, w = 1e9; for (let i = 0; i < base.length; i++) for (let j = i + 1; j < base.length; j++) { n = Math.min(n, de00(base[i], base[j])); w = Math.min(w, worst(base[i], base[j])) } return n.toFixed(1) + ' / ' + w.toFixed(1) })())
let set = [...base]
for (let k = 0; k < 3; k++) {
  let best = null
  for (const c of pool) { const n = Math.min(...set.map(s => de00(s, c))), w = Math.min(...set.map(s => worst(s, c))); const v = n + 0.5 * w; if (!best || v > best.v) best = { c, n, w, v } }
  set.push(best.c)
  console.log('add', best.c, 'min normal', best.n.toFixed(1), 'min worst', best.w.toFixed(1), 'contrast', contrast(best.c, BG).toFixed(1), 'vs spent', Math.min(...TAKEN.map(t => de00(best.c, t))).toFixed(1))
}
console.log('all seven: min normal / worst', score(set).map(v => v.toFixed(1)).join(' / '))
