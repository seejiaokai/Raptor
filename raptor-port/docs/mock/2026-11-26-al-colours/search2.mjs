/* Round 2 of the search (26 Nov 26): the first round checked the candidates only against the app's core colour tokens and
   missed the SECTIONS' own colours (Common Programme periwinkle, Personal Inputs orange, Available crew mint ...), which is
   how periwinkle, mint and orange got in. This one keeps every candidate clear of ALL of them (capture/sections.json, read
   off the running app, plus the tokens), then looks for the set furthest apart in ordinary sight and both red-green
   simulations.   N=4 CLEAR=13 node search2.mjs   ·   node search2.mjs --list  (prints the pool by hue) */
import { oklch2hex, contrast, de00, sim } from './colour.mjs'
export const SCHED = { 'app cyan (flying waves, AREA, stores chips, CAT C, focus)': '#3BC6E8', 'warning red (Unavailable, red C flag, the missing-time outline)': '#F0555F', 'amber (advisory, Ground Programme, CP flag, CAT B)': '#E5A83B',
  'Duties green (also "fine", OIL)': '#57C97A', 'Sims / SANS purple': '#B24DEA', 'Common Programme periwinkle': '#7C8CF0', 'Personal Inputs orange': '#F08A4A', 'Available crew mint': '#35D6A4',
  'in-time lines pale amber': '#F2D699', 'CAT IP purple': '#9F4ADF', 'CAT O violet': '#7F65BF', 'CAT A red': '#CA4750', 'CAT D blue': '#3673DD', '"this is you" purple': '#9B2FAE', 'pilot olive': '#6E6A2E', 'WSO green': '#1F6E52',
  'ordinary white words': '#F1F4F7', 'ordinary grey words': '#B6C0CB', 'faint grey words': '#8A96A3' }
const BG = '#1A1F2A', views = ['normal', 'deutan', 'protan']
const CLEAR = +(process.env.CLEAR || 13), N = +(process.env.N || 4)
const pool = []
for (let L = 0.72; L <= 0.941; L += 0.02) for (let C = 0.05; C <= 0.231; C += 0.01) for (let h = 0; h < 360; h += 3) {
  const x = oklch2hex(L, C, h); if (!x || contrast(x, BG) < 6.5) continue
  const near = Object.entries(SCHED).map(([n, c]) => [de00(x, c), n]).sort((a, b) => a[0] - b[0])[0]
  if (near[0] < CLEAR) continue
  pool.push({ x, L, C, h, near, sv: views.map(v => sim(x, v)) })
}
console.log('pool', pool.length, 'with every schedule colour at least', CLEAR, 'away')
if (process.argv.includes('--list')) { const by = {}; for (const c of pool) { const k = Math.floor(c.h / 15) * 15; (by[k] = by[k] || []).push(c) }
  for (const k of Object.keys(by).sort((a, b) => a - b)) { const best = by[k].sort((a, b) => b.near[0] - a.near[0])[0]; console.log('hue', String(k).padStart(3), 'n', String(by[k].length).padStart(4), 'clearest', best.x, best.near[0].toFixed(1), 'from', best.near[1].slice(0, 30)) } }
const memo = new Map(), W = (a, b) => { const k = a.x < b.x ? a.x + b.x : b.x + a.x; let v = memo.get(k); if (v == null) { v = [de00(a.x, b.x), Math.min(...views.map((_, i) => de00(a.sv[i], b.sv[i])))]; memo.set(k, v) } return v }
const score = (a, b) => { const [n, w] = W(a, b); return Math.min(n, w * 1.6) }   // ordinary sight first, red-green close behind
let best = null
for (let it = 0; it < 2500; it++) {
  const set = [pool[Math.floor(Math.random() * pool.length)]]
  while (set.length < N) { let bx = null, bd = -1; for (let k = 0; k < 140; k++) { const c = pool[Math.floor(Math.random() * pool.length)]; const d = Math.min(...set.map(s => score(s, c))); if (d > bd) { bd = d; bx = c } } set.push(bx) }
  let m = 1e9; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) m = Math.min(m, score(set[i], set[j]))
  if (!best || m > best.m) best = { m, set }
}
let mn = 1e9, mw = 1e9; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) { const [n, w] = W(best.set[i], best.set[j]); mn = Math.min(mn, n); mw = Math.min(mw, w) }
console.log('N', N, 'min ordinary', mn.toFixed(1), 'min red-green-worst', mw.toFixed(1))
for (const s of best.set.sort((a, b) => a.h - b.h)) console.log(s.x, 'L', s.L.toFixed(2), 'C', s.C.toFixed(2), 'h', s.h, 'contrast', contrast(s.x, BG).toFixed(1), 'nearest', s.near[0].toFixed(1), s.near[1].slice(0, 34))
