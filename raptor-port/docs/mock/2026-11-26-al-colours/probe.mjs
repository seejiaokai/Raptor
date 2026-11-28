/* A working table: candidate AL colours against each other (normal sight / worst of normal and both red-green
   simulations, CIEDE2000), against the colours the app already spends, and today's seven the same way.
   node probe.mjs */
import { contrast, de00, sim, worst } from './colour.mjs'
const C = { lemon: '#FFE815', peri: '#94ABFF', mint: '#4FEBC8', orange: '#FF9548', lilac: '#D9A6FF', lime: '#B5F03C', coral: '#FF8F8F', sky: '#7CCBFF', tan: '#D9B68C', aqua: '#7DF0F0', apricot: '#FFB37A', violet: '#B79CFF', rose: '#FF9DB5' }
const TAKEN = { accent: '#3BC6E8', red: '#F0555F', amber: '#E5A83B', green: '#57C97A', sans: '#B24DEA', blue: '#3673DD', ink: '#F1F4F7', ink2: '#B6C0CB' }
const k = Object.keys(C)
console.log(''.padEnd(8) + k.map(x => x.slice(0, 6).padStart(7)).join(''))
for (const a of k) console.log(a.padEnd(8) + k.map(b => a === b ? '      -' : (de00(C[a], C[b]).toFixed(0) + '/' + worst(C[a], C[b]).toFixed(0)).padStart(7)).join(''))
console.log('vs taken (normal dE) + contrast on #20262E')
for (const a of k) console.log(a.padEnd(8) + Object.entries(TAKEN).map(([n, t]) => (n + ' ' + de00(C[a], t).toFixed(0)).padStart(10)).join('') + '  cr ' + contrast(C[a], '#20262E').toFixed(1) + ' deu ' + sim(C[a], 'deutan') + ' pro ' + sim(C[a], 'protan'))
const T = { AL1: '#3BC6E8', AL2: '#E5C24A', AL3: '#3DE86B', AL4: '#FFFFFF', AL5: '#B388FF', AL6: '#FF7FC4', AL7: '#E5872B' }
console.log('TODAY')
const tk = Object.keys(T)
for (const a of tk) console.log(a.padEnd(8) + tk.map(b => a === b ? '      -' : (de00(T[a], T[b]).toFixed(0) + '/' + worst(T[a], T[b]).toFixed(0)).padStart(7)).join(''))
for (const a of tk) console.log(a.padEnd(8) + Object.entries(TAKEN).map(([n, t]) => (n + ' ' + de00(T[a], t).toFixed(0)).padStart(10)).join('') + '  cr ' + contrast(T[a], '#20262E').toFixed(1))
