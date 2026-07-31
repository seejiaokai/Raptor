/* CSV export — exportCSV and the schedule flattening (schedRows), verbatim. */
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { minus } from '../engine/time'

export function exportCSV(name: string, rows: any[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click()
}

export function schedRows() {
  const rows = [['Day', 'Date', 'Wave', 'CS', 'Mission', 'Brief', 'TO', 'Land', 'FCP', 'FCP lvl', 'RCP', 'RCP lvl', 'Area', 'Area time', 'Rmks', 'Stores']]
  DAYS.forEach((d: any) => (d.waves || []).forEach((w: any) => w.formations.forEach((f: any) => f.aircraft.forEach((a: any) => {
    const F = PEOPLE[a.p] || {}, W = PEOPLE[a.w] || {}, o = a.opts || {}
    const st = ['tk2', 'tpod', 'nav'].filter(k => o[k]).map(k => k === 'tk2' ? '2TK' : k.toUpperCase()).concat(o.bombs ? [o.bombs] : []).join(' ')
    const at = f.atime != null ? f.atime : (a.area ? `${f.to.replace(':', '')}-${f.ld.replace(':', '')}` : '')
    rows.push([d.dow, d.dt, w.label, f.cs, f.msn, minus(f.to, 140), f.to, f.ld, F.cs || '', F.q || '', W.cs || '', W.q || '', a.area || '', at, a.rmks || '', st])
  }))))
  return rows
}
