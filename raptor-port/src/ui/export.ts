/* CSV export — exportCSV and the schedule flattening (schedRows), verbatim. */
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { minus } from '../engine/time'
import { STORE_CFG } from './html'

/* Excel does not sniff a .csv for UTF-8: with no byte-order mark it decodes the
   file in the machine's ANSI codepage, so every byte of a multi-byte character
   is shown as its own Latin-1 glyph. The en dash the LoX prints in the AAR
   cells a WSO cannot hold reached the spreadsheet as "â€“" — the three UTF-8
   bytes of "–" read one at a time (owner, 5 Aug 26: DAAR and NAAR down the WSO
   rows). A BOM is the only signal that survives the download; a charset in the
   MIME type is a transport header and never reaches the file on disk, so both
   are set and the BOM is the one doing the work.
   Split out from exportCSV because the text is testable and the download is
   not — jsdom has no Blob URL machinery. */
export function csvText(rows: any[][]) {
  return '\uFEFF' + rows.map(r => r.map(c => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
}
export function exportCSV(name: string, rows: any[][]) {
  const blob = new Blob([csvText(rows)], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click()
}

export function schedRows() {
  const rows = [['Day', 'Date', 'Wave', 'CS', 'Mission', 'Brief', 'TO', 'Land', 'FCP', 'FCP lvl', 'RCP', 'RCP lvl', 'Area', 'Area time', 'Rmks', 'Stores']]
  DAYS.forEach((d: any) => (d.waves || []).forEach((w: any) => w.formations.forEach((f: any) => f.aircraft.forEach((a: any) => {
    const F = PEOPLE[a.p] || {}, W = PEOPLE[a.w] || {}, o = a.opts || {}
    const st = STORE_CFG.filter(([k]) => o[k]).map(([, lab]) => lab).concat(o.bombs ? [o.bombs] : []).join(' ')
    const at = f.atime != null ? f.atime : (a.area ? `${f.to.replace(':', '')}-${f.ld.replace(':', '')}` : '')
    rows.push([d.dow, d.dt, w.label, f.cs, f.msn, minus(f.to, 140), f.to, f.ld, F.cs || '', F.q || '', W.cs || '', W.q || '', a.area || '', at, a.rmks || '', st])
  }))))
  return rows
}
