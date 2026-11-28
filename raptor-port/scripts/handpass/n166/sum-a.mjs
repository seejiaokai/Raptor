// sum-a - reads a win-a run's FACT lines (its printed log) and prints one short line per window: for each press, whether
// the control was reached, and what became of the window. Reads only.
//   node raptor-port/scripts/handpass/n166/sum-a.mjs <log file>
import { readFileSync } from 'node:fs'
const F = {}
for (const l of readFileSync(process.argv[2], 'utf8').split(/\r?\n/)) { const m = l.match(/^FACT (A\.\w+\.[\w-]+)\.(\w+)\.?([\w.]*)=(.*)$/); if (!m) continue; const [, w, act, rest, v] = m; ((F[w] ||= {})[act] ||= {})[rest || '_'] = JSON.parse(v) }
const short = s => String(s).replace(/^covered by /, '').replace(/div\.|span\.|button\./g, '').slice(0, 26)
for (const [w, acts] of Object.entries(F)) {
  const parts = []
  let opened = ''
  for (const [a, f] of Object.entries(acts)) {
    if (a === 'window') continue
    const o = f.opened
    if (!opened) opened = typeof o === 'string' ? o.slice(0, 60) : Array.isArray(o) ? o.map(x => x.what.replace(/^\.?/, '')).join('+').slice(0, 80) : '?'
    if (typeof o === 'string' && o.startsWith('could not')) { parts.push(`${a}: NOT OPENED`); continue }
    const p = f.press || {}
    if (!p.pressed) { parts.push(`${a}: UNREACHABLE (${short(p.covered === 'free' ? (p.rowCovered || p.lineCovered || 'tap opened nothing' + (p.afterTap ? ' ' + JSON.stringify(p.afterTap) : '')) : p.covered)})`); continue }
    const first = Array.isArray(o) ? o[0].what : null
    const aw = f['after.windows'] || []
    const still = first && aw.find(x => x.what === first)
    const band = (f['after.bands'] || []).join(' ').replace(/\[saveband moveband\] /, '').replace(/Close$/, '')
    const res = !still ? 'window CLOSED' : still.inert ? `HELD greyed${band ? ' "' + band + '"' : ' (no band)'}` : `stays OPEN live${band ? ' "' + band + '"' : ''}`
    parts.push(`${a}: ${res}; ${f['after.squadron'].after.slice(0, 3)} ${String(f['after.role'].after).replace('Switch to the member view', 'admin(menu)').replace('Back to the admin view', 'member(menu)')}${f['after.typedWords'] !== undefined ? '; typed ' + (f['after.typedWords'] ? 'kept' : 'gone') : ''}`)
  }
  console.log(`${w} [${opened}] — ${parts.join(' | ')}`)
}
