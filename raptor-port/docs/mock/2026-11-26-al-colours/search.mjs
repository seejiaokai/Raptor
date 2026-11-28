/* Finds candidate AL colours: bright enough to read as small text on the app's lightest surface, clear of the colours the
   app already spends, clear of ordinary text (also for red-green colour-blind readers), and as far apart from each other as
   possible in normal sight and both red-green simulations. Random-restart farthest-point search; prints the best set.
   N=4 node search.mjs */
import { oklch2hex, contrast, de00, sim } from './colour.mjs'
const BG = '#20262E'
const TAKEN = ['#3BC6E8', '#F0555F', '#E5A83B', '#57C97A', '#B24DEA', '#3673DD']
const TEXT = ['#F1F4F7', '#B6C0CB', '#8A96A3']
const views = ['normal', 'deutan', 'protan']
const banned = h => (h >= 200 && h <= 236) || (h >= 8 && h <= 36) || (h >= 62 && h <= 88) || (h >= 138 && h <= 162) || (h >= 296 && h <= 326) || h >= 336 || h <= 6
const pool = []
for (let L = 0.74; L <= 0.921; L += 0.02) for (let C = 0.08; C <= 0.221; C += 0.01) for (let h = 0; h < 360; h += 3) {
  if (process.env.BANDS !== '0' && banned(h)) continue
  const x = oklch2hex(L, C, h); if (!x) continue
  if (contrast(x, BG) < 7) continue
  const sv = views.map(v => sim(x, v))
  const txt = Math.min(...views.flatMap((v, i) => TEXT.map(t => de00(sv[i], sim(t, v)))))
  if (txt < +(process.env.TXT || 14)) continue
  const tk = Math.min(...TAKEN.map(t => de00(x, t)))
  if (tk < 11) continue
  pool.push({ x, L, C, h, tk, txt, sv })
}
const memo = new Map()
const W = (a, b) => { const k = a.x < b.x ? a.x + b.x : b.x + a.x; let v = memo.get(k); if (v == null) { v = Math.min(...views.map((_, i) => de00(a.sv[i], b.sv[i]))); memo.set(k, v) } return v }
const N = +(process.env.N || 7)
console.log('pool', pool.length)
let best = null
for (let it = 0; it < 1500; it++) {
  const set = [pool[Math.floor(Math.random() * pool.length)]]
  while (set.length < N) {
    let bx = null, bd = -1
    for (let k = 0; k < 120; k++) { const c = pool[Math.floor(Math.random() * pool.length)]; const d = Math.min(...set.map(s => W(s, c))); if (d > bd) { bd = d; bx = c } }
    set.push(bx)
  }
  let m = 1e9; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) m = Math.min(m, W(set[i], set[j]))
  if (!best || m > best.m) best = { m, set }
}
console.log('N', N, 'min worst-case dE', best.m.toFixed(1))
for (const s of best.set.sort((a, b) => a.h - b.h)) console.log(s.x, 'L', s.L.toFixed(2), 'C', s.C.toFixed(2), 'h', s.h, 'cr', contrast(s.x, BG).toFixed(1), 'taken', s.tk.toFixed(1), 'vsText', s.txt.toFixed(1), 'deu', s.sv[1], 'pro', s.sv[2])
