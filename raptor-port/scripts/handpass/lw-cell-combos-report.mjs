// [LW-CELL-COMBOS] — the measurement's summary, per box: for each place in the cell, each code's letters and each set of
// corner tiles, does the box show its letters whole? Reads measure-<size>-<font>.json (lw-cell-combos-measure.mjs) and
// writes report-<tag>.json + a plain table. MEAS=<folder> TAGS=phone-system,phone-wide,desk-system,desk-wide
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const DIR = process.env.MEAS || path.resolve(here, '../../docs/img/handpass/2026-11-06-lw-cell-combos/measure')
const TAGS = (process.env.TAGS || 'phone-system,phone-wide,desk-system,desk-wide').split(',')
const PLACE = { whole: 'whole day, alone', top: 'morning (top half)', bot: 'afternoon (bottom half)', left: 'whole day, left half', right: 'whole day, right half', 'right-am': 'morning beside a whole day (top-right quarter)', 'right-pm': 'afternoon beside a whole day (bottom-right quarter)' }
const lines = []
const all = {}
for (const tag of TAGS) {
  const f = path.join(DIR, `measure-${tag}.json`)
  if (!existsSync(f)) { lines.push(`(${tag}: not measured)`); continue }
  const j = JSON.parse(readFileSync(f, 'utf8'))
  for (const z of j.zooms) {
    const rows = j.perBox.filter(r => r.zoom === z)
    /* by place: the codes whose letters do not fit even with no tile; then, per tile set, the codes a tile covers */
    const byPlace = {}
    for (const r of rows) {
      const p = byPlace[r.place] ||= { place: r.place, fs: r.fs, room: r.room, alone: { ok: [], bad: [] }, tiles: {} }
      const code = r.text
      if (!r.tiles) { (r.bad ? p.alone.bad : p.alone.ok).push(`${code}${r.bad ? ` (${r.need.toFixed(1)} in ${r.room.toFixed(1)})` : ''}`); p.fs = r.fs; p.room = r.room }
      else if (r.bad && !r.by.includes('cut')) { (p.tiles[r.tiles] ||= new Set()).add(code) }
    }
    const key = `${tag} @ zoom ${z}`
    all[key] = Object.values(byPlace).map(p => ({ ...p, tiles: Object.fromEntries(Object.entries(p.tiles).map(([k, v]) => [k, [...v]])) }))
    lines.push(`\n=== ${key} (${j.hostFont}) ===`)
    for (const p of Object.values(byPlace)) {
      const uniq = a => [...new Set(a)]
      lines.push(`${(PLACE[p.place] || p.place).padEnd(50)} letters ${p.fs}px, room ${p.room.toFixed(1)}px`)
      lines.push(`   alone — fit: ${uniq(p.alone.ok).join(' ') || 'none'}`)
      lines.push(`   alone — CUT: ${uniq(p.alone.bad).join(' ') || 'none'}`)
      for (const [t, set] of Object.entries(p.tiles)) lines.push(`   under ${t.padEnd(10)}: ${[...set].join(' ')}`)
    }
  }
}
writeFileSync(path.join(DIR, 'report.json'), JSON.stringify(all, null, 1))
writeFileSync(path.join(DIR, 'report.txt'), lines.join('\n'))
console.log(lines.join('\n'))
