// asp-w2 probe 4: where Hex stands on Tue 14 and Thu 16 Jul in the demo week (read only), and his window reason.
import * as L from './asp-w2-lib.mjs'
const { J } = L
console.log('asp-w2-probe4 v1')
const W = L.mk('probe4', L.SIZES.d)
const { b, p } = await L.world(L.SIZES.d, W)
await L.signIn(p, 'ad', 'a')
for (const di of [1, 3]) {
  const s = await p.evaluate(([i, id]) => {
    const d = window.DAYS[i]; const out = []
    const walk = (o, path) => { if (o == null) return; if (typeof o === 'string') { if (o === id) out.push(path) ; return } if (Array.isArray(o)) o.forEach((x, k) => walk(x, path + '[' + k + ']')); else if (typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], path + '.' + k) }
    walk(d, 'day')
    const rows = out.map(pth => { const parts = pth.split(/[.[\]]+/).filter(Boolean); let o = d; const stack = []; for (const q of parts.slice(1)) { stack.push(o); o = o[q] } const row = stack.reverse().find(x => x && (x.str || x.to || x.role || x.prog || x.cs)); return pth + ' :: ' + (row ? JSON.stringify({ prog: row.prog, role: row.role, cs: row.cs, str: row.str, end: row.end, to: row.to, ld: row.ld }) : '') })
    const inp = (window.INPUTS || []).filter(x => JSON.stringify(x).includes(id)).map(x => JSON.stringify(x).slice(0, 200))
    return { dt: d.dt, rows, inp }
  }, [di, L.HEX])
  console.log('day', di, J(s))
}
await b.close()
